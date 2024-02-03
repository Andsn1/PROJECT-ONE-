var seatGeek_API_KEY = "Mzk2OTg5MTB8MTcwNjc4ODA4NC42NTY5MzAy"; // SeatGeek API Key
var wyreAPI_key = "d5c2cec884mshe479a0bb5604893p149fd3jsne33416b10ce7"; // Wyre Data API Key
var wyere_API_host = "wyre-data.p.rapidapi.com";

var restaurantList = [];

//TODO: requires to attach to user INPUT  // --> POSTCODE TO SEARCH
var postCode = "PE14AQ";

//TODO: requires to attach to user INPUT // --> Radius distance for search
var searchRange = "50mi";

function fetchEventsFromSeatGeek(latitude, longitude) {
  const seatGeekQuery = `https://api.seatgeek.com/2/events?lat=${latitude}&lon=${longitude}&range=${searchRange}&client_id=${seatGeek_API_KEY}`; //set to 15 miles range
  console.log(seatGeekQuery);
  fetch(seatGeekQuery)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Log the events data to the console
      console.log("Events based on current location (SeatGeek):", data);

      // Append events data to the textarea
      appendToSearchResults(
        "Events based on current location (SeatGeek):\n" +
          JSON.stringify(data, null, 2)
      );
    })
    .catch(function (error) {
      // Handle errors if any
      console.error("Error fetching events (SeatGeek):", error);
      alert("Error fetching events (SeatGeek). Please try again.");
    });
}
// Function to append search results
function appendToSearchResults(content) {
  // Get the textarea element by ID
  var searchResultsTextarea = document.getElementById("searchResults");

  // Concatenate the existing value with the new content and set it back to the textarea
  searchResultsTextarea.textContent += content + "\n";
}
// Get Current location
function getCurrentLocation() {
  // Use browser's geolocation API to get the current location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Extract the latitude and longitude from the position
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Log the location details to the console
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // Fetch events from SeatGeek based on the current location
      fetchEventsFromSeatGeek(latitude, longitude);
      // LAT/LONG does not work
      // // Fetch restaurants from Wyre Data based on the current location
      // fetchRestaurantsFromWyre(latitude, longitude);
    },
    function (error) {
      // Handle errors if any
      console.error("Error getting location:", error.message);
      alert("Error getting location. Please try again.");
    }
  );
}
//fetch data from town
function fetchDataFromWyreByTown(town) {
  const settings = {
    async: true,
    crossDomain: true,
    url: `https://wyre-data.p.rapidapi.com/restaurants/town/${town}`,
    method: "GET",
    headers: {
      "X-RapidAPI-Key": `${wyreAPI_key}`,
      "X-RapidAPI-Host": `${wyere_API_host}`,
    },
  };

  $.ajax(settings)
    .done(function (response) {
      // Log the response to the console
      console.log(`Wyre Data - Restaurants in ${town}:`, response);

      // console.log(response);
      // Append the response to the textarea
      appendToSearchResults(
        `Wyre Data - Restaurants in ${town}:\n` +
          JSON.stringify(response, null, 2)
      );
    })
    .fail(function (error) {
      // Handle errors if any
      console.error(`Error fetching data from Wyre (${town}):`, error);
      alert(`Error fetching data from Wyre (${town}). Please try again.`);
    });
}
//model search
function searchInModal() {
  // Get the value entered by the user in the input field
  var cityTown = document.getElementById("cityTownInput").value;

  // Check if a city/town is entered
  if (cityTown.trim() !== "") {
    // Construct the API request URL based on the entered city/town
    const wyreDataUrl = `https://wyre-data.p.rapidapi.com/restaurants/town/${cityTown}`;

    // Set up the request headers
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": `${wyreAPI_key}`,
        "X-RapidAPI-Host": `${wyere_API_host}`,
      },
    };

    // Make the API request
    fetch(wyreDataUrl, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // Display the results in the textarea
        const resultsTextarea = document.getElementById("searchResults");
        resultsTextarea.value = JSON.stringify(data, null, 2);
        // console.log(data);

        //looping through data and collecting available postcodes  based on restaurant
        for (var i = 0; i < data.length; i++) {
          // var halfPostCode = data[i].PostCode.split(" ");
          var restaurant = {
            id: data[i]._id,
            Name: data[i].BusinessName,
            Address1: data[i].AddressLine2,
            Address2: data[i].AddressLine3,
            Rating: data[i].RatingValue,
            postcode: data[i].PostCode,
            longitude: data[i].Geocode_Latitude,
            latitude: data[i].Geocode_Longitude,
          };
          // checking if postcode is already in array, if so then not adding to Array
          //as well checking if there are values for longitude and latitude. otherwise skip this entry
          if (!restaurantList.includes(restaurant)) {
            restaurantList.push(restaurant);
            generateRestaurantCard(restaurant);
          }
        }
      })
      .catch(function (error) {
        // Handle errors if any
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again.");
      });
  } else {
    // Display an alert or handle the case where no city/town is entered
    alert("Please enter a valid City/Town.");
  }

  // Close the modal if needed
  $("#exampleModalCenter").modal("hide");
}

function generateRestaurantCard(obj) {}
