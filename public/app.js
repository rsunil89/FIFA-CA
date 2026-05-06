const rs_state = {
    map: null,
    markers: [],
    allData: [],
    filteredData: [],
    activeFilters: {
        type: 'all',
        country: 'all',
        search: ''
    },
    showStadiums: true,
    showHotels: true,
    showRestaurants: true,
    showAttractions: true,
    routeStops: [],
    routeRenderer: null,
    infoWindow: null,
    geocoder: null,
    directionsService: null
};

const rs_BASE_PATH = window.location.pathname.includes('/FIFA-CA/') ? '/FIFA-CA' : '';

async function rs_initApp() {
    try {
        rs_showLoading(true);
        await rs_loadData();
        rs_initMap();
        rs_setupEventListeners();
        rs_renderContent();
        rs_setupRoutePlanner();
        rs_showLoading(false);
        console.log('World Cup 2026 app initialized successfully!');
    } catch (error) {
        console.error('Error initializing app:', error);
        rs_showError('Failed to initialize the application. Please refresh the page.');
        rs_showLoading(false);
    }
}

async function rs_loadData() {
    try {
const response = await fetch('/D00281353/data/worldcup2026.json');        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        
        rs_state.allData = [
            ...jsonData.stadia.map(item => ({ ...item, type: 'stadium' })),
            ...jsonData.hotels.map(item => ({ ...item, type: 'hotel' })),
            ...jsonData.restaurants.map(item => ({ ...item, type: 'restaurant' })),
            ...jsonData.attractions.map(item => ({ ...item, type: 'attraction' }))
        ];
        
        await rs_enhanceWithGooglePlaces();
        
        rs_state.filteredData = [...rs_state.allData];
        
        console.log(`Loaded ${rs_state.allData.length} locations total`);
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

async function rs_enhanceWithGooglePlaces() {
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps not available for Places enhancement');
        return;
    }
    
    const placesService = new google.maps.places.PlacesService(
        document.createElement('div')
    );
    
    const batchSize = 5;
    for (let i = 0; i < rs_state.allData.length; i += batchSize) {
        const batch = rs_state.allData.slice(i, i + batchSize);
        
        const promises = batch.map(item => {
            return new Promise((resolve) => {
                const location = new google.maps.LatLng(item.lat, item.lng);
                
                placesService.nearbySearch({
                    location: location,
                    radius: 100,
                    keyword: item.name
                }, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                        const place = results[0];
                        
                        item.googlePlaceId = place.place_id;
                        
                        if (place.rating && place.rating > 0) {
                            item.googleRating = place.rating;
                        }
                        
                        if (place.vicinity) {
                            item.googleAddress = place.vicinity;
                        }
                        
                        if (place.types) {
                            item.googleTypes = place.types;
                        }
                    }
                    resolve();
                });
            });
        });
        
        await Promise.all(promises);
        
        if (i + batchSize < rs_state.allData.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log('Google Places enhancement complete');
}

function rs_initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps API not loaded');
        rs_showError('Google Maps failed to load. Please check your internet connection.');
        return;
    }
    
    const center = { lat: 39.8283, lng: -98.5795 };
    
    rs_state.map = new google.maps.Map(document.getElementById('rs_map'), {
        center: center,
        zoom: 4,
        styles: rs_getMapStyles(),
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    });
    
    rs_state.infoWindow = new google.maps.InfoWindow();
    
    rs_state.geocoder = new google.maps.Geocoder();
    
    rs_state.directionsService = new google.maps.DirectionsService();
    
    rs_state.routeRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#ff6f00',
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    rs_state.routeRenderer.setMap(rs_state.map);
    
    rs_addMarkers();
    
    console.log('Google Map initialized');
}

function rs_getMapStyles() {
    return [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e3f2fd' }]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
        }
    ];
}

function rs_createCustomMarker(type) {
    const colors = {
        stadium: { bg: '#1565c0', icon: '⚽' },
        hotel: { bg: '#c62828', icon: '🏨' },
        restaurant: { bg: '#e65100', icon: '🍽' },
        attraction: { bg: '#2e7d32', icon: '📍' }
    };
    
    const color = colors[type] || { bg: '#666', icon: '📍' };
    
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color.bg,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10,
        labelOrigin: new google.maps.Point(0, 0)
    };
}

function rs_addMarkers() {
    rs_clearMarkers();
    
    const dataToShow = rs_state.filteredData.filter(item => {
        if (item.type === 'stadium' && !rs_state.showStadiums) return false;
        if (item.type === 'hotel' && !rs_state.showHotels) return false;
        if (item.type === 'restaurant' && !rs_state.showRestaurants) return false;
        if (item.type === 'attraction' && !rs_state.showAttractions) return false;
        return true;
    });
    
    dataToShow.forEach(item => {
        const marker = rs_createMarker(item);
        rs_state.markers.push(marker);
    });
}

function rs_createMarker(item) {
    const icons = {
        stadium: {
            url: 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
                '<circle cx="20" cy="20" r="18" fill="#1565c0" stroke="white" stroke-width="2"/>' +
                '<text x="20" y="25" text-anchor="middle" fill="white" font-size="16">⚽</text>' +
                '</svg>'
            ),
            scaledSize: new google.maps.Size(40, 40)
        },
        hotel: {
            url: 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
                '<circle cx="20" cy="20" r="18" fill="#c62828" stroke="white" stroke-width="2"/>' +
                '<text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🏨</text>' +
                '</svg>'
            ),
            scaledSize: new google.maps.Size(40, 40)
        },
        restaurant: {
            url: 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
                '<circle cx="20" cy="20" r="18" fill="#e65100" stroke="white" stroke-width="2"/>' +
                '<text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🍽</text>' +
                '</svg>'
            ),
            scaledSize: new google.maps.Size(40, 40)
        },
        attraction: {
            url: 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
                '<circle cx="20" cy="20" r="18" fill="#2e7d32" stroke="white" stroke-width="2"/>' +
                '<text x="20" y="25" text-anchor="middle" fill="white" font-size="16">📍</text>' +
                '</svg>'
            ),
            scaledSize: new google.maps.Size(40, 40)
        }
    };
    
    const icon = icons[item.type] || icons.attraction;
    
    const marker = new google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map: rs_state.map,
        icon: icon,
        title: item.name,
        animation: google.maps.Animation.DROP,
        itemData: item
    });
    
    marker.addListener('click', () => {
        rs_showMarkerInfo(marker, item);
    });
    
    return marker;
}

function rs_showMarkerInfo(marker, item) {
    const content = `
        <div style="max-width: 250px; font-family: 'Segoe UI', sans-serif;">
            <h3 style="margin: 0 0 8px; color: #1a237e; font-size: 16px;">${item.name}</h3>
            <p style="margin: 0 0 8px; color: #666; font-size: 13px;">${item.city}, ${item.state || item.country}</p>
            <p style="margin: 0 0 8px; color: #333; font-size: 13px; line-height: 1.4;">${item.description.substring(0, 100)}...</p>
            <button onclick="rs_openModal('${item.id}')" 
                    style="background: #ff6f00; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                View Details
            </button>
        </div>
    `;
    
    rs_state.infoWindow.setContent(content);
    rs_state.infoWindow.open(rs_state.map, marker);
}

function rs_clearMarkers() {
    rs_state.markers.forEach(marker => marker.setMap(null));
    rs_state.markers = [];
}

function rs_applyFilters() {
    const { type, country, search } = rs_state.activeFilters;
    
    let filtered = [...rs_state.allData];
    
    if (type !== 'all') {
        filtered = filtered.filter(item => item.type === type);
    }
    
    if (country !== 'all') {
        filtered = filtered.filter(item => item.country === country);
    }
    
    if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim();
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            item.city.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            (item.cuisine && item.cuisine.toLowerCase().includes(searchLower))
        );
    }
    
    rs_state.filteredData = filtered;
    
    rs_addMarkers();
    
    rs_renderContent();
}

function rs_setFilter(filterName, value) {
    rs_state.activeFilters[filterName] = value;
    rs_applyFilters();
}

function rs_renderContent() {
    const container = document.getElementById('rs_contentGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const dataToShow = rs_state.filteredData.filter(item => {
        if (item.type === 'stadium' && !rs_state.showStadiums) return false;
        if (item.type === 'hotel' && !rs_state.showHotels) return false;
        if (item.type === 'restaurant' && !rs_state.showRestaurants) return false;
        if (item.type === 'attraction' && !rs_state.showAttractions) return false;
        return true;
    });
    
    if (dataToShow.length === 0) {
        container.innerHTML = `
            <div class="rs_flexCenter" style="grid-column: 1/-1; padding: 40px;">
                <p class="rs_text" style="text-align: center; color: #999;">
                    No locations found matching your criteria. Try adjusting your filters.
                </p>
            </div>
        `;
        return;
    }
    
    dataToShow.forEach(item => {
        const card = rs_createCard(item);
        container.appendChild(card);
    });
}

function rs_createCard(item) {
    const card = document.createElement('div');
    card.className = 'rs_card';
    card.setAttribute('data-id', item.id);
    
    const badgeClass = `rs_badge${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
    
    card.innerHTML = `
<img class="rs_cardImage" src="/D00281353/${item.image}" alt="${item.name}"             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22200%22><rect fill=%22%23e0e0e0%22 width=%22800%22 height=%22200%22/><text fill=%22%23999%22 x=%22400%22 y=%22100%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2220%22>Image not available</text></svg>'">
        <div class="rs_cardBody">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h3 class="rs_cardTitle">${item.name}</h3>
                <span class="rs_cardBadge ${badgeClass}">${item.type}</span>
            </div>
            <p class="rs_cardText">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
            <div style="display: flex; gap: 10px; font-size: 0.85rem; color: #666; flex-wrap: wrap;">
                <span>📍 ${item.city}, ${item.state || item.country}</span>
                ${item.rating ? `<span class="rs_rating">★ ${item.rating}</span>` : ''}
                ${item.priceRange ? `<span class="rs_priceRange">${item.priceRange}</span>` : ''}
                ${item.cuisine ? `<span>🍴 ${item.cuisine}</span>` : ''}
                ${item.capacity ? `<span>👥 ${item.capacity.toLocaleString()} seats</span>` : ''}
            </div>
        </div>
        <div class="rs_cardFooter">
            <button class="rs_btn rs_btnPrimary rs_btnSmall" onclick="rs_openModal('${item.id}')">
                View Details
            </button>
            <button class="rs_btn rs_btnSmall" onclick="rs_addToRoute('${item.id}')" 
                    style="border: 1px solid #e0e0e0; border-radius: 4px;">
                Add to Route
            </button>
        </div>
    `;
    
    return card;
}

function rs_openModal(itemId) {
    const item = rs_state.allData.find(d => d.id === itemId);
    if (!item) return;
    
    const modal = document.getElementById('rs_modal');
    const content = document.getElementById('rs_modalContent');
    
    let metaHtml = `
        <div class="rs_modalMeta">
            <span class="rs_modalMetaItem">📍 ${item.city}, ${item.state || item.country}</span>
            ${item.rating ? `<span class="rs_modalMetaItem">★ ${item.rating} / 5</span>` : ''}
            ${item.priceRange ? `<span class="rs_modalMetaItem">💰 ${item.priceRange}</span>` : ''}
    `;
    
    if (item.cuisine) {
        metaHtml += `<span class="rs_modalMetaItem">🍴 ${item.cuisine}</span>`;
    }
    if (item.capacity) {
        metaHtml += `<span class="rs_modalMetaItem">👥 Capacity: ${item.capacity.toLocaleString()}</span>`;
    }
    if (item.category) {
        metaHtml += `<span class="rs_modalMetaItem">🏷 ${item.category}</span>`;
    }
    
    metaHtml += '</div>';
    
    if (item.googleRating) {
        metaHtml += `<div class="rs_modalMeta">
            <span class="rs_modalMetaItem">⭐ Google Rating: ${item.googleRating} / 5</span>
        </div>`;
    }
    
    content.innerHTML = `
        <button class="rs_modalClose" onclick="rs_closeModal()">✕</button>
        <img class="rs_modalImage" src="/D00281353/${item.image}" alt="${item.name}"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22250%22><rect fill=%22%23e0e0e0%22 width=%22600%22 height=%22250%22/><text fill=%22%23999%22 x=%22300%22 y=%22125%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2220%22>Image not available</text></svg>'">
        <h2 class="rs_modalTitle">${item.name}</h2>
        ${metaHtml}
        <div class="rs_modalBody">
            <p class="rs_text">${item.description}</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="rs_btn rs_btnPrimary" onclick="rs_centerMapOnItem('${item.id}')">
                Show on Map
            </button>
            <button class="rs_btn rs_btnSecondary" onclick="rs_addToRoute('${item.id}'); rs_closeModal();">
                Add to Route
            </button>
        </div>
    `;
    
    modal.classList.add('rs_modalVisible');
    
    document.body.style.overflow = 'hidden';
}

function rs_closeModal() {
    const modal = document.getElementById('rs_modal');
    modal.classList.remove('rs_modalVisible');
    document.body.style.overflow = '';
}

function rs_centerMapOnItem(itemId) {
    const item = rs_state.allData.find(d => d.id === itemId);
    if (!item) return;
    
    rs_closeModal();
    
    rs_state.map.setCenter({ lat: item.lat, lng: item.lng });
    rs_state.map.setZoom(12);
    
    const marker = rs_state.markers.find(m => m.itemData && m.itemData.id === itemId);
    if (marker) {
        google.maps.event.trigger(marker, 'click');
    }
}

function rs_setupRoutePlanner() {
    const addBtn = document.getElementById('rs_routeAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            rs_showRouteLocationPicker();
        });
    }
}

function rs_showRouteLocationPicker() {
    const select = document.createElement('select');
    select.className = 'rs_formSelect';
    select.innerHTML = '<option value="">-- Select a location --</option>';
    
    rs_state.allData.forEach(item => {
        if (!rs_state.routeStops.find(s => s.id === item.id)) {
            select.innerHTML += `<option value="${item.id}">${item.name} (${item.city})</option>`;
        }
    });
    
    const container = document.getElementById('rs_routeStops');
    const pickerDiv = document.createElement('div');
    pickerDiv.style.cssText = 'display: flex; gap: 10px; margin-top: 10px;';
    pickerDiv.appendChild(select);
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'rs_btn rs_btnPrimary rs_btnSmall';
    confirmBtn.textContent = 'Add';
    confirmBtn.addEventListener('click', () => {
        if (select.value) {
            rs_addToRoute(select.value);
            pickerDiv.remove();
        }
    });
    pickerDiv.appendChild(confirmBtn);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'rs_btn rs_btnSmall';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px 16px;';
    cancelBtn.addEventListener('click', () => pickerDiv.remove());
    pickerDiv.appendChild(cancelBtn);
    
    container.appendChild(pickerDiv);
}

function rs_addToRoute(itemId) {
    const item = rs_state.allData.find(d => d.id === itemId);
    if (!item) return;
    
    if (rs_state.routeStops.find(s => s.id === itemId)) {
        rs_showError('This location is already in your route.');
        return;
    }
    
    rs_state.routeStops.push(item);
    
    rs_updateRouteUI();
    
    rs_calculateRoute();
}

function rs_removeFromRoute(index) {
    rs_state.routeStops.splice(index, 1);
    rs_updateRouteUI();
    rs_calculateRoute();
}

function rs_updateRouteUI() {
    const container = document.getElementById('rs_routeStops');
    if (!container) return;
    
    const stops = container.querySelectorAll('.rs_routeStop');
    stops.forEach(s => s.remove());
    
    rs_state.routeStops.forEach((stop, index) => {
        const stopDiv = document.createElement('div');
        stopDiv.className = 'rs_routeStop';
        stopDiv.innerHTML = `
            <div class="rs_routeStopNumber">${index + 1}</div>
            <div class="rs_routeStopInfo">
                <div class="rs_routeStopName">${stop.name}</div>
                <div class="rs_routeStopAddress">${stop.city}, ${stop.state || stop.country}</div>
            </div>
            <button class="rs_routeRemoveBtn" onclick="rs_removeFromRoute(${index})">✕</button>
        `;
        container.insertBefore(stopDiv, container.querySelector('.rs_routeAddBtn'));
    });
    
    const addBtn = document.getElementById('rs_routeAddBtn');
    if (addBtn) {
        addBtn.style.display = rs_state.routeStops.length >= 8 ? 'none' : 'block';
    }
}

function rs_calculateRoute() {
    if (rs_state.routeStops.length < 2) {
        rs_state.routeRenderer.setDirections({ routes: [] });
        return;
    }
    
    const waypoints = rs_state.routeStops.slice(1, -1).map(stop => ({
        location: new google.maps.LatLng(stop.lat, stop.lng),
        stopover: true
    }));
    
    const request = {
        origin: new google.maps.LatLng(rs_state.routeStops[0].lat, rs_state.routeStops[0].lng),
        destination: new google.maps.LatLng(rs_state.routeStops[rs_state.routeStops.length - 1].lat, rs_state.routeStops[rs_state.routeStops.length - 1].lng),
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };
    
    rs_state.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            rs_state.routeRenderer.setDirections(result);
            
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            const summaryEl = document.getElementById('rs_routeSummary');
            if (summaryEl) {
                const km = (totalDistance / 1000).toFixed(0);
                const hours = Math.floor(totalDuration / 3600);
                const mins = Math.floor((totalDuration % 3600) / 60);
                summaryEl.innerHTML = `
                    <div class="rs_successBanner">
                        Route calculated: ${km} km | ${hours}h ${mins}m
                    </div>
                `;
            }
        } else {
            console.error('Directions request failed:', status);
            rs_showError('Could not calculate route. Please try different locations.');
        }
    });
}

async function rs_convertCurrency() {
    const amount = document.getElementById('rs_currencyAmount').value;
    const from = document.getElementById('rs_currencyFrom').value;
    const to = document.getElementById('rs_currencyTo').value;
    const resultEl = document.getElementById('rs_currencyResult');
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        rs_showFieldError('rs_currencyAmount', 'Please enter a valid amount');
        return;
    }
    rs_clearFieldError('rs_currencyAmount');
    
    try {
        resultEl.textContent = 'Converting...';
        
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (!response.ok) {
            throw new Error('Currency API request failed');
        }
        
        const data = await response.json();
        const fromRate = data.rates[from];
        const toRate = data.rates[to];
        
        if (!fromRate || !toRate) {
            throw new Error(`Cannot convert ${from} to ${to}`);
        }
        
        const convertedAmount = (parseFloat(amount) / fromRate * toRate).toFixed(2);
        
        const formattedAmount = parseFloat(amount).toLocaleString('en-US', { 
            style: 'currency', 
            currency: from 
        });
        const formattedResult = parseFloat(convertedAmount).toLocaleString('en-US', { 
            style: 'currency', 
            currency: to 
        });
        
        resultEl.textContent = `${formattedAmount} = ${formattedResult}`;
        
    } catch (error) {
        console.error('Currency conversion error:', error);
        resultEl.textContent = 'Conversion failed. Please try again.';
        rs_showError('Currency conversion failed. Using fallback rates.');
        
        const fallbackRates = {
            USD: { EUR: 0.92, GBP: 0.79, CAD: 1.36, MXN: 17.15 },
            EUR: { USD: 1.09, GBP: 0.86, CAD: 1.48, MXN: 18.65 },
            GBP: { USD: 1.27, EUR: 1.16, CAD: 1.72, MXN: 21.70 },
            CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, MXN: 12.61 },
            MXN: { USD: 0.058, EUR: 0.054, GBP: 0.046, CAD: 0.079 }
        };
        
        if (fallbackRates[from] && fallbackRates[from][to]) {
            const fallbackRate = fallbackRates[from][to];
            const convertedAmount = (parseFloat(amount) * fallbackRate).toFixed(2);
            resultEl.textContent = `${amount} ${from} ≈ ${convertedAmount} ${to} (estimated)`;
        } else {
            resultEl.textContent = 'Conversion unavailable';
        }
    }
}

async function rs_translateText() {
    const text = document.getElementById('rs_translateText').value;
    const fromLang = document.getElementById('rs_translateFrom').value;
    const toLang = document.getElementById('rs_translateTo').value;
    const resultEl = document.getElementById('rs_translateResult');
    
    if (!text || text.trim() === '') {
        rs_showFieldError('rs_translateText', 'Please enter text to translate');
        return;
    }
    rs_clearFieldError('rs_translateText');
    
    try {
        resultEl.textContent = 'Translating...';
        
        const apiKey = 'AIzaSyDcjpaM-DtcXltzYbRV_s09ZI200yV2hao';
        
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: fromLang,
                target: toLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error('Translation API request failed');
        }
        
        const data = await response.json();
        resultEl.textContent = data.data.translations[0].translatedText;
        
    } catch (error) {
        console.error('Translation error:', error);
        resultEl.textContent = 'Translation service unavailable. Please try again later.';
        rs_showError('Translation service is currently unavailable.');
    }
}

function rs_setupEventListeners() {
    
    const hamburgerBtn = document.getElementById('rs_hamburgerBtn');
    const mobileNav = document.getElementById('rs_mobileNav');
    const overlay = document.getElementById('rs_overlay');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('rs_hamburgerOpen');
            mobileNav.classList.toggle('rs_mobileNavOpen');
            overlay.classList.toggle('rs_overlayVisible');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            hamburgerBtn.classList.remove('rs_hamburgerOpen');
            mobileNav.classList.remove('rs_mobileNavOpen');
            overlay.classList.remove('rs_overlayVisible');
        });
    }
    
    const mobileLinks = document.querySelectorAll('.rs_mobileNavLink');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('rs_hamburgerOpen');
            mobileNav.classList.remove('rs_mobileNavOpen');
            overlay.classList.remove('rs_overlayVisible');
        });
    });
    
    const filterBtns = document.querySelectorAll('.rs_filterBtn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.closest('.rs_filterGroup');
            if (group) {
                group.querySelectorAll('.rs_filterBtn').forEach(b => {
                    b.classList.remove('rs_filterBtnActive');
                });
            }
            btn.classList.add('rs_filterBtnActive');
            
            const filterType = btn.getAttribute('data-filter-type');
            const filterValue = btn.getAttribute('data-filter-value');
            
            if (filterType && filterValue) {
                rs_setFilter(filterType, filterValue);
            }
        });
    });
    
    
    const searchInput = document.getElementById('rs_searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                rs_setFilter('search', searchInput.value);
            }, 300);
        });
    }
    
    const convertBtn = document.getElementById('rs_convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', rs_convertCurrency);
    }
    
    const translateBtn = document.getElementById('rs_translateBtn');
    if (translateBtn) {
        translateBtn.addEventListener('click', rs_translateText);
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    const modal = document.getElementById('rs_modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                rs_closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            rs_closeModal();
        }
    });
}

function rs_showLoading(show) {
    const spinner = document.getElementById('rs_loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function rs_showError(message) {
    const errorContainer = document.getElementById('rs_errorContainer');
    if (errorContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'rs_errorBanner';
        errorDiv.textContent = message;
        errorContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

function rs_showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('rs_inputError');
        
        let errorEl = field.parentElement.querySelector('.rs_error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'rs_error';
            field.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
}

function rs_clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('rs_inputError');
        const errorEl = field.parentElement.querySelector('.rs_error');
        if (errorEl) {
            errorEl.remove();
        }
    }
}

window.addEventListener('load', () => {
    setTimeout(() => {
        rs_initApp();
    }, 100);
});

window.rs_openModal = rs_openModal;
window.rs_closeModal = rs_closeModal;
window.rs_addToRoute = rs_addToRoute;
window.rs_removeFromRoute = rs_removeFromRoute;
window.rs_centerMapOnItem = rs_centerMapOnItem;
window.rs_convertCurrency = rs_convertCurrency;
window.rs_translateText = rs_translateText;
