export const utils = {
    // 1. Navigation Logic (Kuhama page)
    navTo: (id) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        window.scrollTo(0,0);
    },

    // 2. DEVICE DETECTIVE (HAPA NDIPO KWENYE LOGIC MPYA)
    detectDevice: () => {
        const ua = navigator.userAgent;
        
        // Logic ya kutambua iPhone/iPad
        const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Logic ya kutambua Android
        const isAndroid = /Android/.test(ua);
        
        // Simu yoyote (Android au iOS)
        const isMobile = isIOS || isAndroid;

        // Hatua ya 1: Ficha maboksi yote kwanza
        const androidView = document.getElementById('action-android');
        const iosView = document.getElementById('action-ios');
        const desktopView = document.getElementById('action-desktop');

        if(androidView) androidView.classList.add('hidden');
        if(iosView) iosView.classList.add('hidden');
        if(desktopView) desktopView.classList.add('hidden');

        // Hatua ya 2: Onyesha kulingana na kifaa
        if (isIOS) {
            // IPHONE: Onyesha Box la Maelekezo (Share -> Add to Home)
            if(iosView) iosView.classList.remove('hidden');
        } 
        else if (isAndroid) {
            // ANDROID: Onyesha Button ya "Initialize App"
            if(androidView) androidView.classList.remove('hidden');
        } 
        else {
            // PC/LAPTOP: Onyesha Button ya Simulator
            if(desktopView) {
                desktopView.classList.remove('hidden');
                // Kwa PC, button iingize ndani tu
                const btn = desktopView.querySelector('button');
                if(btn) btn.onclick = () => utils.navTo('view-intro');
            }
        }
    },

    // 3. Register Service Worker (PWA Engine)
    initPWA: () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('PWA Service Worker Registered'))
                .catch(err => console.error('SW Error:', err));
        }
    },

    // 4. Formatting Helpers (Tarehe na Namba)
    formatDate: (isoString) => {
        if(!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
    },

    formatCount: (num) => {
        if(!num) return '0';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    }
};
    formatCount: (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    }

};
