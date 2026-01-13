const CACHE_NAME = 'libretv-v2.0.0';
const STATIC_CACHE = 'libretv-static-v2.0.0';
const DYNAMIC_CACHE = 'libretv-dynamic-v2.0.0';
const IMAGE_CACHE = 'libretv-images-v2.0.0';
const VIDEO_CACHE = 'libretv-videos-v2.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/player.html',
  '/watch.html',
  '/about.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/index.css',
  '/css/player.css',
  '/css/modals.css',
  '/css/watch.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/search.js',
  '/js/player.js',
  '/js/watch.js',
  '/js/douban.js',
  '/js/api.js',
  '/js/config.js',
  '/js/password.js',
  '/js/version-check.js',
  '/js/pwa-register.js',
  '/js/index-page.js',
  '/image/logo.png',
  '/image/logo-black.png',
  '/image/nomedia.png',
  '/libs/artplayer.min.js',
  '/libs/hls.min.js',
  '/libs/sha256.min.js',
  '/libs/tailwindcss.min.js'
];

// 缓存策略
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// 安装 Service Worker
self.addEventListener('install', event => {
  console.log('[SW] 安装 Service Worker');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] 激活 Service Worker');
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![
              STATIC_CACHE, 
              DYNAMIC_CACHE, 
              IMAGE_CACHE, 
              VIDEO_CACHE
            ].includes(cacheName)) {
              console.log('[SW] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 根据请求类型选择缓存策略
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isVideoRequest(request)) {
    event.respondWith(handleVideoRequest(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// 判断是否为静态资源
function isStaticAsset(request) {
  return /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(request.url);
}

// 判断是否为图片请求
function isImageRequest(request) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(request.url) || 
         request.destination === 'image';
}

// 判断是否为视频请求
function isVideoRequest(request) {
  return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(request.url) ||
         request.destination === 'video';
}

// 判断是否为API请求
function isApiRequest(request) {
  return request.url.includes('/proxy/') || 
         request.url.includes('/api/') ||
         request.url.includes('/s=');
}

// 判断是否为页面请求
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.destination === 'document');
}

// 处理静态资源 - 缓存优先
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] 静态资源请求失败:', error);
    // 返回缓存的降级页面
    return caches.match('/index.html');
  }
}

// 处理图片请求 - 缓存优先
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] 图片请求失败:', error);
    // 返回默认图片
    return caches.match('/image/nomedia.png');
  }
}

// 处理视频请求 - 网络优先
async function handleVideoRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(VIDEO_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] 视频请求失败:', error);
    // 视频请求失败时不返回缓存，让播放器处理
    throw error;
  }
}

// 处理API请求 - 网络优先，回退缓存
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] API请求失败，尝试缓存:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 处理页面请求 - 网络优先
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] 页面请求失败:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // 回退到主页
    return caches.match('/index.html');
  }
}

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    console.log('[SW] 执行后台同步');
    // 可以在这里添加后台同步逻辑
    // 例如：更新缓存、清理旧数据等
  } catch (error) {
    console.log('[SW] 后台同步失败:', error);
  }
}

// 推送通知
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/image/logo-black.png',
      badge: '/image/logo-black.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: '打开应用'
        },
        {
          action: 'close',
          title: '关闭'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_URLS':
        event.waitUntil(cacheUrls(event.data.urls));
        break;
      case 'CLEAR_CACHE':
        event.waitUntil(clearCache());
        break;
    }
  }
});

// 缓存指定URL
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    console.log('[SW] 批量缓存完成:', urls);
  } catch (error) {
    console.log('[SW] 批量缓存失败:', error);
  }
}

// 清理缓存
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] 缓存清理完成');
  } catch (error) {
    console.log('[SW] 缓存清理失败:', error);
  }
}

// 更新检查
self.addEventListener('updatefound', () => {
  console.log('[SW] 发现新版本');
});
