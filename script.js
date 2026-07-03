const DEFAULT_SUPABASE_URL = 'https://lzgeocvfzmjheywonenf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GYTVNGz5s917E8l245RSWQ_iTCFF6et';

function getConfig() {
    const storedSupabaseUrl = (localStorage.getItem('supabase_url') || '').trim();
    const storedSupabaseKey = (localStorage.getItem('supabase_anon_key') || '').trim();
    const storedApiEndpoint = (localStorage.getItem('sync_api_endpoint') || '').trim();

    const supabaseUrl = storedSupabaseUrl || DEFAULT_SUPABASE_URL;
    const supabaseKey = storedSupabaseKey || DEFAULT_SUPABASE_ANON_KEY;
    const hasSupabase = Boolean(supabaseUrl && supabaseKey);
    const hasEndpoint = Boolean(storedApiEndpoint);

    return {
        YOUTUBE_API_KEY: (localStorage.getItem('yt_api_key') || '').trim(),
        RAPIDAPI_KEY: (localStorage.getItem('rapidapi_key') || '').trim(),
        RAPIDAPI_TIKTOK_KEY: (localStorage.getItem('rapidapi_tiktok_key') || '').trim(),
        RAPIDAPI_INSTAGRAM_KEY: (localStorage.getItem('rapidapi_instagram_key') || '').trim(),
        SUPABASE_URL: supabaseUrl,
        SUPABASE_ANON_KEY: supabaseKey,
        API_ENDPOINT: storedApiEndpoint,
        SYNC_ENABLED: hasSupabase || hasEndpoint,
        MAX_VIDEOS: RECENT_VIDEO_LIMIT,
    };
}

function interpretSupabaseError(text) {
    if (!text) return text;
    if (text.includes('row-level security policy')) {
        return 'RLS chặn quyền INSERT cho role anon trên bảng History_API_Analyst. Vui lòng tạo policy INSERT cho anon hoặc tắt RLS.';
    }
    return text;
}

async function getSupabaseApiKey(apiName) {
    const cfg = getConfig();
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;

    const baseUrl = cfg.SUPABASE_URL.replace(/\/$/, '');
    const wildcard = encodeURIComponent(`%${apiName}%`);
    const exact = encodeURIComponent(apiName);
    const endpoints = [
        `${baseUrl}/rest/v1/API_Key?select=API_Code&API_Name=ilike.${wildcard}&limit=1`,
        `${baseUrl}/rest/v1/API_Key?select=API_Code&API_Name=eq.${exact}&limit=1`,
        `${baseUrl}/rest/v1/API_Key?select=api_code&api_name=ilike.${wildcard}&limit=1`,
        `${baseUrl}/rest/v1/API_Key?select=api_code&api_name=eq.${exact}&limit=1`,
        `${baseUrl}/rest/v1/api_key?select=API_Code&API_Name=ilike.${wildcard}&limit=1`,
        `${baseUrl}/rest/v1/api_key?select=API_Code&API_Name=eq.${exact}&limit=1`,
        `${baseUrl}/rest/v1/api_key?select=api_code&api_name=ilike.${wildcard}&limit=1`,
        `${baseUrl}/rest/v1/api_key?select=api_code&api_name=eq.${exact}&limit=1`
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': cfg.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${cfg.SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            const text = await response.text();
            if (!response.ok) {
                console.warn(`Supabase API_Key lookup failed (${response.status}) at ${url}: ${text}`);
                continue;
            }
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.warn('Supabase API_Key lookup returned invalid JSON:', text);
                continue;
            }
            if (Array.isArray(data) && data.length > 0) {
                const code = data[0].API_Code || data[0].api_code || null;
                if (code) return code;
            }
        } catch (error) {
            console.warn('Supabase API_Key lookup network error:', error.message || error);
        }
    }

    console.warn(`Supabase API_Key row not found for '${apiName}'.`);
    return null;
}

const HISTORY_STORAGE_KEY = 'analyzer_history';
const MAX_HISTORY_ITEMS = 50;
const RECENT_VIDEO_LIMIT = 3;
const SUPABASE_HISTORY_TABLE = 'History_API_Analyst';
const SUPABASE_CHANNEL_COLUMN = 'kênh';

function normalizeChannelIdName(value) {
    return String(value || 'Unknown')
        .trim()
        .replace(/^@+/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'Unknown';
}

function makeVideoRowId(channelName, index) {
    return `${normalizeChannelIdName(channelName)}_${String(index + 1).padStart(2, '0')}`;
}
const PLATFORM_COLORS = {
    YOUTUBE: { name: '▶ YouTube', class: 'youtube', accent: '#FF4D4F' },
    TIKTOK: { name: '♪ TikTok', class: 'tiktok', accent: '#EC4899' },
    INSTAGRAM: { name: '📷 Instagram', class: 'instagram', accent: '#F43F5E' },
    TWITCH: { name: '🎮 Twitch', class: 'twitch', accent: '#8B5CF6' },
    PINTEREST: { name: '📌 Pinterest', class: 'pinterest', accent: '#FB7185' },
    LINKEDIN: { name: '💼 LinkedIn', class: 'linkedin', accent: '#38BDF8' },
    FACEBOOK: { name: 'f Facebook', class: 'facebook', accent: '#60A5FA' },
    TWITTER: { name: '𝕏 Twitter/X', class: 'twitter', accent: '#111827' },
    UNKNOWN: { name: '🔗 Unknown', class: 'unknown', accent: '#555555' },
};

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
            { title: 'I Bought Entire NBA Team', date: '15/04/2023', views: 180000000, likes: 4200000, comments: 456000, url: 'https://youtube.com/watch?v=example3' }
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
            { title: 'POV: You are overthinking it 💀', date: '05/06/2024', views: 52000000, likes: 3900000, comments: 156000, url: 'https://tiktok.com/@khaby.lame/video/example3' }
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
            { title: 'Training day 🏋️', date: '15/06/2024', views: 42000000, likes: 2700000, comments: 312000, url: 'https://instagram.com/p/example3/' }
        ]
    }
};

const linksInput = document.getElementById('links-input');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeBtnPrimary = document.getElementById('analyze-btn-primary');
const clearBtn = document.getElementById('clear-btn');
const resultsContainer = document.getElementById('results-container');
const statusBar = document.getElementById('status');
const historyContainer = document.getElementById('history-container');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const openAdminBtn = document.getElementById('open-admin-btn');
const syncBtn = document.getElementById('sync-btn');
const overviewTotal = document.getElementById('overview-total');
const overviewSuccess = document.getElementById('overview-success');
const overviewSync = document.getElementById('overview-sync');

analyzeBtn?.addEventListener('click', handleAnalyze);
analyzeBtnPrimary?.addEventListener('click', handleAnalyze);
clearBtn?.addEventListener('click', handleClear);
clearHistoryBtn?.addEventListener('click', handleClearHistory);
syncBtn?.addEventListener('click', handleSyncNow);
if (openAdminBtn) openAdminBtn.addEventListener('click', () => window.location.href = 'admin.html');
window.addEventListener('load', async () => {
    loadHistory();
    updateOverview();
    await autoSyncLatestHistory();
});

function handleAnalyze() {
    const links = linksInput.value.split('\n').map(link => link.trim()).filter(Boolean);
    if (links.length === 0) {
        showStatus('❌ Vui lòng nhập ít nhất một link!', 'error');
        return;
    }
    analyzeLinks(links);
}

function handleClear() {
    linksInput.value = '';
    resultsContainer.innerHTML = '<div class="empty-state"><p>📍 Nhập các link để bắt đầu phân tích...</p></div>';
    statusBar.classList.remove('active');
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
            if (platform === 'YOUTUBE') data = await fetchYouTubeData(link);
            else if (platform === 'TIKTOK') data = await fetchTikTokData(link);
            else if (platform === 'INSTAGRAM') data = await fetchInstagramData(link);
            else { errors.push(`❌ Không nhận ra: ${link}`); continue; }

            if (data) {
                renderResultCard(data, platform);
                results.push(data);
            }
        } catch (error) {
            errors.push(`❌ ${link}: ${error.message}`);
        }
        await sleep(300);
    }

    const historyItem = saveToHistory(links, results, errors);
    const cfg = getConfig();
    let syncResponse = null;
    if (cfg.SYNC_ENABLED) {
        syncResponse = await syncResultsToExternal(results, links, historyItem);
    }
    updateOverview();

    if (errors.length > 0) {
        if (syncResponse && !syncResponse.success) {
            showStatus(`⚠️ Hoàn thành ${results.length} kênh, ${errors.length} lỗi. Đồng bộ thất bại: ${syncResponse.supabase.error || syncResponse.endpoint.error || 'Không rõ'}`, 'error');
        } else {
            showStatus(`✅ Hoàn thành! ${results.length} kênh thành công, ${errors.length} lỗi. Đồng bộ tự động đã chạy.`, 'error');
        }
    } else {
        if (syncResponse && !syncResponse.success) {
            showStatus(`⚠️ Đã phân tích ${results.length} kênh nhưng đồng bộ thất bại: ${syncResponse.supabase.error || syncResponse.endpoint.error || 'Không rõ'}`, 'error');
        } else if (syncResponse && syncResponse.success) {
            showStatus(`✅ Hoàn thành! Đã phân tích ${results.length} kênh. Đồng bộ tự động đã chạy.`, 'success');
        } else {
            showStatus(`✅ Hoàn thành! Đã phân tích ${results.length} kênh.`, 'success');
        }
    }
}

function detectPlatform(url) {
    const value = String(url || '').toLowerCase();
    if (value.includes('youtube.com') || value.includes('youtu.be')) return 'YOUTUBE';
    if (value.includes('tiktok.com')) return 'TIKTOK';
    if (value.includes('instagram.com')) return 'INSTAGRAM';
    if (value.includes('twitch.tv')) return 'TWITCH';
    if (value.includes('pinterest.com')) return 'PINTEREST';
    if (value.includes('linkedin.com')) return 'LINKEDIN';
    if (value.includes('facebook.com')) return 'FACEBOOK';
    if (value.includes('twitter.com') || value.includes('x.com')) return 'TWITTER';
    return 'UNKNOWN';
}

async function fetchYouTubeData(url) {
    for (const key in MOCK_DATA) {
        if (url.includes(key)) return { ...MOCK_DATA[key], source: 'mock' };
    }

    const cfg = getConfig();
    let key = cfg.YOUTUBE_API_KEY;
    if (!key) {
        key = await getSupabaseApiKey('YouTube');
    }
    if (!key) throw new Error('YouTube API Key chưa được cấu hình. Mở trang Cấu hình để thêm key hoặc cấu hình Supabase.');

    let channelId = extractYouTubeChannelId(url);
    if (!channelId) {
        const handle = extractYouTubeHandle(url);
        if (handle) {
            const h = handle.startsWith('@') ? handle.substring(1) : handle;
            try {
                let resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(h)}&key=${key}`);
                let data = await resp.json();
                if (data.items?.length) channelId = data.items[0].id;
                else {
                    resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(h)}&key=${key}`);
                    data = await resp.json();
                    if (data.items?.length) channelId = data.items[0].id;
                }
            } catch (err) {
                throw new Error('Lỗi khi truy vấn YouTube API: ' + err.message);
            }
        }
    }
    if (!channelId) throw new Error('Không thể xác định Channel ID từ URL.');

    const chResp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${key}`);
    const chData = await chResp.json();
    if (chData.error) throw new Error(chData.error.message || 'Lỗi YouTube API');
    if (!chData.items?.length) throw new Error('Không tìm thấy kênh trên YouTube.');

    const item = chData.items[0];
    const result = {
        platform: 'YOUTUBE',
        name: item.snippet.title || 'Unknown',
        handle: item.snippet.customUrl ? '@' + item.snippet.customUrl : (item.snippet.channelId || ''),
        url: `https://youtube.com/channel/${channelId}`,
        created: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString('vi-VN') : 'N/A',
        country: 'N/A',
        subscribers: Number(item.statistics.subscriberCount || 0),
        totalVideos: Number(item.statistics.videoCount || 0),
        totalViews: Number(item.statistics.viewCount || 0),
        videos: []
    };

    try {
        const max = cfg.MAX_VIDEOS || RECENT_VIDEO_LIMIT;
        const searchResp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${max}&type=video&key=${key}`);
        const searchData = await searchResp.json();
        if (searchData.items?.length) {
            const videoIds = searchData.items.map(it => it.id.videoId).filter(Boolean);
            if (videoIds.length) {
                const vidsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${key}`);
                const vidsData = await vidsResp.json();
                if (vidsData.items) {
                    const videoMap = new Map(vidsData.items.map(v => [v.id, v]));
                    result.videos = videoIds.map(id => videoMap.get(id)).filter(Boolean).map(v => ({
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
        console.warn('Không lấy được video details:', e.message);
    }

    return result;
}

async function fetchTikTokData(url) {
    for (const key in MOCK_DATA) {
        if (url.includes(key)) return { ...MOCK_DATA[key], source: 'mock' };
    }

    const cfg = getConfig();
    let key = cfg.RAPIDAPI_TIKTOK_KEY || cfg.RAPIDAPI_KEY;
    if (!key) {
        key = await getSupabaseApiKey('TikTok');
    }
    if (!key) throw new Error('RapidAPI TikTok key chưa được cấu hình. Mở trang Cấu hình để thêm key hoặc cấu hình Supabase.');

    const m = url.match(/tiktok\.com\/@([\w.\-]+)/i);
    const username = m ? m[1] : null;
    if (!username) throw new Error('Không thể trích username TikTok từ URL.');

    const host = 'tiktok-api23.p.rapidapi.com';
    const headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': host };
    const response = await fetch(`https://${host}/api/user/info?uniqueId=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers
    });
    const data = await response.json();
    if (!data || data.message || data.error) throw new Error(data.message || data.error || 'Phản hồi TikTok không hợp lệ');

    const info = data.userInfo || data.user || data;
    const result = {
        platform: 'TIKTOK',
        name: info.user?.nickname || info.nickname || username,
        handle: '@' + username,
        url,
        created: info.createTime ? new Date(info.createTime * 1000).toLocaleDateString('vi-VN') : 'N/A',
        country: info.country || 'N/A',
        subscribers: Number(info.stats?.followerCount || info.followerCount || 0),
        totalVideos: Number(info.stats?.videoCount || info.videoCount || 0),
        totalViews: Number(info.stats?.playCount || 0),
        videos: []
    };

    const max = cfg.MAX_VIDEOS || RECENT_VIDEO_LIMIT;
    const postEndpoints = [
        `https://${host}/api/user/posts?uniqueId=${encodeURIComponent(username)}&count=${max}`,
        `https://${host}/api/user/posts?secUid=${encodeURIComponent(info.user?.secUid || info.secUid || '')}&count=${max}`
    ].filter(endpoint => !endpoint.includes('secUid=&'));

    for (const endpoint of postEndpoints) {
        try {
            const postsResponse = await fetch(endpoint, { method: 'GET', headers });
            const postsData = await postsResponse.json();
            const items = postsData.itemList || postsData.items || postsData.videos || postsData.data?.itemList || postsData.data?.items || postsData.data?.videos || [];
            if (Array.isArray(items) && items.length) {
                result.videos = items.slice(0, max).map(video => {
                    const stats = video.stats || video.statistics || {};
                    const author = video.author?.uniqueId || username;
                    const videoId = video.id || video.aweme_id || video.video_id || '';
                    return {
                        title: video.desc || video.title || video.caption || '(Không có caption)',
                        date: video.createTime ? new Date(Number(video.createTime) * 1000).toLocaleDateString('vi-VN') : '—',
                        views: Number(stats.playCount || stats.play_count || video.playCount || 0),
                        likes: Number(stats.diggCount || stats.likeCount || stats.like_count || video.diggCount || 0),
                        comments: Number(stats.commentCount || stats.comment_count || video.commentCount || 0),
                        url: video.webVideoUrl || video.url || (videoId ? `https://www.tiktok.com/@${author}/video/${videoId}` : url)
                    };
                });
                break;
            }
        } catch (error) {
            console.warn('TikTok posts endpoint error:', error.message || error);
        }
    }

    return result;
}

async function fetchInstagramData(url) {
    for (const key in MOCK_DATA) {
        if (url.includes(key)) return { ...MOCK_DATA[key], source: 'mock' };
    }

    const cfg = getConfig();
    let key = cfg.RAPIDAPI_INSTAGRAM_KEY || cfg.RAPIDAPI_KEY;
    if (!key) {
        key = await getSupabaseApiKey('Instagram');
    }
    if (!key) throw new Error('RapidAPI Instagram key chưa được cấu hình. Mở trang Cấu hình để thêm key hoặc cấu hình Supabase.');

    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const m = cleanUrl.match(/instagram\.com\/([\w.\-]+)/i) || ['',''];
    const username = m[1];
    if (!username || username === 'p' || username === 'reel') throw new Error('Không lấy được username từ URL.');

    const IG_HOST = 'instagram-scraper-20251.p.rapidapi.com';
    const headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': IG_HOST };
    const uResp = await fetch(`https://${IG_HOST}/userinfo/?username_or_id=${encodeURIComponent(username)}`, { method: 'GET', headers });
    const rawUser = await uResp.text();
    let respUser = null;
    try { respUser = JSON.parse(rawUser); } catch (e) { respUser = rawUser; }
    const user = (respUser && (respUser.data || respUser.user || (respUser.graphql && respUser.graphql.user))) || respUser;
    if (!user || (!user.username && !user.id && !user.pk)) throw new Error('Không lấy được thông tin Instagram.');

    const max = cfg.MAX_VIDEOS || RECENT_VIDEO_LIMIT;
    let posts = [];
    const postEndpoints = [
        `https://${IG_HOST}/user-posts/?username_or_id=${encodeURIComponent(username)}&count=${max}`,
        `https://${IG_HOST}/posts/?username_or_id_or_url=${encodeURIComponent(username)}&count=${max}`,
    ];

    for (const endpoint of postEndpoints) {
        try {
            const pResp = await fetch(endpoint, { method: 'GET', headers });
            const rawPosts = await pResp.text();
            let rp = null;
            try { rp = JSON.parse(rawPosts); } catch (e) { rp = rawPosts; }
            const items = (rp && ((rp.data && rp.data.items) || (rp.data && Array.isArray(rp.data) && rp.data) || rp.items || (rp.response && rp.response.items) || rp.media || rp.medias)) || [];
            if (Array.isArray(items) && items.length > 0) {
                posts = items.slice(0, max).map(p => {
                    const caption = (p.caption && p.caption.text) || (p.edge_media_to_caption && p.edge_media_to_caption.edges && p.edge_media_to_caption.edges[0] && p.edge_media_to_caption.edges[0].node && p.edge_media_to_caption.edges[0].node.text) || p.title || p.content || '(Không có caption)';
                    const date = p.taken_at ? new Date(p.taken_at * 1000).toLocaleDateString('vi-VN') : (p.timestamp ? new Date(p.timestamp * 1000).toLocaleDateString('vi-VN') : '—');
                    const views = parseInt(p.play_count || p.view_count || p.video_view_count || (p.video_stats && p.video_stats.view_count) || 0) || 0;
                    const likes = parseInt(p.like_count || (p.edge_media_preview_like && p.edge_media_preview_like.count) || (p.edge_liked_by && p.edge_liked_by.count) || 0) || 0;
                    const comments = parseInt(p.comment_count || (p.edge_media_to_comment && p.edge_media_to_comment.count) || 0) || 0;
                    const urlp = p.code ? ('https://instagram.com/p/' + p.code + '/') : (p.link || p.url || ('https://instagram.com/' + username + '/'));
                    return { title: String(caption).slice(0, 100), date, views, likes, comments, url: urlp };
                });
                break;
            }
        } catch (e) {
            console.warn('IG endpoint error:', e.message);
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

function renderResultCard(data, platform) {
    const platformInfo = PLATFORM_COLORS[platform] || PLATFORM_COLORS.UNKNOWN;
    const card = document.createElement('div');
    card.className = `result-card ${platformInfo.class}`;

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
        <div>
            <span class="platform-badge">${platformInfo.name}</span>
            <div class="channel-name">${data.name || 'Unknown'}</div>
            <div class="channel-handle">${data.handle || 'N/A'}</div>
            <div class="channel-meta">${data.country || 'N/A'} • ${data.created || 'N/A'}</div>
        </div>
        <a href="${data.url}" target="_blank" class="channel-link">🔗 Xem kênh</a>
    `;

    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'summary-grid';
    summaryGrid.innerHTML = `
        <div class="summary-item"><div class="label">Followers</div><div class="value">${formatNumber(data.subscribers)}</div></div>
        <div class="summary-item"><div class="label">Videos</div><div class="value">${formatNumber(data.totalVideos)}</div></div>
        <div class="summary-item"><div class="label">Views</div><div class="value">${formatNumber(data.totalViews)}</div></div>
        <div class="summary-item"><div class="label">Score</div><div class="value">${calculateEngagementScore(data)}</div></div>
    `;

    const videoList = document.createElement('div');
    videoList.className = 'video-list';
    if (data.videos?.length) {
        data.videos.forEach(video => {
            videoList.innerHTML += `
                <div class="video-item">
                    <div class="video-title">${video.title}</div>
                    <div class="video-meta">
                        <span>${video.date || '—'}</span>
                        <span>👁 ${formatNumber(video.views)}</span>
                        <span>👍 ${formatNumber(video.likes)}</span>
                        <span>💬 ${formatNumber(video.comments)}</span>
                        <a class="video-link-inline" href="${video.url}" target="_blank">Xem</a>
                    </div>
                </div>
            `;
        });
    } else {
        videoList.innerHTML = '<div class="video-item"><div class="video-title">Không có video gần đây</div></div>';
    }

    card.appendChild(header);
    card.appendChild(summaryGrid);
    card.appendChild(videoList);
    resultsContainer.appendChild(card);
}

function formatNumber(num) {
    if (!num || num === 0) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function calculateEngagementScore(data) {
    const subscribers = Number(data.subscribers || 0);
    const views = Number(data.totalViews || 0);
    const videos = Number(data.totalVideos || 0);
    const score = Math.round((subscribers / 1000000) + (views / 100000000) + (videos / 100));
    return score > 100 ? '100+' : score;
}

function showStatus(message, type = 'info') {
    statusBar.classList.add('active');
    statusBar.classList.remove('loading', 'success', 'error');
    statusBar.classList.add(type);
    const spinner = type === 'loading' ? '<span class="loader"></span>' : '';
    statusBar.innerHTML = spinner + message;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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
            videoName: item.videos?.[0]?.title || '',
            videos: Array.isArray(item.videos) ? item.videos.slice(0, RECENT_VIDEO_LIMIT) : []
        })),
        errors,
    };

    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    history.unshift(historyItem);
    if (history.length > MAX_HISTORY_ITEMS) history = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    loadHistory();
    return historyItem;
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">Chưa có lịch sử phân tích nào</p>';
        return;
    }

    historyContainer.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div>
                <div class="history-time">🕐 ${item.timestamp}</div>
                <div class="history-stats">📊 ${item.linksCount} link • ✅ ${item.successCount} thành công • ❌ ${item.errorCount} lỗi</div>
                <div class="history-results">
                    ${item.results.map(r => `<span class="history-tag">${r.platform}: ${r.name}</span>`).join('')}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn btn-small btn-secondary" onclick="showHistoryDetail(${item.id})">🔍 Xem</button>
                <button class="history-delete-btn" onclick="deleteHistoryItem(${item.id})">✕</button>
            </div>
        </div>
    `).join('');

    const exportBtn = document.getElementById('export-history-btn');
    if (exportBtn) exportBtn.onclick = exportHistoryToCSV;
}

function showHistoryDetail(id) {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    const item = history.find(h => h.id === id);
    if (!item) { alert('Không tìm thấy mục lịch sử.'); return; }

    const modal = document.getElementById('history-modal');
    const body = document.getElementById('history-modal-body');
    const title = document.getElementById('history-modal-title');
    const closeBtn = document.getElementById('history-modal-close');

    title.textContent = `Chi tiết: ${item.timestamp}`;
    let html = `<p>Links: ${item.linksCount} • Thành công: ${item.successCount} • Lỗi: ${item.errorCount}</p>`;
    html += '<h4>Chi tiết kết quả</h4>';
    if (item.results?.length) {
        html += '<ul style="padding-left:18px;">';
        item.results.forEach(r => {
            html += `<li><strong>${r.platform}</strong>: ${r.name} — <a href="${r.link}" target="_blank">Xem</a></li>`;
        });
        html += '</ul>';
    } else html += '<p>Không có kết quả chi tiết.</p>';

    body.innerHTML = html;
    modal.style.display = 'flex';
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function exportHistoryToCSV() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    if (!history.length) { alert('Không có lịch sử để xuất.'); return; }
    const rows = [['history_id', 'timestamp', 'links_count', 'success_count', 'error_count', 'platform', 'name', 'link'].join(',')];
    history.forEach(h => {
        if (h.results?.length) {
            h.results.forEach(r => rows.push(['"' + h.id + '"', '"' + h.timestamp + '"', h.linksCount, h.successCount, h.errorCount, '"' + (r.platform || '') + '"', '"' + (r.name || '') + '"', '"' + (r.link || '') + '"'].join(',')));
        } else rows.push(['"' + h.id + '"', '"' + h.timestamp + '"', h.linksCount, h.successCount, h.errorCount, '', '', ''].join(','));
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyzer_history_' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleClearHistory() {
    if (confirm('⚠️ Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        loadHistory();
        updateOverview();
        showStatus('✅ Lịch sử đã xóa!', 'success');
        setTimeout(() => statusBar.classList.remove('active'), 1800);
    }
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    history = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    loadHistory();
    updateOverview();
}

async function syncResultsToExternal(results, links, historyItem) {
    const cfg = getConfig();
    const payload = {
        source: 'social-analyzer',
        timestamp: new Date().toISOString(),
        links,
        results,
        summary: {
            profileCount: results.length,
            successCount: results.length,
            errorCount: historyItem?.errorCount || 0,
        }
    };

    const hasSupabase = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
    const hasEndpoint = Boolean(cfg.API_ENDPOINT);
    const syncReport = {
        success: false,
        attempted: false,
        rowCount: 0,
        supabase: { attempted: false, success: false, error: '' },
        endpoint: { attempted: false, success: false, error: '' }
    };
    if (!hasSupabase && !hasEndpoint) {
        return { ...syncReport, reason: 'no-sync-configured' };
    }

    if (hasSupabase) {
        syncReport.attempted = true;
        syncReport.supabase.attempted = true;
        try {
            const baseUrl = cfg.SUPABASE_URL.replace(/\/$/, '');
            const groupedRows = new Map();
            const headers = {
                'Content-Type': 'application/json',
                'apikey': cfg.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${cfg.SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal,resolution=merge-duplicates'
            };

            results.forEach(item => {
                const channelName = item.name || item.handle || 'Unknown';
                if (groupedRows.has(channelName)) return;
                const rowTimestamp = new Date().toISOString();
                const channelRows = groupedRows.get(channelName) || [];

                if (Array.isArray(item.videos) && item.videos.length) {
                    item.videos.slice(0, RECENT_VIDEO_LIMIT).forEach((video, index) => {
                        channelRows.push({
                            id: makeVideoRowId(channelName, index),
                            link_video: video.url || item.url || item.link || '',
                            [SUPABASE_CHANNEL_COLUMN]: channelName,
                            video_name: video.title || '',
                            views: String(video.views || 0),
                            likes: String(video.likes || 0),
                            comments: String(video.comments || 0),
                            created_at: rowTimestamp
                        });
                    });
                } else {
                    channelRows.push({
                        id: makeVideoRowId(channelName, 0),
                        link_video: item.url || item.link || '',
                        [SUPABASE_CHANNEL_COLUMN]: channelName,
                        video_name: '',
                        views: String(item.totalViews || item.views || 0),
                        likes: String(item.totalVideos || item.likes || 0),
                        comments: String(item.subscribers || item.comments || 0),
                        created_at: rowTimestamp
                    });
                }

                groupedRows.set(channelName, channelRows);
            });

            if (groupedRows.size === 0) {
                throw new Error('Không có hàng dữ liệu để lưu vào History_API_Analyst.');
            }

            for (const [channelName, channelRows] of groupedRows.entries()) {
                const deleteQuery = new URLSearchParams({
                    [SUPABASE_CHANNEL_COLUMN]: `eq.${channelName}`
                });
                const deleteUrl = `${baseUrl}/rest/v1/${SUPABASE_HISTORY_TABLE}?${deleteQuery.toString()}`;
                const deleteResponse = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text().catch(() => 'Không thể đọc lỗi từ Supabase');
                    const friendly = interpretSupabaseError(errorText);
                    const deleteError = `Supabase delete skipped for ${channelName}: ${deleteResponse.status} ${friendly || errorText}`;
                    console.warn(deleteError);
                    syncReport.supabase.error = deleteError;
                }

                if (channelRows.length) {
                    const insertResponse = await fetch(`${baseUrl}/rest/v1/${SUPABASE_HISTORY_TABLE}?on_conflict=id`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(channelRows)
                    });

                    if (!insertResponse.ok) {
                        const errorText = await insertResponse.text().catch(() => 'Không thể đọc lỗi từ Supabase');
                        const friendly = interpretSupabaseError(errorText);
                        throw new Error(`Supabase insert failed for ${channelName}: ${insertResponse.status} ${friendly || errorText}`);
                    }
                    syncReport.rowCount += channelRows.length;
                }
            }

            syncReport.supabase.success = true;
            syncReport.success = true;
            if (syncReport.rowCount > 0) {
                syncReport.supabase.error = '';
            }
        } catch (error) {
            syncReport.supabase.error = error.message || String(error);
            syncReport.success = false;
            console.warn('Supabase sync failed:', syncReport.supabase.error);
        }
    }

    if (hasEndpoint) {
        syncReport.attempted = true;
        syncReport.endpoint.attempted = true;
        try {
            const response = await fetch(cfg.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API endpoint: ${response.status}`);
            syncReport.endpoint.success = true;
            syncReport.success = true;
        } catch (error) {
            syncReport.endpoint.error = error.message || String(error);
            console.warn('API sync failed:', syncReport.endpoint.error);
        }
    }

    const now = new Date().toLocaleString('vi-VN');
    if (syncReport.attempted || syncReport.success) {
        localStorage.setItem('last_sync_time', now);
        localStorage.setItem('last_sync_status', syncReport.success ? 'success' : 'failed');
    }
    console.info('🔄 Sync report', syncReport);
    return syncReport;
}

async function handleSyncNow() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    if (!history.length) {
        showStatus('⚠️ Chưa có dữ liệu để đồng bộ. Hãy phân tích trước.', 'error');
        return;
    }
    const allResults = history.flatMap(item => Array.isArray(item.results) ? item.results : []);
    const allLinks = history.flatMap(item => Array.isArray(item.results) ? item.results.map(r => r.link).filter(Boolean) : []);
    const summaryItem = {
        errorCount: history.reduce((sum, item) => sum + Number(item.errorCount || 0), 0)
    };

    if (!allResults.length) {
        showStatus('⚠️ Lịch sử chưa có kết quả hợp lệ để đồng bộ.', 'error');
        return;
    }

    showStatus(`☁️ Đang đồng bộ toàn bộ lịch sử (${history.length} lần phân tích)...`, 'loading');
    const syncReport = await syncResultsToExternal(allResults, allLinks, summaryItem);
    updateOverview();

    if (syncReport.success) {
        showStatus(`✅ Đồng bộ hoàn tất: ${syncReport.rowCount || allResults.length} dòng dữ liệu.`, 'success');
    } else if (syncReport.supabase.attempted || syncReport.endpoint.attempted) {
        showStatus(`⚠️ Đồng bộ không hoàn thành: ${syncReport.supabase.error || syncReport.endpoint.error || 'Kiểm tra cấu hình Supabase/API.'}`, 'error');
    } else {
        showStatus('⚠️ Chưa cấu hình Supabase/API để đồng bộ.', 'error');
    }
}

function updateOverview() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    const total = history.length;
    const successes = history.reduce((sum, item) => sum + (item.successCount || 0), 0);
    const lastSync = localStorage.getItem('last_sync_time');
    const lastSyncStatus = localStorage.getItem('last_sync_status');
    const syncLabel = lastSync ? (lastSyncStatus === 'success' ? `OK (${lastSync})` : `Lỗi (${lastSync})`) : 'Chưa sync';
    if (overviewTotal) overviewTotal.textContent = total;
    if (overviewSuccess) overviewSuccess.textContent = successes;
    if (overviewSync) overviewSync.textContent = syncLabel;
}

async function autoSyncLatestHistory() {
    const cfg = getConfig();
    if (!cfg.SYNC_ENABLED) return;

    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    const latest = history[0];
    if (!latest) return;

    const lastSyncedId = localStorage.getItem('last_synced_history_id');
    if (lastSyncedId && Number(lastSyncedId) === latest.id) return;

    console.info('🔄 Auto-sync latest history:', latest.id);
    const syncReport = await syncResultsToExternal(latest.results || [], latest.results?.map(r => r.link) || [], latest);
    if (syncReport.success) {
        localStorage.setItem('last_synced_history_id', String(latest.id));
        showStatus('✅ Đồng bộ tự động thành công với bản ghi mới nhất.', 'success');
    } else {
        showStatus(`⚠️ Đồng bộ tự động thất bại: ${syncReport.supabase.error || syncReport.endpoint.error || 'Kiểm tra cấu hình.'}`, 'error');
    }
    updateOverview();
}

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

console.log('🎬 Social Intelligence Hub loaded');
console.log('🔌 Supabase/API sync sẽ tự động chạy nếu đã cấu hình ở trang Admin');
