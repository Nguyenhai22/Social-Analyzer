// ========== CONFIG ==========
function getConfig() {
    return {
        YOUTUBE_API_KEY: localStorage.getItem('yt_api_key') || '',
        RAPIDAPI_KEY: localStorage.getItem('rapidapi_key') || '',
        RAPIDAPI_TIKTOK_KEY: localStorage.getItem('rapidapi_tiktok_key') || '',
        RAPIDAPI_INSTAGRAM_KEY: localStorage.getItem('rapidapi_instagram_key') || '',
        MAX_VIDEOS: 5,
    };
}

// ========== HISTORY ==========
const HISTORY_STORAGE_KEY = 'analyzer_history';
const MAX_HISTORY_ITEMS = 50;

// Platform colors matching CSS
const PLATFORM_COLORS = {
    YOUTUBE: { name: '▶ YouTube', class: 'youtube', accent: '#FF0000' },
    TIKTOK: { name: '♪ TikTok', class: 'tiktok', accent: '#EE1D52' },
    INSTAGRAM: { name: '📷 Instagram', class: 'instagram', accent: '#E1306C' },
    TWITCH: { name: '🎮 Twitch', class: 'twitch', accent: '#6441A5' },
    PINTEREST: { name: '📌 Pinterest', class: 'pinterest', accent: '#E60023' },
    LINKEDIN: { name: '💼 LinkedIn', class: 'linkedin', accent: '#0A66C2' },
    FACEBOOK: { name: 'f Facebook', class: 'facebook', accent: '#1877F2' },
    TWITTER: { name: '𝕏 Twitter/X', class: 'twitter', accent: '#000000' },
    UNKNOWN: { name: '🔗 Unknown', class: 'unknown', accent: '#555555' },
};

// ========== MOCK DATA ==========
const MOCK_DATA = {
    'youtube.com/channel/UC4JX40jDee_tINbkjyCMBg': {
        platform: 'YOUTUBE',
        name: 'mrbeast',
        handle: '@mrbeast',
        url: 'https://youtube.com/channel/UC4JX40jDee_tINbkjyCMBg',
        created: '18/02/2012',
        country: 'United States',
        subscribers: 204000000,
        totalVideos: 750,
        totalViews: 45000000000,
        videos: [
            { title: '$456,000 Squid Game In Real Life!', date: '03/11/2021', views: 225000000, likes: 5600000, comments: 487000, url: 'https://youtube.com/watch?v=example1' },
            { title: 'I Gave My 40,000,000th Subscriber 40 Million Dollars', date: '28/07/2022', views: 154000000, likes: 3900000, comments: 324000, url: 'https://youtube.com/watch?v=example2' },
            { title: 'I Bought Entire NBA Team', date: '15/04/2023', views: 180000000, likes: 4200000, comments: 456000, url: 'https://youtube.com/watch?v=example3' },
            { title: '$500,000 Extreme Hide and Seek!', date: '22/09/2023', views: 198000000, likes: 5100000, comments: 520000, url: 'https://youtube.com/watch?v=example4' },
            { title: 'Last To Leave Circle Wins $500,000', date: '10/12/2023', views: 167000000, likes: 4300000, comments: 389000, url: 'https://youtube.com/watch?v=example5' },
        ]
    },
    'tiktok.com/@khaby.lame': {
        platform: 'TIKTOK',
        name: 'Khaby Lame',
        handle: '@khaby.lame',
        url: 'https://tiktok.com/@khaby.lame',
        created: '—',
        country: 'Italy',
        subscribers: 162000000,
        totalVideos: 2540,
        totalViews: 15000000000,
        videos: [
            { title: 'When you take funny videos too seriously 😂', date: '15/06/2024', views: 45000000, likes: 3200000, comments: 125000, url: 'https://tiktok.com/@khaby.lame/video/example1' },
            { title: 'That face when 😭', date: '10/06/2024', views: 38000000, likes: 2800000, comments: 98000, url: 'https://tiktok.com/@khaby.lame/video/example2' },
            { title: 'POV: You are overthinking it 💀', date: '05/06/2024', views: 52000000, likes: 3900000, comments: 156000, url: 'https://tiktok.com/@khaby.lame/video/example3' },
            { title: 'Bruhhh moment 😂😂', date: '01/06/2024', views: 41000000, likes: 3100000, comments: 112000, url: 'https://tiktok.com/@khaby.lame/video/example4' },
            { title: 'When people overcomplicate things ✋', date: '28/05/2024', views: 36000000, likes: 2600000, comments: 87000, url: 'https://tiktok.com/@khaby.lame/video/example5' },
        ]
    },
    'instagram.com/cristiano': {
        platform: 'INSTAGRAM',
        name: 'Cristiano Ronaldo',
        handle: '@cristiano',
        url: 'https://instagram.com/cristiano',
        created: '—',
        country: 'Portugal',
        subscribers: 648000000,
        totalVideos: 3245,
        totalViews: 0,
        videos: [
            { title: 'Hard work beats talent 💪⚽', date: '20/06/2024', views: 45000000, likes: 2800000, comments: 325000, url: 'https://instagram.com/p/example1/' },
            { title: 'Family first, always ❤️', date: '18/06/2024', views: 38000000, likes: 2500000, comments: 298000, url: 'https://instagram.com/p/example2/' },
            { title: 'Training day 🏋️', date: '15/06/2024', views: 42000000, likes: 2700000, comments: 312000, url: 'https://instagram.com/p/example3/' },
            { title: 'Grateful for this journey ⚽🙏', date: '12/06/2024', views: 51000000, likes: 3100000, comments: 445000, url: 'https://instagram.com/p/example4/' },
            { title: 'Mentality is everything 👑', date: '10/06/2024', views: 39000000, likes: 2600000, comments: 287000, url: 'https://instagram.com/p/example5/' },
        ]
    }
};

// ========== DOM ELEMENTS ==========
const linksInput = document.getElementById('links-input');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const demoBtn = document.getElementById('demo-btn');
const resultsContainer = document.getElementById('results-container');
const statusBar = document.getElementById('status');
const historyContainer = document.getElementById('history-container');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const openAdminBtn = document.getElementById('open-admin-btn');

// ========== EVENT LISTENERS ==========
analyzeBtn.addEventListener('click', handleAnalyze);
clearBtn.addEventListener('click', handleClear);
demoBtn.addEventListener('click', handleDemo);
clearHistoryBtn.addEventListener('click', handleClearHistory);
if (openAdminBtn) openAdminBtn.addEventListener('click', () => window.location.href = 'admin.html');

// Load history on page load
window.addEventListener('load', loadHistory);

// ========== MAIN FUNCTIONS ==========

function handleAnalyze() {
    const links = linksInput.value
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);

    if (links.length === 0) {
        showStatus('❌ Vui lòng nhập ít nhất một link!', 'error');
        return;
    }

    // Quick validation: ensure required API keys are present for pasted platforms
    const hasYouTube = links.some(l => detectPlatform(l) === 'YOUTUBE');
    const hasRapid = links.some(l => detectPlatform(l) === 'TIKTOK' || detectPlatform(l) === 'INSTAGRAM');
    const cfg = getConfig();
    if (hasYouTube && !cfg.YOUTUBE_API_KEY) {
        showStatus('❌ YouTube API Key chưa được cấu hình. Mở Admin Panel và lưu YouTube API Key.', 'error');
        return;
    }
    if (hasRapid && !cfg.RAPIDAPI_KEY) {
        showStatus('❌ RapidAPI Key chưa được cấu hình. Mở Admin Panel và lưu RapidAPI Key.', 'error');
        return;
    }

    analyzeLinks(links);
}

function handleClear() {
    linksInput.value = '';
    resultsContainer.innerHTML = '<div class="empty-state"><p>📍 Nhập các link kênh để bắt đầu phân tích...</p></div>';
    statusBar.classList.remove('active');
}

function handleDemo() {
    const demoLinks = [
        'https://youtube.com/channel/UC4JX40jDee_tINbkjyCMBg',
        'https://tiktok.com/@khaby.lame',
        'https://instagram.com/cristiano'
    ];
    linksInput.value = demoLinks.join('\n');
    analyzeLinks(demoLinks);
}

async function analyzeLinks(links) {
    resultsContainer.innerHTML = '';
    showStatus(`⏳ Đang phân tích ${links.length} link...`, 'loading');

    let processed = 0;
    let errors = [];
    let results = [];

    for (const link of links) {
        try {
            const platform = detectPlatform(link);
            showStatus(`⏳ Đang xử lý (${++processed}/${links.length}): ${link}`, 'loading');

            let data = null;

            if (platform === 'YOUTUBE') {
                data = await fetchYouTubeData(link);
            } else if (platform === 'TIKTOK') {
                data = await fetchTikTokData(link);
            } else if (platform === 'INSTAGRAM') {
                data = await fetchInstagramData(link);
            } else {
                errors.push(`❌ Không nhận ra: ${link}`);
                continue;
            }

            if (data) {
                renderResultCard(data, platform);
                results.push(data);
            }
        } catch (error) {
            errors.push(`❌ ${link}: ${error.message}`);
        }

        // Small delay to avoid rate limiting
        await sleep(300);
    }

    // Save to history
    saveToHistory(links, results, errors);

    if (errors.length > 0) {
        showStatus(`✅ Hoàn thành! (${processed} thành công, ${errors.length} lỗi)`, 'error');
    } else {
        showStatus(`✅ Hoàn thành! Đã phân tích ${processed} kênh.`, 'success');
    }
}

// ========== PLATFORM DETECTION ==========

function detectPlatform(url) {
    url = url.toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YOUTUBE';
    if (url.includes('tiktok.com')) return 'TIKTOK';
    if (url.includes('instagram.com')) return 'INSTAGRAM';
    if (url.includes('twitch.tv')) return 'TWITCH';
    if (url.includes('pinterest.com')) return 'PINTEREST';
    if (url.includes('linkedin.com')) return 'LINKEDIN';
    if (url.includes('facebook.com')) return 'FACEBOOK';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'TWITTER';
    return 'UNKNOWN';
}

// ========== FETCH DATA FUNCTIONS ==========

async function fetchYouTubeData(url) {
    // Try mock data first
    for (const key in MOCK_DATA) {
        if (url.includes(key)) {
            return MOCK_DATA[key];
        }
    }

    // Read API key at runtime
    const cfg = getConfig();
    const key = cfg.YOUTUBE_API_KEY;
    if (!key) {
        throw new Error('YouTube API Key chưa được cấu hình. Mở Admin Panel và lưu YouTube API Key.');
    }

    // Resolve channelId from URL or handle
    let channelId = extractYouTubeChannelId(url);
    if (!channelId) {
        const handle = extractYouTubeHandle(url);
        if (handle) {
            const h = handle.startsWith('@') ? handle.substring(1) : handle;
            // Try username lookup first
            try {
                let resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(h)}&key=${key}`);
                let data = await resp.json();
                if (data.items && data.items.length) channelId = data.items[0].id;
                else {
                    // Try forHandle (newer handles)
                    resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(h)}&key=${key}`);
                    data = await resp.json();
                    if (data.items && data.items.length) channelId = data.items[0].id;
                }
            } catch (err) {
                throw new Error('Lỗi khi truy vấn YouTube API: ' + err.message);
            }
        }
    }

    if (!channelId) {
        throw new Error('Không thể xác định Channel ID từ URL. Vui lòng nhập link dạng /channel/UC... hoặc kiểm tra lại link.');
    }

    // Fetch channel details
    try {
        const chResp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${key}`);
        const chData = await chResp.json();
        if (chData.error) {
            throw new Error(chData.error.message || JSON.stringify(chData.error));
        }
        if (!chData.items || !chData.items.length) {
            throw new Error('Không tìm thấy kênh trên YouTube.');
        }

        const item = chData.items[0];
        const name = item.snippet.title || 'Unknown';
        const handle = item.snippet.customUrl ? ('@' + item.snippet.customUrl) : (item.snippet.channelId || '');
        const subscribers = Number(item.statistics.subscriberCount || 0);
        const totalVideos = Number(item.statistics.videoCount || 0);
        const totalViews = Number(item.statistics.viewCount || 0);
        const created = item.snippet.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString('vi-VN') : 'N/A';

        const result = {
            platform: 'YOUTUBE',
            name,
            handle,
            url: `https://youtube.com/channel/${channelId}`,
            created,
            country: 'N/A',
            subscribers,
            totalVideos,
            totalViews,
            videos: []
        };

        // Try fetching recent videos (best-effort)
        try {
            const max = cfg.MAX_VIDEOS || 5;
            const searchResp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${max}&type=video&key=${key}`);
            const searchData = await searchResp.json();
            if (searchData.items && searchData.items.length) {
                const videoIds = searchData.items.map(it => it.id.videoId).filter(Boolean).join(',');
                if (videoIds) {
                    const vidsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${key}`);
                    const vidsData = await vidsResp.json();
                    if (vidsData.items) {
                        result.videos = vidsData.items.map(v => ({
                            title: v.snippet.title,
                            date: v.snippet.publishedAt ? new Date(v.snippet.publishedAt).toLocaleDateString('vi-VN') : 'N/A',
                            views: Number(v.statistics.viewCount || 0),
                            likes: Number(v.statistics.likeCount || 0),
                            comments: Number(v.statistics.commentCount || 0),
                            url: `https://youtube.com/watch?v=${v.id}`
                        }));
                    }
                }
            }
        } catch (e) {
            // Non-fatal: continue without video details
            console.warn('Không lấy được dữ liệu video:', e.message);
        }

        return result;
    } catch (err) {
        throw new Error('YouTube API Error: ' + err.message);
    }
}

async function fetchTikTokData(url) {
    // Try mock data first
    for (const key in MOCK_DATA) {
        if (url.includes(key)) {
            return MOCK_DATA[key];
        }
    }

    const cfg = getConfig();
    const key = cfg.RAPIDAPI_TIKTOK_KEY || cfg.RAPIDAPI_KEY;
    if (!key) {
        throw new Error('RapidAPI Key cho TikTok chưa được cấu hình. Mở Admin Panel và lưu RapidAPI TikTok Key.');
    }

    // Extract username
    const m = url.match(/tiktok\.com\/@([\w.\-]+)/i);
    const username = m ? m[1] : null;
    if (!username) throw new Error('Không thể trích username TikTok từ URL. Vui lòng kiểm tra link.');

    try {
        const response = await fetch(`https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': key,
                'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
            }
        });
        const data = await response.json();
        if (!data || data.message || data.error) {
            throw new Error(data.message || data.error || 'Phản hồi TikTok không hợp lệ');
        }

        // Map response to internal format (best-effort)
        const info = data.userInfo || data.user || data;
        const result = {
            platform: 'TIKTOK',
            name: info.user?.nickname || info.nickname || username,
            handle: '@' + username,
            url: url,
            created: info.createTime ? new Date(info.createTime * 1000).toLocaleDateString('vi-VN') : 'N/A',
            country: info.country || 'N/A',
            subscribers: Number(info.stats?.followerCount || info.followerCount || 0),
            totalVideos: Number(info.stats?.videoCount || info.videoCount || 0),
            totalViews: Number(info.stats?.playCount || 0),
            videos: []
        };

        return result;
    } catch (err) {
        throw new Error('Lỗi khi gọi TikTok API: ' + err.message);
    }
}

async function fetchInstagramData(url) {
    // Try mock data first
    for (const key in MOCK_DATA) {
        if (url.includes(key)) {
            return MOCK_DATA[key];
        }
    }

    const cfg = getConfig();
    const key = cfg.RAPIDAPI_INSTAGRAM_KEY || cfg.RAPIDAPI_KEY;
    if (!key) {
        throw new Error('RapidAPI Key cho Instagram chưa được cấu hình. Mở Admin Panel và lưu RapidAPI Instagram Key.');
    }

    // Clean url and extract username
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const m = cleanUrl.match(/instagram\.com\/([\w.\-]+)/i) || ['',''];
    const username = m[1];
    if (!username || username === 'p' || username === 'reel') throw new Error('Không lấy được username từ: ' + url);

    const IG_HOST = 'instagram-scraper-20251.p.rapidapi.com';
    const headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': IG_HOST };

    // Fetch user info
    let user = null;
    try {
        const uResp = await fetch(`https://${IG_HOST}/userinfo/?username_or_id=${encodeURIComponent(username)}`, { method: 'GET', headers });
        const rawUser = await uResp.text();
        let respUser = null;
        try { respUser = JSON.parse(rawUser); } catch(e) { respUser = rawUser; }
        user = (respUser && (respUser.data || respUser.user || (respUser.graphql && respUser.graphql.user))) || respUser;
        if (!user || (!user.username && !user.id && !user.pk)) {
            throw new Error('IG user response: ' + (typeof rawUser === 'string' ? rawUser.slice(0,200) : JSON.stringify(rawUser).slice(0,200)));
        }
    } catch (err) {
        throw new Error('Lỗi khi lấy thông tin IG user: ' + err.message);
    }

    // Try several endpoints to get posts
    let posts = [];
    const max = cfg.MAX_VIDEOS || 5;
    const postEndpoints = [
        `https://${IG_HOST}/user-posts/?username_or_id=${encodeURIComponent(username)}&count=${max}`,
        `https://${IG_HOST}/posts/?username_or_id_or_url=${encodeURIComponent(username)}&count=${max}`,
        `https://${IG_HOST}/userposts/?username_or_id=${encodeURIComponent(username)}`,
    ];

    for (let i = 0; i < postEndpoints.length; i++) {
        try {
            const pResp = await fetch(postEndpoints[i], { method: 'GET', headers });
            const rawPosts = await pResp.text();
            let rp = null;
            try { rp = JSON.parse(rawPosts); } catch(e) { rp = rawPosts; }

            const items = (rp && (
                (rp.data && rp.data.items) ||
                (rp.data && Array.isArray(rp.data) && rp.data) ||
                rp.items ||
                (rp.response && rp.response.items) ||
                rp.media || rp.medias || rp.items
            )) || [];

            if (Array.isArray(items) && items.length > 0) {
                posts = items.slice(0, max).map(p => {
                    const caption = (p.caption && p.caption.text) ||
                        (p.edge_media_to_caption && p.edge_media_to_caption.edges && p.edge_media_to_caption.edges[0] && p.edge_media_to_caption.edges[0].node && p.edge_media_to_caption.edges[0].node.text) ||
                        p.title || p.content || '(Không có caption)';
                    const date = p.taken_at ? new Date(p.taken_at * 1000).toLocaleDateString('vi-VN') : (p.timestamp ? new Date(p.timestamp * 1000).toLocaleDateString('vi-VN') : '—');
                    const views = parseInt(p.play_count || p.view_count || p.video_view_count || (p.video_stats && p.video_stats.view_count) || 0) || 0;
                    const likes = parseInt(p.like_count || (p.edge_media_preview_like && p.edge_media_preview_like.count) || (p.edge_liked_by && p.edge_liked_by.count) || 0) || 0;
                    const comments = parseInt(p.comment_count || (p.edge_media_to_comment && p.edge_media_to_comment.count) || 0) || 0;
                    const urlp = p.code ? ('https://instagram.com/p/' + p.code + '/') : (p.link || p.url || ('https://instagram.com/' + username + '/'));
                    return {
                        title: String(caption).slice(0,100),
                        date,
                        views,
                        likes,
                        comments,
                        url: urlp
                    };
                });
                break;
            }
        } catch (e) {
            // try next endpoint
            console.warn('IG posts endpoint ' + i + ' error: ' + (e && e.message));
        }
    }

    return {
        platform: 'INSTAGRAM',
        name: user.full_name || user.name || user.username || username,
        handle: '@' + (user.username || username),
        url: 'https://instagram.com/' + username,
        created: '—',
        country: '—',
        subscribers: parseInt(user.follower_count || (user.edge_followed_by && user.edge_followed_by.count) || 0) || 0,
        totalVideos: parseInt(user.media_count || 0) || 0,
        totalViews: 0,
        videos: posts,
    };
}

// ========== RENDER RESULTS ==========

function renderResultCard(data, platform) {
    const platformInfo = PLATFORM_COLORS[platform] || PLATFORM_COLORS.UNKNOWN;
    const card = document.createElement('div');
    card.className = `result-card ${platformInfo.class}`;

    // Card Header
    const header = document.createElement('div');
    header.className = `card-header ${platformInfo.class}`;
    header.innerHTML = `
        <div class="channel-info">
            <span class="platform-badge ${platformInfo.class}">${platformInfo.name}</span>
            <div class="channel-details">
                <div class="channel-name">${data.name || 'Unknown'}</div>
                <div class="channel-handle">${data.handle || 'N/A'}</div>
            </div>
        </div>
        <a href="${data.url}" target="_blank" class="channel-link">🔗 Xem kênh</a>
    `;

    // Stats Grid
    const stats = document.createElement('div');
    stats.className = 'stats-grid';
    stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">👥 Followers</div>
            <div class="stat-value number">${formatNumber(data.subscribers)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">🎬 Videos</div>
            <div class="stat-value number">${formatNumber(data.totalVideos)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">👁 Views</div>
            <div class="stat-value number">${formatNumber(data.totalViews)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">📅 Tạo</div>
            <div class="stat-value">${data.created || 'N/A'}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">🌏 Quốc gia</div>
            <div class="stat-value">${data.country || 'N/A'}</div>
        </div>
    `;

    // Videos Section
    let videosHTML = '<div class="videos-section"><div class="videos-title">📹 Video gần đây</div>';
    
    if (data.videos && data.videos.length > 0) {
        videosHTML += '<table class="videos-table"><thead><tr><th>#</th><th>Tiêu đề</th><th>Ngày</th><th>Views</th><th>Likes</th><th>Comments</th><th>Link</th></tr></thead><tbody>';
        
        data.videos.forEach((video, index) => {
            videosHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="video-title">${video.title}</td>
                    <td>${video.date}</td>
                    <td class="stat-value number">${formatNumber(video.views)}</td>
                    <td class="stat-value number">${formatNumber(video.likes)}</td>
                    <td class="stat-value number">${formatNumber(video.comments)}</td>
                    <td><a href="${video.url}" target="_blank" class="video-link">🔗</a></td>
                </tr>
            `;
        });
        
        videosHTML += '</tbody></table>';
    } else {
        videosHTML += '<p style="color: var(--text-muted); padding: 15px;">Không có dữ liệu video</p>';
    }
    
    videosHTML += '</div>';

    // Assemble card
    card.appendChild(header);
    card.appendChild(stats);
    card.innerHTML += videosHTML;
    resultsContainer.appendChild(card);
}

// ========== UTILITY FUNCTIONS ==========

function formatNumber(num) {
    if (!num || num === 0) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function showStatus(message, type = 'info') {
    statusBar.classList.add('active');
    statusBar.classList.remove('loading', 'success', 'error');
    statusBar.classList.add(type);
    
    const spinner = type === 'loading' ? '<span class="loader"></span>' : '';
    statusBar.innerHTML = spinner + message;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== HISTORY MANAGEMENT ==========

function saveToHistory(links, results, errors) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('vi-VN'),
        linksCount: links.length,
        successCount: results.length,
        errorCount: errors.length,
        results: results.map(item => ({
            platform: item.platform,
            name: item.name,
            link: item.url,
            subscribers: item.subscribers,
            totalVideos: item.totalVideos,
            totalViews: item.totalViews,
            created: item.created,
            country: item.country,
            videos: item.videos || []
        })),
        errors,
    };

    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    history.unshift(historyItem);
    
    // Keep only latest 50 items
    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">Chưa có lịch sử phân tích nào</p>';
        return;
    }

    historyContainer.innerHTML = history.map((item, index) => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-info">
                <div class="history-time">🕐 ${item.timestamp}</div>
                <div class="history-stats">
                    📊 ${item.linksCount} link • ✅ ${item.successCount} thành công • ❌ ${item.errorCount} lỗi
                </div>
                <div class="history-results">
                    ${item.results.map(r => `<span class="history-tag ${r.platform.toLowerCase()}">${r.platform}: ${r.name}</span>`).join('')}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn btn-small" onclick="showHistoryDetail(${item.id})">🔍 Xem chi tiết</button>
                <button class="history-delete-btn" onclick="deleteHistoryItem(${item.id})">✕</button>
            </div>
        </div>
    `).join('');

    // Attach export button handler (exists in DOM)
    const exportBtn = document.getElementById('export-history-btn');
    if (exportBtn) exportBtn.onclick = exportHistoryToCSV;
}

function showHistoryDetail(id) {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    const item = history.find(h => h.id === id);
    if (!item) {
        alert('Không tìm thấy mục lịch sử.');
        return;
    }

    const modal = document.getElementById('history-modal');
    const body = document.getElementById('history-modal-body');
    const title = document.getElementById('history-modal-title');
    const closeBtn = document.getElementById('history-modal-close');

    title.textContent = `Chi tiết: ${item.timestamp}`;
    let html = `<p>Links: ${item.linksCount} • Thành công: ${item.successCount} • Lỗi: ${item.errorCount}</p>`;
    html += '<h4>Chi tiết kết quả</h4>';
    if (item.results && item.results.length) {
        html += '<ul style="padding-left:18px;">';
        item.results.forEach(r => {
            html += `<li><strong>${r.platform}</strong>: ${r.name} — <a href="${r.link}" target="_blank">Xem</a></li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>Không có kết quả chi tiết.</p>';
    }

    body.innerHTML = html;
    modal.style.display = 'flex';

    // Close handlers
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function exportHistoryToCSV() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    if (!history.length) { alert('Không có lịch sử để xuất.'); return; }

    // Build CSV rows: one row per result entry with parent metadata
    const rows = [];
    rows.push(['history_id','timestamp','links_count','success_count','error_count','platform','name','link'].join(','));
    history.forEach(h => {
        if (h.results && h.results.length) {
            h.results.forEach(r => {
                const row = [
                    '"' + h.id + '"',
                    '"' + h.timestamp + '"',
                    h.linksCount,
                    h.successCount,
                    h.errorCount,
                    '"' + (r.platform || '') + '"',
                    '"' + (r.name || '') + '"',
                    '"' + (r.link || '') + '"'
                ];
                rows.push(row.join(','));
            });
        } else {
            const row = ['"' + h.id + '"', '"' + h.timestamp + '"', h.linksCount, h.successCount, h.errorCount, '', '', ''];
            rows.push(row.join(','));
        }
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyzer_history_' + (new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleClearHistory() {
    if (confirm('⚠️ Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        loadHistory();
        showStatus('✅ Lịch sử đã xóa!', 'success');
        setTimeout(() => statusBar.classList.remove('active'), 2000);
    }
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    history = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    loadHistory();
}

// ========== EXTRACT HELPERS (Ready for real API) ==========

function extractYouTubeChannelId(url) {
    const match = url.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    return match ? match[1] : null;
}

function extractYouTubeHandle(url) {
    const match1 = url.match(/youtube\.com\/@([\w.-]+)/);
    if (match1) return '@' + match1[1];
    const match2 = url.match(/youtube\.com\/(?:c|user)\/([\w.-]+)/);
    if (match2) return match2[1];
    return null;
}

console.log('🎬 Social Media Analyzer loaded!');
console.log('📌 Hướng dẫn: Thêm API keys ở phần cấu hình để bắt đầu phân tích kênh thật.');
