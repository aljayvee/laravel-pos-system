<section id="dashboard-view" class="view h-full w-full flex" style="display:none;">
    <!-- SIDEBAR -->
    <aside id="admin-sidebar" class="w-[250px] bg-gray-800 text-gray-300 flex flex-col h-full fixed top-[60px] left-0 transition-all duration-300 z-40">
        <div class="sidebar-header p-5 border-b border-gray-700 flex justify-center relative h-[70px] items-center">
            <button id="sidebar-toggle" class="absolute left-5 text-white bg-transparent border-0 cursor-pointer"><i class="fas fa-bars"></i></button>
            <span id="dashboard-role-label" class="font-bold text-lg">Admin</span>
        </div>
        <nav id="sidebar-nav" class="flex-1 overflow-y-auto">
            <!-- Navigation items injected by JS -->
        </nav>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div id="admin-content-wrapper" class="ml-[250px] w-[calc(100%-250px)] h-full transition-all duration-300 bg-gray-100">
        <div id="admin-content" class="p-8 h-full overflow-y-auto">
            <!-- Dynamic Content (Users, Dashboard, Reports) goes here -->
            <h2>Welcome Admin</h2>
        </div>
    </div>
</section>