/* APP INITIALIZATION */

window.onload = async () => {
    // 1. Check Auth State
    const hasSession = await checkSession();
    
    // 2. Route
    setTimeout(() => {
        if(hasSession && currentUser){ 
            if(currentUser.role==='student'){ 
                renderFeed(); 
                navTo('view-home'); 
            } else if(currentUser.role==='admin'){ 
                updateAdminHeader(); 
                renderAdminPostsList(); 
                navTo('view-admin-dash'); 
            } else {
                navTo('view-intro');
            }
        } else { 
            navTo('view-intro'); 
        }
    }, 700);

    // 3. Register PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Error:', err));
    }
};

/* GLOBAL LISTENERS */
// Bell Icon Logic
function updateBellIndicator(){ 
    const dot = document.getElementById('bell-dot'); 
    if(dot) dot.style.display='none'; 
}

function openUrgentPopup(){ 
    showToast('No urgent alerts currently.');
}
