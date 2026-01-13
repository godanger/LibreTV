// 内容发现管理器 - 为LibreTV提供智能内容发现和推荐功能
class ContentDiscoveryManager {
    constructor() {
        this.userProfile = this.getStoredUserProfile();
        this.viewingHistory = this.getStoredViewingHistory();
        this.recommendations = [];
        this.similarContent = new Map();
        this.trendingContent = [];
        this.personalizedFeeds = {};
        this.contentCategories = this.initializeContentCategories();
        this.discoveryAnalytics = {
            recommendationsShown: 0,
            recommendationsClicked: 0,
            contentDiscovered: 0,
            favoriteGenres: {},
            viewingTimeByGenre: {}
        };
        
        this.init();
    }

    init() {
        console.log('[ContentDiscovery] 初始化内容发现管理器');
        this.analyzeUserBehavior();
        this.generateRecommendations();
        this.loadTrendingContent();
        this.setupPersonalizedFeeds();
        this.createDiscoveryInterface();
        this.setupContentTracking();
    }

    // 获取存储的用户画像
    getStoredUserProfile() {
        try {
            return JSON.parse(localStorage.getItem('libretv-user-profile') || '{}');
        } catch {
            return {
                favoriteGenres: [],
                preferredLanguages: ['zh-CN'],
                preferredQuality: 'auto',
                watchTimePreference: 'evening',
                deviceType: this.detectDeviceType(),
                ageGroup: 'adult',
                contentPreferences: {
                    movies: true,
                    tvShows: true,
                    documentaries: false,
                    animations: false,
                    varietyShows: false
                }
            };
        }
    }

    // 获取存储的观看历史
    getStoredViewingHistory() {
        try {
            return JSON.parse(localStorage.getItem('libretv-viewing-history') || '[]');
        } catch {
            return [];
        }
    }

    // 初始化内容分类
    initializeContentCategories() {
        return {
            movies: {
                name: '电影',
                subcategories: ['动作', '喜剧', '爱情', '科幻', '恐怖', '悬疑', '战争', '历史', '传记', '音乐'],
                keywords: ['电影', '片', '剧情', '导演', '演员']
            },
            tvShows: {
                name: '电视剧',
                subcategories: ['都市', '古装', '科幻', '悬疑', '爱情', '喜剧', '犯罪', '历史'],
                keywords: ['电视剧', '剧集', '季', '集', '更新']
            },
            animations: {
                name: '动画',
                subcategories: ['日本动画', '国产动画', '欧美动画', '儿童动画'],
                keywords: ['动画', '动漫', '卡通', '剧场版']
            },
            documentaries: {
                name: '纪录片',
                subcategories: ['自然', '历史', '科学', '人文', '社会'],
                keywords: ['纪录片', '纪实', '探索']
            },
            varietyShows: {
                name: '综艺',
                subcategories: ['真人秀', '选秀', '访谈', '游戏', '音乐'],
                keywords: ['综艺', '节目', '真人秀', '选秀']
            }
        };
    }

    // 分析用户行为
    analyzeUserBehavior() {
        console.log('[ContentDiscovery] 分析用户行为');
        
        // 分析观看时间偏好
        this.analyzeViewingTimePatterns();
        
        // 分析内容偏好
        this.analyzeContentPreferences();
        
        // 分析语言偏好
        this.analyzeLanguagePreferences();
        
        // 更新用户画像
        this.updateUserProfile();
    }

    // 分析观看时间模式
    analyzeViewingTimePatterns() {
        const hourCounts = {};
        
        this.viewingHistory.forEach(item => {
            const hour = new Date(item.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + item.duration;
        });
        
        // 找出最活跃的时间段
        let maxHour = 0;
        let maxCount = 0;
        
        Object.entries(hourCounts).forEach(([hour, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxHour = parseInt(hour);
            }
        });
        
        // 根据时间段设置偏好
        let timePreference = 'evening';
        if (maxHour >= 6 && maxHour < 12) {
            timePreference = 'morning';
        } else if (maxHour >= 12 && maxHour < 18) {
            timePreference = 'afternoon';
        }
        
        this.userProfile.watchTimePreference = timePreference;
    }

    // 分析内容偏好
    analyzeContentPreferences() {
        const genreCounts = {};
        const genreTime = {};
        
        this.viewingHistory.forEach(item => {
            const genres = this.extractGenres(item.title || item.name || '');
            genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                genreTime[genre] = (genreTime[genre] || 0) + (item.duration || 0);
            });
        });
        
        // 排序并获取最喜欢的类型
        const sortedGenres = Object.entries(genreCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([genre]) => genre);
        
        this.userProfile.favoriteGenres = sortedGenres.slice(0, 5);
        this.discoveryAnalytics.favoriteGenres = genreCounts;
        this.discoveryAnalytics.viewingTimeByGenre = genreTime;
    }

    // 分析语言偏好
    analyzeLanguagePreferences() {
        const languageCounts = {};
        
        this.viewingHistory.forEach(item => {
            const language = this.detectLanguage(item.title || item.name || '');
            languageCounts[language] = (languageCounts[language] || 0) + 1;
        });
        
        const preferredLanguage = Object.entries(languageCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'zh-CN';
        
        this.userProfile.preferredLanguages = [preferredLanguage];
    }

    // 提取类型关键词
    extractGenres(title) {
        const genres = [];
        const titleLower = title.toLowerCase();
        
        Object.entries(this.contentCategories).forEach(([category, data]) => {
            data.subcategories.forEach(subcategory => {
                if (titleLower.includes(subcategory.toLowerCase())) {
                    genres.push(subcategory);
                }
            });
        });
        
        // 基于关键词的简单分类
        if (titleLower.includes('电影') || titleLower.includes('片')) {
            genres.push('电影');
        }
        if (titleLower.includes('电视剧') || titleLower.includes('剧')) {
            genres.push('电视剧');
        }
        if (titleLower.includes('动画') || titleLower.includes('动漫')) {
            genres.push('动画');
        }
        
        return [...new Set(genres)];
    }

    // 检测语言
    detectLanguage(text) {
        // 简单的语言检测
        if (/[一-龯]/.test(text)) {
            return 'zh-CN';
        } else if (/[ぁ-ゟ゠-ヿ]/.test(text)) {
            return 'ja-JP';
        } else if (/[가-힣]/.test(text)) {
            return 'ko-KR';
        } else {
            return 'en-US';
        }
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

    // 更新用户画像
    updateUserProfile() {
        this.userProfile.lastUpdated = Date.now();
        this.userProfile.viewingHistoryCount = this.viewingHistory.length;
        this.userProfile.totalWatchTime = this.viewingHistory.reduce((total, item) => total + (item.duration || 0), 0);
        
        localStorage.setItem('libretv-user-profile', JSON.stringify(this.userProfile));
    }

    // 生成推荐内容
    async generateRecommendations() {
        console.log('[ContentDiscovery] 生成推荐内容');
        
        // 基于用户画像的推荐
        const profileBasedRecs = this.getProfileBasedRecommendations();
        
        // 基于内容的推荐
        const contentBasedRecs = await this.getContentBasedRecommendations();
        
        // 混合推荐
        this.recommendations = this.combineRecommendations(profileBasedRecs, contentBasedRecs);
        
        // 去重和排序
        this.recommendations = this.deduplicateAndSort(this.recommendations);
        
        console.log(`[ContentDiscovery] 生成了 ${this.recommendations.length} 个推荐`);
    }

    // 基于用户画像的推荐
    getProfileBasedRecommendations() {
        const recommendations = [];
        
        // 基于最喜欢的类型推荐
        this.userProfile.favoriteGenres.forEach(genre => {
            const rec = {
                id: `profile-${genre}`,
                title: `为你推荐${genre}内容`,
                type: 'genre-collection',
                genre: genre,
                reason: '基于你的观看偏好',
                score: 0.8
            };
            recommendations.push(rec);
        });
        
        // 基于观看时间的推荐
        const timeBasedRec = this.getTimeBasedRecommendations();
        recommendations.push(...timeBasedRec);
        
        return recommendations;
    }

    // 基于时间的推荐
    getTimeBasedRecommendations() {
        const hour = new Date().getHours();
        let recommendation;
        
        if (hour >= 6 && hour < 12) {
            recommendation = {
                id: 'morning-time',
                title: '晨间推荐',
                description: '适合早上观看的轻松内容',
                type: 'time-based',
                timeSlot: 'morning',
                score: 0.7
            };
        } else if (hour >= 12 && hour < 18) {
            recommendation = {
                id: 'afternoon-time',
                title: '午后时光',
                description: '适合下午观看的精彩内容',
                type: 'time-based',
                timeSlot: 'afternoon',
                score: 0.7
            };
        } else {
            recommendation = {
                id: 'evening-time',
                title: '晚间精选',
                description: '适合晚上观看的高质量内容',
                type: 'time-based',
                timeSlot: 'evening',
                score: 0.7
            };
        }
        
        return [recommendation];
    }

    // 基于内容的推荐
    async getContentBasedRecommendations() {
        const recommendations = [];
        
        // 基于最近观看内容的推荐
        const recentItems = this.viewingHistory.slice(0, 5);
        
        for (const item of recentItems) {
            const similar = await this.findSimilarContent(item);
            recommendations.push(...similar);
        }
        
        return recommendations;
    }

    // 查找相似内容
    async findSimilarContent(referenceItem) {
        // 模拟相似内容查找
        return new Promise((resolve) => {
            setTimeout(() => {
                const similar = [
                    {
                        id: `similar-${referenceItem.id}-1`,
                        title: `类似: ${referenceItem.title}`,
                        type: 'similar',
                        sourceId: referenceItem.id,
                        reason: '基于你最近观看的相似内容',
                        score: 0.6
                    }
                ];
                resolve(similar);
            }, 200);
        });
    }

    // 混合推荐
    combineRecommendations(profileRecs, contentRecs) {
        const combined = [...profileRecs, ...contentRecs];
        
        // 为不同类型的推荐设置权重
        combined.forEach(rec => {
            switch (rec.type) {
                case 'genre-collection':
                    rec.weight = 1.0;
                    break;
                case 'time-based':
                    rec.weight = 0.8;
                    break;
                case 'similar':
                    rec.weight = 0.6;
                    break;
                default:
                    rec.weight = 0.5;
            }
        });
        
        return combined;
    }

    // 去重和排序
    deduplicateAndSort(recommendations) {
        const seen = new Set();
        const unique = recommendations.filter(rec => {
            if (seen.has(rec.id)) {
                return false;
            }
            seen.add(rec.id);
            return true;
        });
        
        return unique.sort((a, b) => (b.score * b.weight) - (a.score * a.weight));
    }

    // 加载热门内容
    async loadTrendingContent() {
        console.log('[ContentDiscovery] 加载热门内容');
        
        try {
            // 模拟热门内容数据
            const trending = [
                {
                    id: 'trending-1',
                    title: '当前热门电影',
                    type: 'trending',
                    category: 'movies',
                    rank: 1,
                    viewCount: 100000,
                    score: 0.9
                },
                {
                    id: 'trending-2',
                    title: '热门电视剧',
                    type: 'trending',
                    category: 'tvShows',
                    rank: 2,
                    viewCount: 95000,
                    score: 0.85
                },
                {
                    id: 'trending-3',
                    title: '热议动画',
                    type: 'trending',
                    category: 'animations',
                    rank: 3,
                    viewCount: 87000,
                    score: 0.8
                }
            ];
            
            this.trendingContent = trending;
            this.updateTrendingDisplay();
            
        } catch (error) {
            console.error('[ContentDiscovery] 加载热门内容失败:', error);
        }
    }

    // 设置个性化订阅
    setupPersonalizedFeeds() {
        this.personalizedFeeds = {
            continueWatching: this.getContinueWatching(),
            recentlyAdded: this.getRecentlyAdded(),
            genreMix: this.getGenreMix(),
            moodBased: this.getMoodBasedContent()
        };
    }

    // 获取继续观看列表
    getContinueWatching() {
        return this.viewingHistory
            .filter(item => !item.completed && item.progress > 0)
            .slice(0, 10)
            .map(item => ({
                ...item,
                continueFrom: item.currentTime || 0
            }));
    }

    // 获取最近添加
    getRecentlyAdded() {
        // 模拟最近添加的内容
        return [
            {
                id: 'recent-1',
                title: '最新上线',
                type: 'recently-added',
                addedDate: new Date().toISOString(),
                score: 0.7
            }
        ];
    }

    // 获取类型混合推荐
    getGenreMix() {
        const genreMix = [];
        
        this.userProfile.favoriteGenres.forEach((genre, index) => {
            genreMix.push({
                id: `genre-mix-${genre}`,
                title: `${genre}精选`,
                type: 'genre-mix',
                genre: genre,
                position: index + 1,
                score: 0.8 - (index * 0.1)
            });
        });
        
        return genreMix;
    }

    // 获取基于心情的内容
    getMoodBasedContent() {
        const hour = new Date().getHours();
        let mood;
        
        if (hour >= 6 && hour < 12) {
            mood = 'energetic';
        } else if (hour >= 12 && hour < 18) {
            mood = 'relaxed';
        } else {
            mood = 'cozy';
        }
        
        return [
            {
                id: `mood-${mood}`,
                title: `${mood}内容`,
                type: 'mood-based',
                mood: mood,
                score: 0.6
            }
        ];
    }

    // 创建发现界面
    createDiscoveryInterface() {
        this.createDiscoveryPanel();
        this.createRecommendationCards();
    }

    // 创建发现面板
    createDiscoveryPanel() {
        const panel = document.createElement('div');
        panel.id = 'content-discovery-panel';
        panel.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        
        panel.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    <!-- 面板头部 -->
                    <div class="p-6 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-2">内容发现</h2>
                                <p class="text-gray-400">为你推荐个性化内容</p>
                            </div>
                            <button id="closeDiscoveryPanel" class="text-gray-400 hover:text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- 标签导航 -->
                        <div class="flex space-x-4 mt-4">
                            <button id="tab-recommendations" class="discovery-tab-btn active px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white">
                                个性推荐
                            </button>
                            <button id="tab-trending" class="discovery-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white">
                                热门内容
                            </button>
                            <button id="tab-feeds" class="discovery-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white">
                                个性订阅
                            </button>
                            <button id="tab-analytics" class="discovery-tab-btn px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white">
                                观看分析
                            </button>
                        </div>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <!-- 推荐内容标签页 -->
                        <div id="tab-content-recommendations" class="discovery-tab-content">
                            <div id="recommendations-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- 推荐内容将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 热门内容标签页 -->
                        <div id="tab-content-trending" class="discovery-tab-content hidden">
                            <div id="trending-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- 热门内容将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 个性订阅标签页 -->
                        <div id="tab-content-feeds" class="discovery-tab-content hidden">
                            <div id="feeds-container" class="space-y-6">
                                <!-- 订阅内容将在这里动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 观看分析标签页 -->
                        <div id="tab-content-analytics" class="discovery-tab-content hidden">
                            <div id="analytics-container" class="space-y-6">
                                <!-- 分析内容将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupDiscoveryPanelEvents();
    }

    // 设置发现面板事件
    setupDiscoveryPanelEvents() {
        // 关闭面板
        document.getElementById('closeDiscoveryPanel').addEventListener('click', () => {
            this.closeDiscoveryPanel();
        });
        
        // 标签切换
        document.querySelectorAll('.discovery-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchDiscoveryTab(e.target.id.replace('tab-', ''));
            });
        });
        
        // 点击外部关闭
        document.getElementById('content-discovery-panel').addEventListener('click', (e) => {
            if (e.target.id === 'content-discovery-panel') {
                this.closeDiscoveryPanel();
            }
        });
    }

    // 切换发现标签
    switchDiscoveryTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.discovery-tab-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('text-gray-400');
        });
        
        document.querySelector(`#tab-${tabName}`).classList.add('active', 'bg-blue-600', 'text-white');
        document.querySelector(`#tab-${tabName}`).classList.remove('text-gray-400');
        
        // 切换内容
        document.querySelectorAll('.discovery-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.querySelector(`#tab-content-${tabName}`).classList.remove('hidden');
        
        // 加载对应内容
        switch (tabName) {
            case 'recommendations':
                this.loadRecommendationsTab();
                break;
            case 'trending':
                this.loadTrendingTab();
                break;
            case 'feeds':
                this.loadFeedsTab();
                break;
            case 'analytics':
                this.loadAnalyticsTab();
                break;
        }
    }

    // 加载推荐标签页
    loadRecommendationsTab() {
        const container = document.getElementById('recommendations-grid');
        if (!container) return;
        
        container.innerHTML = this.recommendations.map(rec => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer" 
                 onclick="window.contentDiscovery.selectRecommendation('${rec.id}')">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-white font-semibold">${rec.title}</h3>
                    <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">${Math.round(rec.score * 100)}%</span>
                </div>
                <p class="text-gray-400 text-sm mb-3">${rec.reason}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">${rec.type}</span>
                    <button class="text-blue-400 hover:text-blue-300 text-sm">查看</button>
                </div>
            </div>
        `).join('');
        
        this.discoveryAnalytics.recommendationsShown += this.recommendations.length;
    }

    // 加载热门标签页
    loadTrendingTab() {
        const container = document.getElementById('trending-grid');
        if (!container) return;
        
        this.updateTrendingDisplay();
        
        container.innerHTML = this.trendingContent.map(item => `
            <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                 onclick="window.contentDiscovery.selectTrendingItem('${item.id}')">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-blue-400">#${item.rank}</span>
                        <h3 class="text-white font-semibold">${item.title}</h3>
                    </div>
                </div>
                <p class="text-gray-400 text-sm mb-3">${item.category}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">${(item.viewCount / 1000).toFixed(1)}K 次观看</span>
                    <span class="text-xs bg-red-600 text-white px-2 py-1 rounded">热门</span>
                </div>
            </div>
        `).join('');
    }

    // 更新热门显示
    updateTrendingDisplay() {
        const trendingContainer = document.getElementById('trending-content');
        if (trendingContainer) {
            trendingContainer.innerHTML = this.trendingContent.map(item => `
                <div class="trending-item p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                     onclick="window.contentDiscovery.selectTrendingItem('${item.id}')">
                    <div class="text-white font-medium">${item.title}</div>
                    <div class="text-gray-400 text-sm">${item.category}</div>
                </div>
            `).join('');
        }
    }

    // 加载订阅标签页
    loadFeedsTab() {
        const container = document.getElementById('feeds-container');
        if (!container) return;
        
        container.innerHTML = `
            <!-- 继续观看 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">继续观看</h3>
                <div class="space-y-2">
                    ${this.personalizedFeeds.continueWatching.map(item => `
                        <div class="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
                             onclick="window.contentDiscovery.continueWatching('${item.id}')">
                            <div class="w-16 h-12 bg-gray-600 rounded flex items-center justify-center">
                                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12L6 8L10 4V12Z"></path>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="text-white text-sm">${item.title}</div>
                                <div class="text-gray-400 text-xs">${item.type || '未知类型'}</div>
                            </div>
                            <div class="text-gray-400 text-xs">
                                ${Math.round((item.progress || 0) * 100)}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 最近添加 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">最近添加</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${this.personalizedFeeds.recentlyAdded.map(item => `
                        <div class="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600"
                             onclick="window.contentDiscovery.selectRecentlyAdded('${item.id}')">
                            <div class="text-white text-sm font-medium mb-1">${item.title}</div>
                            <div class="text-gray-400 text-xs">最新上线</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 类型混合 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">类型精选</h3>
                <div class="flex flex-wrap gap-2">
                    ${this.personalizedFeeds.genreMix.map(item => `
                        <button onclick="window.contentDiscovery.selectGenreMix('${item.id}')"
                                class="px-3 py-1 bg-gray-700 hover:bg-blue-600 text-white text-sm rounded transition-colors">
                            ${item.title}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 加载分析标签页
    loadAnalyticsTab() {
        const container = document.getElementById('analytics-container');
        if (!container) return;
        
        container.innerHTML = `
            <!-- 观看统计 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">观看统计</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-400">${this.viewingHistory.length}</div>
                        <div class="text-gray-400 text-sm">观看项目</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${Math.round(this.userProfile.totalWatchTime / 3600) || 0}h</div>
                        <div class="text-gray-400 text-sm">总观看时长</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-400">${this.userProfile.favoriteGenres.length}</div>
                        <div class="text-gray-400 text-sm">偏好类型</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-400">${this.discoveryAnalytics.recommendationsClicked}</div>
                        <div class="text-gray-400 text-sm">推荐点击</div>
                    </div>
                </div>
            </div>
            
            <!-- 偏好类型 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">偏好类型分析</h3>
                <div class="space-y-2">
                    ${Object.entries(this.discoveryAnalytics.favoriteGenres).slice(0, 5).map(([genre, count]) => {
                        const percentage = (count / this.viewingHistory.length * 100).toFixed(1);
                        return `
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">${genre}</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-20 bg-gray-700 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="text-gray-400 text-sm">${percentage}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- 观看时间分析 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white font-semibold mb-3">观看时间分析</h3>
                <div class="text-center">
                    <div class="text-lg text-blue-400 mb-2">偏好观看时段</div>
                    <div class="text-2xl font-bold text-white">${this.getTimeSlotName(this.userProfile.watchTimePreference)}</div>
                    <div class="text-gray-400 text-sm mt-1">基于你的观看习惯分析</div>
                </div>
            </div>
        `;
    }

    // 获取时间段名称
    getTimeSlotName(preference) {
        const names = {
            'morning': '上午时光',
            'afternoon': '午后时光',
            'evening': '晚间黄金时间',
            'night': '深夜观影'
        };
        return names[preference] || '晚间黄金时间';
    }

    // 设置内容追踪
    setupContentTracking() {
        // 监听视频播放事件
        document.addEventListener('videoPlay', (event) => {
            this.trackContentView(event.detail);
        });
        
        document.addEventListener('videoPause', (event) => {
            this.updateViewingProgress(event.detail);
        });
    }

    // 追踪内容观看
    trackContentView(contentInfo) {
        const viewingRecord = {
            id: contentInfo.id || Date.now().toString(),
            title: contentInfo.title,
            type: contentInfo.type,
            timestamp: Date.now(),
            duration: contentInfo.duration || 0,
            completed: false,
            progress: 0
        };
        
        this.viewingHistory.unshift(viewingRecord);
        
        // 限制历史记录数量
        if (this.viewingHistory.length > 200) {
            this.viewingHistory = this.viewingHistory.slice(0, 200);
        }
        
        this.saveViewingHistory();
        this.analyzeUserBehavior();
        this.generateRecommendations();
    }

    // 更新观看进度
    updateViewingProgress(contentInfo) {
        const recentItem = this.viewingHistory.find(item => 
            item.id === contentInfo.id || 
            (item.title === contentInfo.title && Math.abs(item.timestamp - Date.now()) < 300000)
        );
        
        if (recentItem) {
            recentItem.currentTime = contentInfo.currentTime;
            recentItem.duration = contentInfo.duration;
            recentItem.progress = contentInfo.currentTime / contentInfo.duration;
            recentItem.completed = recentItem.progress >= 0.9;
        }
        
        this.saveViewingHistory();
    }

    // 保存观看历史
    saveViewingHistory() {
        localStorage.setItem('libretv-viewing-history', JSON.stringify(this.viewingHistory));
    }

    // 选择推荐项
    selectRecommendation(recommendationId) {
        const recommendation = this.recommendations.find(rec => rec.id === recommendationId);
        if (recommendation) {
            this.discoveryAnalytics.recommendationsClicked++;
            console.log('[ContentDiscovery] 选择推荐:', recommendation.title);
            
            // 触发推荐内容搜索
            this.searchForRecommendation(recommendation);
        }
    }

    // 选择热门项
    selectTrendingItem(itemId) {
        const item = this.trendingContent.find(trending => trending.id === itemId);
        if (item) {
            console.log('[ContentDiscovery] 选择热门:', item.title);
            
            // 触发热门内容搜索
            this.searchForTrending(item);
        }
    }

    // 搜索推荐内容
    searchForRecommendation(recommendation) {
        // 调用搜索功能
        if (window.intelligentSearch) {
            window.intelligentSearch.searchFor(recommendation.title);
        }
        
        this.closeDiscoveryPanel();
    }

    // 搜索热门内容
    searchForTrending(item) {
        // 调用搜索功能
        if (window.intelligentSearch) {
            window.intelligentSearch.searchFor(item.title);
        }
        
        this.closeDiscoveryPanel();
    }

    // 继续观看
    continueWatching(itemId) {
        const item = this.personalizedFeeds.continueWatching.find(feed => feed.id === itemId);
        if (item) {
            console.log('[ContentDiscovery] 继续观看:', item.title);
            // 继续播放逻辑
        }
    }

    // 关闭发现面板
    closeDiscoveryPanel() {
        const panel = document.getElementById('content-discovery-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    // 打开发现面板
    openDiscoveryPanel() {
        const panel = document.getElementById('content-discovery-panel');
        if (panel) {
            panel.classList.remove('hidden');
            this.loadRecommendationsTab();
        }
    }

    // 创建推荐卡片
    createRecommendationCards() {
        // 在主界面添加发现入口
        const discoveryButton = document.createElement('button');
        discoveryButton.id = 'discovery-button';
        discoveryButton.className = 'fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110';
        discoveryButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
        `;
        discoveryButton.title = '内容发现';
        discoveryButton.onclick = () => this.openDiscoveryPanel();
        
        document.body.appendChild(discoveryButton);
    }

    // 获取发现统计
    getDiscoveryStats() {
        return {
            ...this.discoveryAnalytics,
            userProfile: this.userProfile,
            totalRecommendations: this.recommendations.length,
            trendingContentCount: this.trendingContent.length,
            viewingHistoryCount: this.viewingHistory.length
        };
    }

    // 重置发现数据
    resetDiscoveryData() {
        this.viewingHistory = [];
        this.recommendations = [];
        this.discoveryAnalytics = {
            recommendationsShown: 0,
            recommendationsClicked: 0,
            contentDiscovered: 0,
            favoriteGenres: {},
            viewingTimeByGenre: {}
        };
        
        localStorage.removeItem('libretv-viewing-history');
        localStorage.removeItem('libretv-user-profile');
        
        this.analyzeUserBehavior();
        this.generateRecommendations();
    }
}

// 创建全局内容发现管理器实例
window.ContentDiscoveryManager = ContentDiscoveryManager;
window.contentDiscovery = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.contentDiscovery = new ContentDiscoveryManager();
    });
} else {
    window.contentDiscovery = new ContentDiscoveryManager();
}

// 导出内容发现管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentDiscoveryManager;
}