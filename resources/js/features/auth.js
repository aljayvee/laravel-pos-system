import { api } from '../services/api.js';

export function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    
    if (loginBtn) {
        loginBtn.onclick = async () => {
            const username = document.getElementById('login-user').value.trim();
            const password = document.getElementById('login-pass').value.trim();
            const msg = document.getElementById('login-msg');

            if (!username || !password) {
                if(msg) { msg.textContent = "Please enter credentials"; msg.style.display = 'block'; }
                return;
            }

            try {
                // Call API
                const response = await api.auth.login({ username, password });
                
                if (response && response.user) {
                    // Success: Save user and reload to trigger app.js router logic
                    localStorage.setItem('pos_user', JSON.stringify(response.user));
                    window.location.reload();
                } else {
                    // Fail
                    if(msg) { msg.textContent = "Invalid credentials"; msg.style.display = 'block'; }
                }
            } catch (e) {
                console.error(e);
                if(msg) { msg.textContent = "Login Error"; msg.style.display = 'block'; }
            }
        };
    }
}