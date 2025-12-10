import { api } from '../services/api.js';

export function initAuth() {
    const attachLoginListener = () => {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('login-user');
        const passwordInput = document.getElementById('login-pass');
        const msg = document.getElementById('login-msg');

        if (loginBtn) {
            console.log("Login button found, attaching listener.");
            
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

            newLoginBtn.onclick = async () => {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                if (!username || !password) {
                    showError(msg, "Please enter credentials");
                    return;
                }

                newLoginBtn.disabled = true;
                newLoginBtn.textContent = 'Logging in...';
                if(msg) msg.style.display = 'none';

                try {
                    const response = await api.auth.login({ username, password });
                    console.log("API Response:", response);
                    
                    // FIX: Check if response is null (Server Error)
                    if (!response) {
                        throw new Error("Server Error: Check API/Database connection");
                    }

                    if (response.success || (response.user && response.user.id)) {
                        console.log("Login success.");
                        localStorage.setItem('pos_user', JSON.stringify(response.user));
                        window.location.reload();
                    } else {
                        throw new Error(response.message || "Invalid credentials");
                    }
                } catch (e) {
                    console.error("Login Error:", e);
                    showError(msg, e.message);
                } finally {
                    newLoginBtn.disabled = false;
                    newLoginBtn.textContent = 'Login';
                }
            };

            const handleEnter = (e) => { if (e.key === 'Enter') newLoginBtn.click(); };
            usernameInput?.addEventListener('keypress', handleEnter);
            passwordInput?.addEventListener('keypress', handleEnter);
        }
    };

    function showError(el, text) {
        if(el) {
            el.textContent = text;
            el.style.display = 'block';
            el.classList.remove('hidden');
        }
    }

    attachLoginListener();
    
    const observer = new MutationObserver(() => {
        if (document.getElementById('login-btn')) {
            attachLoginListener();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}