/* APP INITIALIZATION - FINAL PRODUCTION VERSION */

window.onload = async () => {
    // 1. Check Auth State (Kuangalia kama user yupo)
    // Tunatumia 'sb' kulingana na config.js mpya
    const hasSession = await checkSession();
    
    // 2. Route Logic (Kuelekeza user sehemu sahihi)
    setTimeout(() => {
        if(hasSession && currentUser){ 
            if(currentUser.role === 'student'){ 
                renderFeed(); 
                navTo('view-home'); // Hii inaondoa Splash Screen na kuweka Home
            } else if(currentUser.role === 'admin'){ 
                updateAdminHeader(); 
                renderAdminPostsList(); 
                navTo('view-admin-dash'); // Hii inaondoa Splash Screen na kuweka Admin Dash
            } else {
                // Kama role haijulikani (Safety fallback)
                navTo('view-intro');
            }
        } else { 
            // Kama hajalogin, mpeleke Intro
            navTo('view-intro'); 
        }
    }, 700); // Tunasubiri kidogo (0.7 sec) ili splash screen ionekane kidogo

    // 3. Register PWA Service Worker (Kwa ajili ya speed na offline)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Error:', err));
    }
};

/* GLOBAL LISTENERS & UTILS */

// Hii inatumika kufunga Popups zote (Urgent & Support)
function closeUrgentPopup(){ 
    document.getElementById('modal-urgent').classList.remove('show'); 
}

// Logic ya kufungua Urgent Popup (Inaonyesha Majibu ya Admin)
function openUrgentPopup(){ 
    const list = document.getElementById('urgent-list');
    const modal = document.getElementById('modal-urgent');
    // window.mySupportReplies inatoka kwenye feed.js (checkMyReplies)
    const replies = window.mySupportReplies || [];

    list.innerHTML = '';

    if(replies.length === 0){
        list.innerHTML = '<div class="text-center text-gray-400 p-4 text-sm">No new notifications.</div>';
    } else {
        const header = document.createElement('div');
        header.className = 'font-bold text-sm text-black mb-2 px-2';
        header.innerText = 'Official Replies';
        list.appendChild(header);

        replies.forEach(r => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 border border-gray-100 p-3 rounded-lg mb-2';
            div.innerHTML = `
                <div class="text-xs text-gray-500 mb-1 flex justify-between">
                    <span class="font-bold text-black">${r.department}</span>
                    <span>${new Date(r.replied_at).toLocaleDateString()}</span>
                </div>
                <div class="text-sm text-gray-600 mb-2 border-l-2 border-gray-300 pl-2">"${r.content}"</div>
                <div class="text-sm font-bold text-black">Reply: ${r.reply_content}</div>
            `;
            list.appendChild(div);
        });
    }

    modal.classList.add('show');
    
    // Ficha dot nyekundu akishafungua
    const dot = document.getElementById('bell-dot');
    if(dot) dot.style.display = 'none';
}

// Update Bell (Imehamishiwa logic kwenye feed.js, hapa tunaiacha tupu au kwa matumizi mengine)
function updateBellIndicator(){ 
    // Logic handled in feed.js -> checkMyReplies()
}
    const dot = document.getElementById('bell-dot');
    if(dot) dot.style.display = 'none';
}


