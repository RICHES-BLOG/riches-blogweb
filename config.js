// Supabase Configuration
const SUPABASE_URL = 'https://kshqtnqtyeqczswxtgdj.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'sb_publishable_BiZTbcIXG58BMRoQskCqmg_9zfrVrIs'; // Replace with your anon key

// Initialize Supabase client
const supabase = supabaseClient || null;

// API endpoints
const API = {
    music: '/api/music',
    movies: '/api/movies',
    blog: '/api/blog',
    contacts: '/api/contacts',
    subscribers: '/api/subscribers',
    settings: '/api/settings'
};

// Helper functions
function showNotification(message, type = 'success') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed; top:90px; right:20px; z-index:10000; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : (type === 'error' ? '#f44336' : '#FFB347');
    notification.style.cssText = `background:${bgColor}; color:white; padding:12px 20px; border-radius:12px; font-weight:500; animation:slideIn 0.3s ease; cursor:pointer;`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    notification.addEventListener('click', () => notification.remove());
}

// Export for use in other files
window.supabaseConfig = { SUPABASE_URL, SUPABASE_ANON_KEY };
window.showNotification = showNotification;