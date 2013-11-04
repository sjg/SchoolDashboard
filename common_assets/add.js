var ios_feeds_url = "../common_assets/proxyFetch.php?feeds";
var ios_cat_url = "../common_assets/proxyFetch.php?cat";
var components = "../common_assets/components.json";

$(document).ready(function() {
	$("#addButton").click( function(){
		$('#addModal').modal('toggle');
	}); 

	$("#editButton").click( function(){
		$('#addModal').modal('hide');
	});

	//$( ".typeSelectable" ).selectable();

	$("#standardButton").click( function(){
		//Clear list
		$(".step2List").html("");
		$(".step3List").html("");
		$(".dynamicStep3").html("Preview");
		$.getJSON(components, function(data) {
			$.each(data.widgetList, function(k, v){
				$(".step2List").append('<li>' +v.name+'</li>');
			});
			//$( ".typeSelectable" ).selectable();
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
						$(".step2List").append('<li id="'+ eleID +'" data-feedID="' + eleID + '" data-streamID="">' + title +'</li>');
					}
				});
			});
		});
	});

	//Selectable Event Trigger -- Second List Select
	$(".typeSelectable").selectable({ 
		selected: function( event, ui ) {

			var feedID = $("#" + ui.selected.id).attr("data-feedID");
			console.log('Selected ' + feedID);

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
	});




});