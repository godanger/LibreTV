// PWA管理器 - 增强LibreTV的现代Web功能
class PWAManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.updateAvailable = false;
        this.installPrompt = null;
        this.shareTarget = null;
        this.backgroundSyncSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
        this.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        
        this.init();
    }

    async init() {
        console.log('[PWA] 初始化PWA管理器');
        
        // 监听网络状态变化
        this.setupNetworkListeners();
        
        // 注册Service Worker
        await this.registerServiceWorker();
        
        // 监听PWA安装提示
        this.setupInstallPrompt();
        
        // 监听文件分享目标
        this.setupShareTarget();
        
        // 初始化离线检测
        this.setupOfflineDetection();
        
        // 初始化推送通知（如果支持）
        if (this.pushSupported) {
            this.initPushNotifications();
        }
        
        // 初始化后台同步（如果支持）
        if (this.backgroundSyncSupported) {
            this.initBackgroundSync();
        }
        
        console.log('[PWA] PWA管理器初始化完成');
    }

    // 设置网络状态监听
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('[PWA] 网络连接恢复');
            this.isOnline = true;
            this.showNetworkStatus('online');
            this.updateAppForOnlineState();
        });

        window.addEventListener('offline', () => {
            console.log('[PWA] 网络连接断开');
            this.isOnline = false;
            this.showNetworkStatus('offline');
            this.updateAppForOfflineState();
        });
    }

    // 显示网络状态提示
    showNetworkStatus(status) {
        const existingToast = document.getElementById('network-status-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'network-status-toast';
        toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            status === 'online' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                ${status === 'online' 
                    ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>'
                    : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 00-9.75 9.75c0 .598.065 1.18.187 1.74l-1.947 1.947A3.75 3.75 0 004.5 20.25h15a3.75 3.75 0 003.009-5.612l-1.947-1.947A9.75 9.75 0 0012 2.25z"></path></svg>'
                }
                <span class="font-medium">
                    ${status === 'online' ? '网络连接已恢复' : '网络连接已断开 - 离线模式'}
                </span>
            </div>
        `;

        document.body.appendChild(toast);

        // 3秒后自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 注册Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                
                console.log('[PWA] Service Worker注册成功:', this.swRegistration.scope);
                
                // 检查更新
                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('[PWA] 发现新版本');
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                });
                
                // 等待控制器就绪
                if (!navigator.serviceWorker.controller) {
                    this.waitForSWActivation();
                }
                
            } catch (error) {
                console.error('[PWA] Service Worker注册失败:', error);
            }
        }
    }

    // 等待Service Worker激活
    async waitForSWActivation() {
        if (this.swRegistration) {
            await navigator.serviceWorker.ready;
            console.log('[PWA] Service Worker已激活');
        }
    }

    // 显示更新通知
    showUpdateNotification() {
        const existingUpdateToast = document.getElementById('update-notification');
        if (existingUpdateToast) {
            return; // 已存在更新通知，不重复显示
        }

        const updateToast = document.createElement('div');
        updateToast.id = 'update-notification';
        updateToast.className = 'fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 transform transition-all duration-300';
        
        updateToast.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    <div>
                        <h3 class="font-semibold text-sm">应用更新可用</h3>
                        <p class="text-xs text-blue-100 mt-1">新版本包含改进和新功能</p>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-blue-200 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="flex gap-2 mt-3">
                <button onclick="window.pwaManager.updateApp()" class="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-3 rounded text-xs transition-colors">
                    立即更新
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="flex-1 border border-blue-400 text-blue-100 hover:text-white hover:border-white font-medium py-2 px-3 rounded text-xs transition-colors">
                    稍后提醒
                </button>
            </div>
        `;

        document.body.appendChild(updateToast);
    }

    // 更新应用
    async updateApp() {
        if (this.swRegistration && this.updateAvailable) {
            try {
                // 发送更新消息给Service Worker
                this.swRegistration.active?.postMessage({ type: 'SKIP_WAITING' });
                
                // 重新加载页面以使用新版本
                window.location.reload();
            } catch (error) {
                console.error('[PWA] 应用更新失败:', error);
            }
        }
    }

    // 设置PWA安装提示
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] PWA安装提示可用');
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallButton();
        });

        // 监听PWA安装事件
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] PWA已安装');
            this.installPrompt = null;
            this.hideInstallButton();
            this.showInstallSuccess();
        });
    }

    // 显示安装按钮
    showInstallButton() {
        if (this.installPrompt && !document.getElementById('pwa-install-button')) {
            const installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.className = 'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 z-40';
            installButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
            `;
            installButton.title = '安装LibreTV到主屏幕';
            installButton.onclick = () => this.promptInstall();
            document.body.appendChild(installButton);
        }
    }

    // 隐藏安装按钮
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.remove();
        }
    }

    // 提示安装
    async promptInstall() {
        if (this.installPrompt) {
            this.installPrompt.prompt();
            const { outcome } = await this.installPrompt.userChoice;
            
            console.log('[PWA] 安装选择:', outcome);
            
            if (outcome === 'accepted') {
                console.log('[PWA] 用户接受安装');
            } else {
                console.log('[PWA] 用户取消安装');
            }
            
            this.installPrompt = null;
            this.hideInstallButton();
        }
    }

    // 显示安装成功提示
    showInstallSuccess() {
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300';
        successToast.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="font-medium">LibreTV已成功安装到您的设备</span>
            </div>
        `;

        document.body.appendChild(successToast);

        setTimeout(() => {
            successToast.style.opacity = '0';
            setTimeout(() => successToast.remove(), 300);
        }, 3000);
    }

    // 设置文件分享目标
    setupShareTarget() {
        if ('share' in navigator) {
            navigator.share.getInstalledRelatedApps?.();
        }

        // 检查是否从其他应用分享打开
        if (window.location.search.includes('share-target')) {
            this.handleSharedContent();
        }
    }

    // 处理分享的内容
    async handleSharedContent() {
        // 这里可以处理从其他应用分享过来的内容
        console.log('[PWA] 处理分享内容');
    }

    // 设置离线检测
    setupOfflineDetection() {
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.className = `fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 text-sm font-medium transition-transform duration-300 transform translate-y-full z-50`;
        offlineIndicator.textContent = '您当前处于离线状态，某些功能可能受限';
        document.body.appendChild(offlineIndicator);

        // 根据网络状态调整指示器
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    // 显示离线指示器
    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.transform = 'translateY(0)';
        }
    }

    // 隐藏离线指示器
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.transform = 'translateY(100%)';
        }
    }

    // 应用在线状态更新
    updateAppForOnlineState() {
        this.hideOfflineIndicator();
        
        // 重新加载API数据
        if (window.searchManager) {
            window.searchManager.refreshSearchResults();
        }
        
        // 更新播放器状态
        if (window.player) {
            window.player.reload();
        }
    }

    // 应用离线状态更新
    updateAppForOfflineState() {
        this.showOfflineIndicator();
        
        // 显示离线功能提示
        this.showOfflineFeatures();
    }

    // 显示离线功能提示
    showOfflineFeatures() {
        const featuresToast = document.createElement('div');
        featuresToast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm';
        featuresToast.innerHTML = `
            <div class="text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="font-semibold mb-2">离线模式功能</h3>
                <ul class="text-sm text-gray-300 space-y-1">
                    <li>• 查看已缓存的视频信息</li>
                    <li>• 访问历史记录和收藏</li>
                    <li>• 设置和偏好保持可用</li>
                    <li>• 联网后自动恢复所有功能</li>
                </ul>
            </div>
        `;

        document.body.appendChild(featuresToast);

        setTimeout(() => {
            featuresToast.style.opacity = '0';
            setTimeout(() => featuresToast.remove(), 300);
        }, 5000);
    }

    // 初始化推送通知
    async initPushNotifications() {
        // 这里可以实现推送通知功能
        console.log('[PWA] 推送通知支持已启用');
    }

    // 初始化后台同步
    async initBackgroundSync() {
        // 这里可以实现后台同步功能
        console.log('[PWA] 后台同步支持已启用');
    }

    // Web Share API支持检测
    supportsWebShare() {
        return 'share' in navigator;
    }

    // 分享内容
    async shareContent(title, text, url) {
        if (this.supportsWebShare()) {
            try {
                await navigator.share({
                    title: title || 'LibreTV',
                    text: text || '在LibreTV上发现这个很棒的视频',
                    url: url || window.location.href
                });
                console.log('[PWA] 分享成功');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('[PWA] 分享失败:', error);
                }
            }
        } else {
            // 降级到复制链接
            this.copyToClipboard(url || window.location.href);
        }
    }

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('链接已复制到剪贴板');
        } catch (error) {
            console.error('[PWA] 复制失败:', error);
            this.showToast('复制失败，请手动复制链接');
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 获取缓存状态
    async getCacheStatus() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const cacheData = {};
            
            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const keys = await cache.keys();
                cacheData[name] = {
                    count: keys.length,
                    urls: keys.map(req => req.url)
                };
            }
            
            return cacheData;
        }
        return null;
    }

    // 清理缓存
    async clearAllCache() {
        if ('caches' in window) {
            await caches.delete('libretv-static-v2.0.0');
            await caches.delete('libretv-dynamic-v2.0.0');
            await caches.delete('libretv-images-v2.0.0');
            await caches.delete('libretv-videos-v2.0.0');
            this.showToast('缓存已清理');
        }
    }

    // 获取PWA状态信息
    getStatus() {
        return {
            isOnline: this.isOnline,
            isInstalled: window.matchMedia('(display-mode: standalone)').matches,
            supportsPWA: 'serviceWorker' in navigator,
            supportsWebShare: this.supportsWebShare(),
            supportsPush: this.pushSupported,
            supportsBackgroundSync: this.backgroundSyncSupported,
            hasUpdate: this.updateAvailable,
            isInstallable: !!this.installPrompt
        };
    }
}

// 创建全局PWA管理器实例
window.PWAManager = PWAManager;

// 导出PWA管理器
window.pwaManager = new PWAManager();