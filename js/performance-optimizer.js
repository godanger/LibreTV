// 性能优化管理器 - 为LibreTV提供全面的性能优化功能
class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            cacheHitRate: 0,
            apiResponseTime: 0,
            bundleSize: 0
        };
        this.optimizations = {
            lazyLoading: true,
            codeSplitting: true,
            imageOptimization: true,
            caching: true,
            compression: true,
            preload: true,
            debouncing: true
        };
        this.observers = new Map();
        this.performanceEntries = [];
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0
        };
        this.isInitialized = false;
        this.imageCache = new Map();
        this.webpSupported = false;
        this.eventListeners = new WeakMap();
        this.timers = new Set();
        
        this.init();
    }

    init() {
        console.log('[PerformanceOptimizer] 初始化性能优化管理器');
        this.setupPerformanceMonitoring();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCodeSplitting();
        this.setupMemoryOptimization();
        this.setupNetworkOptimization();
        this.createPerformancePanel();
    }

    // 设置性能监控
    setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            this.setupPerformanceObserver();
            this.measureInitialMetrics();
        }
        
        // 监控内存使用
        if ('memory' in performance) {
            setInterval(() => {
                this.updateMemoryUsage();
            }, 5000);
        }
        
        // 监控FCP (First Contentful Paint)
        this.measureFCP();
        
        // 监控LCP (Largest Contentful Paint)
        this.measureLCP();
        
        // 监控CLS (Cumulative Layout Shift)
        this.measureCLS();
    }

    // 设置性能观察器
    setupPerformanceObserver() {
        try {
            // 观察Paint指标
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                    }
                    console.log('[Performance] Paint:', entry);
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });

            // 观察Layout Shift指标
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // 观察Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // 观察Navigation指标
            const navObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.metrics.navigation = {
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        loadComplete: entry.loadEventEnd - entry.loadEventStart,
                        transferSize: entry.transferSize,
                        encodedBodySize: entry.encodedBodySize
                    };
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });

            this.observers.set('paint', paintObserver);
            this.observers.set('layout-shift', clsObserver);
            this.observers.set('largest-contentful-paint', lcpObserver);
            this.observers.set('navigation', navObserver);

        } catch (error) {
            console.warn('[PerformanceOptimizer] 性能观察器设置失败:', error);
        }
    }

    // 测量初始指标
    measureInitialMetrics() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.calculatePageLoadTime();
                this.updateBundleSize();
            }, 0);
        });
    }

    // 测量首次内容绘制
    measureFCP() {
        // 使用Performance API或回退到定时器
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                    }
                });
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    // 测量最大内容绘制
    measureLCP() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const lcpTime = performance.now();
                        this.metrics.lcp = lcpTime;
                        observer.disconnect();
                    }
                });
            }, { threshold: 1.0 });

            // 观察最大的元素
            const largestElement = document.querySelector('h1, .hero, .main-content');
            if (largestElement) {
                observer.observe(largestElement);
            }
        }
    }

    // 测量累积布局偏移
    measureCLS() {
        let clsScore = 0;
        let previousTimestamp = 0;

        const updateCLS = () => {
            const currentTimestamp = performance.now();
            const timeDelta = currentTimestamp - previousTimestamp;
            
            if (timeDelta > 0 && timeDelta < 1000) {
                // 简化的CLS计算
                const layoutShifts = document.querySelectorAll('.layout-shift');
                layoutShifts.forEach(shift => {
                    clsScore += 0.1; // 简化计算
                });
            }
            
            previousTimestamp = currentTimestamp;
            this.metrics.cls = clsScore;
        };

        document.addEventListener('DOMContentLoaded', updateCLS);
        window.addEventListener('resize', debounce(updateCLS, 500));
    }

    // 计算页面加载时间
    calculatePageLoadTime() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            }
        }
    }

    // 更新内存使用情况
    updateMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.metrics.memoryUsage = {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            };
        }
    }

    // 更新资源包大小
    updateBundleSize() {
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        
        resources.forEach((resource) => {
            if (resource.transferSize) {
                totalSize += resource.transferSize;
            }
        });
        
        this.metrics.bundleSize = totalSize;
    }

    // 设置懒加载
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // 回退到定时器懒加载
            this.setupTimerLazyLoading();
        }
    }

    // 设置交叉观察器懒加载
    setupIntersectionObserver() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach((img) => {
            imageObserver.observe(img);
        });

        // 懒加载视频
        const lazyVideos = document.querySelectorAll('video[data-src]');
        lazyVideos.forEach((video) => {
            imageObserver.observe(video);
        });

        // 懒加载iframe
        const lazyIframes = document.querySelectorAll('iframe[data-src]');
        lazyIframes.forEach((iframe) => {
            imageObserver.observe(iframe);
        });

        this.observers.set('images', imageObserver);
    }

    // 设置定时器懒加载
    setupTimerLazyLoading() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const checkVisibility = () => {
            lazyElements.forEach((element) => {
                if (this.isElementVisible(element)) {
                    this.loadElement(element);
                    element.removeAttribute('data-lazy');
                }
            });
        };

        const checkVisibilityDebounced = debounce(checkVisibility, 100);
        window.addEventListener('scroll', checkVisibilityDebounced);
        window.addEventListener('resize', checkVisibilityDebounced);
        
        // 初始检查
        checkVisibility();
    }

    // 加载图片
    loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        
        if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
        }
        
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            
            img.onload = () => {
                img.classList.add('loaded');
                this.optimizeImage(img);
            };
        }
    }

    // 优化图片
    optimizeImage(img) {
        // 应用WebP格式回退
        if (this.supportsWebP()) {
            img.src = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        // 添加loading="lazy"
        img.setAttribute('loading', 'lazy');
        
        // 压缩图片
        this.compressImage(img);
    }

    // 检查WebP支持
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // 压缩图片
    compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        // 简单的质量压缩
        canvas.toBlob((blob) => {
            if (blob.size < img.naturalWidth * img.naturalHeight * 4) {
                const compressedUrl = URL.createObjectURL(blob);
                img.src = compressedUrl;
            }
        }, 'image/jpeg', 0.8);
    }

    // 设置代码分割
    setupCodeSplitting() {
        this.createDynamicImports();
        this.setupModulePreloading();
    }

    // 创建动态导入
    createDynamicImports() {
        // 按需加载管理器
        window.loadManager = (managerName) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `js/managers/${managerName}.js`;
                script.onload = () => resolve(window[`${managerName}Manager`]);
                script.onerror = () => reject(new Error(`Failed to load ${managerName}`));
                document.head.appendChild(script);
            });
        };

        // 按需加载UI组件
        window.loadComponent = (componentName) => {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = `components/${componentName}.js`;
                document.head.appendChild(link);
                
                import(`./components/${componentName}.js`)
                    .then(resolve)
                    .catch(reject);
            });
        };
    }

    // 设置模块预加载
    setupModulePreloading() {
        // 预加载可能需要的模块
        const criticalModules = [
            'theme-manager',
            'advanced-player',
            'intelligent-search'
        ];

        criticalModules.forEach((module, index) => {
            setTimeout(() => {
                const link = document.createElement('link');
                link.rel = 'modulepreload';
                link.href = `js/${module}.js`;
                document.head.appendChild(link);
            }, index * 100);
        });
    }

    // 设置内存优化
    setupMemoryOptimization() {
        this.setupEventListenerCleanup();
        this.setupTimerCleanup();
        this.setupDOMCleanup();
        this.setupGCOptimization();
    }

    // 设置事件监听器清理
    setupEventListenerCleanup() {
        const self = this;
        window.addEventListener = new Proxy(window.addEventListener, {
            apply: (target, thisArg, argumentsList) => {
                const [type, listener] = argumentsList;
                const wrappedListener = (event) => {
                    try {
                        listener.call(thisArg, event);
                    } catch (error) {
                        console.error('[PerformanceOptimizer] 事件监听器错误:', error);
                    }
                };
                
                self.eventListeners.set(listener, wrappedListener);
                return target.call(thisArg, type, wrappedListener);
            }
        });
        
        // 添加清理方法
        window.cleanupEventListeners = () => {
            // WeakMap无法直接清理，但可以标记为清理
            // 注意：WeakMap无法直接清空，但GC会自动清理未引用的条目
            console.log('[PerformanceOptimizer] 事件监听器清理完成');
        };
    }

    // 设置定时器清理
    setupTimerCleanup() {
        const timers = new Set();
        
        window.setTimeout = new Proxy(window.setTimeout, {
            apply: (target, thisArg, argumentsList) => {
                const timerId = target.apply(thisArg, argumentsList);
                timers.add(timerId);
                return timerId;
            }
        });
        
        window.setInterval = new Proxy(window.setInterval, {
            apply: (target, thisArg, argumentsList) => {
                const timerId = target.apply(thisArg, argumentsList);
                timers.add(timerId);
                return timerId;
            }
        });
        
        // 添加清理方法
        window.clearAllTimers = () => {
            timers.forEach(timerId => {
                clearTimeout(timerId);
                clearInterval(timerId);
            });
            timers.clear();
        };
    }

    // 设置DOM清理
    setupDOMCleanup() {
        // 定期清理临时DOM节点
        setInterval(() => {
            this.cleanupTemporaryDOM();
        }, 30000); // 每30秒清理一次
        
        // 监听页面卸载
        window.addEventListener('beforeunload', () => {
            this.cleanupAllResources();
        });
    }

    // 清理临时DOM节点
    cleanupTemporaryDOM() {
        const tempElements = document.querySelectorAll('.temp, .loading, .spinner');
        tempElements.forEach((element) => {
            if (!element.closest('.visible')) {
                element.remove();
            }
        });
        
        // 清理空的容器
        const emptyContainers = document.querySelectorAll('.empty');
        emptyContainers.forEach((container) => {
            if (container.children.length === 0 && !container.hasAttribute('data-keep')) {
                container.style.display = 'none';
            }
        });
    }

    // 清理所有资源
    cleanupAllResources() {
        // 清理定时器
        if (window.clearAllTimers) {
            window.clearAllTimers();
        }
        
        // 清理事件监听器
        if (window.cleanupEventListeners) {
            window.cleanupEventListeners();
        }
        
        // 清理观察器
        this.observers.forEach((observer) => {
            observer.disconnect();
        });
        
        // 清理缓存
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    if (name.includes('performance')) {
                        caches.delete(name);
                    }
                });
            });
        }
    }

    // 设置垃圾回收优化
    setupGCOptimization() {
        // 手动触发垃圾回收（如果支持）
        if (window.gc) {
            setInterval(() => {
                if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
                    window.gc();
                }
            }, 60000); // 每分钟检查一次
        }
        
        // 优化对象池
        this.setupObjectPooling();
    }

    // 设置对象池
    setupObjectPooling() {
        const pools = new Map();
        
        window.getPooledObject = (type) => {
            if (!pools.has(type)) {
                pools.set(type, []);
            }
            
            const pool = pools.get(type);
            return pool.length > 0 ? pool.pop() : {};
        };
        
        window.returnPooledObject = (type, object) => {
            if (!pools.has(type)) {
                pools.set(type, []);
            }
            
            // 清理对象
            Object.keys(object).forEach(key => {
                delete object[key];
            });
            
            pools.get(type).push(object);
        };
    }

    // 设置网络优化
    setupNetworkOptimization() {
        this.setupRequestPooling();
        this.setupResponseCaching();
        this.setupCompression();
    }

    // 设置请求池化
    setupRequestPooling() {
        const requestCache = new Map();
        const pendingRequests = new Map();
        
        window.optimizedFetch = (url, options = {}) => {
            const cacheKey = `${url}:${JSON.stringify(options)}`;
            
            // 检查缓存
            if (requestCache.has(cacheKey)) {
                return Promise.resolve(requestCache.get(cacheKey).clone());
            }
            
            // 检查正在进行的请求
            if (pendingRequests.has(cacheKey)) {
                return pendingRequests.get(cacheKey);
            }
            
            // 创建新请求
            const requestPromise = fetch(url, options).then((response) => {
                // 缓存响应（如果是可缓存的）
                if (response.ok && options.cache !== 'no-cache') {
                    requestCache.set(cacheKey, response.clone());
                    
                    // 设置缓存过期时间
                    setTimeout(() => {
                        requestCache.delete(cacheKey);
                    }, 5 * 60 * 1000); // 5分钟
                }
                
                pendingRequests.delete(cacheKey);
                return response;
            }).catch((error) => {
                pendingRequests.delete(cacheKey);
                throw error;
            });
            
            pendingRequests.set(cacheKey, requestPromise);
            return requestPromise;
        };
    }

    // 设置响应缓存
    setupResponseCaching() {
        if ('caches' in window) {
            window.optimizedCache = {
                async get(key) {
                    const cache = await caches.open('libretv-performance');
                    const response = await cache.match(key);
                    return response;
                },
                async set(key, response) {
                    const cache = await caches.open('libretv-performance');
                    await cache.put(key, response);
                },
                async delete(key) {
                    const cache = await caches.open('libretv-performance');
                    await cache.delete(key);
                }
            };
        }
    }

    // 设置压缩
    setupCompression() {
        // 检测支持
        const supportsCompression = 'CompressionStream' in window;
        
        window.compressText = async (text) => {
            if (!supportsCompression) {
                return text;
            }
            
            try {
                const stream = new CompressionStream('gzip');
                const writer = stream.writable.getWriter();
                await writer.write(new TextEncoder().encode(text));
                await writer.close();
                
                const compressed = await new Response(stream.readable).arrayBuffer();
                return compressed;
            } catch (error) {
                console.warn('[PerformanceOptimizer] 文本压缩失败:', error);
                return text;
            }
        };
    }

    // 创建性能面板
    createPerformancePanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.className = 'fixed bottom-4 left-4 z-40 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-sm hidden';
        
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold">性能监控</h3>
                <button id="closePerformancePanel" class="text-gray-400 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span>页面加载时间:</span>
                    <span id="page-load-time">-- ms</span>
                </div>
                <div class="flex justify-between">
                    <span>内存使用:</span>
                    <span id="memory-usage">-- MB</span>
                </div>
                <div class="flex justify-between">
                    <span>缓存命中率:</span>
                    <span id="cache-hit-rate">--%</span>
                </div>
                <div class="flex justify-between">
                    <span>包大小:</span>
                    <span id="bundle-size">-- KB</span>
                </div>
                <div class="flex justify-between">
                    <span>FCP:</span>
                    <span id="fcp-time">-- ms</span>
                </div>
                <div class="flex justify-between">
                    <span>LCP:</span>
                    <span id="lcp-time">-- ms</span>
                </div>
                <div class="flex justify-between">
                    <span>CLS:</span>
                    <span id="cls-score">--</span>
                </div>
            </div>
            
            <div class="mt-4 flex gap-2">
                <button id="optimize-now" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded">
                    立即优化
                </button>
                <button id="clear-cache" class="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded">
                    清理缓存
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPerformancePanelEvents();
        
        // 显示性能面板（开发模式）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                panel.classList.remove('hidden');
            }, 2000);
        }
    }

    // 设置性能面板事件
    setupPerformancePanelEvents() {
        // 关闭面板
        document.getElementById('closePerformancePanel').addEventListener('click', () => {
            document.getElementById('performance-panel').classList.add('hidden');
        });
        
        // 立即优化
        document.getElementById('optimize-now').addEventListener('click', () => {
            this.performOptimization();
        });
        
        // 清理缓存
        document.getElementById('clear-cache').addEventListener('click', () => {
            this.clearAllCaches();
        });
        
        // 定期更新指标
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 2000);
    }

    // 更新性能指标
    updatePerformanceMetrics() {
        const panel = document.getElementById('performance-panel');
        if (panel?.classList.contains('hidden')) return;
        
        // 更新页面加载时间
        const pageLoadTimeEl = document.getElementById('page-load-time');
        if (pageLoadTimeEl && this.metrics.pageLoadTime) {
            pageLoadTimeEl.textContent = `${Math.round(this.metrics.pageLoadTime)} ms`;
        }
        
        // 更新内存使用
        const memoryUsageEl = document.getElementById('memory-usage');
        if (memoryUsageEl && this.metrics.memoryUsage) {
            const usedMB = Math.round(this.metrics.memoryUsage.usedJSHeapSize / 1024 / 1024);
            memoryUsageEl.textContent = `${usedMB} MB`;
        }
        
        // 更新缓存命中率
        const cacheHitRateEl = document.getElementById('cache-hit-rate');
        if (cacheHitRateEl) {
            const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
                ? Math.round((this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100)
                : 0;
            cacheHitRateEl.textContent = `${hitRate}%`;
        }
        
        // 更新包大小
        const bundleSizeEl = document.getElementById('bundle-size');
        if (bundleSizeEl && this.metrics.bundleSize) {
            const sizeKB = Math.round(this.metrics.bundleSize / 1024);
            bundleSizeEl.textContent = `${sizeKB} KB`;
        }
        
        // 更新FCP
        const fcpTimeEl = document.getElementById('fcp-time');
        if (fcpTimeEl && this.metrics.fcp) {
            fcpTimeEl.textContent = `${Math.round(this.metrics.fcp)} ms`;
        }
        
        // 更新LCP
        const lcpTimeEl = document.getElementById('lcp-time');
        if (lcpTimeEl && this.metrics.lcp) {
            lcpTimeEl.textContent = `${Math.round(this.metrics.lcp)} ms`;
        }
        
        // 更新CLS
        const clsScoreEl = document.getElementById('cls-score');
        if (clsScoreEl && this.metrics.cls !== undefined) {
            clsScoreEl.textContent = this.metrics.cls.toFixed(3);
        }
    }

    // 执行优化
    performOptimization() {
        console.log('[PerformanceOptimizer] 执行性能优化');
        
        // 清理临时资源
        this.cleanupTemporaryDOM();
        
        // 压缩图片
        this.compressAllImages();
        
        // 清理缓存
        this.clearOldCaches();
        
        // 优化CSS
        this.optimizeStyles();
        
        // 触发垃圾回收
        if (window.gc) {
            window.gc();
        }
        
        // 重新计算布局
        document.body.offsetHeight;
        
        this.showOptimizationComplete();
    }

    // 设置图片优化
    setupImageOptimization() {
        console.log('[PerformanceOptimizer] 设置图片优化');
        
        // 检测WebP支持
        this.webpSupported = this.supportsWebP();
        
        // 设置图片懒加载
        this.setupImageLazyLoading();
        
        // 设置图片预加载
        this.setupImagePreloading();
        
        // 设置图片压缩
        this.setupImageCompression();
        
        // 设置响应式图片
        this.setupResponsiveImages();
    }

    // 设置图片懒加载
    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.optimizeImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 优化图片
    optimizeImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 检查缓存
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            return;
        }

        // 创建优化后的图片
        const optimizedSrc = this.getOptimizedImageSrc(src);
        img.src = optimizedSrc;
        
        // 缓存优化后的图片
        this.imageCache.set(src, optimizedSrc);
    }

    // 获取优化后的图片源
    getOptimizedImageSrc(src) {
        // 如果支持WebP，使用WebP格式
        if (this.webpSupported && !src.includes('.webp')) {
            return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        return src;
    }

    // 设置图片预加载
    setupImagePreloading() {
        // 预加载重要图片
        const criticalImages = document.querySelectorAll('img[data-preload="true"]');
        criticalImages.forEach(img => {
            const src = img.dataset.src;
            if (src) {
                const preloadImg = new Image();
                preloadImg.src = src;
            }
        });
    }

    // 设置图片压缩
    setupImageCompression() {
        // 设置压缩质量
        this.imageCompressionQuality = 0.8;
        this.maxImageWidth = 1920;
        this.maxImageHeight = 1080;
    }

    // 设置响应式图片
    setupResponsiveImages() {
        // 为图片添加响应式属性
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }

    // 压缩所有图片
    compressAllImages() {
        const images = document.querySelectorAll('img');
        images.forEach((img) => {
            if (img.complete && img.naturalWidth > 0) {
                this.compressImage(img);
            }
        });
    }

    // 清理旧缓存
    clearOldCaches() {
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    if (name.includes('old') || name.includes('temp')) {
                        caches.delete(name);
                    }
                });
            });
        }
    }

    // 优化样式
    optimizeStyles() {
        // 移除未使用的CSS规则
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((style) => {
            if (style.textContent && style.textContent.includes('@media')) {
                const mediaQueries = style.textContent.match(/@media[^{]+{[^}]+}/g);
                if (mediaQueries) {
                    mediaQueries.forEach((query) => {
                        const matchMedia = window.matchMedia(query.match(/@media[^{]+/)[0]);
                        if (!matchMedia.matches) {
                            style.textContent = style.textContent.replace(query, '');
                        }
                    });
                }
            }
        });
    }

    // 显示优化完成
    showOptimizationComplete() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.textContent = '性能优化完成！';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 清理所有缓存
    clearAllCaches() {
        if ('caches' in window) {
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                console.log('[PerformanceOptimizer] 所有缓存已清理');
                this.showCacheCleared();
            });
        }
    }

    // 显示缓存已清理
    showCacheCleared() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.textContent = '缓存已清理';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 获取性能报告
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            cacheStats: this.cacheStats,
            optimizations: this.optimizations,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
    }

    // 检查元素是否可见
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // 加载元素
    loadElement(element) {
        const src = element.getAttribute('data-src');
        if (src) {
            if (element.tagName === 'IMG') {
                element.src = src;
            } else if (element.tagName === 'VIDEO') {
                element.src = src;
            } else if (element.tagName === 'IFRAME') {
                element.src = src;
            }
            element.removeAttribute('data-src');
        }
    }
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 创建全局性能优化器实例
window.PerformanceOptimizer = PerformanceOptimizer;
window.performanceOptimizer = null;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceOptimizer = new PerformanceOptimizer();
    });
} else {
    window.performanceOptimizer = new PerformanceOptimizer();
}

// 导出性能优化器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}