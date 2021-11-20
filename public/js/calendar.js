$(document).ready(function() {
    $(".event_card").on('click', function(event) {
        $('#event_details').modal('show');
    });

    $("#lecture_description").richText({
        bold: true,
        
    });
});