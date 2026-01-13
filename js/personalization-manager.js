// 个性化管理器 - 为LibreTV提供全面的用户个性化功能
class PersonalizationManager {
    constructor() {
        this.userPreferences = this.getStoredUserPreferences();
        this.favorites = this.getStoredFavorites();
        this.watchHistory = this.getStoredWatchHistory();
        this.bookmarks = this.getStoredBookmarks();
        this.userTags = this.getStoredUserTags();
        this.personalizationSettings = this.getStoredPersonalizationSettings();
        this.quickAccess = this.getStoredQuickAccess();
        this.userStatistics = this.getStoredUserStatistics();
        
        this.init();
    }

    init() {
        console.log('[Personalization] 初始化个性化管理器');
        this.setupUserProfile();
        this.createPersonalizationInterface();
        this.setupEventListeners();
        this.syncUserData();
    }

    // 获取存储的用户偏好设置
    getStoredUserPreferences() {
        try {
            return JSON.parse(localStorage.getItem('libretv-user-preferences') || '{}');
        } catch {
            return {
                theme: 'cyberpunk',
                language: 'zh-CN',
                autoplay: true,
                defaultQuality: 'auto',
                subtitleEnabled: true,
                subtitleLanguage: 'zh-CN',
                playbackSpeed: 1.0,
                volume: 1.0,
                notifications: true,
                dataUsage: 'unlimited',
                networkQuality: 'auto',
                skipIntro: false,
                skipEnding: false,
                playNextEpisode: true,
                loopPlaylist: false,
                showRecommendations: true,
                showTrending: true,
                privacy: {
                    shareAnalytics: false,
                    saveHistory: true,
                    rememberPreferences: true
                }
            };
        }
    }

    // 获取存储的收藏列表
    getStoredFavorites() {
        try {
            return JSON.parse(localStorage.getItem('libretv-favorites') || '[]');
        } catch {
            return [];
        }
    }

    // 获取存储的观看历史
    getStoredWatchHistory() {
        try {
            return JSON.parse(localStorage.getItem('libretv-watch-history') || '[]');
        } catch {
            return [];
        }
    }

    // 获取存储的书签
    getStoredBookmarks() {
        try {
            return JSON.parse(localStorage.getItem('libretv-bookmarks') || '[]');
        } catch {
            return [];
        }
    }

    // 获取存储的用户标签
    getStoredUserTags() {
        try {
            return JSON.parse(localStorage.getItem('libretv-user-tags') || '{}');
        } catch {
            return {};
        }
    }

    // 获取存储的个性化设置
    getStoredPersonalizationSettings() {
        try {
            return JSON.parse(localStorage.getItem('libretv-personalization-settings') || '{}');
        } catch {
            return {
                enabled: true,
                adaptiveUI: true,
                smartRecommendations: true,
                contextualTips: true,
                usageAnalytics: true
            };
        }
    }

    // 获取存储的快捷访问
    getStoredQuickAccess() {
        try {
            return JSON.parse(localStorage.getItem('libretv-quick-access') || '[]');
        } catch {
            return [];
        }
    }

    // 获取存储的用户统计
    getStoredUserStatistics() {
        try {
            return JSON.parse(localStorage.getItem('libretv-user-statistics') || '{}');
        } catch {
            return {
                totalWatchTime: 0,
                videosWatched: 0,
                favoriteGenres: {},
                watchStreak: 0,
                lastWatchDate: null,
                totalSearches: 0,
                favoritesCount: 0,
                bookmarksCount: 0
            };
        }
    }

    // 设置用户画像
    setupUserProfile() {
        // 分析用户行为模式
        this.analyzeUserBehavior();
        
        // 更新用户统计
        this.updateUserStatistics();
        
        // 设置个性化推荐
        this.setupPersonalizedRecommendations();
    }

    // 设置个性化推荐
    setupPersonalizedRecommendations() {
        console.log('[Personalization] 设置个性化推荐系统');
        
        // 创建推荐容器
        this.createRecommendationsContainer();
        
        // 初始化推荐算法
        this.initRecommendationAlgorithm();
        
        // 设置推荐更新定时器
        this.setupRecommendationUpdates();
    }

    // 创建推荐容器
    createRecommendationsContainer() {
        // 检查是否已存在推荐容器
        if (document.getElementById('personalized-recommendations')) {
            return;
        }
        
        const recommendationsHTML = `
            <div id="personalized-recommendations" class="personalized-recommendations mt-6 hidden">
                <h3 class="text-white font-semibold mb-4">个性化推荐</h3>
                <div id="recommendations-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- 推荐内容将在这里动态生成 -->
                </div>
            </div>
        `;
        
        // 查找合适的位置插入推荐容器
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.parentNode.insertAdjacentHTML('beforeend', recommendationsHTML);
        }
    }

    // 初始化推荐算法
    initRecommendationAlgorithm() {
        this.recommendationData = {
            basedOnFavorites: true,
            basedOnHistory: true,
            basedOnTags: true,
            trendingWeight: 0.3,
            popularityWeight: 0.2,
            relevanceWeight: 0.5
        };
    }

    // 设置推荐更新
    setupRecommendationUpdates() {
        // 每30分钟更新一次推荐
        setInterval(() => {
            this.updateRecommendations();
        }, 30 * 60 * 1000);
    }

    // 更新推荐内容
    updateRecommendations() {
        console.log('[Personalization] 更新个性化推荐');
        
        // 基于用户偏好生成推荐
        const recommendations = this.generateRecommendations();
        this.displayRecommendations(recommendations);
    }

    // 生成推荐内容
    generateRecommendations() {
        const recommendations = [];
        const userPreferences = this.getUserPreferences();
        const favorites = this.getStoredFavorites();
        const history = this.getStoredWatchHistory();
        
        // 基于收藏生成推荐
        if (favorites.length > 0) {
            const favoriteTags = this.extractTagsFromContent(favorites);
            recommendations.push({
                type: '基于收藏',
                items: this.getContentByTags(favoriteTags, 4)
            });
        }
        
        // 基于历史生成推荐
        if (history.length > 0) {
            const recentHistory = history.slice(-10);
            recommendations.push({
                type: '基于观看历史',
                items: this.getContentByHistory(recentHistory, 4)
            });
        }
        
        // 热门推荐
        recommendations.push({
            type: '热门推荐',
            items: this.getTrendingContent(4)
        });
        
        return recommendations;
    }

    // 提取内容标签
    extractTagsFromContent(contentList) {
        const tags = [];
        contentList.forEach(item => {
            if (item.tags) {
                tags.push(...item.tags);
            }
        });
        return [...new Set(tags)];
    }

    // 基于标签获取内容
    getContentByTags(tags, limit) {
        // 模拟获取内容（实际项目中应该调用API）
        return [];
    }

    // 基于历史获取内容
    getContentByHistory(history, limit) {
        // 模拟获取内容（实际项目中应该调用API）
        return [];
    }

    // 获取热门内容
    getTrendingContent(limit) {
        // 模拟获取内容（实际项目中应该调用API）
        return [];
    }

    // 显示推荐内容
    displayRecommendations(recommendations) {
        const container = document.getElementById('personalized-recommendations');
        const grid = document.getElementById('recommendations-grid');
        
        if (!container || !grid) return;
        
        grid.innerHTML = '';
        
        recommendations.forEach(category => {
            category.items.forEach(item => {
                const itemElement = this.createRecommendationItem(item, category.type);
                grid.appendChild(itemElement);
            });
        });
        
        container.classList.remove('hidden');
    }

    // 创建推荐项目
    createRecommendationItem(item, category) {
        const div = document.createElement('div');
        div.className = 'recommendation-item bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer';
        div.innerHTML = `
            <img src="${item.thumbnail || '/image/nomedia.png'}" alt="${item.title}" class="w-full h-32 object-cover rounded mb-2">
            <h4 class="text-white font-medium text-sm mb-1">${item.title}</h4>
            <p class="text-gray-400 text-xs">${category}</p>
        `;
        
        div.addEventListener('click', () => {
            this.handleRecommendationClick(item);
        });
        
        return div;
    }

    // 处理推荐点击
    handleRecommendationClick(item) {
        console.log('[Personalization] 用户点击推荐:', item.title);
        
        // 记录点击事件
        this.recordRecommendationClick(item);
        
        // 跳转到播放页面
        if (item.url) {
            window.location.href = item.url;
        }
    }

    // 记录推荐点击
    recordRecommendationClick(item) {
        // 更新用户统计
        const stats = this.getStoredUserStatistics();
        stats.recommendationClicks = (stats.recommendationClicks || 0) + 1;
        this.saveUserStatistics(stats);
    }

    // 分析用户行为
    analyzeUserBehavior() {
        console.log('[Personalization] 分析用户行为');
        
        // 分析观看偏好
        this.analyzeViewingPreferences();
        
        // 分析时间模式
        this.analyzeTimePatterns();
        
        // 分析设备使用习惯
        this.analyzeDeviceUsage();
    }

    // 分析观看偏好
    analyzeViewingPreferences() {
        const genreStats = {};
        const sourceStats = {};
        
        this.watchHistory.forEach(item => {
            // 统计类型偏好
            const genres = this.extractGenres(item.title);
            genres.forEach(genre => {
                genreStats[genre] = (genreStats[genre] || 0) + 1;
            });
            
            // 统计来源偏好
            if (item.source) {
                sourceStats[item.source] = (sourceStats[item.source] || 0) + 1;
            }
        });
        
        this.userStatistics.favoriteGenres = genreStats;
        this.userStatistics.favoriteSources = sourceStats;
    }

    // 分析时间模式
    analyzeTimePatterns() {
        const timeStats = {
            morning: 0, afternoon: 0, evening: 0, night: 0
        };
        
        this.watchHistory.forEach(item => {
            const hour = new Date(item.timestamp).getHours();
            if (hour >= 6 && hour < 12) {
                timeStats.morning++;
            } else if (hour >= 12 && hour < 18) {
                timeStats.afternoon++;
            } else if (hour >= 18 && hour < 24) {
                timeStats.evening++;
            } else {
                timeStats.night++;
            }
        });
        
        this.userStatistics.timePatterns = timeStats;
    }

    // 分析设备使用
    analyzeDeviceUsage() {
        const deviceType = this.detectDeviceType();
        this.userStatistics.preferredDevice = deviceType;
        
        if (!this.userStatistics.deviceStats) {
            this.userStatistics.deviceStats = {};
        }
        this.userStatistics.deviceStats[deviceType] = 
            (this.userStatistics.deviceStats[deviceType] || 0) + 1;
    }

    // 提取类型
    extractGenres(title) {
        const genres = [];
        const titleLower = title.toLowerCase();
        
        // 简单的类型检测
        if (titleLower.includes('电影') || titleLower.includes('片')) {
            genres.push('电影');
        }
        if (titleLower.includes('电视剧') || titleLower.includes('剧')) {
            genres.push('电视剧');
        }
        if (titleLower.includes('动画') || titleLower.includes('动漫')) {
            genres.push('动画');
        }
        if (titleLower.includes('综艺')) {
            genres.push('综艺');
        }
        if (titleLower.includes('纪录片')) {
            genres.push('纪录片');
        }
        
        return genres.length > 0 ? genres : ['其他'];
    }

    // 检测设备类型
    detectDeviceType() {
        const userAgent = navigator.userAgent;
        if (/iPad|Android.*tablet|tablet/i.test(userAgent)) {
            return 'tablet';
        } else if (/iPhone|Android.*mobile|mobile/i.test(userAgent)) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }

    // 更新用户统计
    updateUserStatistics() {
        this.userStatistics.videosWatched = this.watchHistory.length;
        this.userStatistics.favoritesCount = this.favorites.length;
        this.userStatistics.bookmarksCount = this.bookmarks.length;
        this.userStatistics.totalWatchTime = this.watchHistory.reduce((total, item) => 
            total + (item.duration || 0), 0
        );
        
        this.saveUserStatistics();
    }

    // 创建个性化界面
    createPersonalizationInterface() {
        console.log('[Personalization] 创建个性化界面');
        this.createFavoritesInterface();
        this.createHistoryInterface();
        this.createBookmarksInterface();
        this.createQuickAccessInterface();
    }

    // 创建收藏夹界面
    createFavoritesInterface() {
        if (document.getElementById('favorites-container')) return;
        
        const container = document.createElement('div');
        container.id = 'favorites-container';
        container.className = 'personalization-container hidden';
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-4">我的收藏</h3>
                <div id="favorites-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- 收藏内容将在这里动态生成 -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // 创建历史界面
    createHistoryInterface() {
        if (document.getElementById('history-container')) return;
        
        const container = document.createElement('div');
        container.id = 'history-container';
        container.className = 'personalization-container hidden';
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-4">观看历史</h3>
                <div id="history-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- 历史内容将在这里动态生成 -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // 创建书签界面
    createBookmarksInterface() {
        if (document.getElementById('bookmarks-container')) return;
        
        const container = document.createElement('div');
        container.id = 'bookmarks-container';
        container.className = 'personalization-container hidden';
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-4">我的书签</h3>
                <div id="bookmarks-list" class="space-y-2">
                    <!-- 书签内容将在这里动态生成 -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // 创建快捷访问界面
    createQuickAccessInterface() {
        if (document.getElementById('quickaccess-container')) return;
        
        const container = document.createElement('div');
        container.id = 'quickaccess-container';
        container.className = 'personalization-container hidden';
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-4">快捷访问</h3>
                <div id="quickaccess-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- 快捷访问项目将在这里动态生成 -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // 创建个性化面板
    createPersonalizationPanel() {
        const panel = document.createElement('div');
        panel.id = 'personalization-panel';
        panel.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        
        panel.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <!-- 面板头部 -->
                    <div class="p-6 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-2">个性化设置</h2>
                                <p class="text-gray-400">管理你的观看偏好和个性化内容</p>
                            </div>
                            <button id="closePersonalizationPanel" class="text-gray-400 hover:text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- 标签导航 -->
                        <div class="flex space-x-4 mt-4 overflow-x-auto">
                            <button id="tab-preferences" class="personalization-tab-btn active px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white whitespace-nowrap">
                                偏好设置
                            </button>
                            <button id="tab-favorites" class="personalization-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white whitespace-nowrap">
                                收藏夹 (${this.favorites.length})
                            </button>
                            <button id="tab-history" class="personalization-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white whitespace-nowrap">
                                观看历史 (${this.watchHistory.length})
                            </button>
                            <button id="tab-bookmarks" class="personalization-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white whitespace-nowrap">
                                书签 (${this.bookmarks.length})
                            </button>
                            <button id="tab-statistics" class="personalization-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white whitespace-nowrap">
                                观看统计
                            </button>
                            <button id="tab-quickaccess" class="personalization-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white whitespace-nowrap">
                                快捷访问
                            </button>
                        </div>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <!-- 偏好设置标签页 -->
                        <div id="tab-content-preferences" class="personalization-tab-content">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- 播放偏好 -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-semibold mb-4">播放偏好</h3>
                                    <div class="space-y-4">
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">自动播放</label>
                                            <input type="checkbox" id="pref-autoplay" ${this.userPreferences.autoplay ? 'checked' : ''} 
                                                   class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">默认画质</label>
                                            <select id="pref-quality" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="auto" ${this.userPreferences.defaultQuality === 'auto' ? 'selected' : ''}>自动</option>
                                                <option value="480p" ${this.userPreferences.defaultQuality === '480p' ? 'selected' : ''}>480p</option>
                                                <option value="720p" ${this.userPreferences.defaultQuality === '720p' ? 'selected' : ''}>720p</option>
                                                <option value="1080p" ${this.userPreferences.defaultQuality === '1080p' ? 'selected' : ''}>1080p</option>
                                            </select>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">播放速度</label>
                                            <select id="pref-speed" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="0.5">0.5x</option>
                                                <option value="0.75">0.75x</option>
                                                <option value="1" ${this.userPreferences.playbackSpeed === 1 ? 'selected' : ''}>正常</option>
                                                <option value="1.25">1.25x</option>
                                                <option value="1.5">1.5x</option>
                                                <option value="2">2x</option>
                                            </select>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">音量</label>
                                            <input type="range" id="pref-volume" min="0" max="1" step="0.1" 
                                                   value="${this.userPreferences.volume}" class="w-24">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 字幕偏好 -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-semibold mb-4">字幕偏好</h3>
                                    <div class="space-y-4">
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">显示字幕</label>
                                            <input type="checkbox" id="pref-subtitles" ${this.userPreferences.subtitleEnabled ? 'checked' : ''} 
                                                   class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">字幕语言</label>
                                            <select id="pref-subtitle-lang" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="zh-CN" ${this.userPreferences.subtitleLanguage === 'zh-CN' ? 'selected' : ''}>中文</option>
                                                <option value="en" ${this.userPreferences.subtitleLanguage === 'en' ? 'selected' : ''}>English</option>
                                                <option value="ja" ${this.userPreferences.subtitleLanguage === 'ja' ? 'selected' : ''}>日本語</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 界面偏好 -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-semibold mb-4">界面偏好</h3>
                                    <div class="space-y-4">
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">主题</label>
                                            <select id="pref-theme" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="cyberpunk" ${this.userPreferences.theme === 'cyberpunk' ? 'selected' : ''}>赛博朋克</option>
                                                <option value="dark" ${this.userPreferences.theme === 'dark' ? 'selected' : ''}>深邃黑</option>
                                                <option value="light" ${this.userPreferences.theme === 'light' ? 'selected' : ''}>清新白</option>
                                                <option value="neon" ${this.userPreferences.theme === 'neon' ? 'selected' : ''}>霓虹灯</option>
                                                <option value="ocean" ${this.userPreferences.theme === 'ocean' ? 'selected' : ''}>海洋蓝</option>
                                            </select>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">语言</label>
                                            <select id="pref-language" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="zh-CN" ${this.userPreferences.language === 'zh-CN' ? 'selected' : ''}>中文</option>
                                                <option value="en" ${this.userPreferences.language === 'en' ? 'selected' : ''}>English</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 高级偏好 -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-semibold mb-4">高级偏好</h3>
                                    <div class="space-y-4">
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">自动播放下一集</label>
                                            <input type="checkbox" id="pref-next-episode" ${this.userPreferences.playNextEpisode ? 'checked' : ''} 
                                                   class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">跳过片头片尾</label>
                                            <input type="checkbox" id="pref-skip-intro" ${this.userPreferences.skipIntro ? 'checked' : ''} 
                                                   class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-gray-300">数据使用</label>
                                            <select id="pref-data-usage" class="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                                                <option value="unlimited" ${this.userPreferences.dataUsage === 'unlimited' ? 'selected' : ''}>无限</option>
                                                <option value="wifi-only" ${this.userPreferences.dataUsage === 'wifi-only' ? 'selected' : ''}>仅WiFi</option>
                                                <option value="data-saver" ${this.userPreferences.dataUsage === 'data-saver' ? 'selected' : ''}>省流量</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 保存按钮 -->
                            <div class="mt-6 flex justify-end">
                                <button id="save-preferences" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                                    保存设置
                                </button>
                            </div>
                        </div>
                        
                        <!-- 收藏夹标签页 -->
                        <div id="tab-content-favorites" class="personalization-tab-content hidden">
                            <div class="mb-4 flex justify-between items-center">
                                <h3 class="text-white font-semibold">我的收藏 (${this.favorites.length})</h3>
                                <div class="flex gap-2">
                                    <button id="clear-favorites" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                        清空收藏
                                    </button>
                                    <button id="export-favorites" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                        导出收藏
                                    </button>
                                </div>
                            </div>
                            <div id="favorites-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- 收藏列表将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 观看历史标签页 -->
                        <div id="tab-content-history" class="personalization-tab-content hidden">
                            <div class="mb-4 flex justify-between items-center">
                                <h3 class="text-white font-semibold">观看历史 (${this.watchHistory.length})</h3>
                                <div class="flex gap-2">
                                    <button id="clear-history" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                        清空历史
                                    </button>
                                    <button id="export-history" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                        导出历史
                                    </button>
                                </div>
                            </div>
                            <div id="history-list" class="space-y-2">
                                <!-- 历史记录将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 书签标签页 -->
                        <div id="tab-content-bookmarks" class="personalization-tab-content hidden">
                            <div class="mb-4 flex justify-between items-center">
                                <h3 class="text-white font-semibold">我的书签 (${this.bookmarks.length})</h3>
                                <div class="flex gap-2">
                                    <button id="clear-bookmarks" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                        清空书签
                                    </button>
                                    <button id="export-bookmarks" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                        导出书签
                                    </button>
                                </div>
                            </div>
                            <div id="bookmarks-list" class="space-y-2">
                                <!-- 书签列表将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 观看统计标签页 -->
                        <div id="tab-content-statistics" class="personalization-tab-content hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <!-- 统计卡片将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 快捷访问标签页 -->
                        <div id="tab-content-quickaccess" class="personalization-tab-content hidden">
                            <div class="mb-4 flex justify-between items-center">
                                <h3 class="text-white font-semibold">快捷访问 (${this.quickAccess.length})</h3>
                                <button id="add-quickaccess" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                    添加快捷访问
                                </button>
                            </div>
                            <div id="quickaccess-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <!-- 快捷访问项目将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPersonalizationPanelEvents();
    }

    // 设置个性化面板事件
    setupPersonalizationPanelEvents() {
        // 关闭面板
        document.getElementById('closePersonalizationPanel').addEventListener('click', () => {
            this.closePersonalizationPanel();
        });
        
        // 标签切换
        document.querySelectorAll('.personalization-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPersonalizationTab(e.target.id.replace('tab-', ''));
            });
        });
        
        // 保存偏好设置
        document.getElementById('save-preferences').addEventListener('click', () => {
            this.saveUserPreferences();
        });
        
        // 清空收藏
        document.getElementById('clear-favorites').addEventListener('click', () => {
            this.clearFavorites();
        });
        
        // 清空历史
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearWatchHistory();
        });
        
        // 清空书签
        document.getElementById('clear-bookmarks').addEventListener('click', () => {
            this.clearBookmarks();
        });
        
        // 点击外部关闭
        document.getElementById('personalization-panel').addEventListener('click', (e) => {
            if (e.target.id === 'personalization-panel') {
                this.closePersonalizationPanel();
            }
        });
    }

    // 切换个性化标签
    switchPersonalizationTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.personalization-tab-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('text-gray-400');
        });
        
        document.querySelector(`#tab-${tabName}`).classList.add('active', 'bg-blue-600', 'text-white');
        document.querySelector(`#tab-${tabName}`).classList.remove('text-gray-400');
        
        // 切换内容
        document.querySelectorAll('.personalization-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.querySelector(`#tab-content-${tabName}`).classList.remove('hidden');
        
        // 加载对应内容
        switch (tabName) {
            case 'preferences':
                this.loadPreferencesTab();
                break;
            case 'favorites':
                this.loadFavoritesTab();
                break;
            case 'history':
                this.loadHistoryTab();
                break;
            case 'bookmarks':
                this.loadBookmarksTab();
                break;
            case 'statistics':
                this.loadStatisticsTab();
                break;
            case 'quickaccess':
                this.loadQuickAccessTab();
                break;
        }
    }

    // 加载偏好设置标签页
    loadPreferencesTab() {
        // 偏好设置已在HTML中预填充
    }

    // 加载收藏夹标签页
    loadFavoritesTab() {
        const container = document.getElementById('favorites-list');
        if (!container) return;
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <p class="text-gray-400">还没有收藏任何内容</p>
                    <p class="text-gray-500 text-sm">点击视频的收藏按钮来添加收藏</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.favorites.map(item => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="text-white font-medium flex-1">${item.title}</h4>
                    <button onclick="window.personalization.removeFavorite('${item.id}')" 
                            class="text-red-400 hover:text-red-300 ml-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-400">
                    <span>${item.type || '视频'}</span>
                    <span>${this.formatDate(item.addedDate)}</span>
                </div>
                ${item.description ? `<p class="text-gray-300 text-sm mt-2">${item.description}</p>` : ''}
            </div>
        `).join('');
    }

    // 加载观看历史标签页
    loadHistoryTab() {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        if (this.watchHistory.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-gray-400">还没有观看历史</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.watchHistory.slice(0, 20).map(item => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="text-white font-medium">${item.title}</h4>
                        <div class="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>${this.formatDate(item.timestamp)}</span>
                            <span>${item.duration ? this.formatDuration(item.duration) : ''}</span>
                            ${item.progress ? `<span>${Math.round(item.progress * 100)}%</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.personalization.addToFavorites('${item.id}')" 
                                class="text-blue-400 hover:text-blue-300" title="添加到收藏">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                        <button onclick="window.personalization.removeFromHistory('${item.id}')" 
                                class="text-red-400 hover:text-red-300" title="删除">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 加载书签标签页
    loadBookmarksTab() {
        const container = document.getElementById('bookmarks-list');
        if (!container) return;
        
        if (this.bookmarks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                    <p class="text-gray-400">还没有书签</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.bookmarks.map(item => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="text-white font-medium">${item.title}</h4>
                        <p class="text-gray-400 text-sm mt-1">${item.description || ''}</p>
                        <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span>${this.formatDate(item.createdDate)}</span>
                            <span>${item.timeStamp ? this.formatTime(item.timeStamp) : ''}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.personalization.jumpToBookmark('${item.id}')" 
                                class="text-blue-400 hover:text-blue-300" title="跳转到书签">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                        <button onclick="window.personalization.removeBookmark('${item.id}')" 
                                class="text-red-400 hover:text-red-300" title="删除书签">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 加载观看统计标签页
    loadStatisticsTab() {
        const container = document.querySelector('#tab-content-statistics .grid');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-blue-400 mb-2">${this.watchHistory.length}</div>
                <div class="text-gray-400">观看视频数</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-green-400 mb-2">${Math.round(this.userStatistics.totalWatchTime / 3600)}h</div>
                <div class="text-gray-400">总观看时长</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-purple-400 mb-2">${this.favorites.length}</div>
                <div class="text-gray-400">收藏数量</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-orange-400 mb-2">${Object.keys(this.userStatistics.favoriteGenres || {}).length}</div>
                <div class="text-gray-400">偏好类型</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-red-400 mb-2">${this.userStatistics.watchStreak || 0}</div>
                <div class="text-gray-400">连续观看天数</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-cyan-400 mb-2">${this.userStatistics.favoriteSources ? Object.keys(this.userStatistics.favoriteSources).length : 0}</div>
                <div class="text-gray-400">常用来源</div>
            </div>
        `;
    }

    // 加载快捷访问标签页
    loadQuickAccessTab() {
        const container = document.getElementById('quickaccess-list');
        if (!container) return;
        
        if (this.quickAccess.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <p class="text-gray-400">还没有快捷访问</p>
                    <p class="text-gray-500 text-sm">点击"添加快捷访问"来创建</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.quickAccess.map(item => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                 onclick="window.personalization.openQuickAccess('${item.id}')">
                <div class="text-center">
                    <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h4 class="text-white font-medium mb-1">${item.name}</h4>
                    <p class="text-gray-400 text-sm">${item.description || ''}</p>
                </div>
                <div class="flex justify-center mt-3">
                    <button onclick="event.stopPropagation(); window.personalization.removeQuickAccess('${item.id}')" 
                            class="text-red-400 hover:text-red-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听视频播放事件
        document.addEventListener('videoPlay', (event) => {
            this.addToWatchHistory(event.detail);
        });
        
        // 监听收藏事件
        document.addEventListener('addToFavorites', (event) => {
            this.addToFavorites(event.detail);
        });
        
        // 监听书签事件
        document.addEventListener('addBookmark', (event) => {
            this.addBookmark(event.detail);
        });
    }

    // 同步用户数据
    syncUserData() {
        // 定期保存用户数据到云端（如果支持）
        setInterval(() => {
            this.saveAllData();
        }, 300000); // 每5分钟保存一次
    }

    // 添加到观看历史
    addToWatchHistory(videoInfo) {
        const historyItem = {
            id: videoInfo.id || Date.now().toString(),
            title: videoInfo.title,
            type: videoInfo.type,
            timestamp: Date.now(),
            duration: videoInfo.duration,
            progress: videoInfo.progress || 0,
            source: videoInfo.source,
            url: videoInfo.url
        };
        
        // 检查是否已存在
        const existingIndex = this.watchHistory.findIndex(item => item.id === historyItem.id);
        if (existingIndex >= 0) {
            this.watchHistory[existingIndex] = { ...this.watchHistory[existingIndex], ...historyItem };
        } else {
            this.watchHistory.unshift(historyItem);
        }
        
        // 限制历史记录数量
        if (this.watchHistory.length > 500) {
            this.watchHistory = this.watchHistory.slice(0, 500);
        }
        
        this.saveWatchHistory();
        this.updateUserStatistics();
    }

    // 添加到收藏
    addToFavorites(videoInfo) {
        const favoriteItem = {
            id: videoInfo.id || Date.now().toString(),
            title: videoInfo.title,
            type: videoInfo.type,
            addedDate: Date.now(),
            description: videoInfo.description,
            poster: videoInfo.poster,
            source: videoInfo.source,
            url: videoInfo.url
        };
        
        // 检查是否已存在
        if (!this.favorites.some(item => item.id === favoriteItem.id)) {
            this.favorites.unshift(favoriteItem);
            this.saveFavorites();
            this.updateUserStatistics();
            
            // 触发UI更新
            this.updateFavoritesCount();
        }
    }

    // 移除收藏
    removeFavorite(favoriteId) {
        this.favorites = this.favorites.filter(item => item.id !== favoriteId);
        this.saveFavorites();
        this.updateUserStatistics();
        this.loadFavoritesTab();
        this.updateFavoritesCount();
    }

    // 添加书签
    addBookmark(bookmarkInfo) {
        const bookmarkItem = {
            id: bookmarkInfo.id || Date.now().toString(),
            title: bookmarkInfo.title,
            description: bookmarkInfo.description,
            timeStamp: bookmarkInfo.timeStamp,
            createdDate: Date.now(),
            videoId: bookmarkInfo.videoId
        };
        
        this.bookmarks.unshift(bookmarkItem);
        this.saveBookmarks();
        this.updateUserStatistics();
        this.loadBookmarksTab();
    }

    // 移除书签
    removeBookmark(bookmarkId) {
        this.bookmarks = this.bookmarks.filter(item => item.id !== bookmarkId);
        this.saveBookmarks();
        this.updateUserStatistics();
        this.loadBookmarksTab();
    }

    // 跳转到书签
    jumpToBookmark(bookmarkId) {
        const bookmark = this.bookmarks.find(item => item.id === bookmarkId);
        if (bookmark && window.advancedPlayer) {
            window.advancedPlayer.player.seek(bookmark.timeStamp);
        }
    }

    // 从历史记录中移除
    removeFromHistory(historyId) {
        this.watchHistory = this.watchHistory.filter(item => item.id !== historyId);
        this.saveWatchHistory();
        this.loadHistoryTab();
    }

    // 添加快捷访问
    addQuickAccess(accessInfo) {
        const quickAccessItem = {
            id: accessInfo.id || Date.now().toString(),
            name: accessInfo.name,
            description: accessInfo.description,
            url: accessInfo.url,
            icon: accessInfo.icon,
            createdDate: Date.now()
        };
        
        this.quickAccess.unshift(quickAccessItem);
        this.saveQuickAccess();
        this.loadQuickAccessTab();
    }

    // 移除快捷访问
    removeQuickAccess(accessId) {
        this.quickAccess = this.quickAccess.filter(item => item.id !== accessId);
        this.saveQuickAccess();
        this.loadQuickAccessTab();
    }

    // 打开快捷访问
    openQuickAccess(accessId) {
        const access = this.quickAccess.find(item => item.id === accessId);
        if (access) {
            window.open(access.url, '_blank');
        }
    }

    // 保存用户偏好设置
    saveUserPreferences() {
        const preferences = {
            autoplay: document.getElementById('pref-autoplay').checked,
            defaultQuality: document.getElementById('pref-quality').value,
            playbackSpeed: parseFloat(document.getElementById('pref-speed').value),
            volume: parseFloat(document.getElementById('pref-volume').value),
            subtitleEnabled: document.getElementById('pref-subtitles').checked,
            subtitleLanguage: document.getElementById('pref-subtitle-lang').value,
            theme: document.getElementById('pref-theme').value,
            language: document.getElementById('pref-language').value,
            playNextEpisode: document.getElementById('pref-next-episode').checked,
            skipIntro: document.getElementById('pref-skip-intro').checked,
            dataUsage: document.getElementById('pref-data-usage').value
        };
        
        this.userPreferences = { ...this.userPreferences, ...preferences };
        localStorage.setItem('libretv-user-preferences', JSON.stringify(this.userPreferences));
        
        // 应用主题更改
        if (window.themeManager) {
            window.themeManager.applyTheme(preferences.theme);
        }
        
        this.showNotification('偏好设置已保存', 'success');
    }

    // 清空收藏
    clearFavorites() {
        if (confirm('确定要清空所有收藏吗？此操作无法撤销。')) {
            this.favorites = [];
            this.saveFavorites();
            this.updateUserStatistics();
            this.loadFavoritesTab();
            this.updateFavoritesCount();
        }
    }

    // 清空观看历史
    clearWatchHistory() {
        if (confirm('确定要清空观看历史吗？此操作无法撤销。')) {
            this.watchHistory = [];
            this.saveWatchHistory();
            this.updateUserStatistics();
            this.loadHistoryTab();
        }
    }

    // 清空书签
    clearBookmarks() {
        if (confirm('确定要清空所有书签吗？此操作无法撤销。')) {
            this.bookmarks = [];
            this.saveBookmarks();
            this.updateUserStatistics();
            this.loadBookmarksTab();
        }
    }

    // 保存所有数据
    saveAllData() {
        this.saveUserPreferences();
        this.saveFavorites();
        this.saveWatchHistory();
        this.saveBookmarks();
        this.saveQuickAccess();
        this.saveUserStatistics();
    }

    // 保存收藏
    saveFavorites() {
        localStorage.setItem('libretv-favorites', JSON.stringify(this.favorites));
    }

    // 保存观看历史
    saveWatchHistory() {
        localStorage.setItem('libretv-watch-history', JSON.stringify(this.watchHistory));
    }

    // 保存书签
    saveBookmarks() {
        localStorage.setItem('libretv-bookmarks', JSON.stringify(this.bookmarks));
    }

    // 保存快捷访问
    saveQuickAccess() {
        localStorage.setItem('libretv-quick-access', JSON.stringify(this.quickAccess));
    }

    // 保存用户统计
    saveUserStatistics() {
        localStorage.setItem('libretv-user-statistics', JSON.stringify(this.userStatistics));
    }

    // 更新收藏数量显示
    updateFavoritesCount() {
        const favoritesTab = document.getElementById('tab-favorites');
        if (favoritesTab) {
            favoritesTab.innerHTML = `收藏夹 (${this.favorites.length})`;
        }
    }

    // 关闭个性化面板
    closePersonalizationPanel() {
        const panel = document.getElementById('personalization-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    // 打开个性化面板
    openPersonalizationPanel() {
        const panel = document.getElementById('personalization-panel');
        if (panel) {
            panel.classList.remove('hidden');
        }
    }

    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '昨天';
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // 格式化时间
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 格式化时长
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
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

    // 获取个性化统计
    getPersonalizationStats() {
        return {
            preferences: this.userPreferences,
            favoritesCount: this.favorites.length,
            historyCount: this.watchHistory.length,
            bookmarksCount: this.bookmarks.length,
            quickAccessCount: this.quickAccess.length,
            userStatistics: this.userStatistics
        };
    }

    // 重置个性化数据
    resetPersonalizationData() {
        if (confirm('确定要重置所有个性化数据吗？此操作无法撤销。')) {
            localStorage.removeItem('libretv-user-preferences');
            localStorage.removeItem('libretv-favorites');
            localStorage.removeItem('libretv-watch-history');
            localStorage.removeItem('libretv-bookmarks');
            localStorage.removeItem('libretv-user-tags');
            localStorage.removeItem('libretv-personalization-settings');
            localStorage.removeItem('libretv-quick-access');
            localStorage.removeItem('libretv-user-statistics');
            
            // 重新初始化
            this.userPreferences = this.getStoredUserPreferences();
            this.favorites = this.getStoredFavorites();
            this.watchHistory = this.getStoredWatchHistory();
            this.bookmarks = this.getStoredBookmarks();
            this.quickAccess = this.getStoredQuickAccess();
            this.userStatistics = this.getStoredUserStatistics();
            
            this.showNotification('个性化数据已重置', 'success');
        }
    }

    // 导出个性化数据
    exportPersonalizationData() {
        const data = {
            preferences: this.userPreferences,
            favorites: this.favorites,
            watchHistory: this.watchHistory,
            bookmarks: this.bookmarks,
            quickAccess: this.quickAccess,
            userStatistics: this.userStatistics,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'libretv-personalization-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 创建全局个性化管理器实例
window.PersonalizationManager = PersonalizationManager;
window.personalization = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.personalization = new PersonalizationManager();
    });
} else {
    window.personalization = new PersonalizationManager();
}

// 导出个性化管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalizationManager;
}