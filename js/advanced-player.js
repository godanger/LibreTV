// 高级播放管理器 - 为LibreTV提供增强的播放体验
class AdvancedPlayerManager {
    constructor() {
        this.player = null;
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.playHistory = this.getStoredPlayHistory();
        this.playPreferences = this.getStoredPlayPreferences();
        this.isAutoPlay = this.playPreferences.autoPlay || false;
        this.isLoop = this.playPreferences.loop || false;
        this.playbackRate = this.playPreferences.playbackRate || 1.0;
        this.volume = this.playPreferences.volume || 1.0;
        this.isPictureInPicture = false;
        this.keyboardShortcuts = this.setupKeyboardShortcuts();
        this.touchGestures = this.setupTouchGestures();
        
        this.init();
    }

    init() {
        console.log('[AdvancedPlayer] 初始化高级播放管理器');
        this.setupPlayer();
        this.createControlPanel();
        this.createPlaylistPanel();
        this.setupAutoPlay();
        this.setupProgressTracking();
        this.setupNotifications();
        this.setupAnalytics();
    }

    // 设置播放器
    setupPlayer() {
        if (typeof ArtPlayer === 'undefined') {
            console.warn('[AdvancedPlayer] ArtPlayer未加载');
            return;
        }

        // 等待播放器DOM元素准备就绪
        const playerContainer = document.getElementById('player');
        if (!playerContainer) {
            console.warn('[AdvancedPlayer] 播放器容器未找到');
            return;
        }

        try {
            this.player = new ArtPlayer({
                container: playerContainer,
                url: '', // 将在播放时设置
                poster: '', // 将在播放时设置
                title: '', // 将在播放时设置
                volume: this.volume,
                autoplay: false,
                muted: false,
                loop: this.isLoop,
                playbackRate: this.playbackRate,
                aspectRatio: '16:9',
                setting: true,
                hotkey: true,
                pip: true,
                mutex: true,
                backdrop: true,
                fullscreen: true,
                fullscreenWeb: true,
                subtitleOffset: false,
                miniProgressBar: false,
                useSSR: false,
                playsInline: true,
                autoPlayback: true,
                autoOrientation: true,
                airplay: true,
                settings: [
                    {
                        default: true,
                        tooltip: '播放设置',
                        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
                        tooltip: '播放设置',
                        html: this.createSettingsPanel(),
                        selector: false
                    }
                ],
                contextmenu: [
                    {
                        tooltip: '高级功能',
                        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg>',
                        click: () => this.showAdvancedMenu()
                    }
                ],
                whitelist: [
                    (uri) => {
                        // 处理特殊协议
                        return true;
                    }
                ],
                moreVideoAttr: {
                    crossOrigin: 'anonymous'
                }
            });

            this.setupPlayerEvents();
            console.log('[AdvancedPlayer] 播放器初始化成功');

        } catch (error) {
            console.error('[AdvancedPlayer] 播放器初始化失败:', error);
        }
    }

    // 设置播放器事件
    setupPlayerEvents() {
        if (!this.player) return;

        // 播放开始
        this.player.on('play', () => {
            console.log('[AdvancedPlayer] 开始播放');
            this.savePlayProgress();
            this.trackAnalytics('play_start');
        });

        // 播放暂停
        this.player.on('pause', () => {
            console.log('[AdvancedPlayer] 播放暂停');
            this.savePlayProgress();
            this.trackAnalytics('play_pause');
        });

        // 播放结束
        this.player.on('ended', () => {
            console.log('[AdvancedPlayer] 播放结束');
            this.savePlayProgress();
            this.trackAnalytics('play_end');
            
            if (this.isAutoPlay && this.hasNextEpisode()) {
                this.playNext();
            } else if (this.isLoop && this.currentPlaylist.length === 1) {
                this.playCurrent();
            }
        });

        // 播放进度更新
        this.player.on('timeupdate', () => {
            this.savePlayProgress();
        });

        // 音量变化
        this.player.on('volumechange', () => {
            this.volume = this.player.volume;
            this.savePlayPreferences();
        });

        // 播放速度变化
        this.player.on('playbackRateChange', () => {
            this.playbackRate = this.player.playbackRate;
            this.savePlayPreferences();
        });

        // 画中画模式变化
        this.player.on('pip', (state) => {
            this.isPictureInPicture = state;
            this.updatePictureInPictureButton(state);
        });

        // 全屏状态变化
        this.player.on('fullscreen', (state) => {
            document.body.classList.toggle('is-fullscreen', state);
        });

        // 错误处理
        this.player.on('error', (error) => {
            console.error('[AdvancedPlayer] 播放错误:', error);
            this.handlePlaybackError(error);
        });

        // 加载完成
        this.player.on('ready', () => {
            console.log('[AdvancedPlayer] 播放器准备就绪');
            this.updateControls();
        });
    }

    // 创建播放控制面板
    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'advanced-player-controls';
        controlPanel.className = 'fixed bottom-4 right-4 z-50 bg-black bg-opacity-80 rounded-lg p-3 hidden transition-all duration-300';
        
        controlPanel.innerHTML = `
            <div class="flex flex-col gap-3">
                <!-- 播放控制 -->
                <div class="flex items-center gap-2">
                    <button id="prevTrackBtn" class="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors" title="上一集">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    
                    <button id="playPauseBtn" class="p-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors" title="播放/暂停">
                        <svg id="playPauseIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    
                    <button id="nextTrackBtn" class="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors" title="下一集">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- 播放速度 -->
                <div class="flex items-center gap-2">
                    <label class="text-xs text-gray-300">速度:</label>
                    <select id="playbackRateSelect" class="bg-gray-700 text-white rounded px-2 py-1 text-xs">
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1" selected>正常</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                    </select>
                </div>
                
                <!-- 功能开关 -->
                <div class="flex flex-wrap gap-2">
                    <button id="autoPlayToggle" class="px-3 py-1 rounded text-xs transition-colors ${this.isAutoPlay ? 'bg-green-600' : 'bg-gray-600'}" title="自动播放下一集">
                        自动播放
                    </button>
                    <button id="loopToggle" class="px-3 py-1 rounded text-xs transition-colors ${this.isLoop ? 'bg-blue-600' : 'bg-gray-600'}" title="循环播放">
                        循环
                    </button>
                    <button id="pipBtn" class="px-3 py-1 rounded text-xs bg-gray-600 hover:bg-gray-500 transition-colors" title="画中画">
                        画中画
                    </button>
                </div>
                
                <!-- 播放列表快捷操作 -->
                <div class="flex gap-1">
                    <button id="shuffleBtn" class="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors" title="随机播放">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                    </button>
                    <button id="playlistBtn" class="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors" title="播放列表">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(controlPanel);
        this.setupControlPanelEvents();
    }

    // 设置控制面板事件
    setupControlPanelEvents() {
        // 播放/暂停
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        
        // 上一首/下一首
        document.getElementById('prevTrackBtn').addEventListener('click', () => this.playPrevious());
        document.getElementById('nextTrackBtn').addEventListener('click', () => this.playNext());
        
        // 播放速度
        document.getElementById('playbackRateSelect').addEventListener('change', (e) => {
            this.setPlaybackRate(parseFloat(e.target.value));
        });
        
        // 自动播放
        document.getElementById('autoPlayToggle').addEventListener('click', () => {
            this.isAutoPlay = !this.isAutoPlay;
            this.updateToggleButtons();
            this.savePlayPreferences();
        });
        
        // 循环播放
        document.getElementById('loopToggle').addEventListener('click', () => {
            this.isLoop = !this.isLoop;
            this.updateToggleButtons();
            this.savePlayPreferences();
        });
        
        // 画中画
        document.getElementById('pipBtn').addEventListener('click', () => this.togglePictureInPicture());
        
        // 随机播放
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shufflePlaylist());
        
        // 播放列表
        document.getElementById('playlistBtn').addEventListener('click', () => this.togglePlaylist());
    }

    // 创建播放列表面板
    createPlaylistPanel() {
        const playlistPanel = document.createElement('div');
        playlistPanel.id = 'playlist-panel';
        playlistPanel.className = 'fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 transform translate-x-full transition-transform duration-300 z-50 overflow-y-auto';
        
        playlistPanel.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white">播放列表</h3>
                    <button id="closePlaylistBtn" class="p-2 text-gray-400 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-4">
                    <button id="clearPlaylistBtn" class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                        清空播放列表
                    </button>
                </div>
                
                <div id="playlistItems" class="space-y-2">
                    <!-- 播放列表项目将在这里动态生成 -->
                </div>
            </div>
        `;

        document.body.appendChild(playlistPanel);
        this.setupPlaylistPanelEvents();
    }

    // 设置播放列表面板事件
    setupPlaylistPanelEvents() {
        document.getElementById('closePlaylistBtn').addEventListener('click', () => this.togglePlaylist());
        document.getElementById('clearPlaylistBtn').addEventListener('click', () => this.clearPlaylist());
    }

    // 切换播放/暂停
    togglePlayPause() {
        if (!this.player) return;
        
        if (this.player.paused) {
            this.player.play();
        } else {
            this.player.pause();
        }
        
        this.updatePlayPauseButton();
    }

    // 播放下一首
    playNext() {
        if (this.hasNextEpisode()) {
            this.playEpisode(this.currentIndex + 1);
        } else if (this.isLoop) {
            this.playEpisode(0);
        }
    }

    // 播放上一首
    playPrevious() {
        if (this.hasPreviousEpisode()) {
            this.playEpisode(this.currentIndex - 1);
        }
    }

    // 播放当前
    playCurrent() {
        this.playEpisode(this.currentIndex);
    }

    // 播放指定索引的节目
    playEpisode(index) {
        if (index < 0 || index >= this.currentPlaylist.length) {
            return false;
        }
        
        const episode = this.currentPlaylist[index];
        this.currentIndex = index;
        
        // 更新播放器
        this.player.url = episode.url;
        this.player.title = episode.title;
        this.player.poster = episode.poster || '';
        
        // 自动播放
        if (this.isAutoPlay) {
            this.player.play();
        }
        
        // 更新播放列表显示
        this.updatePlaylistDisplay();
        this.updateEpisodeInfo();
        
        // 保存播放历史
        this.addToHistory(episode);
        
        return true;
    }

    // 设置播放速度
    setPlaybackRate(rate) {
        if (!this.player) return;
        
        this.player.playbackRate = rate;
        this.playbackRate = rate;
        this.savePlayPreferences();
        
        // 显示速度变化提示
        this.showSpeedNotification(rate);
    }

    // 切换画中画模式
    togglePictureInPicture() {
        if (!this.player) return;
        
        if (this.isPictureInPicture) {
            this.exitPictureInPicture();
        } else {
            this.enterPictureInPicture();
        }
    }

    // 进入画中画模式
    async enterPictureInPicture() {
        try {
            if (this.player.video && document.pictureInPictureEnabled) {
                await this.player.video.requestPictureInPicture();
            }
        } catch (error) {
            console.error('[AdvancedPlayer] 进入画中画失败:', error);
            this.showNotification('画中画模式不受支持', 'error');
        }
    }

    // 退出画中画模式
    async exitPictureInPicture() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error('[AdvancedPlayer] 退出画中画失败:', error);
        }
    }

    // 随机播放
    shufflePlaylist() {
        if (this.currentPlaylist.length <= 1) return;
        
        // 洗牌算法
        for (let i = this.currentPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentPlaylist[i], this.currentPlaylist[j]] = [this.currentPlaylist[j], this.currentPlaylist[i]];
        }
        
        // 重新开始播放
        this.currentIndex = 0;
        this.updatePlaylistDisplay();
        this.showNotification('已随机播放', 'success');
    }

    // 切换播放列表显示
    togglePlaylist() {
        const playlistPanel = document.getElementById('playlist-panel');
        playlistPanel.classList.toggle('translate-x-full');
    }

    // 清空播放列表
    clearPlaylist() {
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.updatePlaylistDisplay();
        this.showNotification('播放列表已清空', 'info');
    }

    // 添加到播放列表
    addToPlaylist(episode) {
        this.currentPlaylist.push(episode);
        this.updatePlaylistDisplay();
    }

    // 从播放列表移除
    removeFromPlaylist(index) {
        if (index >= 0 && index < this.currentPlaylist.length) {
            this.currentPlaylist.splice(index, 1);
            
            // 调整当前播放索引
            if (index < this.currentIndex) {
                this.currentIndex--;
            } else if (index === this.currentIndex) {
                this.currentIndex = Math.min(this.currentIndex, this.currentPlaylist.length - 1);
            }
            
            this.updatePlaylistDisplay();
        }
    }

    // 更新播放列表显示
    updatePlaylistDisplay() {
        const playlistItems = document.getElementById('playlistItems');
        if (!playlistItems) return;
        
        playlistItems.innerHTML = this.currentPlaylist.map((episode, index) => `
            <div class="flex items-center justify-between p-2 rounded ${index === this.currentIndex ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} cursor-pointer transition-colors" 
                 onclick="window.advancedPlayer.playEpisode(${index})">
                <div class="flex-1 min-w-0">
                    <div class="text-white text-sm font-medium truncate">${episode.title}</div>
                    <div class="text-gray-400 text-xs truncate">${episode.source || '未知来源'}</div>
                </div>
                <button onclick="event.stopPropagation(); window.advancedPlayer.removeFromPlaylist(${index})" 
                        class="p-1 text-gray-400 hover:text-red-400 ml-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // 设置自动播放
    setupAutoPlay() {
        // 监听当前集数变化
        window.addEventListener('episodeChange', (event) => {
            if (this.isAutoPlay && this.hasNextEpisode()) {
                setTimeout(() => this.playNext(), 2000); // 2秒后自动播放下一集
            }
        });
    }

    // 设置进度跟踪
    setupProgressTracking() {
        if (!this.player) return;
        
        this.player.on('timeupdate', () => {
            this.savePlayProgress();
        });
    }

    // 保存播放进度
    savePlayProgress() {
        if (!this.player || !this.currentPlaylist[this.currentIndex]) return;
        
        const episode = this.currentPlaylist[this.currentIndex];
        const progress = {
            episodeId: episode.id,
            currentTime: this.player.currentTime,
            duration: this.player.duration,
            timestamp: Date.now()
        };
        
        localStorage.setItem('libretv-play-progress', JSON.stringify(progress));
    }

    // 恢复播放进度
    restorePlayProgress() {
        try {
            const progress = JSON.parse(localStorage.getItem('libretv-play-progress') || '{}');
            if (progress.episodeId && this.player && this.currentPlaylist[this.currentIndex]) {
                const currentEpisode = this.currentPlaylist[this.currentIndex];
                if (currentEpisode.id === progress.episodeId && progress.currentTime > 0) {
                    this.player.seek(progress.currentTime);
                }
            }
        } catch (error) {
            console.warn('[AdvancedPlayer] 恢复播放进度失败:', error);
        }
    }

    // 添加到播放历史
    addToHistory(episode) {
        const historyItem = {
            ...episode,
            timestamp: Date.now(),
            playTime: this.player ? this.player.currentTime : 0
        };
        
        // 移除重复项
        this.playHistory = this.playHistory.filter(item => item.id !== episode.id);
        
        // 添加到开头
        this.playHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.playHistory.length > 50) {
            this.playHistory = this.playHistory.slice(0, 50);
        }
        
        this.savePlayHistory();
    }

    // 获取存储的播放历史
    getStoredPlayHistory() {
        try {
            return JSON.parse(localStorage.getItem('libretv-play-history') || '[]');
        } catch {
            return [];
        }
    }

    // 保存播放历史
    savePlayHistory() {
        localStorage.setItem('libretv-play-history', JSON.stringify(this.playHistory));
    }

    // 获取存储的播放偏好
    getStoredPlayPreferences() {
        try {
            return JSON.parse(localStorage.getItem('libretv-play-preferences') || '{}');
        } catch {
            return {};
        }
    }

    // 保存播放偏好
    savePlayPreferences() {
        const preferences = {
            autoPlay: this.isAutoPlay,
            loop: this.isLoop,
            playbackRate: this.playbackRate,
            volume: this.volume
        };
        localStorage.setItem('libretv-play-preferences', JSON.stringify(preferences));
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.player || e.target.tagName === 'INPUT') return;
            
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.playPrevious();
                    } else {
                        this.player.seek(this.player.currentTime - 10);
                    }
                    break;
                case 'ArrowRight':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.playNext();
                    } else {
                        this.player.seek(this.player.currentTime + 10);
                    }
                    break;
                case 'ArrowUp':
                    this.player.volume = Math.min(1, this.player.volume + 0.1);
                    break;
                case 'ArrowDown':
                    this.player.volume = Math.max(0, this.player.volume - 0.1);
                    break;
                case 'm':
                    this.player.muted = !this.player.muted;
                    break;
                case 'f':
                    this.player.fullscreen = !this.player.fullscreen;
                    break;
                case 'c':
                    this.togglePictureInPicture();
                    break;
                case 'l':
                    this.isLoop = !this.isLoop;
                    this.updateToggleButtons();
                    this.savePlayPreferences();
                    break;
                case 's':
                    this.togglePlaylist();
                    break;
                default:
                    // 数字键选择播放速度
                    if (e.key >= '1' && e.key <= '9') {
                        const speedMap = { '1': 1, '2': 1.25, '3': 1.5, '4': 2 };
                        if (speedMap[e.key]) {
                            this.setPlaybackRate(speedMap[e.key]);
                        }
                    }
                    break;
            }
        });
    }

    // 设置触摸手势
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let lastTap = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const currentTime = Date.now();
            const tapDelay = currentTime - lastTap;
            
            // 双击切换播放/暂停
            if (tapDelay < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                this.togglePlayPause();
                lastTap = currentTime;
                return;
            }
            
            // 水平滑动快进/快退
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // 向右滑动 - 快退
                    this.player.seek(this.player.currentTime - 10);
                } else {
                    // 向左滑动 - 快进
                    this.player.seek(this.player.currentTime + 10);
                }
            }
        });
    }

    // 设置分析追踪
    setupAnalytics() {
        this.analytics = {
            playTime: 0,
            sessionStart: Date.now(),
            episodesPlayed: 0
        };
        
        this.player?.on('timeupdate', () => {
            this.analytics.playTime++;
        });
        
        this.player?.on('ended', () => {
            this.analytics.episodesPlayed++;
        });
    }

    // 追踪分析数据
    trackAnalytics(event, data = {}) {
        const analyticsData = {
            event,
            timestamp: Date.now(),
            sessionId: this.analytics.sessionStart,
            ...data
        };
        
        console.log('[AdvancedPlayer Analytics]', analyticsData);
        // 这里可以发送到分析服务
    }

    // 处理播放错误
    handlePlaybackError(error) {
        console.error('[AdvancedPlayer] 播放错误:', error);
        
        // 尝试切换到下一个源
        if (this.hasNextEpisode()) {
            this.showNotification('播放失败，正在尝试下一个源...', 'warning');
            setTimeout(() => this.playNext(), 1000);
        } else {
            this.showNotification('所有播放源均失败', 'error');
        }
    }

    // 更新控件状态
    updateControls() {
        this.updateToggleButtons();
        this.updatePlayPauseButton();
        this.updateEpisodeInfo();
    }

    // 更新切换按钮
    updateToggleButtons() {
        const autoPlayBtn = document.getElementById('autoPlayToggle');
        const loopBtn = document.getElementById('loopToggle');
        
        if (autoPlayBtn) {
            autoPlayBtn.className = `px-3 py-1 rounded text-xs transition-colors ${this.isAutoPlay ? 'bg-green-600' : 'bg-gray-600'}`;
        }
        
        if (loopBtn) {
            loopBtn.className = `px-3 py-1 rounded text-xs transition-colors ${this.isLoop ? 'bg-blue-600' : 'bg-gray-600'}`;
        }
    }

    // 更新播放/暂停按钮
    updatePlayPauseButton() {
        if (!this.player) return;
        
        const playPauseIcon = document.getElementById('playPauseIcon');
        if (playPauseIcon) {
            if (this.player.paused) {
                playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            } else {
                playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            }
        }
    }

    // 更新集数信息
    updateEpisodeInfo() {
        const episodeInfo = document.getElementById('episodeInfo');
        if (episodeInfo && this.currentPlaylist[this.currentIndex]) {
            const episode = this.currentPlaylist[this.currentIndex];
            episodeInfo.textContent = `${this.currentIndex + 1}/${this.currentPlaylist.length} - ${episode.title}`;
        }
    }

    // 更新画中画按钮
    updatePictureInPictureButton(isActive) {
        const pipBtn = document.getElementById('pipBtn');
        if (pipBtn) {
            pipBtn.className = `px-3 py-1 rounded text-xs transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`;
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'warning' ? 'bg-yellow-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 显示速度变化通知
    showSpeedNotification(rate) {
        this.showNotification(`播放速度: ${rate}x`, 'info');
    }

    // 检查是否有下一集
    hasNextEpisode() {
        return this.currentIndex < this.currentPlaylist.length - 1;
    }

    // 检查是否有上一集
    hasPreviousEpisode() {
        return this.currentIndex > 0;
    }

    // 获取当前播放状态
    getCurrentState() {
        return {
            playlist: this.currentPlaylist,
            currentIndex: this.currentIndex,
            isPlaying: this.player ? !this.player.paused : false,
            currentTime: this.player ? this.player.currentTime : 0,
            duration: this.player ? this.player.duration : 0,
            volume: this.player ? this.player.volume : 0,
            playbackRate: this.player ? this.player.playbackRate : 1,
            isAutoPlay: this.isAutoPlay,
            isLoop: this.isLoop,
            isPictureInPicture: this.isPictureInPicture
        };
    }

    // 显示高级菜单
    showAdvancedMenu() {
        console.log('[AdvancedPlayer] 显示高级菜单');
        // 这里可以显示更多高级功能菜单
    }

    // 创建设置面板
    createSettingsPanel() {
        return `
            <div class="p-4 bg-gray-900 text-white rounded">
                <h4 class="font-semibold mb-3">高级播放设置</h4>
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" ${this.isAutoPlay ? 'checked' : ''} onchange="window.advancedPlayer.isAutoPlay = this.checked; window.advancedPlayer.updateToggleButtons(); window.advancedPlayer.savePlayPreferences();">
                        <span class="text-sm">自动播放下一集</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" ${this.isLoop ? 'checked' : ''} onchange="window.advancedPlayer.isLoop = this.checked; window.advancedPlayer.updateToggleButtons(); window.advancedPlayer.savePlayPreferences();">
                        <span class="text-sm">循环播放</span>
                    </label>
                    <div>
                        <label class="block text-sm mb-1">播放速度</label>
                        <select onchange="window.advancedPlayer.setPlaybackRate(parseFloat(this.value))" class="bg-gray-700 text-white rounded px-2 py-1 text-sm">
                            <option value="0.25" ${this.playbackRate === 0.25 ? 'selected' : ''}>0.25x</option>
                            <option value="0.5" ${this.playbackRate === 0.5 ? 'selected' : ''}>0.5x</option>
                            <option value="0.75" ${this.playbackRate === 0.75 ? 'selected' : ''}>0.75x</option>
                            <option value="1" ${this.playbackRate === 1 ? 'selected' : ''}>正常</option>
                            <option value="1.25" ${this.playbackRate === 1.25 ? 'selected' : ''}>1.25x</option>
                            <option value="1.5" ${this.playbackRate === 1.5 ? 'selected' : ''}>1.5x</option>
                            <option value="2" ${this.playbackRate === 2 ? 'selected' : ''}>2x</option>
                            <option value="3" ${this.playbackRate === 3 ? 'selected' : ''}>3x</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
}

// 创建全局高级播放管理器实例
window.AdvancedPlayerManager = AdvancedPlayerManager;
window.advancedPlayer = null;

// 自动初始化播放器管理器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 等待播放器初始化完成
        setTimeout(() => {
            window.advancedPlayer = new AdvancedPlayerManager();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.advancedPlayer = new AdvancedPlayerManager();
    }, 1000);
}

// 导出高级播放管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedPlayerManager;
}