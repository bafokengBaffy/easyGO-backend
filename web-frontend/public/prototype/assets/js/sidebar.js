// sidebar.js - Sidebar functionality with working mobile toggle

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sidebar.js loaded');
    
    // Get elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    // Check if elements exist
    if (!menuToggle) {
        console.log('Menu toggle button not found');
        return;
    }
    
    if (!sidebar) {
        console.log('Sidebar not found');
        return;
    }
    
    console.log('Sidebar elements found');
    
    // Toggle sidebar function
    function toggleSidebar() {
        console.log('Toggling sidebar');
        sidebar.classList.toggle('active');
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        // Toggle menu icon
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    }
    
    // Close sidebar function
    function closeSidebar() {
        console.log('Closing sidebar');
        sidebar.classList.remove('active');
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    }
    
    // Add click event to menu toggle
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Add click event to overlay to close sidebar
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }
    
    // Close sidebar when clicking on a nav link (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Desktop view - ensure sidebar is visible
            sidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
    
    // Highlight active menu item based on current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Current page:', currentPath);
    
    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && href === currentPath) {
            link.classList.add('active');
            console.log('Active link:', href);
        }
    });
});
