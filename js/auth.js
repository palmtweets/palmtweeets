import { supabase } from './app.js';
import { utils } from './utils.js';
import { feed } from './feed.js';
import { admin } from './admin.js';
import { UNIVERSITIES } from './config.js';

export const auth = {
    user: null, profile: null,

    init: async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            auth.user = data.session.user;
            await auth.loadProfile();
        }
    },

    loadProfile: async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
        if (data) {
            auth.profile = data;
            if (data.role === 'pending') {
                alert("Pending Verification. Contact Admin.");
                await supabase.auth.signOut();
                window.location.reload();
                return;
            }
            if (data.role === 'student') {
                utils.navTo('view-home');
                feed.fetch();
            } else {
                utils.navTo('view-admin-dash');
                admin.loadDash();
            }
        }
    },

    toggleTab: (tab) => {
        document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
        document.getElementById('form-signup').classList.toggle('hidden', tab !== 'signup');
        document.getElementById('tab-login').classList.toggle('text-black', tab === 'login');
        document.getElementById('tab-signup').classList.toggle('text-black', tab === 'signup');
    },

    toggleAdminTab: (tab) => {
        document.getElementById('form-admin-login').classList.toggle('hidden', tab !== 'login');
        document.getElementById('form-admin-signup').classList.toggle('hidden', tab !== 'signup');
        document.getElementById('tab-admin-login').classList.toggle('text-black', tab === 'login');
        document.getElementById('tab-admin-signup').classList.toggle('text-black', tab === 'signup');
    },

    toggleAdminUniSelect: () => {
        const role = document.getElementById('reg-admin-role').value;
        const wrapper = document.getElementById('admin-uni-wrapper');
        if(['ministry', 'official'].includes(role)) wrapper.classList.remove('hidden');
        else wrapper.classList.add('hidden');
    },

    login: async (e, isAdmin = false) => {
        e.preventDefault();
        const prefix = isAdmin ? 'admin' : 'log';
        const email = document.getElementById(`${prefix}-email`).value;
        const password = document.getElementById(`${prefix}-pass`).value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if(error) alert(error.message); else await auth.loadProfile();
    },

    signup: async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pass').value;
        const name = document.getElementById('reg-name').value;
        const uni = document.getElementById('reg-uni').value;
        const { data, error } = await supabase.auth.signUp({ email, password });
        if(error) return alert(error.message);
        await supabase.from('profiles').insert([{ id: data.user.id, full_name: name, uni: uni, role: 'student' }]);
        alert('Created! Please Login.'); auth.toggleTab('login');
    },

    adminSignup: async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-admin-email').value;
        const password = document.getElementById('reg-admin-pass').value;
        const name = document.getElementById('reg-admin-name').value;
        const role = document.getElementById('reg-admin-role').value;
        let uni = ['ministry', 'official'].includes(role) ? document.getElementById('reg-admin-uni').value : 'All Universities';
        
        const { data, error } = await supabase.auth.signUp({ email, password });
        if(error) return alert(error.message);
        await supabase.from('profiles').insert([{ id: data.user.id, full_name: name, uni: uni, role: 'pending' }]);
        alert('Verification Pending.'); auth.toggleAdminTab('login');
    },

    logout: async () => { await supabase.auth.signOut(); window.location.reload(); }
};