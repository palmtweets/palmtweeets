import { supabase } from './app.js';
import { auth } from './auth.js';
import { utils } from './utils.js';
import { UNIVERSITIES } from './config.js';

export const admin = {
    activeFiles: [],

    loadDash: async () => {
        document.getElementById('admin-name').innerText = auth.profile.full_name;
        document.getElementById('admin-avatar').innerText = auth.profile.full_name.charAt(0);
        
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { data } = await supabase.from('posts').select('*').eq('author_id', auth.user.id).order('created_at', { ascending: false });
        
        document.getElementById('dash-reach').innerText = utils.formatCount(count || 0);
        let likes = 0; data.forEach(p => likes += p.likes_count);
        let rate = count > 0 ? (likes / count) * 100 : 0;
        document.getElementById('dash-rate').innerText = rate.toFixed(1) + '%';
        
        admin.renderHistory(data);
    },

    renderHistory: (posts) => {
        const container = document.getElementById('admin-feed-list');
        container.innerHTML = '';
        posts.forEach(post => {
            const html = `
                <div class="bg-white p-3 rounded-xl border flex justify-between items-center">
                    <div class="overflow-hidden pr-2">
                        <div class="text-sm font-bold truncate">${post.content || 'Media Post'}</div>
                        <div class="text-xs text-gray-400">${utils.formatDate(post.created_at)} • ${post.likes_count} Likes</div>
                    </div>
                    <button onclick="admin.deletePost(${post.id})" class="text-red-500 bg-red-50 p-2 rounded-full"><i class="ph-bold ph-trash"></i></button>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    initPost: () => {
        admin.activeFiles = []; 
        document.getElementById('file-preview-area').innerHTML = '';
        document.getElementById('post-content').value = '';
        
        const role = auth.profile.role;
        const targetBox = document.getElementById('targeting-box');
        const select = document.getElementById('post-targets');
        
        if (['company', 'gov'].includes(role)) {
            targetBox.classList.remove('hidden');
            select.innerHTML = UNIVERSITIES.map(u => `<option value="${u}">${u}</option>`).join('');
        } else {
            targetBox.classList.add('hidden');
        }
        utils.navTo('view-admin-post');
    },

    handleFiles: (input) => {
        const files = Array.from(input.files);
        admin.activeFiles = [...admin.activeFiles, ...files];
        const area = document.getElementById('file-preview-area');
        area.innerHTML = '';
        
        admin.activeFiles.forEach((file, idx) => {
            const isImg = file.type.startsWith('image/');
            const div = document.createElement('div');
            div.className = 'flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative border';
            div.innerHTML = isImg 
                ? `<img src="${URL.createObjectURL(file)}" class="w-full h-full object-cover">`
                : `<div class="w-full h-full flex items-center justify-center text-red-500"><i class="ph-fill ph-file-pdf text-2xl"></i></div>`;
            
            const btn = document.createElement('div');
            btn.className = 'absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer';
            btn.innerText = 'x';
            btn.onclick = () => { admin.activeFiles.splice(idx, 1); admin.handleFiles({files: []}); }; // Refresh
            div.appendChild(btn);
            area.appendChild(div);
        });
    },

    publish: async () => {
        const content = document.getElementById('post-content').value;
        const category = document.getElementById('post-category').value;
        const tag = document.getElementById('post-tag').value;
        
        if(!content && admin.activeFiles.length === 0) return alert("Write something!");

        // UPLOAD LOGIC (LOOP)
        let uploadedMedia = [];
        for (const file of admin.activeFiles) {
            const fileName = `${Date.now()}_${file.name.replace(/\s/g, '')}`;
            const { error } = await supabase.storage.from('uploads').upload(fileName, file);
            if (!error) {
                const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
                uploadedMedia.push({ 
                    type: file.type.startsWith('image/') ? 'image' : 'pdf', 
                    url: data.publicUrl,
                    name: file.name 
                });
            }
        }

        let targets = [auth.profile.uni];
        if (['company', 'gov'].includes(auth.profile.role)) {
            targets = Array.from(document.getElementById('post-targets').selectedOptions).map(o => o.value);
            if(targets.length === 0) targets = ['All Universities'];
        }

        const { error } = await supabase.from('posts').insert([{
            content, category, tag, target_unis: targets,
            author_id: auth.user.id, author_name: auth.profile.full_name, author_role: auth.profile.role,
            media_urls: uploadedMedia // Hapa tunaweka JSON Array
        }]);

        if(error) alert(error.message);
        else {
            alert('Posted!');
            utils.navTo('view-admin-dash');
            admin.loadDash();
        }
    },

    deletePost: async (id) => {
        if(confirm("Delete?")) {
            await supabase.from('posts').delete().eq('id', id);
            admin.loadDash();
        }
    }
};