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

// HTML input fields
var trainNameInput, destinationInput, startInput, frequencyInput;

// Variables to hold HTML field values
var trainName, destination, start, frequency;

// Form field validation error message
var errMsg = "";

// Unique value for database records
var index = 0;

// Database reference
var trainRef = database.ref();


/* --------- Functions ---------------- */
/* 
 * Function: to validation HTML field input. 
 * Return value: true - all field inputs valid. false - invalid input detected
 */
function validateInput() {
  
    // Get user input
    trainName = trainNameInput.val().trim();
    destination = destinationInput.val().trim();
    start = startInput.val().trim();
    frequency = Number(frequencyInput.val().trim());

    // Fail validation if there is any empty field
    if (trainName.length === 0 || destination.length === 0 || start.length === 0 || frequency.length === 0) {
      errMsg = "All fields must be filled."
      return false;
    }

    // Fail validation if tart time is not in the format of HH:mm
    var timePattern = new RegExp(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!timePattern.test(start)) {
      console.log(start);
      errMsg = "Please enter start time in the format of military time HH:mm";
      return false;
    }

    console.log(frequency);
    // Fail validation if frequncy is not a positive number
    if (!(Number.isInteger(frequency)) || frequency <= 0) {
      errMsg = "Frequency must be a positive integer";
      return false;
    }

    // All validations passed
    return true;
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
    //database.ref().push(newTrain);
    //var trainRef = database.ref('trains/' + index);
    trainRef.child(index).set(newTrain);

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
  
  //console.log(snapshot.val());

  // Store everything into a variable.
  var trainName = snapshot.val().trainName;
  var destination = snapshot.val().destination;
  var start = snapshot.val().start;
  var frequency = snapshot.val().frequency;

  // Prettify the employee start
  //var empStartPretty = moment.unix(empStart).format("MM/DD/YYYY");

  // Calculate minutes away. 
  var totalMin = moment().diff(moment(start, "X"), "minutes");
  var minAway = frequency - (totalMin % frequency);

  // Calculate the time of next train
  var currentTime = moment();
  var nextTime = (currentTime.add(minAway, "minutes")).format("HH:mm");

  // Create the remove button
  var removeBtn = $("<button>");
  removeBtn.attr("value", index);
  removeBtn.attr("class", "remove-btn");
  removeBtn.text("remove");

  // Create the new row
  var newRow = $("<tr id='tr-"+ index + "'>").append(
    $("<td value="+ index + ">").text(trainName),
    $("<td value="+ index + ">").text(destination),
    $("<td value="+ index + ">").text(frequency),
    $("<td value="+ index + ">").text(nextTime),
    $("<td value="+ index + ">").text(minAway),
    $("<td value="+ index + ">").append(removeBtn)
  );
  index++;

  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
});

/*
 * Function: function to remove a child record from the database
 * Input param: the id of the child record
 */
function removeTrain(id) {
  console.log(id);
  $("#tr-"+id).remove();
  trainRef.child(id).remove();
  
}

/*
 * Function: Firebase callback for removing a record to the database. Remove the table row when this happens
 */
//database.ref().on("child_removed", function(snapshot) {
  
//});

/* ----------- Start here -------------- */

$("document").ready(function() {
  
    trainNameInput = $("#train-name-input");
    destinationInput = $("#destination-input");
    startInput = $("#start-input");
    frequencyInput = $("#frequency-input");

    // Add train button listener
    $("#add-train-btn").on("click", function(event) {
      event.preventDefault();

      // Validate user input. If all fields valid, add the train; else, display error message
      if (validateInput()) {
        $("#info").text("");
        addTrain();
      }
      else {
        $("#info").text(errMsg);
      }

    });

    // Remove train button listener
    $(document).on("click", ".remove-btn", function() {   

      // Call remove function
      removeTrain($(this).attr("value"));
  });

});



