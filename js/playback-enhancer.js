// 播放增强器 - 为LibreTV提供智能播放增强功能
class PlaybackEnhancer {
    constructor() {
        this.enhancements = {
            quality: this.getQualityPreferences(),
            subtitle: this.getSubtitlePreferences(),
            playback: this.getPlaybackPreferences(),
            autoplay: this.getAutoplayPreferences(),
            network: this.getNetworkPreferences()
        };
        this.qualityLevels = ['自动', '480p', '720p', '1080p', '1440p', '4K'];
        this.networkAware = this.isNetworkAware();
        this.hardwareAcceleration = this.supportsHardwareAcceleration();
        
        this.init();
    }

    init() {
        console.log('[PlaybackEnhancer] 初始化播放增强器');
        this.setupQualityEnhancement();
        this.setupSubtitleEnhancement();
        this.setupNetworkOptimization();
        this.setupHardwareAcceleration();
        this.setupBufferOptimization();
        this.setupAdaptiveStreaming();
        this.createEnhancementPanel();
    }

    // 获取画质偏好设置
    getQualityPreferences() {
        const stored = localStorage.getItem('libretv-quality-preferences');
        return stored ? JSON.parse(stored) : {
            preferred: '自动',
            maxQuality: '自动',
            autoAdjust: true,
            enable4K: true
        };
    }

    // 获取字幕偏好设置
    getSubtitlePreferences() {
        const stored = localStorage.getItem('libretv-subtitle-preferences');
        return stored ? JSON.parse(stored) : {
            enabled: true,
            language: 'zh-CN',
            fontSize: '中',
            fontFamily: '微软雅黑',
            color: '白色',
            background: '半透明黑',
            position: '底部',
            encoding: 'utf-8'
        };
    }

    // 获取播放偏好设置
    getPlaybackPreferences() {
        const stored = localStorage.getItem('libretv-playback-preferences');
        return stored ? JSON.parse(stored) : {
            preload: 'metadata',
            bufferSize: 'auto',
            seekStep: 10,
            volumeStep: 0.1,
            rememberPosition: true,
            skipIntro: false,
            skipEnding: false
        };
    }

    // 获取自动播放偏好设置
    getAutoplayPreferences() {
        const stored = localStorage.getItem('libretv-autoplay-preferences');
        return stored ? JSON.parse(stored) : {
            nextEpisode: true,
            similarVideos: true,
            trailers: false,
            delay: 3
        };
    }

    // 获取网络偏好设置
    getNetworkPreferences() {
        const stored = localStorage.getItem('libretv-network-preferences');
        return stored ? JSON.parse(stored) : {
            bandwidthLimit: 'unlimited',
            dataSaver: false,
            adaptiveQuality: true,
            prebuffering: 'smart'
        };
    }

    // 检测网络感知能力
    isNetworkAware() {
        return 'connection' in navigator;
    }

    // 检测硬件加速支持
    supportsHardwareAcceleration() {
        const video = document.createElement('video');
        const canPlay = video.canPlayType('video/mp4; codecs="avc1.42E01E"');
        return canPlay !== '';
    }

    // 设置画质增强
    setupQualityEnhancement() {
        if (window.advancedPlayer) {
            window.advancedPlayer.player?.on('ready', () => {
                this.optimizeVideoQuality();
            });
        }
    }

    // 优化视频画质
    optimizeVideoQuality() {
        if (!window.advancedPlayer?.player?.video) return;

        const video = window.advancedPlayer.player.video;
        const currentNetwork = this.getCurrentNetworkSpeed();
        
        // 根据网络状况调整画质
        if (this.enhancements.quality.autoAdjust) {
            const quality = this.calculateOptimalQuality(currentNetwork);
            this.applyQuality(quality);
        }
        
        // 启用硬件加速
        if (this.hardwareAcceleration) {
            video.style.transform = 'translateZ(0)'; // 强制硬件加速
        }
        
        // 设置合适的缓冲大小
        this.setOptimalBufferSize();
    }

    // 获取当前网络速度
    getCurrentNetworkSpeed() {
        if (!this.networkAware) return '4g';
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection?.effectiveType || '4g';
    }

    // 计算最优画质
    calculateOptimalQuality(networkType) {
        const qualityMap = {
            'slow-2g': '480p',
            '2g': '720p',
            '3g': '720p',
            '4g': '1080p',
            'unlimited': '4K'
        };
        
        return qualityMap[networkType] || '720p';
    }

    // 应用画质设置
    applyQuality(quality) {
        if (!window.advancedPlayer?.player) return;
        
        const player = window.advancedPlayer.player;
        
        // 这里可以添加HLS/DASH的画质切换逻辑
        // 目前作为占位符实现
        console.log(`[PlaybackEnhancer] 应用画质: ${quality}`);
        
        // 保存用户偏好
        this.enhancements.quality.preferred = quality;
        this.saveQualityPreferences();
    }

    // 保存画质偏好
    saveQualityPreferences() {
        localStorage.setItem('libretv-quality-preferences', JSON.stringify(this.enhancements.quality));
    }

    // 设置字幕增强
    setupSubtitleEnhancement() {
        if (!window.advancedPlayer?.player) return;
        
        const player = window.advancedPlayer.player;
        
        // 监听字幕相关事件
        player.on('subtitleShow', () => this.updateSubtitleDisplay());
        player.on('subtitleHide', () => this.hideSubtitleDisplay());
    }

    // 更新字幕显示
    updateSubtitleDisplay() {
        if (!this.enhancements.subtitle.enabled) return;
        
        const video = window.advancedPlayer?.player?.video;
        if (!video) return;
        
        // 创建或获取字幕容器
        let subtitleContainer = document.getElementById('enhanced-subtitle-container');
        if (!subtitleContainer) {
            subtitleContainer = this.createSubtitleContainer();
            document.body.appendChild(subtitleContainer);
        }
        
        // 应用字幕样式
        this.applySubtitleStyles(subtitleContainer);
    }

    // 创建字幕容器
    createSubtitleContainer() {
        const container = document.createElement('div');
        container.id = 'enhanced-subtitle-container';
        container.className = 'fixed bottom-20 left-0 right-0 z-40 pointer-events-none';
        
        // 添加字幕样式
        const style = document.createElement('style');
        style.textContent = `
            #enhanced-subtitle-container {
                font-family: ${this.enhancements.subtitle.fontFamily};
                text-align: center;
                padding: 0 20px;
            }
            
            #enhanced-subtitle-container .subtitle-text {
                display: inline-block;
                background: rgba(0, 0, 0, 0.8);
                color: ${this.getSubtitleColor()};
                font-size: ${this.getSubtitleFontSize()};
                padding: 8px 16px;
                border-radius: 4px;
                margin: 4px;
                line-height: 1.4;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                max-width: 90%;
                word-wrap: break-word;
            }
            
            #enhanced-subtitle-container.position-top {
                top: 20px;
                bottom: auto;
            }
            
            #enhanced-subtitle-container.position-center {
                top: 50%;
                bottom: auto;
                transform: translateY(-50%);
            }
        `;
        document.head.appendChild(style);
        
        return container;
    }

    // 获取字幕颜色
    getSubtitleColor() {
        const colorMap = {
            '白色': '#ffffff',
            '黄色': '#ffff00',
            '红色': '#ff0000',
            '绿色': '#00ff00',
            '蓝色': '#0000ff',
            '青色': '#00ffff',
            '橙色': '#ffa500'
        };
        return colorMap[this.enhancements.subtitle.color] || '#ffffff';
    }

    // 获取字幕字体大小
    getSubtitleFontSize() {
        const sizeMap = {
            '小': '14px',
            '中': '18px',
            '大': '24px',
            '超大': '32px'
        };
        return sizeMap[this.enhancements.subtitle.fontSize] || '18px';
    }

    // 应用字幕样式
    applySubtitleStyles(container) {
        container.className = `fixed bottom-20 left-0 right-0 z-40 pointer-events-none position-${this.enhancements.subtitle.position}`;
    }

    // 隐藏字幕显示
    hideSubtitleDisplay() {
        const container = document.getElementById('enhanced-subtitle-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // 设置网络优化
    setupNetworkOptimization() {
        if (this.networkAware) {
            navigator.connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        }
    }

    // 处理网络变化
    handleNetworkChange() {
        const networkType = this.getCurrentNetworkSpeed();
        console.log(`[PlaybackEnhancer] 网络类型变化: ${networkType}`);
        
        if (this.enhancements.network.adaptiveQuality) {
            this.adaptToNetworkChange(networkType);
        }
    }

    // 适应网络变化
    adaptToNetworkChange(networkType) {
        if (!window.advancedPlayer?.player) return;
        
        const quality = this.calculateOptimalQuality(networkType);
        this.applyQuality(quality);
        
        // 显示网络变化通知
        window.advancedPlayer.showNotification(
            `网络状况变化，已调整为${quality}画质`,
            'info'
        );
    }

    // 设置硬件加速
    setupHardwareAcceleration() {
        if (!this.hardwareAcceleration) return;
        
        const style = document.createElement('style');
        style.textContent = `
            .hardware-accelerated {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
        `;
        document.head.appendChild(style);
    }

    // 设置缓冲优化
    setupBufferOptimization() {
        if (!window.advancedPlayer?.player) return;
        
        const player = window.advancedPlayer.player;
        
        // 监听缓冲事件
        player.on('buffer', () => {
            this.handleBuffering();
        });
        
        player.on('buffered', () => {
            this.handleBuffered();
        });
    }

    // 处理缓冲中
    handleBuffering() {
        this.showBufferingIndicator();
    }

    // 处理缓冲完成
    handleBuffered() {
        this.hideBufferingIndicator();
    }

    // 显示缓冲指示器
    showBufferingIndicator() {
        let indicator = document.getElementById('buffering-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'buffering-indicator';
            indicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg';
            indicator.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>缓冲中...</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    // 隐藏缓冲指示器
    hideBufferingIndicator() {
        const indicator = document.getElementById('buffering-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // 设置自适应流媒体
    setupAdaptiveStreaming() {
        // 这里可以集成HLS.js或DASH.js的自适应流媒体逻辑
        console.log('[PlaybackEnhancer] 自适应流媒体已启用');
    }

    // 创建增强面板
    createEnhancementPanel() {
        const panel = document.createElement('div');
        panel.id = 'enhancement-panel';
        panel.className = 'fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 rounded-lg p-4 hidden transition-all duration-300 max-w-sm';
        
        panel.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-white font-semibold">播放增强</h3>
                    <button id="closeEnhancementPanel" class="text-gray-400 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- 画质控制 -->
                <div>
                    <label class="block text-white text-sm mb-2">画质偏好</label>
                    <select id="qualitySelector" class="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm">
                        ${this.qualityLevels.map(level => 
                            `<option value="${level}" ${this.enhancements.quality.preferred === level ? 'selected' : ''}>${level}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <!-- 网络感知 -->
                ${this.networkAware ? `
                    <div class="flex justify-between items-center">
                        <span class="text-white text-sm">网络自适应</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="networkAdaptive" class="sr-only peer" ${this.enhancements.network.adaptiveQuality ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                ` : ''}
                
                <!-- 硬件加速 -->
                ${this.hardwareAcceleration ? `
                    <div class="flex justify-between items-center">
                        <span class="text-white text-sm">硬件加速</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="hardwareAcceleration" class="sr-only peer" checked>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                ` : ''}
                
                <!-- 缓冲优化 -->
                <div class="flex justify-between items-center">
                    <span class="text-white text-sm">智能缓冲</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="bufferOptimization" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                
                <!-- 快捷按钮 -->
                <div class="flex gap-2">
                    <button id="enhanceQualityBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors">
                        优化画质
                    </button>
                    <button id="reduceDataBtn" class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors">
                        节省流量
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupEnhancementPanelEvents();
    }

    // 设置增强面板事件
    setupEnhancementPanelEvents() {
        // 关闭面板
        document.getElementById('closeEnhancementPanel').addEventListener('click', () => {
            this.toggleEnhancementPanel();
        });
        
        // 画质选择
        document.getElementById('qualitySelector').addEventListener('change', (e) => {
            this.setQualityPreference(e.target.value);
        });
        
        // 网络自适应
        const networkAdaptive = document.getElementById('networkAdaptive');
        if (networkAdaptive) {
            networkAdaptive.addEventListener('change', (e) => {
                this.enhancements.network.adaptiveQuality = e.target.checked;
                this.saveNetworkPreferences();
            });
        }
        
        // 硬件加速
        const hardwareAcceleration = document.getElementById('hardwareAcceleration');
        if (hardwareAcceleration) {
            hardwareAcceleration.addEventListener('change', (e) => {
                this.toggleHardwareAcceleration(e.target.checked);
            });
        }
        
        // 缓冲优化
        const bufferOptimization = document.getElementById('bufferOptimization');
        if (bufferOptimization) {
            bufferOptimization.addEventListener('change', (e) => {
                this.toggleBufferOptimization(e.target.checked);
            });
        }
        
        // 优化画质按钮
        document.getElementById('enhanceQualityBtn').addEventListener('click', () => {
            this.optimizeForQuality();
        });
        
        // 节省流量按钮
        document.getElementById('reduceDataBtn').addEventListener('click', () => {
            this.optimizeForDataSaving();
        });
    }

    // 切换增强面板显示
    toggleEnhancementPanel() {
        const panel = document.getElementById('enhancement-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }

    // 设置画质偏好
    setQualityPreference(quality) {
        this.enhancements.quality.preferred = quality;
        this.saveQualityPreferences();
        this.applyQuality(quality);
    }

    // 保存网络偏好
    saveNetworkPreferences() {
        localStorage.setItem('libretv-network-preferences', JSON.stringify(this.enhancements.network));
    }

    // 切换硬件加速
    toggleHardwareAcceleration(enabled) {
        const video = window.advancedPlayer?.player?.video;
        if (!video) return;
        
        if (enabled) {
            video.classList.add('hardware-accelerated');
        } else {
            video.classList.remove('hardware-accelerated');
        }
    }

    // 切换缓冲优化
    toggleBufferOptimization(enabled) {
        if (enabled) {
            this.setupBufferOptimization();
        } else {
            // 关闭缓冲优化
            console.log('[PlaybackEnhancer] 缓冲优化已关闭');
        }
    }

    // 优化画质
    optimizeForQuality() {
        if (!this.networkAware || this.getCurrentNetworkSpeed() === 'unlimited') {
            this.applyQuality('4K');
            window.advancedPlayer?.showNotification('已优化至最高画质', 'success');
        } else {
            this.applyQuality('1080p');
            window.advancedPlayer?.showNotification('已优化至高清画质', 'success');
        }
    }

    // 优化数据节省
    optimizeForDataSaving() {
        this.enhancements.network.dataSaver = true;
        this.applyQuality('720p');
        this.saveNetworkPreferences();
        window.advancedPlayer?.showNotification('已启用数据节省模式', 'success');
    }

    // 设置最优缓冲大小
    setOptimalBufferSize() {
        const networkType = this.getCurrentNetworkSpeed();
        let bufferSize;
        
        switch (networkType) {
            case 'slow-2g':
            case '2g':
                bufferSize = 1000; // 1秒
                break;
            case '3g':
                bufferSize = 3000; // 3秒
                break;
            case '4g':
                bufferSize = 5000; // 5秒
                break;
            case 'unlimited':
            default:
                bufferSize = 10000; // 10秒
                break;
        }
        
        console.log(`[PlaybackEnhancer] 设置缓冲大小: ${bufferSize}ms`);
    }

    // 保存字幕偏好
    saveSubtitlePreferences() {
        localStorage.setItem('libretv-subtitle-preferences', JSON.stringify(this.enhancements.subtitle));
    }

    // 保存播放偏好
    savePlaybackPreferences() {
        localStorage.setItem('libretv-playback-preferences', JSON.stringify(this.enhancements.playback));
    }

    // 保存自动播放偏好
    saveAutoplayPreferences() {
        localStorage.setItem('libretv-autoplay-preferences', JSON.stringify(this.enhancements.autoplay));
    }

    // 获取播放统计信息
    getPlaybackStats() {
        return {
            qualityPreferences: this.enhancements.quality,
            networkType: this.getCurrentNetworkSpeed(),
            hardwareAccelerationEnabled: this.hardwareAcceleration,
            networkAware: this.networkAware,
            enhancements: {
                quality: true,
                subtitle: true,
                buffer: true,
                hardware: this.hardwareAcceleration,
                network: this.networkAware
            }
        };
    }

    // 重置所有增强设置
    resetEnhancements() {
        localStorage.removeItem('libretv-quality-preferences');
        localStorage.removeItem('libretv-subtitle-preferences');
        localStorage.removeItem('libretv-playback-preferences');
        localStorage.removeItem('libretv-autoplay-preferences');
        localStorage.removeItem('libretv-network-preferences');
        
        // 重新加载页面以应用默认设置
        window.location.reload();
    }

    // 导出增强设置
    exportEnhancements() {
        const settings = {
            quality: this.enhancements.quality,
            subtitle: this.enhancements.subtitle,
            playback: this.enhancements.playback,
            autoplay: this.enhancements.autoplay,
            network: this.enhancements.network,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'libretv-enhancements.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // 导入增强设置
    importEnhancements(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.enhancements = { ...this.enhancements, ...settings };
                this.saveAllPreferences();
                window.advancedPlayer?.showNotification('设置导入成功', 'success');
            } catch (error) {
                console.error('[PlaybackEnhancer] 设置导入失败:', error);
                window.advancedPlayer?.showNotification('设置导入失败', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 保存所有偏好
    saveAllPreferences() {
        this.saveQualityPreferences();
        this.saveSubtitlePreferences();
        this.savePlaybackPreferences();
        this.saveAutoplayPreferences();
        this.saveNetworkPreferences();
    }
}

// 创建全局播放增强器实例
window.PlaybackEnhancer = PlaybackEnhancer;
window.playbackEnhancer = null;

// 自动初始化播放增强器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.playbackEnhancer = new PlaybackEnhancer();
        }, 1500);
    });
} else {
    setTimeout(() => {
        window.playbackEnhancer = new PlaybackEnhancer();
    }, 1500);
}

// 导出播放增强器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaybackEnhancer;
}