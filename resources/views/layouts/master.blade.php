<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'POS System')</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Use Vite to compile CSS and JS -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 h-screen overflow-hidden flex flex-col">

    <!-- HEADER (Shared) -->
    <header id="main-header" class="bg-white p-4 h-[60px] flex justify-between items-center shadow-sm fixed w-full top-0 z-50">
        <div class="logo text-xl font-bold text-gray-800">JayLeeBay 🍔</div>
        <div class="user-controls flex gap-4 items-center">
            <span id="header-username" class="font-medium">Guest</span>
            <button id="global-logout-btn" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Logout</button>
        </div>
    </header>

    <!-- CONTENT WRAPPER -->
    <main class="mt-[60px] h-[calc(100vh-60px)] w-full">
        @yield('content')
    </main>

    <!-- GLOBAL MODALS -->
    @include('components.modals')

</body>
</html>