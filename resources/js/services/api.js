const HEADERS = { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json',
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
};

const _fetch = async (url, options = {}) => {
    try {
        const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("API Request Failed:", err);
        return null;
    }
};

export const api = {
    auth: {
        login: (creds) => _fetch('/api/login', { method: 'POST', body: JSON.stringify(creds) }),
        logout: (id) => _fetch('/api/logout', { method: 'POST', body: JSON.stringify({ id }) }),
    },
    users: {
        getAll: () => _fetch('/api/users'),
        add: (data) => _fetch('/api/users/add', { method: 'POST', body: JSON.stringify(data) }),
        update: (data) => _fetch('/api/users/update', { method: 'POST', body: JSON.stringify(data) }),
        delete: (data) => _fetch('/api/users/delete', { method: 'POST', body: JSON.stringify(data) }),
        getOnline: () => _fetch('/api/users/online'),
    },
    products: {
        getMenu: () => _fetch('/api/menu'),
        add: (data) => _fetch('/api/products/add', { method: 'POST', body: JSON.stringify(data) }),
        update: (data) => _fetch('/api/products/update', { method: 'POST', body: JSON.stringify(data) }),
        delete: (data) => _fetch('/api/products/delete', { method: 'POST', body: JSON.stringify(data) }),
    },
    reports: {
        dashboard: () => _fetch('/api/dashboard-stats'),
        sales: () => _fetch('/api/daily-sales'),
    }
};