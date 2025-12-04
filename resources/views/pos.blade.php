<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>JayLeeBay POS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/pos.css') }}">
</head>
<body>
    
    <!-- LOGIN SCREEN (Initial View) -->
    <section id="login-view" class="view active-view">
        <div class="login-card">
            <h1><i class="fas fa-hamburger"></i> Kiosk POS</h1>
            <p>Please login to continue</p>
            <input type="text" id="login-user" placeholder="Username">
            <input type="password" id="login-pass" placeholder="Password">
            <button id="login-btn" class="btn btn-primary w-100">Login</button>
            <p id="login-msg" class="message error-message" style="display:none;"></p>
        </div>
    </section>

    <!-- MAIN APP WRAPPER (Hidden until login) -->
    <div id="main-app" style="display: none;">
        
        <!-- HEADER -->
        <header id="main-header">
            <div class="logo">JayLeeBay 🍔</div>
            <div class="user-controls">
                <span id="header-username">User</span>
                <button id="global-logout-btn" class="btn btn-danger btn-small">Logout</button>
            </div>
        </header>

        <main>
            <!-- CASHIER: ORDERING VIEW (TikTok Shop Style) -->
            <section id="cashier-view" class="view">
                <div class="shop-container">
                    <!-- Left: Menu Grid -->
                    <div class="shop-menu">
                        <div id="shop-categories" class="shop-tabs"></div>
                        <div id="shop-grid" class="product-grid"></div>
                    </div>
                    <!-- Right: Cart & Pay -->
                    <div class="shop-cart">
                        <h3>Current Cart</h3>
                        <div id="shop-cart-list" class="cart-list"></div>
                        <div class="cart-summary">
                            <div class="total-row"><span>Total:</span> <span id="shop-total">0.00</span></div>
                            <input type="number" id="shop-cash" placeholder="Cash Amount" class="shop-input">
                            <button id="shop-pay-btn" class="btn btn-success w-100">PAY & PRINT</button>
                        </div>
                    </div>
                </div>
                
                <!-- Receipt Modal (Hidden) -->
                <div id="receipt-modal" class="modal">
                    <div class="modal-content">
                        <h3>Receipt</h3>
                        <pre id="receipt-preview"></pre>
                        <button onclick="closeReceiptModal()" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </section>

            <!-- DASHBOARD VIEW (Manager / Security / Admin) -->
            <section id="dashboard-view" class="view">
                <div class="admin-container">
                    <!-- SIDEBAR -->
                    <aside id="admin-sidebar">
                        <div class="sidebar-header">
                            <!-- BUTTON MOVED TO LEFT -->
                            <button id="sidebar-toggle" class="btn-icon"><i class="fas fa-bars"></i></button>
                            <span id="dashboard-role-label">Role</span>
                        </div>
                        <nav id="sidebar-nav">
                            <!-- Items injected by JS based on role -->
                        </nav>
                    </aside>

                    <!-- CONTENT AREA -->
                    <div id="admin-content-wrapper">
                        <div id="admin-content" class="content-card">
                            <h2>Welcome</h2>
                            <p>Select an option from the sidebar.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- GLOBAL CONFIRMATION MODAL -->
            <div id="confirm-modal" class="modal">
                <div class="modal-content">
                    <h3><i class="fas fa-exclamation-triangle" style="color:orange"></i> Confirm Action</h3>
                    <p id="confirm-msg">Are you sure?</p>
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                        <button id="confirm-yes" class="btn btn-danger">Yes, Delete</button>
                        <button id="confirm-no" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- ALERT MODAL -->
            <div id="alert-modal" class="modal">
                <div class="modal-content">
                    <h3>Notice</h3>
                    <p id="alert-msg"></p>
                    <div style="margin-top: 20px; display: flex; justify-content: center;">
                        <button id="alert-ok" class="btn btn-primary">OK</button>
                    </div>
                </div>
            </div>

            <!-- USER MODAL (ADD/EDIT USERS) -->
            <div id="user-modal" class="modal">
                <div class="modal-content" style="text-align: left; width: 450px;">
                    <h3 id="user-modal-title">Add New Account</h3>
                    <input type="hidden" id="user-id">
                    
                    <label>Username:</label>
                    <input type="text" id="user-username" class="shop-input" style="margin-bottom: 5px;">
                    
                    <label>Password (Leave blank if not changing):</label>
                    <input type="password" id="user-pass" class="shop-input" style="margin-bottom: 5px;">
                    
                    <label>First Name:</label>
                    <input type="text" id="user-fname" class="shop-input" style="margin-bottom: 5px;">
                    
                    <label>Last Name:</label>
                    <input type="text" id="user-lname" class="shop-input" style="margin-bottom: 5px;">
                    
                    <label>Role/Position:</label>
                    <select id="user-role" class="shop-input" style="margin-bottom: 15px;">
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="security">Security</option>
                        <option value="admin">Admin</option>
                    </select>

                    <div style="text-align: right;">
                        <button id="user-save-btn" class="btn btn-primary">Save Account</button>
                        <button onclick="closeUserModal()" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- PRODUCT MODAL (ADD/EDIT PRODUCTS) -->
            <div id="product-modal" class="modal">
                <div class="modal-content" style="text-align: left; width: 400px;">
                    <h3 id="prod-modal-title">Edit Product</h3>
                    <input type="hidden" id="prod-id">
                    <input type="hidden" id="prod-cat-hidden"> <!-- Used for adding new products -->
                    
                    <label>Product Name:</label>
                    <input type="text" id="prod-name" class="shop-input" style="margin-bottom: 5px;">
                    
                    <label>Price:</label>
                    <input type="number" id="prod-price" class="shop-input" style="margin-bottom: 15px;">

                    <div style="text-align: right;">
                        <button id="prod-save-btn" class="btn btn-primary">Save Product</button>
                        <button onclick="closeProductModal()" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- CATEGORY MODAL (ADD CATEGORY) -->
            <div id="category-modal" class="modal">
                <div class="modal-content" style="text-align: left; width: 400px;">
                    <h3>Add New Category</h3>
                    <label>Category Name:</label>
                    <input type="text" id="cat-name-input" class="shop-input" style="margin-bottom: 15px;">
                    <div style="text-align: right;">
                        <button id="cat-save-btn" class="btn btn-primary">Save Category</button>
                        <button onclick="closeCategoryModal()" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- TRANSACTION DETAILS MODAL -->
            <div id="tx-details-modal" class="modal">
                <div class="modal-content" style="text-align: left; width: 500px;">
                    <h3>Transaction Details</h3>
                    <div id="tx-details-content" style="margin-bottom: 20px; line-height: 1.6;">
                        <!-- Details injected here -->
                    </div>
                    <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="tx-print-btn" class="btn btn-primary"><i class="fas fa-print"></i> Print Receipt</button>
                        <button onclick="closeTxModal()" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>

        </main>
    </div>

    <script src="{{ asset('js/laravel-pos.js') }}"></script>
</body>
</html>