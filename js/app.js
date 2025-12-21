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

// 1. TUNATEGA INSTALL PROMPT (Kama ipo, sawa. Kama haipo, sawa)
let deferredPrompt; 
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.onload = async () => {
    
    // 2. CHECK RAHISI: Kama tuko ndani ya App, vuka geti
    // Tunatumia display-mode pekee, ndiyo uhakika
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('view-gatekeeper').style.display = 'none';
        document.getElementById('view-intro').classList.add('active');
    } 
    
    // Hatutumii tena utils.detectDevice() kuficha/kuonyesha button
    // Button tayari ipo kwenye HTML (Hardcoded)
    
    utils.initPWA();
    
    // 3. KITUFE CHA UHAKIKA (NO CONDITIONS)
    const installBtn = document.getElementById('pwa-install-btn');
    if(installBtn) {
        installBtn.onclick = () => {
            // A. HAMISHA PAGE MARA MOJA (Hii haiwezi kuganda)
            document.getElementById('view-gatekeeper').classList.remove('active');
            document.getElementById('view-gatekeeper').style.display = 'none'; // Futa kabisa
            
            document.getElementById('view-intro').classList.add('active');
            document.getElementById('view-intro').style.display = 'flex'; // Washa

            // B. JARIBU KU-INSTALL (Baadae)
            // Hata kama hii ikifeli, mtumiaji tayari yuko ndani
            if (deferredPrompt) {
                setTimeout(() => {
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                }, 1000);
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
