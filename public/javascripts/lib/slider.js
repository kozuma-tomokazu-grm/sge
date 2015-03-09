$(function() {
    $( "#slider" ).slider({
        value:0,
        min: 0,
        max: 50000,
        step: 1000,
        slide: function( event, ui ) {
            $( "#amount" ).val( ui.value );
        }
    });
    $( "#amount" ).val( $( "#slider" ).slider( "value" ) );
});
