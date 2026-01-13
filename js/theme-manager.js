// 主题管理器 - 为LibreTV提供多主题支持
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'cyberpunk';
        this.themes = {
            cyberpunk: {
                name: '赛博朋克',
                colors: {
                    primary: '#00ccff',
                    primaryLight: '#33d6ff',
                    secondary: '#0f1622',
                    accent: '#ff3c78',
                    text: '#e6f2ff',
                    textMuted: '#8599b2',
                    border: 'rgba(0, 204, 255, 0.15)',
                    pageStart: '#0f1622',
                    pageEnd: '#192231',
                    cardStart: '#121b29',
                    cardEnd: '#1c2939',
                    cardAccent: 'rgba(0, 204, 255, 0.12)',
                    cardHover: 'rgba(0, 204, 255, 0.5)',
                    success: '#00ff88',
                    warning: '#ffaa00',
                    error: '#ff4444',
                    info: '#00ccff'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: true,
                animated: true
            },
            dark: {
                name: '深邃黑',
                colors: {
                    primary: '#4a90e2',
                    primaryLight: '#6ba3e7',
                    secondary: '#1a1a1a',
                    accent: '#e74c3c',
                    text: '#ffffff',
                    textMuted: '#b0b0b0',
                    border: 'rgba(74, 144, 226, 0.2)',
                    pageStart: '#0a0a0a',
                    pageEnd: '#1a1a1a',
                    cardStart: '#252525',
                    cardEnd: '#2d2d2d',
                    cardAccent: 'rgba(74, 144, 226, 0.1)',
                    cardHover: 'rgba(74, 144, 226, 0.3)',
                    success: '#2ecc71',
                    warning: '#f39c12',
                    error: '#e74c3c',
                    info: '#3498db'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: false,
                animated: true
            },
            light: {
                name: '清新白',
                colors: {
                    primary: '#3498db',
                    primaryLight: '#5dade2',
                    secondary: '#ffffff',
                    accent: '#e74c3c',
                    text: '#2c3e50',
                    textMuted: '#7f8c8d',
                    border: 'rgba(52, 152, 219, 0.2)',
                    pageStart: '#f8f9fa',
                    pageEnd: '#e9ecef',
                    cardStart: '#ffffff',
                    cardEnd: '#f8f9fa',
                    cardAccent: 'rgba(52, 152, 219, 0.05)',
                    cardHover: 'rgba(52, 152, 219, 0.2)',
                    success: '#27ae60',
                    warning: '#f39c12',
                    error: '#c0392b',
                    info: '#3498db'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: false,
                animated: false
            },
            neon: {
                name: '霓虹灯',
                colors: {
                    primary: '#00ff41',
                    primaryLight: '#33ff66',
                    secondary: '#000000',
                    accent: '#ff0080',
                    text: '#ffffff',
                    textMuted: '#cccccc',
                    border: 'rgba(0, 255, 65, 0.3)',
                    pageStart: '#000000',
                    pageEnd: '#0d0d0d',
                    cardStart: '#0a0a0a',
                    cardEnd: '#1a1a1a',
                    cardAccent: 'rgba(0, 255, 65, 0.1)',
                    cardHover: 'rgba(0, 255, 65, 0.4)',
                    success: '#00ff41',
                    warning: '#ffaa00',
                    error: '#ff0080',
                    info: '#00ffff'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: true,
                animated: true
            },
            ocean: {
                name: '海洋蓝',
                colors: {
                    primary: '#0066cc',
                    primaryLight: '#3385d6',
                    secondary: '#0a1929',
                    accent: '#00d4aa',
                    text: '#e8f4fd',
                    textMuted: '#8fb3d9',
                    border: 'rgba(0, 102, 204, 0.2)',
                    pageStart: '#0a1929',
                    pageEnd: '#1a2f3d',
                    cardStart: '#12263a',
                    cardEnd: '#1e3a52',
                    cardAccent: 'rgba(0, 102, 204, 0.1)',
                    cardHover: 'rgba(0, 102, 204, 0.3)',
                    success: '#00d4aa',
                    warning: '#ffa500',
                    error: '#ff6b6b',
                    info: '#4ecdc4'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: true,
                animated: true
            },
            sunset: {
                name: '日落橙',
                colors: {
                    primary: '#ff6b35',
                    primaryLight: '#ff8c65',
                    secondary: '#2c1810',
                    accent: '#f7931e',
                    text: '#fff5e6',
                    textMuted: '#d4b896',
                    border: 'rgba(255, 107, 53, 0.2)',
                    pageStart: '#2c1810',
                    pageEnd: '#4a2c2a',
                    cardStart: '#3d2417',
                    cardEnd: '#5a3d33',
                    cardAccent: 'rgba(255, 107, 53, 0.1)',
                    cardHover: 'rgba(255, 107, 53, 0.3)',
                    success: '#ff9f43',
                    warning: '#feca57',
                    error: '#ee5a52',
                    info: '#ff6348'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: false,
                animated: true
            },
            purple: {
                name: '紫罗兰',
                colors: {
                    primary: '#8b5cf6',
                    primaryLight: '#a78bfa',
                    secondary: '#1a0b2e',
                    accent: '#ec4899',
                    text: '#f3f4f6',
                    textMuted: '#d1d5db',
                    border: 'rgba(139, 92, 246, 0.2)',
                    pageStart: '#1a0b2e',
                    pageEnd: '#2d1b69',
                    cardStart: '#25183e',
                    cardEnd: '#3b1b5a',
                    cardAccent: 'rgba(139, 92, 246, 0.1)',
                    cardHover: 'rgba(139, 92, 246, 0.3)',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#06b6d4'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: true,
                animated: true
            },
            forest: {
                name: '森林绿',
                colors: {
                    primary: '#059669',
                    primaryLight: '#10b981',
                    secondary: '#064e3b',
                    accent: '#f59e0b',
                    text: '#ecfdf5',
                    textMuted: '#a7f3d0',
                    border: 'rgba(5, 150, 105, 0.2)',
                    pageStart: '#064e3b',
                    pageEnd: '#065f46',
                    cardStart: '#0f3d2e',
                    cardEnd: '#1a5d47',
                    cardAccent: 'rgba(5, 150, 105, 0.1)',
                    cardHover: 'rgba(5, 150, 105, 0.3)',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#dc2626',
                    info: '#06b6d4'
                },
                background: 'linear-gradient(180deg, var(--page-start), var(--page-end))',
                dots: false,
                animated: true
            }
        };
        
        this.init();
    }

    init() {
        console.log('[Theme] 初始化主题管理器');
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.detectSystemTheme();
        this.setupThemeTransition();
    }

    // 获取存储的主题
    getStoredTheme() {
        return localStorage.getItem('libretv-theme');
    }

    // 存储主题
    setStoredTheme(theme) {
        localStorage.setItem('libretv-theme', theme);
    }

    // 应用主题
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`[Theme] 主题 "${themeName}" 不存在，使用默认主题`);
            themeName = 'cyberpunk';
        }

        const theme = this.themes[themeName];
        this.currentTheme = themeName;
        this.setStoredTheme(themeName);

        // 创建或更新CSS变量
        this.updateCSSVariables(theme);
        
        // 更新HTML类名
        document.documentElement.setAttribute('data-theme', themeName);
        
        // 添加工具提示
        this.updateThemeHints(theme);

        console.log(`[Theme] 已应用主题: ${theme.name}`);
    }

    // 更新CSS变量
    updateCSSVariables(theme) {
        const root = document.documentElement;
        
        // 主色调
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--primary-light', theme.colors.primaryLight);
        root.style.setProperty('--secondary-color', theme.colors.secondary);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--text-color', theme.colors.text);
        root.style.setProperty('--text-muted', theme.colors.textMuted);
        root.style.setProperty('--border-color', theme.colors.border);
        
        // 背景渐变
        root.style.setProperty('--page-gradient-start', theme.colors.pageStart);
        root.style.setProperty('--page-gradient-end', theme.colors.pageEnd);
        
        // 卡片
        root.style.setProperty('--card-gradient-start', theme.colors.cardStart);
        root.style.setProperty('--card-gradient-end', theme.colors.cardEnd);
        root.style.setProperty('--card-accent', theme.colors.cardAccent);
        root.style.setProperty('--card-hover-border', theme.colors.cardHover);
        
        // 状态颜色
        root.style.setProperty('--success-color', theme.colors.success);
        root.style.setProperty('--warning-color', theme.colors.warning);
        root.style.setProperty('--error-color', theme.colors.error);
        root.style.setProperty('--info-color', theme.colors.info);
        
        // 动画控制
        if (theme.animated) {
            document.body.classList.add('theme-animated');
        } else {
            document.body.classList.remove('theme-animated');
        }
    }

    // 更新主题提示
    updateThemeHints(theme) {
        const themeButton = document.getElementById('theme-toggle-button');
        if (themeButton) {
            themeButton.title = `当前主题: ${theme.name}`;
        }
    }

    // 切换到下一个主题
    nextTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextThemeName = themeNames[nextIndex];
        
        this.applyTheme(nextThemeName);
        this.showThemeChangeNotification(this.themes[nextThemeName].name);
        
        return nextThemeName;
    }

    // 切换到上一个主题
    prevTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const prevIndex = currentIndex === 0 ? themeNames.length - 1 : currentIndex - 1;
        const prevThemeName = themeNames[prevIndex];
        
        this.applyTheme(prevThemeName);
        this.showThemeChangeNotification(this.themes[prevThemeName].name);
        
        return prevThemeName;
    }

    // 显示主题切换通知
    showThemeChangeNotification(themeName) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 bg-blue-600 text-white';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                </svg>
                <span class="font-medium">已切换到主题: ${themeName}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 设置主题切换按钮
    setupThemeToggle() {
        // 创建主题切换按钮
        this.createThemeToggleButton();
        
        // 设置快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.nextTheme();
            }
        });
    }

    // 创建主题切换按钮
    createThemeToggleButton() {
        // 检查是否已存在按钮
        if (document.getElementById('theme-toggle-button')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'theme-toggle-button';
        button.className = 'fixed top-4 left-20 z-10 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-white rounded-lg px-3 py-1.5 transition-colors';
        button.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
            </svg>
        `;
        button.title = `切换主题 (Ctrl+Shift+T)`;
        button.onclick = () => this.showThemeSelector();

        document.body.appendChild(button);
    }

    // 显示主题选择器
    showThemeSelector() {
        // 关闭现有选择器
        const existingSelector = document.getElementById('theme-selector');
        if (existingSelector) {
            existingSelector.remove();
        }

        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.className = 'fixed top-16 left-20 z-40 bg-[#222] border border-[#333] rounded-lg p-4 shadow-xl max-w-sm';
        selector.innerHTML = `
            <div class="text-white mb-3">
                <h3 class="font-semibold text-sm mb-2">选择主题</h3>
                <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    ${Object.entries(this.themes).map(([key, theme]) => `
                        <button 
                            onclick="window.themeManager.selectTheme('${key}')"
                            class="theme-option p-2 rounded text-xs transition-colors ${key === this.currentTheme ? 'bg-blue-600 text-white' : 'bg-[#333] hover:bg-[#444] text-gray-300'}"
                            style="border-left: 3px solid ${theme.colors.primary}"
                        >
                            ${theme.name}
                        </button>
                    `).join('')}
                </div>
                <div class="mt-3 pt-2 border-t border-[#444]">
                    <button onclick="window.themeManager.randomTheme()" class="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded transition-colors">
                        🎲 随机主题
                    </button>
                </div>
            </div>
        `;

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target) && e.target.id !== 'theme-toggle-button') {
                selector.remove();
            }
        }, { once: true });

        document.body.appendChild(selector);
    }

    // 选择主题
    selectTheme(themeName) {
        this.applyTheme(themeName);
        this.showThemeChangeNotification(this.themes[themeName].name);
        
        // 关闭选择器
        const selector = document.getElementById('theme-selector');
        if (selector) {
            selector.remove();
        }
    }

    // 随机主题
    randomTheme() {
        const themeNames = Object.keys(this.themes).filter(name => name !== this.currentTheme);
        const randomName = themeNames[Math.floor(Math.random() * themeNames.length)];
        this.selectTheme(randomName);
    }

    // 检测系统主题偏好
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // 系统偏好深色主题
            if (!this.getStoredTheme()) {
                this.applyTheme('dark');
            }
        }

        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // 设置主题过渡效果
    setupThemeTransition() {
        // 添加CSS过渡效果
        const style = document.createElement('style');
        style.textContent = `
            .theme-animated * {
                transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
            }
            
            .theme-transition {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            [data-theme] {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
    }

    // 获取当前主题信息
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            data: this.themes[this.currentTheme]
        };
    }

    // 获取所有主题
    getAllThemes() {
        return Object.entries(this.themes).map(([key, theme]) => ({
            key,
            name: theme.name,
            colors: theme.colors
        }));
    }

    // 检查是否为暗色主题
    isDarkTheme() {
        const darkThemes = ['cyberpunk', 'dark', 'neon', 'ocean', 'purple', 'forest'];
        return darkThemes.includes(this.currentTheme);
    }

    // 获取主题对比度
    getContrastRatio(color1, color2) {
        // 简化的对比度计算
        return this.calculateLuminance(color1) > this.calculateLuminance(color2) ? 'light' : 'dark';
    }

    // 计算亮度（简化版）
    calculateLuminance(color) {
        // 这里应该实现真实的颜色亮度计算
        // 暂时返回固定值
        return 0.5;
    }
}

// 创建全局主题管理器实例
window.ThemeManager = ThemeManager;
window.themeManager = new ThemeManager();

// 导出主题管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}