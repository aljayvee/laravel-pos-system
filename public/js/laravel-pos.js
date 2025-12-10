/* =========================================
   PART 1: THE BRIDGE (API Communication)
   ========================================= */
const posSystem = {
    _headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    
    // Helper to safely fetch JSON and handle 404/500 errors gracefully
    _fetchJson: async (url, options = {}) => {
        try {
            const res = await fetch(url, options);
            
            // If response is not OK (e.g., 404, 500), throw an error
            if (!res.ok) {
                const text = await res.text();
                // Try parsing JSON error from server
                try {
                    const json = JSON.parse(text);
                    console.error(`API Error (${url}):`, json);
                    throw new Error(json.message || `API Error: ${res.status}`);
                } catch (e) {
                    // If parsing failed, it's likely HTML (404 page, etc)
                    console.error(`API Fatal Error (${url}): Server returned non-JSON`, text.substring(0, 50));
                    throw new Error(`API Error: ${res.status} ${res.statusText}`);
                }
            }

            return await res.json();
        } catch (err) {
            console.error(`Request failed for ${url}:`, err.message);
            return null; // Return null so the app doesn't crash on syntax errors
        }
    },

    login: async (creds) => {
        return await posSystem._fetchJson('/api/login', { 
            method: 'POST', 
            headers: posSystem._headers, 
            body: JSON.stringify(creds) 
        });
    },

    logout: async (userId) => {
        const body = userId ? JSON.stringify({ id: userId }) : '{}';
        await posSystem._fetchJson('/api/logout', { 
            method: 'POST', 
            headers: posSystem._headers,
            body: body 
        });
        return { success: true };
    },

    getMenu: async () => await posSystem._fetchJson('/api/menu') || {},

    saveOrder: async (data) => {
        return await posSystem._fetchJson('/api/order', { 
            method: 'POST', 
            headers: posSystem._headers, 
            body: JSON.stringify(data) 
        });
    },

    getDashboardStats: async () => await posSystem._fetchJson('/api/dashboard-stats') || {},
    getDailySales: async () => await posSystem._fetchJson('/api/daily-sales') || [],
    
    // User Management
    getUsers: async () => await posSystem._fetchJson('/api/users') || [],
    addUser: async (data) => await posSystem._fetchJson('/api/users/add', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    updateUser: async (data) => await posSystem._fetchJson('/api/users/update', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    deleteUser: async (data) => await posSystem._fetchJson('/api/users/delete', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),

    // Reports
    getHistory: async () => await posSystem._fetchJson('/api/history') || [],
    getLogs: async () => await posSystem._fetchJson('/api/logs') || [],
    getSalesByCategory: async () => await posSystem._fetchJson('/api/sales-category') || [],
    
    // Categories
    addCategory: async (data) => await posSystem._fetchJson('/api/categories/add', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    updateCategory: async (data) => await posSystem._fetchJson('/api/categories/update', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    deleteCategory: async (data) => await posSystem._fetchJson('/api/categories/delete', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),

    // Products
    addMenuItem: async (data) => await posSystem._fetchJson('/api/add-product', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    updateProduct: async (data) => await posSystem._fetchJson('/api/products/update', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),
    deleteProduct: async (data) => await posSystem._fetchJson('/api/products/delete', { method: 'POST', headers: posSystem._headers, body: JSON.stringify(data) }),

    printReceipt: async (data) => {
        const win = window.open('', '', 'width=400,height=600');
        let itemsHtml = data.items.map(i => `<tr><td>${i.name || i.product_name}</td><td>${i.quantity}</td><td style="text-align:right">${parseFloat(i.price || i.price_at_sale).toFixed(2)}</td></tr>`).join('');
        win.document.write(`<html><body style="font-family:monospace"><h3>RECEIPT</h3><p>Ref: ${data.referenceNumber}</p><hr><table>${itemsHtml}</table><hr><p>Total: ${data.totalCost}</p><script>window.print();setTimeout(()=>window.close(),500);</script></body></html>`);
        win.document.close();
    }
};
window.posSystem = posSystem;

/* =========================================
   PART 2: APP LOGIC & UI HANDLERS
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;
    let cart = [];
    let menus = {};
    let fullMenuData = {}; 
    let fullUserData = []; 
    let accountsRefreshInterval = null; 

    // DOM Elements
    const dom = {
        loginView: document.getElementById('login-view'),
        mainApp: document.getElementById('main-app'),
        cashierView: document.getElementById('cashier-view'),
        dashboardView: document.getElementById('dashboard-view'),
        loginUser: document.getElementById('login-user'),
        loginPass: document.getElementById('login-pass'),
        loginBtn: document.getElementById('login-btn'),
        sidebar: document.getElementById('admin-sidebar'),
        sidebarNav: document.getElementById('sidebar-nav'),
        adminContent: document.getElementById('admin-content'),
        userModal: document.getElementById('user-modal'),
        headerUser: document.getElementById('header-username'),
        sidebarToggle: document.getElementById('sidebar-toggle'),
        logoutBtn: document.getElementById('global-logout-btn'),
        productModal: document.getElementById('product-modal'),
        categoryModal: document.getElementById('category-modal')
    };

    // --- SIDEBAR TOGGLE ---
    if(dom.sidebarToggle && dom.sidebar) {
        dom.sidebarToggle.onclick = () => {
            dom.sidebar.classList.toggle('collapsed');
        };
    }

    // --- PERSISTENCE ---
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            startSession();
        } catch (e) { localStorage.removeItem('pos_user'); }
    }

    // --- LOGIN/LOGOUT ---
    if(dom.loginBtn) {
        dom.loginBtn.onclick = async () => {
            const username = dom.loginUser.value.trim();
            const password = dom.loginPass.value.trim();
            if(!username || !password) return alert("Please enter credentials");

            const user = await window.posSystem.login({ username, password });
            if (user) {
                currentUser = user;
                localStorage.setItem('pos_user', JSON.stringify(user));
                startSession();
            } else {
                alert("Invalid Credentials");
            }
        };
    }

    if(dom.logoutBtn) {
        dom.logoutBtn.onclick = async () => {
            if(currentUser && currentUser.id) {
                await window.posSystem.logout(currentUser.id);
            } else {
                await window.posSystem.logout(null);
            }
            localStorage.removeItem('pos_user');
            currentUser = null; 
            if (accountsRefreshInterval) clearInterval(accountsRefreshInterval);
            window.location.reload();
        };
    }

    function startSession() {
        dom.loginView.style.display = 'none';
        dom.mainApp.style.display = 'block';
        dom.headerUser.textContent = `${currentUser.first_name} (${currentUser.role})`;

        if (currentUser.role === 'cashier') {
            if(dom.sidebarToggle) dom.sidebarToggle.style.display = 'none';
            loadCashierInterface();
        } else {
            if(dom.sidebarToggle) dom.sidebarToggle.style.display = 'block';
            loadDashboardInterface();
        }
    }

    // --- CASHIER INTERFACE ---
    async function loadCashierInterface() {
        dom.cashierView.classList.add('active-view');
        dom.dashboardView.classList.remove('active-view');
        menus = await window.posSystem.getMenu();
        renderShop();
    }

    function renderShop() {
        const catContainer = document.getElementById('shop-categories');
        const grid = document.getElementById('shop-grid');
        if(catContainer) catContainer.innerHTML = ''; 
        if(grid) grid.innerHTML = '';

        const categories = Object.keys(menus);
        if(categories.length === 0) {
            if(grid) grid.innerHTML = '<p style="padding:20px;">No items found.</p>';
            return;
        }

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = cat;
            btn.onclick = () => renderProducts(cat);
            if(catContainer) catContainer.appendChild(btn);
        });

        if(categories.length > 0) renderProducts(categories[0]);
    }

    function renderProducts(cat) {
        const grid = document.getElementById('shop-grid');
        if(grid) grid.innerHTML = '';
        if(menus[cat]) {
            menus[cat].forEach(item => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `<div class="p-info"><strong>${item.name}</strong><br>Php ${item.price}</div>`;
                div.onclick = () => addToCart(item);
                if(grid) grid.appendChild(div);
            });
        }
    }

    function addToCart(item) {
        const exist = cart.find(c => c.name === item.name);
        if(exist) exist.quantity++; else cart.push({...item, quantity: 1});
        updateCartUI();
    }

    function updateCartUI() {
        const list = document.getElementById('shop-cart-list');
        if(list) list.innerHTML = '';
        let total = 0;
        cart.forEach((c, i) => {
            total += c.price * c.quantity;
            if(list) list.innerHTML += `<div class="cart-item" onclick="removeFromCart(${i})">${c.name} x${c.quantity} <span style="float:right">${(c.price * c.quantity).toFixed(2)}</span></div>`;
        });
        const totalEl = document.getElementById('shop-total');
        if(totalEl) totalEl.textContent = total.toFixed(2);
    }

    window.removeFromCart = (i) => { cart.splice(i, 1); updateCartUI(); };

    const payBtn = document.getElementById('shop-pay-btn');
    if(payBtn) {
        payBtn.onclick = async () => {
            const cash = parseFloat(document.getElementById('shop-cash').value);
            const total = parseFloat(document.getElementById('shop-total').textContent);
            if(cart.length === 0 || isNaN(cash) || cash < total) return alert("Invalid Order");

            const data = { referenceNumber: `TX-${Date.now()}`, totalCost: total, cashPaid: cash, change: cash-total, items: cart, cashier: currentUser.username };
            await window.posSystem.saveOrder(data);
            await window.posSystem.printReceipt(data);
            cart = []; updateCartUI(); document.getElementById('shop-cash').value = '';
            alert("Paid & Printed");
        };
    }

    // --- DASHBOARD (ADMIN/MANAGER/SECURITY) ---
    function loadDashboardInterface() {
        if(dom.cashierView) dom.cashierView.classList.remove('active-view');
        if(dom.dashboardView) dom.dashboardView.classList.add('active-view');
        renderSidebar();
        renderDashboardPage('dashboard');
    }

    function renderSidebar() {
        if(!dom.sidebarNav) return;
        dom.sidebarNav.innerHTML = '';
        const role = currentUser.role;

        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: ['admin', 'manager', 'security'] },
            { id: 'manage_products', label: 'Manage Products', icon: 'fa-box', roles: ['admin', 'manager'] },
            { id: 'manage_users', label: 'Manage Admins/Users', icon: 'fa-users-cog', roles: ['admin', 'security'] },
            { id: 'sales_report', label: 'Sales Report', icon: 'fa-file-invoice-dollar', roles: ['admin', 'manager'] },
            { id: 'order_history', label: 'Order History', icon: 'fa-history', roles: ['admin'] },
            { id: 'sales_category', label: 'Sales by Category', icon: 'fa-chart-pie', roles: ['admin'] },
            { id: 'online_accounts', label: 'Online Accounts', icon: 'fa-globe', roles: ['admin'] },
            { id: 'audit_logs', label: 'Audit Logs', icon: 'fa-clipboard-list', roles: ['admin'] },
            { id: 'transaction_history', label: 'Transaction History', icon: 'fa-receipt', roles: ['admin'] }
        ];

        menuItems.forEach(item => {
            if(item.roles.includes(role)) {
                const btn = document.createElement('button');
                btn.innerHTML = `<i class="fas ${item.icon}"></i> <span>${item.label}</span>`;
                btn.onclick = () => {
                    dom.sidebarNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderDashboardPage(item.id);
                };
                dom.sidebarNav.appendChild(btn);
            }
        });
    }

    async function renderDashboardPage(pageId) {
        if(!dom.adminContent) return;
        
        if (accountsRefreshInterval) {
            clearInterval(accountsRefreshInterval);
            accountsRefreshInterval = null;
        }

        try {
            if(pageId === 'dashboard') {
                dom.adminContent.innerHTML = 'Loading...';
                const stats = await window.posSystem.getDashboardStats();
                const salesData = await window.posSystem.getDailySales();
                
                dom.adminContent.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h2>Dashboard</h2>
                        <button class="btn btn-primary" onclick="window.location.reload()"><i class="fas fa-sync"></i> Refresh</button>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">
                        <div style="padding:20px; background:white; border-radius:12px; border-left: 5px solid #FF3B5C; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <h3>Total Revenue</h3><p style="font-size:24px; font-weight:bold;">Php ${parseFloat(stats.todayRevenue || 0).toFixed(2)}</p>
                        </div>
                        <div style="padding:20px; background:white; border-radius:12px; border-left: 5px solid #00C853; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <h3>Total Orders</h3><p style="font-size:24px; font-weight:bold;">${stats.todayOrders || 0}</p>
                        </div>
                        <div style="padding:20px; background:white; border-radius:12px; border-left: 5px solid orange; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <h3>Total Users</h3><p style="font-size:24px; font-weight:bold;">${stats.userCount || 0}</p>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                        <div style="background:#fff; padding:20px; border-radius:12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <h3>Weekly Sales Chart</h3>
                            <div id="revenue-chart-bars" style="display:flex; align-items:flex-end; justify-content:space-around; height:200px; margin-top:20px; border-bottom:1px solid #eee;"></div>
                        </div>
                    </div>`;
                
                renderChart(salesData);

            } else if (pageId === 'manage_products') {
                dom.adminContent.innerHTML = 'Loading...';
                fullMenuData = await window.posSystem.getMenu();
                renderManageProducts(fullMenuData);
            
            } else if(pageId === 'manage_users') {
                dom.adminContent.innerHTML = 'Loading...';
                fullUserData = await window.posSystem.getUsers();
                renderManageUsers(fullUserData);

            } else if (pageId === 'sales_report') {
                dom.adminContent.innerHTML = 'Loading...';
                const salesCatData = await window.posSystem.getSalesByCategory();
                
                let html = `<h2>Sales Report</h2><div class="content-card"><h3>Sales by Category</h3><table style="width:100%; margin-top:15px; border-collapse:collapse;"><thead><tr style="background:#f5f5f5; border-bottom:1px solid #ddd;"><th style="padding:12px; text-align:left;">Category</th><th style="padding:12px; text-align:left;">Total Sales</th></tr></thead><tbody>`;
                
                if (salesCatData.length > 0) {
                    salesCatData.forEach(row => {
                        html += `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">${row.category}</td><td style="padding:12px; font-weight:bold; color:var(--primary);">Php ${Number(row.total_sales).toFixed(2)}</td></tr>`;
                    });
                } else {
                    html += '<tr><td colspan="2" style="padding:15px; text-align:center; color:#888;">No sales data found.</td></tr>';
                }
                html += `</tbody></table></div>`;
                dom.adminContent.innerHTML = html;

            } else if (pageId === 'sales_category') {
                renderDashboardPage('sales_report');
            
            } else if (pageId === 'online_accounts') {
                dom.adminContent.innerHTML = 'Loading...';
                const fetchAndRender = async () => {
                    fullUserData = await window.posSystem.getUsers();
                    if (!Array.isArray(fullUserData)) fullUserData = [];
                    if(document.getElementById('accounts-table') || dom.adminContent.innerHTML === 'Loading...') {
                       renderAccountsTable(fullUserData, "Online Accounts");
                    }
                };
                
                await fetchAndRender();
                accountsRefreshInterval = setInterval(fetchAndRender, 3000);
            
            } else if (pageId === 'audit_logs') {
                const logs = await window.posSystem.getLogs();
                dom.adminContent.innerHTML = `<h2>Audit Logs</h2><ul>` + logs.map(l => `<li><strong>${l.username}</strong>: ${l.action} <small>(${l.created_at})</small></li>`).join('') + `</ul>`;
            
            } else if (pageId === 'order_history' || pageId === 'transaction_history') {
                const hist = await window.posSystem.getHistory();
                let html = `<h2>${pageId === 'order_history' ? 'Order History' : 'Transaction History'}</h2><table style="width:100%; margin-top:20px;"><tr><th>Ref #</th><th>Amount</th><th>Type</th><th>Time</th></tr>`;
                hist.forEach(h => {
                    html += `<tr><td>${h.reference_number}</td><td>Php ${h.total_cost}</td><td>${h.order_status}</td><td>${h.created_at}</td></tr>`;
                });
                dom.adminContent.innerHTML = html + '</table>';
            }
        } catch (e) {
            console.error(e);
            dom.adminContent.innerHTML = `<p style="color:red; padding:20px;">Error loading content: ${e.message}</p>`;
        }
    }

    function renderChart(data) {
        const container = document.getElementById('revenue-chart-bars');
        if(!container) return;
        if (!Array.isArray(data)) data = []; 
        
        let html = '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        for(let i=6; i>=0; i--) {
            const d = new Date(); d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const record = data.find(r => r.date === dateStr);
            const value = record ? parseFloat(record.total) : 0;
            const height = value > 0 ? (value / 500) * 150 : 2; 
            html += `<div style="text-align:center; width:100%;"><div style="height:${Math.min(height, 150)}px; width:30px; background:${value > 0 ? '#FF3B5C' : '#eee'}; margin:0 auto;" title="Php ${value}"></div><small>${days[d.getDay()]}</small></div>`;
        }
        container.innerHTML = html;
    }

    // --- QUICK ACTION HANDLER ---
    window.handleQuickAction = (action) => {
        const mapping = {
            'manage_users': 'Manage Admins/Users',
            'manage_products': 'Manage Products',
            'sales_report': 'Sales Report'
        };
        const targetLabel = mapping[action];
        const btn = Array.from(dom.sidebarNav.querySelectorAll('button')).find(b => b.innerText.includes(targetLabel));
        if(btn) btn.click();
    };

    // --- HELPER FUNCTIONS (DEFINED HERE TO AVOID REFERENCE ERRORS) ---
    
    function renderManageProducts(menuData) {
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>Manage Products</h2>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="prod-search" placeholder="Search..." class="shop-input" onkeyup="searchProducts()">
                    <button class="btn btn-primary" onclick="openCategoryModal()">+ Add Category</button>
                </div>
            </div>
            <div id="prod-list-container">
        `;
        
        Object.keys(menuData).forEach(catName => {
            const products = menuData[catName];
            const catId = (products && products.length > 0) ? products[0].category_id : null; 

            html += `
                <details open style="margin-bottom:15px; border:1px solid #ddd; border-radius:8px; padding:10px; background:#fff;">
                    <summary style="cursor:pointer; font-weight:bold; font-size:1.1rem; padding-bottom:10px;">
                        ${catName}
                        <div style="float:right; display:inline-block;">
                            <button class="btn btn-sm btn-success" onclick='openProductModal(null, "${catName}")'>+ Add Item</button>
                            ${catId ? `<button class="btn btn-sm btn-secondary" onclick='openCategoryModal(${catId}, "${catName}")'>Edit Cat</button>` : ''}
                            ${catId ? `<button class="btn btn-sm btn-danger" onclick='deleteCategory(${catId})'>Del Cat</button>` : ''}
                        </div>
                    </summary>
                    <table style="width:100%; margin-top:5px; border-collapse:collapse;">
                        ${(!products || products.length === 0) ? '<tr><td colspan="3">No items</td></tr>' : ''}
            `;
            
            if(products) {
                products.forEach(p => {
                    html += `
                        <tr style="border-top:1px solid #eee;">
                            <td style="padding:8px;">${p.name}</td>
                            <td style="padding:8px;">Php ${parseFloat(p.price).toFixed(2)}</td>
                            <td style="text-align:right; padding:8px;">
                                <button class="btn btn-sm btn-secondary" onclick='openProductModal(${JSON.stringify(p)}, "${catName}")'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick='deleteProduct(${p.id})'>Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            html += `</table></details>`;
        });
        html += `</div>`;
        dom.adminContent.innerHTML = html;
    }

    function renderManageUsers(users) {
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>Manage Users</h2>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="user-search" placeholder="Search Users..." class="shop-input" onkeyup="searchUsers()">
                    <button class="btn btn-primary" onclick="openUserModal()">+ Add User</button>
                </div>
            </div>
            <table style="width:100%; border-collapse:collapse; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <thead>
                    <tr style="background:#f4f4f4; border-bottom:2px solid #ddd;">
                        <th style="padding:15px; text-align:left;">Username</th>
                        <th style="padding:15px; text-align:left;">First Name</th>
                        <th style="padding:15px; text-align:left;">Role</th>
                        <th style="padding:15px; text-align:right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="user-list-body">
        `;

        if (!users || users.length === 0) {
            html += `<tr><td colspan="4" style="padding:20px; text-align:center;">No users found.</td></tr>`;
        } else {
            users.forEach(u => {
                html += `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px 15px;">${u.username}</td>
                        <td style="padding:12px 15px;">${u.first_name}</td>
                        <td style="padding:12px 15px;">${u.role}</td>
                        <td style="padding:12px 15px; text-align:right;">
                            <button class="btn btn-sm btn-secondary" onclick='editUser(${JSON.stringify(u)})'>Edit</button> 
                            <button class="btn btn-sm btn-danger" onclick="delUser(${u.id})">Delete</button>
                        </td>
                    </tr>`;
            });
        }
        html += `</tbody></table>`;
        dom.adminContent.innerHTML = html;
    }

    function renderAccountsTable(users, title = "Online Accounts") {
        if (!Array.isArray(users)) users = [];
        const onlineAdmins = users.filter(u => u.role === 'admin' && parseInt(u.status) === 1).length;
        const searchInput = document.getElementById('user-search');
        const currentQuery = searchInput ? searchInput.value : '';

        let uHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="font-weight:bold; font-size:1.8rem;">${title}</h2>
            </div>
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
                <div style="background:white; padding:10px 20px; border-radius:8px; border-left:5px solid var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); font-weight:bold;">
                    Total Admins: ${onlineAdmins}
                </div>
                <input type="text" id="user-search" placeholder="Search accounts..." class="shop-input" style="width:300px; margin:0;" value="${currentQuery}" onkeyup="searchUsers()">
            </div>
            <table id="accounts-table" style="width:100%;">
                <thead>
                    <tr style="background:#f9f9f9; border-bottom:1px solid #eee;">
                        <th style="padding:15px;">First Name</th>
                        <th style="padding:15px;">Username</th>
                        <th style="padding:15px;">Role</th>
                        <th style="padding:15px;">Status</th>
                    </tr>
                </thead>
                <tbody id="accounts-table-body">
        `;

        let displayUsers = users;
        if (currentQuery) {
            displayUsers = users.filter(u => u.username.toLowerCase().includes(currentQuery.toLowerCase()));
        }

        if (displayUsers.length === 0) {
            uHtml += `<tr><td colspan="4" style="padding:20px; text-align:center;">No users found.</td></tr>`;
        } else {
            displayUsers.forEach(u => {
                let isOnline = parseInt(u.status) === 1;
                if(currentUser && u.username === currentUser.username) isOnline = true;

                const statusHtml = isOnline 
                    ? '<span style="color:var(--success); font-weight:bold;">Online</span>' 
                    : '<span style="color:gray;">Offline</span>';

                uHtml += `
                <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:15px;">${u.first_name}</td>
                    <td style="padding:15px;">${u.username}</td>
                    <td style="padding:15px;">${u.role}</td>
                    <td style="padding:15px;">${statusHtml}</td>
                </tr>`;
            });
        }
        uHtml += `</tbody></table>`;
        dom.adminContent.innerHTML = uHtml;
        
        const newSearchInput = document.getElementById('user-search');
        if (newSearchInput && currentQuery) {
            newSearchInput.focus();
            newSearchInput.setSelectionRange(currentQuery.length, currentQuery.length);
        }
    }

    // Expose functions globally for HTML events
    window.searchProducts = searchProducts;
    window.renderManageProducts = renderManageProducts;
    window.searchUsers = () => {
        const query = document.getElementById('user-search').value.toLowerCase();
        if (!Array.isArray(fullUserData)) return;
        const filteredUsers = fullUserData.filter(u => u.username.toLowerCase().includes(query));
        
        const manageTable = document.getElementById('user-list-body');
        const onlineTable = document.getElementById('accounts-table-body');

        if(manageTable) {
            renderManageUsers(filteredUsers);
        } else if (onlineTable) {
             renderAccountsTable(filteredUsers, "Online Accounts");
        }
    };

    // --- GLOBAL MODAL ACTIONS ---
    window.openCategoryModal = (id = null, name = "") => {
        if(!dom.categoryModal) return;
        dom.categoryModal.style.display = 'flex';
        document.getElementById('cat-name-input').value = name;
        document.getElementById('cat-save-btn').onclick = async () => {
            const newName = document.getElementById('cat-name-input').value.trim();
            if(!newName) return alert("Name required");
            if(id) await window.posSystem.updateCategory({ id, name: newName });
            else await window.posSystem.addCategory({ name: newName });
            dom.categoryModal.style.display = 'none';
            renderDashboardPage('manage_products');
        };
    };

    window.closeCategoryModal = () => { if(dom.categoryModal) dom.categoryModal.style.display = 'none'; };

    window.openProductModal = (product = null, catName = "") => {
        if(!dom.productModal) return;
        const title = document.getElementById('prod-modal-title');
        const nameInput = document.getElementById('prod-name');
        const priceInput = document.getElementById('prod-price');
        const saveBtn = document.getElementById('prod-save-btn');
        
        if(title) title.textContent = product ? "Edit Product" : "Add Product to " + catName;
        nameInput.value = product ? product.name : "";
        priceInput.value = product ? product.price : "";
        
        saveBtn.onclick = async () => {
            const name = nameInput.value.trim();
            const price = priceInput.value;
            if(!name || !price) return alert("Invalid inputs");
            if (product) await window.posSystem.updateProduct({ id: product.id, name, price });
            else await window.posSystem.addMenuItem({ category: catName, name, price });
            dom.productModal.style.display = 'none';
            renderDashboardPage('manage_products');
        };
        dom.productModal.style.display = 'flex';
    };

    window.closeProductModal = () => { if(dom.productModal) dom.productModal.style.display = 'none'; };
    window.deleteProduct = async (id) => {
        if(confirm("Delete this product?")) {
            await window.posSystem.deleteProduct({id});
            renderDashboardPage('manage_products');
        }
    };

    window.openUserModal = () => { if(dom.userModal) dom.userModal.style.display = 'flex'; };
    window.closeUserModal = () => { if(dom.userModal) dom.userModal.style.display = 'none'; };
    
    window.editUser = (u) => {
        openUserModal();
        document.getElementById('user-username').value = u.username;
        document.getElementById('user-fname').value = u.first_name;
        document.getElementById('user-lname').value = u.last_name;
        document.getElementById('user-role').value = u.role;
        document.getElementById('user-save-btn').onclick = async () => {
            const data = {
                id: u.id,
                username: document.getElementById('user-username').value,
                password: document.getElementById('user-pass').value,
                firstName: document.getElementById('user-fname').value,
                lastName: document.getElementById('user-lname').value,
                role: document.getElementById('user-role').value
            };
            await window.posSystem.updateUser(data);
            alert("User Updated");
            closeUserModal();
            renderDashboardPage('manage_users');
        };
    };

    window.delUser = async (id) => {
        if(confirm("Delete user?")) {
            await window.posSystem.deleteUser({id});
            renderDashboardPage('manage_users');
        }
    };
});