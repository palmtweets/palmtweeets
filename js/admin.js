/* ADMIN DASHBOARD LOGIC FULL */

let activeFiles = [];
let editingPostId = null;

// 1. MAIN FUNCTION: Inaitwa Admin akilogin
async function renderAdminPostsList(){ 
    const list = document.getElementById('admin-posts-list'); 
    const totalLikesEl = document.getElementById('dash-total-likes');
    const totalPostsEl = document.getElementById('dash-total-posts');

    list.innerHTML = '<div class="text-center py-4"><i class="ph ph-spinner animate-spin"></i> Loading data...</div>'; 
    
    if(!currentUser) return; 

    // A. FETCH POSTS & ANALYTICS
    const { data: myPosts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', currentUser.id)
        .order('created_at', {ascending: false});
    
    list.innerHTML = '';

    if(error || !myPosts || myPosts.length === 0){ 
        list.innerHTML = '<div class="text-gray-400 text-sm text-center py-4">No posts yet.</div>';
        if(totalLikesEl) totalLikesEl.innerText = '0';
        if(totalPostsEl) totalPostsEl.innerText = '0';
    } else {
        // Real Analytics
        const totalPosts = myPosts.length;
        const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);

        if(totalLikesEl) totalLikesEl.innerText = formatCount(totalLikes);
        if(totalPostsEl) totalPostsEl.innerText = totalPosts;

        // Render Posts
        myPosts.forEach(p => { 
            const div = document.createElement('div'); 
            div.className = 'bg-white p-3 border border-gray-100 rounded-lg flex justify-between items-center'; 
            
            const displayContent = p.content ? p.content : (p.media_urls && p.media_urls.length > 0 ? '📷 Image Post' : 'No content');

            div.innerHTML = `
              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-bold truncate pr-2">${displayContent}</div>
                <div class="text-xs text-gray-400 flex gap-2 mt-1">
                    <span>${new Date(p.created_at).toLocaleDateString()}</span>
                    <span>• ${p.likes_count} Likes</span>
                    <span class="bg-gray-100 px-1.5 rounded text-[10px] uppercase font-bold tracking-wide">${p.tag}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="deletePost(${p.id})" class="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors"><i class="ph-bold ph-trash"></i></button>
              </div>`; 
            list.appendChild(div); 
        }); 
    }

    // B. FETCH MESSAGES (SUPPORT INBOX) - HII NDIO MPYA
    loadSupportMessages();
}

// 2. FUNCTION YA KUVUTA UJUMBE WA WANAFUNZI
async function loadSupportMessages() {
    const inboxEl = document.getElementById('admin-support-inbox');
    if(!inboxEl) return;

    inboxEl.innerHTML = '<div class="py-4 text-center"><i class="ph ph-spinner animate-spin"></i> Checking inbox...</div>';

    // Admin anaona meseji zilizotumwa kwake (kwa department yake au jina lake)
    // Kwa urahisi wa sasa, Admin anaona meseji zote zilizotumwa kwa "Department" yake inayoendana na `admin_name` au `admin_type`
    // NOTE: Ili hii iwe precise 100%, tungehitaji column ya 'department' kwenye profile ya admin, 
    // lakini kwa sasa tutavuta zote ili uone zinafanya kazi, kisha unaweza kuweka filter.
    
    const { data: msgs, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(name, year, course)') // Join na profile ya mwanafunzi
        .order('created_at', {ascending: false});

    if(error || !msgs || msgs.length === 0) {
        inboxEl.innerHTML = '<div class="text-gray-400 text-sm text-center py-2">No new messages.</div>';
        return;
    }

    inboxEl.innerHTML = '';
    const listContainer = document.createElement('div');
    listContainer.className = 'flex flex-col gap-2 max-h-60 overflow-y-auto'; // Scrollable inbox

    msgs.forEach(msg => {
        // Filter logic: Only show if msg.department matches Admin's Name or Type (Optional)
        // Kwa sasa tunaonyesha zote ili uone system inafanya kazi
        
        const item = document.createElement('div');
        item.className = 'text-left p-3 bg-gray-50 border border-gray-100 rounded-lg';
        item.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-gray-900">${msg.sender?.name || 'Student'} <span class="font-normal text-gray-500">(${msg.sender?.year || 'N/A'})</span></span>
                <span class="text-[10px] text-gray-400">${new Date(msg.created_at).toLocaleDateString()}</span>
            </div>
            <div class="text-xs font-bold text-gray-400 uppercase mb-1">To: ${msg.department}</div>
            <p class="text-sm text-gray-700 leading-snug">${msg.content}</p>
            <div class="mt-2 flex justify-end">
                <button onclick="replyToStudent('${msg.sender?.name}')" class="text-[10px] font-bold border border-gray-300 px-2 py-1 rounded bg-white hover:bg-black hover:text-white transition-colors">Reply</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
    
    inboxEl.appendChild(listContainer);
}

// 3. REPLY FUNCTION (Placeholder for external action like Email/WhatsApp for now)
function replyToStudent(studentName) {
    alert(`To reply to ${studentName}, please use the official university email system or locate them via Registration Number.`);
    // Future: Hapa unaweza kuweka system ya kujibu ndani ya app
}

async function deletePost(id){ 
    if(!confirm('Are you sure you want to delete this post?')) return; 
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if(!error) {
        showToast('Post deleted successfully');
        renderAdminPostsList(); 
        // Pia update feed kule home ili ipotee
        renderFeed(); 
    } else {
        showToast('Error deleting post: ' + error.message, 'error');
    }
}

/* POST CREATION LOGIC (Kama awali) */
function initNewPost(){ 
    editingPostId=null; 
    document.getElementById('post-screen-title').innerText='New Update'; 
    document.getElementById('post-content').value=''; 
    activeFiles=[]; 
    renderMediaPreviews(); 
    setUrgency(document.querySelector('.urgency-btn'),'INFO'); 
    document.getElementById('target-course').value = ''; 
    navTo('view-admin-post'); 
}

function triggerUpload(type){ 
    const input=document.getElementById('file-input'); 
    input.accept = type==='image'? 'image/*':'.pdf,.doc,.docx'; 
    input.click(); 
}

function handleFileSelect(input){ 
    if(!input.files || input.files.length===0) return; 
    const files = Array.from(input.files); 
    activeFiles = files.map(file=>({ 
        fileObject: file, 
        type: file.type.includes('image')?'image':'pdf', 
        name: file.name,
        previewUrl: URL.createObjectURL(file) 
    })); 
    renderMediaPreviews(); 
}

function renderMediaPreviews(){ 
    const mediaPreview=document.getElementById('media-preview'); 
    const mediaList=document.getElementById('media-list'); 
    const filePreview=document.getElementById('file-preview'); 
    const fileList=document.getElementById('file-list'); 
    
    mediaList.innerHTML=''; 
    fileList.innerHTML=''; 
    
    if(activeFiles.length===0){ 
        mediaPreview.classList.add('hidden'); 
        filePreview.classList.add('hidden'); 
        return;
    } 
    mediaPreview.classList.remove('hidden'); 
    filePreview.classList.remove('hidden'); 
    
    activeFiles.forEach(f=>{ 
        if(f.type==='image'){ 
            const div=document.createElement('div'); 
            div.className='rounded overflow-hidden'; 
            div.innerHTML = `<img src="${f.previewUrl}" class="w-full aspect-portrait object-cover">`; 
            mediaList.appendChild(div);
        } else { 
            const row=document.createElement('div'); 
            row.className='flex items-center gap-2'; 
            row.innerHTML = `<i class="ph-fill ph-file-pdf text-red-500 text-xl"></i><div><div class="text-sm font-bold">${f.name}</div></div>`; 
            fileList.appendChild(row);
        } 
    }); 
}

function setUrgency(btn,val){ 
    document.querySelectorAll('.urgency-btn').forEach(b=>b.classList.remove('active')); 
    if(btn && btn.classList) btn.classList.add('active'); 
    document.getElementById('post-tag').value = val; 
}

async function handlePublishPost(){ 
    const content=document.getElementById('post-content').value.trim(); 
    const category=document.getElementById('post-category').value; 
    const tag=document.getElementById('post-tag').value||'INFO'; 
    let targetUni=currentUser?.uni||'All'; 
    const targetCourse = document.getElementById('target-course').value.trim(); 
    
    if(!content && activeFiles.length===0) return showToast('Write something first', 'error'); 

    toggleBtnLoading('btn-publish-post', true);

    // 1. Upload Files to Supabase Storage
    let uploadedMedia = [];
    if(activeFiles.length > 0) {
        for(let f of activeFiles) {
            // Sanitize file name to avoid errors
            const safeName = f.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `${Date.now()}_${safeName}`;
            
            const { data, error } = await supabase.storage.from('media').upload(fileName, f.fileObject);
            
            if(!error) {
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
                uploadedMedia.push({ type: f.type, url: publicUrl, name: f.name });
            } else {
                console.error("Upload error:", error);
                // Continue without this file or handle error
            }
        }
    }

    // 2. Insert Post to DB
    const { error } = await supabase.from('posts').insert([{
        creator_id: currentUser.id,
        source_name: currentUser.name,
        content: content,
        category: category,
        tag: tag,
        uni_target: targetUni,
        course_target: targetCourse,
        year_target: document.getElementById('target-year-select').value||'All',
        media_urls: uploadedMedia,
        likes_count: 0
    }]);

    if(!error){
        showToast('Posted Successfully'); 
        renderAdminPostsList(); 
        // Safisha fomu
        document.getElementById('post-content').value = '';
        activeFiles = [];
        renderMediaPreviews();
        navTo('view-admin-dash'); 
    } else {
        showToast('Error posting: ' + error.message, 'error');
    }
    
    toggleBtnLoading('btn-publish-post', false);
}
