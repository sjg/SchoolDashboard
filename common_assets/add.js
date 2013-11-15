var ios_feeds_url = "../common_assets/proxyFetch.php?feeds";
var ios_cat_url = "../common_assets/proxyFetch.php?cat";
var components = "../common_assets/components.json";
var editToggle = 0;

$(document).ready(function() {
    $("#addButton").click( function(){
        $('#addModal').modal('toggle');
        $("#widgetPreview").hide();
    });
    $("#editButton").click( function(){
        $('#addModal').modal('hide');
        $("#widgetPreview").hide();
        if(editToggle == 1){
            $.each($('.gridster li'), function(k,v){
                $(this).find(".widgetClose").remove();
                editToggle = 0;
                gridster.enable();
            });
        } else {
            $.each($('.gridster li'), function(k,v){
                $(this).append("<div class='widgetClose'>&times;</div>");
                editToggle = 1;
                gridster.disable();
            });
        }
    });

    $(document).on("click", ".widgetClose", function(){
        // console.log($(this).parent().parent().id);
        // console.log($(this).parent()[0].id);
        var clickedWidget = $(this).parent()[0];
        $.each($('.gridster li'), function(k,v){
            if($(v).attr("id") === clickedWidget.id){
                console.log("found: " + k);
                gridster.remove_widget($(clickedWidget), function(callback){
                    //Send to firebase
                    var widgets = gridster.serialize();
                    $.each(widgets, function(k, v){
                        //Remove close button from widgets
                        $('.gridster li').eq(k).find(".widgetClose").remove();
                        v.htmlString = $('.gridster li').eq(k).html();
                    });
                    fb_widgets = fb.child('widgets');
                    fb_widgets.set(widgets);
                    console.log("Removed item - Updates sent to Firebase");
                });
            }
        });
    });

    $("#standardButton").click( function(){
        //Clear list
        $(".step2List").html("");
        $(".step3List").html("");
        $("#widgetPreview").hide();

        $("#addWidgetButton").attr('disabled', 'disabled').addClass('disabled');

        $(".dynamicStep3").html("Preview");
        $.getJSON(components, function(data) {
            $.each(data.widgetList, function(k, v){
                $(".step2List").append('<li id="' + v.name + '" data-feedID="' + v.name + '" data-type="local">' +v.name+'</li>');
            });
        });
    });

    $("#portalButton").click( function(){
        //Clear list
        $(".step2List").html("");
        $(".step3List").html("");
        $("#widgetPreview").hide();
        $("#addWidgetButton").attr('disabled', 'disabled').addClass('disabled');
        $(".dynamicStep3").html("Stream");
        $.getJSON(ios_feeds_url, function(data) {
            //Loop around to remove frozen data
            var itemArray = data.items;
            var liveItems = new Array();
            $.each(itemArray, function(k,v){
                //Loop around the metadata for each object
                // checking for a live or frozen status
                $.each(v['i-object-metadata'], function(j,s){
                    if(s['rel'] == "urn:X-xively:rels:hasStatus"){
                        if(s["val"] == "live"){
                            //Found frozen item -- remove item k from list
                            liveItems.push(v);
                        }
                    }
                });
            });
            $.each(liveItems, function(k, v){
                //Lookup name for each element
                $.each(v['i-object-metadata'], function(j,s){
                    if(s.rel == "urn:X-xively:rels:hasTitle:en"){
                        var title = s.val;
                        var eleID = v.href.replace("/cat/feeds/", "");
                        $(".step2List").append('<li id="'+ eleID +'" data-feedID="' + eleID + '" data-streamID="" data-type="remote">' + title +'</li>');
                    }
                });
            });
        });
    });
    //Selectable Event Trigger -- Second List Select
    $(".typeSelectable").selectable({
        selected: function( event, ui ) {

            $("#addWidgetButton").attr('disabled', 'disabled').addClass('disabled');
            var feedID = $("#" + ui.selected.id).attr("data-feedID");
            var type = $("#" + ui.selected.id).attr("data-type");
            console.log('Selected feedID: ' + feedID);
            console.log("Selected type: " + type);

            $("#widgetPreview").hide();

            if(type == "remote"){
                if(xively != undefined){
                    xively.feed.get(feedID, function (datastream) {
                        $(".step3List").html("");
                        $.each(datastream.datastreams, function(k,v){
                            var eleID = feedID + ":" + streamID;
                            var streamID = v.id;
                            var title = v.unit.label;
                            $(".step3List").append('<li id="'+ eleID +'" data-feedID="' + feedID + '" data-streamID="' + streamID +'">' + title +'</li>');
                        });
                    });
                }
            }
            if(type == "local"){
                $.getJSON(components, function(data) {
                    $(".step3List").html("");
                    $.each(data.widgetList, function(k, v){
                        if(v.name == feedID){
                            $.each(v.widgets, function(j, s){
                                $(".step3List").append('<li id="' + s.name + '" data-feedID="' + s.name + '" data-type="local">' +s.name+'</li>');
                            });
                        }
                    });
                });
            }
        }
    });
    $(".typeSelectableLast").selectable({
        selected: function( event, ui ) {
            $("#widgetPreview").show();
            $("#addWidgetButton").button("Add Widget");
            setTimeout(function(){
                //Render the Preview Widget
                console.log($("#" + ui.selected.id));
                $("#" + ui.selected.id).attr("");
                $("#widgetPreviewArea").html("");
                $("#widgetPreviewArea").append("<div class='gridsterPreview'><ul></ul></div>");
                $(".gridsterPreview ul").append(addRow("w"+99, 0, 0, 2, 1, '<div id="number">12g</div><br/><div id="sub">Preview Text</div>'));
                //Create Preview Gridster
                var gridsterPreview = $(".gridsterPreview > ul").gridster({
                    widget_margins: [10, 10],
                    widget_base_dimensions: [140, 140],
                    static_class: 'custom_class'
                }).data('gridsterPreview');
                $("#addWidgetButton").button("Add Widget");
            }, 550);
        }
    });
    $("#addWidgetButton").click(function(){
        $('#addModal').modal('toggle');
    });
});
