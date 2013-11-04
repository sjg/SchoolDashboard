var ios_feeds_url = "../common_assets/proxyFetch.php?feeds";
var ios_cat_url = "../common_assets/proxyFetch.php?cat";
var components = "../common_assets/components.json";

var editToggle = 0;

$(document).ready(function() {
	$("#addButton").click( function(){
		$('#addModal').modal('toggle');
	}); 

	$("#editButton").click( function(){
		$('#addModal').modal('hide');
		
		if(editToggle == 1){
			$.each($('.gridster li'), function(k,v){
				$(this).find(".widgetClose").remove();
				editToggle = 0;
				gridster.enable();
			});
		}else{
			$.each($('.gridster li'), function(k,v){
				$(this).append("<div class='widgetClose'>&times;</div>");
				editToggle = 1;
				gridster.disable();
			});
		};
	});

	$(document).on("click", ".widgetClose", function(){
		console.log($(this).parent());
	});

	$(".widgetClose").live(function(){
		console.log($(this).parent());
	});

	//$( ".typeSelectable" ).selectable();

	$("#standardButton").click( function(){
		//Clear list
		$(".step2List").html("");
		$(".step3List").html("");
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
					};
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

			var feedID = $("#" + ui.selected.id).attr("data-feedID");
			var type = $("#" + ui.selected.id).attr("data-type");
			
			console.log('Selected feedID: ' + feedID);
			console.log("Selected type: " + type);
 

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




});