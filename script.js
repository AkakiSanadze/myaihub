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

    // --- Favorites Functionality ---
    const toolsContainer = document.getElementById('tools-container');
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesGrid = document.getElementById('favorites-grid');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const allToolCards = document.querySelectorAll('.tool-card'); // Get all cards initially

    const FAVORITES_KEY = 'aiHubFavorites';

    // Function to get favorites from localStorage
    function getFavorites() {
        const favorites = localStorage.getItem(FAVORITES_KEY);
        return favorites ? JSON.parse(favorites) : [];
    }

    // Function to save favorites to localStorage
    function saveFavorites(favorites) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }

    // Function to generate a simple ID from text (like tool name or href)
    function generateToolId(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Function to update the UI based on current favorites
    function updateFavoritesUI() {
        const favorites = getFavorites();
        favoritesGrid.innerHTML = ''; // Clear current favorites grid

        // Reset all favorite buttons first
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.textContent = '☆'; // Empty star
            btn.classList.remove('active');
            btn.setAttribute('aria-label', 'Add to favorites');
        });

        if (favorites.length === 0) {
            favoritesSection.style.display = 'none'; // Hide section if no favorites
            noFavoritesMessage.style.display = 'block'; // Show 'no favorites' message (though section is hidden)
        } else {
            favoritesSection.style.display = 'block'; // Show section
            noFavoritesMessage.style.display = 'none'; // Hide 'no favorites' message

            favorites.forEach(toolId => {
                const originalCard = document.querySelector(`.tool-card[data-tool-id="${toolId}"]`);
                if (originalCard) {
                    // Clone the card for the favorites section
                    const clonedCard = originalCard.cloneNode(true);
                    // Ensure the cloned button also reflects the active state
                    const clonedBtn = clonedCard.querySelector('.favorite-btn');
                    if (clonedBtn) {
                        clonedBtn.textContent = '★'; // Filled star
                        clonedBtn.classList.add('active');
                        clonedBtn.setAttribute('aria-label', 'Remove from favorites');
                    }
                    favoritesGrid.appendChild(clonedCard);

                    // Update the original card's button state as well
                    const originalBtn = originalCard.querySelector('.favorite-btn');
                    if (originalBtn) {
                         originalBtn.textContent = '★'; // Filled star
                         originalBtn.classList.add('active');
                         originalBtn.setAttribute('aria-label', 'Remove from favorites');
                    }
                }
            });
        }
    }

    // Function to toggle a favorite
    function toggleFavorite(toolId) {
        let favorites = getFavorites();
        const index = favorites.indexOf(toolId);

        if (index > -1) {
            favorites.splice(index, 1); // Remove from favorites
        } else {
            favorites.push(toolId); // Add to favorites
        }

        saveFavorites(favorites);
        updateFavoritesUI();
    }

    // --- Initialization ---

    // 1. Add favorite buttons and data-tool-id to all cards
    allToolCards.forEach(card => {
        // Generate an ID if it doesn't exist (using href as a base)
        if (!card.dataset.toolId) {
            const toolNameElement = card.querySelector('.tool-name');
            const idBase = toolNameElement ? toolNameElement.textContent : card.href;
             if (idBase) {
                 card.dataset.toolId = generateToolId(idBase);
             }
        }

        // Add favorite button if it doesn't exist
        if (!card.querySelector('.favorite-btn')) {
            const favButton = document.createElement('button');
            favButton.className = 'favorite-btn';
            favButton.setAttribute('aria-label', 'Add to favorites');
            favButton.innerHTML = '☆'; // Default empty star
            // Insert button before the image or as the first child if no image
            const img = card.querySelector('.tool-logo');
            if (img) {
                card.insertBefore(favButton, img);
            } else {
                card.prepend(favButton);
            }
        }
    });

    // 2. Add event listener using delegation
    toolsContainer.addEventListener('click', (event) => {
        // Check if the clicked element is a favorite button
        if (event.target.classList.contains('favorite-btn')) {
            event.preventDefault(); // Prevent the link navigation if clicking the button
            event.stopPropagation(); // Stop the event from bubbling further

            const toolCard = event.target.closest('.tool-card');
            if (toolCard && toolCard.dataset.toolId) {
                toggleFavorite(toolCard.dataset.toolId);
            }
        }
    });

    // 3. Initial load of favorites
    updateFavoritesUI();

});
