(function($) {

	$.sm = function(src) {
		var self = this;
		
		this.init = function() {
			
			var docXHR = $.ajax({
				  url: "scripts/_generatedStatechart.js",
				  dataType : "text"
				});
			
			$.log("append iframe");
			$("<iframe />").attr("src", src + "?" + new Date().getTime())
			.hide()
			.load(function() {
				$.log("load", $(this));
				var remoteDoc = $(this).get(0).contentWindow.document; 
				var lastModif = new Date(remoteDoc.lastModified);
				
				var xmlstr = $(remoteDoc.firstChild).xml(true);
				
				$.when(docXHR, {doc : xmlstr, date : lastModif})
				.then(function(xhr_args, scxml_doc) {
					var scriptMod = new Date(xhr_args[2].getResponseHeader("Last-Modified"));
					$.log(scriptMod, scxml_doc.date, scriptMod >= scxml_doc.date)
					if(scriptMod >= scxml_doc.date) {
						$.log("scxml: running precompiled");
						self.run(xhr_args[0]);
					} else {
						$.log("scxml: recompiling");
						self.compileAndRun(scxml_doc.doc);
					}
					
				});
			}).appendTo("body");
			
//			var ext = src.split(".").slice(-1);
//			if(ext == "xml" ) {
//				this.compileAndRun(src);
//			} else if(ext == "js") {
//				require([src], function() {
//					$.log("scxml fetch time", new Date().getTime() - t );
//					self.compiledStatechartInstance = new StatechartExecutionContext();
//					self.run();
//				});
//			} else {
//				$.error("malformed url in StateMachine contructor: " + src);
//			}
			
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
//								console.log(transformedJs);
								
								
								$.log("statechart compiled and started");
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
//			$.log("run", StatechartExecutionContext)
//			var compiledStatechartConstructor = StatechartExecutionContext;
//			self.compiledStatechartInstance = new compiledStatechartConstructor();
			
			eval(scxmlScript);
			self.compiledStatechartInstance = new StatechartExecutionContext();
			
			//initialize
			self.compiledStatechartInstance.initialize();
		};
		
		this.send = function(event, data) {
			self.compiledStatechartInstance[event](data);
		};
		
		this.init();
		
	};

})(jQuery);