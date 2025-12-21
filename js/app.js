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

// --- MTEGO WA PWA (ANDROID INSTALL) ---
let deferredPrompt; // Hapa tunahifadhi hiyo "nguvu" ya ku-install

window.addEventListener('beforeinstallprompt', (e) => {
  // Zuia browser isijaribu ku-install yenyewe mapema (tunasubiri button)
  e.preventDefault();
  deferredPrompt = e;
  console.log("PWA Install Event Captured!");
});

window.onload = async () => {
    // 1. Check Device (Android vs iOS vs PC)
    utils.detectDevice();
    
    // 2. Start PWA Engine
    utils.initPWA();
    
    // --- BUTTON LOGIC (KWA ANDROID) ---
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            // Kama Browser imeruhusu ku-install (Android/Desktop)
            if (deferredPrompt) {
                // Onyesha Prompt ya "Add to Home Screen"
                deferredPrompt.prompt();
                
                // Subiri uamuzi wa mtumiaji (Accept/Dismiss)
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                
                // Futa prompt iliyotumika
                deferredPrompt = null;
            } 
            
            // Hata kama akikataa au akikubali, MPELEKE NDANI
            // Hii ni muhimu ili mtu asikwame getini
            utils.navTo('view-intro'); 
        });
    }
    
    // 3. Fill Dropdowns (University Lists)
    const uniSelect = document.getElementById('reg-uni');
    if(uniSelect) uniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');
    
    const adminUniSelect = document.getElementById('reg-admin-uni');
    if(adminUniSelect) adminUniSelect.innerHTML = UNIVERSITIES.slice(1).map(u => `<option value="${u}">${u}</option>`).join('');

    // 4. Start Authentication Check
    auth.init();
};
