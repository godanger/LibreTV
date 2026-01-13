// 在文件顶部添加以下变量
let isDoubanLoading = false;
let hasMoreDoubanContent = true;
let scrollLoadingEnabled = true; // 是否启用滚动加载

// 在initDouban函数中添加滚动监听
function initDouban() {
    // ... 现有的initDouban代码保持不变 ...
    
    // 初始加载热门内容
    if (localStorage.getItem('doubanEnabled') === 'true') {
        renderRecommend(doubanCurrentTag, doubanPageSize, doubanPageStart);
    }
    
    // 添加滚动监听（只在初始化时添加一次）
    setupDoubanScrollLoading();
}

// 设置滚动自动加载
function setupDoubanScrollLoading() {
    // 移除之前可能存在的滚动监听
    window.removeEventListener('scroll', handleDoubanScroll);
    
    // 添加新的滚动监听
    window.addEventListener('scroll', handleDoubanScroll);
    
    // 添加滚动加载开关按钮（如果不存在）
    addScrollToggleButton();
}

// 添加滚动加载开关按钮
function addScrollToggleButton() {
    // 检查是否已存在开关按钮
    if (document.getElementById('scrollToggleBtn')) return;
    
    const doubanHeader = document.querySelector('#doubanArea > div.flex.justify-between.items-center.mb-4');
    if (!doubanHeader) return;
    
    // 创建开关按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'scrollToggleBtn';
    toggleBtn.className = 'ml-2 py-1 px-3 rounded text-sm font-medium transition-all duration-300 border bg-[#111827] text-gray-300 hover:bg-[#1f2937] hover:text-[#D3E1F4] border-[#1f2937] hover:border-[#2563eb] flex items-center';
    
    // 根据当前状态设置按钮文本
    updateScrollToggleButton(toggleBtn);
    
    // 点击事件
    toggleBtn.onclick = function() {
        scrollLoadingEnabled = !scrollLoadingEnabled;
        updateScrollToggleButton(toggleBtn);
        showToast(`滚动加载已${scrollLoadingEnabled ? '启用' : '禁用'}`, 'info');
    };
    
    // 添加到标题区域
    doubanHeader.appendChild(toggleBtn);
}

// 更新滚动开关按钮状态
function updateScrollToggleButton(button) {
    if (!button) return;
    
    if (scrollLoadingEnabled) {
        button.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            滚动加载中
        `;
        button.classList.remove('border-gray-700');
        button.classList.add('border-green-500', 'text-green-500');
    } else {
        button.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
            点击加载
        `;
        button.classList.remove('border-green-500', 'text-green-500');
        button.classList.add('border-gray-700');
    }
}

// 滚动事件处理函数
function handleDoubanScroll() {
    // 如果豆瓣功能未启用，直接返回
    if (localStorage.getItem('doubanEnabled') !== 'true') return;
    
    // 如果正在加载中或没有更多内容，直接返回
    if (isDoubanLoading || !hasMoreDoubanContent) return;
    
    // 如果滚动加载未启用，直接返回
    if (!scrollLoadingEnabled) return;
    
    // 获取豆瓣区域
    const doubanArea = document.getElementById('doubanArea');
    if (!doubanArea || doubanArea.classList.contains('hidden')) return;
    
    // 计算滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 计算豆瓣区域的底部位置
    const doubanRect = doubanArea.getBoundingClientRect();
    const doubanBottom = doubanRect.top + doubanRect.height;
    
    // 当滚动到豆瓣区域底部附近时（距离底部200px以内）
    if (doubanBottom - windowHeight < 200) {
        loadMoreDoubanContent();
    }
}

// 加载更多内容
async function loadMoreDoubanContent() {
    if (isDoubanLoading) return;
    
    isDoubanLoading = true;
    
    // 显示加载指示器
    showDoubanLoadingIndicator();
    
    try {
        // 增加起始位置
        doubanPageStart += doubanPageSize;
        
        // 加载更多数据
        const target = `https://movie.douban.com/j/search_subjects?type=${doubanMovieTvCurrentSwitch}&tag=${doubanCurrentTag}&sort=recommend&page_limit=${doubanPageSize}&page_start=${doubanPageStart}`;
        
        const data = await fetchDoubanData(target);
        
        // 检查是否有数据
        if (!data.subjects || data.subjects.length === 0) {
            hasMoreDoubanContent = false;
            showNoMoreContentIndicator();
            return;
        }
        
        // 渲染新内容
        appendDoubanCards(data);
        
        // 如果返回的数据少于请求的数量，说明没有更多内容了
        if (data.subjects.length < doubanPageSize) {
            hasMoreDoubanContent = false;
            showNoMoreContentIndicator();
        }
        
    } catch (error) {
        console.error("加载更多内容失败：", error);
        showToast('加载更多内容失败，请稍后重试', 'error');
        
        // 发生错误时回退起始位置
        doubanPageStart -= doubanPageSize;
    } finally {
        isDoubanLoading = false;
        removeDoubanLoadingIndicator();
    }
}

// 显示加载指示器
function showDoubanLoadingIndicator() {
    const container = document.getElementById("douban-results");
    if (!container) return;
    
    // 移除可能已存在的指示器
    removeDoubanLoadingIndicator();
    
    // 创建加载指示器
    const loader = document.createElement('div');
    loader.id = 'douban-scroll-loader';
    loader.className = 'col-span-full text-center py-4 mt-4';
    loader.innerHTML = `
        <div class="inline-flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span class="text-pink-500 text-sm">正在加载更多...</span>
        </div>
    `;
    
    container.appendChild(loader);
}

// 移除加载指示器
function removeDoubanLoadingIndicator() {
    const loader = document.getElementById('douban-scroll-loader');
    if (loader) {
        loader.remove();
    }
}

// 显示"没有更多内容"指示器
function showNoMoreContentIndicator() {
    const container = document.getElementById("douban-results");
    if (!container) return;
    
    // 移除可能已存在的指示器
    const existingIndicator = document.getElementById('douban-no-more');
    if (existingIndicator) return;
    
    // 创建指示器
    const indicator = document.createElement('div');
    indicator.id = 'douban-no-more';
    indicator.className = 'col-span-full text-center py-6 mt-4';
    indicator.innerHTML = `
        <div class="text-gray-500 text-sm">
            <svg class="w-6 h-6 inline-block mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>已经到底了</div>
            <div class="text-xs mt-1">没有更多内容了</div>
        </div>
    `;
    
    container.appendChild(indicator);
}

// 追加新的卡片到现有内容
function appendDoubanCards(data) {
    const container = document.getElementById("douban-results");
    if (!container || !data.subjects || data.subjects.length === 0) return;
    
    // 创建文档片段以提高性能
    const fragment = document.createDocumentFragment();
    
    // 循环创建每个影视卡片
    data.subjects.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-[#111] hover:bg-[#222] transition-all duration-300 rounded-lg overflow-hidden flex flex-col transform hover:scale-105 shadow-md hover:shadow-lg";
        
        // 生成卡片内容，确保安全显示（防止XSS）
        const safeTitle = item.title
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        
        const safeRate = (item.rate || "暂无")
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // 处理图片URL
        const originalCoverUrl = item.cover;
        const proxiedCoverUrl = PROXY_URL + encodeURIComponent(originalCoverUrl);
        
        card.innerHTML = `
            <div class="relative w-full aspect-[2/3] overflow-hidden cursor-pointer" onclick="fillAndSearchWithDouban('${safeTitle}')">
                <img src="${originalCoverUrl}" alt="${safeTitle}" 
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onerror="this.onerror=null; this.src='${proxiedCoverUrl}'; this.classList.add('object-contain');"
                    loading="lazy" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                    <span class="text-yellow-400">★</span> ${safeRate}
                </div>
                <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm hover:bg-[#333] transition-colors">
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" title="在豆瓣查看" onclick="event.stopPropagation();"> ✙ </a> 
              </div>
            </div>
            <div class="p-2 text-center bg-[#111]">
                <button onclick="fillAndSearchWithDouban('${safeTitle}')" 
                        class="text-sm font-medium text-white truncate w-full hover:text-pink-400 transition"
                        title="${safeTitle}">
                    ${safeTitle}
                </button>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    // 移除"没有更多内容"指示器（如果有）
    const noMoreIndicator = document.getElementById('douban-no-more');
    if (noMoreIndicator) {
        noMoreIndicator.remove();
    }
    
    // 添加新内容
    container.appendChild(fragment);
}

// 修改现有的 renderRecommend 函数，重置加载状态
function renderRecommend(tag, pageLimit, pageStart) {
    const container = document.getElementById("douban-results");
    if (!container) return;

    // 重置加载状态
    isDoubanLoading = false;
    hasMoreDoubanContent = true;
    doubanPageStart = pageStart;
    
    // 移除"没有更多内容"指示器（如果有）
    const noMoreIndicator = document.getElementById('douban-no-more');
    if (noMoreIndicator) {
        noMoreIndicator.remove();
    }

    const loadingOverlayHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div class="flex items-center justify-center">
                <div class="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin inline-block"></div>
                <span class="text-pink-500 ml-4">加载中...</span>
            </div>
        </div>
    `;

    container.classList.add("relative");
    container.insertAdjacentHTML('beforeend', loadingOverlayHTML);
    
    const target = `https://movie.douban.com/j/search_subjects?type=${doubanMovieTvCurrentSwitch}&tag=${tag}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;
    
    // 使用通用请求函数
    fetchDoubanData(target)
        .then(data => {
            renderDoubanCards(data, container);
        })
        .catch(error => {
            console.error("获取豆瓣数据失败：", error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-red-400">? 获取豆瓣数据失败，请稍后重试</div>
                    <div class="text-gray-500 text-sm mt-2">提示：使用VPN可能有助于解决此问题</div>
                </div>
            `;
        });
}

// 修改现有的 renderDoubanTags 函数，切换标签时重置状态
function renderDoubanTags(tags) {
    const tagContainer = document.getElementById('douban-tags');
    if (!tagContainer) return;
    
    // 确定当前应该使用的标签列表
    const currentTags = doubanMovieTvCurrentSwitch === 'movie' ? movieTags : tvTags;
    
    // 清空标签容器
    tagContainer.innerHTML = '';

    // 先添加标签管理按钮
    const manageBtn = document.createElement('button');
    manageBtn.className = 'py-1.5 px-3 rounded text-sm font-medium transition-all duration-300 bg-[#111827] text-gray-300 hover:bg-[#1f2937] hover:text-[#D3E1F4] border border-[#1f2937] hover:border-white';
    manageBtn.innerHTML = '<span class="flex items-center"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>管理标签</span>';
    manageBtn.onclick = function() {
        showTagManageModal();
    };
    tagContainer.appendChild(manageBtn);

    // 添加所有标签
    currentTags.forEach(tag => {
        const btn = document.createElement('button');
        
        // 设置样式
        let btnClass = 'py-1.5 px-3 rounded text-sm font-medium transition-all duration-300 border ';
        
        // 当前选中的标签使用高亮样式
        if (tag === doubanCurrentTag) {
            btnClass += 'bg-[#161b22] text-white shadow-md border-[#2563eb]';
        } else {
            btnClass += 'bg-[#111827] text-gray-300 hover:bg-[#1f2937] hover:text-[#D3E1F4] border-[#1f2937] hover:border-[#2563eb]';
        }
        
        btn.className = btnClass;
        btn.textContent = tag;
        
        btn.onclick = function() {
            if (doubanCurrentTag !== tag) {
                doubanCurrentTag = tag;
                doubanPageStart = 0;
                // 重置加载状态
                isDoubanLoading = false;
                hasMoreDoubanContent = true;
                renderRecommend(doubanCurrentTag, doubanPageSize, doubanPageStart);
                renderDoubanTags();
            }
        };
        
        tagContainer.appendChild(btn);
    });
}

// 修改换一批按钮事件，重置加载状态
function setupDoubanRefreshBtn() {
    const btn = document.getElementById('douban-refresh');
    if (!btn) return;
    
    btn.onclick = function() {
        doubanPageStart += doubanPageSize;
        if (doubanPageStart > 9 * doubanPageSize) {
            doubanPageStart = 0;
        }
        
        // 重置加载状态
        isDoubanLoading = false;
        hasMoreDoubanContent = true;
        
        renderRecommend(doubanCurrentTag, doubanPageSize, doubanPageStart);
    };
}

// 修改电影/电视剧切换事件，重置加载状态
// 在现有的 renderDoubanMovieTvSwitch 函数中，修改点击事件
movieToggle.addEventListener('click', function() {
    if (doubanMovieTvCurrentSwitch !== 'movie') {
        // ... 现有的样式更新代码 ...
        
        doubanMovieTvCurrentSwitch = 'movie';
        doubanCurrentTag = '热门';
        
        // 重置加载状态
        isDoubanLoading = false;
        hasMoreDoubanContent = true;
        doubanPageStart = 0;

        // 重新加载豆瓣内容
        renderDoubanTags(movieTags);
        
        // 初始加载热门内容
        if (localStorage.getItem('doubanEnabled') === 'true') {
            renderRecommend(doubanCurrentTag, doubanPageSize, doubanPageStart);
        }
    }
});

// 电视剧按钮点击事件同样修改
tvToggle.addEventListener('click', function() {
    if (doubanMovieTvCurrentSwitch !== 'tv') {
        // ... 现有的样式更新代码 ...
        
        doubanMovieTvCurrentSwitch = 'tv';
        doubanCurrentTag = '热门';
        
        // 重置加载状态
        isDoubanLoading = false;
        hasMoreDoubanContent = true;
        doubanPageStart = 0;

        // 重新加载豆瓣内容
        renderDoubanTags(tvTags);
        
        // 初始加载热门内容
        if (localStorage.getItem('doubanEnabled') === 'true') {
            renderRecommend(doubanCurrentTag, doubanPageSize, doubanPageStart);
        }
    }
});

// 手动触发加载更多的函数（用于开关按钮切换时）
function manualLoadMoreDouban() {
    if (!scrollLoadingEnabled) {
        loadMoreDoubanContent();
    }
}
