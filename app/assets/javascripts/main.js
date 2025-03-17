$(document).ready(function() {
    $('.msg').delay(2000).fadeOut('slow');


    $('.datepicker').datepicker({
        autoclose: true,
        format: "dd-mm-yyyy",
        immediateUpdates: true,
        todayBtn: true,
        todayHighlight: true
    }).datepicker("setDate", "0");
});


$(document).on("ajax:success", "#year-form", function(event) {
    $("#exampleModal").modal("hide");
    $("#year-form")[0].reset();
    location.reload(); // Reloads the list after adding
});