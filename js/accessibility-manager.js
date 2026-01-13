// 可访问性管理器 - 为LibreTV提供全面的可访问性支持
class AccessibilityManager {
    constructor() {
        this.settings = this.getStoredSettings();
        this.preferences = this.getStoredPreferences();
        this.keyboardNavigation = {
            enabled: true,
            trapFocus: true,
            announcements: true
        };
        this.screenReaderSupport = {
            enabled: this.detectScreenReader(),
            ariaLive: true,
            roleDescriptions: true
        };
        this.visualAssist = {
            highContrast: false,
            fontSize: 'medium',
            colorBlindMode: 'none',
            reducedMotion: this.detectReducedMotion()
        };
        this.focusManagement = {
            visible: true,
            outline: true,
            skipLinks: true
        };
        
        this.init();
    }

    init() {
        console.log('[Accessibility] 初始化可访问性管理器');
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupVisualAssistance();
        this.setupFocusManagement();
        this.createAccessibilityPanel();
        this.setupAccessibilityShortcuts();
        this.enhanceSemanticHTML();
    }

    // 获取存储的设置
    getStoredSettings() {
        try {
            return JSON.parse(localStorage.getItem('libretv-accessibility-settings') || '{}');
        } catch {
            return {
                keyboardNavigation: true,
                screenReader: true,
                highContrast: false,
                fontSize: 'medium',
                colorBlindSupport: false,
                reducedMotion: false,
                focusIndicators: true,
                announcements: true
            };
        }
    }

    // 获取存储的偏好
    getStoredPreferences() {
        try {
            return JSON.parse(localStorage.getItem('libretv-accessibility-preferences') || '{}');
        } catch {
            return {};
        }
    }

    // 检测屏幕阅读器
    detectScreenReader() {
        return (
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver') ||
            navigator.userAgent.includes('Orca') ||
            window.speechSynthesis ||
            window.navigator.userAgent.includes('Dragon')
        );
    }

    // 检测减少动画偏好
    detectReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // 设置键盘导航
    setupKeyboardNavigation() {
        if (!this.settings.keyboardNavigation) return;
        
        this.createSkipLinks();
        this.setupFocusTrapping();
        this.setupKeyboardShortcuts();
        this.setupArrowKeyNavigation();
    }

    // 创建跳转链接
    createSkipLinks() {
        if (!this.focusManagement.skipLinks) return;
        
        const skipLinks = document.createElement('nav');
        skipLinks.className = 'sr-only focus:not-sr-only';
        skipLinks.setAttribute('aria-label', '跳转链接');
        skipLinks.innerHTML = `
            <a href="#main-content" class="sr-only focus:not-sr-only absolute top-0 left-0 z-50 bg-blue-600 text-white p-2">
                跳转到主要内容
            </a>
            <a href="#search" class="sr-only focus:not-sr-only absolute top-0 left-32 z-50 bg-blue-600 text-white p-2">
                跳转到搜索
            </a>
            <a href="#navigation" class="sr-only focus:not-sr-only absolute top-0 left-64 z-50 bg-blue-600 text-white p-2">
                跳转到导航
            </a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    // 设置焦点陷阱
    setupFocusTrapping() {
        if (!this.keyboardNavigation.trapFocus) return;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    // 焦点陷阱逻辑
    trapFocus(e) {
        const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + 数字键：切换功能面板
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                this.handleFunctionKey(e.key);
            }
            
            // Alt + S：打开搜索
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.openSearch();
            }
            
            // Alt + P：打开播放列表
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                this.openPlaylist();
            }
            
            // Alt + H：跳转到主页
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                this.goToHome();
            }
            
            // F6：在区域间循环跳转
            if (e.key === 'F6') {
                e.preventDefault();
                this.navigateBetweenRegions();
            }
        });
    }

    // 处理功能键
    handleFunctionKey(key) {
        const functions = {
            '1': () => this.announce('跳转到搜索'),
            '2': () => this.announce('跳转到导航'),
            '3': () => this.announce('跳转到内容'),
            '4': () => this.announce('跳转到侧边栏'),
            '5': () => this.announce('跳转到页脚')
        };
        
        const action = functions[key];
        if (action) {
            action();
        }
    }

    // 导航到主页
    goToHome() {
        const homeLink = document.querySelector('a[href="/"], a[href="index.html"]');
        if (homeLink) {
            homeLink.focus();
            homeLink.click();
        }
    }

    // 打开搜索
    openSearch() {
        const searchInput = document.querySelector('#searchInput, input[type="search"]');
        if (searchInput) {
            searchInput.focus();
            this.announce('搜索已聚焦');
        }
    }

    // 打开播放列表
    openPlaylist() {
        if (window.advancedPlayer) {
            window.advancedPlayer.togglePlaylist();
            this.announce('播放列表已切换');
        }
    }

    // 在区域间导航
    navigateBetweenRegions() {
        const regions = [
            { selector: 'nav', name: '导航' },
            { selector: 'main', name: '主内容' },
            { selector: 'aside', name: '侧边栏' },
            { selector: 'footer', name: '页脚' }
        ];
        
        let currentRegion = -1;
        const activeElement = document.activeElement;
        
        // 找到当前区域
        regions.forEach((region, index) => {
            const element = document.querySelector(region.selector);
            if (element && element.contains(activeElement)) {
                currentRegion = index;
            }
        });
        
        // 移动到下一个区域
        const nextRegion = (currentRegion + 1) % regions.length;
        const nextElement = document.querySelector(regions[nextRegion].selector);
        
        if (nextElement) {
            // 聚焦到区域的第一个可聚焦元素
            const focusable = nextElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
                this.announce(`已跳转到${regions[nextRegion].name}`);
            }
        }
    }

    // 设置箭头键导航
    setupArrowKeyNavigation() {
        // 视频网格箭头导航
        const videoGrid = document.querySelector('.video-grid, #video-grid');
        if (videoGrid) {
            videoGrid.addEventListener('keydown', (e) => {
                this.handleGridNavigation(e, videoGrid);
            });
        }
        
        // 菜单箭头导航
        const menus = document.querySelectorAll('[role="menu"], .dropdown-menu');
        menus.forEach(menu => {
            menu.addEventListener('keydown', (e) => {
                this.handleMenuNavigation(e, menu);
            });
        });
    }

    // 处理网格导航
    handleGridNavigation(e, grid) {
        const items = grid.querySelectorAll('.video-card, [role="gridcell"]');
        const currentIndex = Array.from(items).indexOf(document.activeElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        const columns = this.getGridColumns(grid);
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextIndex = Math.min(items.length - 1, currentIndex + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = Math.max(0, currentIndex - columns);
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = Math.min(items.length - 1, currentIndex + columns);
                break;
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = items.length - 1;
                break;
            default:
                return;
        }
        
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
            this.announce(`已选择第${nextIndex + 1}个视频`);
        }
    }

    // 处理菜单导航
    handleMenuNavigation(e, menu) {
        const items = menu.querySelectorAll('[role="menuitem"], .menu-item');
        const currentIndex = Array.from(items).indexOf(document.activeElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = items.length - 1;
                break;
            default:
                return;
        }
        
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
        }
    }

    // 获取网格列数
    getGridColumns(grid) {
        const style = window.getComputedStyle(grid);
        const gridTemplateColumns = style.gridTemplateColumns;
        return gridTemplateColumns.split(' ').length;
    }

    // 设置屏幕阅读器支持
    setupScreenReaderSupport() {
        if (!this.screenReaderSupport.enabled) return;
        
        this.addAriaLabels();
        this.setupAriaLive();
        this.addRoleDescriptions();
        this.setupAnnouncements();
    }

    // 添加ARIA标签
    addAriaLabels() {
        // 为按钮添加标签
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', this.getButtonLabel(button));
            }
        });
        
        // 为图标按钮添加标签
        const iconButtons = document.querySelectorAll('button svg');
        iconButtons.forEach(button => {
            const svg = button.querySelector('svg');
            if (svg && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', this.getIconLabel(svg));
            }
        });
        
        // 为输入框添加标签
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
    }

    // 获取按钮标签
    getButtonLabel(button) {
        const classes = button.className.toLowerCase();
        
        if (classes.includes('search')) return '搜索';
        if (classes.includes('settings')) return '设置';
        if (classes.includes('home')) return '首页';
        if (classes.includes('back')) return '返回';
        if (classes.includes('play')) return '播放';
        if (classes.includes('pause')) return '暂停';
        if (classes.includes('volume')) return '音量';
        if (classes.includes('fullscreen')) return '全屏';
        
        return '按钮';
    }

    // 获取图标标签
    getIconLabel(svg) {
        const path = svg.querySelector('path');
        if (path && path.getAttribute('d')) {
            const d = path.getAttribute('d');
            
            if (d.includes('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')) return '搜索';
            if (d.includes('M10.325 4.317c.426-1.756')) return '设置';
            if (d.includes('M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z')) return '首页';
            if (d.includes('M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z')) return '播放';
            if (d.includes('M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z')) return '暂停';
        }
        
        return '图标按钮';
    }

    // 设置ARIA Live区域
    setupAriaLive() {
        if (!this.screenReaderSupport.ariaLive) return;
        
        // 创建主要通知区域
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        
        // 创建紧急通知区域
        const urgentRegion = document.createElement('div');
        urgentRegion.id = 'aria-urgent-region';
        urgentRegion.setAttribute('aria-live', 'assertive');
        urgentRegion.setAttribute('aria-atomic', 'true');
        urgentRegion.className = 'sr-only';
        document.body.appendChild(urgentRegion);
    }

    // 添加角色描述
    addRoleDescriptions() {
        if (!this.screenReaderSupport.roleDescriptions) return;
        
        // 为主要区域添加角色
        const main = document.querySelector('main') || document.querySelector('#main-content');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
            main.setAttribute('aria-label', '主要内容区域');
        }
        
        const nav = document.querySelector('nav');
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', '主导航');
        }
        
        const aside = document.querySelector('aside');
        if (aside && !aside.getAttribute('role')) {
            aside.setAttribute('role', 'complementary');
            aside.setAttribute('aria-label', '侧边栏');
        }
        
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
            footer.setAttribute('aria-label', '页脚信息');
        }
    }

    // 设置通知系统
    setupAnnouncements() {
        if (!this.keyboardNavigation.announcements) return;
        
        // 监听页面变化并通知
        this.announcePageChanges();
        
        // 监听用户操作并通知
        this.announceUserActions();
    }

    // 通知页面变化
    announcePageChanges() {
        // 监听历史记录变化
        const originalPushState = history.pushState;
        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            setTimeout(() => {
                const title = document.title;
                window.accessibilityManager.announce(`页面已切换到：${title}`);
            }, 100);
        };
        
        // 监听模态框显示
        document.addEventListener('modalShow', (e) => {
            const modal = e.target;
            const title = modal.getAttribute('aria-label') || modal.querySelector('h1, h2, h3')?.textContent || '对话框';
            window.accessibilityManager.announce(`已打开${title}`, 'assertive');
        });
        
        document.addEventListener('modalHide', (e) => {
            window.accessibilityManager.announce('已关闭对话框');
        });
    }

    // 通知用户操作
    announceUserActions() {
        // 监听搜索
        const searchInputs = document.querySelectorAll('input[type="search"], #searchInput');
        searchInputs.forEach(input => {
            input.addEventListener('search', () => {
                const query = input.value;
                if (query) {
                    this.announce(`已搜索：${query}`);
                }
            });
        });
        
        // 监听视频播放
        document.addEventListener('videoPlay', (e) => {
            const video = e.detail;
            this.announce(`已开始播放：${video.title}`);
        });
        
        document.addEventListener('videoPause', (e) => {
            const video = e.detail;
            this.announce(`已暂停播放：${video.title}`);
        });
    }

    // 语音通知
    announce(message, priority = 'polite') {
        if (!this.keyboardNavigation.announcements) return;
        
        const region = priority === 'assertive' 
            ? document.getElementById('aria-urgent-region')
            : document.getElementById('aria-live-region');
        
        if (region) {
            region.textContent = message;
            
            // 清除消息
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
        
        // 语音合成
        if ('speechSynthesis' in window && this.preferences.voiceAnnouncements) {
            this.speak(message);
        }
    }

    // 语音合成
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.preferences.speechRate || 1;
            utterance.pitch = this.preferences.speechPitch || 1;
            
            speechSynthesis.speak(utterance);
        }
    }

    // 设置视觉辅助
    setupVisualAssistance() {
        this.applyHighContrast();
        this.adjustFontSize();
        this.setupColorBlindSupport();
        this.handleReducedMotion();
    }

    // 应用高对比度
    applyHighContrast() {
        if (!this.settings.highContrast) return;
        
        document.body.classList.add('high-contrast');
        
        // 添加高对比度样式
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast {
                --bg-color: #000000;
                --text-color: #ffffff;
                --link-color: #ffff00;
                --border-color: #ffffff;
                filter: contrast(150%);
            }
            
            .high-contrast * {
                background-color: var(--bg-color) !important;
                color: var(--text-color) !important;
                border-color: var(--border-color) !important;
            }
            
            .high-contrast a {
                color: var(--link-color) !important;
                text-decoration: underline !important;
            }
            
            .high-contrast button, .high-contrast input, .high-contrast select, .high-contrast textarea {
                border: 2px solid var(--border-color) !important;
            }
            
            .high-contrast .card-hover {
                border: 3px solid var(--border-color) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 调整字体大小
    adjustFontSize() {
        const size = this.settings.fontSize || 'medium';
        const scale = {
            small: 0.875,
            medium: 1,
            large: 1.25,
            'extra-large': 1.5
        };
        
        document.documentElement.style.fontSize = `${scale[size] || 1}rem`;
        document.body.setAttribute('data-font-size', size);
    }

    // 设置色盲支持
    setupColorBlindSupport() {
        if (!this.settings.colorBlindSupport) return;
        
        document.body.classList.add('color-blind-support');
        
        // 色盲友好的颜色方案
        const style = document.createElement('style');
        style.textContent = `
            .color-blind-support {
                /* 使用色盲友好的调色板 */
                --primary-color: #0173b2;
                --secondary-color: #de8f05;
                --accent-color: #029e73;
                --warning-color: #cc78bc;
                --error-color: #ca9161;
                --success-color: #949494;
            }
            
            .color-blind-support .gradient-text {
                background: linear-gradient(to right, var(--primary-color), var(--accent-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        `;
        document.head.appendChild(style);
    }

    // 处理减少动画
    handleReducedMotion() {
        if (this.settings.reducedMotion || this.visualAssist.reducedMotion) {
            document.body.classList.add('reduced-motion');
            
            // 禁用动画和过渡
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 设置焦点管理
    setupFocusManagement() {
        if (!this.focusManagement.visible) return;
        
        this.setupFocusIndicators();
        this.setupKeyboardNavigation();
    }

    // 设置焦点指示器
    setupFocusIndicators() {
        if (!this.focusManagement.outline) return;
        
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 3px solid var(--primary-color, #00ccff) !important;
                outline-offset: 2px !important;
                border-radius: 4px;
            }
            
            button:focus, 
            input:focus, 
            select:focus, 
            textarea:focus {
                box-shadow: 0 0 0 3px rgba(0, 204, 255, 0.3) !important;
            }
            
            .focus-visible {
                outline: 3px solid var(--primary-color, #00ccff) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 创建可访问性面板
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm hidden';
        
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">可访问性设置</h3>
                <button id="closeAccessibilityPanel" class="text-gray-400 hover:text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <!-- 键盘导航 -->
                <div class="flex items-center justify-between">
                    <label for="kbd-nav">键盘导航</label>
                    <input type="checkbox" id="kbd-nav" ${this.settings.keyboardNavigation ? 'checked' : ''}>
                </div>
                
                <!-- 屏幕阅读器 -->
                <div class="flex items-center justify-between">
                    <label for="screen-reader">屏幕阅读器支持</label>
                    <input type="checkbox" id="screen-reader" ${this.settings.screenReader ? 'checked' : ''}>
                </div>
                
                <!-- 高对比度 -->
                <div class="flex items-center justify-between">
                    <label for="high-contrast">高对比度</label>
                    <input type="checkbox" id="high-contrast" ${this.settings.highContrast ? 'checked' : ''}>
                </div>
                
                <!-- 字体大小 -->
                <div class="flex items-center justify-between">
                    <label for="font-size">字体大小</label>
                    <select id="font-size" class="bg-gray-700 text-white rounded px-2 py-1 text-sm">
                        <option value="small" ${this.settings.fontSize === 'small' ? 'selected' : ''}>小</option>
                        <option value="medium" ${this.settings.fontSize === 'medium' ? 'selected' : ''}>中</option>
                        <option value="large" ${this.settings.fontSize === 'large' ? 'selected' : ''}>大</option>
                        <option value="extra-large" ${this.settings.fontSize === 'extra-large' ? 'selected' : ''}>超大</option>
                    </select>
                </div>
                
                <!-- 色盲支持 -->
                <div class="flex items-center justify-between">
                    <label for="color-blind">色盲支持</label>
                    <input type="checkbox" id="color-blind" ${this.settings.colorBlindSupport ? 'checked' : ''}>
                </div>
                
                <!-- 减少动画 -->
                <div class="flex items-center justify-between">
                    <label for="reduced-motion">减少动画</label>
                    <input type="checkbox" id="reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''}>
                </div>
                
                <!-- 语音通知 -->
                <div class="flex items-center justify-between">
                    <label for="voice-announce">语音通知</label>
                    <input type="checkbox" id="voice-announce" ${this.preferences.voiceAnnouncements ? 'checked' : ''}>
                </div>
                
                <!-- 焦点指示器 -->
                <div class="flex items-center justify-between">
                    <label for="focus-indicators">焦点指示器</label>
                    <input type="checkbox" id="focus-indicators" ${this.settings.focusIndicators ? 'checked' : ''}>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-700">
                <button id="test-announcement" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                    测试通知
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupAccessibilityPanelEvents();
    }

    // 设置可访问性面板事件
    setupAccessibilityPanelEvents() {
        // 关闭面板
        document.getElementById('closeAccessibilityPanel').addEventListener('click', () => {
            this.closeAccessibilityPanel();
        });
        
        // 键盘导航
        document.getElementById('kbd-nav').addEventListener('change', (e) => {
            this.settings.keyboardNavigation = e.target.checked;
            this.saveSettings();
        });
        
        // 屏幕阅读器
        document.getElementById('screen-reader').addEventListener('change', (e) => {
            this.settings.screenReader = e.target.checked;
            this.saveSettings();
        });
        
        // 高对比度
        document.getElementById('high-contrast').addEventListener('change', (e) => {
            this.settings.highContrast = e.target.checked;
            this.applyHighContrast();
            this.saveSettings();
        });
        
        // 字体大小
        document.getElementById('font-size').addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            this.adjustFontSize();
            this.saveSettings();
        });
        
        // 色盲支持
        document.getElementById('color-blind').addEventListener('change', (e) => {
            this.settings.colorBlindSupport = e.target.checked;
            this.saveSettings();
            location.reload(); // 重新加载以应用色盲支持
        });
        
        // 减少动画
        document.getElementById('reduced-motion').addEventListener('change', (e) => {
            this.settings.reducedMotion = e.target.checked;
            this.handleReducedMotion();
            this.saveSettings();
        });
        
        // 语音通知
        document.getElementById('voice-announce').addEventListener('change', (e) => {
            this.preferences.voiceAnnouncements = e.target.checked;
            this.savePreferences();
        });
        
        // 焦点指示器
        document.getElementById('focus-indicators').addEventListener('change', (e) => {
            this.settings.focusIndicators = e.target.checked;
            this.saveSettings();
        });
        
        // 测试通知
        document.getElementById('test-announcement').addEventListener('click', () => {
            this.announce('这是一条可访问性测试通知');
            this.speak('这是一条语音测试');
        });
    }

    // 设置可访问性快捷键
    setupAccessibilityShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + A：打开可访问性面板
            if (e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                this.toggleAccessibilityPanel();
            }
        });
    }

    // 切换可访问性面板
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            
            if (!panel.classList.contains('hidden')) {
                // 聚焦到第一个控件
                const firstControl = panel.querySelector('input, select, button');
                if (firstControl) {
                    firstControl.focus();
                }
                this.announce('已打开可访问性设置面板');
            } else {
                this.announce('已关闭可访问性设置面板');
            }
        }
    }

    // 关闭可访问性面板
    closeAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.add('hidden');
            this.announce('已关闭可访问性设置面板');
        }
    }

    // 增强语义化HTML
    enhanceSemanticHTML() {
        this.addMissingSemantics();
        this.improveFormAccessibility();
        this.addTableAccessibility();
    }

    // 添加缺失的语义
    addMissingSemantics() {
        // 为视频容器添加语义
        const videoContainers = document.querySelectorAll('.video-card, .video-item');
        videoContainers.forEach(container => {
            if (!container.getAttribute('role')) {
                container.setAttribute('role', 'article');
            }
            
            // 添加视频描述
            const title = container.querySelector('h3, h4, .title');
            if (title && !title.getAttribute('aria-label')) {
                container.setAttribute('aria-label', title.textContent.trim());
            }
        });
        
        // 为播放器添加语义
        const player = document.querySelector('.player-container, #player');
        if (player && !player.getAttribute('role')) {
            player.setAttribute('role', 'application');
            player.setAttribute('aria-label', '视频播放器');
        }
    }

    // 改进表单可访问性
    improveFormAccessibility() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.getAttribute('aria-label') && !form.querySelector('h1, h2, h3')) {
                form.setAttribute('aria-label', '搜索表单');
            }
        });
        
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }
        });
    }

    // 添加表格可访问性
    addTableAccessibility() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.getAttribute('aria-label') && !table.querySelector('caption')) {
                table.setAttribute('aria-label', '数据表格');
            }
            
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                if (!header.getAttribute('scope')) {
                    const isRowHeader = header.closest('tr')?.previousElementSibling?.querySelector('th');
                    header.setAttribute('scope', isRowHeader ? 'row' : 'col');
                }
            });
        });
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('libretv-accessibility-settings', JSON.stringify(this.settings));
    }

    // 保存偏好
    savePreferences() {
        localStorage.setItem('libretv-accessibility-preferences', JSON.stringify(this.preferences));
    }

    // 获取可访问性状态
    getAccessibilityStatus() {
        return {
            settings: this.settings,
            preferences: this.preferences,
            keyboardNavigation: this.keyboardNavigation,
            screenReaderSupport: this.screenReaderSupport,
            visualAssist: this.visualAssist,
            focusManagement: this.focusManagement
        };
    }
}

// 创建全局可访问性管理器实例
window.AccessibilityManager = AccessibilityManager;
window.accessibilityManager = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityManager = new AccessibilityManager();
    });
} else {
    window.accessibilityManager = new AccessibilityManager();
}

// 导出可访问性管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}