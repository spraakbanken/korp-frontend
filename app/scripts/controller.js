(function($) {

	$.sm = function(src, readyCallback) {
		this.src = src;
		$.sm = this;
		var self = this;
		this.compiledDoc;
		
		this.init = function() {
			$.ajax({
				url: this.src,
				dataType : "text",
				success : function(doc, status, xhr) {
				  
					// cookie
					var storedObj = $.parseJSON($.jStorage.get("compiled_scxml_" + $.trim(window.location.pathname, "/")));
					var cookieLastMod = null;
					if(storedObj != null)
						cookieLastMod = new Date(storedObj.time);
					
					
					// xml file.
					var xmlMod = new Date(xhr.getResponseHeader("Last-Modified"));
					
					c.log(cookieLastMod, xmlMod);
					
					function max(a, b) {
						return a > b ? a : b;
					}
					
					switch($.reduce([cookieLastMod, xmlMod], max )) {
					case cookieLastMod:
						c.log("scxml: running stored data");
						self.eval(storedObj.data);
						break;
					case xmlMod:
						c.log("scxml: recompiling");
						self.compileAndEval(doc);
						break;
					}
				
				},
				error : function() {
					$.error("loading of either scxml script file or xml file failed");
				}
			});
		};
		
		this.compileAndEval = function(scxmlSrc) {
			var t = new Date().getTime();
			require(
					{
						"baseUrl":"./"
					},
					["lib/scxml/SCXMLCompiler"],
					 
					 function(compiler){
						
						require([ window.DOMParser && window.XSLTProcessor ?
								"lib/scxml/browser" :
									"lib/scxml/ie"],
									function(transform) {
							
							
							//compile statechart
							compiler.compile({
								inFiles:[scxmlSrc],
								//debug:true,
								backend:"state",
								beautify:false,
								verbose:false,
								log:false,
								ie:true
							}, function(scArr){
								var transformedJs = scArr[0];
								
								$.jStorage.set("compiled_scxml_" + $.trim(window.location.pathname, "/"), $.toJSON({data : transformedJs, time : $.now()}));
								
								c.log("statechart compiled and started: ");
								c.log("compile time", new Date().getTime() - t );
								delete t;
								self.eval(transformedJs);
							},transform);
						}
					);
				}
			);
		};
		
		this.eval = function(scxmlScript) {
			this.compiledDoc = scxmlScript;
			eval(scxmlScript);
			self.compiledStatechartInstance = new StatechartExecutionContext();
			readyCallback();
		};
		
		this.start = function() {
			this.compiledStatechartInstance.initialize();
		};
		
		this.send = function(event, data) {
			this.compiledStatechartInstance[event](data);
		};
		
		this.In = function(s) {
			try {
				return this.compiledStatechartInstance.$in(s);
			}
			catch(e) {
				return false;
			}
		};
		
		this.getConfiguration = function() {
			return this.compiledStatechartInstance.getCurrentConfiguration().toString();
		};
		
		this._dump = function() {
			$("body").empty();
			
			$("<textarea></textarea>").css({width : $(window).width(), height : $(window).height()})
			.html(this.compiledDoc)
			.appendTo("body");
		};
		
		this.init();
		
	};

})(jQuery);