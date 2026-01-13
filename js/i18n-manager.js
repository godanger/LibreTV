// 国际化管理器 - 为LibreTV提供多语言支持
class I18nManager {
    constructor() {
        this.fallbackLanguage = 'zh-CN';
        this.translations = new Map();
        this.formatters = new Map();
        this.supportedLanguages = this.getSupportedLanguages();
        this.detectedLanguage = this.detectBrowserLanguage();
        this.currentLanguage = this.getStoredLanguage();
        
        this.init();
    }

    init() {
        console.log('[I18n] 初始化国际化管理器');
        this.loadTranslations();
        this.setupLanguageDetection();
        this.createLanguageSwitcher();
        this.setupFormatHandlers();
        this.detectTimeZone();
    }

    // 获取支持的语言
    getSupportedLanguages() {
        return {
            'zh-CN': { name: '中文简体', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
            'zh-TW': { name: '中文繁体', nativeName: '繁體中文', flag: '🇹🇼', rtl: false },
            'en-US': { name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
            'ja-JP': { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
            'ko-KR': { name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
            'es-ES': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
            'fr-FR': { name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
            'de-DE': { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
            'ru-RU': { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
            'ar-SA': { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
            'pt-BR': { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
            'it-IT': { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
            'th-TH': { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
            'vi-VN': { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
            'id-ID': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false }
        };
    }

    // 获取存储的语言设置
    getStoredLanguage() {
        const stored = localStorage.getItem('libretv-language');
        return stored || this.detectedLanguage || 'zh-CN';
    }

    // 检测浏览器语言
    detectBrowserLanguage() {
        const languages = navigator.languages || [navigator.language];
        
        for (const lang of languages) {
            const normalizedLang = this.normalizeLanguageCode(lang);
            if (this.supportedLanguages[normalizedLang]) {
                return normalizedLang;
            }
        }
        
        return 'zh-CN';
    }

    // 标准化语言代码
    normalizeLanguageCode(lang) {
        // 处理如 zh-CN, en-US 等格式
        const parts = lang.split('-');
        if (parts.length === 2) {
            return `${parts[0]}-${parts[1].toUpperCase()}`;
        }
        return lang;
    }

    // 加载翻译
    async loadTranslations() {
        console.log('[I18n] 加载翻译文件');
        
        // 默认翻译（中文简体）
        const defaultTranslations = {
            // 通用
            'common.loading': '加载中...',
            'common.search': '搜索',
            'common.cancel': '取消',
            'common.confirm': '确认',
            'common.save': '保存',
            'common.delete': '删除',
            'common.edit': '编辑',
            'common.close': '关闭',
            'common.open': '打开',
            'common.back': '返回',
            'common.next': '下一步',
            'common.previous': '上一步',
            'common.home': '首页',
            'common.settings': '设置',
            'common.help': '帮助',
            'common.about': '关于',
            
            // 导航
            'nav.search': '搜索',
            'nav.home': '首页',
            'nav.history': '历史',
            'nav.favorites': '收藏',
            'nav.settings': '设置',
            'nav.profile': '个人资料',
            
            // 搜索
            'search.placeholder': '搜索视频内容...',
            'search.results': '搜索结果',
            'search.noResults': '未找到结果',
            'search.suggestions': '搜索建议',
            'search.trending': '热门搜索',
            'search.recent': '最近搜索',
            
            // 播放器
            'player.title': '播放器',
            'player.play': '播放',
            'player.pause': '暂停',
            'player.stop': '停止',
            'player.volume': '音量',
            'player.fullscreen': '全屏',
            'player.exitFullscreen': '退出全屏',
            'player.settings': '播放设置',
            'player.playlist': '播放列表',
            'player.next': '下一集',
            'player.previous': '上一集',
            'player.quality': '画质',
            'player.speed': '速度',
            'player.subtitle': '字幕',
            'player.pip': '画中画',
            
            // 内容
            'content.movies': '电影',
            'content.tvShows': '电视剧',
            'content.documentaries': '纪录片',
            'content.animations': '动画',
            'content.varietyShows': '综艺',
            'content.recentlyAdded': '最近添加',
            'content.popular': '热门',
            'content.trending': '趋势',
            'content.rating': '评分',
            'content.year': '年份',
            'content.duration': '时长',
            'content.genre': '类型',
            'content.cast': '演员',
            'content.director': '导演',
            'content.description': '简介',
            
            // 用户相关
            'user.login': '登录',
            'user.logout': '登出',
            'user.register': '注册',
            'user.profile': '个人资料',
            'user.preferences': '偏好设置',
            'user.history': '观看历史',
            'user.bookmarks': '书签',
            'user.favorites': '收藏夹',
            
            // 设置
            'settings.title': '设置',
            'settings.language': '语言',
            'settings.theme': '主题',
            'settings.quality': '默认画质',
            'settings.autoplay': '自动播放',
            'settings.subtitles': '字幕',
            'settings.notifications': '通知',
            'settings.privacy': '隐私',
            
            // 错误信息
            'error.network': '网络错误',
            'error.loading': '加载失败',
            'error.playback': '播放错误',
            'error.search': '搜索失败',
            'error.general': '发生错误',
            
            // 时间格式
            'time.justNow': '刚刚',
            'time.minutesAgo': '{count}分钟前',
            'time.hoursAgo': '{count}小时前',
            'time.daysAgo': '{count}天前',
            'time.weeksAgo': '{count}周前',
            'time.monthsAgo': '{count}月前',
            'time.yearsAgo': '{count}年前',
            
            // 数字格式
            'number.thousand': '{value}K',
            'number.million': '{value}M',
            'number.billion': '{value}B',
            
            // 分页
            'pagination.page': '第{page}页',
            'pagination.of': '共{total}页',
            'pagination.previous': '上一页',
            'pagination.next': '下一页',
            'pagination.first': '首页',
            'pagination.last': '末页',
            
            // 播放状态
            'status.playing': '正在播放',
            'status.paused': '已暂停',
            'status.buffering': '缓冲中',
            'status.ended': '播放结束',
            'status.error': '播放错误',
            
            // 设备相关
            'device.mobile': '手机',
            'device.tablet': '平板',
            'device.desktop': '桌面',
            'device.tv': '电视',
            
            // 网络相关
            'network.online': '在线',
            'network.offline': '离线',
            'network.slow': '网络较慢',
            'network.fast': '网络较快',
            
            // 快捷键
            'shortcut.playPause': '播放/暂停',
            'shortcut.fullscreen': '全屏切换',
            'shortcut.volumeUp': '音量增加',
            'shortcut.volumeDown': '音量减小',
            'shortcut.seekBackward': '快退',
            'shortcut.seekForward': '快进',
            'shortcut.nextTrack': '下一首',
            'shortcut.previousTrack': '上一首'
        };
        
        this.translations.set('zh-CN', defaultTranslations);
        
        // 尝试加载其他语言的翻译
        await this.loadAdditionalLanguages();
    }

    // 加载额外的语言翻译
    async loadAdditionalLanguages() {
        const additionalLanguages = ['en-US', 'ja-JP', 'ko-KR'];
        
        for (const lang of additionalLanguages) {
            try {
                const response = await fetch(`/locales/${lang}.json`);
                if (response.ok) {
                    const translations = await response.json();
                    this.translations.set(lang, { ...this.translations.get('zh-CN'), ...translations });
                    console.log(`[I18n] 已加载 ${lang} 翻译`);
                }
            } catch (error) {
                console.warn(`[I18n] 无法加载 ${lang} 翻译文件:`, error);
                // 使用默认翻译
                this.translations.set(lang, this.translations.get('zh-CN'));
            }
        }
    }

    // 设置语言检测
    setupLanguageDetection() {
        // 监听系统语言变化
        if (navigator.language) {
            const observer = new MutationObserver(() => {
                const newLang = this.detectBrowserLanguage();
                if (newLang !== this.currentLanguage) {
                    this.showLanguageChangeNotification(newLang);
                }
            });
            
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['lang']
            });
        }
    }

    // 显示语言变化通知
    showLanguageChangeNotification(newLang) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <span>检测到系统语言变化为 ${this.supportedLanguages[newLang]?.name || newLang}</span>
                <button onclick="window.i18nManager.switchLanguage('${newLang}'); this.parentElement.parentElement.remove();" 
                        class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm">
                    切换
                </button>
                <button onclick="this.parentElement.parentElement.remove()" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm">
                    保持
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 10秒后自动消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // 创建语言切换器
    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'language-switcher';
        switcher.className = 'fixed bottom-4 left-4 z-40';
        
        switcher.innerHTML = `
            <button id="languageButton" 
                    class="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-3 shadow-lg transition-colors"
                    title="${this.t('nav.settings')} - ${this.t('settings.language')}">
                <span class="text-lg">${this.supportedLanguages[this.currentLanguage]?.flag || '🌐'}</span>
            </button>
            
            <div id="languageDropdown" 
                 class="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 hidden min-w-48">
                <div class="p-2">
                    <div class="text-gray-300 text-sm font-medium mb-2 px-2">${this.t('settings.language')}</div>
                    <div id="languageList" class="space-y-1">
                        <!-- 语言选项将在这里动态生成 -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(switcher);
        this.setupLanguageSwitcherEvents();
        this.renderLanguageList();
    }

    // 设置语言切换器事件
    setupLanguageSwitcherEvents() {
        const button = document.getElementById('languageButton');
        const dropdown = document.getElementById('languageDropdown');
        
        button.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 键盘导航
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('hidden');
            }
        });
    }

    // 渲染语言列表
    renderLanguageList() {
        const languageList = document.getElementById('languageList');
        if (!languageList) return;
        
        const languages = Object.entries(this.supportedLanguages);
        languageList.innerHTML = languages.map(([code, info]) => `
            <button onclick="window.i18nManager.switchLanguage('${code}')" 
                    class="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-gray-700 transition-colors ${code === this.currentLanguage ? 'bg-blue-600' : ''}">
                <span class="text-lg">${info.flag}</span>
                <div class="flex-1">
                    <div class="text-white text-sm">${info.nativeName}</div>
                    <div class="text-gray-400 text-xs">${info.name}</div>
                </div>
                ${code === this.currentLanguage ? '<span class="text-blue-300 text-xs">✓</span>' : ''}
            </button>
        `).join('');
    }

    // 切换语言
    switchLanguage(languageCode) {
        if (!this.supportedLanguages[languageCode]) {
            console.warn(`[I18n] 不支持的语言代码: ${languageCode}`);
            return;
        }
        
        this.currentLanguage = languageCode;
        localStorage.setItem('libretv-language', languageCode);
        
        // 更新页面语言属性
        document.documentElement.lang = languageCode;
        document.documentElement.dir = this.supportedLanguages[languageCode].rtl ? 'rtl' : 'ltr';
        
        // 更新页面标题和内容
        this.updatePageContent();
        
        // 关闭下拉菜单
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        // 显示切换成功通知
        this.showLanguageSwitchNotification(languageCode);
        
        // 触发语言变化事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: languageCode }
        }));
    }

    // 更新页面内容
    updatePageContent() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation !== key) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'submit' || element.type === 'button') {
                        element.value = translation;
                    } else {
                        element.placeholder = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // 更新标题
        document.title = this.t('nav.home') + ' - LibreTV';
        
        // 更新页面元数据
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.t('search.placeholder'));
        }
    }

    // 显示语言切换通知
    showLanguageSwitchNotification(languageCode) {
        const language = this.supportedLanguages[languageCode];
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${language.flag}</span>
                <span class="font-medium">已切换到 ${language.nativeName}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 设置格式化处理器
    setupFormatHandlers() {
        // 时间格式化
        this.formatters.set('time', (value, options = {}) => {
            return this.formatTime(value, options);
        });
        
        // 数字格式化
        this.formatters.set('number', (value, options = {}) => {
            return this.formatNumber(value, options);
        });
        
        // 货币格式化
        this.formatters.set('currency', (value, currency = 'CNY', options = {}) => {
            return this.formatCurrency(value, currency, options);
        });
        
        // 日期格式化
        this.formatters.set('date', (value, options = {}) => {
            return this.formatDate(value, options);
        });
        
        // 相对时间格式化
        this.formatters.set('relativeTime', (value, options = {}) => {
            return this.formatRelativeTime(value, options);
        });
    }

    // 格式化时间
    formatTime(time, options = {}) {
        const date = new Date(time);
        const locale = this.currentLanguage;
        
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    }

    // 格式化数字
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage;
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // 格式化货币
    formatCurrency(amount, currency = 'CNY', options = {}) {
        const locale = this.currentLanguage;
        const defaultOptions = {
            style: 'currency',
            currency: currency,
            ...options
        };
        
        return new Intl.NumberFormat(locale, defaultOptions).format(amount);
    }

    // 格式化日期
    formatDate(date, options = {}) {
        const locale = this.currentLanguage;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };
        
        return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    }

    // 格式化相对时间
    formatRelativeTime(date, options = {}) {
        const locale = this.currentLanguage;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        const intervals = [
            { unit: 'year', seconds: 31536000 },
            { unit: 'month', seconds: 2592000 },
            { unit: 'week', seconds: 604800 },
            { unit: 'day', seconds: 86400 },
            { unit: 'hour', seconds: 3600 },
            { unit: 'minute', seconds: 60 },
            { unit: 'second', seconds: 1 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return rtf.format(-count, interval.unit);
            }
        }
        
        return rtf.format(0, 'second');
    }

    // 检测时区
    detectTimeZone() {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log(`[I18n] 检测到时区: ${timeZone}`);
        
        // 可以根据时区自动选择语言
        const timezoneToLanguage = {
            'Asia/Shanghai': 'zh-CN',
            'Asia/Tokyo': 'ja-JP',
            'Asia/Seoul': 'ko-KR',
            'Europe/London': 'en-GB',
            'America/New_York': 'en-US'
        };
        
        const suggestedLanguage = timezoneToLanguage[timeZone];
        if (suggestedLanguage && suggestedLanguage !== this.currentLanguage) {
            console.log(`[I18n] 根据时区建议语言: ${suggestedLanguage}`);
        }
    }

    // 翻译函数
    t(key, parameters = {}) {
        const translations = this.translations.get(this.currentLanguage) || this.translations.get(this.fallbackLanguage);
        let translation = translations[key] || key;
        
        // 参数替换
        Object.keys(parameters).forEach(param => {
            translation = translation.replace(new RegExp(`{${param}}`, 'g'), parameters[param]);
        });
        
        return translation;
    }

    // 格式化函数
    format(type, value, ...args) {
        const formatter = this.formatters.get(type);
        if (formatter) {
            return formatter(value, ...args);
        }
        return value;
    }

    // 获取当前语言信息
    getCurrentLanguage() {
        return {
            code: this.currentLanguage,
            ...this.supportedLanguages[this.currentLanguage]
        };
    }

    // 获取所有支持的语言
    getAllLanguages() {
        return Object.entries(this.supportedLanguages).map(([code, info]) => ({
            code,
            ...info
        }));
    }

    // 检查语言支持
    isLanguageSupported(languageCode) {
        return !!this.supportedLanguages[languageCode];
    }

    // 获取语言方向（RTL/LTR）
    getTextDirection(languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        return this.supportedLanguages[lang]?.rtl ? 'rtl' : 'ltr';
    }

    // 获取本地化数字格式
    getNumberFormat() {
        const locale = this.currentLanguage;
        const numberFormat = new Intl.NumberFormat(locale);
        return {
            decimal: numberFormat.resolvedOptions().maximumFractionDigits,
            thousand: numberFormat.resolvedOptions().useGrouping
        };
    }

    // 获取本地化日期格式
    getDateFormat() {
        const locale = this.currentLanguage;
        const dateFormat = new Intl.DateTimeFormat(locale);
        const options = dateFormat.resolvedOptions();
        
        return {
            format: options.dateStyle || 'medium',
            calendar: options.calendar,
            numberingSystem: options.numberingSystem
        };
    }

    // 创建语言切换快捷键
    createLanguageSwitchShortcut() {
        document.addEventListener('keydown', (e) => {
            // Alt + L：切换语言
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                this.showLanguageQuickSwitcher();
            }
        });
    }

    // 显示语言快速切换器
    showLanguageQuickSwitcher() {
        const languages = this.getAllLanguages();
        const currentIndex = languages.findIndex(lang => lang.code === this.currentLanguage);
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLanguage = languages[nextIndex];
        
        this.switchLanguage(nextLanguage.code);
    }

    // 导出翻译数据
    exportTranslations() {
        const data = {
            currentLanguage: this.currentLanguage,
            translations: Object.fromEntries(this.translations),
            exportedAt: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `libretv-translations-${this.currentLanguage}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 获取翻译统计
    getTranslationStats() {
        const stats = {};
        
        for (const [lang, translations] of this.translations) {
            stats[lang] = {
                totalKeys: Object.keys(translations).length,
                coverage: 100, // 假设所有语言都有完整翻译
                lastUpdated: new Date().toISOString()
            };
        }
        
        return stats;
    }
}

// 创建全局国际化管理器实例
window.I18nManager = I18nManager;
window.i18nManager = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18nManager = new I18nManager();
    });
} else {
    window.i18nManager = new I18nManager();
}

// 导出国际化管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}