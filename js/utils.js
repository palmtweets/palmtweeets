export const utils = {
    navTo: (id) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        window.scrollTo(0,0);
    },

    detectDevice: () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(ua);

        document.getElementById('action-android').classList.add('hidden');
        document.getElementById('action-ios').classList.add('hidden');
        document.getElementById('action-desktop').classList.add('hidden');

        if(isIOS) document.getElementById('action-ios').classList.remove('hidden');
        else if(isMobile) document.getElementById('action-android').classList.remove('hidden');
        else document.getElementById('action-desktop').classList.remove('hidden');
    },

    initPWA: () => {
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
    },

    formatDate: (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
    },

    formatCount: (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    }
};