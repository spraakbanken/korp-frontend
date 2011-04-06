(function($) {

	$.sm = function(src) {
		var self = this;
		
		this.init = function() {
			var ext = src.split(".").slice(-1);
			if(ext == "xml" ) {
				this.compileAndRun(src);
			} else if(ext == "js") {
				require([src], function() {
					$.log("scxml fetch time", new Date().getTime() - t );
					self.compiledStatechartInstance = new StatechartExecutionContext();
					self.run();
				});
			} else {
				$.error("malformed url in StateMachine contructor: " + src);
			}
			
		};
		
		this.compileAndRun = function(scxmlSrc) {
			require(
					{
						"baseUrl":"./"
					},
					["lib/scxml/SCXMLCompiler",
					 "xml!" + scxmlSrc],
					 
					 function(compiler,scxml_input){
						
						require([ window.DOMParser ?
								"lib/scxml/browser" :
									"lib/scxml/ie"],
									function(transform) {
							
							
							//compile statechart
							compiler.compile({
								inFiles:[scxml_input],
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
								
								eval(transformedJs);
								self.compiledStatechartInstance = new StatechartExecutionContext();
								$.log("statechart compiled and started");
								$.log("compile time", new Date().getTime() - t );
								delete t;
								self.run();
							},transform);
						}
					);
				}
			);
		};
		
		this.run = function() {
//			$.log("run", StatechartExecutionContext)
//			var compiledStatechartConstructor = StatechartExecutionContext;
//			self.compiledStatechartInstance = new compiledStatechartConstructor();
			
			//initialize
			self.compiledStatechartInstance.initialize();
		};
		
		this.send = function(event, data) {
			self.compiledStatechartInstance[event](data);
		};
		
		this.init();
		
	};

})(jQuery);