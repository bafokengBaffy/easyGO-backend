// @ts-nocheck
// main.js - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Load user data
    loadUserData();
    
    // Initialize tooltips
    initTooltips();
});

function loadUserData() {
    const userType = localStorage.getItem('userType') || 'rider';
    const userData = JSON.parse(localStorage.getItem('userData')) || getDefaultUser(userType);
    
    // Update UI with user data
    updateUserInterface(userData);
}

function getDefaultUser(type) {
    const users = {
        rider: {
            name: 'Thabo Nkosi',
            email: 'thabo.nkosi@email.co.za',
            phone: '+27 71 234 5678',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            location: 'Johannesburg, Gauteng'
        },
        driver: {
            name: 'Sipho Dlamini',
            email: 'sipho.d@easygo.co.za',
            phone: '+27 82 345 6789',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
            vehicle: 'Toyota Corolla - GP 123-456',
            rating: 4.8
        }
    };
    
    return users[type] || users.rider;
}

function updateUserInterface(userData) {
    // Update user name
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        if (el) el.textContent = userData.name;
    });
    
    // Update user avatar
    const avatarElements = document.querySelectorAll('.user-avatar');
    avatarElements.forEach(el => {
        if (el && userData.avatar) el.src = userData.avatar;
    });
}

function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) tooltip.remove();
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}
