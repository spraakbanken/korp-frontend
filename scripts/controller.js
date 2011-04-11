(function($) {

	$.sm = function(src, readyCallback) {
		$.sm = this;
		var self = this;
		this.compiledDoc;
		
		this.init = function() {
			$.when(this.fetchScript(), this.fetchXML())
			.then(function(xhrArgArray, xmlArgArray) {
				// cookie
				var storedObj = JSON.parse($.jStorage.get("compiled_scxml"));
				var cookieLastMod;
				if(storedObj != null)
					cookieLastMod = new Date(storedObj.time);
				
				// precompiled javascript file: '_generatedStatechart.js'
				var scriptMod = new Date(xhrArgArray[2].getResponseHeader("Last-Modified"));
				
				// xml file.
				var xmlMod = new Date(xmlArgArray[2].getResponseHeader("Last-Modified"));
				
				$.log(cookieLastMod, scriptMod, xmlMod);
				
				function max(a, b) {
					return a > b ? a : b;
				}
				
				switch($.reduce([cookieLastMod, scriptMod, xmlMod], max )) {
				case cookieLastMod:
					$.log("scxml: running stored data");
					self.run(storedObj.data);
					break;
				case scriptMod:
					$.log("scxml: running precompiled");
					self.run(xhrArgArray[0]);
					break;
				case xmlMod:
					$.log("scxml: recompiling");
					self.compileAndRun(xmlArgArray[0]);
					break;
				}
				
			}, function() {
				$.error("loading of either scxml script file or xml file failed");
			});
		};
		
		this.fetchXML = function() {
			return $.ajax({
				  url: "korp_statemachine.xml",
				  dataType : "text"
			});
		};
		
		this.fetchScript = function() {
			return $.ajax({
				  url: "scripts/_generatedStatechart.js",
				  dataType : "text"
			});
		};
		
		this.compileAndRun = function(scxmlSrc) {
			var t = new Date().getTime();
			require(
					{
						"baseUrl":"./"
					},
					["lib/scxml/SCXMLCompiler"],
					 
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
								
								$.jStorage.set("compiled_scxml", JSON.stringify({data : transformedJs, time : new Date()}));
								
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
			this.compiledDoc = scxmlScript;
			$.log("scxmlScript", scxmlScript);
			eval(scxmlScript);
			self.compiledStatechartInstance = new StatechartExecutionContext();
			self.compiledStatechartInstance.initialize();
			readyCallback();
		};
		
		this.send = function(event, data) {
			self.compiledStatechartInstance[event](data);
		};
		
		this.init();
		
	};

})(jQuery);