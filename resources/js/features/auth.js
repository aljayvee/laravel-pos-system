import { api } from '../services/api.js';

export function initAuth() {
    // Helper to attach listener safely
    const attachLoginListener = () => {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('login-user');
        const passwordInput = document.getElementById('login-pass');
        const msg = document.getElementById('login-msg');

        if (loginBtn) {
            console.log("Login button found in DOM, attaching listener..."); // Log 1

            // Remove existing listener to prevent duplicates
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

            newLoginBtn.onclick = async () => {
                console.log("Login button clicked!"); // Log 2

                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                console.log(`Attempting login for user: ${username}`); // Log 3

                // Basic Frontend Validation
                if (!username || !password) {
                    console.log("Validation failed: Missing username or password");
                    if(msg) { 
                        msg.textContent = "Please enter credentials"; 
                        msg.style.display = 'block'; 
                        msg.classList.remove('hidden'); 
                    }
                    return;
                }

                // Show loading state
                newLoginBtn.disabled = true;
                newLoginBtn.textContent = 'Logging in...';
                if(msg) msg.style.display = 'none';

                try {
                    // Call API
                    console.log("Calling API...");
                    const response = await api.auth.login({ username, password });
                    console.log("API Response received:", response); // Log 4
                    
                    if (response && response.user) {
                        // Success: Save user and reload
                        console.log("Login successful, saving user and reloading...");
                        localStorage.setItem('pos_user', JSON.stringify(response.user));
                        window.location.reload();
                    } else {
                        // Fail
                        // FIX: Check if response exists before accessing .message
                        const errorText = (response && response.message) ? response.message : "Server Error (Check Database)";
                        throw new Error(errorText);
                    }
                } catch (e) {
                    console.error("Login failed:", e); // Log 5
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
                if (e.key === 'Enter') {
                    console.log("Enter key pressed, triggering click...");
                    newLoginBtn.click();
                }
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
    const observer = new MutationObserver(() => {
        if (document.getElementById('login-btn')) {
            console.log("Login button detected via MutationObserver");
            attachLoginListener();
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}