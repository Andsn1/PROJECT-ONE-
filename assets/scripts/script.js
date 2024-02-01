//API KEy for SeatGeek API
var apiKey = "Mzk2OTg5MTB8MTcwNjc4ODA4NC42NTY5MzAy";

//latitude and longitude variables
var lat;
var lon;

//TODO: requires to attach to user INPUT  // --> POSTCODE TO SEARCH
var postCode = "PE14AQ";
//TODO: requires to attach to user INPUT // --> Radius distance for search
var searchRange = "50mi";

//query function to retreive data from postcode api and executing getEvent query
function getPostCode() {
  //query to get postcode API data
  // PLEASE NOTE THAT RETURN CAN BE MULTIPLE ITEMS IN ARRAY DUE THAT USER CAN PASS IN HALF POST CODE
  // EG PE4 rather than PE4 xxx
  var postCodeQuery = `https://api.postcodes.io/postcodes?q=${postCode}`;
  console.log(postCodeQuery);
  fetch(postCodeQuery)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      // assigning {lon} and {lat} values to variables
      lon = data.result[0].longitude;
      lat = data.result[0].latitude;

      //executing function to find event based on {lon} & {lat}

      getEvent(lat, lon);
      //display console log for checkup
      console.log(`Lon: ${lon} & lat:${lat}`);
    });
}

//QUERY function to retreive data from seatgeek API

function getEvent(lat, lon) {
  var query = `https://api.seatgeek.com/2/events?lat=${lat}&lon=${lon}&range=${searchRange}&client_id=${apiKey}`;
  //output query string
  console.log(query);

  fetch(query)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //display console log for checkup
      console.log(eventList);
      return data.events;
    });
}

getPostCode();
