/* APP INITIALIZATION */

window.onload = async () => {
    // Tunasubiri kidogo kuhakikisha scripts nyingine (auth.js, config.js) zime-load
    setTimeout(async () => {
        try {
            // 1. Check Auth State (Kutoka auth.js)
            // Kama checkSession haipo, itaruka kwenye catch (error) na kupeleka Intro
            const hasSession = await checkSession();
            
            // 2. Route Logic
            if(hasSession && currentUser){ 
                if(currentUser.role === 'student'){ 
                    renderFeed(); 
                    navTo('view-home'); 
                } else if(currentUser.role === 'admin'){ 
                    updateAdminHeader(); 
                    renderAdminPostsList(); 
                    navTo('view-admin-dash'); 
                } else {
                    navTo('view-intro');
                }
            } else { 
                navTo('view-intro'); 
            }
        } catch (error) {
            console.error("Initialization Error:", error);
            // Ikitokea error yoyote, usigande, mpeleke user 'Intro' akaanze upya
            navTo('view-intro');
        }
    }, 800); // 800ms delay kwa smooth splash

    // 3. Register PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('SW Registered'))
            .catch(err => console.log('SW Error:', err));
    }
};

/* GLOBAL LISTENERS */

// Hii ilikosekana mwanzo - Sasa X itafanya kazi
function closeUrgentPopup(){ 
    document.getElementById('modal-urgent').classList.remove('show'); 
}

function openUrgentPopup(){ 
    const list = document.getElementById('urgent-list');
    const modal = document.getElementById('modal-urgent');
    // Inavuta replies kutoka feed.js
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
    
    // Ficha dot akishafungua
    const dot = document.getElementById('bell-dot');
    if(dot) dot.style.display = 'none';
}

function updateBellIndicator(){ 
    // Logic moved to feed.js
}
