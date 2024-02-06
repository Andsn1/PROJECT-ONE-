var seatGeek_API_KEY = "Mzk2OTg5MTB8MTcwNjc4ODA4NC42NTY5MzAy"; // SeatGeek API Key
var wyreAPI_key = "b426e7ee8dmsh373af0d00335841p1321d7jsn3769c927bdc0"; // Wyre Data API Key Jermaine Key --> {d5c2cec884mshe479a0bb5604893p149fd3jsne33416b10ce7}
var wyere_API_host = "wyre-data.p.rapidapi.com";

var restaurantList = [];
var eventList = [];

//TODO: requires to attach to user INPUT  // --> POSTCODE TO SEARCH
var postCode = "PE14AQ";

//TODO: requires to attach to user INPUT // --> Radius distance for search
var searchRange = "50mi";
//limit to fetch up to 10 events only
var eventLimit = 8;

var restaurantLimit = 8;

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
      // console.log(`EventListObject ==> `);
      // console.log(eventList);
      // Log the events data to the console
      // console.log("Events based on current location (SeatGeek):", data);

      // Append events data to the textarea
      // appendToSearchResults(
      //   "Events based on current location (SeatGeek):\n" +
      //     JSON.stringify(data, null, 2)
      // );
    })
    .catch(function (error) {
      // Handle errors if any
      console.error("Error fetching events (SeatGeek):", error);
      alert("Error fetching events (SeatGeek). Please try again.");
    });
}

function checkIfObjectExists(object, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].eventId === object.eventId) {
      return true;
    }
  }

  return false;
}

// fetchEventsFromSeatGeek(52.578609, -0.235509);

function generateEventCard(eventObject) {
  //create main card
  var maincard = $("<div>");

  maincard.addClass("card restaurant-card");
  maincard.attr("style", "width:19rem");

  //create image element
  var cardImage = $("<img>");
  cardImage.addClass("card-img-top");

  cardImage.attr("src", eventObject.performers[0].image);

  maincard.append(cardImage);

  //create card body
  var cardBody = $("<div>");
  cardBody.addClass("card-body");

  //create card title
  var cardTitle = $("<div>");
  cardTitle.addClass("name title");

  //create element for restaurant title with text placeholder
  var restraurantTitle = $("<h5>");
  restraurantTitle.addClass("card-title");

  restraurantTitle.text(eventObject.title);
  cardTitle.append(restraurantTitle);

  //creating rating placeholder
  var ratingContainer = $("<div>");
  ratingContainer.addClass("rating");
  cardBody.append(ratingContainer);

  var ratingText = $("<span>");
  var ratingIcon = $("<i>");
  ratingIcon.addClass("fa-solid fa-star");
  ratingText.text(eventObject.score);

  //create card for restaurant location placeholder
  var locationContainer = $("<div>");
  locationContainer.addClass("name");
  var Address1 = $("<div>");
  Address1.addClass("food-type");
  Address1.text(eventObject.eventType);

  locationContainer.append(Address1);

  var CityContainer = $("<div>");
  CityContainer.addClass("name");
  var city = $("<div>");
  city.addClass("city");
  city.text(dayjs(eventObject.dateTime).format("dd/MM/YYYY"));

  //create open and distance elements

  var timeAndDistanceEl = $("<div>");

  var openingTime = $("<div>");
  openingTime.addClass("time");
  openingTime.text("Opens at 5AM ");

  var distance = $("<div>");
  distance.addClass("distance");
  distance.text("2.3 km");

  cardBody.append(cardTitle);
  ratingContainer.append(ratingText);
  ratingContainer.append(ratingIcon);
  maincard.append(cardBody);

  cardBody.append(locationContainer);
  cardBody.append(CityContainer);
  cardBody.append(timeAndDistanceEl);

  timeAndDistanceEl.append(openingTime);
  timeAndDistanceEl.append(distance);

  $("#restaurant-list").append(maincard);
}

// Function to append search results
// function appendToSearchResults(content) {
//   // Get the textarea element by ID
//   // var searchResultsTextarea = document.getElementById("searchResults");

//   // Concatenate the existing value with the new content and set it back to the textarea
//   searchResultsTextarea.textContent += content + "\n";
// }
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
  // TODO:remove this to ensure that function can be executed
  // added this to ensure that API don't get rate limit
  // return;
  //clearing already existing values in restaurant list.
  if (restaurantList.length > 0) {
    restaurantList = [];
  }
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
        // const resultsTextarea = document.getElementById("searchResults");
        // resultsTextarea.value = JSON.stringify(data, null, 2);
        console.log(data);

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
            longitude: data[i].Geocode_Longitude,
            latitude: data[i].Geocode_Latitude,
          };
          // checking if postcode is already in array, if so then not adding to Array
          //as well checking if there are values for longitude and latitude. otherwise skip this entry
          if (
            !restaurantList.includes(restaurant) &&
            restaurant.latitude &&
            restaurant.longitude
          ) {
            restaurantList.push(restaurant);
            if (i < restaurantLimit) {
              generateRestaurantCard(restaurant);
            }
            if (i < eventLimit) {
              fetchEventsFromSeatGeek(
                restaurant.latitude,
                restaurant.longitude
              );
            }
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

function generateRestaurantCard(restaurant) {
  //create main card
  var maincard = $("<div>");

  maincard.addClass("card restaurant-card");
  maincard.attr("style", "width:19rem");

  //create image element
  var cardImage = $("<img>");
  cardImage.addClass("card-img-top");

  cardImage.attr("src", "./assets/images/rooftop.webp");

  maincard.append(cardImage);

  //create card body
  var cardBody = $("<div>");
  cardBody.addClass("card-body");

  //create card title
  var cardTitle = $("<div>");
  cardTitle.addClass("name title");

  //create element for restaurant title with text placeholder
  var restraurantTitle = $("<h5>");
  restraurantTitle.addClass("card-title");

  restraurantTitle.text(restaurant.Name);
  cardTitle.append(restraurantTitle);

  //creating rating placeholder
  var ratingContainer = $("<div>");
  ratingContainer.addClass("rating");
  cardTitle.append(ratingContainer);

  var ratingText = $("<span>");
  var ratingIcon = $("<i>");
  ratingIcon.addClass("fa-solid fa-star");
  ratingText.text(restaurant.Rating);

  //create card for restaurant location placeholder
  var locationContainer = $("<div>");
  locationContainer.addClass("name");
  var Address1 = $("<div>");
  Address1.addClass("food-type");
  Address1.text(restaurant.Address1);

  locationContainer.append(Address1);

  var CityContainer = $("<div>");
  CityContainer.addClass("name");
  var city = $("<div>");
  city.addClass("city");
  city.text(restaurant.Address2);

  //create open and distance elements

  var timeAndDistanceEl = $("<div>");

  var openingTime = $("<div>");
  openingTime.addClass("time");
  openingTime.text("Opens at 5AM ");

  var distance = $("<div>");
  distance.addClass("distance");
  distance.text("2.3 km");

  cardBody.append(cardTitle);
  ratingContainer.append(ratingText);
  ratingContainer.append(ratingIcon);
  maincard.append(cardBody);

  cardBody.append(locationContainer);
  cardBody.append(CityContainer);
  cardBody.append(timeAndDistanceEl);

  timeAndDistanceEl.append(openingTime);
  timeAndDistanceEl.append(distance);

  $("#restaurant-list").append(maincard);
}

$("#perform-search").on("click", function (event) {
  event.preventDefault();
  console.log("Hello");
  searchInModal();
});
