function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");
    for (var i = 0; i < uiBathrooms.length; i++) {
        if (uiBathrooms[i].checked) {
            return parseInt(uiBathrooms[i].value);
        }
    }
    return -1; // Invalid Value
}

function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");
    for (var i = 0; i < uiBHK.length; i++) {
        if (uiBHK[i].checked) {
            return parseInt(uiBHK[i].value);
        }
    }
    return -1; // Invalid Value
}

function onClickedEstimatePrice() {
    console.log("Estimate price button clicked");
    var sqft = document.getElementById("uiSqft").value;
    var bhk = getBHKValue();
    var bathrooms = getBathValue();
    var location = document.getElementById("uiLocationsDropdown").value || document.getElementById('autocomplete').value;
    var estPrice = document.getElementById("uiEstimatedPrice");

    // Validation checks
    if (!sqft) {
        alert("Please enter the total square feet.");
        return;
    }
    if (bhk === -1) {
        alert("Please select the number of bedrooms.");
        return;
    }
    if (bathrooms === -1) {
        alert("Please select the number of bathrooms.");
        return;
    }
    if (!location) {
        alert("Please select or enter a location.");
        return;
    }

    console.log(location);
    var url = "/predict_home_price"; // Adjusted for the correct path

    $.post(url, {
        total_sqft: parseFloat(sqft),
        bhk: bhk,
        bath: bathrooms,
        location: location
    }, function (data, status) {
        if (data.error) {
            estPrice.innerText = data.error; // Show the error message
            // Hide the save button
            var saveButton = document.getElementById("savePredictionButton");
            if (saveButton) {
                saveButton.style.display = "none";
            }
        } else {
            console.log(data.estimated_price);
            estPrice.innerText = data.estimated_price.toString(); // Set innerHTML without surrounding tags
            // Show save button if logged in
            var saveButton = document.getElementById("savePredictionButton");
            if (saveButton) {
                saveButton.style.display = "block";
            }
        }
        console.log(status);
    });
}




function onClickedSavePrediction() {
    // First, check if the user is logged in
    $.ajax({
        url: '/check_login_status', // New endpoint to check login status
        type: 'GET',
        success: function(response) {
            if (response.logged_in) {
                // User is logged in, proceed with saving prediction
                var sqft = document.getElementById("uiSqft").value;
                var bhk = getBHKValue();
                var bathrooms = getBathValue();
                var location = document.getElementById("uiLocationsDropdown").value || document.getElementById("autocomplete").value.toLowerCase();
                var estPrice = document.getElementById("uiEstimatedPrice").innerText.trim(); // Extract text only

                $.ajax({
                    url: '/save_prediction',
                    type: 'POST',
                    data: {
                        sqft: sqft,
                        bhk: bhk,
                        bath: bathrooms,
                        location: location,
                        estimated_price: estPrice,
                        date: new Date().toISOString().split('T')[0]  // format date as YYYY-MM-DD
                    },
                    success: function (response) {
                        alert(response.message);
                    },
                    error: function (error) {
                        console.error('Error saving prediction:', error);
                    }
                });
            } else {
                // User is not logged in, show an alert message
                alert("You need to login first");
            }
        },
        error: function (error) {
            console.error('Error checking login status:', error);
        }
    });
}


function onPageLoad() {
    console.log("document loaded");
    var url = "/get_location_names"; // Adjusted for the correct path

    $.get(url, function (data, status) {
        console.log("got response for get_location_names request");
        console.log(data);
        if (data) {
            var locations = data.locations;
            var uiLocationsDropdown = $("#uiLocationsDropdown");
            uiLocationsDropdown.empty();
            uiLocationsDropdown.append(new Option("Choose a Popular Location", "", true, true));
            for (var i in locations) {
                uiLocationsDropdown.append(new Option(locations[i], locations[i]));
            }
        }
    });

    // Disable autocomplete field when dropdown is selected
    $("#uiLocationsDropdown").change(function() {
        $("#autocomplete").prop("disabled", true);
    });

    // Disable dropdown when autocomplete field is filled
    $("#autocomplete").on("input", function() {
        $("#uiLocationsDropdown").prop("disabled", true);
    });

    // Re-enable fields if autocomplete is cleared
    $("#autocomplete").on("change", function() {
        if ($(this).val() === "") {
            $("#uiLocationsDropdown").prop("disabled", false);
        }
    });

    // Re-enable fields if dropdown is reset
    $("#uiLocationsDropdown").on("change", function() {
        if ($(this).val() === "") {
            $("#autocomplete").prop("disabled", false);
        }
    });
}

function resetFields() {
    $("#autocomplete").prop("disabled", false).val("");
    $("#uiLocationsDropdown").prop("disabled", false).val("");
    $("#selectedLat").val("");
    $("#selectedLng").val("");
    $("#selectedLocation").val("");
    $("#uiEstimatedPrice").text(""); // Clear the estimated price text
    $("#savePredictionButton").hide(); 
    marker.setPosition(null); // Hide the marker
}

$(document).ready(onPageLoad);
