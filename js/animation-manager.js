// 动画效果管理器 - 为LibreTV提供丰富的动画体验
class AnimationManager {
    constructor() {
        this.isEnabled = this.getStoredAnimationPreference();
        this.animationTypes = ['fade', 'slide', 'scale', 'bounce', 'flip', 'rotate', 'elastic', 'spring'];
        this.defaultDuration = 300;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.activeAnimations = new Map();
        
        this.init();
    }

    init() {
        console.log('[Animation] 初始化动画管理器');
        this.setupAnimationStyles();
        this.setupKeyboardShortcuts();
        this.setupIntersectionObserver();
        this.setupPageTransition();
        this.setupParallaxEffects();
    }

    // 获取存储的动画偏好
    getStoredAnimationPreference() {
        const stored = localStorage.getItem('libretv-animation-enabled');
        return stored !== null ? stored === 'true' : true;
    }

    // 设置动画样式
    setupAnimationStyles() {
        const style = document.createElement('style');
        style.id = 'animation-manager-styles';
        style.textContent = `
            /* 基础动画类 */
            .animate-fade-in {
                animation: fadeIn 0.5s ease-out;
            }

            .animate-fade-out {
                animation: fadeOut 0.3s ease-in;
            }

            .animate-slide-up {
                animation: slideUp 0.4s ease-out;
            }

            .animate-slide-down {
                animation: slideDown 0.4s ease-out;
            }

            .animate-slide-left {
                animation: slideLeft 0.4s ease-out;
            }

            .animate-slide-right {
                animation: slideRight 0.4s ease-out;
            }

            .animate-scale-in {
                animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .animate-scale-out {
                animation: scaleOut 0.2s ease-in;
            }

            .animate-bounce-in {
                animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .animate-rotate-in {
                animation: rotateIn 0.5s ease-out;
            }

            .animate-flip-in {
                animation: flipIn 0.6s ease-out;
            }

            .animate-elastic {
                animation: elastic 0.8s ease-out;
            }

            .animate-spring {
                animation: spring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            /* 关键帧定义 */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideDown {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideLeft {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideRight {
                from { transform: translateX(-30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }

            @keyframes scaleOut {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.8); opacity: 0; }
            }

            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 0.8; }
                70% { transform: scale(0.9); opacity: 0.9; }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes rotateIn {
                from { transform: rotate(-200deg) scale(0.5); opacity: 0; }
                to { transform: rotate(0) scale(1); opacity: 1; }
            }

            @keyframes flipIn {
                0% { transform: perspective(400px) rotateY(90deg); opacity: 0; }
                40% { transform: perspective(400px) rotateY(-20deg); opacity: 1; }
                70% { transform: perspective(400px) rotateY(10deg); opacity: 1; }
                100% { transform: perspective(400px) rotateY(0deg); opacity: 1; }
            }

            @keyframes elastic {
                0% { transform: scale(0); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @keyframes spring {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 0.7; }
                70% { transform: scale(0.9); opacity: 0.9; }
                100% { transform: scale(1); opacity: 1; }
            }

            /* 悬浮动画 */
            .hover-lift {
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .hover-lift:hover {
                transform: translateY(-5px);
            }

            .hover-glow {
                transition: box-shadow 0.3s ease;
            }

            .hover-glow:hover {
                box-shadow: 0 0 20px rgba(0, 204, 255, 0.5);
            }

            .hover-scale {
                transition: transform 0.2s ease;
            }

            .hover-scale:hover {
                transform: scale(1.05);
            }

            .hover-rotate {
                transition: transform 0.3s ease;
            }

            .hover-rotate:hover {
                transform: rotate(5deg);
            }

            /* 加载动画 */
            .loading-dots {
                display: inline-flex;
                gap: 4px;
            }

            .loading-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: loadingDots 1.4s infinite ease-in-out both;
            }

            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes loadingDots {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-pulse {
                animation: pulse 1.5s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            /* 页面过渡动画 */
            .page-transition-enter {
                opacity: 0;
                transform: translateX(30px);
            }

            .page-transition-enter-active {
                opacity: 1;
                transform: translateX(0);
                transition: opacity 0.4s ease, transform 0.4s ease;
            }

            .page-transition-exit {
                opacity: 1;
                transform: translateX(0);
            }

            .page-transition-exit-active {
                opacity: 0;
                transform: translateX(-30px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }

            /* 视差效果 */
            .parallax-slow { transform: translateZ(0); will-change: transform; }
            .parallax-medium { transform: translateZ(0); will-change: transform; }
            .parallax-fast { transform: translateZ(0); will-change: transform; }

            /* 禁用动画时 */
            .no-animation * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 切换动画开关
    toggleAnimation() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('libretv-animation-enabled', this.isEnabled.toString());
        
        if (this.isEnabled) {
            document.body.classList.remove('no-animation');
            this.showAnimationStatus('动画已启用');
        } else {
            document.body.classList.add('no-animation');
            this.showAnimationStatus('动画已禁用');
        }
    }

    // 显示动画状态
    showAnimationStatus(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 bg-green-600 text-white';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // 为元素添加动画
    animateElement(element, type = 'fade', duration = this.defaultDuration, callback = null) {
        if (!this.isEnabled || this.reducedMotion) {
            if (callback) callback();
            return;
        }

        const animationId = Symbol('animation');
        this.activeAnimations.set(animationId, element);

        element.style.animationDuration = `${duration}ms`;
        element.classList.add(`animate-${type}`);

        const handleAnimationEnd = () => {
            element.classList.remove(`animate-${type}`);
            element.style.animationDuration = '';
            this.activeAnimations.delete(animationId);
            if (callback) callback();
            element.removeEventListener('animationend', handleAnimationEnd);
        };

        element.addEventListener('animationend', handleAnimationEnd);
    }

    // 批量动画
    animateMultiple(elements, type = 'fade', duration = this.defaultDuration, stagger = 100) {
        if (!this.isEnabled || this.reducedMotion) return;

        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateElement(element, type, duration);
            }, index * stagger);
        });
    }

    // 悬浮效果
    addHoverEffect(element, effect = 'lift') {
        element.classList.add(`hover-${effect}`);
    }

    // 创建加载动画
    createLoadingAnimation(container, type = 'dots') {
        const loadingElement = document.createElement('div');
        loadingElement.className = `loading-${type}`;
        
        if (type === 'dots') {
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                loadingElement.appendChild(dot);
            }
        } else if (type === 'spinner') {
            // spinner已经包含在CSS中
        } else if (type === 'pulse') {
            loadingElement.classList.add('w-4', 'h-4', 'bg-current', 'rounded');
        }
        
        container.appendChild(loadingElement);
        return loadingElement;
    }

    // 移除加载动画
    removeLoadingAnimation(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // 页面过渡动画
    animatePageTransition(direction = 'forward') {
        if (!this.isEnabled || this.reducedMotion) return;

        const currentPage = document.querySelector('.page-content') || document.body;
        
        if (direction === 'forward') {
            currentPage.classList.add('page-transition-enter');
            requestAnimationFrame(() => {
                currentPage.classList.add('page-transition-enter-active');
                currentPage.classList.remove('page-transition-enter');
            });
        } else {
            currentPage.classList.add('page-transition-exit-active');
        }
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggleAnimation();
            }
        });
    }

    // 设置交叉观察器（用于进入视图动画）
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (!element.classList.contains('animated')) {
                            element.classList.add('animated', 'animate-fade-in');
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // 观察所有卡片元素
            document.querySelectorAll('.card-hover').forEach(card => {
                observer.observe(card);
            });
        }
    }

    // 设置页面过渡
    setupPageTransition() {
        // 监听SPA路由变化（如果使用）
        if (window.history.pushState) {
            const originalPushState = history.pushState;
            history.pushState = function(...args) {
                originalPushState.apply(history, args);
                setTimeout(() => {
                    this.animatePageTransition('forward');
                }, 100);
            }.bind(this);
        }
    }

    // 设置视差效果
    setupParallaxEffects() {
        if (!this.isEnabled) return;

        let ticking = false;

        const updateParallax = () => {
            const scrollTop = window.pageYOffset;
            
            // 慢速视差
            document.querySelectorAll('.parallax-slow').forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrollTop * speed}px)`;
            });

            // 中速视差
            document.querySelectorAll('.parallax-medium').forEach(element => {
                const speed = 0.8;
                element.style.transform = `translateY(${scrollTop * speed}px)`;
            });

            // 快速视差
            document.querySelectorAll('.parallax-fast').forEach(element => {
                const speed = 1.2;
                element.style.transform = `translateY(${scrollTop * speed}px)`;
            });

            ticking = false;
        };

        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestParallaxUpdate);
    }

    // 创建粒子效果
    createParticles(container, count = 50) {
        if (!this.isEnabled || this.reducedMotion) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full opacity-20';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            particle.style.animation = 'float 6s ease-in-out infinite';
            
            container.appendChild(particle);
        }

        // 添加浮动动画
        const style = document.createElement('style');
        style.textContent += `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // 涟漪效果
    createRippleEffect(element, event) {
        if (!this.isEnabled) return;

        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 获取动画状态
    getAnimationStatus() {
        return {
            enabled: this.isEnabled,
            reducedMotion: this.reducedMotion,
            activeAnimations: this.activeAnimations.size
        };
    }

    // 停止所有动画
    stopAllAnimations() {
        this.activeAnimations.forEach(element => {
            element.style.animation = 'none';
        });
        this.activeAnimations.clear();
    }

    // 重置动画
    resetAnimations() {
        this.stopAllAnimations();
        document.querySelectorAll('.animate-*').forEach(element => {
            element.className = element.className.replace(/animate-\w+/g, '');
        });
    }
}

// 创建全局动画管理器实例
window.AnimationManager = AnimationManager;
window.animationManager = new AnimationManager();

// 添加涟漪效果CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 导出动画管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}