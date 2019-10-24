/* ----------- Global Variables ------------------ */

// Database related variables
var config = {
    apiKey: "AIzaSyAz0IqZQwX3Yl2XZYaaZ9FAUaGT7djz6kU",
    authDomain: "web-class-proj-1012.firebaseapp.com",
    databaseURL: "https://web-class-proj-1012.firebaseio.com",
    projectId: "web-class-proj-1012",
    storageBucket: "web-class-proj-1012.appspot.com",
    messagingSenderId: "411365492330",
    appId: "1:411365492330:web:a1771ff95be139499aec13"
  };
  
firebase.initializeApp(config);
  
var database = firebase.database();

// Database reference
var trainRef = database.ref();

// HTML input fields
var trainNameInput, destinationInput, startInput, frequencyInput;

// Variables to hold HTML field values
var trainName, destination, start, frequency;

/* --------- Functions ---------------- */
/* 
 * Function: to validation HTML field input. If all validations pass, add the train to the database
 * (Check duplicate train name is a callback function. Add train function has to be called inside that function.)
 */
function validateInput() {

    // Get user input values
    trainNameInput = $("#train-name-input");
    destinationInput = $("#destination-input");
    startInput = $("#start-input");
    frequencyInput = $("#frequency-input");
  
    // Get user input
    trainName = trainNameInput.val().trim();
    destination = destinationInput.val().trim();
    start = startInput.val().trim();
    frequency = Number(frequencyInput.val().trim());

    // Fail validation if there is any empty field
    if (trainName.length === 0 || destination.length === 0 || start.length === 0 || frequency.length === 0) {
      $("#info").text("All fields must be filled.");
      return;
    }

    // Fail validation if tart time is not in the format of HH:mm
    var timePattern = new RegExp(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!timePattern.test(start)) {
      $("#info").text("Please enter start time in the format of military time HH:mm");
      return;
    }

    // Fail validation if frequncy is not a positive number
    if (!(Number.isInteger(frequency)) || frequency <= 0) {
      $("#info").text("Frequency must be a positive integer");
      return;
    }

    // Fail validation if the train name already exists
    var query = trainRef.orderByChild("trainName").equalTo(trainName);
    query.once("value", function(snapshot) {

      if (snapshot.exists()){
        $("#info").text("Train name exists already.");
        return;
      }
      else {
        // Clean the error message display field
        $("#info").text("");

        // Add the train
        addTrain();
      }

    });

    return;
}

/* 
 * Function: to upload new record in firebase database
 */
function addTrain() {

    // Create a local object for holding train data
    var newTrain = {
      trainName: trainName,
      destination: destination,
      start: moment(start, "HH:mm").format("X"),
      frequency: frequency
    };

    // Upload train data to the database
    trainRef.push(newTrain);

    // Clear all of the text-boxes
    trainNameInput.val("");
    destinationInput.val("");
    startInput.val("");
    frequencyInput.val("");
}

/*
 * Function: Firebase callback for adding a record to the database. Add a table row when this happens
 */
database.ref().on("child_added", function(snapshot) {
  
  // Store everything into a variable.
  var trainName = snapshot.val().trainName;
  var destination = snapshot.val().destination;
  var start = snapshot.val().start;
  var frequency = snapshot.val().frequency;
  var key = snapshot.key;

  // Calculate minutes away and the time of next train based on current time and start time. 
  var currentTime = moment();
  var startTime = moment(start, "X");
  var totalMin, minAway, nextTime;

  // If the start time is before current time
  if (startTime.isBefore(currentTime)) {

    // Minutes away
    totalMin = currentTime.diff(startTime, "minutes");
    minAway = frequency - (totalMin % frequency);

    // Time of next train
    nextTime = (currentTime.add(minAway, "minutes")).format("HH:mm");
  }
  // If the start time is in the future
  else {

    // Minutes away (minutes from now to the start time)
    minAway = startTime.diff(currentTime, "minutes");

    // Time of next train (the start time)
    nextTime = startTime.format("HH:mm");
  }

  // Create the remove button, set value of the button as the child record key for the purposes of edit/remove.
  var removeBtn = $("<button>");
  removeBtn.attr("value", key);
  removeBtn.attr("class", "remove-btn");
  removeBtn.text("remove");

  // Create the new row. Set id of the row as the child record key for the purposes of edit/remove.
  var newRow = $("<tr id='tr-"+ key + "'>").append(
    $("<td id='name-"+ key + "'>").text(trainName),
    $("<td id='dest-"+ key + "'>").text(destination),
    $("<td id='freq-"+ key + "'>").text(frequency),
    $("<td id='nexttime-"+ key + "'>").text(nextTime),
    $("<td id='minaway-"+ key + "'>").text(minAway),
    $("<td id='remove-"+ key + "'>").append(removeBtn)
  );

  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
});

/*
 * Function: function to remove a child record from the database
 * Input param: the key of the child record
 */
function removeTrain(id) {
 
  trainRef.child(id).remove();
  
}

/*
 * Function: Firebase callback for removing a record to the database. Remove the table row when this happens
 */
database.ref().on("child_removed", function(snapshot) {
  
    $("#tr-"+snapshot.key).remove();
});

/* ----------- Start here -------------- */

$("document").ready(function() {
  
    // Add train button listener
    $("#add-train-btn").on("click", function(event) {
      event.preventDefault();

      // Validate user input. If all fields valid, add the train; else, display error message
      validateInput()
    });

    // Remove train button listener
    $(document).on("click", ".remove-btn", function() {   

      // Call remove function
      removeTrain($(this).attr("value"));
    });

});



