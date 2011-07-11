function StatechartExecutionContext(){

	var self = this;	// used in the rare occasions we call public
	// functions from inside this class

	// system variable declarations
	var _event = { name : undefined, data : undefined }, 
	_name = "", 
	_sessionid; 

	var _x = {
			_event : _event,
			_name : _name,
			_sessionid : _sessionid 
	};

	// variable declarations relating to data model

	// send timeout id variables


	var $default_Regexp_idp306096 = /^($default)/
		,
		submit_kwic_Regexp_idp306416 = /^(submit\.kwic)/
			,
			searchtab_simple_Regexp_idp306736 = /^(searchtab\.simple)/
				,
				searchtab_extended_Regexp_idp307088 = /^(searchtab\.extended)/
					,
					searchtab_advanced_Regexp_idp307440 = /^(searchtab\.advanced)/
						,
						submit_lemgram_Regexp_idp305488 = /^(submit\.lemgram)/
							,
							submit_Regexp_idp304080 = /^(submit)/
								,
								resultstab_kwic_Regexp_idp304400 = /^(resultstab\.kwic)/
									,
									resultstab_lemgram_Regexp_idp304720 = /^(resultstab\.lemgram)/
										,
										resultstab_stats_Regexp_idp302256 = /^(resultstab\.stats)/
											,
											resultstab_custom_Regexp_idp302608 = /^(resultstab\.custom)/
												,
												word_deselect_Regexp_idp302960 = /^(word\.deselect)/
													,
													word_select_Regexp_idp303280 = /^(word\.select)/
														,
														sidebar_show_Regexp_idp300944 = /^(sidebar\.show)/
															,
															sidebar_hide_Regexp_idp301296 = /^(sidebar\.hide)/
																,
																star_Regexp_idp301616 = /.*/
																	;


	// abstract state


	var AbstractState = new function(){
		// triggers are methods


		this.$default = function(){};

		this.submit = function(){};


		this.$default = function(){};

		this.$dispatchPrefixEvent = function(){};
	}


	// states


	var scxml_idm38672 = (function(){

		function scxml_idm38672Constructor(){
			this.parent = AbstractState;

			this.initial = null;

			this.depth = 0;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "scxml_idm38672"
			}

			this.enterAction = function(){

				console.log("entering scxml_idm38672");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("scxml_idm38672");

				}


			}

			this.exitAction = function(){

				console.log("exiting scxml_idm38672" );


				for(var idp32416_iterator=0, 
						idp32416_hoist=listeners.length;
				idp32416_iterator < idp32416_hoist;
				idp32416_iterator++){
					var listener = listeners[idp32416_iterator];


					// from
					listener.onExit("scxml_idm38672");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return AbstractState.$dispatchPrefixEvent(e);
			}




		}
		scxml_idm38672Constructor.prototype = AbstractState;
		return new scxml_idm38672Constructor();
	})();



	var _initial = (function(){

		function _initialConstructor(){
			this.parent = scxml_idm38672;

			this.initial = null;

			this.depth = 1;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "_initial"
			}

			this.enterAction = function(){

				console.log("entering _initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting _initial" );


				for(var idp28576_iterator=0, 
						idp28576_hoist=listeners.length;
				idp28576_iterator < idp28576_hoist;
				idp28576_iterator++){
					var listener = listeners[idp28576_iterator];


					// from
					listener.onExit("_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						init : true
						,simple : true
						,extended : true
						,advanced : true
						,results_hidden : true
						,kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true
						,sidebar_hidden : true
						,sidebar_visible : true
						,l2 : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"init",
								"_initial_$default_1" );

					}



					// enter states
					init.enterAction();


					// update configuration


					currentConfiguration = [
					                        init
					                        ]; 

				}
				}



				return scxml_idm38672['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return scxml_idm38672.$dispatchPrefixEvent(e);
			}




		}
		_initialConstructor.prototype = scxml_idm38672;
		return new _initialConstructor();
	})();



	var init = (function(){

		function initConstructor(){
			this.parent = scxml_idm38672;

			this.initial = null;

			this.depth = 1;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ];


			this.toString = function(){
				return "init"
			}

			this.enterAction = function(){

				console.log("entering init");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("init");

				}


			}

			this.exitAction = function(){

				console.log("exiting init" );


				for(var idm45488_iterator=0, 
						idm45488_hoist=listeners.length;
				idm45488_iterator < idm45488_hoist;
				idm45488_iterator++){
					var listener = listeners[idm45488_iterator];


					// from
					listener.onExit("init");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						init : true
						,simple : true
						,extended : true
						,advanced : true
						,results_hidden : true
						,kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true
						,sidebar_hidden : true
						,sidebar_visible : true
						,l2 : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					init.exitAction();


					// transition action
					searchProxy = new model.SearchProxy();
					kwicProxy = new model.KWICProxy();
					lemgramProxy = new model.LemgramProxy();
					statsProxy = new model.StatsProxy();
					simpleSearch = new view.SimpleSearch('#korp-simple');
					extendedSearch = new view.ExtendedSearch('#korp-extended');
					advancedSearch = new view.AdvancedSearch('#korp-advanced');
					kwicResults = new view.KWICResults('#result-container li:first', '#results-kwic');
					lemgramResults = new view.LemgramResults('#result-container li:nth-child(2)');
					statsResults = new view.StatsResults('#result-container li:nth-child(3)');


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"main_initial",
						"init_$default_2" );

					}



					// enter states
					main.enterAction();
					main_initial.enterAction();


					// update configuration


					currentConfiguration = [
					                        main_initial
					                        ]; 

				}
				}



				return scxml_idm38672['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return scxml_idm38672.$dispatchPrefixEvent(e);
			}




		}
		initConstructor.prototype = scxml_idm38672;
		return new initConstructor();
	})();



	var main = (function(){

		function mainConstructor(){
			this.parent = scxml_idm38672;

			this.initial = null;

			this.depth = 1;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "main"
			}

			this.enterAction = function(){

				console.log("entering main");

				console.log( ' entered main : ' );


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("main");

				}


			}

			this.exitAction = function(){

				console.log("exiting main" );


				for(var idm2640_iterator=0, 
						idm2640_hoist=listeners.length;
				idm2640_iterator < idm2640_hoist;
				idm2640_iterator++){
					var listener = listeners[idm2640_iterator];


					// from
					listener.onExit("main");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return scxml_idm38672.$dispatchPrefixEvent(e);
			}




		}
		mainConstructor.prototype = scxml_idm38672;
		return new mainConstructor();
	})();



	var main_initial = (function(){

		function main_initialConstructor(){
			this.parent = main;

			this.initial = null;

			this.depth = 2;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "main_initial"
			}

			this.enterAction = function(){

				console.log("entering main_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("main_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting main_initial" );


				for(var idm2448_iterator=0, 
						idm2448_hoist=listeners.length;
				idm2448_iterator < idm2448_hoist;
				idm2448_iterator++){
					var listener = listeners[idm2448_iterator];


					// from
					listener.onExit("main_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						simple : true
						,extended : true
						,advanced : true
						,results_hidden : true
						,kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true
						,sidebar_hidden : true
						,sidebar_visible : true
						,l2 : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					main_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"p_initial",
								"main_initial_$default_3" );

					}



					// enter states
					p.enterAction();
					p_initial.enterAction();


					// update configuration


					currentConfiguration = [
					                        p_initial
					                        ]; 

				}
				}



				return main['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return main.$dispatchPrefixEvent(e);
			}




		}
		main_initialConstructor.prototype = main;
		return new main_initialConstructor();
	})();



	var p = (function(){

		function pConstructor(){
			this.parent = main;

			this.initial = null;

			this.depth = 2;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "p"
			}

			this.enterAction = function(){

				console.log("entering p");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("p");

				}


			}

			this.exitAction = function(){

				console.log("exiting p" );


				for(var idm1523696_iterator=0, 
						idm1523696_hoist=listeners.length;
				idm1523696_iterator < idm1523696_hoist;
				idm1523696_iterator++){
					var listener = listeners[idm1523696_iterator];


					// from
					listener.onExit("p");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return main.$dispatchPrefixEvent(e);
			}




		}
		pConstructor.prototype = main;
		return new pConstructor();
	})();



	var p_initial = (function(){

		function p_initialConstructor(){
			this.parent = p;

			this.initial = null;

			this.depth = 3;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "p_initial"
			}

			this.enterAction = function(){

				console.log("entering p_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("p_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting p_initial" );


				for(var idm1523872_iterator=0, 
						idm1523872_hoist=listeners.length;
				idm1523872_iterator < idm1523872_hoist;
				idm1523872_iterator++){
					var listener = listeners[idm1523872_iterator];


					// from
					listener.onExit("p_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						simple : true
						,extended : true
						,advanced : true
						,results_hidden : true
						,kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true
						,sidebar_hidden : true
						,sidebar_visible : true
						,l2 : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					p_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"search_initial",
								"p_initial_$default_4" );

						listener.onTransition(
								"",
								"results_initial",
						"p_initial_$default_5" );

						listener.onTransition(
								"",
								"sidebar_initial",
						"p_initial_$default_6" );

						listener.onTransition(
								"",
								"logger_initial",
						"p_initial_$default_7" );

					}



					// enter states
					logger.enterAction();
					logger_initial.enterAction();
					sidebar.enterAction();
					sidebar_initial.enterAction();
					results.enterAction();
					results_initial.enterAction();
					search.enterAction();
					search_initial.enterAction();


					// update configuration


					currentConfiguration = [
					                        search_initial,results_initial,sidebar_initial,logger_initial
					                        ]; 

				}
				}



				return p['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return p.$dispatchPrefixEvent(e);
			}




		}
		p_initialConstructor.prototype = p;
		return new p_initialConstructor();
	})();



	var search = (function(){

		function searchConstructor(){
			this.parent = p;

			this.initial = null;

			this.depth = 3;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "search"
			}

			this.enterAction = function(){

				console.log("entering search");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("search");

				}


			}

			this.exitAction = function(){

				console.log("exiting search" );


				for(var idm1478096_iterator=0, 
						idm1478096_hoist=listeners.length;
				idm1478096_iterator < idm1478096_hoist;
				idm1478096_iterator++){
					var listener = listeners[idm1478096_iterator];


					// from
					listener.onExit("search");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return p.$dispatchPrefixEvent(e);
			}




		}
		searchConstructor.prototype = p;
		return new searchConstructor();
	})();



	var search_initial = (function(){

		function search_initialConstructor(){
			this.parent = search;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  search
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "search_initial"
			}

			this.enterAction = function(){

				console.log("entering search_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("search_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting search_initial" );


				for(var idm1480112_iterator=0, 
						idm1480112_hoist=listeners.length;
				idm1480112_iterator < idm1480112_hoist;
				idm1480112_iterator++){
					var listener = listeners[idm1480112_iterator];


					// from
					listener.onExit("search_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						simple : true
						,extended : true
						,advanced : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					search_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"simple",
						"search_initial_$default_8" );

					}



					// enter states
					search_inner.enterAction();
					simple.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,search_initial)

							,1,
							simple 
					); 

				}
				}



				return search['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return search.$dispatchPrefixEvent(e);
			}




		}
		search_initialConstructor.prototype = search;
		return new search_initialConstructor();
	})();



	var search_inner = (function(){

		function search_innerConstructor(){
			this.parent = search;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "search_inner"
			}

			this.enterAction = function(){

				console.log("entering search_inner");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("search_inner");

				}


			}

			this.exitAction = function(){

				console.log("exiting search_inner" );

				this.historyState.lastConfiguration = currentConfiguration.slice();


				for(var idm1394128_iterator=0, 
						idm1394128_hoist=listeners.length;
				idm1394128_iterator < idm1394128_hoist;
				idm1394128_iterator++){
					var listener = listeners[idm1394128_iterator];


					// from
					listener.onExit("search_inner");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_kwic_Regexp_idp306416)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = search;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action

						$("#simple_text").get(0).blur();
						kwicSearch(_event.data.page);


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"search_inner",
									"search_history",
							"search_inner_submit.kwic_10" );

						}



						// enter states
						search_inner.enterAction();
						search_history.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								search_history 
						); 

					}
					}


				}


				if(e.match(searchtab_simple_Regexp_idp306736)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = search;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"search_inner",
									"simple",
							"search_inner_searchtab.simple_11" );

						}



						// enter states
						search_inner.enterAction();
						simple.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								simple 
						); 

					}
					}


				}


				if(e.match(searchtab_extended_Regexp_idp307088)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = search;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"search_inner",
									"extended",
							"search_inner_searchtab.extended_12" );

						}



						// enter states
						search_inner.enterAction();
						extended.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								extended 
						); 

					}
					}


				}


				if(e.match(searchtab_advanced_Regexp_idp307440)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = search;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"search_inner",
									"advanced",
							"search_inner_searchtab.advanced_13" );

						}



						// enter states
						search_inner.enterAction();
						advanced.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								advanced 
						); 

					}
					}


				}


				return search.$dispatchPrefixEvent(e);
			}




		}
		search_innerConstructor.prototype = search;
		return new search_innerConstructor();
	})();



	var search_history = (function(){

		function search_historyConstructor(){
			this.parent = search_inner;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  search
			                  ,
			                  search_inner
			                  ];

			this.parent.historyState = this; // init parent's pointer
			// to history state


			this.toString = function(){
				return "search_history"
			}

			this.enterAction = function(){

				console.log("entering search_history");

				$.log("disabling all result tabs");
				if($("#result-container").is(".ui-tabs")) 
					$("#result-container").tabs("option", "disabled", [0,1,2]);


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("search_history");

				}


			}

			this.exitAction = function(){

				console.log("exiting search_history" );


				for(var idm1395376_iterator=0, 
						idm1395376_hoist=listeners.length;
				idm1395376_iterator < idm1395376_hoist;
				idm1395376_iterator++){
					var listener = listeners[idm1395376_iterator];


					// from
					listener.onExit("search_history");

				}


			}



			this.$default = function(){




				// history state semantics
				if(search_history.lastConfiguration){

					return {
						preemptedBasicStates: 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action: function(){
						// transition action

						console.log("return to last shallow configuration");


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var l = listeners[idp0_iterator];


							// transition id

							l.onTransition(
									"",
									"simple",
							"search_history_$default_9" );

						}





						var historyState = search_history;


						var newConfiguration = [];


						var historyStateParent = search_history.parent;



						for(var idp0_iterator=0, 
								idp0_hoist=search_history.lastConfiguration
								.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = search_history.lastConfiguration
							[idp0_iterator];


							if(
									indexOf(state.ancestors
											,historyStateParent)
											!=-1
							){


								var statesEntered = [state]; 

								for(var parent = state.parent; 
								parent != null &&

								parent != historyState.parent 
								; 
								parent = parent.parent){
									statesEntered.push(parent);
								}


								var topState = statesEntered.pop();


								topState.enterAction();


								newConfiguration.push(topState.initial ? topState.initial : topState );	

							}

						}



						var filteredConfiguration = [];



						for(var idp0_iterator=0, 
								idp0_hoist=currentConfiguration.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = currentConfiguration[idp0_iterator];


							if(
									indexOf(state.ancestors
											,historyStateParent)
											== -1
							){
								filteredConfiguration.push(state);

							}

						}



						newConfiguration = newConfiguration.concat(filteredConfiguration)

						var historyTriggerDispatcherCurrentConfigurationAssignmentRHS = newConfiguration;
						currentConfiguration = historyTriggerDispatcherCurrentConfigurationAssignmentRHS;

					}
					}


				}else{

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){

						hasTakenDefaultTransition = true;


						// exit states
						search_history.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"simple",
							"search_history_$default_9" );

						}



						// enter states
						simple.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,search_history)

								,1,
								simple 
						); 

					}
					}


				}


				return search_inner['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return search_inner.$dispatchPrefixEvent(e);
			}




		}
		search_historyConstructor.prototype = search_inner;
		return new search_historyConstructor();
	})();



	var simple = (function(){

		function simpleConstructor(){
			this.parent = search_inner;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  search
			                  ,
			                  search_inner
			                  ];


			this.toString = function(){
				return "simple"
			}

			this.enterAction = function(){

				console.log("entering simple");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("simple");

				}


			}

			this.exitAction = function(){

				console.log("exiting simple" );

				$("#simple_text").autocomplete("close");


				for(var idm1310256_iterator=0, 
						idm1310256_hoist=listeners.length;
				idm1310256_iterator < idm1310256_hoist;
				idm1310256_iterator++){
					var listener = listeners[idm1310256_iterator];


					// from
					listener.onExit("simple");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_lemgram_Regexp_idp305488)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states
						simple.exitAction();


						// transition action

						lemgramSearch(_event.data, simpleSearch.isSearchPrefix(), simpleSearch.isSearchSuffix(), _event.data.page);


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"simple",
									"simple",
							"simple_submit.lemgram_14" );

						}



						// enter states
						simple.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,simple)

								,1,
								simple 
						); 

					}
					}


				}


				return search_inner.$dispatchPrefixEvent(e);
			}




		}
		simpleConstructor.prototype = search_inner;
		return new simpleConstructor();
	})();



	var extended = (function(){

		function extendedConstructor(){
			this.parent = search_inner;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  search
			                  ,
			                  search_inner
			                  ];


			this.toString = function(){
				return "extended"
			}

			this.enterAction = function(){

				console.log("entering extended");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("extended");

				}


			}

			this.exitAction = function(){

				console.log("exiting extended" );


				for(var idm40000_iterator=0, 
						idm40000_hoist=listeners.length;
				idm40000_iterator < idm40000_hoist;
				idm40000_iterator++){
					var listener = listeners[idm40000_iterator];


					// from
					listener.onExit("extended");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_kwic_Regexp_idp306416)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states
						extended.exitAction();


						// transition action

						advancedSearch.updateCQP();
						kwicSearch(_event.data.page);


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"extended",
									"search_history",
							"extended_submit.kwic_15" );

						}



						// enter states
						search_history.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,extended)

								,1,
								search_history 
						); 

					}
					}


				}


				if(e.match(submit_lemgram_Regexp_idp305488)
				){

					return {
						preemptedBasicStates : 

						{
							simple : true
							,extended : true
							,advanced : true

						}
					,
					action : function(){


						// exit states
						extended.exitAction();


						// transition action

						// extendedSearch.setOneToken("lex",
								// _event.data);
						lemgramSearch(_event.data, null, null, _event.data.page);


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"extended",
									"search_history",
							"extended_submit.lemgram_16" );

						}



						// enter states
						search_history.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,extended)

								,1,
								search_history 
						); 

					}
					}


				}


				return search_inner.$dispatchPrefixEvent(e);
			}




		}
		extendedConstructor.prototype = search_inner;
		return new extendedConstructor();
	})();



	var advanced = (function(){

		function advancedConstructor(){
			this.parent = search_inner;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  search
			                  ,
			                  search_inner
			                  ];


			this.toString = function(){
				return "advanced"
			}

			this.enterAction = function(){

				console.log("entering advanced");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("advanced");

				}


			}

			this.exitAction = function(){

				console.log("exiting advanced" );


				for(var idm1525440_iterator=0, 
						idm1525440_hoist=listeners.length;
				idm1525440_iterator < idm1525440_hoist;
				idm1525440_iterator++){
					var listener = listeners[idm1525440_iterator];


					// from
					listener.onExit("advanced");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return search_inner.$dispatchPrefixEvent(e);
			}




		}
		advancedConstructor.prototype = search_inner;
		return new advancedConstructor();
	})();



	var results = (function(){

		function resultsConstructor(){
			this.parent = p;

			this.initial = null;

			this.depth = 3;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "results"
			}

			this.enterAction = function(){

				console.log("entering results");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results");

				}


			}

			this.exitAction = function(){

				console.log("exiting results" );


				for(var idm1419584_iterator=0, 
						idm1419584_hoist=listeners.length;
				idm1419584_iterator < idm1419584_hoist;
				idm1419584_iterator++){
					var listener = listeners[idm1419584_iterator];


					// from
					listener.onExit("results");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return p.$dispatchPrefixEvent(e);
			}




		}
		resultsConstructor.prototype = p;
		return new resultsConstructor();
	})();



	var results_initial = (function(){

		function results_initialConstructor(){
			this.parent = results;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "results_initial"
			}

			this.enterAction = function(){

				console.log("entering results_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_initial" );


				for(var idm1422816_iterator=0, 
						idm1422816_hoist=listeners.length;
				idm1422816_iterator < idm1422816_hoist;
				idm1422816_iterator++){
					var listener = listeners[idm1422816_iterator];


					// from
					listener.onExit("results_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						results_hidden : true
						,kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					results_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"results_hidden",
						"results_initial_$default_17" );

					}



					// enter states
					results_hidden.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,results_initial)

							,1,
							results_hidden 
					); 

				}
				}



				return results['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results.$dispatchPrefixEvent(e);
			}




		}
		results_initialConstructor.prototype = results;
		return new results_initialConstructor();
	})();



	var results_hidden = (function(){

		function results_hiddenConstructor(){
			this.parent = results;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ];


			this.toString = function(){
				return "results_hidden"
			}

			this.enterAction = function(){

				console.log("entering results_hidden");

				$('#results-wrapper').hide();


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_hidden");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_hidden" );

				$('#results-wrapper').fadeIn();


				for(var idm1466480_iterator=0, 
						idm1466480_hoist=listeners.length;
				idm1466480_iterator < idm1466480_hoist;
				idm1466480_iterator++){
					var listener = listeners[idm1466480_iterator];


					// from
					listener.onExit("results_hidden");

				}


			}



			this.submit = function(){


				if(($.bbq.getState('result-container', true) || 0) === 0){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						results_hidden.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"results_kwic_initial",
							"results_hidden_submit_18" );

						}



						// enter states
						results_visible.enterAction();
						results_kwic.enterAction();
						results_kwic_initial.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,results_hidden)

								,1,
								results_kwic_initial 
						); 

					}
					}


				}

				if(($.bbq.getState('result-container', true)) === 1){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						results_hidden.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"results_lemgram",
							"results_hidden_submit_19" );

						}



						// enter states
						results_visible.enterAction();
						results_lemgram.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,results_hidden)

								,1,
								results_lemgram 
						); 

					}
					}


				}

				if(($.bbq.getState('result-container', true)) === 2){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						results_hidden.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"results_stats",
							"results_hidden_submit_20" );

						}



						// enter states
						results_visible.enterAction();
						results_stats.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,results_hidden)

								,1,
								results_stats 
						); 

					}
					}


				}


				return results['submit']();
			}

			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_Regexp_idp304080)

						&& ($.bbq.getState('result-container', true) || 0) === 0){

					if(($.bbq.getState('result-container', true) || 0) === 0){

						return {
							preemptedBasicStates : 

							{
								results_hidden : true
								,kwic_word_selected : true
								,kwic_word_not_selected : true
								,results_lemgram : true
								,results_stats : true
								,custom_entry : true
								,custom_word_selected : true
								,custom_word_not_selected : true

							}
						,
						action : function(){


							// exit states
							results_hidden.exitAction();


							// transition action


							for(var idp0_iterator=0, 
									idp0_hoist=listeners.length;
							idp0_iterator < idp0_hoist;
							idp0_iterator++){
								var listener = listeners[idp0_iterator];


								// transition id

								listener.onTransition(
										"results_hidden",
										"results_kwic_initial",
								"results_hidden_submit_18" );

							}



							// enter states
							results_visible.enterAction();
							results_kwic.enterAction();
							results_kwic_initial.enterAction();


							// update configuration


							currentConfiguration.splice(

									indexOf(currentConfiguration,results_hidden)

									,1,
									results_kwic_initial 
							); 

						}
						}


					}

				}


				if(e.match(submit_Regexp_idp304080)

						&& ($.bbq.getState('result-container', true)) === 1){

					if(($.bbq.getState('result-container', true)) === 1){

						return {
							preemptedBasicStates : 

							{
								results_hidden : true
								,kwic_word_selected : true
								,kwic_word_not_selected : true
								,results_lemgram : true
								,results_stats : true
								,custom_entry : true
								,custom_word_selected : true
								,custom_word_not_selected : true

							}
						,
						action : function(){


							// exit states
							results_hidden.exitAction();


							// transition action


							for(var idp0_iterator=0, 
									idp0_hoist=listeners.length;
							idp0_iterator < idp0_hoist;
							idp0_iterator++){
								var listener = listeners[idp0_iterator];


								// transition id

								listener.onTransition(
										"results_hidden",
										"results_lemgram",
								"results_hidden_submit_19" );

							}



							// enter states
							results_visible.enterAction();
							results_lemgram.enterAction();


							// update configuration


							currentConfiguration.splice(

									indexOf(currentConfiguration,results_hidden)

									,1,
									results_lemgram 
							); 

						}
						}


					}

				}


				if(e.match(submit_Regexp_idp304080)

						&& ($.bbq.getState('result-container', true)) === 2){

					if(($.bbq.getState('result-container', true)) === 2){

						return {
							preemptedBasicStates : 

							{
								results_hidden : true
								,kwic_word_selected : true
								,kwic_word_not_selected : true
								,results_lemgram : true
								,results_stats : true
								,custom_entry : true
								,custom_word_selected : true
								,custom_word_not_selected : true

							}
						,
						action : function(){


							// exit states
							results_hidden.exitAction();


							// transition action


							for(var idp0_iterator=0, 
									idp0_hoist=listeners.length;
							idp0_iterator < idp0_hoist;
							idp0_iterator++){
								var listener = listeners[idp0_iterator];


								// transition id

								listener.onTransition(
										"results_hidden",
										"results_stats",
								"results_hidden_submit_20" );

							}



							// enter states
							results_visible.enterAction();
							results_stats.enterAction();


							// update configuration


							currentConfiguration.splice(

									indexOf(currentConfiguration,results_hidden)

									,1,
									results_stats 
							); 

						}
						}


					}

				}


				return results.$dispatchPrefixEvent(e);
			}




		}
		results_hiddenConstructor.prototype = results;
		return new results_hiddenConstructor();
	})();



	var results_visible = (function(){

		function results_visibleConstructor(){
			this.parent = results;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "results_visible"
			}

			this.enterAction = function(){

				console.log("entering results_visible");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_visible");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_visible" );


				for(var idp26320_iterator=0, 
						idp26320_hoist=listeners.length;
				idp26320_iterator < idp26320_hoist;
				idp26320_iterator++){
					var listener = listeners[idp26320_iterator];


					// from
					listener.onExit("results_visible");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(resultstab_kwic_Regexp_idp304400)
				){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = results;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_visible",
									"results_kwic_initial",
							"results_visible_resultstab.kwic_22" );

						}



						// enter states
						results_visible.enterAction();
						results_kwic.enterAction();
						results_kwic_initial.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								results_kwic_initial 
						); 

					}
					}


				}


				if(e.match(resultstab_lemgram_Regexp_idp304720)
				){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = results;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_visible",
									"results_lemgram",
							"results_visible_resultstab.lemgram_23" );

						}



						// enter states
						results_visible.enterAction();
						results_lemgram.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								results_lemgram 
						); 

					}
					}


				}


				if(e.match(resultstab_stats_Regexp_idp302256)
				){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = results;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_visible",
									"results_stats",
							"results_visible_resultstab.stats_24" );

						}



						// enter states
						results_visible.enterAction();
						results_stats.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								results_stats 
						); 

					}
					}


				}


				if(e.match(resultstab_custom_Regexp_idp302608)
				){

					return {
						preemptedBasicStates : 

						{
							results_hidden : true
							,kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = results;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_visible",
									"results_custom_initial",
							"results_visible_resultstab.custom_25" );

						}



						// enter states
						results_visible.enterAction();
						results_custom.enterAction();
						results_custom_initial.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								results_custom_initial 
						); 

					}
					}


				}


				return results.$dispatchPrefixEvent(e);
			}




		}
		results_visibleConstructor.prototype = results;
		return new results_visibleConstructor();
	})();



	var results_visible_initial = (function(){

		function results_visible_initialConstructor(){
			this.parent = results_visible;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "results_visible_initial"
			}

			this.enterAction = function(){

				console.log("entering results_visible_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_visible_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_visible_initial" );


				for(var idp25616_iterator=0, 
						idp25616_hoist=listeners.length;
				idp25616_iterator < idp25616_hoist;
				idp25616_iterator++){
					var listener = listeners[idp25616_iterator];


					// from
					listener.onExit("results_visible_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					results_visible_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"results_kwic_initial",
						"results_visible_initial_$default_21" );

					}



					// enter states
					results_kwic.enterAction();
					results_kwic_initial.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,results_visible_initial)

							,1,
							results_kwic_initial 
					); 

				}
				}



				return results_visible['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results_visible.$dispatchPrefixEvent(e);
			}




		}
		results_visible_initialConstructor.prototype = results_visible;
		return new results_visible_initialConstructor();
	})();



	var results_kwic = (function(){

		function results_kwicConstructor(){
			this.parent = results_visible;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "results_kwic"
			}

			this.enterAction = function(){

				console.log("entering results_kwic");

				kwicResults.onentry();
				util.setJsonLink(kwicProxy.prevRequest);


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_kwic");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_kwic" );

				this.historyState.lastConfiguration = currentConfiguration.slice();

				kwicResults.onexit();


				for(var idm102816_iterator=0, 
						idm102816_hoist=listeners.length;
				idm102816_iterator < idm102816_hoist;
				idm102816_iterator++){
					var listener = listeners[idm102816_iterator];


					// from
					listener.onExit("results_kwic");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return results_visible.$dispatchPrefixEvent(e);
			}




		}
		results_kwicConstructor.prototype = results_visible;
		return new results_kwicConstructor();
	})();



	var results_kwic_initial = (function(){

		function results_kwic_initialConstructor(){
			this.parent = results_kwic;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_kwic
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "results_kwic_initial"
			}

			this.enterAction = function(){

				console.log("entering results_kwic_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_kwic_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_kwic_initial" );


				for(var idm1430400_iterator=0, 
						idm1430400_hoist=listeners.length;
				idm1430400_iterator < idm1430400_hoist;
				idm1430400_iterator++){
					var listener = listeners[idm1430400_iterator];


					// from
					listener.onExit("results_kwic_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						kwic_word_selected : true
						,kwic_word_not_selected : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					results_kwic_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"selected_h",
						"results_kwic_initial_$default_26" );

					}



					// enter states
					selected_h.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,results_kwic_initial)

							,1,
							selected_h 
					); 

				}
				}



				return results_kwic['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results_kwic.$dispatchPrefixEvent(e);
			}




		}
		results_kwic_initialConstructor.prototype = results_kwic;
		return new results_kwic_initialConstructor();
	})();



	var selected_h = (function(){

		function selected_hConstructor(){
			this.parent = results_kwic;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_kwic
			                  ];

			this.parent.historyState = this; // init parent's pointer
			// to history state


			this.toString = function(){
				return "selected_h"
			}

			this.enterAction = function(){

				console.log("entering selected_h");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("selected_h");

				}


			}

			this.exitAction = function(){

				console.log("exiting selected_h" );


				for(var idm1469696_iterator=0, 
						idm1469696_hoist=listeners.length;
				idm1469696_iterator < idm1469696_hoist;
				idm1469696_iterator++){
					var listener = listeners[idm1469696_iterator];


					// from
					listener.onExit("selected_h");

				}


			}



			this.$default = function(){




				// history state semantics
				if(selected_h.lastConfiguration){

					return {
						preemptedBasicStates: 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true

						}
					,
					action: function(){
						// transition action

						console.log("return to last shallow configuration");


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var l = listeners[idp0_iterator];


							// transition id

							l.onTransition(
									"",
									"kwic_word_selected",
							"selected_h_$default_27" );

						}





						var historyState = selected_h;


						var newConfiguration = [];


						var historyStateParent = selected_h.parent;



						for(var idp0_iterator=0, 
								idp0_hoist=selected_h.lastConfiguration
								.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = selected_h.lastConfiguration
							[idp0_iterator];


							if(
									indexOf(state.ancestors
											,historyStateParent)
											!=-1
							){


								var statesEntered = [state]; 

								for(var parent = state.parent; 
								parent != null &&

								parent != historyState.parent 
								; 
								parent = parent.parent){
									statesEntered.push(parent);
								}


								var topState = statesEntered.pop();


								topState.enterAction();


								newConfiguration.push(topState.initial ? topState.initial : topState );	

							}

						}



						var filteredConfiguration = [];



						for(var idp0_iterator=0, 
								idp0_hoist=currentConfiguration.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = currentConfiguration[idp0_iterator];


							if(
									indexOf(state.ancestors
											,historyStateParent)
											== -1
							){
								filteredConfiguration.push(state);

							}

						}



						newConfiguration = newConfiguration.concat(filteredConfiguration)

						var historyTriggerDispatcherCurrentConfigurationAssignmentRHS = newConfiguration;
						currentConfiguration = historyTriggerDispatcherCurrentConfigurationAssignmentRHS;

					}
					}


				}else{

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true

						}
					,
					action : function(){

						hasTakenDefaultTransition = true;


						// exit states
						selected_h.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"kwic_word_selected",
							"selected_h_$default_27" );

						}



						// enter states
						kwic_word_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,selected_h)

								,1,
								kwic_word_selected 
						); 

					}
					}


				}


				return results_kwic['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results_kwic.$dispatchPrefixEvent(e);
			}




		}
		selected_hConstructor.prototype = results_kwic;
		return new selected_hConstructor();
	})();



	var kwic_word_selected = (function(){

		function kwic_word_selectedConstructor(){
			this.parent = results_kwic;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_kwic
			                  ];


			this.toString = function(){
				return "kwic_word_selected"
			}

			this.enterAction = function(){

				console.log("entering kwic_word_selected");

				showSidebar();


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("kwic_word_selected");

				}


			}

			this.exitAction = function(){

				console.log("exiting kwic_word_selected" );

				hideSidebar();


				for(var idm1381568_iterator=0, 
						idm1381568_hoist=listeners.length;
				idm1381568_iterator < idm1381568_hoist;
				idm1381568_iterator++){
					var listener = listeners[idm1381568_iterator];


					// from
					listener.onExit("kwic_word_selected");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(word_deselect_Regexp_idp302960)
				){

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						kwic_word_selected.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"kwic_word_selected",
									"kwic_word_not_selected",
							"kwic_word_selected_word.deselect_28" );

						}



						// enter states
						kwic_word_not_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,kwic_word_selected)

								,1,
								kwic_word_not_selected 
						); 

					}
					}


				}


				return results_kwic.$dispatchPrefixEvent(e);
			}




		}
		kwic_word_selectedConstructor.prototype = results_kwic;
		return new kwic_word_selectedConstructor();
	})();



	var kwic_word_not_selected = (function(){

		function kwic_word_not_selectedConstructor(){
			this.parent = results_kwic;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_kwic
			                  ];


			this.toString = function(){
				return "kwic_word_not_selected"
			}

			this.enterAction = function(){

				console.log("entering kwic_word_not_selected");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("kwic_word_not_selected");

				}


			}

			this.exitAction = function(){

				console.log("exiting kwic_word_not_selected" );


				for(var idm12032_iterator=0, 
						idm12032_hoist=listeners.length;
				idm12032_iterator < idm12032_hoist;
				idm12032_iterator++){
					var listener = listeners[idm12032_iterator];


					// from
					listener.onExit("kwic_word_not_selected");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(word_select_Regexp_idp303280)
				){

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						kwic_word_not_selected.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"kwic_word_not_selected",
									"kwic_word_selected",
							"kwic_word_not_selected_word.select_29" );

						}



						// enter states
						kwic_word_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,kwic_word_not_selected)

								,1,
								kwic_word_selected 
						); 

					}
					}


				}


				return results_kwic.$dispatchPrefixEvent(e);
			}




		}
		kwic_word_not_selectedConstructor.prototype = results_kwic;
		return new kwic_word_not_selectedConstructor();
	})();



	var results_lemgram = (function(){

		function results_lemgramConstructor(){
			this.parent = results_visible;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ];


			this.toString = function(){
				return "results_lemgram"
			}

			this.enterAction = function(){

				console.log("entering results_lemgram");

				util.setJsonLink(lemgramProxy.prevRequest);


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_lemgram");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_lemgram" );


				for(var idm1347840_iterator=0, 
						idm1347840_hoist=listeners.length;
				idm1347840_iterator < idm1347840_hoist;
				idm1347840_iterator++){
					var listener = listeners[idm1347840_iterator];


					// from
					listener.onExit("results_lemgram");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_kwic_Regexp_idp306416)
				){

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						results_lemgram.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_lemgram",
									"results_lemgram",
							"results_lemgram_submit.kwic_30" );

						}



						// enter states
						results_lemgram.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,results_lemgram)

								,1,
								results_lemgram 
						); 

					}
					}


				}


				return results_visible.$dispatchPrefixEvent(e);
			}




		}
		results_lemgramConstructor.prototype = results_visible;
		return new results_lemgramConstructor();
	})();



	var results_stats = (function(){

		function results_statsConstructor(){
			this.parent = results_visible;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ];


			this.toString = function(){
				return "results_stats"
			}

			this.enterAction = function(){

				console.log("entering results_stats");

				util.setJsonLink(statsProxy.prevRequest);


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_stats");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_stats" );


				for(var idm41920_iterator=0, 
						idm41920_hoist=listeners.length;
				idm41920_iterator < idm41920_hoist;
				idm41920_iterator++){
					var listener = listeners[idm41920_iterator];


					// from
					listener.onExit("results_stats");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_kwic_Regexp_idp306416)
				){

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						results_stats.exitAction();


						// transition action

						// gotoFirstResultTab();
						$.log("submit.kwic, stats");


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_stats",
									"results_stats",
							"results_stats_submit.kwic_31" );

						}



						// enter states
						results_stats.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,results_stats)

								,1,
								results_stats 
						); 

					}
					}


				}


				return results_visible.$dispatchPrefixEvent(e);
			}




		}
		results_statsConstructor.prototype = results_visible;
		return new results_statsConstructor();
	})();



	var results_custom = (function(){

		function results_customConstructor(){
			this.parent = results_visible;

			this.initial = null;

			this.depth = 5;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "results_custom"
			}

			this.enterAction = function(){

				console.log("entering results_custom");
				currentCustom = $('#result-container').korptabs('getCurrentInstance');

				currentCustom.onentry();
				util.setJsonLink(currentCustom.proxy.prevRequest);


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_custom");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_custom" );

				currentCustom.onexit();


				for(var idm1477312_iterator=0, 
						idm1477312_hoist=listeners.length;
				idm1477312_iterator < idm1477312_hoist;
				idm1477312_iterator++){
					var listener = listeners[idm1477312_iterator];


					// from
					listener.onExit("results_custom");

				}


			}



			this.submit = function(){


				return {
					preemptedBasicStates : 

					{
						kwic_word_selected : true
						,kwic_word_not_selected : true
						,results_lemgram : true
						,results_stats : true
						,custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true

					}
				,
				action : function(){


					// exit states


					var statesExited = [];
					var lca = results_visible;

					var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

					for(var idp0_iterator=0, 
							idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


						if(
								indexOf(state.ancestors,lca)
								!== -1
						){

							do{
								statesExited.push(state);
							}while((state = state.parent) &&
									state != lca && 

									indexOf(statesExited,state)
									== -1)

						}

					}



					// sort by depth
					statesExited.sort(sortByDepthDeepToShallow);

					// execute actions for each of these states



					for(var idp0_iterator=0, 
							idp0_hoist=statesExited.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var state = statesExited[idp0_iterator];


						state.exitAction();

					}



					// transition action

					gotoFirstResultTab();


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"custom_entry",
						"results_custom_submit_35" );

					}



					// enter states
					results_custom.enterAction();
					custom_entry.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,statesExited[0])

							,1,
							custom_entry 
					); 

				}
				}



				return results_visible['submit']();
			}

			this.$dispatchPrefixEvent = function(e){


				if(e.match(submit_Regexp_idp304080)
				){

					return {
						preemptedBasicStates : 

						{
							kwic_word_selected : true
							,kwic_word_not_selected : true
							,results_lemgram : true
							,results_stats : true
							,custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states


						var statesExited = [];
						var lca = results_visible;

						var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;

						for(var idp0_iterator=0, 
								idp0_hoist=nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[idp0_iterator];


							if(
									indexOf(state.ancestors,lca)
									!== -1
							){

								do{
									statesExited.push(state);
								}while((state = state.parent) &&
										state != lca && 

										indexOf(statesExited,state)
										== -1)

							}

						}



						// sort by depth
						statesExited.sort(sortByDepthDeepToShallow);

						// execute actions for each of these states



						for(var idp0_iterator=0, 
								idp0_hoist=statesExited.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var state = statesExited[idp0_iterator];


							state.exitAction();

						}



						// transition action

						gotoFirstResultTab();


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"results_custom",
									"custom_entry",
							"results_custom_submit_35" );

						}



						// enter states
						results_custom.enterAction();
						custom_entry.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,statesExited[0])

								,1,
								custom_entry 
						); 

					}
					}


				}


				return results_visible.$dispatchPrefixEvent(e);
			}




		}
		results_customConstructor.prototype = results_visible;
		return new results_customConstructor();
	})();



	var results_custom_initial = (function(){

		function results_custom_initialConstructor(){
			this.parent = results_custom;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_custom
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "results_custom_initial"
			}

			this.enterAction = function(){

				console.log("entering results_custom_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("results_custom_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting results_custom_initial" );


				for(var idm1502816_iterator=0, 
						idm1502816_hoist=listeners.length;
				idm1502816_iterator < idm1502816_hoist;
				idm1502816_iterator++){
					var listener = listeners[idm1502816_iterator];


					// from
					listener.onExit("results_custom_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					results_custom_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"custom_entry",
						"results_custom_initial_$default_32" );

					}



					// enter states
					custom_entry.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,results_custom_initial)

							,1,
							custom_entry 
					); 

				}
				}



				return results_custom['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results_custom.$dispatchPrefixEvent(e);
			}




		}
		results_custom_initialConstructor.prototype = results_custom;
		return new results_custom_initialConstructor();
	})();



	var custom_entry = (function(){

		function custom_entryConstructor(){
			this.parent = results_custom;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_custom
			                  ];


			this.toString = function(){
				return "custom_entry"
			}

			this.enterAction = function(){

				console.log("entering custom_entry");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("custom_entry");

				}


			}

			this.exitAction = function(){

				console.log("exiting custom_entry" );


				for(var idp8592_iterator=0, 
						idp8592_hoist=listeners.length;
				idp8592_iterator < idp8592_hoist;
				idp8592_iterator++){
					var listener = listeners[idp8592_iterator];


					// from
					listener.onExit("custom_entry");

				}


			}



			this.$default = function(){


				if(currentCustom.selectionManager.hasSelected()){

					return {
						preemptedBasicStates : 

						{
							custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){

						hasTakenDefaultTransition = true;


						// exit states
						custom_entry.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"",
									"custom_word_selected",
							"custom_entry_$default_33" );

						}



						// enter states
						custom_word_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,custom_entry)

								,1,
								custom_word_selected 
						); 

					}
					}


				}

				return {
					preemptedBasicStates : 

					{
						custom_entry : true
						,custom_word_selected : true
						,custom_word_not_selected : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					custom_entry.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"custom_word_not_selected",
						"custom_entry_$default_34" );

					}



					// enter states
					custom_word_not_selected.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,custom_entry)

							,1,
							custom_word_not_selected 
					); 

				}
				}



				return results_custom['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return results_custom.$dispatchPrefixEvent(e);
			}




		}
		custom_entryConstructor.prototype = results_custom;
		return new custom_entryConstructor();
	})();



	var custom_word_selected = (function(){

		function custom_word_selectedConstructor(){
			this.parent = results_custom;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_custom
			                  ];


			this.toString = function(){
				return "custom_word_selected"
			}

			this.enterAction = function(){

				console.log("entering custom_word_selected");

				showSidebar();


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("custom_word_selected");

				}


			}

			this.exitAction = function(){

				console.log("exiting custom_word_selected" );

				hideSidebar();


				for(var idm8272_iterator=0, 
						idm8272_hoist=listeners.length;
				idm8272_iterator < idm8272_hoist;
				idm8272_iterator++){
					var listener = listeners[idm8272_iterator];


					// from
					listener.onExit("custom_word_selected");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(word_deselect_Regexp_idp302960)
				){

					return {
						preemptedBasicStates : 

						{
							custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						custom_word_selected.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"custom_word_selected",
									"custom_word_not_selected",
							"custom_word_selected_word.deselect_36" );

						}



						// enter states
						custom_word_not_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,custom_word_selected)

								,1,
								custom_word_not_selected 
						); 

					}
					}


				}


				return results_custom.$dispatchPrefixEvent(e);
			}




		}
		custom_word_selectedConstructor.prototype = results_custom;
		return new custom_word_selectedConstructor();
	})();



	var custom_word_not_selected = (function(){

		function custom_word_not_selectedConstructor(){
			this.parent = results_custom;

			this.initial = null;

			this.depth = 6;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  results
			                  ,
			                  results_visible
			                  ,
			                  results_custom
			                  ];


			this.toString = function(){
				return "custom_word_not_selected"
			}

			this.enterAction = function(){

				console.log("entering custom_word_not_selected");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("custom_word_not_selected");

				}


			}

			this.exitAction = function(){

				console.log("exiting custom_word_not_selected" );


				for(var idm16224_iterator=0, 
						idm16224_hoist=listeners.length;
				idm16224_iterator < idm16224_hoist;
				idm16224_iterator++){
					var listener = listeners[idm16224_iterator];


					// from
					listener.onExit("custom_word_not_selected");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(word_select_Regexp_idp303280)
				){

					return {
						preemptedBasicStates : 

						{
							custom_entry : true
							,custom_word_selected : true
							,custom_word_not_selected : true

						}
					,
					action : function(){


						// exit states
						custom_word_not_selected.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"custom_word_not_selected",
									"custom_word_selected",
							"custom_word_not_selected_word.select_37" );

						}



						// enter states
						custom_word_selected.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,custom_word_not_selected)

								,1,
								custom_word_selected 
						); 

					}
					}


				}


				return results_custom.$dispatchPrefixEvent(e);
			}




		}
		custom_word_not_selectedConstructor.prototype = results_custom;
		return new custom_word_not_selectedConstructor();
	})();



	var sidebar = (function(){

		function sidebarConstructor(){
			this.parent = p;

			this.initial = null;

			this.depth = 3;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "sidebar"
			}

			this.enterAction = function(){

				console.log("entering sidebar");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("sidebar");

				}


			}

			this.exitAction = function(){

				console.log("exiting sidebar" );


				for(var idm29184_iterator=0, 
						idm29184_hoist=listeners.length;
				idm29184_iterator < idm29184_hoist;
				idm29184_iterator++){
					var listener = listeners[idm29184_iterator];


					// from
					listener.onExit("sidebar");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return p.$dispatchPrefixEvent(e);
			}




		}
		sidebarConstructor.prototype = p;
		return new sidebarConstructor();
	})();



	var sidebar_initial = (function(){

		function sidebar_initialConstructor(){
			this.parent = sidebar;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  sidebar
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "sidebar_initial"
			}

			this.enterAction = function(){

				console.log("entering sidebar_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("sidebar_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting sidebar_initial" );


				for(var idm30608_iterator=0, 
						idm30608_hoist=listeners.length;
				idm30608_iterator < idm30608_hoist;
				idm30608_iterator++){
					var listener = listeners[idm30608_iterator];


					// from
					listener.onExit("sidebar_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						sidebar_hidden : true
						,sidebar_visible : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					sidebar_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"sidebar_hidden",
						"sidebar_initial_$default_38" );

					}



					// enter states
					sidebar_hidden.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,sidebar_initial)

							,1,
							sidebar_hidden 
					); 

				}
				}



				return sidebar['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return sidebar.$dispatchPrefixEvent(e);
			}




		}
		sidebar_initialConstructor.prototype = sidebar;
		return new sidebar_initialConstructor();
	})();



	var sidebar_hidden = (function(){

		function sidebar_hiddenConstructor(){
			this.parent = sidebar;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  sidebar
			                  ];


			this.toString = function(){
				return "sidebar_hidden"
			}

			this.enterAction = function(){

				console.log("entering sidebar_hidden");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("sidebar_hidden");

				}


			}

			this.exitAction = function(){

				console.log("exiting sidebar_hidden" );


				for(var idm36272_iterator=0, 
						idm36272_hoist=listeners.length;
				idm36272_iterator < idm36272_hoist;
				idm36272_iterator++){
					var listener = listeners[idm36272_iterator];


					// from
					listener.onExit("sidebar_hidden");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(sidebar_show_Regexp_idp300944)
				){

					return {
						preemptedBasicStates : 

						{
							sidebar_hidden : true
							,sidebar_visible : true

						}
					,
					action : function(){


						// exit states
						sidebar_hidden.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"sidebar_hidden",
									"sidebar_visible",
							"sidebar_hidden_sidebar.show_39" );

						}



						// enter states
						sidebar_visible.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,sidebar_hidden)

								,1,
								sidebar_visible 
						); 

					}
					}


				}


				return sidebar.$dispatchPrefixEvent(e);
			}




		}
		sidebar_hiddenConstructor.prototype = sidebar;
		return new sidebar_hiddenConstructor();
	})();



	var sidebar_visible = (function(){

		function sidebar_visibleConstructor(){
			this.parent = sidebar;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  sidebar
			                  ];


			this.toString = function(){
				return "sidebar_visible"
			}

			this.enterAction = function(){

				console.log("entering sidebar_visible");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("sidebar_visible");

				}


			}

			this.exitAction = function(){

				console.log("exiting sidebar_visible" );


				for(var idm44384_iterator=0, 
						idm44384_hoist=listeners.length;
				idm44384_iterator < idm44384_hoist;
				idm44384_iterator++){
					var listener = listeners[idm44384_iterator];


					// from
					listener.onExit("sidebar_visible");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				if(e.match(sidebar_hide_Regexp_idp301296)
				){

					return {
						preemptedBasicStates : 

						{
							sidebar_hidden : true
							,sidebar_visible : true

						}
					,
					action : function(){


						// exit states
						sidebar_visible.exitAction();


						// transition action


						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"sidebar_visible",
									"sidebar_hidden",
							"sidebar_visible_sidebar.hide_40" );

						}



						// enter states
						sidebar_hidden.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,sidebar_visible)

								,1,
								sidebar_hidden 
						); 

					}
					}


				}


				return sidebar.$dispatchPrefixEvent(e);
			}




		}
		sidebar_visibleConstructor.prototype = sidebar;
		return new sidebar_visibleConstructor();
	})();



	var logger = (function(){

		function loggerConstructor(){
			this.parent = p;

			this.initial = null;

			this.depth = 3;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				false;


			this.toString = function(){
				return "logger"
			}

			this.enterAction = function(){

				console.log("entering logger");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("logger");

				}


			}

			this.exitAction = function(){

				console.log("exiting logger" );


				for(var idm49008_iterator=0, 
						idm49008_hoist=listeners.length;
				idm49008_iterator < idm49008_hoist;
				idm49008_iterator++){
					var listener = listeners[idm49008_iterator];


					// from
					listener.onExit("logger");

				}


			}


			this.$dispatchPrefixEvent = function(e){


				return p.$dispatchPrefixEvent(e);
			}




		}
		loggerConstructor.prototype = p;
		return new loggerConstructor();
	})();



	var logger_initial = (function(){

		function logger_initialConstructor(){
			this.parent = logger;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  logger
			                  ];

			this.parent.initial = this; // init parent's pointer to
			// initial state


			this.toString = function(){
				return "logger_initial"
			}

			this.enterAction = function(){

				console.log("entering logger_initial");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("logger_initial");

				}


			}

			this.exitAction = function(){

				console.log("exiting logger_initial" );


				for(var idm50240_iterator=0, 
						idm50240_hoist=listeners.length;
				idm50240_iterator < idm50240_hoist;
				idm50240_iterator++){
					var listener = listeners[idm50240_iterator];


					// from
					listener.onExit("logger_initial");

				}


			}



			this.$default = function(){


				return {
					preemptedBasicStates : 

					{
						l2 : true

					}
				,
				action : function(){

					hasTakenDefaultTransition = true;


					// exit states
					logger_initial.exitAction();


					// transition action


					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"l2",
						"logger_initial_$default_41" );

					}



					// enter states
					l2.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,logger_initial)

							,1,
							l2 
					); 

				}
				}



				return logger['$default']();
			}

			this.$dispatchPrefixEvent = function(e){


				return logger.$dispatchPrefixEvent(e);
			}




		}
		logger_initialConstructor.prototype = logger;
		return new logger_initialConstructor();
	})();



	var l2 = (function(){

		function l2Constructor(){
			this.parent = logger;

			this.initial = null;

			this.depth = 4;

			this.historyState = null;

			// these variables facilitate fast In predicate
			this.isBasic = 

				true;

			this.ancestors = [
			                  scxml_idm38672
			                  ,
			                  main
			                  ,
			                  p
			                  ,
			                  logger
			                  ];


			this.toString = function(){
				return "l2"
			}

			this.enterAction = function(){

				console.log("entering l2");


				for(var idp0_iterator=0, 
						idp0_hoist=listeners.length;
				idp0_iterator < idp0_hoist;
				idp0_iterator++){
					var listener = listeners[idp0_iterator];


					// to
					listener.onEntry("l2");

				}


			}

			this.exitAction = function(){

				console.log("exiting l2" );


				for(var idm55728_iterator=0, 
						idm55728_hoist=listeners.length;
				idm55728_iterator < idm55728_hoist;
				idm55728_iterator++){
					var listener = listeners[idm55728_iterator];


					// from
					listener.onExit("l2");

				}


			}



			this.submit = function(){


				return {
					preemptedBasicStates : 

					{
						l2 : true

					}
				,
				action : function(){


					// exit states
					l2.exitAction();


					// transition action

					console.log(  'event found: ' + _event.name  );



					for(var idp0_iterator=0, 
							idp0_hoist=listeners.length;
					idp0_iterator < idp0_hoist;
					idp0_iterator++){
						var listener = listeners[idp0_iterator];


						// transition id

						listener.onTransition(
								"",
								"l2",
						"l2_*_42" );

					}



					// enter states
					l2.enterAction();


					// update configuration


					currentConfiguration.splice(

							indexOf(currentConfiguration,l2)

							,1,
							l2 
					); 

				}
				}



				return logger['submit']();
			}

			this.$dispatchPrefixEvent = function(e){


				if(e.match(star_Regexp_idp301616)
				){

					return {
						preemptedBasicStates : 

						{
							l2 : true

						}
					,
					action : function(){


						// exit states
						l2.exitAction();


						// transition action

						console.log(  'event found: ' + _event.name  );



						for(var idp0_iterator=0, 
								idp0_hoist=listeners.length;
						idp0_iterator < idp0_hoist;
						idp0_iterator++){
							var listener = listeners[idp0_iterator];


							// transition id

							listener.onTransition(
									"l2",
									"l2",
							"l2_*_42" );

						}



						// enter states
						l2.enterAction();


						// update configuration


						currentConfiguration.splice(

								indexOf(currentConfiguration,l2)

								,1,
								l2 
						); 

					}
					}


				}


				return logger.$dispatchPrefixEvent(e);
			}




		}
		l2Constructor.prototype = logger;
		return new l2Constructor();
	})();




	// states enum for glass-box unit testing


	this._states = {
			_initial : _initial,init : init,main_initial : main_initial,p_initial : p_initial,search_initial : search_initial,search_history : search_history,simple : simple,extended : extended,advanced : advanced,results_initial : results_initial,results_hidden : results_hidden,results_visible_initial : results_visible_initial,results_kwic_initial : results_kwic_initial,selected_h : selected_h,kwic_word_selected : kwic_word_selected,kwic_word_not_selected : kwic_word_not_selected,results_lemgram : results_lemgram,results_stats : results_stats,results_custom_initial : results_custom_initial,custom_entry : custom_entry,custom_word_selected : custom_word_selected,custom_word_not_selected : custom_word_not_selected,sidebar_initial : sidebar_initial,sidebar_hidden : sidebar_hidden,sidebar_visible : sidebar_visible,logger_initial : logger_initial,l2 : l2
	}



	// trigger methods for synchronous interaction


	this["$default"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"$default"

					,data,
					true)
		}else{
			return undefined;
		}
	}


	this["submit.kwic"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"submit.kwic"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["searchtab.simple"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"searchtab.simple"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["searchtab.extended"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"searchtab.extended"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["searchtab.advanced"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"searchtab.advanced"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["submit.lemgram"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"submit.lemgram"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["submit"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"submit"

					,data,
					true)
		}else{
			return undefined;
		}
	}


	this["resultstab.kwic"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"resultstab.kwic"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["resultstab.lemgram"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"resultstab.lemgram"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["resultstab.stats"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"resultstab.stats"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["resultstab.custom"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"resultstab.custom"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["word.deselect"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"word.deselect"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["word.select"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"word.select"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["sidebar.show"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"sidebar.show"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	this["sidebar.hide"] = function(data){
		if(isInStableState && !destroyed){
			runToCompletion(
					// TODO: conditionally wrap in quotes for enumerated pattern


					"sidebar.hide"

					,data,
					false)
		}else{
			return undefined;
		}
	}


	// initialization script


	function kwicSearch(page) {
		if(In("results_lemgram") ) { // || In("results_stats")
			$.log("conf", $.sm.getConfiguration());
			gotoFirstResultTab();
		}
		simpleSearch.resetView();
		kwicResults.showPreloader();
		// kwicResults.makeRequest();
		kwicProxy.makeRequest(page);
	}

	function lemgramSearch(lemgram, searchPrefix, searchSuffix, page) {
		$.log("lemgramSearch", lemgram);
		kwicResults.showPreloader();
		lemgramResults.showPreloader();
		simpleSearch
		.setPlaceholder(util.lemgramToString(lemgram).replace(/<.*?>/g, ""), lemgram)
		.clear();
		lemgramProxy.relationsSearch(lemgram);
		searchProxy.relatedWordSearch(lemgram);

		statsProxy.makeRequest(lemgram);

		var cqp = lemgramProxy.lemgramSearch(lemgram, searchPrefix, searchSuffix, page);
		kwicProxy.makeRequest({cqp : cqp, page});
		$("#cqp_string").val(cqp);
	}

	function gotoFirstResultTab() {
		$.log("faking kwic result tab click");
		$("#result-container li:first > a").trigger("click");
	}


	// initialization method


	this.initialize = function(){
		currentConfiguration = [init];
		runToCompletion();
		mainLoop();
	}



	// internal runtime functions

	function sortByDepthDeepToShallow(a,b){
		return b.depth - a.depth;
	}


	// start static boilerplate code

	// static private member variables
	var currentConfiguration = []; // current configuration
	var innerEventQueue = []; // inner event queue
	var outerEventQueue = []; // outer event queue
	var isInStableState = true;
	var hasTakenDefaultTransition = false;
	var destroyed = false;
	var mainLoopCallback = null;

	// static private member functions
	function mainLoop() {

		if(!destroyed){
			// take an event from the current outer event queue
			if (outerEventQueue.length && isInStableState) {
				runToCompletion(outerEventQueue.shift(),outerEventQueue.shift());
			}
			// call back
			mainLoopCallback = window.setTimeout(function() {
				mainLoop(); // FIXME: note that when calling mainloop this
				// way, we won't have access to the "this"
				// object.
				// I don't think we ever use it though. Everything we need
				// is private in function scope.
			},
			100);
		}
	}

	function runToCompletion(e,data,isEnumeratedEvent){
		isInStableState = false;

		if(e){
			innerEventQueue.push(e,data,isEnumeratedEvent);
		}

		do{
			// take any available default transitions
			microstep("$default",null,true);

			if(!hasTakenDefaultTransition){

				if(!innerEventQueue.length){
					// we have no more generated events, and no default
					// transitions fired, so
					// we are done, and have run to completion
					break;
				}else{
					// microstep, then dequeue next event sending in event
					microstep(innerEventQueue.shift(),innerEventQueue.shift(),innerEventQueue.shift());
				}
			}else{
				// he has taken a default transition, so reset the global
				// variable to false and loop again
				hasTakenDefaultTransition = false;
			}

		}while(true)

			isInStableState = true;
	}

	function microstep(e,data,isEnumeratedEvent){
		var enabledTransitions = [], transition = null, preemptedBasicStates = {};

		// we set the event as a global, rather than passing it into the
		// function invocation as a parameter,
		// because in cases of default events, the event object will be
		// populated with previous event's data
		if(e !== "$default" ){
			_event.name= isEnumeratedEvent ? e : e;
			_event.data=data;
		}

		if(isEnumeratedEvent){
			// e does not contain a dot, so dispatch as an enumerated event


			for(var idp0_iterator=0, 
					idp0_hoist=currentConfiguration.length;
			idp0_iterator < idp0_hoist;
			idp0_iterator++){
				var state = currentConfiguration[idp0_iterator];


				// check to make sure he is not preempted
				if(!(state in preemptedBasicStates)){
					// lookup the transition
					var transition = state[e]();
					if(transition){ 
						enabledTransitions.push(transition.action);
						mixin(transition.preemptedBasicStates,preemptedBasicStates);
					}
				}

			}


		}else{
			// e contains a dot, so dispatch as a prefix event


			for(var idp0_iterator=0, 
					idp0_hoist=currentConfiguration.length;
			idp0_iterator < idp0_hoist;
			idp0_iterator++){
				var state = currentConfiguration[idp0_iterator];


				// check to make sure he is not preempted
				if(!(state in preemptedBasicStates)){
					// lookup the transition
					var transition = state.$dispatchPrefixEvent(e)

					if(transition){ 
						enabledTransitions.push(transition.action);
						mixin(transition.preemptedBasicStates,preemptedBasicStates);
					}
				}

			}


		}

		// invoke selected transitions


		for(var idp0_iterator=0, 
				idp0_hoist=enabledTransitions.length;
		idp0_iterator < idp0_hoist;
		idp0_iterator++){
			var t = enabledTransitions[idp0_iterator];

			t(); 
		}



	}

	function mixin(from,to){
		for(var prop in from){
			to[prop] = from[prop]
		}
	}

	this.destroy = function(){
		// right now, this only disables timer and sets global destroyed
		// variable to prevent future callbacks
		window.clearTimeout(mainLoopCallback);
		mainLoopCallback = null;
		destroyed = true;
	}


	// this is for async communication
	this.GEN = function(e,data){
		outerEventQueue.push(e,data);
	}

	// this may or may not be something we want to expose, but for right
	// now, we at least need it for testing
	this.getCurrentConfiguration = function(){
		// slice it to return a copy of the configuration rather than the
		// conf itself
		// this saves us all kinds of confusion involving references and
		// stuff
		// TODO: refactor this name to be genCurrentConfigurationStatement
		var currentConfigurationExpression = currentConfiguration.slice();
		return currentConfigurationExpression;
	}

	// public API for In predicate
	this.$in = function(state){
		return In(state);
	}

	// end static boilerplate code

	function In(state){
		state = typeof state == "string" ? self._states[state] : state;

		var toReturn;

		if(state.isBasic){
			toReturn = 	
				indexOf(currentConfiguration,state)
				!= -1;
		}else{


			var toReturn = false;

			for(var idp0_iterator=0, 
					idp0_hoist=currentConfiguration.length;
			idp0_iterator < idp0_hoist;
			idp0_iterator++){
				var s = currentConfiguration[idp0_iterator];

				if(
						indexOf(s.ancestors
								,state)
								!= -1
				){
					toReturn = true;
					break;
				}
			}

		}

		return toReturn;
	}

	function indexOf(arr,obj){
		for(var i=0, l=arr.length; i < l; i++){
			if(arr[i]===obj){
				return i;
			}
		}
		return -1;
	}

	var listeners = [];
	// TODO:listeners support adding listeners for a particular state
	this.addListener = function(listener){
		listeners.push(listener); 
	}

	this.removeListener = function(listener){
		listeners.splice(	
				indexOf(listeners,listener)
				,1);
	}

}
