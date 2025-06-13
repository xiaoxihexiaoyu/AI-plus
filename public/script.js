// --- Global State and Config ---
let CONFIG = {};
let chartInstance = null;

// --- API and Content Configuration ---

/**
 * Fetches the configuration file.
 * @returns {Promise<object>} The configuration object.
 */
async function fetchConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch config.json:", error);
        // Fallback or error display logic can be added here
        document.body.innerHTML = '<div style="color: red; text-align: center; padding: 2rem;">无法加载网站配置。请检查 config.json 文件是否存在且格式正确。</div>';
        return null;
    }
}

/**
 * Populates the DOM with content from the config file.
 * It looks for elements with `data-config-key` and `data-config-key-placeholder` attributes.
 */
function populateContent() {
    if (!CONFIG) return;

    // Helper to get nested property from object by string path
    const getNestedProp = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

    // Populate text content
    document.querySelectorAll('[data-config-key]').forEach(el => {
        const key = el.getAttribute('data-config-key');
        const content = getNestedProp(CONFIG, key);
        if (content) {
            if (el.tagName === 'TITLE') {
                el.textContent = content;
            } else {
                 el.innerHTML = content; // Using innerHTML to support simple tags in config
            }
        }
    });

    // Populate placeholder attributes
    document.querySelectorAll('[data-config-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-config-key-placeholder');
        const content = getNestedProp(CONFIG, key);
        if (content) {
            el.setAttribute('placeholder', content);
        }
    });

    // Dynamically build more complex structures
    buildDynamicLists();
}

/**
 * Builds lists and grids that are defined as arrays in the config.
 */
function buildDynamicLists() {
    // Desktop Nav Links
    const navLinksContainer = document.getElementById('nav-links-desktop');
    if (navLinksContainer && CONFIG.header?.navLinks) {
        CONFIG.header.navLinks.forEach(linkText => {
            const link = document.createElement('a');
            link.href = `#${getLinkTarget(linkText)}`;
            link.className = 'hover:text-sky-600 transition-colors';
            link.textContent = linkText;
            // Insert before the contact button
            navLinksContainer.insertBefore(link, navLinksContainer.querySelector('a[href="#contact"]'));
        });
    }

    // Vision Section Lists
    const painPointsList = document.getElementById('pain-points-list');
    if (painPointsList && CONFIG.vision?.painPoints?.points) {
        painPointsList.innerHTML = CONFIG.vision.painPoints.points.map(p =>
            `<li class="flex items-start"><span class="text-2xl mr-4">${p.emoji}</span><div><strong class="font-semibold">${p.strong}</strong> ${p.text}</div></li>`
        ).join('');
    }
    const solutionsList = document.getElementById('solutions-list');
    if (solutionsList && CONFIG.vision?.solutions?.points) {
        solutionsList.innerHTML = CONFIG.vision.solutions.points.map(p =>
            `<li class="flex items-start"><span class="text-2xl mr-4">${p.emoji}</span><div><strong class="font-semibold">${p.strong}</strong> ${p.text}</div></li>`
        ).join('');
    }

    // Credibility Metrics
    const metricsGrid = document.getElementById('metrics-grid');
    if (metricsGrid && CONFIG.credibility?.metrics) {
        metricsGrid.innerHTML = CONFIG.credibility.metrics.map(m => `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <p class="text-5xl font-bold text-sky-600 counter" data-target="${m.target}">0</p>
                <p class="text-slate-500 mt-2">${m.label}</p>
            </div>
        `).join('');
        initCounterObserver(); // Re-initialize observer for new counters
    }

    // Compass Controls
    const compassControls = document.getElementById('compass-controls');
    if (compassControls && CONFIG.compass?.dimensions) {
        compassControls.innerHTML = CONFIG.compass.dimensions.map((dim, index) => `
            <div>
                <h3 class="font-bold text-lg mb-2 flex items-center"><span class="text-sky-500 text-2xl mr-2">${index + 1}</span> ${dim.title}</h3>
                <p class="text-sm text-slate-500 mb-3">${dim.desc}</p>
                <div class="flex flex-wrap gap-3">
                    ${dim.options.map(opt => `
                        <div class="tooltip-container">
                            <button class="compass-btn px-4 py-2 rounded-md text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:border-sky-500 hover:text-sky-600" data-dimension="${dim.id}" data-value="${opt.value}">${opt.value}</button>
                            <span class="tooltip-text">${opt.tooltip}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Module Filters
    const moduleFilters = document.getElementById('module-filters');
    if (moduleFilters && CONFIG.modules?.filters) {
        moduleFilters.innerHTML = CONFIG.modules.filters.map((f, index) => `
            <button class="filter-btn px-4 py-2 rounded-full text-sm font-medium transition-colors border ${index === 0 ? 'active !bg-sky-600 !text-white !border-sky-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-sky-100'}" data-filter="${f.id}">${f.label}</button>
        `).join('');
    }

    // Process Steps
    const processSteps = document.getElementById('process-steps');
    if (processSteps && CONFIG.process?.steps) {
        processSteps.innerHTML = CONFIG.process.steps.map((step, index) => `
            <div class="process-step">
                <div class="text-4xl font-bold text-sky-${200 + index * 100}">0${index + 1}</div>
                <h4 class="font-bold mt-2">${step.title}</h4>
                <p class="text-sm text-slate-500 mt-1">${step.desc}</p>
            </div>
        `).join('');
    }
}

/**
 * A helper to get the anchor link target from nav text.
 * @param {string} text - The navigation link text.
 * @returns {string} The id of the target section.
 */
function getLinkTarget(text) {
    const map = {
        '时代浪潮': 'vision',
        '五维罗盘': 'compass',
        '课程模块': 'modules',
        '合作流程': 'process'
    };
    return map[text] || 'hero';
}

// --- API Logic ---

/**
 * Calls the backend proxy for AI completions.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {boolean} isJsonMode - Whether to request a JSON object response.
 * @returns {Promise<any>} The parsed response from the AI.
 */
async function callBackendProxy(prompt, isJsonMode = false) {
    try {
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, isJsonMode }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
            throw new Error(`Proxy error: ${response.status} - ${errorData.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error calling backend proxy:", error);
        throw error; // Re-throw to be caught by the calling function
    }
}


// --- UI Initializers and Event Handlers ---

/**
 * Initializes the IntersectionObserver for fade-in animations.
 */
function initFadeInObserver() {
    const sections = document.querySelectorAll('.section-fade-in');
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => fadeInObserver.observe(section));
}

/**
 * Initializes the IntersectionObserver for the number counters.
 */
function initCounterObserver() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let current = 0;
                const increment = target / 100;
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.8 });
    counters.forEach(counter => counterObserver.observe(counter));
}

/**
 * Sets up event listeners for the entire application.
 */
function initializeEventListeners() {
    // API Settings Modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiEndpointInput = document.getElementById('api-endpoint-input');
    const apiModelInput = document.getElementById('api-model-input');

    let apiSettings = {
        key: localStorage.getItem('apiKey') || '',
        endpoint: localStorage.getItem('apiEndpoint') || 'https://api.siliconflow.cn/v1/chat/completions',
        model: localStorage.getItem('apiModel') || 'alibaba/qwen-long'
    };

    const loadSettingsIntoForm = () => {
        apiKeyInput.value = apiSettings.key;
        apiEndpointInput.value = apiSettings.endpoint;
        apiModelInput.value = apiSettings.model;
    };
    const openSettingsModal = () => {
        loadSettingsIntoForm();
        settingsModal.classList.add('visible');
    };
    const closeSettingsModal = () => settingsModal.classList.remove('visible');
    const saveSettings = () => {
        apiSettings.key = apiKeyInput.value.trim();
        apiSettings.endpoint = apiEndpointInput.value.trim();
        apiSettings.model = apiModelInput.value.trim();
        localStorage.setItem('apiKey', apiSettings.key);
        localStorage.setItem('apiEndpoint', apiSettings.endpoint);
        localStorage.setItem('apiModel', apiSettings.model);
        closeSettingsModal();
    };

    settingsBtn.addEventListener('click', openSettingsModal);
    settingsCloseBtn.addEventListener('click', closeSettingsModal);
    settingsSaveBtn.addEventListener('click', saveSettings);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });

    // Compass Configurator
    initCompass();

    // Module Cards
    initModules();

    // Contact Form Optimizer
    initContactForm();
}


// --- Feature-Specific Logic ---

function initCompass() {
    const compassControls = document.getElementById('compass-controls');
    const recPlaceholder = document.getElementById('recommendation-placeholder');
    const recLoading = document.getElementById('recommendation-loading');
    const recDetails = document.getElementById('recommendation-details');
    const recError = document.getElementById('recommendation-error');
    const recErrorMsg = document.getElementById('recommendation-error-msg');
    const recFocus = document.getElementById('rec-focus');
    const recContent = document.getElementById('rec-content');
    const recCombo = document.getElementById('rec-combo');

    const selections = { scale: null, audience: null, depth: null, duration: null, format: null };
    const scoreData = {
        scale: { '小微企业': [1, 5, 4], '中型企业': [3, 4, 3], '大型企业': [5, 2, 3] },
        audience: { '决策层/高管': [5, 1, 1], '运营/执行层': [1, 5, 4], '全体员工': [2, 3, 2] },
        depth: { '认知普及': [3, 1, 1], '工具应用': [1, 5, 4], '战略整合': [5, 2, 3] },
    };

    const updateRecommendation = async () => {
        if (!Object.values(selections).every(val => val !== null)) {
            recPlaceholder.classList.remove('hidden');
            recDetails.classList.add('hidden');
            recLoading.classList.add('hidden');
            recError.classList.add('hidden');
            updateChart([2, 2, 2]);
            return;
        }

        recPlaceholder.classList.add('hidden');
        recDetails.classList.add('hidden');
        recError.classList.add('hidden');
        recLoading.classList.remove('hidden');

        try {
            let combinedScores = [0, 0, 0];
            const scaleScores = scoreData.scale[selections.scale];
            const audienceScores = scoreData.audience[selections.audience];
            const depthScores = scoreData.depth[selections.depth];
            for(let i=0; i<3; i++) combinedScores[i] = (scaleScores[i] + audienceScores[i] + depthScores[i]) / 3;
            if (selections.duration === '长期顾问' || selections.depth === '战略整合') combinedScores[0] = Math.min(6, combinedScores[0] + 1);
            if (selections.duration === '两天' || selections.depth === '工具应用') combinedScores[1] = Math.min(6, combinedScores[1] + 1.5);
            if (selections.scale === '小微企业' || selections.depth === '工具应用') combinedScores[2] = Math.min(6, combinedScores[2] + 1);
            updateChart(combinedScores);
        } catch(e) {
            console.error("Error calculating scores: ", e);
            updateChart([2,2,2]);
        }

        const prompt = `你是一位顶级的AI+电商培训方案专家。一位潜在客户提供了以下信息：
        - 企业规模: ${selections.scale}, 培训对象: ${selections.audience}, 期望内容深度: ${selections.depth}, 期望时间长度: ${selections.duration}, 期望培训形式: ${selections.format}
        请基于以上信息，为客户生成一份专业、精炼、且富有洞察力的初步培训方案建议。
        你的回答必须是一个严格的JSON对象，包含三个键："focus", "content", "combination"。所有值都必须是字符串，内容必须使用简体中文。
        "focus" (建议焦点): 一针见血地分析该类型客户的核心痛点和首要目标。
        "content" (内容侧重): 具体阐述培训内容应该侧重于哪些方面。
        "combination" (推荐组合): 给出一个具体的、有吸引力的培训包名称或描述。`;

        try {
            const parsedJson = await callBackendProxy(prompt, true);
            recFocus.innerHTML = parsedJson.focus;
            recContent.innerHTML = parsedJson.content;
            recCombo.innerHTML = parsedJson.combination;
            recLoading.classList.add('hidden');
            recDetails.classList.remove('hidden');
        } catch (error) {
            console.error("Error fetching compass recommendation:", error);
            recErrorMsg.textContent = error.message.includes('API配置不完整') ? error.message : CONFIG.compass.resultCard.error;
            recLoading.classList.add('hidden');
            recError.classList.remove('hidden');
        }
    };

    compassControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('compass-btn')) {
            const { dimension, value } = e.target.dataset;
            selections[dimension] = value;
            document.querySelectorAll(`.compass-btn[data-dimension="${dimension}"]`).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateRecommendation();
        }
    });

    updateRecommendation(); // Initial call
}


function updateChart(data) {
    const chartData = {
        labels: ['战略思维', '工具应用', '效率提升'],
        datasets: [{
            label: '方案侧重点', data: data, backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderColor: 'rgba(2, 132, 199, 1)', borderWidth: 2, pointBackgroundColor: 'rgba(2, 132, 199, 1)',
        }]
    };
    if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.update();
    } else {
        const ctx = document.getElementById('recommendationChart').getContext('2d');
        if(!ctx) return;
        chartInstance = new Chart(ctx, {
            type: 'radar', data: chartData,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { r: {
                    angleLines: { color: 'rgba(0, 0, 0, 0.1)' }, grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    pointLabels: { font: { size: 14, family: "'Noto Sans SC', sans-serif" } },
                    suggestedMin: 0, suggestedMax: 6,
                    ticks: { stepSize: 1, backdropColor: 'rgba(255, 255, 255, 0.75)' }
                }},
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }
}


function initModules() {
    const moduleGrid = document.getElementById('module-grid');
    const filterContainer = document.getElementById('module-filters');
    const moduleModal = document.getElementById('module-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalLoading = document.getElementById('modal-loading');
    const modalTextContent = document.getElementById('modal-text-content');
    const modalError = document.getElementById('modal-error');
    const modalErrorMsg = document.getElementById('modal-error-msg');

    const renderModules = (filter = 'all') => {
        if (!CONFIG.modules?.list) return;
        moduleGrid.innerHTML = '';
        const filteredData = filter === 'all' ? CONFIG.modules.list : CONFIG.modules.list.filter(m => m.category === filter);
        filteredData.forEach(m => {
            const card = document.createElement('div');
            card.className = 'module-card';
            card.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
                    <h4 class="font-bold text-lg text-${m.color}-700">${m.title}</h4>
                    <p class="text-sm text-slate-500 mt-2 flex-grow">${m.desc}</p>
                    <div class="text-right mt-4">
                        <button class="ai-deep-dive-btn text-sm text-sky-600 font-semibold hover:text-sky-800 transition-colors" data-title="${m.title}" data-desc="${m.desc}">
                            ${CONFIG.modules.modal.deepDiveBtn}
                        </button>
                    </div>
                </div>`;
            moduleGrid.appendChild(card);
        });
    };

    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const filter = e.target.dataset.filter;
            filterContainer.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderModules(filter);
        }
    });

    moduleGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('ai-deep-dive-btn')) {
            const { title, desc } = e.target.dataset;
            moduleModal.classList.add('visible');
            modalTitle.textContent = title;
            modalTextContent.classList.add('hidden');
            modalError.classList.add('hidden');
            modalLoading.classList.remove('hidden');

            const prompt = `你是一名资深的AI电商培训师。请针对以下课程模块，生成一个简短但具体的“内容亮点”作为展示示例，用来吸引潜在学员。
            - 课程标题: "${title}"
            - 课程描述: "${desc}"
            你的任务是，不要只是重复描述，而是要提供一个具体的、能体现课程价值的例子。例如，如果是关于文案的，可以给一个“优化前/后”的对比；如果是关于战略的，可以提出一个发人深省的思考题。内容要精炼、专业、有吸引力，适合在弹窗中展示。直接输出内容本身即可。`;

            try {
                const result = await callBackendProxy(prompt);
                modalTextContent.textContent = result;
                modalLoading.classList.add('hidden');
                modalTextContent.classList.remove('hidden');
            } catch (error) {
                console.error("Error fetching module deep dive:", error);
                modalErrorMsg.textContent = error.message.includes('API配置不完整') ? error.message : CONFIG.modules.modal.error;
                modalLoading.classList.add('hidden');
                modalError.classList.remove('hidden');
            }
        }
    });

    document.getElementById('modal-close-btn').addEventListener('click', () => moduleModal.classList.remove('visible'));
    moduleModal.addEventListener('click', (e) => { if (e.target === moduleModal) moduleModal.classList.remove('visible'); });

    renderModules(); // Initial render
}

function initContactForm() {
    const optimizeBtn = document.getElementById('optimize-needs-btn');
    const needsTextarea = document.getElementById('contact-needs');
    const optimizeSpinner = document.getElementById('optimize-spinner');
    const optimizeError = document.getElementById('optimize-error');

    optimizeBtn.addEventListener('click', async () => {
        const userInput = needsTextarea.value.trim();
        if (!userInput) {
            optimizeError.textContent = '请先输入您的需求。';
            optimizeError.classList.remove('hidden');
            setTimeout(() => optimizeError.classList.add('hidden'), 3000);
            return;
        }

        optimizeBtn.disabled = true;
        optimizeSpinner.classList.remove('hidden');
        optimizeError.classList.add('hidden');

        const prompt = `你是一位专业的商业咨询顾问。一位潜在客户留下了以下关于他们需求的初步描述。请将这段描述改写成一段更加清晰、专业、简洁的文字，以方便提交给咨询公司。保留核心意思，但用更专业的商业语言来组织。
        客户原始描述: "${userInput}"
        直接输出优化后的文本即可，不需要任何额外的问候或解释。`;

        try {
            const optimizedText = await callBackendProxy(prompt);
            needsTextarea.value = optimizedText;
            needsTextarea.style.height = 'auto';
            needsTextarea.style.height = needsTextarea.scrollHeight + 'px';
        } catch (error) {
            console.error('Error optimizing needs:', error);
            optimizeError.textContent = error.message.includes('API配置不完整') ? error.message : "优化失败，请稍后再试。";
            optimizeError.classList.remove('hidden');
        } finally {
            optimizeBtn.disabled = false;
            optimizeSpinner.classList.add('hidden');
        }
    });
}


// --- Main Application Entry Point ---
async function main() {
    CONFIG = await fetchConfig();
    if (!CONFIG) return;

    populateContent();
    initializeEventListeners();
    initFadeInObserver();
}

// Run the application
document.addEventListener('DOMContentLoaded', main);
