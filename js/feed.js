import { supabase } from './app.js';
import { auth } from './auth.js';
import { utils } from './utils.js';

export const feed = {
    posts: [],
    replyToId: null,

    fetch: async () => {
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        feed.posts = data || [];
        feed.render();
    },

    render: (filter = 'all') => {
        const container = document.getElementById('feed-list');
        container.innerHTML = '';
        const myUni = auth.profile.uni;

        feed.posts.forEach(post => {
            const targets = post.target_unis || [];
            if (!targets.includes('All Universities') && !targets.includes(myUni)) return;
            if (filter !== 'all' && post.category !== filter) return;

            // CAROUSEL LOGIC
            let mediaHTML = '';
            if (post.media_urls && post.media_urls.length > 0) {
                mediaHTML = `<div class="mt-3 flex gap-2 overflow-x-auto no-scrollbar snap-x">`;
                post.media_urls.forEach(m => {
                    if(m.type === 'image') {
                        mediaHTML += `<img src="${m.url}" class="snap-center w-full aspect-[4/5] object-cover rounded-xl flex-shrink-0 bg-gray-100">`;
                    } else {
                        mediaHTML += `<div class="snap-center w-full p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 flex-shrink-0"><i class="ph-fill ph-file-pdf text-3xl text-red-500"></i><span class="font-bold text-sm truncate">${m.name}</span></div>`;
                    }
                });
                mediaHTML += `</div>`;
            }

            const badges = {'ministry':'text-black','official':'text-green-600','company':'text-blue-600','gov':'text-purple-600','system':'text-yellow-500'};
            const badgeIcon = badges[post.author_role] ? `<i class="ph-fill ph-seal-check ${badges[post.author_role]} ml-1"></i>` : '';
            const tagStyle = post.tag === 'URGENT' ? 'bg-red-600 text-white' : 'bg-blue-50 text-blue-600';

            const html = `
                <div class="bg-white border-b border-gray-100 p-4">
                    <div class="flex gap-3 mb-2">
                        <div class="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold">${post.author_name.charAt(0)}</div>
                        <div class="flex-1">
                            <div class="flex items-center"><span class="font-bold text-sm">${post.author_name}</span>${badgeIcon}<span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded ${tagStyle}">${post.tag}</span></div>
                            <div class="text-xs text-gray-400">${utils.formatDate(post.created_at)}</div>
                        </div>
                    </div>
                    <p class="text-sm text-gray-800 whitespace-pre-wrap">${post.content}</p>
                    ${mediaHTML}
                    <div class="flex items-center gap-6 pt-3">
                        <button onclick="feed.like('${post.id}')" class="flex gap-1 text-gray-400 text-xs font-bold"><i class="ph ph-heart text-lg"></i> ${post.likes_count}</button>
                        <button onclick="feed.openComments('${post.id}')" class="flex gap-1 text-gray-400 text-xs font-bold"><i class="ph ph-chat-circle text-lg"></i> Comment</button>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    like: async (id) => {
        await supabase.rpc('increment_likes', { post_row_id: id, amount: 1 });
        const p = feed.posts.find(x => x.id == id); if(p) p.likes_count++; feed.render();
    },

    openComments: async (id) => {
        feed.currentPostId = id;
        document.getElementById('comment-modal').classList.remove('hidden');
        document.getElementById('comment-modal').classList.add('flex');
        feed.loadComments();
    },

    loadComments: async () => {
        const { data } = await supabase.from('comments').select('*').eq('post_id', feed.currentPostId).order('created_at', { ascending: true });
        const container = document.getElementById('comments-container');
        container.innerHTML = '';
        data.forEach(c => {
            const isReply = c.parent_id ? 'ml-8 border-l-2 border-gray-100 pl-3' : '';
            const html = `
                <div class="flex gap-3 text-sm mb-3 ${isReply}">
                    <div class="font-bold text-xs bg-gray-100 rounded p-1 h-fit">${c.user_name.charAt(0)}</div>
                    <div class="flex-1">
                        <div class="font-bold text-xs">${c.user_name} <span class="text-gray-400 font-normal">• ${utils.formatDate(c.created_at)}</span></div>
                        <div class="text-gray-700">${c.content}</div>
                        <button onclick="feed.replyTo('${c.id}', '${c.user_name}')" class="text-[10px] font-bold text-gray-400 mt-1">Reply</button>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    replyTo: (commentId, name) => {
        feed.replyToId = commentId;
        const ind = document.getElementById('reply-indicator');
        ind.classList.remove('hidden');
        ind.querySelector('span').innerText = `Replying to ${name}`;
    },

    cancelReply: () => {
        feed.replyToId = null;
        document.getElementById('reply-indicator').classList.add('hidden');
    },

    postComment: async () => {
        const text = document.getElementById('comment-input').value;
        if(!text) return;
        await supabase.from('comments').insert([{
            post_id: feed.currentPostId, user_id: auth.user.id, user_name: auth.profile.full_name,
            content: text, parent_id: feed.replyToId
        }]);
        document.getElementById('comment-input').value = '';
        feed.cancelReply();
        feed.loadComments();
    },

    closeComments: () => { document.getElementById('comment-modal').classList.add('hidden'); document.getElementById('comment-modal').classList.remove('flex'); }
};