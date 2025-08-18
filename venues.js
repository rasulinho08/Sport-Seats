// Enhanced Venue Listing with Map Integration

class VenueMapManager {
    constructor() {
        this.venues = [];
        this.filteredVenues = [];
        this.favorites = new Set(JSON.parse(localStorage.getItem('venue-favorites') || '[]'));
        this.isMapView = false;
        this.showFavoritesOnly = false;
        this.map = null;
        this.markers = [];
        this.markerGroup = null;
        this.currentTileLayer = null;
        this.userLocationMarker = null;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadVenues();
        this.updateFavoriteButtons();
        this.updateResultsCount();
    }
    
    cacheElements() {
        // Search and filter elements
        this.searchInput = document.getElementById('venue-search');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.capacityFilter = document.getElementById('capacity-filter');
        this.sportFilter = document.getElementById('sport-filter');
        this.viewToggle = document.getElementById('view-toggle');
        this.favoritesToggle = document.getElementById('favorites-toggle');
        this.clearAllFiltersBtn = document.getElementById('clear-all-filters');
        
        // Display elements
        this.venuesList = document.getElementById('venues-list');
        this.mapContainer = document.getElementById('map-container');
        this.resultsCount = document.getElementById('results-count');
        this.noResults = document.getElementById('no-results');
        
        // Map elements
        this.mapElement = document.getElementById('venue-map');
        this.fitBoundsBtn = document.getElementById('fit-bounds-btn');
        this.satelliteToggle = document.getElementById('satellite-toggle');
        this.locateBtn = document.getElementById('locate-btn');
        
        // Mobile menu
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.navLinks = document.getElementById('nav-links');
    }
    
    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.clearSearchBtn.addEventListener('click', this.clearSearch.bind(this));
        
        // Filter functionality
        this.capacityFilter.addEventListener('change', this.handleFilter.bind(this));
        this.sportFilter.addEventListener('change', this.handleFilter.bind(this));
        
        // View toggles
        this.viewToggle.addEventListener('click', this.toggleMapView.bind(this));
        this.favoritesToggle.addEventListener('click', this.toggleFavoritesOnly.bind(this));
        this.clearAllFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));
        
        // Map controls
        this.fitBoundsBtn.addEventListener('click', this.fitMapBounds.bind(this));
        this.satelliteToggle.addEventListener('click', this.toggleSatelliteView.bind(this));
        this.locateBtn.addEventListener('click', this.locateUser.bind(this));
        
        // Mobile menu
        this.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Venue interactions
        this.venuesList.addEventListener('click', this.handleVenueClick.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }
    
    loadVenues() {
        const venueElements = document.querySelectorAll('.venue-item');
        this.venues = Array.from(venueElements).map((element, index) => {
            const capacity = parseInt(element.dataset.capacity);
            const sports = element.dataset.sports.split(',');
            const location = element.dataset.location;
            const lat = parseFloat(element.dataset.lat);
            const lng = parseFloat(element.dataset.lng);
            const venueId = element.dataset.venueId;
            const name = element.querySelector('h3').textContent;
            const description = element.querySelector('p').textContent;
            
            return {
                id: venueId,
                element,
                name,
                description,
                location,
                capacity,
                sports,
                lat,
                lng,
                index
            };
        });
        
        this.filteredVenues = [...this.venues];
    }
    
    initializeMap() {
        if (this.map) return;
        
        // Initialize the map
        this.map = L.map('venue-map', {
            center: [39.8283, -98.5795], // Center of USA
            zoom: 4,
            zoomControl: false
        });
        
        // Add zoom control to top right
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);
        
        // Add default tile layer (OpenStreetMap)
        this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Create marker group
        this.markerGroup = L.layerGroup().addTo(this.map);
        
        // Add venue markers
        this.addVenueMarkers();
        
        // Fit map to show all venues
        this.fitMapBounds();
        
        // Hide loading indicator
        const loadingElement = this.mapElement.querySelector('.map-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    addVenueMarkers() {
        this.markers = [];
        
        this.venues.forEach((venue, index) => {
            // Create custom marker icon
            const markerIcon = L.divIcon({
                className: 'venue-marker',
                html: `<div class="venue-marker">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });
            
            // Create marker
            const marker = L.marker([venue.lat, venue.lng], {
                icon: markerIcon
            });
            
            // Create popup content
            const popupContent = this.createPopupContent(venue);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'venue-popup'
            });
            
            // Add click event to highlight venue in list
            marker.on('click', () => {
                this.highlightVenue(venue.id);
            });
            
            // Store reference
            venue.marker = marker;
            this.markers.push(marker);
            
            // Add to marker group
            this.markerGroup.addLayer(marker);
        });
    }
    
    createPopupContent(venue) {
        const sportsHtml = venue.sports.map(sport => 
            `<span class="sport-tag">${sport.charAt(0).toUpperCase() + sport.slice(1)}</span>`
        ).join('');
        
        return `
            <div class="venue-popup">
                <h3>${venue.name}</h3>
                <p>${venue.description}</p>
                <div class="venue-popup-details">
                    <span><i class="fas fa-map-marker-alt"></i> ${venue.location}</span>
                    <span><i class="fas fa-users"></i> ${venue.capacity.toLocaleString()}</span>
                </div>
                <div class="venue-popup-sports">
                    ${sportsHtml}
                </div>
                <div class="venue-popup-actions">
                    <a href="#" class="btn-primary">View Events</a>
                    <button class="btn-outline" onclick="venueMapManager.showVenueInList('${venue.id}')">
                        <i class="fas fa-list"></i> Show in List
                    </button>
                </div>
            </div>
        `;
    }
    
    updateMapMarkers() {
        // Clear existing markers
        this.markerGroup.clearLayers();
        
        // Add markers for filtered venues only
        this.filteredVenues.forEach((venue, index) => {
            if (venue.marker) {
                // Update marker number
                const markerIcon = L.divIcon({
                    className: 'venue-marker',
                    html: `<div class="venue-marker">${index + 1}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15]
                });
                venue.marker.setIcon(markerIcon);
                
                // Add to marker group
                this.markerGroup.addLayer(venue.marker);
            }
        });
        
        // Fit bounds if there are visible venues
        if (this.filteredVenues.length > 0) {
            this.fitMapBounds();
        }
    }
    
    fitMapBounds() {
        if (!this.map || this.filteredVenues.length === 0) return;
        
        const group = new L.featureGroup(this.filteredVenues.map(venue => venue.marker));
        this.map.fitBounds(group.getBounds(), {
            padding: [20, 20],
            maxZoom: 10
        });
    }
    
    toggleSatelliteView() {
        if (!this.map) return;
        
        // Remove current tile layer
        this.map.removeLayer(this.currentTileLayer);
        
        if (this.satelliteToggle.classList.contains('active')) {
            // Switch to street view
            this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            });
            this.satelliteToggle.classList.remove('active');
        } else {
            // Switch to satellite view (using Esri satellite tiles)
            this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19
            });
            this.satelliteToggle.classList.add('active');
        }
        
        this.currentTileLayer.addTo(this.map);
    }
    
    locateUser() {
        if (!this.map) return;
        
        this.locateBtn.classList.add('active');
        this.locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        this.map.locate({
            setView: true,
            maxZoom: 12,
            timeout: 10000
        });
        
        this.map.on('locationfound', (e) => {
            // Remove existing user location marker
            if (this.userLocationMarker) {
                this.map.removeLayer(this.userLocationMarker);
            }
            
            // Add user location marker
            this.userLocationMarker = L.marker(e.latlng, {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<div style="background: #007bff; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(this.map);
            
            this.userLocationMarker.bindPopup('Your Location').openPopup();
            
            this.locateBtn.classList.remove('active');
            this.locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
            
            this.showNotification('Location found!', 'success');
        });
        
        this.map.on('locationerror', (e) => {
            this.locateBtn.classList.remove('active');
            this.locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
            this.showNotification('Unable to find your location', 'error');
        });
    }
    
    highlightVenue(venueId) {
        // Remove existing highlights
        document.querySelectorAll('.venue-item.highlighted').forEach(item => {
            item.classList.remove('highlighted');
        });
        
        // Highlight the venue
        const venueElement = document.querySelector(`[data-venue-id="${venueId}"]`);
        if (venueElement) {
            venueElement.classList.add('highlighted');
            
            // Scroll to venue if in list view
            if (!this.isMapView) {
                venueElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }
    
    showVenueInList(venueId) {
        // Switch to list view if in map view
        if (this.isMapView) {
            this.toggleMapView();
        }
        
        // Highlight and scroll to venue
        this.highlightVenue(venueId);
    }
    
    showVenueOnMap(venueId) {
        const venue = this.venues.find(v => v.id === venueId);
        if (!venue || !venue.marker) return;
        
        // Switch to map view if not already
        if (!this.isMapView) {
            this.toggleMapView();
        }
        
        // Wait for map to be initialized
        setTimeout(() => {
            if (this.map) {
                // Center map on venue
                this.map.setView([venue.lat, venue.lng], 15);
                
                // Open popup
                venue.marker.openPopup();
                
                // Highlight marker temporarily
                const markerElement = venue.marker.getElement();
                if (markerElement) {
                    markerElement.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        markerElement.style.transform = '';
                    }, 1000);
                }
            }
        }, 300);
    }
    
    // Enhanced search and filter methods
    handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        this.clearSearchBtn.style.display = query ? 'flex' : 'none';
        this.filterVenues();
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.clearSearchBtn.style.display = 'none';
        this.filterVenues();
        this.searchInput.focus();
    }
    
    handleFilter() {
        this.filterVenues();
    }
    
    filterVenues() {
        const query = this.searchInput.value.toLowerCase().trim();
        const capacityFilter = this.capacityFilter.value;
        const sportFilter = this.sportFilter.value;
        
        this.filteredVenues = this.venues.filter(venue => {
            // Text search
            const matchesSearch = !query || 
                venue.name.toLowerCase().includes(query) ||
                venue.location.toLowerCase().includes(query) ||
                venue.description.toLowerCase().includes(query);
            
            // Capacity filter
            let matchesCapacity = true;
            if (capacityFilter) {
                switch (capacityFilter) {
                    case 'small':
                        matchesCapacity = venue.capacity < 20000;
                        break;
                    case 'medium':
                        matchesCapacity = venue.capacity >= 20000 && venue.capacity <= 50000;
                        break;
                    case 'large':
                        matchesCapacity = venue.capacity > 50000;
                        break;
                }
            }
            
            // Sport filter
            const matchesSport = !sportFilter || venue.sports.includes(sportFilter);
            
            // Favorites filter
            const matchesFavorites = !this.showFavoritesOnly || this.favorites.has(venue.id);
            
            return matchesSearch && matchesCapacity && matchesSport && matchesFavorites;
        });
        
        this.updateDisplay();
        this.updateResultsCount();
        
        // Update map markers if map is visible
        if (this.isMapView && this.map) {
            this.updateMapMarkers();
        }
    }
    
    updateDisplay() {
        // Hide all venues first
        this.venues.forEach(venue => {
            venue.element.style.display = 'none';
        });
        
        // Show filtered venues
        if (this.filteredVenues.length > 0) {
            this.filteredVenues.forEach((venue, index) => {
                venue.element.style.display = 'block';
                venue.element.style.animationDelay = `${index * 0.1}s`;
            });
            this.noResults.style.display = 'none';
        } else {
            this.noResults.style.display = 'block';
        }
    }
    
    updateResultsCount() {
        const count = this.filteredVenues.length;
        const text = count === 1 ? '1 venue found' : `${count} venues found`;
        this.resultsCount.textContent = text;
    }
    
    toggleMapView() {
        this.isMapView = !this.isMapView;
        
        if (this.isMapView) {
            this.mapContainer.style.display = 'block';
            this.venuesList.style.display = 'none';
            this.viewToggle.classList.add('active');
            this.viewToggle.innerHTML = '<i class=\"fas fa-list\"></i><span>List View</span>';
            
            // Initialize map if not already done
            if (!this.map) {
                setTimeout(() => this.initializeMap(), 100);
            } else {
                // Refresh map size and markers
                setTimeout(() => {
                    this.map.invalidateSize();
                    this.updateMapMarkers();
                }, 100);
            }
        } else {
            this.mapContainer.style.display = 'none';
            this.venuesList.style.display = 'grid';
            this.viewToggle.classList.remove('active');
            this.viewToggle.innerHTML = '<i class=\"fas fa-map\"></i><span>Map View</span>';
        }
    }
    
    toggleFavoritesOnly() {
        this.showFavoritesOnly = !this.showFavoritesOnly;
        
        if (this.showFavoritesOnly) {
            this.favoritesToggle.classList.add('active');
            this.favoritesToggle.innerHTML = '<i class=\"fas fa-heart\"></i><span>Show All</span>';
        } else {
            this.favoritesToggle.classList.remove('active');
            this.favoritesToggle.innerHTML = '<i class=\"fas fa-heart\"></i><span>Show Favorites Only</span>';
        }
        
        this.filterVenues();
    }
    
    clearAllFilters() {
        this.searchInput.value = '';
        this.capacityFilter.value = '';
        this.sportFilter.value = '';
        this.clearSearchBtn.style.display = 'none';
        
        if (this.showFavoritesOnly) {
            this.toggleFavoritesOnly();
        }
        
        this.filterVenues();
        this.searchInput.focus();
    }
    
    handleVenueClick(event) {
        const target = event.target.closest('.favorite-btn, .view-map-btn');
        if (!target) return;
        
        if (target.classList.contains('favorite-btn')) {
            this.toggleFavorite(target);
        } else if (target.classList.contains('view-map-btn')) {
            this.showVenueOnMap(target.dataset.venue);
        }
    }
    
    toggleFavorite(button) {
        const venueId = button.dataset.venue;
        const icon = button.querySelector('i');
        
        if (this.favorites.has(venueId)) {
            this.favorites.delete(venueId);
            button.classList.remove('active');
            icon.className = 'far fa-heart';
            button.title = 'Add to Favorites';
            this.showNotification('Removed from favorites', 'info');
        } else {
            this.favorites.add(venueId);
            button.classList.add('active');
            icon.className = 'fas fa-heart';
            button.title = 'Remove from Favorites';
            this.showNotification('Added to favorites', 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('venue-favorites', JSON.stringify([...this.favorites]));
        
        // Update display if showing favorites only
        if (this.showFavoritesOnly) {
            this.filterVenues();
        }
        
        // Add animation
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }
    
    updateFavoriteButtons() {
        this.favorites.forEach(venueId => {
            const button = document.querySelector(`[data-venue=\"${venueId}\"]`);
            if (button && button.classList.contains('favorite-btn')) {
                button.classList.add('active');
                button.querySelector('i').className = 'fas fa-heart';
                button.title = 'Remove from Favorites';
            }
        });
    }
    
    toggleMobileMenu() {
        this.navLinks.classList.toggle('active');
        const icon = this.mobileMenuBtn.querySelector('i');
        
        if (this.navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }
    
    handleKeyboard(event) {
        // Escape key to close mobile menu
        if (event.key === 'Escape' && this.navLinks.classList.contains('active')) {
            this.toggleMobileMenu();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.searchInput.focus();
        }
        
        // Ctrl/Cmd + M to toggle map view
        if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
            event.preventDefault();
            this.toggleMapView();
        }
    }
    
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.navLinks.classList.contains('active')) {
            this.toggleMobileMenu();
        }
        
        // Invalidate map size if map is visible
        if (this.map && this.isMapView) {
            setTimeout(() => this.map.invalidateSize(), 100);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class=\"fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}\"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize venue map manager
    window.venueMapManager = new VenueMapManager();
    
    // Add loading states
    const venueItems = document.querySelectorAll('.venue-item');
    venueItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add CSS for highlighted venues
    const style = document.createElement('style');
    style.textContent = `
        .venue-item.highlighted {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2), 0 8px 10px -6px rgba(37, 99, 235, 0.1);
            border: 2px solid var(--primary-color);
        }
        
        .venue-item.highlighted::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, var(--primary-color), var(--primary-hover));
            border-radius: var(--border-radius-xl);
            z-index: -1;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Enhanced Venue Listing with Map Integration initialized successfully!');
});

window.addEventListener("load", () => {
  document.querySelectorAll("h1, h2, h3, p, div, span")
    .forEach((el, i) => {
      if (!el.closest(".newsletter-section")) { // skip anything inside
        el.style.opacity = 0;
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.5s ease";
        setTimeout(() => {
          el.style.opacity = 1;
          el.style.transform = "translateY(0)";
        }, i * 30);
      }
    });
});
