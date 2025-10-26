// Initialize variables
let map;
let directionsService;
let directionsRenderer;

// Initialize the map
async function initMap() {
    try {
        // Load required libraries
        const { Map } = await google.maps.importLibrary("maps");
        const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

        // Create map
        map = new Map(document.getElementById('map'), {
            zoom: 7,
            center: { lat: 28.6139, lng: 77.2090 }, // Delhi, India
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Initialize directions
        directionsService = new DirectionsService();
        directionsRenderer = new DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            draggable: true
        });

        console.log('Map initialized successfully!');
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Error loading map. Check console for details.');
    }
}

// Calculate and display route
async function calculateRoute() {
    const pickup = document.getElementById('pickup').value.trim();
    const destination = document.getElementById('destination').value.trim();

    // Validate inputs
    if (!pickup || !destination) {
        alert('⚠️ Please enter both pickup and destination locations!');
        return;
    }

    if (!directionsService) {
        alert('⚠️ Map is still loading. Please wait a moment.');
        return;
    }

    // Show loading state
    const button = document.getElementById('getDirections');
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;

    try {
        // Request directions
        const request = {
            origin: pickup,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService.route(request, (result, status) => {
            button.textContent = originalText;
            button.disabled = false;

            if (status === 'OK') {
                // Display route on map
                directionsRenderer.setDirections(result);
                
                // Display step-by-step directions
                displayDirections(result);
                
                console.log('Route calculated successfully!');
            } else {
                let errorMessage = 'Could not find directions.';
                
                if (status === 'ZERO_RESULTS') {
                    errorMessage = '❌ No route found between these locations.';
                } else if (status === 'NOT_FOUND') {
                    errorMessage = '❌ One or both locations not found. Please check spelling.';
                } else if (status === 'REQUEST_DENIED') {
                    errorMessage = '❌ Request denied. Check your API key settings.';
                }
                
                alert(errorMessage + '\nStatus: ' + status);
                console.error('Directions request failed:', status);
            }
        });
    } catch (error) {
        button.textContent = originalText;
        button.disabled = false;
        console.error('Error calculating route:', error);
        alert('An error occurred. Check console for details.');
    }
}

// Display step-by-step directions
function displayDirections(result) {
    const directionsPanel = document.getElementById('directions-panel');
    const route = result.routes[0];
    const leg = route.legs[0];
    
    let html = '<h3>📋 Step-by-Step Directions</h3>';
    html += `<p><strong>📏 Total Distance:</strong> ${leg.distance.text}</p>`;
    html += `<p><strong>⏱️ Estimated Time:</strong> ${leg.duration.text}</p>`;
    html += `<p><strong>🚗 From:</strong> ${leg.start_address}</p>`;
    html += `<p><strong>🏁 To:</strong> ${leg.end_address}</p>`;
    html += '<hr style="margin: 15px 0; border: 1px solid #ddd;">';
    
    leg.steps.forEach((step, index) => {
        html += `<div class="direction-step">
            <strong>Step ${index + 1}:</strong> ${step.instructions}
            <br><small>📍 ${step.distance.text} - ⏱️ ${step.duration.text}</small>
        </div>`;
    });
    
    directionsPanel.innerHTML = html;
    directionsPanel.style.display = 'block';
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing map...');
    initMap();
});

// Button click event
document.getElementById('getDirections').addEventListener('click', calculateRoute);

// Enter key support
document.getElementById('pickup').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateRoute();
});

document.getElementById('destination').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateRoute();
});