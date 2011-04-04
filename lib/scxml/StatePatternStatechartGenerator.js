

		require.def(

			"lib/scxml/StatePatternStatechartGenerator",
			[
				
					"text!lib/scxml/ir-compiler/normalizeInitialStates.xsl",
				
					"text!lib/scxml/ir-compiler/generateUniqueInitialStateIds.xsl",
				
					"text!lib/scxml/ir-compiler/generateUniqueStateIds.xsl",
				
					"text!lib/scxml/ir-compiler/nameTransitions.xsl",
				
					"text!lib/scxml/ir-compiler/transformIf.xsl",
				
					"text!lib/scxml/ir-compiler/addDefaultTransitionToHistoryStates.xsl",
				
					"text!lib/scxml/ir-compiler/appendBasicStateInformation.xsl",
				
					"text!lib/scxml/ir-compiler/appendStateInformation.xsl",
				
					"text!lib/scxml/ir-compiler/splitTransitionTargets.xsl",
				
					"text!lib/scxml/ir-compiler/changeTransitionsPointingToCompoundStatesToPointToInitialStates.xsl",
				
					"text!lib/scxml/ir-compiler/computeLCA.xsl",
				
					"text!lib/scxml/ir-compiler/appendTransitionInformation.xsl",
				
					"text!lib/scxml/addTransitionTargetIds.xsl",
				
					"text!lib/scxml/ir-compiler/addBasicDescendantsToTransitions.xsl",
				
					"text!lib/scxml/ir-compiler/copyEnumeratedEventTransitions.xsl",
				
					"text!lib/scxml/ir-compiler/enumerateEvents.xsl",
				
					"text!lib/scxml/ir-compiler/addEventRegularExpressions.xsl",
				
					"text!lib/scxml/ir-compiler/expandStarEvent.xsl",
				
				"text!lib/scxml/StatePatternStatechartGenerator.xsl"
			],

			function(
				
				js_var_1,
				js_var_2,
				js_var_3,
				js_var_4,
				js_var_5,
				js_var_6,
				js_var_7,
				js_var_8,
				js_var_9,
				js_var_10,
				js_var_11,
				js_var_12,
				js_var_13,
				js_var_14,
				js_var_15,
				js_var_16,
				js_var_17,
				js_var_18,
				js_var_19
			){

				return {
					"transformations" : [
						js_var_1, 
						js_var_2, 
						js_var_3, 
						js_var_4, 
						js_var_5, 
						js_var_6, 
						js_var_7, 
						js_var_8, 
						js_var_9, 
						js_var_10, 
						js_var_11, 
						js_var_12, 
						js_var_13, 
						js_var_14, 
						js_var_15, 
						js_var_16, 
						js_var_17, 
						js_var_18
					],
					"code" : js_var_19
 
				};


			}
		);
	