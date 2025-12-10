import { api } from '../services/api.js';

export async function renderManageUsers(contentDiv) {
    contentDiv.innerHTML = '<p class="p-5">Loading Users...</p>';
    const users = await api.users.getAll();
    
    let html = `
        <div class="flex justify-between items-center mb-5">
            <h2 class="text-2xl font-bold">Manage Users</h2>
            <button id="add-user-btn" class="bg-blue-600 text-white px-4 py-2 rounded shadow">+ Add User</button>
        </div>
        <table class="w-full bg-white shadow rounded overflow-hidden">
            <thead class="bg-gray-100 border-b">
                <tr><th class="p-3 text-left">Username</th><th class="p-3 text-left">Role</th><th class="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(u => {
        html += `
            <tr class="border-b">
                <td class="p-3">${u.username}</td>
                <td class="p-3 capitalize">${u.role}</td>
                <td class="p-3 text-right">
                    <button class="text-red-500 hover:underline" data-id="${u.id}" class="del-user">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    contentDiv.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('add-user-btn').onclick = () => {
        document.getElementById('user-modal').style.display = 'flex';
        // Logic to bind save button to api.users.add() goes here
    };
}