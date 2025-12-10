import { api } from '../services/api.js';

export function initAuth() {
    // Helper to attach listener safely
    const attachLoginListener = () => {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('login-user');
        const passwordInput = document.getElementById('login-pass');
        const msg = document.getElementById('login-msg');

        if (loginBtn) {
            // Remove existing listener to prevent duplicates (if initAuth is called multiple times)
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

            newLoginBtn.onclick = async () => {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                // Basic Frontend Validation
                if (!username || !password) {
                    if(msg) { 
                        msg.textContent = "Please enter credentials"; 
                        msg.style.display = 'block'; 
                        msg.classList.remove('hidden'); // Ensure Tailwind 'hidden' class is removed
                    }
                    return;
                }

                // Show loading state
                newLoginBtn.disabled = true;
                newLoginBtn.textContent = 'Logging in...';
                if(msg) msg.style.display = 'none';

                try {
                    // Call API
                    const response = await api.auth.login({ username, password });
                    
                    if (response && response.user) {
                        // Success: Save user and reload to trigger app.js router logic
                        localStorage.setItem('pos_user', JSON.stringify(response.user));
                        window.location.reload();
                    } else {
                        // Fail (API returned success: false or similar)
                        throw new Error(response.message || "Invalid credentials");
                    }
                } catch (e) {
                    console.error("Login failed:", e);
                    if(msg) { 
                        msg.textContent = e.message || "Invalid credentials or server error"; 
                        msg.style.display = 'block'; 
                        msg.classList.remove('hidden');
                    }
                } finally {
                    // Reset button state
                    newLoginBtn.disabled = false;
                    newLoginBtn.textContent = 'Login';
                }
            };
            
            // Allow pressing "Enter" to login
            const handleEnter = (e) => {
                if (e.key === 'Enter') newLoginBtn.click();
            };
            usernameInput?.addEventListener('keypress', handleEnter);
            passwordInput?.addEventListener('keypress', handleEnter);
            
            console.log("Auth listener attached successfully");
        } else {
            console.warn("Login button not found in DOM");
        }
    };

    // Attempt to attach immediately
    attachLoginListener();

    // Also listen for view changes or DOM updates if necessary
    // (This is a fallback in case the login view is injected dynamically later)
    const observer = new MutationObserver(() => {
        if (document.getElementById('login-btn')) {
            attachLoginListener();
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}