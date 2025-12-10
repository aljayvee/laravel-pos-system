<section id="cashier-view" class="view h-full w-full flex" style="display:none;">
    <div class="shop-container flex w-full h-full">
        <!-- Left: Menu Grid -->
        <div class="shop-menu flex-[3] flex flex-col border-r border-gray-300 bg-gray-50">
            <div id="shop-categories" class="shop-tabs flex overflow-x-auto p-3 bg-white gap-3 border-b border-gray-200">
                <!-- Categories injected via JS -->
            </div>
            <div id="shop-grid" class="product-grid flex-1 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 p-5 overflow-y-auto">
                <!-- Products injected via JS -->
            </div>
        </div>
        
        <!-- Right: Cart -->
        <div class="shop-cart flex-1 min-w-[350px] bg-white flex flex-col border-l border-gray-300 shadow-lg">
            <h3 class="p-4 border-b border-gray-200 bg-gray-50 font-bold text-lg">Current Cart</h3>
            <div id="shop-cart-list" class="cart-list flex-1 overflow-y-auto p-3">
                <!-- Cart Items -->
            </div>
            <div class="cart-summary p-5 bg-gray-50 border-t border-gray-200">
                <div class="total-row flex justify-between text-xl font-bold mb-4">
                    <span>Total:</span> <span id="shop-total">0.00</span>
                </div>
                <input type="number" id="shop-cash" placeholder="Cash Amount" class="w-full p-3 mb-3 border rounded text-lg">
                <button id="shop-pay-btn" class="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">PAY & PRINT</button>
            </div>
        </div>
    </div>
</section>