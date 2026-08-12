// Initialize Lucide Icons
lucide.createIcons();

// Sidebar Toggle Logic
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const overlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
}

// Open/Close via Hamburger (Top Icon)
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent document click from immediately closing it
    toggleSidebar();
});

// Close via Overlay
if (overlay) {
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

// Dark Mode Toggle
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
let isDark = false;

themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('dark');
    
    // Switch icon between moon (for switching to dark) and sun (for switching to light)
    if (isDark) {
        themeIcon.setAttribute('data-lucide', 'sun');
    } else {
        themeIcon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons(); // re-render the icon
});
