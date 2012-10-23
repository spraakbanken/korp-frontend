/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
SCXMLCompiler is a singleton object which serves as a a backend-agnostic 
entry-point to the compiler for both command-line and browser environments
(although right now it only works in the command-line environment).
It takes as input a map of compiler options, extracts information out of
the SCXML input documents, and passes this configuration into the 
chosen backend, then returns a string or string array of compiled
code.  
*/ 

require.def("lib/scxml/SCXMLCompiler",

	[
		"lib/scxml/util/base",
		"lib/scxml/beautify"],
	
	function(
		base,
		js_beautify
	){

		/*
		    supported options:
				backend	{switch | table | state}
				ie
				noIndexOf
				beautify	
				log
				verbose
		*/
		function compile(options,callback,transform){
			if(!options.inFiles) return false;

			if(options.ie){
				options.noIndexOf = true;
			}

			function onModuleLoad(backend){
				var toReturn = options.inFiles.map(function(xmlFile){

					var ir = transform(xmlFile,backend.transformations,null,"xml",options.debug);
					var transformedJs = transform(ir,backend.code,options,"text",options.debug);

					//optionally beautify it
					if(options.beautify){
						transformedJs = js_beautify(transformedJs,{preserve_newlines:false});
					}

					return transformedJs; 
				});

				callback(toReturn);
			}

			//this slightly clunky construction is used to accomodate RequireJS's builder
			if(options.backend==="state"){
				require(["lib/scxml/StatePatternStatechartGenerator"],function(backend){
					onModuleLoad(backend);
				});
			}else if(options.backend==="table"){
				require(["lib/scxml/StateTableStatechartGenerator"],function(backend){
					onModuleLoad(backend);
				});
			}else if(options.backend==="switch"){
				require(["lib/scxml/SwitchyardStatechartGenerator"],function(backend){
					onModuleLoad(backend);
				});
			}

		}

		return {
			compile : compile
		}

	}
);

