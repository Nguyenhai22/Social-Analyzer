const DEFAULT_SUPABASE_URL = 'https://lzgeocvfzmjheywonenf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GYTVNGz5s917E8l245RSWQ_iTCFF6et';

const ytKeyInput = document.getElementById('yt-key');
const rapidapiKeyInput = document.getElementById('rapidapi-key');
const rapidapiTiktokKeyInput = document.getElementById('rapidapi-tiktok-key');
const rapidapiInstagramKeyInput = document.getElementById('rapidapi-instagram-key');
const showKeysCheckbox = document.getElementById('show-keys');
const statusMessage = document.getElementById('status-message');
const loginContainer = document.getElementById('login-container');
const adminContent = document.getElementById('admin-content');
const adminUsernameInput = document.getElementById('admin-username');
const adminPasswordInput = document.getElementById('admin-password');
const channelFilterInput = document.getElementById('channel-filter');
const savedDataBody = document.getElementById('saved-data-body');
const savedDataStatus = document.getElementById('saved-data-status');

window.addEventListener('load', initializeAdminPanel);
showKeysCheckbox?.addEventListener('change', toggleKeyVisibility);
channelFilterInput?.addEventListener('input', loadSavedData);

function initializeAdminPanel() {
    loginContainer.classList.remove('hidden');
    adminContent.classList.add('hidden');
    loadConfig();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getLocalHistoryRows() {
    const history = JSON.parse(localStorage.getItem('analyzer_history') || '[]');
    const rows = [];

    history.forEach((item, historyIndex) => {
        const results = Array.isArray(item.results) ? item.results : [];
        results.forEach((result, resultIndex) => {
            rows.push({
                id: `${item.id || historyIndex}-${resultIndex}`,
                source: 'local',
                channel: result.name || result.platform || 'Unknown',
                link: result.link || '',
                platform: result.platform || '—',
                views: result.totalViews || result.views || '',
                likes: result.totalVideos || result.likes || '',
                comments: result.subscribers || result.comments || '',
                createdAt: item.timestamp || ''
            });
        });
    });

    return rows;
}

async function fetchSavedRowsFromSupabase() {
    const baseUrl = (localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
    const anonKey = (localStorage.getItem('supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY).trim();

    if (!baseUrl || !anonKey) return [];

    try {
        const query = new URLSearchParams({
            select: 'link_video,kênh,views,likes,comments,created_at',
            order: 'created_at.desc',
            limit: '100'
        });
        const response = await fetch(`${baseUrl}/rest/v1/History_API_Analyst?${query.toString()}`, {
            method: 'GET',
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
                Accept: 'application/json'
            }
        });

        if (!response.ok) return [];
        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((row, index) => ({
            id: `supabase-${index}-${row.created_at || ''}`,
            source: 'supabase',
            channel: row['kênh'] || row.kênh || row.channel || 'Unknown',
            link: row.link_video || '',
            platform: row.platform || '—',
            views: row.views || '',
            likes: row.likes || '',
            comments: row.comments || '',
            createdAt: row.created_at || ''
        }));
    } catch (error) {
        console.warn('Không thể tải dữ liệu từ Supabase:', error);
        return [];
    }
}

async function loadSavedData() {
    if (!savedDataBody || !savedDataStatus) return;

    const filterValue = (channelFilterInput?.value || '').trim().toLowerCase();
    savedDataStatus.textContent = 'Đang tải dữ liệu...';

    const localRows = getLocalHistoryRows();
    const supabaseRows = await fetchSavedRowsFromSupabase();
    const rows = supabaseRows.length ? supabaseRows : localRows;
    const filteredRows = rows.filter((row) => {
        const searchable = `${row.channel || ''} ${row.link || ''}`.toLowerCase();
        return !filterValue || searchable.includes(filterValue);
    });

    if (!filteredRows.length) {
        savedDataBody.innerHTML = '<tr><td colspan="6" class="empty-cell">Không có dữ liệu phù hợp.</td></tr>';
        savedDataStatus.textContent = 'Không có dữ liệu phù hợp.';
        return;
    }

    savedDataBody.innerHTML = filteredRows.map((row) => `
        <tr>
            <td>${escapeHtml(row.channel || 'Unknown')}</td>
            <td>${row.link ? `<a href="${escapeHtml(row.link)}" target="_blank" rel="noreferrer">${escapeHtml(row.link)}</a>` : '—'}</td>
            <td>${escapeHtml(row.views || '—')}</td>
            <td>${escapeHtml(row.likes || '—')}</td>
            <td>${escapeHtml(row.comments || '—')}</td>
            <td>${escapeHtml(row.createdAt || '—')}</td>
        </tr>
    `).join('');

    const sourceLabel = supabaseRows.length ? 'Supabase' : 'localStorage';
    savedDataStatus.textContent = `Hiển thị ${filteredRows.length} dòng dữ liệu từ ${sourceLabel}.`;
}

function loadConfig() {
    ytKeyInput.value = localStorage.getItem('yt_api_key') || '';
    rapidapiKeyInput.value = localStorage.getItem('rapidapi_key') || '';
    rapidapiTiktokKeyInput.value = localStorage.getItem('rapidapi_tiktok_key') || '';
    rapidapiInstagramKeyInput.value = localStorage.getItem('rapidapi_instagram_key') || '';
}

function handleLogin() {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();
    if (username === 'admin' && password === 'huuhails22082002') {
        loginContainer.classList.add('hidden');
        adminContent.classList.remove('hidden');
        showStatus('✅ Đăng nhập thành công!', 'success');
        loadSavedData();
    } else {
        showStatus('❌ Sai tên tài khoản hoặc mật khẩu.', 'error');
    }
}

function saveConfig() {
    const ytKey = ytKeyInput.value.trim();
    const rapidapiKey = rapidapiKeyInput.value.trim();
    const rapidapiTiktokKey = rapidapiTiktokKeyInput.value.trim();
    const rapidapiInstagramKey = rapidapiInstagramKeyInput.value.trim();

    if (ytKey) localStorage.setItem('yt_api_key', ytKey);
    else localStorage.removeItem('yt_api_key');
    if (rapidapiKey) localStorage.setItem('rapidapi_key', rapidapiKey); else localStorage.removeItem('rapidapi_key');
    if (rapidapiTiktokKey) localStorage.setItem('rapidapi_tiktok_key', rapidapiTiktokKey); else localStorage.removeItem('rapidapi_tiktok_key');
    if (rapidapiInstagramKey) localStorage.setItem('rapidapi_instagram_key', rapidapiInstagramKey); else localStorage.removeItem('rapidapi_instagram_key');

    loadConfig();
    showStatus('✅ Cấu hình đã được lưu thành công!', 'success');
}

function toggleKeyVisibility() {
    const type = showKeysCheckbox.checked ? 'text' : 'password';
    ytKeyInput.type = type;
    rapidapiKeyInput.type = type;
    rapidapiTiktokKeyInput.type = type;
    rapidapiInstagramKeyInput.type = type;
}

function interpretSupabaseError(text) {
    if (!text) return text;
    if (text.includes('row-level security policy')) {
        return 'RLS chặn quyền INSERT cho role anon trên bảng History_API_Analyst. Vui lòng tạo policy INSERT cho anon hoặc tắt RLS.';
    }
    return text;
}

async function testAPIs() {
    const ytKey = localStorage.getItem('yt_api_key');
    const rapidapiKey = localStorage.getItem('rapidapi_key');
    const rapidapiTikTokKey = localStorage.getItem('rapidapi_tiktok_key');
    const rapidapiInstagramKey = localStorage.getItem('rapidapi_instagram_key');
    const hasAnyKey = Boolean(ytKey || rapidapiKey || rapidapiTikTokKey || rapidapiInstagramKey);

    if (!hasAnyKey) {
        showStatus('⚠️ Chưa có API key lưu. Tôi sẽ chỉ kiểm tra Supabase ẩn.', 'info');
    } else {
        showStatus('⏳ Đang test cấu hình...', 'success');
        if (ytKey) await testYouTubeAPI(ytKey);
        if (rapidapiKey) await testRapidAPI(rapidapiKey);
        if (rapidapiTikTokKey) await testRapidTikTok(rapidapiTikTokKey);
        if (rapidapiInstagramKey) await testRapidInstagram(rapidapiInstagramKey);
    }

    await testSupabase();
}

async function testYouTubeAPI(key) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=GoogleDevelopers&key=${key}`);
        const data = await response.json();
        if (data.items?.length) showStatus('✅ YouTube API hoạt động tốt.', 'success');
        else if (data.error) showStatus('❌ YouTube API Error: ' + data.error.message, 'error');
    } catch (error) {
        showStatus('❌ YouTube API Error: ' + error.message, 'error');
    }
}

async function testRapidAPI(key) {
    try {
        const response = await fetch('https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=cristiano', {
            method: 'GET',
            headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com' }
        });
        const data = await response.json();
        if (data.userInfo) showStatus('✅ RapidAPI chung hoạt động tốt.', 'success');
        else if (data.message || data.error) showStatus('❌ RapidAPI Error: ' + (data.message || data.error), 'error');
    } catch (error) {
        showStatus('❌ RapidAPI Error: ' + error.message, 'error');
    }
}

async function testRapidTikTok(key) {
    try {
        const response = await fetch('https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=cristiano', {
            method: 'GET',
            headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com' }
        });
        const data = await response.json();
        if (data.userInfo) showStatus('✅ RapidAPI TikTok hoạt động tốt.', 'success');
        else if (data.message || data.error) showStatus('❌ RapidAPI TikTok Error: ' + (data.message || data.error), 'error');
    } catch (error) {
        showStatus('❌ RapidAPI TikTok Error: ' + error.message, 'error');
    }
}

async function testRapidInstagram(key) {
    try {
        const IG_HOST = 'instagram-scraper-20251.p.rapidapi.com';
        const response = await fetch(`https://${IG_HOST}/userinfo/?username_or_id=cristiano`, {
            method: 'GET',
            headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': IG_HOST }
        });
        const text = await response.text();
        const data = JSON.parse(text || '{}');
        if (data.user || data.data || data.graphql) showStatus('✅ RapidAPI Instagram hoạt động tốt.', 'success');
        else showStatus('❌ RapidAPI Instagram Error: Không nhận được dữ liệu hợp lệ.', 'error');
    } catch (error) {
        showStatus('❌ RapidAPI Instagram Error: ' + error.message, 'error');
    }
}

async function testSupabase() {
    try {
        const baseUrl = DEFAULT_SUPABASE_URL.replace(/\/$/, '');
        const apiKeyQuery = `select=${encodeURIComponent('API_Name,API_Code')}&limit=5`;
        const historyCols = ['"kênh"', 'link_video', 'views', 'likes', 'comments', 'created_at'].join(',');
        const historyQuery = `select=${encodeURIComponent(historyCols)}&limit=5`;
        const tables = [
            { name: 'API_Key', query: apiKeyQuery },
            { name: 'History_API_Analyst', query: historyQuery }
        ];
        let messages = [];

        for (const table of tables) {
            const response = await fetch(`${baseUrl}/rest/v1/${table.name}?${table.query}`, {
                method: 'GET',
                headers: {
                    'apikey': DEFAULT_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${DEFAULT_SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            const text = await response.text();
            if (!response.ok) {
                const errorMessage = interpretSupabaseError(text) || `Kiểm tra quyền RLS và policy.`;
                messages.push(`⚠️ Supabase ${table.name} trả ${response.status}: ${errorMessage}`);
                continue;
            }
            let data = [];
            try {
                data = JSON.parse(text || '[]');
            } catch (err) {
                messages.push(`⚠️ Supabase ${table.name} trả dữ liệu không phải JSON.`);
                continue;
            }
            if (Array.isArray(data) && data.length > 0) {
                messages.push(`✅ Supabase ${table.name} truy vấn OK, trả ${data.length} hàng.`);
            } else {
                messages.push(`⚠️ Supabase ${table.name} truy vấn thành công nhưng trả 0 hàng. Nếu bảng đã có dữ liệu, kiểm tra quyền RLS/permission cho role anon.`);
            }
        }

        showStatus(messages.join(' '), 'success');
    } catch (error) {
        showStatus('❌ Supabase Error: ' + error.message, 'error');
    }
}

async function testCustomEndpoint(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
        });
        if (response.ok) {
            showStatus('✅ API endpoint hoạt động và chấp nhận payload JSON.', 'success');
        } else {
            showStatus(`⚠️ Endpoint phản hồi ${response.status}.`, 'error');
        }
    } catch (error) {
        showStatus('❌ API Endpoint Error: ' + error.message, 'error');
    }
}

function showStatus(message, type = 'info') {
    statusMessage.classList.add('show');
    statusMessage.classList.remove('success', 'error');
    statusMessage.classList.add(type);
    statusMessage.textContent = message;
    setTimeout(() => statusMessage.classList.remove('show'), 4000);
}

console.log('⚙️ Admin panel ready');
