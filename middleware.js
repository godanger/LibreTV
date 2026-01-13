// Vercel Middleware to inject environment variables
export default async function middleware(request) {
  const url = new URL(request.url);

  // Exclude static assets, API routes, and special paths
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/_vercel/') ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/libs/') ||
    url.pathname.startsWith('/image/') ||
    url.pathname.startsWith('/functions/') ||
    url.pathname.startsWith('/netlify/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|webp|mp4|webm)$/i)
  ) {
    return; // Pass through static resources
  }

  // Only process HTML pages
  const isHtmlPage =
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.startsWith('/s=') ||
    url.pathname.startsWith('/watch');

  if (!isHtmlPage) {
    return;
  }

  try {
    // Fetch the original response
    const response = await fetch(request);

    // Check if it's an HTML response
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    // Get the HTML content
    const originalHtml = await response.text();

    // Get environment variables
    const password = process.env.PASSWORD || '';
    const adminpassword = process.env.ADMINPASSWORD || '';

    // Simple sha256 implementation for Edge Runtime
    const getHash = async (message) => {
      if (!message) return '';
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const passwordHash = await getHash(password);
    const adminpasswordHash = await getHash(adminpassword);

    // Replace the placeholders
    let modifiedHtml = originalHtml
      .replace(
        'window.__ENV__.PASSWORD = "{{PASSWORD}}";',
        `window.__ENV__.PASSWORD = "${passwordHash}";`
      )
      .replace(
        'window.__ENV__.ADMINPASSWORD = "{{ADMINPASSWORD}}";',
        `window.__ENV__.ADMINPASSWORD = "${adminpasswordHash}";`
      );

    // Clone headers and remove those that are now invalid
    const newHeaders = new Headers(response.headers);
    newHeaders.delete('content-length');
    newHeaders.delete('content-encoding');

    // Return the modified response
    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return; // Pass through on error
  }
}

export const config = {
  matcher: [
    '/',
    '/index.html',
    '/player.html',
    '/about.html',
    '/s=:path*',
    '/watch:path*'
  ],
};

