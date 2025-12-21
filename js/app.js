/* --- CONFIGURATION --- */
const universities = ["University of Dar es Salaam (UDSM)", "University of Dodoma (UDOM)", "IFM", "Ardhi University", "Mzumbe", "SUA", "DIT", "St. Joseph", "Tumaini University"];
const interests = ["All", "Internships","Scholarships","Tech & Innovation","Politics","Sports","Events","Creative Arts","Business","Science"];

// SUPABASE CONFIG (Weka funguo zako hapa ukipenda, kwa sasa tunatumia Simulation)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* --- STATE MANAGEMENT --- */
let currentUser = null; 
let posts = [];
let isEditingStudent = false;

/* --- PERSISTENCE & INIT --- */
function loadStoredAccounts(){ 
    window._students = JSON.parse(localStorage.getItem('students')||'[]'); 
    window._admins = JSON.parse(localStorage.getItem('admins')||'[]'); 
}
function saveStudents(){ localStorage.setItem('students', JSON.stringify(window._students||[])); }
function saveAdmins(){ localStorage.setItem('admins', JSON.stringify(window._admins||[])); }
function savePosts(){ localStorage.setItem('posts', JSON.stringify(posts||[])); updateBellIndicator(); }

function loadPosts(){ 
    const existing = JSON.parse(localStorage.getItem('posts')||'null');
    // Kama posts hamna au chache (za zamani), jaza mpya
    if(!existing || existing.length < 5) {
        posts = getInitialPosts(); // Hii function iko chini kabisa
        savePosts(); 
    } else {
        posts = existing;
    }
}

function loadCurrentUser(){ 
    const cu = localStorage.getItem('currentUser'); 
    if(cu) currentUser = JSON.parse(cu); 
}

function persistCurrentUser(){ 
    if(currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser)); 
    else localStorage.removeItem('currentUser'); 
}

/* --- WINDOW ONLOAD (ENTRY POINT) --- */
window.onload = () => {
    // 1. Load Data
    loadStoredAccounts();
    loadCurrentUser();
    loadPosts();

    // 2. Setup Dropdowns & Chips
    setupUI();

    // 3. Navigate to correct screen
    setTimeout(() => {
        const splash = document.getElementById('view-splash');
        if(splash) splash.classList.remove('active');

        if(currentUser){
            if(currentUser.type === 'student'){
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
        updateBellIndicator();
    }, 1500); // Splash screen lasts 1.5s
};

/* --- NAVIGATION & UI HELPERS --- */
function navTo(id){ 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
    const el = document.getElementById(id); 
    if(el) el.classList.add('active'); 
    window.scrollTo(0,0); 
}

function setupUI(){
    // Interest Chips (Student Signup)
    const chipContainer = document.getElementById('interest-chips');
    if(chipContainer) {
        chipContainer.innerHTML=''; 
        interests.forEach(name => { 
            const d = document.createElement('div'); 
            d.className = 'chip'; 
            d.textContent = name === 'All'? 'All Interests': name; 
            d.onclick = function(){ 
                if(name === 'All'){ 
                    document.querySelectorAll('#interest-chips .chip').forEach(c => c.classList.remove('active')); 
                    this.classList.add('active'); 
                } else { 
                    const allChip = Array.from(document.querySelectorAll('#interest-chips .chip')).find(c => c.textContent === 'All Interests'); 
                    if(allChip && allChip.classList.contains('active')) allChip.classList.remove('active'); 
                    this.classList.toggle('active'); 
                } 
            }; 
            chipContainer.appendChild(d); 
        });
    }

    // Uni Selects
    const targetUniSel = document.getElementById('target-uni-select');
    if(targetUniSel) {
        targetUniSel.innerHTML = '';
        universities.forEach(u => { 
            const opt = document.createElement('option'); 
            opt.value = u; opt.textContent = u; 
            targetUniSel.appendChild(opt); 
        });
    }
}

function showUniList(dropdownId){ 
    const drop = document.getElementById(dropdownId); 
    drop.classList.remove('hidden'); 
    renderUniList(universities, dropdownId); 
}

function filterUniList(q, dropdownId){ 
    const filtered = universities.filter(u => u.toLowerCase().includes(q.toLowerCase())); 
    renderUniList(filtered, dropdownId); 
}

function renderUniList(list, dropdownId){ 
    const drop = document.getElementById(dropdownId); 
    const targetInputId = dropdownId === 'uni-dropdown-student' ? 'input-uni' : 'admin-uni-input'; 
    
    if(list.length === 0){ 
        drop.innerHTML = '<div class="p-3 text-sm text-gray-400">No matches found</div>'; 
        return;
    } 
    drop.innerHTML = list.map(u => `
        <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 text-sm" 
             onclick="selectUni('${u.replace(/'/g, "\\'")}', '${targetInputId}', '${dropdownId}')">${u}</div>
    `).join(''); 
}

function selectUni(name, inputId, dropdownId){ 
    document.getElementById(inputId).value = name; 
    document.getElementById(dropdownId).classList.add('hidden'); 
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => { 
    if(!e.target.closest('.relative')) document.querySelectorAll('[id^="uni-dropdown"]').forEach(el => el.classList.add('hidden')); 
});

/* --- STUDENT LOGIC --- */
function openStudentSignup(){
    isEditingStudent = false; 
    navTo('view-signup');
    // Clear forms
    ['input-name', 'input-uni', 'input-email', 'input-password', 'input-year', 'input-course'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
    document.querySelectorAll('#interest-chips .chip').forEach(ch => ch.classList.remove('active'));
    document.getElementById('student-submit-btn').innerHTML = 'Enter Platform <i class="ph-bold ph-caret-right ml-2"></i>';
}

function finishStudentSignup(e){ 
    e.preventDefault(); 
    const email = document.getElementById('input-email').value.trim(); 
    const password = document.getElementById('input-password').value; 
    const name = document.getElementById('input-name').value.trim(); 
    const uni = document.getElementById('input-uni').value.trim(); 
    const year = document.getElementById('input-year').value; 
    const course = document.getElementById('input-course').value; // HII HAPA COURSE

    if(!uni) return alert('Please select university'); 
    if(!course) return alert('Please enter your course');

    const selected = Array.from(document.querySelectorAll('#interest-chips .chip.active')).map(n => n.textContent === 'All Interests' ? 'All' : n.textContent); 

    // Simulation Save
    const user = { id: 'stu'+Date.now(), type: 'student', name, uni, interests: selected, email, password, year, course }; 
    
    window._students.push(user); 
    saveStudents(); 
    currentUser = user; 
    persistCurrentUser();
    
    alert('Account Created! Welcome to PalmTweets.');
    renderFeed(); 
    navTo('view-home'); 
    updateBellIndicator(); 
}

function handleStudentLogin(e){ 
    e && e.preventDefault(); 
    const email = document.getElementById('login-email').value.trim(); 
    const password = document.getElementById('login-password').value; 
    
    const found = (window._students||[]).find(s => s.email === email && s.password === password); 
    if(!found) return alert('Invalid credentials'); 
    
    currentUser = found; 
    persistCurrentUser(); 
    renderFeed(); 
    navTo('view-home'); 
    updateBellIndicator(); 
}

function openProfileMenu(){
    if(!currentUser) return;
    if(currentUser.type === 'student'){
         // Fill form for editing (Simplified)
         openStudentSignup();
         isEditingStudent = true;
         document.getElementById('input-name').value = currentUser.name;
         document.getElementById('input-email').value = currentUser.email;
         document.getElementById('input-uni').value = currentUser.uni;
         document.getElementById('input-course').value = currentUser.course;
         document.getElementById('student-submit-btn').innerHTML = "Update Profile";
    }
}

function confirmLogout(){
    if(confirm('Log out?')){
        currentUser = null;
        persistCurrentUser();
        navTo('view-intro');
    }
}

/* --- ADMIN LOGIC --- */
function toggleAdminUniField(){ 
    const type = document.getElementById('admin-type').value; 
    const el = document.getElementById('admin-uni-field'); 
    if(type === 'company' || type === 'gov') el.style.display = 'none'; 
    else el.style.display = 'block'; 
}

function handleAdminSignup(e){
    e && e.preventDefault();
    // (Simplified for brevity - assumes Simulation)
    const name = document.getElementById('admin-name').value;
    const type = document.getElementById('admin-type').value;
    const uni = document.getElementById('admin-uni-input').value;
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    const finalUni = (type === 'company' || type === 'gov') ? 'All' : uni;
    const org = { id: 'org'+Date.now(), name, type, uni: finalUni, role: 'admin', email, password };
    
    window._admins.push(org);
    saveAdmins();
    currentUser = org;
    persistCurrentUser();
    updateAdminHeader();
    renderAdminPostsList();
    navTo('view-admin-dash');
}

function handleAdminLogin(e){
    e && e.preventDefault();
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;
    
    const found = window._admins.find(a => a.email === email && a.password === password);
    if(!found) return alert('Invalid credentials');
    
    currentUser = found;
    persistCurrentUser();
    updateAdminHeader();
    renderAdminPostsList();
    navTo('view-admin-dash');
}

function updateAdminHeader(){
    if(!currentUser) return;
    document.getElementById('dash-name').textContent = currentUser.name;
    const avatar = document.getElementById('dash-avatar-letter');
    avatar.textContent = currentUser.name.charAt(0);
}

function initNewPost(){
    navTo('view-admin-post');
}

function handlePublishPost(){
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const tag = document.getElementById('post-tag').value;
    
    const newPost = {
        id: Date.now(),
        source: currentUser.name,
        type: currentUser.type,
        verified: getVerifiedColor(currentUser.type),
        content,
        category,
        tag,
        uni: currentUser.uni,
        targetYear: 'All',
        likes: 0,
        comments: [],
        timestamp: Date.now(),
        time: 'Just Now',
        dateISO: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    savePosts();
    alert('Posted!');
    renderAdminPostsList();
    navTo('view-admin-dash');
}

function renderAdminPostsList(){
    const list = document.getElementById('admin-posts-list');
    list.innerHTML = '';
    const myPosts = posts.filter(p => p.source === currentUser.name);
    
    if(myPosts.length === 0){
        list.innerHTML = '<div class="text-gray-400 text-sm p-4 text-center">No posts yet.</div>';
        return;
    }
    
    myPosts.forEach(p => {
        const div = document.createElement('div');
        div.className = 'bg-white p-3 border border-gray-100 rounded-lg flex justify-between';
        div.innerHTML = `<div class="font-bold text-sm">${p.content.substring(0,30)}...</div><div class="text-xs text-gray-400">${p.likes} likes</div>`;
        list.appendChild(div);
    });
}

function setUrgency(btn, val){
    document.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('post-tag').value = val;
}

/* --- FEED LOGIC (THE FIX) --- */
function getVerifiedColor(type){ 
    if(type==='official') return 'green'; 
    if(type==='company') return 'blue'; 
    if(type==='system') return 'gold'; 
    if(type==='ministry') return 'black'; 
    if(type==='gov') return 'purple'; 
    return 'black'; 
}

function getDateLabel(dateISO){ 
    const d=new Date(dateISO); 
    const now=new Date(); 
    if(d.toDateString()===now.toDateString()) return 'Today'; 
    return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); 
}

function renderFeed(filter = 'all'){
    const container = document.getElementById('feed-list');
    container.innerHTML = '';
    
    // 1. FILTER
    let displayPosts = posts.filter(post => {
        // System posts appear everywhere unless filtered specifically
        if(post.type === 'system' && filter === 'all') return true;
        
        // Category Check
        if(filter !== 'all' && post.category !== filter) return false;
        
        // University Check (For students)
        if(currentUser && currentUser.type === 'student'){
             if(post.uni !== 'All' && post.uni !== currentUser.uni) return false;
        }
        return true;
    });

    displayPosts.sort((a,b) => b.timestamp - a.timestamp);

    // 2. EMPTY STATE (HII NDIO ILIKUWA INAKOSEKANA)
    if(displayPosts.length === 0){
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center pt-20 px-10 text-center opacity-60 fade-in">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="ph-fill ph-tray text-2xl text-gray-400"></i>
                </div>
                <h3 class="font-bold text-gray-900 mb-1">No Updates</h3>
                <p class="text-sm text-gray-500">There are no posts in this category yet.</p>
            </div>
        `;
        return;
    }

    // 3. RENDER
    let lastDateLabel = '';
    displayPosts.forEach(post => {
        const dateLabel = getDateLabel(post.dateISO);
        if(dateLabel !== lastDateLabel){
             container.insertAdjacentHTML('beforeend', `<div class="date-divider"><span>${dateLabel}</span></div>`);
             lastDateLabel = dateLabel;
        }

        let badgeClass = 'badge-' + post.verified;
        let urgencyHTML = '';
        if(post.tag === 'URGENT') urgencyHTML = `<span class="inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2">URGENT</span>`;
        else if(post.tag === 'IMPORTANT') urgencyHTML = `<span class="inline-block bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded ml-2">IMPORTANT</span>`;

        let avatarHTML = `<div class="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-lg">${(post.source||'?').charAt(0)}</div>`;

        const wrapperClass = post.type === 'system' ? 'card-feed system-gold' : 'card-feed fade-in';
        
        const html = `
          <article class="${wrapperClass}">
            <div class="flex items-start gap-3 mb-3">
              ${avatarHTML}
              <div class="flex-1">
                <div class="flex items-center gap-1 flex-wrap">
                  <h3 class="font-bold text-sm text-gray-900">${post.source}</h3>
                  <i class="ph-fill ph-seal-check ${badgeClass} text-sm"></i>
                  ${urgencyHTML}
                </div>
                <div class="text-xs text-gray-400 font-medium">${post.time}</div>
              </div>
            </div>
            <p class="text-sm leading-relaxed text-gray-800 whitespace-pre-line mb-2">${post.content}</p>
            <div class="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
              <div class="flex gap-6">
                <button class="flex items-center gap-1.5 text-gray-500 text-xs font-semibold"><i class="ph ph-heart text-lg"></i> <span>${post.likes}</span></button>
                <button class="flex items-center gap-1.5 text-gray-500 text-xs font-semibold"><i class="ph ph-chat-circle text-lg"></i> <span>${post.comments.length}</span></button>
              </div>
            </div>
          </article>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function filterFeed(category, btn){
    document.querySelectorAll('#view-home .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderFeed(category);
}

function updateBellIndicator(){
    // Simple mock
    const dot = document.getElementById('bell-dot');
    if(dot) dot.style.display = 'block';
}

function openUrgentPopup(){
    document.getElementById('modal-urgent').classList.add('show');
    // Render urgent list logic here...
    document.getElementById('urgent-list').innerHTML = '<div class="p-4 text-sm text-gray-500">No urgent items.</div>';
}
function closeUrgentPopup(){ document.getElementById('modal-urgent').classList.remove('show'); }

/* --- DUMMY DATA --- */
function getInitialPosts(){
    return [
        {
            id: 1, source: "PalmTweets AI", type: "system", verified: "gold",
            content: "Welcome to PalmTweets! Verified updates only.",
            category: "system", uni: "All", tag: "SYSTEM",
            likes: 1200, comments: [], timestamp: Date.now(), dateISO: new Date().toISOString(), time: "Pinned"
        },
        {
            id: 2, source: "Ministry of Loans", type: "gov", verified: "purple",
            content: "Loan allocations for Batch 3 are out.",
            category: "official", uni: "All", tag: "IMPORTANT",
            likes: 500, comments: [], timestamp: Date.now()-10000, dateISO: new Date().toISOString(), time: "2h ago"
        },
        {
            id: 3, source: "CRDB Bank", type: "company", verified: "blue",
            content: "Graduate Management Trainee applications open.",
            category: "opportunity", uni: "All", tag: "INFO",
            likes: 340, comments: [], timestamp: Date.now()-20000, dateISO: new Date().toISOString(), time: "4h ago"
        }
    ];
}
