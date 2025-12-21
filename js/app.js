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

// Hifadhi prompt ya install
let deferredPrompt; 
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Install iko tayari");
});

window.onload = async () => {
    
    // 1. CHECK YA HARAKA: Kama tuko ndani ya App, onyesha Intro
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isApp) {
        document.getElementById('view-gatekeeper').classList.remove('active');
        document.getElementById('view-intro').classList.add('active');
    } else {
        utils.detectDevice();
    }
    
    utils.initPWA();
    
    // 2. KITUFE CHA KUBADILISHA UKURASA "KIENYEJI" (MANUAL)
    // Hii haitegemei 'utils' wala logic ngumu. Inabadilisha CSS moja kwa moja.
    const installBtn = document.getElementById('pwa-install-btn');
    
    if(installBtn) {
        installBtn.onclick = () => {
            console.log("Button imebonyezwa - Tunalazimisha kuingia");

            // HATUA A: Ficha Gatekeeper kwa nguvu
            const gatekeeper = document.getElementById('view-gatekeeper');
            gatekeeper.style.display = 'none'; // Futa kabisa
            gatekeeper.classList.remove('active');

            // HATUA B: Washa Intro kwa nguvu
            const intro = document.getElementById('view-intro');
            intro.style.display = 'flex'; // Washa kabisa
            intro.classList.add('active');

            // HATUA C: Jaribu ku-install (Baada ya kuonyesha page mpya)
            if (deferredPrompt) {
                setTimeout(() => {
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                }, 500); // Subiri nusu sekunde tukiwa tumeshafika page mpya
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
