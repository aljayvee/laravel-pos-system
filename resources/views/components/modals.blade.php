<!-- USER MODAL -->
<div id="user-modal" class="modal fixed inset-0 bg-black/50 hidden items-center justify-center z-[2000]">
    <div class="modal-content bg-white p-6 rounded-lg w-[450px] text-left shadow-2xl">
        <h3 id="user-modal-title" class="text-xl font-bold mb-4">Add New Account</h3>
        <input type="hidden" id="user-id">
        
        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Username</label>
            <input type="text" id="user-username" class="w-full p-2 border rounded">
        </div>
        
        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Password</label>
            <input type="password" id="user-pass" class="w-full p-2 border rounded" placeholder="Leave blank if unchanged">
        </div>
        
        <div class="grid grid-cols-2 gap-2 mb-3">
            <div>
                <label class="block text-sm font-medium mb-1">First Name</label>
                <input type="text" id="user-fname" class="w-full p-2 border rounded">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Last Name</label>
                <input type="text" id="user-lname" class="w-full p-2 border rounded">
            </div>
        </div>
        
        <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Role</label>
            <select id="user-role" class="w-full p-2 border rounded">
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="security">Security</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        <div class="flex justify-end gap-2">
            <button onclick="document.getElementById('user-modal').style.display='none'" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button id="user-save-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
    </div>
</div>

<!-- PRODUCT MODAL -->
<div id="product-modal" class="modal fixed inset-0 bg-black/50 hidden items-center justify-center z-[2000]">
    <div class="modal-content bg-white p-6 rounded-lg w-[400px] text-left shadow-2xl">
        <h3 id="prod-modal-title" class="text-xl font-bold mb-4">Product</h3>
        <input type="hidden" id="prod-id">
        <input type="hidden" id="prod-cat-hidden">
        
        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input type="text" id="prod-name" class="w-full p-2 border rounded">
        </div>
        <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Price</label>
            <input type="number" id="prod-price" class="w-full p-2 border rounded">
        </div>

        <div class="flex justify-end gap-2">
            <button onclick="document.getElementById('product-modal').style.display='none'" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button id="prod-save-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
    </div>
</div>

<!-- SUCCESS/ERROR MODAL (Generic) -->
<div id="alert-modal" class="modal fixed inset-0 bg-black/50 hidden items-center justify-center z-[2000]">
    <div class="modal-content bg-white p-6 rounded-lg w-[350px] text-center shadow-2xl">
        <h3 id="alert-title" class="text-lg font-bold mb-2">Notice</h3>
        <p id="alert-msg" class="text-gray-600 mb-4"></p>
        <button onclick="document.getElementById('alert-modal').style.display='none'" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">OK</button>
    </div>
</div>