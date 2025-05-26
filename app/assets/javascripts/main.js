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

$(document).ready(function () {
    var $input = $('.tag');
    var dataTags = $input.attr('data-tags');

    try {
        var tagWhitelist = JSON.parse(dataTags);
        var tagify = new Tagify($input[0], {
            dropdown: { enabled: 0 },
            whitelist: tagWhitelist
        });

        // 💡 Convert Tagify JSON to string before form submit
        $('.tag-form').on('submit', function () {
            var tagsArray = tagify.value; // array of { value: 'tag' }
            var tagString = tagsArray.map(function (tag) {
                return tag.value;
            }).join(',');

            $input.val(tagString); // overwrite input value
        });

    } catch (e) {
        console.error("Invalid JSON in data-tags:", e);
    }
});
