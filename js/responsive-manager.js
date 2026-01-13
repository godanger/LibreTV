// 响应式布局管理器 - 为LibreTV提供智能响应式设计
class ResponsiveManager {
    constructor() {
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.breakpoints = {
            xs: 0,      // 超小屏幕 - 手机
            sm: 640,    // 小屏幕 - 大屏手机
            md: 768,    // 中等屏幕 - 平板
            lg: 1024,   // 大屏幕 - 小笔记本
            xl: 1280,   // 超大屏幕 - 笔记本
            '2xl': 1536 // 超大屏幕 - 桌面
        };
        this.deviceType = this.detectDeviceType();
        this.orientation = this.getOrientation();
        this.touchDevice = this.isTouchDevice();
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;
        
        this.init();
    }

    init() {
        console.log('[Responsive] 初始化响应式管理器');
        this.setupBreakpointListener();
        this.setupOrientationListener();
        this.setupResizeObserver();
        this.setupAdaptiveLayout();
        this.setupMobileOptimizations();
        this.setupSafeArea();
    }

    // 获取当前断点
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width >= 1536) return '2xl';
        if (width >= 1280) return 'xl';
        if (width >= 1024) return 'lg';
        if (width >= 768) return 'md';
        if (width >= 640) return 'sm';
        return 'xs';
    }

    // 检测设备类型
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;
        
        if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(userAgent)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        if (/macintosh|windows\sce|palm|hp-tablet|ipad|iphone|ipod|blackberry|android|windows\sphone|webos|tablet|sch-i800|playbook|android/i.test(userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }

    // 获取屏幕方向
    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    // 检测触摸设备
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // 设置断点监听
    setupBreakpointListener() {
        let resizeTimeout;
        
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                const newDeviceType = this.detectDeviceType();
                const newOrientation = this.getOrientation();
                
                if (newBreakpoint !== this.currentBreakpoint) {
                    console.log(`[Responsive] 断点变化: ${this.currentBreakpoint} -> ${newBreakpoint}`);
                    this.currentBreakpoint = newBreakpoint;
                    this.handleBreakpointChange(newBreakpoint);
                }
                
                if (newDeviceType !== this.deviceType) {
                    console.log(`[Responsive] 设备类型变化: ${this.deviceType} -> ${newDeviceType}`);
                    this.deviceType = newDeviceType;
                    this.handleDeviceTypeChange(newDeviceType);
                }
                
                if (newOrientation !== this.orientation) {
                    console.log(`[Responsive] 屏幕方向变化: ${this.orientation} -> ${newOrientation}`);
                    this.orientation = newOrientation;
                    this.handleOrientationChange(newOrientation);
                }
                
                this.lastWidth = window.innerWidth;
                this.lastHeight = window.innerHeight;
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
    }

    // 设置方向监听
    setupOrientationListener() {
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(() => {
                    this.handleOrientationChange(this.getOrientation());
                }, 100);
            });
        }
    }

    // 设置ResizeObserver
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { target, contentRect } = entry;
                    this.handleElementResize(target, contentRect);
                }
            });
            
            // 观察主要容器元素
            document.querySelectorAll('.container, .main-content, .video-grid').forEach(element => {
                observer.observe(element);
            });
        }
    }

    // 处理断点变化
    handleBreakpointChange(newBreakpoint) {
        document.documentElement.setAttribute('data-breakpoint', newBreakpoint);
        document.documentElement.setAttribute('data-device', this.deviceType);
        
        // 重新布局视频网格
        this.layoutVideoGrid();
        
        // 调整播放器布局
        this.adjustPlayerLayout();
        
        // 更新导航菜单
        this.updateNavigationMenu();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('breakpointchange', {
            detail: { breakpoint: newBreakpoint, deviceType: this.deviceType }
        }));
    }

    // 处理设备类型变化
    handleDeviceTypeChange(newDeviceType) {
        document.documentElement.setAttribute('data-device', newDeviceType);
        
        if (newDeviceType === 'mobile') {
            this.enableMobileOptimizations();
        } else {
            this.disableMobileOptimizations();
        }
    }

    // 处理屏幕方向变化
    handleOrientationChange(newOrientation) {
        document.documentElement.setAttribute('data-orientation', newOrientation);
        
        if (newOrientation === 'landscape') {
            this.enableLandscapeMode();
        } else {
            this.enablePortraitMode();
        }
    }

    // 处理元素大小变化
    handleElementResize(element, contentRect) {
        const { width, height } = contentRect;
        
        // 调整网格布局
        if (element.classList.contains('video-grid')) {
            this.calculateGridColumns(element, width);
        }
        
        // 调整播放器大小
        if (element.classList.contains('player-container')) {
            this.adjustPlayerAspectRatio(element, width, height);
        }
    }

    // 设置自适应布局
    setupAdaptiveLayout() {
        this.layoutVideoGrid();
        this.adjustPlayerLayout();
        this.setupGridSystem();
        this.setupFlexbox();
    }

    // 布局视频网格
    layoutVideoGrid() {
        const gridContainer = document.querySelector('.video-grid') || document.querySelector('#video-grid');
        if (!gridContainer) return;
        
        const containerWidth = gridContainer.offsetWidth;
        const breakpoint = this.currentBreakpoint;
        const orientation = this.orientation;
        
        let columns;
        if (breakpoint === 'xs') {
            columns = orientation === 'landscape' ? 3 : 2;
        } else if (breakpoint === 'sm') {
            columns = orientation === 'landscape' ? 4 : 3;
        } else if (breakpoint === 'md') {
            columns = orientation === 'landscape' ? 5 : 4;
        } else if (breakpoint === 'lg') {
            columns = orientation === 'landscape' ? 6 : 5;
        } else if (breakpoint === 'xl') {
            columns = orientation === 'landscape' ? 7 : 6;
        } else {
            columns = orientation === 'landscape' ? 8 : 7;
        }
        
        gridContainer.style.setProperty('--grid-columns', columns);
        this.calculateGridColumns(gridContainer, containerWidth);
    }

    // 计算网格列
    calculateGridColumns(container, containerWidth) {
        const columns = parseInt(getComputedStyle(container).getPropertyValue('--grid-columns')) || 4;
        const gap = 16; // 16px 间距
        const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
        
        container.querySelectorAll('.video-card').forEach(card => {
            card.style.width = `${columnWidth}px`;
        });
    }

    // 调整播放器布局
    adjustPlayerLayout() {
        const playerContainer = document.querySelector('.player-container');
        if (!playerContainer) return;
        
        const isMobile = this.deviceType === 'mobile';
        const isLandscape = this.orientation === 'landscape';
        
        if (isMobile && !isLandscape) {
            // 移动端竖屏模式 - 全屏播放器
            playerContainer.classList.add('mobile-fullscreen');
        } else {
            playerContainer.classList.remove('mobile-fullscreen');
        }
    }

    // 设置网格系统
    setupGridSystem() {
        const style = document.createElement('style');
        style.id = 'responsive-grid-system';
        style.textContent = `
            .responsive-grid {
                display: grid;
                gap: 1rem;
                grid-template-columns: repeat(var(--grid-columns, 4), 1fr);
            }
            
            .responsive-grid .video-card {
                min-width: 0;
                aspect-ratio: 16/9;
            }
            
            /* 响应式断点 */
            @media (max-width: 639px) {
                .responsive-grid {
                    --grid-columns: 2;
                    gap: 0.75rem;
                }
            }
            
            @media (min-width: 640px) and (max-width: 767px) {
                .responsive-grid {
                    --grid-columns: 3;
                }
            }
            
            @media (min-width: 768px) and (max-width: 1023px) {
                .responsive-grid {
                    --grid-columns: 4;
                }
            }
            
            @media (min-width: 1024px) and (max-width: 1279px) {
                .responsive-grid {
                    --grid-columns: 5;
                }
            }
            
            @media (min-width: 1280px) {
                .responsive-grid {
                    --grid-columns: 6;
                }
            }
            
            /* 触摸设备优化 */
            [data-device="mobile"] .video-card {
                padding: 0.5rem;
            }
            
            [data-device="mobile"] .video-card:hover {
                transform: none;
            }
            
            /* 横屏优化 */
            [data-orientation="landscape"] .video-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            /* 安全区域适配 */
            .safe-area-top {
                padding-top: env(safe-area-inset-top);
            }
            
            .safe-area-bottom {
                padding-bottom: env(safe-area-inset-bottom);
            }
            
            .safe-area-left {
                padding-left: env(safe-area-inset-left);
            }
            
            .safe-area-right {
                padding-right: env(safe-area-inset-right);
            }
        `;
        document.head.appendChild(style);
    }

    // 设置Flexbox
    setupFlexbox() {
        // 添加Flexbox工具类
        const flexContainer = document.querySelector('.flex-container');
        if (flexContainer) {
            flexContainer.classList.add('flex', 'flex-wrap', 'gap-4');
        }
    }

    // 设置移动端优化
    setupMobileOptimizations() {
        if (this.deviceType === 'mobile') {
            this.enableMobileOptimizations();
        }
    }

    // 启用移动端优化
    enableMobileOptimizations() {
        document.body.classList.add('mobile-device');
        
        // 移除悬停效果
        document.querySelectorAll('.card-hover').forEach(card => {
            card.style.transform = 'none';
        });
        
        // 优化触摸体验
        this.optimizeTouchTargets();
        
        // 调整字体大小
        this.adjustFontSizes();
        
        // 优化导航
        this.optimizeNavigation();
    }

    // 禁用移动端优化
    disableMobileOptimizations() {
        document.body.classList.remove('mobile-device');
    }

    // 优化触摸目标
    optimizeTouchTargets() {
        const minTouchSize = 44; // 44px 最小触摸目标
        document.querySelectorAll('button, .clickable').forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const minHeight = parseInt(computedStyle.minHeight) || 0;
            const minWidth = parseInt(computedStyle.minWidth) || 0;
            
            if (minHeight < minTouchSize || minWidth < minTouchSize) {
                element.style.minHeight = `${minTouchSize}px`;
                element.style.minWidth = `${minTouchSize}px`;
            }
        });
    }

    // 调整字体大小
    adjustFontSizes() {
        const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const scale = this.deviceType === 'mobile' ? 1.1 : 1;
        
        document.documentElement.style.fontSize = `${baseFontSize * scale}px`;
    }

    // 优化导航
    optimizeNavigation() {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.add('mobile-nav');
        }
    }

    // 设置安全区域
    setupSafeArea() {
        const hasSafeArea = CSS.supports('padding: env(safe-area-inset-top)');
        
        if (hasSafeArea) {
            document.documentElement.classList.add('has-safe-area');
            
            // 为iOS设备添加安全区域
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                document.body.classList.add('ios-device');
            }
        }
    }

    // 启用横屏模式
    enableLandscapeMode() {
        document.documentElement.setAttribute('data-layout', 'landscape');
        
        // 横屏时重新布局
        this.layoutVideoGrid();
        this.adjustPlayerLayout();
    }

    // 启用竖屏模式
    enablePortraitMode() {
        document.documentElement.setAttribute('data-layout', 'portrait');
        
        // 竖屏时重新布局
        this.layoutVideoGrid();
        this.adjustPlayerLayout();
    }

    // 更新导航菜单
    updateNavigationMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        const isMobile = this.deviceType === 'mobile';
        
        if (isMobile) {
            nav.classList.add('mobile-menu');
            this.createMobileMenu(nav);
        } else {
            nav.classList.remove('mobile-menu');
            this.removeMobileMenu(nav);
        }
    }

    // 创建移动菜单
    createMobileMenu(nav) {
        if (nav.querySelector('.mobile-menu-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle md:hidden p-2';
        toggle.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
        
        nav.insertBefore(toggle, nav.firstChild);
        
        toggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-menu-open');
        });
    }

    // 移除移动菜单
    removeMobileMenu(nav) {
        const toggle = nav.querySelector('.mobile-menu-toggle');
        if (toggle) {
            toggle.remove();
        }
        nav.classList.remove('mobile-menu-open');
    }

    // 获取当前响应式状态
    getResponsiveState() {
        return {
            breakpoint: this.currentBreakpoint,
            deviceType: this.deviceType,
            orientation: this.orientation,
            isTouchDevice: this.touchDevice,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            viewportWidth: document.documentElement.clientWidth,
            viewportHeight: document.documentElement.clientHeight
        };
    }

    // 检查断点
    isBreakpoint(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }

    // 检查是否小于断点
    isBelow(breakpoint) {
        const width = window.innerWidth;
        return width < this.breakpoints[breakpoint];
    }

    // 检查是否大于断点
    isAbove(breakpoint) {
        const width = window.innerWidth;
        return width > this.breakpoints[breakpoint];
    }

    // 检查是否在范围内
    isBetween(minBreakpoint, maxBreakpoint) {
        const width = window.innerWidth;
        const min = this.breakpoints[minBreakpoint];
        const max = this.breakpoints[maxBreakpoint];
        return width >= min && width < max;
    }

    // 手动触发重新布局
    triggerLayout() {
        this.handleBreakpointChange(this.currentBreakpoint);
        this.layoutVideoGrid();
        this.adjustPlayerLayout();
    }

    // 销毁响应式管理器
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        // 清理其他监听器
    }
}

// 创建全局响应式管理器实例
window.ResponsiveManager = ResponsiveManager;
window.responsiveManager = new ResponsiveManager();

// 导出响应式管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}