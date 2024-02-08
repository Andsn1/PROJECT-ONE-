console.log('test script');
var seatGeek_API_KEY = "Mzk2OTg5MTB8MTcwNjc4ODA4NC42NTY5MzAy"; // SeatGeek API Key
var eventList = [];
//TODO: requires to attach to user INPUT // --> Radius distance for search
var searchRange = "100mi";
//limit to fetch up to 10 events only
var eventLimit = 8;

document.addEventListener('DOMContentLoaded', function () {
    var dropdown = document.querySelector('.dropdown');
    var dropdownButton = document.querySelector('.dropdown-toggle');
    var dropdownItems = document.querySelectorAll('.dropdown-item');
    var cityTownInput = document.getElementById('cityTownInput');

    // Default values or initial values
    var cityTown = "";  // Initial value is empty
    // display ICON with name
    var iconHTML = '<i class="fa-solid fa-location-dot location-icon"></i>';

    // Event listener for input change
    cityTownInput.addEventListener('input', function () {
        // Update the cityTown variable
        cityTown = cityTownInput.value;
    });

    dropdownItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var selectedCategory = item.getAttribute('data-category');
            dropdown.setAttribute('data-selected-category', selectedCategory);

            // Update the button text with the selected category and keep the icon
            dropdownButton.innerHTML = `${iconHTML} ${item.textContent}`;
        });
    });
});
function performSearch() {
    var selectedCategory = document.querySelector('.dropdown').getAttribute('data-selected-category');
    var cityTown = document.getElementById('cityTownInput').value;
    var errorMessageContainer = document.getElementById('error-message');

    // Validate input before making the fetch request
    if (cityTown.trim() !== "" && selectedCategory) {
        // Clear previous error message
        errorMessageContainer.textContent = "";

        fetchFromSerper(cityTown, selectedCategory);
    } else {
        // Display error message
        alert('Invalid input or category selection.');
        console.error('Invalid input or category selection.');
    }
}
function fetchFromSerper(cityTown, selectedCategory) {
    var serperAPI = "2813e1297564fcc84cf203c0dafe4e0e10c5ef05";
    var myHeaders = new Headers();
    myHeaders.append("X-API-KEY", serperAPI);
    myHeaders.append("Content-Type", "application/json");

    // Concatenate the cityTown variable and selected category without "bars"
    var raw = JSON.stringify({
        "q": cityTown + " " + selectedCategory,
        "gl": "gb"
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://google.serper.dev/places", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log('API Response:', result);
            appendRowsOfCardsToContainer(JSON.parse(result).places || []);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Handle the error, e.g., display an error message to the user
        });
}
function appendRowsOfCardsToContainer(places) {
    var restaurantList = document.getElementById("restaurant-list");
    var errorMessage = document.getElementById("error-message");

    try {
        // Clear existing content
        restaurantList.innerHTML = "";
        errorMessage.innerHTML = ""; // Clear previous error messages

        // Create a new row container
        var rowContainer = document.createElement("div");
        rowContainer.classList.add("row", "row-cols-lg-12", "row-cols-md-6", "row-cols-sm-3");
        rowContainer.id = "restaurants"; // Replace "yourNewId" with the desired ID

        places.forEach((place, index) => {
            // Create HTML elements for each place
            var restaurantCard = document.createElement("div");
            restaurantCard.classList.add("card", "mb-4");

            restaurantCard.innerHTML = `
                <img src="${place.thumbnailUrl}" alt="${place.title}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${place.title}</h5>
                    <p class="card-address">${place.address}</p>
                    <p class="card-rating">Rating: ${place.rating}</p>
                    <p class="card-category">Category: ${place.category}</p>
                </div>
            `;

            // Append the card to the row container
            rowContainer.appendChild(restaurantCard);
        });

        // Append the entire row container to the "restaurant-list" container
        restaurantList.appendChild(rowContainer);
    } catch (error) {
        console.error('Error processing API response:', error);

        // Display error as an alert
        alert('Error processing API response: ' + error.message);

        // Append error message to the "error-message" div
        errorMessage.innerHTML = 'Error: ' + error.message;
    }
}
function checkIfObjectExists(object, list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].eventId === object.eventId) {
        return true;
      }
    }
    return false;
  }
function fetchEventsFromSeatGeek(latitude, longitude) {
    //clear event container
  
    $("#event-list").empty();
  
    const seatGeekQuery = `https://api.seatgeek.com/2/events?lat=${latitude}&lon=${longitude}&range=${searchRange}&client_id=${seatGeek_API_KEY}`; //set to 15 miles range
  
    //using Jung's site for CORS
    var cross_platform = `https://cors-anywhere-jung-48d4feb9d097.herokuapp.com/${seatGeekQuery}`;
    //clearing event list if there are already values
    if (eventList.length > 0) {
      eventList = [];
    }
  
    // console.log(seatGeekQuery.toLowerCase());
    fetch(cross_platform)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        for (var i = 0; i < data.events.length; i++) {
          for (var j = 0; j < data.events[i].performers.length; j++) {
            var eventObject = {
              eventType: data.events[i].type,
              eventId: data.events[i].id,
              dateTime: data.events[i].datetime_local,
              isOpen: data.events[i].is_open,
              url: data.events[i].url,
              score: data.events[i].score,
              status: data.events[i].status,
              title: data.events[i].title,
              performers: [
                {
                  type: data.events[i].performers[j].type,
                  name: data.events[i].performers[j].name,
                  image: data.events[i].performers[j].image,
                },
              ],
            };
          }
          if (!checkIfObjectExists(eventObject, eventList)) {
            eventList.push(eventObject);
            generateEventCard(eventObject);
          }
        }
      })
      .catch(function (error) {
        // Handle errors if any
        console.error("Error fetching events (SeatGeek):", error);
        alert("Error fetching events (SeatGeek). Please try again.");
      });
} 
function searchEvents() {
    // Get the current location and fetch events from SeatGeek
    getCurrentLocation();
}
function getCurrentLocation() {
    // Use browser's geolocation API to get the current location
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Log the location details to the console
            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            // Fetch events from SeatGeek based on the current location
            fetchEventsFromSeatGeek(latitude, longitude);
        },
        function (error) {
            // Handle errors if any
            console.error("Error getting location:", error.message);
            alert("Error getting location. Please try again.");
        }
    );
}
function displayEventsInRestaurantArea(events) {
    var eventListContainer = document.getElementById("restaurant-list");
  
    // Clear existing content
    eventListContainer.innerHTML = "";
  
    // Loop through the events and generate cards
    events.forEach(function (event) {
      generateEventCard(event);
    });
  }
  function generateEventCard(event) {
    // Create main card
    var mainCard = document.createElement("div");
    mainCard.classList.add("card", "restaurant-card", "mb-4");
  
    // Create image element
    var cardImage = document.createElement("img");
    cardImage.classList.add("card-img-top");
    cardImage.src = event.performers[0].image;
  
    mainCard.appendChild(cardImage);
  
    // Create card body
    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
  
    // Create card title
    var cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = event.title;
  
    cardBody.appendChild(cardTitle);
  
    // Create rating container
    var ratingContainer = document.createElement("div");
    ratingContainer.classList.add("rating");
  
    var ratingText = document.createElement("span");
    var ratingIcon = document.createElement("i");
    ratingIcon.classList.add("fa-solid", "fa-star");
    ratingText.textContent = event.score;
  
    ratingContainer.appendChild(ratingText);
    ratingContainer.appendChild(ratingIcon);
  
    cardTitle.appendChild(ratingContainer);
  
    // Create location container
    var locationContainer = document.createElement("div");
    locationContainer.classList.add("name");
  
    var eventType = document.createElement("div");
    eventType.classList.add("food-type");
    eventType.textContent = event.eventType;
  
    locationContainer.appendChild(eventType);
  
    // Create date container
    var dateContainer = document.createElement("div");
    dateContainer.classList.add("name");
  
    var dateTime = document.createElement("div");
    dateTime.classList.add("city");
    dateTime.textContent = dayjs(event.dateTime).format("DD/MM/YYYY");
  
    dateContainer.appendChild(dateTime);
  
    cardBody.appendChild(locationContainer);
    cardBody.appendChild(dateContainer);
  
    mainCard.appendChild(cardBody);
  
    // Append the card to the restaurant area
    var eventListContainer = document.getElementById("restaurant-list");
    eventListContainer.appendChild(mainCard);
  }
