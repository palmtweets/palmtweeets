/* FEED LOGIC */
let posts = [];
let currentImageIndex = {};
let currentPostIdForComments = null;

async function renderFeed(filter='all'){ 
    const container=document.getElementById('feed-list'); 
    container.innerHTML='<div class="p-8 text-center"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';
    
    // Fetch Posts from Supabase
    let query = supabase.from('posts').select(`*, creator:profiles(name, admin_type, avatar_url)`).order('created_at', { ascending: false });
    
    if(filter !== 'all') query = query.eq('category', filter);

    const { data, error } = await query;
    if(error) return showToast('Error loading feed', 'error');
    
    posts = data;
    container.innerHTML = '';

    // Logic for filtering by Uni/Course for students
    const visiblePosts = posts.filter(post => {
        if(currentUser && currentUser.role === 'student') {
            if(post.uni_target && post.uni_target !== 'All' && post.uni_target !== currentUser.uni) return false;
            // Course filtering logic (Basic partial match)
            if(post.course_target && post.course_target.trim() !== '' && !currentUser.course.toLowerCase().includes(post.course_target.toLowerCase())) return true; // Show all if course not strict, or implement stricter logic
        }
        return true;
    });

    if(visiblePosts.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-gray-400">No updates yet.</div>';
        return;
    }

    let lastDateLabel=''; 
    visiblePosts.forEach(post => {
        const dateLabel=getDateLabel(post.created_at); 
        if(dateLabel!==lastDateLabel){ 
            container.insertAdjacentHTML('beforeend',`<div class="date-divider"><span>${dateLabel}</span></div>`); 
            lastDateLabel=dateLabel; 
        }
        
        let badgeClass='badge-black'; 
        // Badge logic based on admin_type
        if(post.creator.admin_type === 'official') badgeClass='badge-green';
        if(post.creator.role === 'system') badgeClass = 'badge-gold';

        let urgencyHTML=''; 
        if(post.tag==='URGENT') urgencyHTML=`<span class="inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2">URGENT</span>`; 
        else if(post.tag==='IMPORTANT') urgencyHTML=`<span class="inline-block bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded ml-2">IMPORTANT</span>`;
        
        let avatarHTML=`<div class="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-lg">${(post.source_name||'?').charAt(0)}</div>`; 
        if(post.creator.avatar_url) avatarHTML=`<img src="${post.creator.avatar_url}" class="w-10 h-10 rounded-lg object-cover bg-gray-100">`;
        
        // Media Logic
        let mediaHTML=''; 
        let mediaUrls = post.media_urls || [];
        if(mediaUrls.length > 0){ 
            initCarouselForPost(post.id, mediaUrls.length);
            if(mediaUrls.length===1){ 
                const m = mediaUrls[0]; 
                if(m.type==='image') mediaHTML = `<div class="mt-3 rounded-lg overflow-hidden border border-gray-100 bg-gray-50"><img src="${m.url}" class="w-full aspect-portrait" loading="lazy"></div>`; 
                else mediaHTML = `<div class="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3"><i class="ph-fill ph-file-pdf text-red-500 text-xl"></i><div><div class="text-sm font-bold">${m.name||'Attached Document'}</div><div class="text-xs text-gray-500">Tap to view</div></div></div>`; 
            } else { 
                const idx = currentImageIndex[post.id]||0; 
                const m = mediaUrls[idx]; 
                // Simple Carousel UI
                mediaHTML = `<div class="mt-3 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 carousel-wrap">
                    <img src="${m.url}" class="w-full aspect-portrait" loading="lazy">
                    <div class="carousel-arrow carousel-left" onclick="showPrevImage(${post.id})">&#8249;</div>
                    <div class="carousel-arrow carousel-right" onclick="showNextImage(${post.id})">&#8250;</div>
                    <div class="carousel-indicator">${idx+1}/${mediaUrls.length}</div>
                </div>`; 
            }
        }

        const likeCount=formatCount(post.likes_count); 
        
        const html = `
          <article id="post-${post.id}" class="card-feed fade-in">
            <div class="flex items-start gap-3 mb-3">
              ${avatarHTML}
              <div class="flex-1">
                <div class="flex items-center gap-1 flex-wrap">
                  <h3 class="font-bold text-sm text-gray-900">${post.source_name}</h3>
                  <i class="ph-fill ph-seal-check ${badgeClass} text-sm"></i>
                  ${urgencyHTML}
                </div>
                <div class="text-xs text-gray-400 font-medium">${getDateLabel(post.created_at)} • ${post.year_target==='All'?'Public':post.year_target}</div>
              </div>
              <button class="text-gray-300" onclick="openReport(${post.id})"><i class="ph ph-warning-circle text-xl"></i></button>
            </div>
            <p class="text-sm leading-relaxed text-gray-800 whitespace-pre-line mb-2">${post.content||''}</p>
            ${mediaHTML}
            <div class="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
              <div class="flex gap-6">
                <button onclick="handleLike(this,${post.id})" class="flex items-center gap-1.5 text-gray-500 text-xs font-semibold hover:text-red-500 transition-colors"><i class="ph ph-heart text-lg"></i> <span>${likeCount}</span></button>
                <button onclick="openComments(${post.id})" class="flex items-center gap-1.5 text-gray-500 text-xs font-semibold hover:text-black transition-colors"><i class="ph ph-chat-circle text-lg"></i> <span>Comment</span></button>
              </div>
              <button onclick="showToast('Shared successfully')" class="text-gray-400 hover:text-black transition-colors"><i class="ph ph-share-network text-lg"></i></button>
            </div>
          </article>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function filterFeed(category, btn){ 
    document.querySelectorAll('#view-home .chip').forEach(c=>c.classList.remove('active')); 
    btn.classList.add('active'); 
    renderFeed(category); 
}

/* CAROUSEL LOGIC */
function initCarouselForPost(postId, count){ if(typeof currentImageIndex[postId] === 'undefined') currentImageIndex[postId]=0; }
function showPrevImage(postId){ 
    const post = posts.find(p=>p.id===postId); 
    if(!post || !post.media_urls) return; 
    currentImageIndex[postId] = (currentImageIndex[postId] - 1 + post.media_urls.length) % post.media_urls.length; 
    renderFeed(); // Re-render to show change
}
function showNextImage(postId){ 
    const post = posts.find(p=>p.id===postId); 
    if(!post || !post.media_urls) return; 
    currentImageIndex[postId] = (currentImageIndex[postId] + 1) % post.media_urls.length; 
    renderFeed(); 
}

/* INTERACTION LOGIC */
async function handleLike(btn, postId){ 
    // Optimistic UI Update
    const icon=btn.querySelector('i'); 
    const countSpan=btn.querySelector('span'); 
    let current = parseInt(countSpan.innerText.replace('k','000')) || 0;
    
    if(icon.classList.contains('ph-heart')){ 
        icon.classList.remove('ph-heart'); icon.classList.add('ph-fill','ph-heart','text-red-500'); btn.classList.add('text-red-500'); 
        countSpan.innerText = formatCount(current + 1);
        // DB Update
        await supabase.rpc('increment_likes', { post_id: postId }); // Need RPC or simple update
    } else { 
        icon.classList.remove('ph-fill','ph-heart','text-red-500'); icon.classList.add('ph-heart'); btn.classList.remove('text-red-500'); 
        countSpan.innerText = formatCount(current - 1);
    } 
}

async function openComments(postId){ 
    currentPostIdForComments=postId; 
    const list=document.getElementById('comments-list'); 
    const countHeader=document.getElementById('comment-header-count'); 
    list.innerHTML='<div class="text-center p-4"><i class="ph ph-spinner animate-spin"></i></div>';
    
    document.getElementById('modal-comments').classList.add('show');
    
    // Fetch Comments
    const { data: comments } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', {ascending: true});
    
    countHeader.innerText = `(${comments.length})`; 
    list.innerHTML='';
    
    if(comments.length===0) list.innerHTML='<div class="text-center text-gray-400 text-sm mt-10">No comments yet.</div>'; 
    else comments.forEach((c)=>{ 
        const div=document.createElement('div'); div.className='flex gap-3 text-sm'; 
        const userInitial = c.user_name ? c.user_name.charAt(0) : '?'; 
        div.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">${userInitial}</div>
          <div><div class="font-bold text-xs text-gray-900">${c.user_name}</div><div class="text-gray-700 mt-0.5">${c.content}</div></div>
        `; 
        list.appendChild(div); 
    }); 
    
    list.scrollTop = list.scrollHeight; 
}

function closeComments(){ document.getElementById('modal-comments').classList.remove('show'); }

async function postComment(){ 
    const input=document.getElementById('comment-input'); 
    const text=input.value.trim(); 
    if(!text) return; 
    
    const { error } = await supabase.from('comments').insert([{
        post_id: currentPostIdForComments,
        user_id: currentUser.id,
        user_name: currentUser.name,
        content: text
    }]);

    if(!error) {
        input.value=''; 
        openComments(currentPostIdForComments); // Reload comments
        showToast('Comment Added'); 
    } else {
        showToast('Failed to comment', 'error');
    }
}

/* REPORT */
function openReport(postId){ document.getElementById('modal-report').classList.add('show'); document.getElementById('report-reason').value=''; }
function closeReport(){ document.getElementById('modal-report').classList.remove('show'); }
function submitReport(){ 
    const reason=document.getElementById('report-reason').value; 
    if(!reason) return showToast('Please provide a reason', 'error'); 
    showToast('Report submitted'); 
    closeReport(); 
}

/* STUDENT SUPPORT */
function openSupportModal(){ document.getElementById('modal-support').classList.add('show'); document.getElementById('support-msg').value=''; }
function closeSupportModal(){ document.getElementById('modal-support').classList.remove('show'); }
async function sendSupport(){ 
    const msg=document.getElementById('support-msg').value.trim(); 
    const dept = document.getElementById('support-dept').value;
    if(!msg) return showToast('Please describe your issue', 'error'); 
    
    toggleBtnLoading('btn-support-send', true);
    
    const { error } = await supabase.from('messages').insert([{
        sender_id: currentUser.id,
        department: dept,
        content: msg
    }]);

    if(!error){
        showToast('Message sent to Office', 'success'); 
        closeSupportModal(); 
    } else {
        showToast('Failed to send', 'error');
    }
    toggleBtnLoading('btn-support-send', false);
}
