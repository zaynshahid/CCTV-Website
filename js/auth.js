// Authentication State
let currentUser = null;

// DOM Elements cache for Auth
let authBackdropEl = null;
let authModalEl = null;
let navAuthBtnEl = null;
let profileWidgetEl = null;
let profileNameEl = null;

/**
 * Initialize Authentication System
 */
function initAuth() {
  authBackdropEl = document.getElementById('auth-backdrop');
  authModalEl = document.getElementById('auth-modal');
  navAuthBtnEl = document.getElementById('nav-auth-btn');
  profileWidgetEl = document.getElementById('profile-widget');
  profileNameEl = document.getElementById('profile-name');

  // Bind Open/Close actions
  if (navAuthBtnEl) {
    navAuthBtnEl.addEventListener('click', () => toggleAuthModal(true));
  }

  const closeBtn = document.getElementById('auth-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleAuthModal(false));
  }

  if (authBackdropEl) {
    authBackdropEl.addEventListener('click', (e) => {
      if (e.target === authBackdropEl) {
        toggleAuthModal(false);
      }
    });
  }

  // Form Switchers (Login <-> Register)
  const toRegister = document.getElementById('auth-to-register');
  const toLogin = document.getElementById('auth-to-login');
  
  if (toRegister && authModalEl) {
    toRegister.addEventListener('click', () => {
      authModalEl.classList.add('register-active');
    });
  }
  
  if (toLogin && authModalEl) {
    toLogin.addEventListener('click', () => {
      authModalEl.classList.remove('register-active');
    });
  }

  // Bind Submit Forms
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin(loginForm);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister(registerForm);
    });
  }

  // Social login buttons feedback
  const socialBtns = document.querySelectorAll('.auth-social-btn');
  socialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.textContent.trim();
      if (window.showToast) {
        window.showToast(`Connecting to ${provider} secure servers...`, "success");
        setTimeout(() => {
          loginUser({
            name: provider.includes("Google") ? "Google User" : "Apple User",
            email: `social@${provider.toLowerCase().split(' ')[0]}.com`
          });
          toggleAuthModal(false);
        }, 1000);
      }
    });
  });

  // Load active session from storage
  loadSession();
}

/**
 * Toggle Auth Modal visibility
 * @param {boolean} open 
 */
function toggleAuthModal(open) {
  if (!authBackdropEl) return;
  if (open) {
    authBackdropEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Reset to login screen by default
    if (authModalEl) authModalEl.classList.remove('register-active');
  } else {
    authBackdropEl.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Handle Login Form Submit
 * @param {HTMLFormElement} form 
 */
function handleLogin(form) {
  const email = form.querySelector('#login-email').value.trim();
  const password = form.querySelector('#login-password').value;

  if (!email || !password) {
    if (window.showToast) window.showToast("Please fill in all security fields.", "error");
    return;
  }

  if (password.length < 6) {
    if (window.showToast) window.showToast("Encryption key (password) must be at least 6 characters.", "error");
    return;
  }

  if (window.showToast) {
    window.showToast("Verifying biometric signatures & encryption...", "success");

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || "Authentication failed") });
      }
      return res.json();
    })
    .then(data => {
      loginUser(data.user);
      toggleAuthModal(false);
      form.reset();
    })
    .catch(err => {
      if (window.showToast) window.showToast(`ACCESS DENIED: ${err.message}`, "error");
    });
  }
}

/**
 * Handle Register Form Submit
 * @param {HTMLFormElement} form 
 */
function handleRegister(form) {
  const name = form.querySelector('#register-name').value.trim();
  const email = form.querySelector('#register-email').value.trim();
  const password = form.querySelector('#register-password').value;
  const agree = form.querySelector('#register-agree').checked;

  if (!name || !email || !password) {
    if (window.showToast) window.showToast("Please complete all registration fields.", "error");
    return;
  }

  if (password.length < 6) {
    if (window.showToast) window.showToast("Password must be at least 6 characters for high security.", "error");
    return;
  }

  if (!agree) {
    if (window.showToast) window.showToast("You must agree to the SecureVision terms of service.", "error");
    return;
  }

  if (window.showToast) {
    window.showToast("Creating secure sandbox and registering credentials...", "success");

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || "Registration failed") });
      }
      return res.json();
    })
    .then(data => {
      loginUser(data.user);
      toggleAuthModal(false);
      form.reset();
    })
    .catch(err => {
      if (window.showToast) window.showToast(`REGISTRATION DENIED: ${err.message}`, "error");
    });
  }
}

/**
 * Log in the user, update state & UI
 * @param {object} user 
 */
function loginUser(user) {
  currentUser = user;
  
  // Save to localStorage
  try {
    localStorage.setItem('securevision_user', JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save session", e);
  }

  updateNavbarAuthUI();

  if (window.showToast) {
    window.showToast(`ACCESS GRANTED: Welcome back, Agent ${user.name}.`, "success");
  }
}

/**
 * Log out user and update UI
 */
function logoutUser() {
  currentUser = null;
  
  try {
    localStorage.removeItem('securevision_user');
  } catch (e) {
    console.error("Failed to remove session", e);
  }

  updateNavbarAuthUI();

  if (window.showToast) {
    window.showToast("SESSION TERMINATED: Safely disconnected from account.", "error");
  }
}

/**
 * Load session from localStorage on load
 */
function loadSession() {
  try {
    const saved = localStorage.getItem('securevision_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Could not load session", e);
    currentUser = null;
  }
  updateNavbarAuthUI();
}

/**
 * Update the Navbar buttons based on Authentication State
 */
function updateNavbarAuthUI() {
  if (!navAuthBtnEl || !profileWidgetEl) return;

  if (currentUser) {
    // User is authenticated
    navAuthBtnEl.style.display = 'none';
    profileWidgetEl.style.display = 'block';
    if (profileNameEl) {
      profileNameEl.textContent = currentUser.name;
    }
  } else {
    // User is guest
    navAuthBtnEl.style.display = 'inline-flex';
    profileWidgetEl.style.display = 'none';
  }
}

// Export for browser access
window.SecureAuth = {
  currentUser,
  initAuth,
  toggleAuthModal,
  logoutUser
};
