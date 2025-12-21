import { SUPABASE_URL, SUPABASE_ANON_KEY, UNIVERSITIES } from './config.js';
import { utils } from './utils.js';
import { auth } from './auth.js';
import { feed } from './feed.js';
import { admin } from './admin.js';

// Initialize Supabase Client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose modules to window object so HTML onclick="" can access them
window.utils = utils;
window.auth = auth;
window.feed = feed;
window.admin = admin;

window.onload = async () => {
    // 1. Check Device (Android/iOS)
    utils.detectDevice();
    
    // 2. Start PWA Engine
    utils.initPWA();
    
    // 3. Fill University Dropdowns (Signup Forms)
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) {
        // Remove 'All Universities' from student signup, start from index 1
        uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    }
    
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) {
        adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    }

    // 4. Start Authentication Check
    auth.init();
};