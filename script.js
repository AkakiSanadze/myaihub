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

    // 2. Add event listener using delegation to the entire container
    // This ensures it works for all cards including Recently Added section and Favorites
    document.querySelector('.container').addEventListener('click', (event) => {
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

    // --- Handle new tools and recently added section ---
    // Function to find new tools and return info about them
    function findNewTools() {
        const NEW_DAYS = 14; // Tools added within the last 14 days are considered new
        const today = new Date();
        
        // Get all tool cards
        const allTools = document.querySelectorAll('.tool-card');
        const recentlyAddedTools = [];
        
        allTools.forEach(tool => {
            // Get the date when the tool was added (from data-added attribute)
            const addedDateStr = tool.getAttribute('data-added');
            
            // If the tool has a data-added attribute
            if (addedDateStr) {
                const addedDate = new Date(addedDateStr);
                const diffTime = Math.abs(today - addedDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // If the tool was added within the last NEW_DAYS days
                if (diffDays <= NEW_DAYS) {
                    // Remember this tool for badges and the recently added section
                    recentlyAddedTools.push({ 
                        element: tool, 
                        date: addedDate 
                    });
                }
            }
        });
        
        return recentlyAddedTools;
    }
    
    // Function to add NEW badges to recently added tools
    function addNewBadgesToTools(newTools) {
        newTools.forEach(toolInfo => {
            // Add a NEW badge to the tool if it doesn't already have one
            if (!toolInfo.element.querySelector('.new-tool-badge')) {
                const badge = document.createElement('span');
                badge.className = 'new-tool-badge';
                badge.textContent = 'NEW';
                toolInfo.element.appendChild(badge);
            }
        });
    }
    
    // Function to create the Recently Added section
    function createRecentlyAddedSection(newTools) {
        // If we have recently added tools
        if (newTools.length > 0) {
            // Sort tools by date (newest first)
            const sortedTools = [...newTools].sort((a, b) => b.date - a.date);
            
            // Create the Recently Added section
            const recentlyAddedSection = document.createElement('div');
            recentlyAddedSection.className = 'category-section';
            recentlyAddedSection.id = 'recently-added-section';
            
            // Create the section title
            const titleHTML = `
                <h2 class="category-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    Recently Added
                </h2>
            `;
            recentlyAddedSection.innerHTML = titleHTML;
            
            // Create the grid to hold the tools
            const grid = document.createElement('div');
            grid.className = 'tools-grid';
            
            // Add the recently added tools to the grid (clone them)
            sortedTools.forEach(toolInfo => {
                const clone = toolInfo.element.cloneNode(true);
                grid.appendChild(clone);
            });
            
            // Add the grid to the section
            recentlyAddedSection.appendChild(grid);
            
            // Add the section to the page (after the search container)
            const toolsContainer = document.getElementById('tools-container');
            const container = document.querySelector('.container');
            if (toolsContainer && container) {
                container.insertBefore(recentlyAddedSection, toolsContainer);
            }
        }
    }
    
    // --- Main initialization for all features ---
    // Wait for the page to be fully loaded
    window.addEventListener('load', function() {
        console.log('Window fully loaded - initializing all features');
        
        // Initialize new tools functionality
        const newTools = findNewTools();
        addNewBadgesToTools(newTools);
        createRecentlyAddedSection(newTools);
        
        // Initialize search functionality
        
        // Get the search input element
        const searchInput = document.getElementById('search-input');
        
        // Cache all tool cards and categories for better performance
        const allTools = Array.from(document.querySelectorAll('.tool-card'));
        const allCategories = Array.from(document.querySelectorAll('.category-section'));
        
        // Added for no-results notification
        let noResultsNotice = document.createElement('div');
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
        
        // In-place filter function
        function filterTools() {
            // Get the search term and convert to lowercase
            const term = searchInput.value.trim().toLowerCase();
            console.log('Filtering for:', term);
            
            // If search is empty, show all tools and categories
            if (!term) {
                allTools.forEach(tool => tool.style.display = '');
                allCategories.forEach(category => category.style.display = '');
                noResultsNotice.style.display = 'none';
                return;
            }
            
            // Count how many tools match the search term
            let matchCount = 0;
            
            // Filter the tools based on search term
            allTools.forEach(tool => {
                // Get all text content from the tool
                const toolName = tool.querySelector('.tool-name')?.textContent?.toLowerCase() || '';
                const imgAlt = tool.querySelector('img')?.getAttribute('alt')?.toLowerCase() || '';
                const href = tool.getAttribute('href')?.toLowerCase() || '';
                
                // Special case for searching 'new' - only match tools with the data-added attribute
                if (term === 'new') {
                    const isMatch = tool.hasAttribute('data-added');
                    
                    // Show or hide the tool
                    if (isMatch) {
                        tool.style.display = '';
                        matchCount++;
                    } else {
                        tool.style.display = 'none';
                    }
                    return; // Skip the rest of the function for this tool
                }
                
                // Special case for Gemini and other tools that might need exact matching
                const geminiPattern = /\bgemini\b/i;
                const isGemini = term.match(geminiPattern) && (toolName.match(geminiPattern) || imgAlt.match(geminiPattern));
                
                // For all other searches, check if any content matches the search term
                // We exclude badge text from the search to avoid false matches
                const isMatch = 
                    isGemini || 
                    toolName.includes(term) || 
                    imgAlt.includes(term) || 
                    href.includes(term);
                
                // Show or hide the tool
                if (isMatch) {
                    tool.style.display = '';
                    matchCount++;
                    console.log('Match found:', toolName || imgAlt);
                } else {
                    tool.style.display = 'none';
                }
            });
            
            // For each category, check if it has any visible tools
            allCategories.forEach(category => {
                const visibleTools = category.querySelectorAll('.tool-card:not([style*="display: none"])');
                
                // Show the category if it has visible tools, otherwise hide it
                if (visibleTools.length > 0) {
                    category.style.display = '';
                } else {
                    category.style.display = 'none';
                }
            });
            
            // Show or hide the no-results message
            if (matchCount === 0) {
                noResultsNotice.style.display = 'block';
            } else {
                noResultsNotice.style.display = 'none';
            }
            
            console.log(`Found ${matchCount} matches out of ${allTools.length} tools`);
        }
        
        // Set up event listeners
        
        if (searchInput) {
            // Search on Enter key
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    filterTools();
                }
            });
            
            // Live search with debounce
            let debounceTimer;
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(filterTools, 300);
            });
        }
        
        console.log('In-place filter functionality initialized successfully');
    });
});
