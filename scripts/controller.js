(function($) {

	$.sm = function(src) {
		var self = this;
		this.init = function() {
			
			require(
				{
					"baseUrl":"/korp/"
				},
				["lib/scxml/SCXMLCompiler",
					"xml!" + src],

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
								var compiledStatechartConstructor = StatechartExecutionContext;
								self.compiledStatechartInstance = new compiledStatechartConstructor();
		
								//initialize
								self.compiledStatechartInstance.initialize();
								$.log("statechart compiled and started");
							},transform);
						}
					);
				}
			);
		};
		
		
		this.send = function(event, data) {
			self.compiledStatechartInstance[event](data);
		};
		
		this.init();
		
	};

})(jQuery);