// 豆瓣热门电影电视剧推荐功能

// ... (前面的代码保持不变)

// 添加：图片代理服务配置
const IMAGE_PROXY_SOURCES = [
    // 1. 直接使用豆瓣原始URL（添加referrerpolicy绕过防盗链）
    (url) => url,
    // 2. 通过CORS代理
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // 3. 通过images.weserv.nl（CDN代理）
    (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url.replace('https://', ''))}&w=300&h=450&fit=cover`,
    // 4. 备用占位图
    (url) => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
];

// 修改：创建豆瓣卡片函数（集成方案1）
function createDoubanCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-[#111] hover:bg-[#222] transition-all duration-300 rounded-lg overflow-hidden flex flex-col transform hover:scale-105 shadow-md hover:shadow-lg';
    
    const safeTitle = sanitizeTitle(item.title);
    const safeRate = (item.rate || "暂无").replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const originalCoverUrl = item.cover;
    
    // 使用多个备用图片源
    const imageSources = IMAGE_PROXY_SOURCES.map(fn => fn(originalCoverUrl));
    
    // 生成安全的URL用于属性
    const safeUrl = item.url.replace(/"/g, '&quot;');
    
    card.innerHTML = `
        <div class="relative w-full aspect-[2/3] overflow-hidden cursor-pointer group">
            <img src="${imageSources[0]}" alt="${safeTitle}" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 lazyload"
                data-sources='${JSON.stringify(imageSources).replace(/'/g, "&#39;")}'
                loading="lazy" 
                referrerpolicy="no-referrer"
                onerror="handleDoubanImageError(this)">
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm backdrop-blur-sm">
                <span class="text-yellow-400">★</span> ${safeRate}
            </div>
            <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm hover:bg-[#333] transition-colors backdrop-blur-sm">
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="在豆瓣查看" onclick="event.stopPropagation();">
                    🔗
                </a>
            </div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">
                    点击搜索
                </div>
            </div>
        </div>
        <div class="p-2 text-center bg-[#111] flex-1 flex items-center justify-center min-h-[60px]">
            <button onclick="fillAndSearchWithDouban('${safeTitle}')" 
                    class="text-sm font-medium text-white truncate w-full hover:text-pink-400 transition text-center"
                    title="${safeTitle}">
                ${safeTitle}
            </button>
        </div>
    `;
    
    // 添加点击事件到整个卡片
    card.querySelector('.relative').addEventListener('click', (e) => {
        // 防止链接点击触发搜索
        if (!e.target.closest('a')) {
            fillAndSearchWithDouban(safeTitle);
        }
    });
    
    return card;
}

// 添加：豆瓣图片错误处理函数
window.handleDoubanImageError = function(img) {
    try {
        const sources = JSON.parse(img.dataset.sources || '[]');
        const currentSrc = img.src;
        
        // 找到当前源在列表中的位置
        let currentIndex = -1;
        for (let i = 0; i < sources.length; i++) {
            if (sources[i] === currentSrc) {
                currentIndex = i;
                break;
            }
        }
        
        // 尝试下一个源
        if (currentIndex >= 0 && currentIndex < sources.length - 1) {
            const nextSrc = sources[currentIndex + 1];
            img.src = nextSrc;
            
            // 如果是占位图，添加样式
            if (nextSrc.startsWith('data:image')) {
                img.classList.add('object-contain', 'p-4');
                img.classList.remove('object-cover');
            } else {
                img.classList.remove('object-contain', 'p-4');
                img.classList.add('object-cover');
            }
            
            // 更新数据源索引
            img.dataset.currentIndex = currentIndex + 1;
        } else {
            // 所有源都失败，显示错误占位图
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
            img.classList.add('object-contain', 'p-4');
            img.classList.remove('object-cover');
        }
    } catch (error) {
        console.error('图片错误处理失败:', error);
        // 简单的备用方案
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
        img.classList.add('object-contain', 'p-4');
    }
};

// 修改：延迟加载图片函数（优化版）
function lazyLoadImages(container) {
    const images = container.querySelectorAll('img.lazyload');
    
    // 如果没有IntersectionObserver，使用简单的延迟加载
    if (!('IntersectionObserver' in window)) {
        images.forEach((img, index) => {
            setTimeout(() => {
                if (img.dataset.sources) {
                    try {
                        const sources = JSON.parse(img.dataset.sources);
                        img.src = sources[0] || '';
                    } catch (e) {
                        console.error('解析图片源失败:', e);
                    }
                }
                img.classList.remove('lazyload');
            }, index * 100); // 分批加载
        });
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 加载第一张图片
                if (img.dataset.sources) {
                    try {
                        const sources = JSON.parse(img.dataset.sources);
                        img.src = sources[0] || '';
                    } catch (e) {
                        console.error('解析图片源失败:', e);
                    }
                }
                
                img.classList.remove('lazyload');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.01
    });
    
    images.forEach(img => observer.observe(img));
}

// 修改：渲染豆瓣卡片函数（添加图片预加载优化）
function renderDoubanCards(data, container) {
    if (!data.subjects || data.subjects.length === 0) {
        renderEmptyState(container);
        return;
    }

    const fragment = document.createDocumentFragment();
    
    // 创建所有卡片
    data.subjects.forEach(item => {
        const card = createDoubanCard(item);
        fragment.appendChild(card);
    });
    
    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // 延迟加载图片
        lazyLoadImages(container);
        
        // 预加载下一批图片（优化体验）
        preloadNextImages(data.subjects);
    });
}

// 添加：预加载下一批图片
function preloadNextImages(subjects) {
    // 只预加载前3张图片
    subjects.slice(0, 3).forEach(item => {
        if (item.cover) {
            const img = new Image();
            img.src = IMAGE_PROXY_SOURCES[0](item.cover);
            img.style.display = 'none';
            document.body.appendChild(img);
            
            // 3秒后移除预加载的图片
            setTimeout(() => {
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
            }, 3000);
        }
    });
}

// 修改：处理豆瓣错误函数（添加图片加载失败统计）
function handleDoubanError(error, container) {
    console.error("获取豆瓣数据失败：", error);
    
    // 记录错误次数
    const errorCount = parseInt(localStorage.getItem('doubanErrorCount') || '0') + 1;
    localStorage.setItem('doubanErrorCount', errorCount.toString());
    
    // 如果错误次数过多，显示特定提示
    let errorMessage = error.message || '网络请求异常';
    let suggestion = '请检查网络连接后重试';
    
    if (errorCount > 3) {
        suggestion = '豆瓣服务可能暂时不可用，请稍后再试';
    }
    
    container.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="text-red-400 mb-2">❌ 获取豆瓣数据失败</div>
            <div class="text-gray-500 text-sm mb-2">${errorMessage}</div>
            <div class="text-gray-500 text-xs mb-4">${suggestion}</div>
            <button onclick="renderRecommend(doubanCurrentTag, DOUBAN_PAGE_SIZE, doubanPageStart)" 
                    class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm mr-2">
                重新加载
            </button>
            <button onclick="resetToHome()" 
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">
                返回首页
            </button>
        </div>
    `;
    
    // 重置错误计数（如果成功）
    setTimeout(() => {
        if (container.querySelector('.text-red-400')) {
            localStorage.setItem('doubanErrorCount', '0');
        }
    }, 10000);
}

// 修改：豆瓣数据请求（添加用户代理轮换）
async function fetchDoubanData(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    // 轮换User-Agent
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const fetchOptions = {
        signal: controller.signal,
        headers: {
            'User-Agent': randomUserAgent,
            'Referer': 'https://movie.douban.com/',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    };

    try {
        // 主代理
        let proxiedUrl;
        if (window.ProxyAuth?.addAuthToProxyUrl) {
            proxiedUrl = await window.ProxyAuth.addAuthToProxyUrl(PROXY_URL + encodeURIComponent(url));
        } else {
            proxiedUrl = PROXY_URL + encodeURIComponent(url);
        }
        
        const response = await fetch(proxiedUrl, fetchOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (err) {
        clearTimeout(timeoutId);
        
        // 备用代理
        return tryFallbackProxy(url);
    }
}

// ... (后面的代码保持不变，除了tag管理函数)

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他组件先加载
    setTimeout(initDouban, 500);
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时，检查是否需要刷新
            const doubanArea = document.getElementById('doubanArea');
            if (doubanArea && !doubanArea.classList.contains('hidden')) {
                const lastLoadTime = parseInt(localStorage.getItem('lastDoubanLoad') || '0');
                if (Date.now() - lastLoadTime > 5 * 60 * 1000) { // 5分钟
                    renderRecommend(doubanCurrentTag, DOUBAN_PAGE_SIZE, doubanPageStart);
                }
            }
        }
    });
    
    // 添加全局图片错误监听器（兜底方案）
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && 
            e.target.src.includes('doubanio.com') && 
            !e.target.dataset.errorHandled) {
            
            e.target.dataset.errorHandled = true;
            
            // 使用通用的图片代理
            setTimeout(() => {
                const originalUrl = e.target.src;
                const proxyUrl = `https://images.weserv.nl/?url=${
                    encodeURIComponent(originalUrl.replace('https://', ''))
                }&w=300&h=450&fit=cover`;
                
                e.target.src = proxyUrl;
                e.target.classList.add('object-contain');
            }, 100);
        }
    }, true);
});

// 导出函数供其他模块使用
window.doubanUtils = {
    fillAndSearchWithDouban,
    resetToHome,
    resetTagsToDefault,
    showTagManageModal,
    handleDoubanImageError  // 导出图片错误处理函数
};
