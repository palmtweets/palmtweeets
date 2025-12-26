/* ADMIN DASHBOARD LOGIC (VIDEO SUPPORT ADDED) */

let activeFiles = [];
let editingPostId = null;

async function renderAdminPostsList(){ 
    const list = document.getElementById('admin-posts-list'); 
    const totalLikesEl = document.getElementById('dash-total-likes');
    const totalPostsEl = document.getElementById('dash-total-posts');

    list.innerHTML = '<div class="text-center py-4"><i class="ph ph-spinner animate-spin"></i> Loading data...</div>'; 
    
    if(!currentUser) return; 

    const { data: myPosts, error } = await sb
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
        const totalPosts = myPosts.length;
        const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);

        if(totalLikesEl) totalLikesEl.innerText = formatCount(totalLikes);
        if(totalPostsEl) totalPostsEl.innerText = totalPosts;

        myPosts.forEach(p => { 
            const div = document.createElement('div'); 
            div.className = 'bg-white p-3 border border-gray-100 rounded-lg flex justify-between items-center'; 
            
            // Smart Preview Text
            let typeLabel = 'Text';
            if(p.media_urls && p.media_urls.length > 0) {
                if(p.media_urls[0].type === 'video') typeLabel = '🎥 Video';
                else if(p.media_urls[0].type === 'image') typeLabel = '📷 Image';
                else typeLabel = '📎 File';
            }
            const displayContent = p.content ? p.content : `${typeLabel} Post`;

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
    loadSupportMessages();
}

async function loadSupportMessages() {
    const inboxEl = document.getElementById('admin-support-inbox');
    if(!inboxEl) return;

    inboxEl.innerHTML = '<div class="py-4 text-center"><i class="ph ph-spinner animate-spin"></i> Checking inbox...</div>';
    
    // Vuta meseji (Sasa zitaonekana kulingana na SQL Policy mpya)
    const { data: msgs, error } = await sb
        .from('messages')
        .select('*, sender:profiles(name, year, course)') 
        .order('created_at', {ascending: false});

    if(error || !msgs || msgs.length === 0) {
        inboxEl.innerHTML = '<div class="text-gray-400 text-sm text-center py-2">No new messages.</div>';
        return;
    }

    inboxEl.innerHTML = '';
    const listContainer = document.createElement('div');
    listContainer.className = 'flex flex-col gap-2 max-h-60 overflow-y-auto';

    msgs.forEach(msg => {
        const isReplied = msg.reply_content ? true : false;
        const replyBtn = isReplied 
            ? `<span class="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold"><i class="ph-fill ph-check"></i> Replied</span>` 
            : `<button onclick="replyToStudent(${msg.id}, '${msg.sender?.name || 'Student'}')" class="text-[10px] font-bold border border-gray-300 px-2 py-1 rounded bg-white hover:bg-black hover:text-white transition-colors">Reply</button>`;

        const item = document.createElement('div');
        item.className = 'text-left p-3 bg-gray-50 border border-gray-100 rounded-lg';
        item.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-gray-900">${msg.sender?.name || 'Student'} <span class="font-normal text-gray-500">(${msg.sender?.year || 'N/A'})</span></span>
                <span class="text-[10px] text-gray-400">${new Date(msg.created_at).toLocaleDateString()}</span>
            </div>
            <div class="text-xs font-bold text-gray-400 uppercase mb-1">To: ${msg.department}</div>
            <p class="text-sm text-gray-700 leading-snug mb-2">${msg.content}</p>
            ${isReplied ? `<div class="bg-gray-100 p-2 rounded text-xs text-gray-600 mb-2 border-l-2 border-black"><strong>You:</strong> ${msg.reply_content}</div>` : ''}
            <div class="flex justify-end">
                ${replyBtn}
            </div>
        `;
        listContainer.appendChild(item);
    });
    
    inboxEl.appendChild(listContainer);
}

async function replyToStudent(msgId, studentName) {
    const replyText = prompt(`Reply to ${studentName}:`);
    if(!replyText || replyText.trim() === "") return;

    const { error } = await sb
        .from('messages')
        .update({ reply_content: replyText, replied_at: new Date().toISOString() })
        .eq('id', msgId);

    if(!error){
        showToast('Reply sent successfully!');
        loadSupportMessages(); 
    } else {
        showToast('Failed to reply: ' + error.message, 'error');
    }
}

async function deletePost(id){ 
    if(!confirm('Are you sure you want to delete this post?')) return; 
    const { error } = await sb.from('posts').delete().eq('id', id);
    if(!error) {
        showToast('Post deleted successfully');
        renderAdminPostsList(); 
        renderFeed(); 
    } else {
        showToast('Error deleting post: ' + error.message, 'error');
    }
}

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
    // Allow Images, PDFs, and Videos
    input.accept = type==='image' ? 'image/*,video/*' : '.pdf,.doc,.docx'; 
    input.click(); 
}

function handleFileSelect(input){ 
    if(!input.files || input.files.length===0) return; 
    const files = Array.from(input.files); 
    
    activeFiles = files.map(file => {
        // DETECT FILE TYPE CORRECTLY
        let type = 'pdf';
        if(file.type.startsWith('image/')) type = 'image';
        else if(file.type.startsWith('video/')) type = 'video';
        
        return { 
            fileObject: file, 
            type: type, 
            name: file.name,
            previewUrl: URL.createObjectURL(file) 
        };
    }); 
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
        if(f.type === 'image'){ 
            const div=document.createElement('div'); 
            div.className='rounded overflow-hidden'; 
            div.innerHTML = `<img src="${f.previewUrl}" class="w-full aspect-portrait object-cover">`; 
            mediaList.appendChild(div);
        } else if(f.type === 'video') {
            const div=document.createElement('div'); 
            div.className='rounded overflow-hidden relative bg-black'; 
            div.innerHTML = `
                <video src="${f.previewUrl}" class="w-full aspect-portrait object-cover opacity-80"></video>
                <div class="absolute inset-0 flex items-center justify-center text-white"><i class="ph-fill ph-play-circle text-3xl"></i></div>
            `; 
            mediaList.appendChild(div);
        } else { 
            const row=document.createElement('div'); 
            row.className='flex items-center gap-2'; 
            row.innerHTML = `<i class="ph-fill ph-file-pdf text-red-500 text-xl"></i><div><div class="text-sm font-bold truncate w-48">${f.name}</div></div>`; 
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

    let uploadedMedia = [];
    if(activeFiles.length > 0) {
        for(let f of activeFiles) {
            const safeName = f.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `${Date.now()}_${safeName}`;
            
            const { data, error } = await sb.storage.from('media').upload(fileName, f.fileObject);
            
            if(!error) {
                const { data: { publicUrl } } = sb.storage.from('media').getPublicUrl(fileName);
                uploadedMedia.push({ type: f.type, url: publicUrl, name: f.name });
            } else {
                console.error("Upload error:", error);
            }
        }
    }

    const { error } = await sb.from('posts').insert([{
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
        document.getElementById('post-content').value = '';
        activeFiles = [];
        renderMediaPreviews();
        navTo('view-admin-dash'); 
    } else {
        showToast('Error posting: ' + error.message, 'error');
    }
    
    toggleBtnLoading('btn-publish-post', false);
}
