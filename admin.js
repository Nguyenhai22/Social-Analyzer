// ========== DOM ELEMENTS ==========
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

// ========== EVENT LISTENERS ==========
window.addEventListener('load', initializeAdminPanel);
showKeysCheckbox.addEventListener('change', toggleKeyVisibility);

// ========== FUNCTIONS ==========

function initializeAdminPanel() {
    loginContainer.classList.remove('hidden');
    adminContent.classList.add('hidden');
    loadConfig();
}

function loadConfig() {
    const savedYtKey = localStorage.getItem('yt_api_key');
    const savedRapidapiKey = localStorage.getItem('rapidapi_key');
    const savedRapidapiTiktok = localStorage.getItem('rapidapi_tiktok_key');
    const savedRapidapiInstagram = localStorage.getItem('rapidapi_instagram_key');

    if (savedYtKey) ytKeyInput.value = savedYtKey;
    if (savedRapidapiKey) rapidapiKeyInput.value = savedRapidapiKey;
    if (savedRapidapiTiktok) rapidapiTiktokKeyInput.value = savedRapidapiTiktok;
    if (savedRapidapiInstagram) rapidapiInstagramKeyInput.value = savedRapidapiInstagram;

    console.log('✅ Cấu hình đã được tải từ localStorage');
}

function handleLogin() {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();
    const validUsername = 'admin';
    const validPassword = 'huuhails22082002';

    if (username === validUsername && password === validPassword) {
        loginContainer.classList.add('hidden');
        adminContent.classList.remove('hidden');
        showStatus('✅ Đăng nhập thành công!', 'success');
    } else {
        showStatus('❌ Sai tên tài khoản hoặc mật khẩu.', 'error');
    }
}

function saveConfig() {
    const ytKey = ytKeyInput.value.trim();
    const rapidapiKey = rapidapiKeyInput.value.trim();
    const rapidapiTiktokKey = rapidapiTiktokKeyInput.value.trim();
    const rapidapiInstagramKey = rapidapiInstagramKeyInput.value.trim();

    // Validate
    if (!ytKey && !rapidapiKey) {
        showStatus('❌ Vui lòng nhập ít nhất một API Key!', 'error');
        return;
    }

    // Save to localStorage
    if (ytKey) {
        localStorage.setItem('yt_api_key', ytKey);
    }
    if (rapidapiKey) {
        localStorage.setItem('rapidapi_key', rapidapiKey);
    }
    if (rapidapiTiktokKey) {
        localStorage.setItem('rapidapi_tiktok_key', rapidapiTiktokKey);
    }
    if (rapidapiInstagramKey) {
        localStorage.setItem('rapidapi_instagram_key', rapidapiInstagramKey);
    }

    showStatus('✅ API Keys đã được lưu thành công!', 'success');
    
    setTimeout(() => {
        showStatus('💡 Bây giờ bạn có thể quay lại Analyzer và bắt đầu phân tích!', 'success');
    }, 2000);

    console.log('✅ API Keys saved:');
    console.log('- YouTube API:', ytKey ? '✓ Đã lưu' : '✗ Chưa');
    console.log('- RapidAPI Key:', rapidapiKey ? '✓ Đã lưu' : '✗ Chưa');
    console.log('- RapidAPI TikTok Key:', rapidapiTiktokKey ? '✓ Đã lưu' : '✗ Chưa');
    console.log('- RapidAPI Instagram Key:', rapidapiInstagramKey ? '✓ Đã lưu' : '✗ Chưa');
}

function toggleKeyVisibility() {
    const type = showKeysCheckbox.checked ? 'text' : 'password';
    ytKeyInput.type = type;
    rapidapiKeyInput.type = type;
    rapidapiTiktokKeyInput.type = type;
    rapidapiInstagramKeyInput.type = type;
    
    console.log(type === 'text' ? '👁️ Hiển thị API Keys' : '🔒 Ẩn API Keys');
}

function testAPIs() {
    const ytKey = localStorage.getItem('yt_api_key');
    const rapidapiKey = localStorage.getItem('rapidapi_key');
    const rapidapiTiktok = localStorage.getItem('rapidapi_tiktok_key');
    const rapidapiInstagram = localStorage.getItem('rapidapi_instagram_key');

    console.log('🧪 Kiểm tra API Keys...');
    
    if (!ytKey && !rapidapiKey) {
        showStatus('❌ Vui lòng lưu ít nhất một API Key trước!', 'error');
        return;
    }

    showStatus('⏳ Đang kiểm tra API Keys...', 'success');

    // Test YouTube API
    if (ytKey) {
        testYouTubeAPI(ytKey);
    }

    // Test RapidAPI
    if (rapidapiKey) {
        testRapidAPI(rapidapiKey);
    }
    if (rapidapiTiktok) {
        testRapidTikTok(rapidapiTiktok);
    }
    if (rapidapiInstagram) {
        testRapidInstagram(rapidapiInstagram);
    }
}

async function testRapidTikTok(key) {
    try {
        const response = await fetch('https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=cristiano', {
            method: 'GET',
            headers: {
                'x-rapidapi-key': key,
                'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
            }
        });
        const data = await response.json();
        if (data.userInfo) {
            showStatus('✅ RapidAPI TikTok: Hoạt động tốt!', 'success');
        } else {
            showStatus('❌ RapidAPI TikTok: Phản hồi không như mong đợi.', 'error');
        }
    } catch (err) {
        showStatus('❌ RapidAPI TikTok Error: ' + err.message, 'error');
    }
}

async function testRapidInstagram(key) {
    try {
        // Best-effort probe (different RapidAPI providers vary)
        const username = 'cristiano';
        const response = await fetch(`https://instagram-scraper-20251.p.rapidapi.com/account-info?username=${username}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': key,
                'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com'
            }
        });
        const data = await response.json();
        if (data && (data.user || data.graphql || data.userInfo)) {
            showStatus('✅ RapidAPI Instagram: Hoạt động tốt (probe).', 'success');
        } else {
            showStatus('❌ RapidAPI Instagram: Phản hồi không như mong đợi.', 'error');
        }
    } catch (err) {
        showStatus('❌ RapidAPI Instagram Error: ' + err.message, 'error');
    }
}

async function testYouTubeAPI(key) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=GoogleDevelopers&key=${key}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            console.log('✅ YouTube API: Hoạt động tốt!');
            showStatus('✅ YouTube API: Hoạt động tốt! (Channel: ' + data.items[0].snippet.title + ')', 'success');
        } else if (data.error) {
            console.error('❌ YouTube API Error:', data.error.message);
            showStatus('❌ YouTube API Error: ' + data.error.message, 'error');
        }
    } catch (error) {
        console.error('❌ YouTube API Test Error:', error);
        showStatus('❌ YouTube API Error: ' + error.message, 'error');
    }
}

async function testRapidAPI(key) {
    try {
        const response = await fetch('https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=cristiano', {
            method: 'GET',
            headers: {
                'x-rapidapi-key': key,
                'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
            }
        });
        const data = await response.json();
        
        if (data.userInfo) {
            console.log('✅ RapidAPI (TikTok): Hoạt động tốt!');
            showStatus('✅ RapidAPI: Hoạt động tốt! (Followers: ' + data.userInfo.stats.followerCount + ')', 'success');
        } else if (data.message || data.error) {
            console.error('❌ RapidAPI Error:', data.message || data.error);
            showStatus('❌ RapidAPI Error: ' + (data.message || data.error), 'error');
        }
    } catch (error) {
        console.error('❌ RapidAPI Test Error:', error);
        showStatus('❌ RapidAPI Error: ' + error.message, 'error');
    }
}

function showStatus(message, type = 'info') {
    statusMessage.classList.add('show');
    statusMessage.classList.remove('success', 'error');
    statusMessage.classList.add(type);
    statusMessage.textContent = message;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

// ========== LOGGING ==========
console.log('%c⚙️ Admin Panel Loaded', 'color: #FF0000; font-size: 14px; font-weight: bold;');
console.log('💾 Lưu API Keys → Dữ liệu sẽ được lưu trong localStorage');
console.log('🔗 Quay lại index.html để sử dụng Analyzer');
