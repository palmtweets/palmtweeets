import { SUPABASE_URL, SUPABASE_ANON_KEY, UNIVERSITIES } from './config.js';
import { utils } from './utils.js';
import { auth } from './auth.js';
import { feed } from './feed.js';
import { admin } from './admin.js';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.utils = utils;
window.auth = auth;
window.feed = feed;
window.admin = admin;

let deferredPrompt; 
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.onload = async () => {
    
    // 1. AUTO-CHECK: Kama tayari app ipo (Standalone), ruka gatekeeper
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        document.getElementById('view-gatekeeper').classList.remove('active');
        document.getElementById('view-intro').classList.add('active');
    } else {
        // Kama yuko Browser: Angalia ni simu gani (iPhone au Android)
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // 2. ANDROID BUTTON LOGIC (NO FREEZING)
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.onclick = () => {
            // A. BADILI PAGE PAPO HAPO (Usiulize swali)
            document.getElementById('view-gatekeeper').classList.remove('active');
            document.getElementById('view-intro').classList.add('active');

            // B. JARIBU KU-INSTALL (Kimya kimya)
            if (deferredPrompt) {
                setTimeout(() => {
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                }, 800); // Subiri sekunde 0.8 ukiwa ndani ndio ulete notification
            }
        };
    }
    
    // Dropdowns
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');

    auth.init();
};
