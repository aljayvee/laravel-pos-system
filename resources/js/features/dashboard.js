import { api } from '../services/api.js';

export async function renderDashboard(contentDiv) {
    contentDiv.innerHTML = '<p class="p-5">Loading Stats...</p>';
    const stats = await api.reports.dashboard();
    
    contentDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
        <div class="grid grid-cols-3 gap-5 mb-8">
            <div class="bg-white p-5 rounded shadow border-l-4 border-pink-500">
                <h3 class="text-gray-500">Revenue</h3>
                <p class="text-2xl font-bold">Php ${parseFloat(stats.todayRevenue || 0).toFixed(2)}</p>
            </div>
            <div class="bg-white p-5 rounded shadow border-l-4 border-green-500">
                <h3 class="text-gray-500">Orders</h3>
                <p class="text-2xl font-bold">${stats.todayOrders || 0}</p>
            </div>
            <div class="bg-white p-5 rounded shadow border-l-4 border-orange-500">
                <h3 class="text-gray-500">Users</h3>
                <p class="text-2xl font-bold">${stats.userCount || 0}</p>
            </div>
        </div>
    `;
    // Add chart rendering logic here if needed
}