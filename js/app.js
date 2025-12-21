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

// Variable ya kuhifadhi install prompt (kama ipo)
let deferredPrompt; 

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Install prompt imepatikana");
});

window.onload = async () => {
    
    // 1. AUTO-ENTRY: Kama yuko kwenye App, ingia moja kwa moja
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isApp) {
        utils.navTo('view-intro');
    } else {
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // 2. LOGIC MPYA YA KITUFE (HAKUNA MASHARTI)
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        // Tunatumia 'onclick' badala ya EventListener ili kuhakikisha inafanya kazi
        installBtn.onclick = () => {
            
            // HATUA YA KWANZA: INGIA NDANI HARAKA!
            // Hatusubiri ku-install, tunaingia kwanza.
            utils.navTo('view-intro');

            // HATUA YA PILI: JARIBU KU-INSTALL (KIMYA KIMYA)
            // Hii itatokea ikiwa tu notification ipo tayari
            if (deferredPrompt) {
                setTimeout(() => {
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                }, 1000); // Tunasubiri sekunde 1 akiwa ndani ndio tumuulize
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
