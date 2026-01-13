// 增强的PWA注册和初始化
class PWARegistrar {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('[PWA] 开始PWA初始化');
        
        // 检查PWA支持
        if (!this.isPWASupported()) {
            console.log('[PWA] 浏览器不支持PWA功能');
            return;
        }

        try {
            // 注册Service Worker
            await this.registerServiceWorker();
            
            // 等待Service Worker就绪
            await this.waitForServiceWorkerReady();
            
            // 初始化PWA管理器
            await this.initPWAManager();
            
            this.isInitialized = true;
            console.log('[PWA] PWA初始化完成');
            
        } catch (error) {
            console.error('[PWA] PWA初始化失败:', error);
        }
    }

    // 检查PWA支持
    isPWASupported() {
        return 'serviceWorker' in navigator && 'caches' in window;
    }

    // 注册Service Worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('[PWA] Service Worker注册成功:', registration.scope);
            
            // 监听Service Worker状态变化
            registration.addEventListener('updatefound', () => {
                console.log('[PWA] 发现新版本Service Worker');
            });
            
            return registration;
        } catch (error) {
            console.error('[PWA] Service Worker注册失败:', error);
            throw error;
        }
    }

    // 等待Service Worker就绪
    async waitForServiceWorkerReady() {
        if (navigator.serviceWorker.controller) {
            console.log('[PWA] Service Worker已就绪');
            return;
        }

        return new Promise((resolve) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[PWA] Service Worker控制器已更改');
                resolve();
            });
        });
    }

    // 初始化PWA管理器
    async initPWAManager() {
        // 确保PWA管理器已加载
        if (typeof window.PWAManager === 'undefined') {
            console.log('[PWA] PWA管理器未加载，等待...');
            await new Promise(resolve => {
                const checkManager = () => {
                    if (typeof window.PWAManager !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkManager, 100);
                    }
                };
                checkManager();
            });
        }

        // 创建PWA管理器实例
        if (!window.pwaManager) {
            window.pwaManager = new window.PWAManager();
        }
    }

    // 检查是否为PWA模式
    isPWAMode() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.matchMedia('(display-mode: fullscreen)').matches ||
               window.matchMedia('(display-mode: window-controls-overlay)').matches ||
               (window.navigator && 'standalone' in window.navigator && window.navigator.standalone);
    }

    // 获取安装状态
    getInstallStatus() {
        return {
            isInstalled: this.isPWAMode(),
            canInstall: this.canInstallPWA(),
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            isDesktop: !/iPad|iPhone|iPod|Android/.test(navigator.userAgent)
        };
    }

    // 检查是否可以安装PWA
    canInstallPWA() {
        return 'serviceWorker' in navigator && 
               'BeforeInstallPromptEvent' in window;
    }

    // 获取设备信息
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        return {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /Android/.test(userAgent),
            isMobile: /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent),
            isDesktop: !/iPad|iPhone|iPod|Android/.test(userAgent),
            isChrome: /Chrome/.test(userAgent),
            isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            isFirefox: /Firefox/.test(userAgent),
            isEdge: /Edg/.test(userAgent),
            platform: navigator.platform,
            language: navigator.language
        };
    }

    // 初始化触摸手势支持
    initTouchGestures() {
        if (!this.isPWAMode()) return;

        // 阻止默认的触摸行为
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // 阻止多点触摸
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault(); // 阻止缩放手势
            }
        }, { passive: false });

        // 添加导航手势
        this.initNavigationGestures();
    }

    // 初始化导航手势
    initNavigationGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = true;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipeGesture) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // 检测水平滑动
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // 向左滑动 - 可以实现类似前进的功能
                    this.handleSwipeLeft();
                } else {
                    // 向右滑动 - 可以实现类似后退的功能
                    this.handleSwipeRight();
                }
                isSwipeGesture = false;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            isSwipeGesture = false;
        }, { passive: true });
    }

    // 处理向左滑动
    handleSwipeLeft() {
        // 可以实现播放列表前进等功能
        console.log('[PWA] 用户向左滑动');
    }

    // 处理向右滑动
    handleSwipeRight() {
        // 可以实现返回等功能
        console.log('[PWA] 用户向右滑动');
    }

    // 初始化键盘快捷键支持
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 只在PWA模式下启用
            if (!this.isPWAMode()) return;

            // Ctrl/Cmd + Shift + I: 打开开发者工具（仅在开发模式）
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    e.preventDefault();
                    console.log('[PWA] 开发模式：打开开发者工具');
                    // 可以添加其他开发工具快捷键
                }
            }

            // F11: 切换全屏模式
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }

            // ESC: 退出全屏或关闭模态框
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        });
    }

    // 切换全屏模式
    async toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('[PWA] 全屏切换失败:', error);
        }
    }

    // 初始化性能监控
    initPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // 监控首次内容绘制
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'paint') {
                        console.log(`[PWA] 性能指标 - ${entry.name}: ${entry.startTime}ms`);
                    }
                });
            });
            
            try {
                observer.observe({ entryTypes: ['paint'] });
            } catch (error) {
                console.log('[PWA] 性能监控不支持paint类型');
            }
        }
    }

    // 初始化错误处理
    initErrorHandling() {
        // 全局错误处理
        window.addEventListener('error', (e) => {
            console.error('[PWA] 全局错误:', e.error);
            // 可以添加错误上报逻辑
        });

        // Promise拒绝错误处理
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[PWA] 未处理的Promise拒绝:', e.reason);
            // 可以添加错误上报逻辑
        });
    }
}

// 创建全局PWA注册器实例
window.PWARegistrar = PWARegistrar;
window.pwaRegistrar = new PWARegistrar();

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaRegistrar.init();
    });
} else {
    window.pwaRegistrar.init();
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('[PWA] 页面变为可见');
        // 可以检查更新等
    } else {
        console.log('[PWA] 页面变为隐藏');
        // 可以暂停视频播放等
    }
});
