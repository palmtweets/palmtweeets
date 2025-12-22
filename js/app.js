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
function updateBellIndicator(){ 
    // Logic moved to feed.js (checkMyReplies)
}

function openUrgentPopup(){ 
    const list = document.getElementById('urgent-list');
    const modal = document.getElementById('modal-urgent');
    const replies = window.mySupportReplies || [];

    list.innerHTML = '';

    if(replies.length === 0){
        list.innerHTML = '<div class="text-center text-gray-400 p-4 text-sm">No new notifications.</div>';
    } else {
        const header = document.createElement('div');
        header.className = 'font-bold text-sm text-black mb-2 px-2';
        header.innerText = 'Support Replies';
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

// HII NDIO ILIKUWA INAKOSEKANA (FUNCTION YA KUFUNGA)
function closeUrgentPopup(){ 
    document.getElementById('modal-urgent').classList.remove('show'); 
}
    // Ficha dot akishafungua
    const dot = document.getElementById('bell-dot');
    if(dot) dot.style.display = 'none';
}

