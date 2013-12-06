/**
 * jQuery Distance Project - Advanced visualisations made easy
 *
 * @author	Steven Gray <steven.james.gray@gmail.com>
 * @url		http://www.stevenjamesgray.com
 * @company   UCL Centre for Advanced Spatial Analysis
 * @version	0.0.1
 */

(function(jQuery){

	jQuery.fn.Distance = function(options){
		// Build main options before element iteration
		var opts = jQuery.extend({}, jQuery.fn.Distance.defaults, options);


		// Iterate through each element
		return this.each(function()
		{

			if(opts.type != undefined){
				opts.type = opts.type.toLowerCase();
			}

			switch(opts.type){
				case "standard" :
									console.log("Type: Standard");
									return(standardViz(this, opts));
									break;
				case "map" :
									console.log("Type: Map [simple]");
									return(standardMap(this, opts))
									break;
				case "windrose" :
									console.log("Type: Windrose");
									return(windRose(this, opts))
									break;
				default: 
					console.log("Type: Not defined for div <#" + this.id + "> with type: " + opts.type);
			}
		});

		// Default settings
		jQuery.fn.Distance.defaults =
		{
			type: "standard"
		}

		jQuery.fn.Distance.getOptions ={}

		// **********************************************************************************************
		//							Private Visualisation functions		
		// **********************************************************************************************

		function standardViz(div, options){
			//Set a placeholder image for the moment
			//$(div).html('<img src="http://placehold.it/'+ $(div).width()+'x'+ $(div).height()+'">');
			var uniqid = generateUID();

			console.log(generateUID());

			var arrowHeight = 50;

			console.log("Xively Object");
			console.log(xively);

			d3.select("#"+div.id).select("svg").remove();
			var svgCanvas = d3.select("#"+div.id).append("svg")
											.attr("width", $(div).width())
											.attr("height", $(div).height())
											.attr("id", uniqid)
											.on("click", function(){
      											// arrow.transition()
      											// 	.duration(2000)
											      	//.attrTween("transform", tween);

											    // function tween(d, i, a) {
											    //   return d3.interpolateString("rotate(0, 56.6, 50)","rotate(180, 56.6, 50)");
											    // }
											});

			svgCanvas.append("text").attr("x", ($(div).width() / 2) - (32 / 2) )
							   .attr("y", ($(div).height() / 2) + ( 32 / 4))
							   .attr("class", "number")
							   .text(Math.floor(Math.random()*90) + "")
							   .style("font-size", 64 + "px")
							   .attr("text-anchor", "start");

			var downArrow = function(){
				d3.select("#" + div.id).select("svg").select("line").remove();

				svgCanvas.append("marker").attr("id", "triangle")
								 .attr("viewBox", "0 0 10 10")
								 .attr("refX", "0")
								 .attr("refY", "5")
								 .attr("markerUnits", "strokeWidth")
								 .attr("markerWidth", "4")
								 .attr("markerHeight", "3")
								 .attr("fill", "red")
								 .attr("orient", "auto")
								 .append("path")
							        .attr("d", "M 0 0 L 10 5 L 0 10 z");

				svgCanvas.append("line").attr("x1", 0 + ($(div).width() / 3 ) - 10) 
							   .attr("y1", 0 + ($(div).height() / 2) - (arrowHeight))
							   .attr("x2", 0 + $(div).width() / 3 - 10)
							   .attr("y2", arrowHeight + ($(div).height() / 2) - (arrowHeight))
							   .attr("marker-end", "url(#triangle)")
							   .attr("stroke", "red")
							   .attr("stroke-width", "10")
							   .attr("id", "arrow");
			}

			var upArrow = function(){
				d3.select("#" + div.id).select("svg").select("line").remove();

				svgCanvas.append("marker").attr("id", "triangle")
								 .attr("viewBox", "0 0 10 10")
								 .attr("refX", "0")
								 .attr("refY", "5")
								 .attr("markerUnits", "strokeWidth")
								 .attr("markerWidth", "4")
								 .attr("markerHeight", "3")
								 .attr("fill", "green")
								 .attr("orient", "auto")
								 .append("path")
							        .attr("d", "M 0 0 L 10 5 L 0 10 z");

				svgCanvas.append("line").attr("x2", 0 + ($(div).width() / 3 ) - 10) 
							   .attr("y2", 0 + ($(div).height() / 2) - (arrowHeight) + 20)
							   .attr("x1", 0 + $(div).width() / 3 - 10)
							   .attr("y1", arrowHeight + ($(div).height() / 2) - (arrowHeight) + 20)
							   .attr("marker-end", "url(#triangle)")
							   .attr("stroke", "green")
							   .attr("stroke-width", "10")
							   .attr("id", "arrow");
			}

			var noMove = function(){
				d3.select("#" + div.id).select("svg").select("line").remove();
				svgCanvas.append("line").attr("x1", 30 + 0) 
							   .attr("y2", ($(div).height() / 2))
							   .attr("x2", 30 + 30)
							   .attr("y1", ($(div).height() / 2))
							   .attr("stroke", "black")
							   .attr("stroke-width", "10")
							   .attr("id", "arrow");
			}

			var drawViz = function(){
			
				xively.feed.get(options.feedID, function( data ) {  
  					//var value = Math.floor(Math.random()*99);
  					var value = data.datastreams[options.deviceID].current_value;
  					//Get the last value
					var lastValue = d3.select("#" + div.id).select("svg").select("text").text()

					if(lastValue < value){
						upArrow();
					}else if(lastValue == value){
						// Draw the line
						noMove();
					}else{
						downArrow();
					}
					
					//Set the Value
					d3.select("#" + div.id).select("svg").select("text").text(value + "%");
				}); 
			}

			drawViz();
			setInterval(drawViz,5000);
		}

		function standardMap(div, options){
			//Set a placeholder map for the moment
			if(typeof google != 'undefined' && google){
					var type;
					switch(options.maptype.toLowerCase()){
						case 'road':
						case 'roadmap':
							type = google.maps.MapTypeId.ROADMAP;
							break; 
						case 'hybrid':
							type = google.maps.MapTypeId.HYBRID;
							break;
						case 'sat':
						case 'satellite':
							type = google.maps.MapTypeId.SATELLITE;
							break;
						case 'terrain':
							type = google.maps.MapTypeId.TERRAIN;
							break; 
						default:
							type = google.maps.MapTypeId.ROADMAP;
							break; 
					}

					if(options.latitude == undefined){
						options.latitude = 0.0;
					}

					if(options.longitude == undefined){
						options.longitude = 0.0;
					}

					var myOptions = {
		      				zoom: options.zoom,
		      				center: new google.maps.LatLng(options.latitude,options.longitude),
		      				mapTypeId: type,
		   					mapTypeControl: true,
							streetViewControl: false,
							mapTypeControlOptions: {
								style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
								position: google.maps.ControlPosition.RIGHT_TOP
							}			
					};	

					// Create default map and set initial options
					var gmap = new google.maps.Map(div, myOptions);
					var geocoder = new google.maps.Geocoder();

					if(options.address != undefined){
						geocoder.geocode( { 'address': options.address}, function(results, status) {
	      					if (status == google.maps.GeocoderStatus.OK) {
	        					gmap.setCenter(results[0].geometry.location);
	      					} else {
	        					console.log("Ooops, Geocode was not successful for the following reason: " + status);
	      					}
	    				});
					}
				
					//Set style if it is set
					if(options.setStyle != undefined || options.setStyle != ''){
						if(jQuery.isPlainObject(options.setStyle)){
							var styledMapOptions = {
		      											map:  gmap,
		      											name: options.setStyle.id
		    							    		};
		    							    		
		    				var gSMapType =  new google.maps.StyledMapType(options.setStyle.style,styledMapOptions);
		    				gmap.mapTypes.set(options.setStyle.id, gSMapType);
		    				
		    				gmap.setOptions({
		                	    		 mapTypeControlOptions: {
		                	        	 		mapTypeIds: [
		                	        	        	options.setStyle.id,
		      										google.maps.MapTypeId.ROADMAP,
		      										google.maps.MapTypeId.TERRAIN,
		      										google.maps.MapTypeId.SATELLITE,
		      										google.maps.MapTypeId.HYBRID
		    				   	  				], 
		    				   	  		 		position: google.maps.ControlPosition.RIGHT_TOP
		  							 	} 
		                	}); 
		                	
		    				gmap.setMapTypeId(options.setStyle.id);
						}
					}
			}else{
				console.log("Google Maps not loaded");
			}

		}

		function windRose(div, options){
			console.log("WindRose called");

		}

		//*******************************************************************

		function generateUID() {
    		return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4)
		};
	}

})(jQuery);