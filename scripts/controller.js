(function($) {

	$.sm = function(src) {
		var self = this;
		
		this.init = function() {
			$.log("init", this.fetchScript);
			$.when(this.fetchScript(), this.fetchXML())
			.then(function(xhrArgArray, xmlEvent) {
				// cookie
				var cookieObj = JSON.parse($.jStorage.get("compiled_scxml"));
				var cookieLastMod;
				if(cookieObj != null)
					cookieLastMod = new Date(cookieObj.time);
				
				// precompiled javascript file: '_generatedStatechart.js'
				var scriptMod = new Date(xhrArgArray[2].getResponseHeader("Last-Modified"));
				
				// xml file.
				var remoteDoc = xmlEvent.target.contentWindow.document; 
				var lastModif = new Date(remoteDoc.lastModified);
				var xmlstr = $(remoteDoc.firstChild).xml(true);
				
				$.log(scriptMod, lastModif, scriptMod >= lastModif);
				
				if(cookieLastMod > scriptMod) {
					$.log("scxml: running cookie data");
					self.run(cookieObj.data);
				} else if(scriptMod >= lastModif) {
					$.log("scxml: running precompiled");
					self.run(xhrArgArray[0]);
				} else {
					$.log("scxml: recompiling");
					self.compileAndRun(xmlstr);
				}
				
			}, function() {
				$.error("loading of either scxml script file or xml file failed");
			});
		};
		
		this.fetchXML = function() {
			var deferred = $.Deferred();
			$("<iframe />").attr("src", src + "?" + new Date().getTime())
			.appendTo("body")
			.hide()
			.load(deferred.resolve);
			
			return deferred.promise();
		};
		
		this.fetchScript = function() {
			return $.ajax({
				  url: "scripts/_generatedStatechart.js",
				  dataType : "text"
			});
		};
		
		this.compileAndRun = function(scxmlSrc) {
			require(
					{
						"baseUrl":"./"
					},
					["lib/scxml/SCXMLCompiler"],
//					 "xml!" + scxmlSrc],
					 
					 function(compiler){
						
						require([ window.DOMParser ?
								"lib/scxml/browser" :
									"lib/scxml/ie"],
									function(transform) {
							
							
							//compile statechart
							compiler.compile({
								inFiles:[scxmlSrc],
								//debug:true,
								backend:"state",
								beautify:true,
								verbose:false,
								log:false,
								ie:true
							}, function(scArr){
								var transformedJs = scArr[0];
								
								//eval
//								$.log(transformedJs);
								$.log(transformedJs.length);
								$.jStorage.set("compiled_scxml", JSON.stringify({data : transformedJs, time : new Date()}));
//								$.log(JSON.stringify({data : transformedJs, time : new Date()}));
								
								$.log("statechart compiled and started: ");
								$.log("compile time", new Date().getTime() - t );
								delete t;
								self.run(transformedJs);
							},transform);
						}
					);
				}
			);
		};
		
		this.run = function(scxmlScript) {
			eval(scxmlScript);
			self.compiledStatechartInstance = new StatechartExecutionContext();
			self.compiledStatechartInstance.initialize();
		};
		
		this.send = function(event, data) {
			self.compiledStatechartInstance[event](data);
		};
		
		this.init();
		
	};

})(jQuery);