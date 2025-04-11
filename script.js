// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Update theme switch icon based on current theme
function updateThemeIcon() {
    const themeSwitch = document.querySelector('.theme-switch');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        themeSwitch.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
        themeSwitch.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
}

// Toggle theme function
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

// Initialize theme icon and update footer year
document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon();

    // Update footer year
    const currentYear = new Date().getFullYear();
    const footerText = document.querySelector('footer p');
    if (footerText) {
        footerText.innerHTML = `&copy; ${currentYear} AI Hub Directory | A curated collection of the best AI services`;
    }

    // Favicon loading
    const toolCards = document.querySelectorAll('.tool-card');
    const placeholderIcon = '/api/placeholder/64/64';

    toolCards.forEach(card => {
        const link = card.href;
        const img = card.querySelector('.tool-logo');

        if (link && img && link !== window.location.href + '#') {
            try {
                const absoluteLink = new URL(link, window.location.origin).href;
                const url = new URL(absoluteLink);
                const domain = url.origin;
                const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}`;
                
                img.src = faviconUrl;
                
                img.onerror = function() {
                    this.onerror = null;
                    this.src = placeholderIcon;
                };
            } catch (e) {
                console.error(`Failed to process URL: ${link}`, e);
                img.src = placeholderIcon;
            }
        } else if (img) {
            img.src = placeholderIcon;
        }
    });
}); 