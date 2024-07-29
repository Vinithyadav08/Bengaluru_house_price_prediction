let map, autocomplete, marker, geocoder;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 13,
        mapTypeControl: false,
    });

    geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    var input = document.getElementById('autocomplete');
    autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' }
    });
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        updateHiddenInputs(place.geometry.location);

        // Extract and set the area name
        const areaName = getAreaName(place.address_components);
        document.getElementById('autocomplete').value = areaName;

        // Disable dropdown when autocomplete is filled
        $("#uiLocationsDropdown").prop("disabled", true);
    });

    map.addListener('click', function (event) {
        marker.setPosition(event.latLng);
        updateHiddenInputs(event.latLng);
        geocodeLatLng(event.latLng);

        // Center map on marker position
        map.setCenter(event.latLng);
        map.setZoom(17);

        // Enable autocomplete and clear its value
        $("#autocomplete").prop("disabled", false).val("");

        // Enable dropdown and reset its selection
        $("#uiLocationsDropdown").prop("disabled", false).val("");
    });

    marker.addListener('dragend', function (event) {
        updateHiddenInputs(event.latLng);
        geocodeLatLng(event.latLng);
    });
}

function updateHiddenInputs(location) {
    document.getElementById('selectedLat').value = location.lat();
    document.getElementById('selectedLng').value = location.lng();
}

function geocodeLatLng(latlng) {
    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status === "OK") {
            if (results[0]) {
                const areaName = getAreaName(results[0].address_components);
                document.getElementById('autocomplete').value = areaName;
                document.getElementById('selectedLocation').value = areaName;

                // Disable dropdown when location is set from map
                $("#uiLocationsDropdown").prop("disabled", true);
            } else {
                window.alert("No results found");
            }
        } else {
            window.alert("Geocoder failed due to: " + status);
        }
    });
}

function getAreaName(components) {
    for (let i = 0; i < components.length; i++) {
        if (components[i].types.includes('sublocality_level_1') || components[i].types.includes('locality')) {
            return components[i].long_name;
        }
    }
    return '';
}
