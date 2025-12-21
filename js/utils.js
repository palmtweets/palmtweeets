export const utils = {
    // 1. Navigation
    navTo: (id) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        window.scrollTo(0,0);
    },

    // 2. DETECTOR: Hii ndio itachagua kipi kionekane kwenye GATEKEEPER
    detectDevice: () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/.test(ua);

        // Ficha zote kwanza
        ['action-android', 'action-ios', 'action-desktop'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });

        if (isIOS) {
            // IPHONE: Onyesha maandishi ya "Authorized Personnel"
            const el = document.getElementById('action-ios');
            if(el) el.classList.remove('hidden');
        } else if (isAndroid) {
            // ANDROID: Onyesha Button ya Initialize
            const el = document.getElementById('action-android');
            if(el) el.classList.remove('hidden');
        } else {
            // PC: Onyesha Button ya Desktop
            const el = document.getElementById('action-desktop');
            if(el) el.classList.remove('hidden');
        }
    },

    // 3. PWA
    initPWA: () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('SW Registered'))
                .catch(console.error);
        }
    },

    // 4. Helpers
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
