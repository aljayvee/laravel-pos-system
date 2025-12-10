import { api } from '../services/api.js';

let cart = [];
let menuData = {};

export async function initCashier() {
    console.log("Initializing Cashier View...");
    menuData = await api.products.getMenu();
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById('shop-categories');
    if(!container) return;
    container.innerHTML = '';
    
    Object.keys(menuData).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'px-4 py-2 border rounded-full bg-white hover:bg-gray-100 whitespace-nowrap';
        btn.textContent = cat;
        btn.onclick = () => renderProducts(cat);
        container.appendChild(btn);
    });

    if(Object.keys(menuData).length > 0) renderProducts(Object.keys(menuData)[0]);
}

function renderProducts(category) {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    
    if(menuData[category]) {
        menuData[category].forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded shadow cursor-pointer hover:-translate-y-1 transition';
            card.innerHTML = `<h4 class="font-bold text-sm">${item.name}</h4><p class="text-pink-600 font-bold">Php ${item.price}</p>`;
            card.onclick = () => addToCart(item);
            grid.appendChild(card);
        });
    }
}

function addToCart(item) {
    const existing = cart.find(c => c.name === item.name);
    if(existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('shop-cart-list');
    list.innerHTML = '';
    let total = 0;
    
    cart.forEach((c, index) => {
        total += c.price * c.quantity;
        const itemRow = document.createElement('div');
        itemRow.className = 'flex justify-between p-2 border-b';
        itemRow.innerHTML = `<span>${c.name} x${c.quantity}</span> <span class="font-bold">${(c.price * c.quantity).toFixed(2)}</span>`;
        itemRow.onclick = () => { cart.splice(index, 1); updateCartUI(); };
        list.appendChild(itemRow);
    });
    
    document.getElementById('shop-total').textContent = total.toFixed(2);
}