// 智能搜索管理器 - 为LibreTV提供增强的搜索和发现功能
class IntelligentSearchManager {
    constructor() {
        this.searchHistory = this.getStoredSearchHistory();
        this.searchSuggestions = this.getStoredSearchSuggestions();
        this.userPreferences = this.getStoredUserPreferences();
        this.trendingSearches = this.getTrendingSearches();
        this.isOnline = navigator.onLine;
        this.searchAnalytics = {
            totalSearches: 0,
            successfulSearches: 0,
            avgResultsPerSearch: 0,
            popularCategories: {},
            popularSources: {}
        };
        this.debounceTimer = null;
        this.abortController = null;
        
        this.init();
    }

    init() {
        console.log('[IntelligentSearch] 初始化智能搜索管理器');
        this.setupSearchInterface();
        this.setupSearchAnalytics();
        this.loadTrendingContent();
        this.setupOfflineSearch();
        this.setupVoiceSearch();
        this.createSearchPanel();
    }

    // 获取存储的搜索历史
    getStoredSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('libretv-search-history') || '[]');
        } catch {
            return [];
        }
    }

    // 获取存储的搜索建议
    getStoredSearchSuggestions() {
        try {
            return JSON.parse(localStorage.getItem('libretv-search-suggestions') || '[]');
        } catch {
            return [];
        }
    }

    // 获取用户偏好设置
    getStoredUserPreferences() {
        try {
            return JSON.parse(localStorage.getItem('libretv-user-preferences') || '{}');
        } catch {
            return {};
        }
    }

    // 获取热门搜索
    getTrendingSearches() {
        const defaultTrending = [
            '热门电影', '最新电视剧', '经典动画', '综艺节目', 
            '科幻片', '爱情片', '动作片', '恐怖片',
            '美剧', '日剧', '韩剧', '国产剧',
            '纪录片', '喜剧', '悬疑片', '战争片'
        ];
        
        try {
            return JSON.parse(localStorage.getItem('libretv-trending-searches') || JSON.stringify(defaultTrending));
        } catch {
            return defaultTrending;
        }
    }

    // 设置搜索界面
    setupSearchInterface() {
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.loadTrendingContent();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // 设置搜索分析
    setupSearchAnalytics() {
        // 从localStorage恢复分析数据
        const stored = localStorage.getItem('libretv-search-analytics');
        if (stored) {
            try {
                this.searchAnalytics = { ...this.searchAnalytics, ...JSON.parse(stored) };
            } catch (error) {
                console.warn('[IntelligentSearch] 恢复分析数据失败:', error);
            }
        }
    }

    // 加载热门内容
    async loadTrendingContent() {
        if (!this.isOnline) {
            this.showOfflineSearchTip();
            return;
        }

        try {
            // 这里可以调用热门内容API
            // 目前使用模拟数据
            const trendingContent = await this.getTrendingContent();
            this.updateTrendingDisplay(trendingContent);
        } catch (error) {
            console.warn('[IntelligentSearch] 加载热门内容失败:', error);
        }
    }

    // 获取热门内容
    async getTrendingContent() {
        // 模拟热门内容数据
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: '1', title: '热门电影推荐', type: 'movie', category: '电影' },
                    { id: '2', title: '最新电视剧集', type: 'tv', category: '电视剧' },
                    { id: '3', title: '经典动画作品', type: 'animation', category: '动画' },
                    { id: '4', title: '热门综艺节目', type: 'variety', category: '综艺' },
                    { id: '5', title: '优质纪录片', type: 'documentary', category: '纪录片' }
                ]);
            }, 500);
        });
    }

    // 更新热门显示
    updateTrendingDisplay(content) {
        const trendingContainer = document.getElementById('trending-content');
        if (trendingContainer) {
            trendingContainer.innerHTML = content.map(item => `
                <div class="trending-item p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors" 
                     onclick="window.intelligentSearch.searchFor('${item.title}')">
                    <div class="text-white font-medium">${item.title}</div>
                    <div class="text-gray-400 text-sm">${item.category}</div>
                </div>
            `).join('');
        }
    }

    // 设置离线搜索
    setupOfflineSearch() {
        // 当离线时显示搜索提示
        if (!this.isOnline) {
            this.showOfflineSearchTip();
        }
    }

    // 显示离线搜索提示
    showOfflineSearchTip() {
        const tip = document.createElement('div');
        tip.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg z-50';
        tip.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span>离线模式 - 只能搜索历史记录</span>
            </div>
        `;
        document.body.appendChild(tip);

        setTimeout(() => {
            tip.remove();
        }, 5000);
    }

    // 设置语音搜索
    setupVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'zh-CN';

            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceSearchResult(transcript);
            };

            this.speechRecognition.onerror = (event) => {
                console.error('[IntelligentSearch] 语音识别错误:', event.error);
                this.showVoiceSearchError(event.error);
            };
        }
    }

    // 处理语音搜索结果
    handleVoiceSearchResult(transcript) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = transcript;
            this.performSearch(transcript);
        }
    }

    // 显示语音搜索错误
    showVoiceSearchError(error) {
        const errorMessages = {
            'no-speech': '未检测到语音，请重试',
            'audio-capture': '无法访问麦克风，请检查权限',
            'not-allowed': '麦克风权限被拒绝',
            'network': '网络错误，语音识别失败'
        };

        const message = errorMessages[error] || '语音识别失败，请重试';
        this.showNotification(message, 'error');
    }

    // 创建搜索面板
    createSearchPanel() {
        const searchPanel = document.createElement('div');
        searchPanel.id = 'intelligent-search-panel';
        searchPanel.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        
        searchPanel.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    <!-- 搜索头部 -->
                    <div class="p-6 border-b border-gray-700">
                        <div class="flex items-center gap-4">
                            <div class="flex-1 relative">
                                <input 
                                    type="text" 
                                    id="intelligentSearchInput" 
                                    placeholder="搜索视频内容..." 
                                    class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                <!-- 语音搜索按钮 -->
                                <button id="voiceSearchBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white" title="语音搜索">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                </button>
                            </div>
                            <button id="closeSearchPanel" class="text-gray-400 hover:text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 搜索内容区域 -->
                    <div class="p-6 overflow-y-auto max-h-96">
                        <!-- 搜索建议 -->
                        <div id="searchSuggestions" class="mb-6">
                            <h3 class="text-white font-medium mb-3">搜索建议</h3>
                            <div id="suggestionsList" class="space-y-2">
                                <!-- 动态生成搜索建议 -->
                            </div>
                        </div>
                        
                        <!-- 热门搜索 -->
                        <div id="trendingSearches" class="mb-6">
                            <h3 class="text-white font-medium mb-3">热门搜索</h3>
                            <div id="trendingList" class="flex flex-wrap gap-2">
                                ${this.trendingSearches.map(term => `
                                    <button onclick="window.intelligentSearch.searchFor('${term}')" 
                                            class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm transition-colors">
                                        ${term}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- 搜索历史 -->
                        <div id="searchHistory">
                            <h3 class="text-white font-medium mb-3">搜索历史</h3>
                            <div id="historyList" class="space-y-2">
                                ${this.searchHistory.slice(0, 10).map(item => `
                                    <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                        <button onclick="window.intelligentSearch.searchFor('${item.query}')" 
                                                class="flex-1 text-left text-white hover:text-blue-400">
                                            ${item.query}
                                        </button>
                                        <button onclick="window.intelligentSearch.removeFromHistory('${item.query}')" 
                                                class="text-gray-400 hover:text-red-400 ml-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchPanel);
        this.setupSearchPanelEvents();
    }

    // 设置搜索面板事件
    setupSearchPanelEvents() {
        const searchInput = document.getElementById('intelligentSearchInput');
        const voiceSearchBtn = document.getElementById('voiceSearchBtn');
        const closeBtn = document.getElementById('closeSearchPanel');

        // 搜索输入
        searchInput?.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });

        // 语音搜索
        voiceSearchBtn?.addEventListener('click', () => {
            this.startVoiceSearch();
        });

        // 关闭面板
        closeBtn?.addEventListener('click', () => {
            this.closeSearchPanel();
        });

        // 点击外部关闭
        document.getElementById('intelligent-search-panel')?.addEventListener('click', (e) => {
            if (e.target.id === 'intelligent-search-panel') {
                this.closeSearchPanel();
            }
        });
    }

    // 处理搜索输入
    handleSearchInput(query) {
        clearTimeout(this.debounceTimer);
        
        if (query.trim().length > 0) {
            this.debounceTimer = setTimeout(() => {
                this.generateSearchSuggestions(query);
            }, 300);
        } else {
            this.clearSearchSuggestions();
        }
    }

    // 生成搜索建议
    generateSearchSuggestions(query) {
        const suggestions = this.buildSearchSuggestions(query);
        this.displaySearchSuggestions(suggestions);
    }

    // 构建搜索建议
    buildSearchSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // 基于历史搜索的建议
        this.searchHistory
            .filter(item => item.query.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .forEach(item => suggestions.push({
                text: item.query,
                type: 'history',
                icon: 'history'
            }));

        // 基于热门搜索的建议
        this.trendingSearches
            .filter(term => term.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .forEach(term => suggestions.push({
                text: term,
                type: 'trending',
                icon: 'trending'
            }));

        // 智能建议（基于常见搜索模式）
        const intelligentSuggestions = this.generateIntelligentSuggestions(query);
        suggestions.push(...intelligentSuggestions);

        return suggestions.slice(0, 6);
    }

    // 生成智能建议
    generateIntelligentSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // 电影类型建议
        if (queryLower.includes('电影')) {
            suggestions.push(
                { text: `${query} 2024`, type: 'intelligent', icon: 'film' },
                { text: `${query} 高清`, type: 'intelligent', icon: 'quality' }
            );
        }

        // 电视剧建议
        if (queryLower.includes('电视剧') || queryLower.includes('剧')) {
            suggestions.push(
                { text: `${query} 第一季`, type: 'intelligent', icon: 'season' },
                { text: `${query} 更新`, type: 'intelligent', icon: 'update' }
            );
        }

        // 动画建议
        if (queryLower.includes('动画') || queryLower.includes('动漫')) {
            suggestions.push(
                { text: `${query} 日语版`, type: 'intelligent', icon: 'language' },
                { text: `${query} 国语版`, type: 'intelligent', icon: 'language' }
            );
        }

        return suggestions.slice(0, 2);
    }

    // 显示搜索建议
    displaySearchSuggestions(suggestions) {
        const container = document.getElementById('suggestionsList');
        if (!container) return;

        if (suggestions.length === 0) {
            container.innerHTML = '<div class="text-gray-400 text-sm">暂无建议</div>';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <button onclick="window.intelligentSearch.searchFor('${suggestion.text}')" 
                    class="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-800 rounded transition-colors">
                ${this.getSuggestionIcon(suggestion.icon)}
                <span class="text-white">${suggestion.text}</span>
                <span class="text-xs text-gray-400 ml-auto">${suggestion.type}</span>
            </button>
        `).join('');
    }

    // 获取建议图标
    getSuggestionIcon(type) {
        const icons = {
            history: '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            trending: '<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>',
            intelligent: '<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
            film: '<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"></path></svg>',
            quality: '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>',
            season: '<svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
            update: '<svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>',
            language: '<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>'
        };

        return icons[type] || icons.intelligent;
    }

    // 清空搜索建议
    clearSearchSuggestions() {
        const container = document.getElementById('suggestionsList');
        if (container) {
            container.innerHTML = '';
        }
    }

    // 开始语音搜索
    startVoiceSearch() {
        if (!this.speechRecognition) {
            this.showNotification('当前浏览器不支持语音搜索', 'error');
            return;
        }

        try {
            this.speechRecognition.start();
            this.showVoiceSearchActive();
        } catch (error) {
            console.error('[IntelligentSearch] 启动语音搜索失败:', error);
            this.showNotification('语音搜索启动失败', 'error');
        }
    }

    // 显示语音搜索活跃状态
    showVoiceSearchActive() {
        const voiceBtn = document.getElementById('voiceSearchBtn');
        if (voiceBtn) {
            voiceBtn.classList.add('text-red-400');
            voiceBtn.innerHTML = `
                <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            `;
        }
    }

    // 执行搜索
    async performSearch(query) {
        if (!query.trim()) return;

        this.closeSearchPanel();
        this.addToSearchHistory(query);
        this.trackSearch(query);

        // 调用原有的搜索功能
        if (typeof searchByAPIAndKeyWord === 'function') {
            await searchByAPIAndKeyWord(query);
        }

        // 更新热门搜索
        this.updateTrendingSearches(query);
    }

    // 搜索指定内容
    searchFor(query) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = query;
        }
        this.performSearch(query);
    }

    // 添加到搜索历史
    addToSearchHistory(query) {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // 添加新项
        this.searchHistory.unshift({
            query,
            timestamp: Date.now(),
            results: 0 // 将在搜索完成后更新
        });
        
        // 限制历史记录数量
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
        this.updateSearchHistoryDisplay();
    }

    // 从历史记录中移除
    removeFromHistory(query) {
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        this.saveSearchHistory();
        this.updateSearchHistoryDisplay();
    }

    // 保存搜索历史
    saveSearchHistory() {
        localStorage.setItem('libretv-search-history', JSON.stringify(this.searchHistory));
    }

    // 更新搜索历史显示
    updateSearchHistoryDisplay() {
        const container = document.getElementById('historyList');
        if (!container) return;

        container.innerHTML = this.searchHistory.slice(0, 10).map(item => `
            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                <button onclick="window.intelligentSearch.searchFor('${item.query}')" 
                        class="flex-1 text-left text-white hover:text-blue-400">
                    ${item.query}
                </button>
                <button onclick="window.intelligentSearch.removeFromHistory('${item.query}')" 
                        class="text-gray-400 hover:text-red-400 ml-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // 追踪搜索
    trackSearch(query) {
        this.searchAnalytics.totalSearches++;
        
        // 更新分析数据
        localStorage.setItem('libretv-search-analytics', JSON.stringify(this.searchAnalytics));
    }

    // 更新热门搜索
    updateTrendingSearches(query) {
        // 检查是否已存在
        if (!this.trendingSearches.includes(query)) {
            this.trendingSearches.unshift(query);
            
            // 限制数量
            if (this.trendingSearches.length > 20) {
                this.trendingSearches = this.trendingSearches.slice(0, 20);
            }
            
            localStorage.setItem('libretv-trending-searches', JSON.stringify(this.trendingSearches));
        }
    }

    // 关闭搜索面板
    closeSearchPanel() {
        const panel = document.getElementById('intelligent-search-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        
        // 重置语音搜索按钮
        const voiceBtn = document.getElementById('voiceSearchBtn');
        if (voiceBtn) {
            voiceBtn.classList.remove('text-red-400');
            voiceBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
            `;
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            type === 'warning' ? 'bg-yellow-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 获取搜索分析数据
    getSearchAnalytics() {
        return {
            ...this.searchAnalytics,
            historyCount: this.searchHistory.length,
            suggestionsCount: this.searchSuggestions.length,
            trendingCount: this.trendingSearches.length
        };
    }

    // 清除所有搜索数据
    clearAllSearchData() {
        this.searchHistory = [];
        this.searchSuggestions = [];
        this.trendingSearches = [];
        this.searchAnalytics = {
            totalSearches: 0,
            successfulSearches: 0,
            avgResultsPerSearch: 0,
            popularCategories: {},
            popularSources: {}
        };
        
        localStorage.removeItem('libretv-search-history');
        localStorage.removeItem('libretv-search-suggestions');
        localStorage.removeItem('libretv-trending-searches');
        localStorage.removeItem('libretv-search-analytics');
        
        this.updateSearchHistoryDisplay();
        this.showNotification('搜索数据已清除', 'success');
    }

    // 导出搜索数据
    exportSearchData() {
        const data = {
            history: this.searchHistory,
            suggestions: this.searchSuggestions,
            trending: this.trendingSearches,
            analytics: this.searchAnalytics,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'libretv-search-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // 打开搜索面板
    openSearchPanel() {
        const panel = document.getElementById('intelligent-search-panel');
        if (panel) {
            panel.classList.remove('hidden');
            
            // 聚焦到搜索输入框
            const searchInput = document.getElementById('intelligentSearchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }
}

// 创建全局智能搜索管理器实例
window.IntelligentSearchManager = IntelligentSearchManager;
window.intelligentSearch = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.intelligentSearch = new IntelligentSearchManager();
    });
} else {
    window.intelligentSearch = new IntelligentSearchManager();
}

// 导出智能搜索管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntelligentSearchManager;
}