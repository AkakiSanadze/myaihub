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
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }

    // Optimized favicon loading with better URL handling
    const toolCards = document.querySelectorAll('.tool-card');
    const placeholderIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23d0d0d0"/></svg>';

    toolCards.forEach(card => {
        const img = card.querySelector('.tool-logo');
        if (!img) return;

        try {
            // Use card's resolved href directly
            const resolvedURL = new URL(card.href);
            const domain = resolvedURL.origin;
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}`;
            
            img.src = faviconUrl;
            
            img.onerror = function() {
                this.onerror = null;
                this.src = placeholderIcon;
            };
        } catch (e) {
            console.error(`Failed to process URL: ${card.href}`, e);
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

    // Generate consistent UUIDs for tools using href
    function generateToolId(href) {
        // Create hash from href
        let hash = 0;
        for (let i = 0; i < href.length; i++) {
            const char = href.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'tool-' + Math.abs(hash).toString(16);
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
        // Generate consistent ID based on href
        if (!card.dataset.toolId && card.href) {
            card.dataset.toolId = generateToolId(card.href);
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

    // 2. Add event listener using delegation to the entire container
    // This ensures it works for all cards including Recently Added section and Favorites
    document.querySelector('.container').addEventListener('click', (event) => {
        // Check if the clicked element is a favorite button
        if (event.target.classList.contains('favorite-btn')) {
            event.preventDefault(); // Prevent the link navigation if clicking the button
            event.stopPropagation(); // Stop the event from bubbling further

            const toolCard = event.target.closest('.tool-card');
            if (toolCard?.dataset?.toolId) {
                toggleFavorite(toolCard.dataset.toolId);
            }
        }
    });

    // 3. Initial load of favorites
    updateFavoritesUI();

    // --- Main initialization for all features ---
    // Wait for the page to be fully loaded
    window.addEventListener('load', function() {
        console.log('Window fully loaded - initializing all features');
        
        // Enhanced search functionality
        const searchInput = document.getElementById('search-input');
        const allTools = Array.from(document.querySelectorAll('.tool-card'));
        const allCategories = Array.from(document.querySelectorAll('.category-section'));
        const noResultsNotice = document.getElementById('no-results-notice') || document.createElement('div');
        
        // Prebuild search index
        const searchIndex = allTools.map(tool => {
            const name = tool.querySelector('.tool-name')?.textContent?.toLowerCase() || '';
            const alt = tool.querySelector('img')?.getAttribute('alt')?.toLowerCase() || '';
            const href = tool.getAttribute('href')?.toLowerCase() || '';
            const category = tool.closest('.category-section')?.querySelector('.category-title')?.textContent?.toLowerCase() || '';
            
            return {
                element: tool,
                name,
                alt,
                href,
                category
            };
        });
        
        // Create no-results notice if it doesn't exist
        if (!document.getElementById('no-results-notice')) {
            noResultsNotice.id = 'no-results-notice';
            noResultsNotice.style.display = 'none';
            noResultsNotice.style.textAlign = 'center';
            noResultsNotice.style.padding = '20px';
            noResultsNotice.style.margin = '20px auto';
            noResultsNotice.style.color = 'var(--text-color)';
            noResultsNotice.style.backgroundColor = 'var(--card-background)';
            noResultsNotice.style.borderRadius = '12px';
            noResultsNotice.style.boxShadow = '0 2px 10px var(--shadow-color)';
            noResultsNotice.style.maxWidth = '600px';
            noResultsNotice.textContent = 'No results found. Try a different search term.';
            document.querySelector('.container').insertBefore(noResultsNotice, document.getElementById('tools-container'));
        }
        
        function filterTools() {
            const term = searchInput.value.trim().toLowerCase();
            
            // Show all if empty search
            if (!term) {
                allTools.forEach(tool => tool.style.display = '');
                allCategories.forEach(category => category.style.display = '');
                noResultsNotice.style.display = 'none';
                return;
            }
            
            // Reset visibility
            allTools.forEach(tool => tool.style.display = 'none');
            allCategories.forEach(category => category.style.display = 'none');
            
            let matchCount = 0;
            
            // Search logic
            searchIndex.forEach(item => {
                const matchesName = item.name.includes(term);
                const matchesAlt = item.alt.includes(term);
                const matchesHref = item.href.includes(term);
                const matchesCategory = item.category.includes(term);
                
                if (matchesName || matchesAlt || matchesHref || matchesCategory) {
                    item.element.style.display = '';
                    matchCount++;
                    
                    // Show parent category
                    const categorySection = item.element.closest('.category-section');
                    if (categorySection) {
                        categorySection.style.display = '';
                    }
                }
            });
            
            // Show favorites section if it has visible tools
            const favoritesSection = document.getElementById('favorites-section');
            if (favoritesSection) {
                const hasVisibleTools = Array.from(favoritesSection.querySelectorAll('.tool-card'))
                    .some(tool => tool.style.display !== 'none');
                favoritesSection.style.display = hasVisibleTools ? 'block' : 'none';
            }
            
            // Show/hide no results message
            noResultsNotice.style.display = matchCount > 0 ? 'none' : 'block';
        }
        
        // Set up event listeners
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                // Debounce with requestAnimationFrame for smoother performance
                if (this.timer) cancelAnimationFrame(this.timer);
                this.timer = requestAnimationFrame(() => filterTools());
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') filterTools();
            });
        }
        
        console.log('In-place filter functionality initialized successfully');
    });
});
