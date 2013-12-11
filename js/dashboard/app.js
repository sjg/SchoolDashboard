var Sensor = function sensor(feedID, streamID, elementID){
    this.feed = feedID;
    this.stream = streamID;
    this.elementID = elementID;
    this.functionName = undefined;
};

var XivelyStreamArray = new Array();

//Fake the data
XivelyStreamArray[0] = new Sensor(1090954378, 430618, "#w3");

// Define temp constants
var activeFeeds;
var feedIndex = 1;
var gridster;

//Define Keys to use
xively.setKey("5SRGqR6D7H6bkjhdwRuocYpKW0ZSXEzhgzb8U8tl07gESlI4");
// firebase functionality
var fb = new Firebase('https://distance-project.firebaseio.com/schools/' + getUrlVars()['s']);

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

var getData = function(sensorObject){
    if (sensorObject === undefined){
        return false;
    }
    if (sensorObject.feed === undefined){
        return false;
    }

    console.log("Getting Data from Xively");
    xively.feed.get(sensorObject.feed, function (datastream) {
        $.each(datastream.datastreams, function(key, value){
            if(value.id == sensorObject.stream){
                console.log(value);
                symbol = value.unit.symbol == "degC" ? "&deg;" : value.unit.symbol;
                $(sensorObject.elementID).find("#number").find(".val").html(value.current_value + symbol);
                $(sensorObject.elementID).find("#sub").html(value.current_value + symbol);
                $(sensorObject.elementID).find("#sub").html(value.unit.label);
            }
        });
    });
};

var streamLoop = function(){
    if (XivelyStreamArray.length === 0){
        return false;
    }
    $.each(XivelyStreamArray,function(k,v){
        // Loop around Stream Array adding values when needed to elements
        console.log(v);
        getData(v);
    });
    return true;
};

$(function(){
    getTime();
    streamLoop();

    setTimeout(slabTextHeadlines, 100);
    setInterval(getTime, 1000);
    // Set up the interval for looping around the stream array
    setInterval(streamLoop, 1000 * 10);

    //Set Map Style
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
});

// fired on page load, then each time data changes on Firebase
var addRow = function(id, row, col, x_size, y_size, content){
    return "<li id='"+id+"' data-feedid='foo' data-streamid='bar' data-row='"+row+"' data-col='"+col+"' data-sizex='"+x_size+"' data-sizey='"+y_size+"'>"+content+"</li>";
};

fb.on('value', function(snapshot){
    var msgdata = snapshot.val();
    var found = 0;
    $.each(msgdata, function(k, v) {
    console.log("Value:" + v);
    console.log("Key: " + k);
    console.log(snapshot.name().toLowerCase());
    console.log((getUrlVars()["s"]).toLowerCase());
    console.log( snapshot.name().toLowerCase() == (getUrlVars()["s"]).toLowerCase() );

        if ( snapshot.name().toLowerCase() == (getUrlVars()["s"]).toLowerCase() ) {
            schooldata = msgdata.widgets;
            found = 1;
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
                $(".gridster ul").append(addRow("w"+k, v.row, v.col, v.size_x, v.size_y, v.htmlString));
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
                        fb_widgets = fb.child('widgets');
                        fb_widgets.set(widgets);
                        console.log("Updates sent to Firebase");
                    }
            }}).data('gridster');

        gridster.enable();
            slabTextHeadlines();

            jQuery("#map").Distance({
                type:    'map',
                latitude : 51.3975829,
                longitude : -2.351136,
                zoom:    13,
                maptype: 'terrain'
            });
        }

        if(!found){
            // If we get here then dashboard doesn't exist
            $('#loadingScreen').show();
            $(".loadingText").html("Dashboard not found");
            $(".loadingImg").attr('src', "img/empty.png");
        }
    });
});

$(document).ready(function() {

});


$("#addButton").click(function(){
        $('#addModal').modal('show');
      });
      var fbase = new Firebase('https://distance-project.firebaseio.com/schools');
      fbase.on('value', function(snapshot) {
        $("#loadingScreen").hide();
        $("#toolbox").show();
        $("#title").show();
        var school_fb = snapshot.val();

        //Stop the data appending if we manually edit the firebase data for another dashboard
        $("#titleHeader").html("");
        $("#titleHeader").append("<ul>");

        $.each(school_fb, function(k,v){
          var addDeleteButton = function(id, stringName){
            return "<div style='float: right;' class='delete "+id+"' data-string='" + stringName +"'><img src='./img/delete.png' /></div>";
        };
        var addDashboardEntry = function(id, stringName){
            return "<a href='dashboard.html?s="+ id + "'> <div class='heading1'><h2>" + stringName + " Dashboard </h2></div></a>"; };
        $("#titleHeader").append("<li><div>");
        if(getUrlVars()["action"] === "delete" || getUrlVars()["action"] === "d" || getUrlVars()["a"] === "d" || getUrlVars()["action"] === "d"){
            $("#titleHeader").append(addDeleteButton(k, v.school_id));
        }
        $("#titleHeader").append(addDashboardEntry(k, v.school_id));
        $("#titleHeader").append("</div></li>");
        });
        $("#titleHeader").append("</ul>");

        //Add the delete handler
        $(".delete").click(function() {
          var delID = $(this).attr("class").replace('delete ', '');

          // Set the ID to delete
          $("#deleteButton").attr('data-id', delID);

          $(".modal-body-delete").html("Are you really sure you want to delete the <b>" + $(this).attr("data-string") + "</b> dashboard?");

          // Show the Modal
          $("#deleteModal").modal('show');

          // Enable the click handler for the delete button
          $("#deleteButton").click(function(){
            var deleteID = $(this).attr("data-id");

            var checkDel = new Firebase('https://distance-project.firebaseio.com/schools/' + deleteID + "/password" );
            checkDel.on('value', function(sshot) {
              if(sshot.val() === CryptoJS.SHA3($("#delPasswordCheck").val(), { outputLength: 256 }).toString() ){
                fbase.child(deleteID).remove(function(error){
                    if(!error){
                        $("#deleteModal").modal('hide');
                        $("#delPasswordCheck").val("");
                    } else {
                        alert('Remove failed.');
                    }
                });
              }
            });

          });
              });
      });
      $("#addCollectorButton").click(function(){
        if($("#dashboardName").val() !== "" && $("#dashboardName").val() !== "" && $("#inputPassword1").val() !== "" && $("#inputPassword2").val() !== ""){
          if($("#inputPassword1").val() === $("#inputPassword2").val()){
            //Add collector       
            var dbname = $("#dashboardName").val().toLowerCase().replace(" ","_");
            // Create the default objects for the dasboard
            //   -- Put this in a JSON file for easy access at a later date

            var obj = {
              'password': CryptoJS.SHA3($("#inputPassword1").val(), { outputLength: 256 }).toString(),
              'school_id': $("#dashboardName").val(),
              "widgets" : [ {
                       "size_y" : 2,
                         "col" : 1,
                         "htmlString" : "<div class='heading'><h1>" + $('#dashboardName').val() + "</h1><h1>Dashboard</h1></div>",
                         "size_x" : 4,
                         "row" : 1
                           },
                       {
                        "size_y" : 1,
                        "col" : 5,
                       "htmlString" : "<div id=\"number\"><div class=\"time\"></div><br><div id=\"sub\">Current Time</div></div>",
                        "size_x" : 2,
                        "row" : 1
                        }
                    ]
            };

            //Add object
            fbase.child(dbname).set(obj, function(error) {
                if (error) {
                    alert('Data could not be saved.' + error);
                } else {
                $('#addModal').modal('hide');
                }
            });

            //Clear the fields
            $("#dashboardName").val("");
            $("#inputPassword1").val("");
            $("#inputPassword2").val("");
          }
        }
      });

