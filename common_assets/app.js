// Define temp constants
var activeFeeds = ["754702101", "1226870265", "1000993302", "2080560461", "461918509", "939747700"];
var feedIndex = 1;
var gridster;

//Define Keys to use
xively.setKey("5SRGqR6D7H6bkjhdwRuocYpKW0ZSXEzhgzb8U8tl07gESlI4");
// firebase functionality
var fb = new Firebase('https://distance-project.firebaseio.com');


function getUrlVars() {
    // use: var school = getUrlVars()["s"];
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


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
    console.log("Getting Data from Xively");
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
    return "<li data-feedid='foo' data-streamid='bar' data-row='"+row+"' data-col='"+col+"' data-sizex='"+x_size+"' data-sizey='"+y_size+"'>"+content+"</li>";
};

fb.on('value', function(snapshot){
    var msgdata = snapshot.val().results;
    $.each(msgdata, function(k, v) {
        if (v.school_id == getUrlVars()["s"]) {
            schooldata = v.widgets;

            //Hide the loading Screen
            $('#loadingScreen').hide();
            console.log("Received update from Firebase");
            $(".gridster").html("<ul></ul>");
            // Empty Case
            if(schooldata === undefined){
                 $('#loadingScreen').show();
                 $(".loadingText").html("Empty Dashboard");
                 $(".loadingImg").attr('src', "img/empty.png");
            } else {
                if(schooldata.length === 0){
                    $('#loadingScreen').show();
                    $(".loadingText").html("Empty Dashboard");
                    $(".loadingImg").attr('src', "img/empty.png");
                }
            }
            $.each(schooldata, function(k, v){
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
                    fb.set(
                        {results: [{
                            school_id: getUrlVars()["s"],
                            widgets: widgets
                        }]});
                    console.log("Updates sent to Firebase");
                    }
            }}).data('gridster');
        }
    });
});

// populate a dropdown with a JSON object containing feed details and the school name
$(document).ready(function() {
    $.getJSON("../common_assets/schools.json", function(data) {
        $.each(data.schools, function(key, value) {
            var option = $('<option />').val(value.activeFeeds).text(value.schoolName);
            $("#schools").append(option);
        });
    });
    // now, get feed ID and streams
});
