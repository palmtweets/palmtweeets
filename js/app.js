import { SUPABASE_URL, SUPABASE_ANON_KEY, UNIVERSITIES } from './config.js';
import { utils } from './utils.js';
import { auth } from './auth.js';
import { feed } from './feed.js';
import { admin } from './admin.js';

// Initialize Supabase Client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose modules to window object
window.utils = utils;
window.auth = auth;
window.feed = feed;
window.admin = admin;

// Variable ya kuhifadhi install prompt
let deferredPrompt; 

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Install prompt captured");
});

window.onload = async () => {
    
    // 1. ANGALIA KAMA TUPO KWENYE APP (Backup ya CSS)
    // Kama yuko kwenye App, ruka moja kwa moja
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        utils.navTo('view-intro');
    } else {
        // Kama yuko kwenye Browser, onyesha Gatekeeper
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // 2. LOGIC YA KITUFE (SIMPLE & AGGRESSIVE)
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            
            // Jaribu ku-install kama inawezekana
            if (deferredPrompt) {
                deferredPrompt.prompt();
                // Hatujali matokeo, tunasafisha tu
                deferredPrompt = null;
            }
            
            // REKEBISHO: BILA KUJALI KAMA IME-INSTALL AU LA
            // Subiri nusu sekunde (ili prompt ionekane) kisha Vuka Gatekeeper uende ndani!
            setTimeout(() => {
                utils.navTo('view-intro');
            }, 500); 
        });
    }
    
    // 3. Fill Dropdowns
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');

    // 4. Start Auth Check
    auth.init();
};
