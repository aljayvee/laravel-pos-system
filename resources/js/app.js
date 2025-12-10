import './bootstrap';
import { api } from './services/api.js';
import { initCashier } from './roles/cashier.js';
import { renderDashboard } from './features/dashboard.js';
import { renderManageUsers } from './features/users.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('pos_user'));
    
    // --- ROUTER LOGIC ---
    if (!currentUser) {
        // Show Login (assuming login view logic exists elsewhere or handled via blade)
        return;
    }

    // Role-Based Redirects/Loading
    if (currentUser.role === 'cashier') {
        document.getElementById('cashier-view').style.display = 'flex';
        initCashier();
    } else {
        document.getElementById('dashboard-view').style.display = 'flex';
        setupAdminSidebar();
        renderDashboard(document.getElementById('admin-content')); // Default view
    }

    // --- SHARED EVENTS ---
    document.getElementById('global-logout-btn')?.addEventListener('click', async () => {
        await api.auth.logout(currentUser.id);
        localStorage.removeItem('pos_user');
        window.location.reload();
    });
});

function setupAdminSidebar() {
    // Simplified Sidebar Logic
    const nav = document.getElementById('sidebar-nav');
    const content = document.getElementById('admin-content');
    
    const links = [
        { label: 'Dashboard', action: () => renderDashboard(content) },
        { label: 'Manage Users', action: () => renderManageUsers(content) },
        // Add other modules here
    ];

    links.forEach(link => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 hover:bg-gray-700 text-gray-300';
        btn.textContent = link.label;
        btn.onclick = link.action;
        nav.appendChild(btn);
    });
}