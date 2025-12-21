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

// --- 1. MTEGO WA KU-INSTALL ---
let deferredPrompt; 

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Tayari kwa install");
});

window.onload = async () => {
    
    // --- 2. UCHAWI WA KUGUNDUA KAMA APP IME-INSTALLIWA ---
    // Hii ndiyo itaruka Gatekeeper kama mtu anatumia App
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    if (isApp) {
        console.log("Tupo ndani ya App - Tunaruka Gatekeeper");
        utils.navTo('view-intro'); // Ruka moja kwa moja ndani
    } else {
        // Kama yuko kwenye Browser, onyesha Gatekeeper
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // --- 3. LOGIC YA KITUFE (FORCE ENTRY) ---
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            
            // Jaribu ku-install
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
            
            // HATA KAMA IMESHINDIKANA KU-INSTALL, INGA NDANI!
            // Hapa ndipo palipokuwa panagoma mwanzo
            utils.navTo('view-intro'); 
        });
    }
    
    // Dropdowns za Vyuo
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');

    auth.init();
};
