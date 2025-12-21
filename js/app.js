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

// --- 1. MTEGO WA KU-INSTALL (Kama ule wa mwanzo) ---
let deferredPrompt; 

window.addEventListener('beforeinstallprompt', (e) => {
  // Zuia isijaribu ku-install yenyewe, subiri button
  e.preventDefault();
  deferredPrompt = e;
  console.log("Tayari kwa install");
});

window.onload = async () => {
    
    // --- 2. UCHAWI WA KUGUNDUA KAMA APP IME-INSTALLIWA ---
    // Hiki kipande ndicho kilikosekana kwenye kodi yako
    // Kinaangalia: Je, tupo ndani ya App? Kama ndio, RUKA button, nenda ndani.
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    if (isApp) {
        // IKIWA TAYARI IME-INSTALLIWA:
        // Usionyeshe button, ingia moja kwa moja View-Intro
        utils.navTo('view-intro');
    } else {
        // KAMA BADO (Browser):
        // Onyesha button ya Initialize
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // --- 3. LOGIC YA KITUFE (FORCE ENTRY) ---
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            
            // Jaribu ku-install (Kama haijainstalliwa)
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log("User response:", outcome);
                deferredPrompt = null;
            }
            
            // HATA KAMA AKIKATAA KU-INSTALL AU AKIKUBALI:
            // Lazima tumpeleke ndani (view-intro)
            // Tunaweka kamuda kidogo (500ms) ili asione screen inarukaruka
            setTimeout(() => {
                utils.navTo('view-intro'); 
            }, 500);
        });
    }
    
    // Dropdowns za Vyuo
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');

    auth.init();
};
