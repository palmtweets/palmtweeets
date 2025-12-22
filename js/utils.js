/* NAVIGATION */
function navTo(id){ 
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); 
    const el=document.getElementById(id); 
    if(el) el.classList.add('active'); 
    window.scrollTo(0,0); 
}

/* TOASTS */
function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="ph-fill ph-check-circle text-green-500 text-xl"></i>' : '<i class="ph-fill ph-warning-circle text-red-500 text-xl"></i>';
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.5s forwards'; setTimeout(() => toast.remove(), 500); }, 3500);
}

/* LOADING UI */
function toggleBtnLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    if(isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>`;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
    }
}

/* FORMATTERS */
function formatCount(num){ if(num>=1000) return (num/1000).toFixed(1)+'k'; return num; }

function getDateLabel(dateISO){ 
    const d=new Date(dateISO); 
    const now=new Date(); 
    const diffTime=Math.abs(now-d); 
    const diffDays=Math.ceil(diffTime/(1000*60*60*24)); 
    if(d.toDateString()===now.toDateString()) return 'Today'; 
    if(diffDays<=2) return 'Yesterday'; 
    return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); 
}

/* UNI DROPDOWN HELPERS */
function showUniList(dropdownId){ 
    const drop=document.getElementById(dropdownId); 
    drop.classList.remove('hidden'); 
    renderUniList(universities, dropdownId); 
}

function filterUniList(q, dropdownId){ 
    const filtered = universities.filter(u=>u.toLowerCase().includes(q.toLowerCase())); 
    renderUniList(filtered, dropdownId); 
}

function renderUniList(list, dropdownId){ 
    const drop=document.getElementById(dropdownId); 
    const targetInputId = dropdownId==='uni-dropdown-student'?'input-uni':'admin-uni-input'; 
    if(list.length===0){ drop.innerHTML='<div class="p-3 text-sm text-gray-400">No matches found</div>'; return;} 
    drop.innerHTML = list.map(u => `
        <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 text-sm" onclick="selectUni('${u.replace(/'/g, "\\'")}','${targetInputId}','${dropdownId}')">${u}</div>
    `).join(''); 
}

function selectUni(name,inputId,dropdownId){ 
    document.getElementById(inputId).value = name; 
    document.getElementById(dropdownId).classList.add('hidden'); 
}

document.addEventListener('click', (e)=>{ 
    if(!e.target.closest('.relative')) document.querySelectorAll('[id^="uni-dropdown"]').forEach(el=>el.classList.add('hidden')); 
});

/* CUSTOM MODAL */
let pendingConfirmAction = null;
function openModalConfirm(text, action){
    document.getElementById('modal-confirm-text').innerText = text;
    pendingConfirmAction = action;
    document.getElementById('modal-confirm').classList.add('show');
}
function closeModalConfirm(){ 
    document.getElementById('modal-confirm').classList.remove('show'); 
    pendingConfirmAction = null; 
}
document.getElementById('modal-confirm-btn').addEventListener('click', ()=>{
    if(pendingConfirmAction) pendingConfirmAction();
    closeModalConfirm();
});
