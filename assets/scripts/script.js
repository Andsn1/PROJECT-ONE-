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
var eventLimit = 100;

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
  //generating HTML Elements
  var mainCard = $("<div>");
  var cardHeader = $("<div>");
  var cardBody = $("<div>");
  var cardFooter = $("<div>");
  var eventTitleEl = $("<h3>");
  var eventDateEl = $("<span>");
  var eventDetailList = $("<ul>");

  var eventTypeEl = $("<li>");
  var eventOpenEl = $("<li>");
  var eventScoreEl = $("<li>");
  var eventStatusEl = $("<li>");
  var eventPerformersEl = $("<li>");
  //for each performer we require to create seperate block of elements

  var formated_date = dayjs(eventObject.dateTime).format("DD [of] MMMM YYYY");

  //assigning values to  elements

  $(eventTitleEl).text(eventObject.title);
  $(eventDateEl).text(formated_date);
  $(eventTypeEl).text(`Event Type: ${eventObject.eventType}`);
  eventOpenEl.text(`Is Open: ${eventObject.isOpen}`);
  eventScoreEl.text(`Score: ${eventObject.score}`);
  eventStatusEl.text(`Status: ${eventObject.status}`);

  //adding classes to card elements
  eventDetailList.addClass("group-item");

  eventTypeEl.addClass("list-group-item");
  eventOpenEl.addClass("list-group-item");
  eventScoreEl.addClass("list-group-item");
  eventStatusEl.addClass("list-group-item");

  eventTypeEl.addClass("list-group-item");
  eventTypeEl.addClass("list-group-item");
  eventTypeEl.addClass("list-group-item");

  mainCard.addClass("card col-md-5 m-2");
  cardHeader.addClass("card-header");
  cardBody.addClass("card-body");
  cardFooter.addClass("card-footer");
  eventPerformersEl.addClass("list-group-item");

  $(eventDetailList).append(eventTypeEl);
  $(eventDetailList).append(eventOpenEl);
  $(eventDetailList).append(eventScoreEl);
  $(eventDetailList).append(eventStatusEl);

  for (var i = 0; i < eventObject.performers.length; i++) {
    var eventPerformerListEl = $("<ul>");
    var eventPerformerTypeEl = $("<li>");
    var eventPerformerNameEl = $("<li>");
    var eventPerformerImageEl = $("<li>");
    var eventPerformerImageContainer = $("<div>");
    var eventPerformerImage = $("<img>");

    eventPerformerListEl.addClass("group-item");

    eventPerformerTypeEl.addClass("list-group-item");
    eventPerformerNameEl.addClass("list-group-item");
    eventPerformerImageEl.addClass("list-group-item");
    eventPerformerImage.addClass("img-fluid");

    eventPerformerImage.attr("src", `${eventObject.performers[i].image}`);
    eventPerformerTypeEl.text(`Type: ${eventObject.performers[i].type}`);
    eventPerformerNameEl.text(`Name: ${eventObject.performers[i].name}`);

    $(eventPerformersEl).append(eventPerformerListEl);
    $(eventPerformerListEl).append(eventPerformerTypeEl);
    $(eventPerformerListEl).append(eventPerformerNameEl);
    $(eventPerformerListEl).append(eventPerformerImageEl);
    $(eventPerformerImageContainer).append(eventPerformerImage);
    $(eventPerformerImageEl).append(eventPerformerImageContainer);
  }

  //appending elements to HTML
  $(cardHeader).append(eventTitleEl);
  $(cardFooter).append(eventDateEl);

  $(cardBody).append(eventDetailList);
  $(eventDetailList).append(eventPerformersEl);

  mainCard.append(cardHeader);
  mainCard.append(cardBody);
  mainCard.append(cardFooter);
  $("#event-list").append(mainCard);
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
            generateRestaurantCard(restaurant);
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
  var restaurantParrent = $("#restaurant-list");
  var maincard = $("<div>");
  var cardHeader = $("<div>");
  cardHeader.addClass("card-header");
  var cardBody = $("<div>");
  var cardFooter = $("<div>");
  var cardList = $("<ul>");
  var restaurantTitle = $("<span>");
  var restaurantAddress = $("<li>");
  var postCodeEl = $("<li>");
  var restaurantRating = $("<li>");

  restaurantAddress.addClass("list-group-item");
  restaurantRating.addClass("list-group-item");
  postCodeEl.addClass("list-group-item");
  cardList.addClass("list-group");

  $(restaurantTitle).text(restaurant.Name);
  $(restaurantAddress).text(
    `Address: ${restaurant.Address1} ${restaurant.Address2}`
  );
  $(postCodeEl).text(`Post Code: ${restaurant.postcode}`);

  $(restaurantRating).text(`Rating: ${restaurant.Rating}`);

  cardHeader.append(restaurantTitle);

  cardList.append(restaurantAddress);
  cardList.append(postCodeEl);
  cardList.append(restaurantRating);

  cardBody.append(cardList);

  maincard.addClass("card col-md-3 m-3");
  cardBody.addClass("card-body");
  cardFooter.addClass("card-footer");

  maincard.append(cardHeader);
  maincard.append(cardBody);
  maincard.append(cardFooter);

  restaurantParrent.append(maincard);
}