// Define temp constants
var activeFeeds = ["1226870265", "1000993302", "2080560461", "461918509", "939747700"];
var feedIndex = 1;
var gridster;

//Define Keys to use
xively.setKey("");
// firebase functionality
var fb = new Firebase('https://distance-project.firebaseio.com');

function slabTextHeadlines() {
            $("h1").slabText({
                "viewportBreakpoint":380
            });
}

function getTime(){
        var seconds = new Date().getSeconds();
        var minutes = new Date().getMinutes();
        var hours = new Date().getHours();

        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        hours = hours < 10 ? "0"  + hours: hours;

        $(".time").html("<p>" + hours + ":" + minutes + ":" + seconds + "</p>");
}
var getData = function(feedID){
    console.log("Getting Data");
    if (feedID === undefined){
        feedID = activeFeeds[feedIndex];
    }

    xively.feed.get(feedID, function (datastream) {
        $.each(datastream.datastreams, function(key, value){
            symbol = value.unit.symbol == "degC" ? "&deg;" : value.unit.symbol;
            $(".val" + (key + 1)).html(value.current_value + symbol);
            $(".sub" + (key + 1)).html(value.unit.label);
            //callback(datastream);
        });
    });
};

$(function(){
    getTime();
    getData(activeFeeds[feedIndex]);
    setTimeout(slabTextHeadlines, 100);
    setInterval(getTime, 1000);
    setInterval(getData, 1000 * 10);
    //Set Map
    var styleOptions = [
        {
            featureType: 'all',
            stylers: [
                {saturation: -100},
                {gamma: 0.50},
                {invert_lightness: 'true'}
            ]
        },
        { featureType: "all",  elementType: "labels", stylers: [ { visibility: "off" } ] },
        { featureType: "poi",  elementType: "all",    stylers: [ { visibility: "off" } ] },
        { featureType: "road", elementType: "all",    stylers: [ { visibility: "off" } ] }
    ];

    jQuery("#map").Distance({
        type:    'map',
        latitude : 51.3975829,
        longitude : -2.351136,
        zoom:    13,
        maptype: 'hybrid'
    });
});
// fired on page load, then each time data changes on Firebase
var addRow = function(row, col, x_size, y_size, content){
    return "<li data-row='"+row+"' data-col='"+col+"' data-sizex='"+x_size+"' data-sizey='"+y_size+"'>"+content+"</li>";
};
fb.on('value', function(snapshot){
    console.log("Received update from Firebase");
    $(".gridster").html("<ul></ul>");
    $.each(snapshot.val(), function(k, v){
        $(".gridster ul").append(addRow(v.row, v.col, v.size_x, v.size_y, v.htmlString));
        });
    gridster = $(".gridster > ul").gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [140, 140],
    static_class: 'custom_class',
    draggable: {
        items: ".gs_w:not(.custom_class)",
        stop:
            function(event, ui){
                var widgets = gridster.serialize();
                $.each(widgets, function(k, v){
                v.htmlString = $('.gridster li').eq(k).html();
            });
            fb.set(widgets);
            console.log("Updates sent to Firebase");
            }
    }}).data('gridster');
    });