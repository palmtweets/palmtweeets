/* AUTHENTICATION LOGIC */

// Check Session on Load
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Fetch User Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
            currentUser = profile;
            return true;
        }
    }
    return false;
}

// LOGOUT
async function handleLogout(){ 
    await supabase.auth.signOut();
    currentUser = null; 
    navTo('view-intro'); 
    showToast('Logged out successfully', 'success');
}

/* STUDENT ACTIONS */
function openStudentSignup(){
    // Clear fields
    document.getElementById('input-name').value = ''; 
    document.getElementById('input-uni').value = ''; 
    document.getElementById('input-email').value = ''; 
    document.getElementById('input-password').value = '';
    navTo('view-signup');
}

async function finishStudentSignup(e){ 
    e.preventDefault(); 
    const email=document.getElementById('input-email').value.trim(); 
    const password=document.getElementById('input-password').value; 
    const name=document.getElementById('input-name').value.trim(); 
    const uni=document.getElementById('input-uni').value.trim(); 
    const year=document.getElementById('input-year').value; 
    const course=document.getElementById('input-course').value;
    
    if(!uni) return showToast('Please select university', 'error'); 

    toggleBtnLoading('student-submit-btn', true);

    // 1. Sign Up Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    
    if (authError) {
        toggleBtnLoading('student-submit-btn', false);
        return showToast(authError.message, 'error');
    }

    // 2. Create Profile
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id,
            email,
            role: 'student',
            name,
            uni,
            year,
            course,
            verified: true // Students auto-verified
        }]);

        if (profileError) {
             toggleBtnLoading('student-submit-btn', false);
             return showToast('Error creating profile: ' + profileError.message, 'error');
        }

        // Login immediately
        currentUser = { id: authData.user.id, name, uni, role: 'student', year, course };
        renderFeed();
        navTo('view-home');
        showToast('Welcome to PalmTweets!');
    }
    toggleBtnLoading('student-submit-btn', false);
}

async function handleStudentLogin(e){ 
    e&&e.preventDefault(); 
    const email=document.getElementById('login-email').value.trim(); 
    const password=document.getElementById('login-password').value; 
    
    toggleBtnLoading('btn-student-login', true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        toggleBtnLoading('btn-student-login', false);
        return showToast('Invalid credentials', 'error');
    }

    // Get Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    
    if(profile.role !== 'student'){
        toggleBtnLoading('btn-student-login', false);
        await supabase.auth.signOut();
        return showToast('This is not a student account', 'error');
    }

    currentUser = profile;
    renderFeed();
    navTo('view-home');
    toggleBtnLoading('btn-student-login', false);
    showToast('Welcome back, ' + currentUser.name.split(' ')[0]);
}

function openProfileMenu(){ 
    if(!currentUser) return showToast('Please login first', 'error'); 
    if(currentUser.role==='student') openStudentSignup(); // Re-use for edit
    else if(currentUser.role==='admin') navTo('view-admin-dash'); 
}

/* ADMIN ACTIONS */
async function handleAdminSignup(e){ 
    e&&e.preventDefault(); 
    const name=document.getElementById('admin-name').value.trim(); 
    const type=document.getElementById('admin-type').value; 
    const uni=document.getElementById('admin-uni-input').value; 
    const email=document.getElementById('admin-email').value.trim(); 
    const password=document.getElementById('admin-password').value; 
    
    if(!uni) return showToast('Select University', 'error'); 
    
    toggleBtnLoading('btn-admin-signup', true);

    // 1. Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
        toggleBtnLoading('btn-admin-signup', false);
        return showToast(authError.message, 'error');
    }

    // 2. Profile Creation (PENDING STATUS)
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id,
            email,
            role: 'admin',
            name,
            uni,
            admin_type: type,
            verified: false // PENDING VERIFICATION
        }]);

        if (profileError) {
            toggleBtnLoading('btn-admin-signup', false);
            return showToast(profileError.message, 'error');
        }

        toggleBtnLoading('btn-admin-signup', false);
        showToast('Account created! Pending verification by Super Admin.');
        navTo('view-admin-intro'); // Do not log in yet
    }
}

async function handleAdminLogin(e){ 
    e&&e.preventDefault(); 
    const email=document.getElementById('admin-login-email').value.trim(); 
    const password=document.getElementById('admin-login-password').value; 
    
    toggleBtnLoading('btn-admin-login', true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        toggleBtnLoading('btn-admin-login', false);
        return showToast('Invalid credentials', 'error');
    }

    // Get Profile & Check Verification
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

    if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        toggleBtnLoading('btn-admin-login', false);
        return showToast('Not an official account', 'error');
    }

    // PENDING CHECK
    if (profile.verified === false) {
        await supabase.auth.signOut();
        toggleBtnLoading('btn-admin-login', false);
        return showToast('Account is pending verification.', 'error');
    }

    currentUser = profile;
    updateAdminHeader();
    renderAdminPostsList();
    navTo('view-admin-dash');
    toggleBtnLoading('btn-admin-login', false);
    showToast('Logged in as Official');
}

function updateAdminHeader(){ 
    if(!currentUser) return; 
    const img=document.getElementById('dash-avatar-img'); 
    const letter=document.getElementById('dash-avatar-letter'); 
    
    if(currentUser.avatar_url){ 
        img.src=currentUser.avatar_url; 
        img.style.display='block'; 
        letter.style.display='none'; 
    } else { 
        img.style.display='none'; 
        letter.style.display='block'; 
        letter.textContent=(currentUser.name||'A').charAt(0).toUpperCase(); 
    } 
    document.getElementById('dash-name').textContent=currentUser.name; 
    const verEl=document.getElementById('dash-verified'); 
    // Logic for badge color
    let color = 'black';
    if(currentUser.admin_type === 'official') color = 'green';
    
    const badgeClass = 'badge-'+color; 
    verEl.innerHTML = `<i class="ph-fill ph-seal-check ${badgeClass}"></i> Official Account`; 
}

function openAdminEdit(){ 
    document.getElementById('edit-org-name').value=currentUser.name||''; 
    document.getElementById('modal-admin-edit').classList.add('show'); 
}

function closeAdminEdit(){ document.getElementById('modal-admin-edit').classList.remove('show'); }

async function saveAdminProfile(){ 
    const v=document.getElementById('edit-org-name').value.trim(); 
    if(v) {
        const { error } = await supabase.from('profiles').update({ name: v }).eq('id', currentUser.id);
        if(!error) {
            currentUser.name=v; 
            updateAdminHeader(); 
            closeAdminEdit(); 
            showToast('Profile updated');
        } else {
            showToast('Update failed', 'error');
        }
    }
}
