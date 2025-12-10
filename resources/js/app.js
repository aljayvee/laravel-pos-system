import './bootstrap';
import { api } from './services/api.js';
import { initAuth } from './features/auth.js'; // <--- 1. Import Auth Logic
import { initCashier } from './roles/cashier.js';
import { renderDashboard } from './features/dashboard.js';
import { renderManageUsers } from './features/users.js';

document.addEventListener('DOMContentLoaded', () => {
    // 2. Initialize Authentication (This activates the Login Button)
    initAuth();

    const currentUser = JSON.parse(localStorage.getItem('pos_user'));
    
    // --- ROUTER LOGIC ---
    if (!currentUser) {
        // Not logged in? Show Login View, Hide others
        toggleView('login-view');
        return;
    }

    // Logged in? Update Header
    const headerUser = document.getElementById('header-username');
    if(headerUser) headerUser.textContent = `${currentUser.first_name || 'User'} (${currentUser.role})`;

    // Route based on Role
    if (currentUser.role === 'cashier') {
        toggleView('cashier-view');
        initCashier();
    } else {
        toggleView('dashboard-view');
        setupAdminSidebar();
        // Default to dashboard view
        renderDashboard(document.getElementById('admin-content'));
    }

    // --- GLOBAL LOGOUT EVENT ---
    document.getElementById('global-logout-btn')?.addEventListener('click', async () => {
        if(currentUser && currentUser.id) {
            try {
                await api.auth.logout(currentUser.id);
            } catch (e) {
                console.error("Logout failed", e);
            }
        }
        localStorage.removeItem('pos_user');
        window.location.reload();
    });
});

// Helper to switch views cleanly
function toggleView(activeId) {
    const views = ['login-view', 'cashier-view', 'dashboard-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        
        if (id === activeId) {
            el.style.display = 'flex';
            el.classList.add('active-view');
        } else {
            el.style.display = 'none';
            el.classList.remove('active-view');
        }
    });
}

function setupAdminSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const content = document.getElementById('admin-content');
    if(!nav || !content) return;
    
    nav.innerHTML = ''; 

    const links = [
        { label: 'Dashboard', icon: 'fa-chart-line', action: () => renderDashboard(content) },
        { label: 'Manage Users', icon: 'fa-users', action: () => renderManageUsers(content) },
        // Add more admin links here as you build them
    ];

    links.forEach(link => {
        const btn = document.createElement('button');
        // Tailwind styling for sidebar buttons
        btn.className = 'w-full text-left p-4 hover:bg-gray-700 text-gray-300 flex items-center gap-3 transition-colors border-b border-gray-700';
        btn.innerHTML = `<i class="fas ${link.icon}"></i> <span>${link.label}</span>`;
        
        btn.onclick = () => {
            // Remove active styling from siblings
            Array.from(nav.children).forEach(c => {
                c.classList.remove('bg-gray-700', 'text-white', 'border-l-4', 'border-red-500');
                c.classList.add('text-gray-300');
            });
            // Add active styling to current
            btn.classList.remove('text-gray-300');
            btn.classList.add('bg-gray-700', 'text-white', 'border-l-4', 'border-red-500');
            
            link.action();
        };
        nav.appendChild(btn);
    });
}