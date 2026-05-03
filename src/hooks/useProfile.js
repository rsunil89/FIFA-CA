/**
 * Custom hook for profile management
 * Handles login, register, and profile editing with localStorage persistence
 */

const STORAGE_KEYS = {
  users: 'rs_wc2026_users',
  session: 'rs_wc2026_session'
};

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getStoredUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.users);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.session);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function saveSession(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      email: user.email,
      loggedInAt: new Date().toISOString()
    }));
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

export function registerUser(name, email, password, confirmPassword) {
  const errors = {};

  if (!name || name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const users = getStoredUsers();
  if (users.find(u => u.email === email.toLowerCase())) {
    return { success: false, errors: { email: 'An account with this email already exists' } };
  }

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bio: '',
    nationality: '',
    favoriteTeam: '',
    phone: ''
  };

  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);

  return { success: true, user: newUser };
}

export function loginUser(email, password) {
  const errors = {};
  if (!email) errors.email = 'Please enter your email';
  if (!password) errors.password = 'Please enter your password';

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const users = getStoredUsers();
  const user = users.find(u => u.email === email.toLowerCase());

  if (!user) {
    return { success: false, errors: { email: 'No account found with this email' } };
  }
  if (user.password !== hashPassword(password)) {
    return { success: false, errors: { password: 'Incorrect password' } };
  }

  saveSession(user);
  return { success: true, user };
}

export function logoutUser() {
  clearSession();
}

export function updateProfile(userId, updates) {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, errors: { general: 'User not found' } };

  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  saveUsers(users);
  saveSession(users[index]);

  return { success: true, user: users[index] };
}
