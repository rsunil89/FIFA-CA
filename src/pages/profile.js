/* ============================================================
   FILE: profile.js
   AUTHOR: Ryan Stanley (rs)
   DESCRIPTION: Profile management - Login, Register, Edit Profile
   Uses localStorage for data persistence
   ============================================================ */

// ============================================================
// PROFILE STATE
// ============================================================
const rs_profileState = {
    currentUser: null,       // Currently logged in user object
    users: [],              // All registered users
    isLoggedIn: false       // Login status
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initializes the profile system
 * Loads users from localStorage and checks for existing session
 */
function rs_initProfile() {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('rs_wc2026_users');
    if (storedUsers) {
        try {
            rs_profileState.users = JSON.parse(storedUsers);
        } catch (e) {
            rs_profileState.users = [];
        }
    }
    
    // Check for existing session
    const storedSession = localStorage.getItem('rs_wc2026_session');
    if (storedSession) {
        try {
            const sessionData = JSON.parse(storedSession);
            const user = rs_profileState.users.find(u => u.email === sessionData.email);
            if (user) {
                rs_profileState.currentUser = user;
                rs_profileState.isLoggedIn = true;
            }
        } catch (e) {
            localStorage.removeItem('rs_wc2026_session');
        }
    }
    
    // Update UI based on login state
    rs_updateProfileUI();
}

/**
 * Saves users array to localStorage
 */
function rs_saveUsers() {
    localStorage.setItem('rs_wc2026_users', JSON.stringify(rs_profileState.users));
}

/**
 * Saves current session to localStorage
 */
function rs_saveSession() {
    if (rs_profileState.currentUser) {
        localStorage.setItem('rs_wc2026_session', JSON.stringify({
            email: rs_profileState.currentUser.email,
            loggedInAt: new Date().toISOString()
        }));
    }
}

/**
 * Clears the current session
 */
function rs_clearSession() {
    localStorage.removeItem('rs_wc2026_session');
}

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

/**
 * Registers a new user
 */
function rs_registerUser(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('rs_regName').value.trim();
    const email = document.getElementById('rs_regEmail').value.trim().toLowerCase();
    const password = document.getElementById('rs_regPassword').value;
    const confirmPassword = document.getElementById('rs_regConfirmPassword').value;
    
    // Clear previous errors
    rs_clearAllProfileErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (!name || name.length < 2) {
        rs_showProfileFieldError('rs_regName', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!email || !rs_isValidEmail(email)) {
        rs_showProfileFieldError('rs_regEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password || password.length < 6) {
        rs_showProfileFieldError('rs_regPassword', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        rs_showProfileFieldError('rs_regConfirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Check if email already exists
    if (rs_profileState.users.find(u => u.email === email)) {
        rs_showProfileFieldError('rs_regEmail', 'An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        password: rs_hashPassword(password), // Simple hash for demo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Profile fields
        bio: '',
        nationality: '',
        favoriteTeam: '',
        phone: '',
        avatar: ''
    };
    
    // Add user and save
    rs_profileState.users.push(newUser);
    rs_saveUsers();
    
    // Auto-login after registration
    rs_profileState.currentUser = newUser;
    rs_profileState.isLoggedIn = true;
    rs_saveSession();
    
    // Update UI
    rs_updateProfileUI();
    
    // Show success message
    rs_showProfileSuccess('Registration successful! Welcome, ' + name + '!');
    
    // Reset form
    document.getElementById('rs_regForm').reset();
    
    // Switch to profile view after short delay
    setTimeout(() => {
        rs_switchProfileTab('view');
    }, 1000);
}

/**
 * Logs in an existing user
 */
function rs_loginUser(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('rs_loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('rs_loginPassword').value;
    
    // Clear previous errors
    rs_clearAllProfileErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (!email) {
        rs_showProfileFieldError('rs_loginEmail', 'Please enter your email');
        isValid = false;
    }
    
    if (!password) {
        rs_showProfileFieldError('rs_loginPassword', 'Please enter your password');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Find user
    const user = rs_profileState.users.find(u => u.email === email);
    
    if (!user) {
        rs_showProfileFieldError('rs_loginEmail', 'No account found with this email');
        return;
    }
    
    if (user.password !== rs_hashPassword(password)) {
        rs_showProfileFieldError('rs_loginPassword', 'Incorrect password');
        return;
    }
    
    // Login successful
    rs_profileState.currentUser = user;
    rs_profileState.isLoggedIn = true;
    rs_saveSession();
    
    // Update UI
    rs_updateProfileUI();
    
    // Show success message
    rs_showProfileSuccess('Welcome back, ' + user.name + '!');
    
    // Reset form
    document.getElementById('rs_loginForm').reset();
    
    // Switch to profile view
    setTimeout(() => {
        rs_switchProfileTab('view');
    }, 500);
}

/**
 * Logs out the current user
 */
function rs_logoutUser() {
    rs_profileState.currentUser = null;
    rs_profileState.isLoggedIn = false;
    rs_clearSession();
    rs_updateProfileUI();
    rs_switchProfileTab('login');
    rs_showProfileSuccess('You have been logged out successfully.');
}

// ============================================================
// PROFILE EDITING
// ============================================================

/**
 * Loads current user data into the edit form
 */
function rs_loadEditProfile() {
    const user = rs_profileState.currentUser;
    if (!user) return;
    
    document.getElementById('rs_editName').value = user.name || '';
    document.getElementById('rs_editEmail').value = user.email || '';
    document.getElementById('rs_editBio').value = user.bio || '';
    document.getElementById('rs_editNationality').value = user.nationality || '';
    document.getElementById('rs_editFavoriteTeam').value = user.favoriteTeam || '';
    document.getElementById('rs_editPhone').value = user.phone || '';
}

/**
 * Saves profile changes
 */
function rs_saveProfile(event) {
    event.preventDefault();
    
    const user = rs_profileState.currentUser;
    if (!user) return;
    
    // Get form values
    const name = document.getElementById('rs_editName').value.trim();
    const bio = document.getElementById('rs_editBio').value.trim();
    const nationality = document.getElementById('rs_editNationality').value.trim();
    const favoriteTeam = document.getElementById('rs_editFavoriteTeam').value.trim();
    const phone = document.getElementById('rs_editPhone').value.trim();
    
    // Clear previous errors
    rs_clearAllProfileErrors();
    
    // Validate
    let isValid = true;
    
    if (!name || name.length < 2) {
        rs_showProfileFieldError('rs_editName', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Update user object
    user.name = name;
    user.bio = bio;
    user.nationality = nationality;
    user.favoriteTeam = favoriteTeam;
    user.phone = phone;
    user.updatedAt = new Date().toISOString();
    
    // Update in users array
    const index = rs_profileState.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        rs_profileState.users[index] = user;
    }
    
    // Save
    rs_saveUsers();
    rs_saveSession();
    
    // Update UI
    rs_updateProfileUI();
    
    // Show success
    rs_showProfileSuccess('Profile updated successfully!');
    
    // Switch to view mode
    setTimeout(() => {
        rs_switchProfileTab('view');
    }, 500);
}

// ============================================================
// UI UPDATES
// ============================================================

/**
 * Updates all profile-related UI elements
 */
function rs_updateProfileUI() {
    // Update navigation links
    const navProfileLink = document.getElementById('rs_navProfileLink');
    const mobileNavProfileLink = document.getElementById('rs_mobileNavProfileLink');
    const footerProfileLink = document.getElementById('rs_footerProfileLink');
    
    if (rs_profileState.isLoggedIn && rs_profileState.currentUser) {
        const userName = rs_profileState.currentUser.name;
        const displayName = userName.split(' ')[0]; // First name only
        
        if (navProfileLink) {
            navProfileLink.innerHTML = `👤 ${displayName}`;
            navProfileLink.href = '#rs_profileSection';
        }
        if (mobileNavProfileLink) {
            mobileNavProfileLink.innerHTML = `👤 ${displayName}`;
            mobileNavProfileLink.href = '#rs_profileSection';
        }
        if (footerProfileLink) {
            footerProfileLink.innerHTML = `👤 My Profile (${displayName})`;
            footerProfileLink.href = '#rs_profileSection';
        }
    } else {
        if (navProfileLink) {
            navProfileLink.innerHTML = '👤 Profile';
            navProfileLink.href = '#rs_profileSection';
        }
        if (mobileNavProfileLink) {
            mobileNavProfileLink.innerHTML = '👤 Profile';
            mobileNavProfileLink.href = '#rs_profileSection';
        }
        if (footerProfileLink) {
            footerProfileLink.innerHTML = '👤 My Profile';
            footerProfileLink.href = '#rs_profileSection';
        }
    }
    
    // Update profile section content
    rs_renderProfileSection();
}

/**
 * Renders the profile section based on login state
 */
function rs_renderProfileSection() {
    const container = document.getElementById('rs_profileContent');
    if (!container) return;
    
    if (rs_profileState.isLoggedIn && rs_profileState.currentUser) {
        rs_renderProfileView(container);
    } else {
        rs_renderLoginRegister(container);
    }
}

/**
 * Renders the login/register tabs
 */
function rs_renderLoginRegister(container) {
    container.innerHTML = `
        <div class="rs_profileTabs">
            <button class="rs_profileTab rs_profileTabActive" onclick="rs_switchProfileTab('login')">Sign In</button>
            <button class="rs_profileTab" onclick="rs_switchProfileTab('register')">Create Account</button>
        </div>
        
        <!-- Login Form -->
        <div id="rs_loginFormContainer" class="rs_profileFormContainer">
            <form id="rs_loginForm" onsubmit="rs_loginUser(event)">
                <h3 class="rs_heading3" style="margin-bottom: 20px; text-align: center;">Welcome Back!</h3>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_loginEmail">Email Address</label>
                    <input type="email" id="rs_loginEmail" class="rs_formInput" 
                           placeholder="Enter your email" autocomplete="email">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_loginPassword">Password</label>
                    <input type="password" id="rs_loginPassword" class="rs_formInput" 
                           placeholder="Enter your password" autocomplete="current-password">
                </div>
                
                <button type="submit" class="rs_btn rs_btnPrimary" style="width: 100%;">
                    Sign In
                </button>
                
                <p class="rs_textSmall" style="text-align: center; margin-top: 15px;">
                    Don't have an account? 
                    <a href="#" onclick="rs_switchProfileTab('register'); return false;" 
                       style="color: var(--rs_secondaryColor); font-weight: 600;">Create one here</a>
                </p>
            </form>
        </div>
        
        <!-- Register Form -->
        <div id="rs_regFormContainer" class="rs_profileFormContainer" style="display: none;">
            <form id="rs_regForm" onsubmit="rs_registerUser(event)">
                <h3 class="rs_heading3" style="margin-bottom: 20px; text-align: center;">Create Your Account</h3>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_regName">Full Name</label>
                    <input type="text" id="rs_regName" class="rs_formInput" 
                           placeholder="Enter your full name" autocomplete="name">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_regEmail">Email Address</label>
                    <input type="email" id="rs_regEmail" class="rs_formInput" 
                           placeholder="Enter your email" autocomplete="email">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_regPassword">Password</label>
                    <input type="password" id="rs_regPassword" class="rs_formInput" 
                           placeholder="At least 6 characters" autocomplete="new-password">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_regConfirmPassword">Confirm Password</label>
                    <input type="password" id="rs_regConfirmPassword" class="rs_formInput" 
                           placeholder="Re-enter your password" autocomplete="new-password">
                </div>
                
                <button type="submit" class="rs_btn rs_btnPrimary" style="width: 100%;">
                    Create Account
                </button>
                
                <p class="rs_textSmall" style="text-align: center; margin-top: 15px;">
                    Already have an account? 
                    <a href="#" onclick="rs_switchProfileTab('login'); return false;" 
                       style="color: var(--rs_secondaryColor); font-weight: 600;">Sign in here</a>
                </p>
            </form>
        </div>
        
        <!-- Success/Error Messages Container -->
        <div id="rs_profileMessages" class="rs_profileMessages"></div>
    `;
}

/**
 * Renders the profile view/edit for logged-in users
 */
function rs_renderProfileView(container) {
    const user = rs_profileState.currentUser;
    if (!user) return;
    
    // Get first letter for avatar
    const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
    
    container.innerHTML = `
        <div class="rs_profileTabs">
            <button class="rs_profileTab rs_profileTabActive" onclick="rs_switchProfileTab('view')">My Profile</button>
            <button class="rs_profileTab" onclick="rs_switchProfileTab('edit')">Edit Profile</button>
            <button class="rs_profileTab rs_profileTabDanger" onclick="rs_logoutUser()">Sign Out</button>
        </div>
        
        <!-- Profile View -->
        <div id="rs_profileViewContainer" class="rs_profileFormContainer">
            <div class="rs_profileCard">
                <div class="rs_profileAvatar">
                    <span class="rs_profileAvatarLetter">${avatarLetter}</span>
                </div>
                
                <h3 class="rs_heading3" style="text-align: center; margin-bottom: 5px;">${rs_escapeHtml(user.name)}</h3>
                <p class="rs_textSmall" style="text-align: center; margin-bottom: 20px;">${rs_escapeHtml(user.email)}</p>
                
                <div class="rs_profileDetails">
                    ${user.bio ? `
                    <div class="rs_profileDetail">
                        <span class="rs_profileDetailLabel">📝 Bio</span>
                        <span class="rs_profileDetailValue">${rs_escapeHtml(user.bio)}</span>
                    </div>
                    ` : ''}
                    
                    ${user.nationality ? `
                    <div class="rs_profileDetail">
                        <span class="rs_profileDetailLabel">🌍 Nationality</span>
                        <span class="rs_profileDetailValue">${rs_escapeHtml(user.nationality)}</span>
                    </div>
                    ` : ''}
                    
                    ${user.favoriteTeam ? `
                    <div class="rs_profileDetail">
                        <span class="rs_profileDetailLabel">⚽ Favorite Team</span>
                        <span class="rs_profileDetailValue">${rs_escapeHtml(user.favoriteTeam)}</span>
                    </div>
                    ` : ''}
                    
                    ${user.phone ? `
                    <div class="rs_profileDetail">
                        <span class="rs_profileDetailLabel">📞 Phone</span>
                        <span class="rs_profileDetailValue">${rs_escapeHtml(user.phone)}</span>
                    </div>
                    ` : ''}
                    
                    <div class="rs_profileDetail">
                        <span class="rs_profileDetailLabel">📅 Member Since</span>
                        <span class="rs_profileDetailValue">${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                
                ${!user.bio && !user.nationality && !user.favoriteTeam && !user.phone ? `
                <div style="text-align: center; padding: 20px; background: var(--rs_grayColor); border-radius: var(--rs_radius); margin-top: 15px;">
                    <p class="rs_textSmall">Your profile is looking a bit empty!</p>
                    <button class="rs_btn rs_btnPrimary rs_btnSmall" onclick="rs_switchProfileTab('edit')" style="margin-top: 10px;">
                        Complete Your Profile
                    </button>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="rs_btn rs_btnPrimary" onclick="rs_switchProfileTab('edit')">
                        ✏️ Edit Profile
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Edit Profile Form -->
        <div id="rs_editFormContainer" class="rs_profileFormContainer" style="display: none;">
            <form id="rs_editForm" onsubmit="rs_saveProfile(event)">
                <h3 class="rs_heading3" style="margin-bottom: 20px; text-align: center;">Edit Your Profile</h3>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editName">Full Name</label>
                    <input type="text" id="rs_editName" class="rs_formInput" 
                           placeholder="Enter your full name" value="${rs_escapeHtml(user.name)}">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editEmail">Email</label>
                    <input type="email" id="rs_editEmail" class="rs_formInput" 
                           value="${rs_escapeHtml(user.email)}" disabled
                           style="background: var(--rs_grayColor); cursor: not-allowed;">
                    <p class="rs_textSmall" style="margin-top: 5px;">Email cannot be changed</p>
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editBio">Bio</label>
                    <textarea id="rs_editBio" class="rs_formInput" rows="3" 
                              placeholder="Tell us about yourself..." style="resize: vertical;">${rs_escapeHtml(user.bio || '')}</textarea>
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editNationality">Nationality</label>
                    <input type="text" id="rs_editNationality" class="rs_formInput" 
                           placeholder="e.g. Irish, American, Canadian..." value="${rs_escapeHtml(user.nationality || '')}">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editFavoriteTeam">Favorite Team</label>
                    <input type="text" id="rs_editFavoriteTeam" class="rs_formInput" 
                           placeholder="e.g. Brazil, Argentina, Germany..." value="${rs_escapeHtml(user.favoriteTeam || '')}">
                </div>
                
                <div class="rs_formGroup">
                    <label class="rs_formLabel" for="rs_editPhone">Phone Number</label>
                    <input type="tel" id="rs_editPhone" class="rs_formInput" 
                           placeholder="e.g. +1 555-123-4567" value="${rs_escapeHtml(user.phone || '')}">
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="rs_btn rs_btnPrimary" style="flex: 1;">
                        💾 Save Changes
                    </button>
                    <button type="button" class="rs_btn rs_btnSecondary" onclick="rs_switchProfileTab('view')" style="flex: 1;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        
        <!-- Success/Error Messages Container -->
        <div id="rs_profileMessages" class="rs_profileMessages"></div>
    `;
}

/**
 * Switches between profile tabs (login, register, view, edit)
 */
function rs_switchProfileTab(tab) {
    // Clear messages
    const messagesContainer = document.getElementById('rs_profileMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    if (!rs_profileState.isLoggedIn) {
        // Not logged in - toggle between login and register
        const loginContainer = document.getElementById('rs_loginFormContainer');
        const regContainer = document.getElementById('rs_regFormContainer');
        const tabs = document.querySelectorAll('.rs_profileTab');
        
        if (loginContainer && regContainer) {
            if (tab === 'register') {
                loginContainer.style.display = 'none';
                regContainer.style.display = 'block';
                tabs[0].classList.remove('rs_profileTabActive');
                tabs[1].classList.add('rs_profileTabActive');
            } else {
                loginContainer.style.display = 'block';
                regContainer.style.display = 'none';
                tabs[0].classList.add('rs_profileTabActive');
                tabs[1].classList.remove('rs_profileTabActive');
            }
        }
    } else {
        // Logged in - toggle between view and edit
        const viewContainer = document.getElementById('rs_profileViewContainer');
        const editContainer = document.getElementById('rs_editFormContainer');
        const tabs = document.querySelectorAll('.rs_profileTab');
        
        if (viewContainer && editContainer) {
            if (tab === 'edit') {
                viewContainer.style.display = 'none';
                editContainer.style.display = 'block';
                rs_loadEditProfile();
                tabs[0].classList.remove('rs_profileTabActive');
                tabs[1].classList.add('rs_profileTabActive');
            } else {
                viewContainer.style.display = 'block';
                editContainer.style.display = 'none';
                tabs[0].classList.add('rs_profileTabActive');
                tabs[1].classList.remove('rs_profileTabActive');
            }
        }
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Simple password hashing for demo purposes
 * Note: In production, use a proper hashing library on the server
 */
function rs_hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

/**
 * Validates email format
 */
function rs_isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Escapes HTML to prevent XSS
 */
function rs_escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Shows a field-specific error in the profile forms
 */
function rs_showProfileFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('rs_inputError');
        
        let errorEl = field.parentElement.querySelector('.rs_error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'rs_error';
            field.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
}

/**
 * Clears all profile form errors
 */
function rs_clearAllProfileErrors() {
    document.querySelectorAll('.rs_inputError').forEach(el => {
        el.classList.remove('rs_inputError');
    });
    document.querySelectorAll('.rs_error').forEach(el => {
        el.remove();
    });
}

/**
 * Shows a success message in the profile section
 */
function rs_showProfileSuccess(message) {
    const container = document.getElementById('rs_profileMessages');
    if (container) {
        container.innerHTML = `
            <div class="rs_successBanner">
                ✅ ${message}
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// ============================================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.rs_initProfile = rs_initProfile;
window.rs_registerUser = rs_registerUser;
window.rs_loginUser = rs_loginUser;
window.rs_logoutUser = rs_logoutUser;
window.rs_saveProfile = rs_saveProfile;
window.rs_switchProfileTab = rs_switchProfileTab;
window.rs_loadEditProfile = rs_loadEditProfile;
