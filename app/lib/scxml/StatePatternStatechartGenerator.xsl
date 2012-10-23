<?xml version="1.0" encoding="UTF-8"?><!--
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
--><stylesheet xmlns="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">

	<output method="text"/><param name="log" select="false()"/><param name="genListenerHooks" select="true()"/><param name="noIndexOf" select="false()"/><variable name="allStates" select="//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)]"/><variable name="states" select="//s:state"/><variable name="transitions" select="//s:transition"/><variable name="basicStates" select="$allStates[not(.//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)])]"/><variable name="compositeStates" select="$allStates[.//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)]]"/><variable name="allEventsEnum" select="/s:scxml/c:allEventsEnum/c:event"/><variable name="enumeratedEventsEnum" select="/s:scxml/c:enumeratedEventsEnum/c:event"/><variable name="abstractStateName" select="'AbstractState'"/><variable name="delayedSendBaseVariableName" select="'_$timeoutId'"/><variable name="defaultIteratorVarName" select="concat(generate-id(),'_iterator')"/><variable name="defaultHoistVarName" select="concat(generate-id(),'_hoist')"/><template name="genForEach">
		<param name="var"/>
		<param name="in"/>
		<param name="when"/>
		<param name="do"/>
		<param name="iteratorVarName" select="$defaultIteratorVarName"/>
		<param name="hoistVarName" select="$defaultHoistVarName"/>

		for(var <value-of select="$iteratorVarName"/>=0, 
			<value-of select="$hoistVarName"/>=<value-of select="$in"/>.length;
				<value-of select="$iteratorVarName"/> &lt; <value-of select="$hoistVarName"/>;
				<value-of select="$iteratorVarName"/>++){
			var <value-of select="$var"/> = <value-of select="$in"/>[<value-of select="$iteratorVarName"/>];

			<choose>
				<when test="$when">
					if(<value-of select="$when"/>){
						<value-of select="$do"/>
					}
				</when>
				<otherwise>
					<value-of select="$do"/>
				</otherwise>
			</choose>
		}
	
	</template><template name="genFilter">
		<param name="returnArrayVarName"/>

		<param name="var"/>
		<param name="in"/>
		<param name="when"/>
		<param name="iteratorVarName" select="$defaultIteratorVarName"/>
		<param name="hoistVarName" select="$defaultHoistVarName"/>

		var <value-of select="$returnArrayVarName"/> = [];

		<call-template name="genForEach">
			<with-param name="var" select="$var"/>
			<with-param name="in" select="$in"/>
			<with-param name="when" select="$when"/>
			<with-param name="iteratorVarName" select="$iteratorVarName"/>
			<with-param name="hoistVarName" select="$hoistVarName"/>

			<with-param name="do">
				<value-of select="$returnArrayVarName"/>.push(<value-of select="$var"/>);
			</with-param>
		</call-template>	
	</template><template name="genMap">
		<param name="returnArrayVarName"/>
		<param name="expr"/>

		<param name="var"/>
		<param name="in"/>
		<param name="when"/>
		<param name="iteratorVarName" select="$defaultIteratorVarName"/>
		<param name="hoistVarName" select="$defaultHoistVarName"/>

		var <value-of select="$returnArrayVarName"/> = new Array(<value-of select="$in"/>.length);

		<call-template name="genForEach">
			<with-param name="var" select="$var"/>
			<with-param name="in" select="$in"/>
			<with-param name="when" select="$when"/>
			<with-param name="iteratorVarName" select="$iteratorVarName"/>
			<with-param name="hoistVarName" select="$hoistVarName"/>

			<with-param name="do">
				<value-of select="$returnArrayVarName"/>[<value-of select="$iteratorVarName"/>] = <value-of select="$expr"/>;
			</with-param>
		</call-template>
	</template><template name="genSome">
		<param name="returnVarName"/>

		<param name="var"/>
		<param name="in"/>
		<param name="when" select="true"/>
		<param name="iteratorVarName" select="$defaultIteratorVarName"/>
		<param name="hoistVarName" select="$defaultHoistVarName"/>

		var <value-of select="$returnVarName"/> = false;

		for(var <value-of select="$iteratorVarName"/>=0, 
			<value-of select="$hoistVarName"/>=<value-of select="$in"/>.length;
				<value-of select="$iteratorVarName"/> &lt; <value-of select="$hoistVarName"/>;
				<value-of select="$iteratorVarName"/>++){
			var <value-of select="$var"/> = <value-of select="$in"/>[<value-of select="$iteratorVarName"/>];

			if(<value-of select="$when"/>){
				<value-of select="$returnVarName"/> = true;
				break;
			}
		}
	</template><template name="genIndexOf">
		<param name="var"/>
		<param name="in"/>

		<choose>
			<when test="$noIndexOf">
				indexOf(<value-of select="$in"/>,<value-of select="$var"/>)
			</when>
			<otherwise>
				<value-of select="$in"/>.indexOf(<value-of select="$var"/>)
			</otherwise>
		</choose>
	</template><template name="genNoIndexOfCompatibilityFunction">
		function indexOf(arr,obj){
			for(var i=0, l=arr.length; i &lt; l; i++){
				if(arr[i]===obj){
					return i;
				}
			}
			return -1;
		}
	</template><template name="getParentNameFromState">
		<param name="s"/>

		<choose>
			<when test="$s/../@id">
				<value-of select="$s/../@id"/>
			</when>
			<otherwise>
				<value-of select="$abstractStateName"/>
			</otherwise>
		</choose>
	</template><template match="/s:scxml">

		function <value-of select="@name"/>StatechartExecutionContext(){

				var self = this;	//used in the rare occasions we call public functions from inside this class

				//system variable declarations
				var _event = { name : undefined, data : undefined }, 
					_name = "<value-of select="@name"/>", 
					_sessionid; 

				var _x = {
					_event : _event,
					_name : _name,
					_sessionid : _sessionid 
				};

				//variable declarations relating to data model
				<apply-templates select=".//s:datamodel"/>

				<!-- FIXME: we need to make sure that each delayed send has an id so that it can be cancelled -->
				//send timeout id variables
				<call-template name="genDelayedSendTimeoutIdVariables">
					<with-param name="delayedSends" select="//s:send[@delay]"/>
				</call-template>

				<call-template name="genEventRegularExpressions">
					<with-param name="events" select="$allEventsEnum"/>
				</call-template>

				//abstract state
				<call-template name="genAbstractState">
					<with-param name="events" select="$enumeratedEventsEnum"/>
				</call-template>

				//states
				<for-each select="$allStates">
					<call-template name="genState">
						<with-param name="state" select="."/>
					</call-template>
				</for-each>

		
				//states enum for glass-box unit testing
				<call-template name="genStatesEnum">
						<with-param name="states" select="$basicStates"/>
				</call-template>

				//trigger methods for synchronous interaction
				<for-each select="$allEventsEnum[not(c:name/text() = '*')]">
					<call-template name="genExternalTriggerDispatcher">
						<with-param name="event" select="."/>
					</call-template>
				</for-each>

				<call-template name="genContextHooks"/>

				//initialization script
				<value-of select="s:script"/>

				//initialization method
				<call-template name="genInitialization"/>

				//internal runtime functions
				<call-template name="genInternalRuntimeFunctions"/>

				//start static boilerplate code
				<call-template name="genBoilerplateDispatchCode"/>

				<value-of select="$genInPredicateFunction"/>

				<if test="$noIndexOf">
					<call-template name="genNoIndexOfCompatibilityFunction"/>
				</if>


				<if test="$genListenerHooks">
					<value-of select="$genListenerHookRegistrationFunctions"/>
				</if>
			}

	</template><template match="s:datamodel">
		var <for-each select="s:data">
			<value-of select="@id"/> 
			<choose>
				<when test="@expr">
					= <value-of select="@expr"/>
				</when>
				<when test="@src">
					= xhrGET(<value-of select="@src"/>)
				</when>
				<!-- if this inline content is JSON, we're good,  
					otherwise, we need to parse the xml DOM at runtime 	
					(using the DOMParser object) -->
				<when test="*">
					= <value-of select="*"/>
				</when>
			</choose>
			<if test="position() != last()">, </if>
		</for-each>;
	</template><template name="genDelayedSendTimeoutIdVariables">
		<param name="delayedSends"/>

               	<if test="$delayedSends">
                       var <for-each select="$delayedSends">
                               <value-of select="@id"/><value-of select="$delayedSendBaseVariableName"/>
                               <choose>
                                       <when test="position() = last()">
                                       ;
                                       </when>
                                       <otherwise>
                                       ,
                                       </otherwise>
                               </choose>
                       </for-each>
               	</if>

	</template><template name="genEventRegularExpressions">
		<param name="events"/>

		var <for-each select="$events/c:regexp">
			<value-of select="c:name"/> = <value-of select="c:value"/>	
			<choose>
				<when test="position() = last()">
				;
				</when>
				<otherwise>
				,
				</otherwise>
			</choose>
		</for-each>
	</template><template name="genAbstractState">
		<param name="events"/>

		var <value-of select="$abstractStateName"/> = new function(){
			//triggers are methods

			<for-each select="$events">
				this.<value-of select="./c:name"/> = function(){};
			</for-each>

			this.$default = function(){};

			this.$dispatchPrefixEvent = function(){};
		}
	</template><template name="genState">
		<param name="state"/>

		<variable name="stateName" select="$state/@id"/>

		<variable name="parentName">
			<call-template name="getParentNameFromState">
				<with-param name="s" select="$state"/>
			</call-template>
		</variable>	


		<variable name="historyState" select="$state/s:history"/>
		
		<variable name="constructorFunctionName" select="concat($stateName,'Constructor')"/>

		<!--
					var stateName = state.@id;
					var parentName = state.parent() ? state.parent().@id : "AbstractState";
					var historyState = state.history;
					var hasHistoryState = historyState.length() > 0;
					var constructorFunctionName = stateName + "Constructor";
		-->

		var <value-of select="$stateName"/> = (function(){

			function <value-of select="$constructorFunctionName"/>(){
				this.parent = <value-of select="$parentName"/>;

				this.initial = null;

				this.depth = <value-of select="count($state/ancestor::*)"/>;

				this.historyState = null;

				//these variables facilitate fast In predicate
				this.isBasic = 
				<choose>
					<when test="$state/@c:isBasic">
						true;
					</when>
					<otherwise>
						false;
					</otherwise>
				</choose>

				<!-- only basic states need this property -->
				<if test="$state/@c:isBasic">
					this.ancestors = [
						<for-each select="$state/ancestor::*">
							<value-of select="@id"/>
							<if test="position() != last()">
								,
							</if>	
						</for-each>
					];
				</if>



				<if test="$state/self::s:history">
					this.parent.historyState = this; //init parent's pointer to history state
				</if>

				<if test="$state/self::s:initial">
					this.parent.initial = this; //init parent's pointer to initial state
				</if>
				
				this.toString = function(){
					return "<value-of select="$stateName"/>"
				}

				this.enterAction = function(){
					<if test="$log">
						console.log("entering <value-of select="$stateName"/>");
					</if>

					<apply-templates select="$state/s:onentry/*[self::s:if or self::s:raise or self::s:log or self::s:script or self::s:send or self::s:cancel or self::s:invoke or self::s:finalize or self::s:datamodel or self::s:data or self::s:assign or self::s:validate or self::s:param]"/>

					<if test="$genListenerHooks">
						<call-template name="genForEach">
							<with-param name="var" select="'listener'"/>
							<with-param name="in" select="'listeners'"/>
							<with-param name="do">
								//to
								listener.onEntry("<value-of select="$stateName"/>");
							</with-param>
						</call-template>
					</if>
				}

				this.exitAction = function(){
					<if test="$log">
						console.log("exiting <value-of select="$stateName"/>" );
					</if>

					<if test="$historyState">
						this.historyState.lastConfiguration = currentConfiguration.slice();
					</if>

					<apply-templates select="$state/s:onexit/*[self::s:if or self::s:raise or self::s:log or self::s:script or self::s:send or self::s:cancel or self::s:invoke or self::s:finalize or self::s:datamodel or self::s:data or self::s:assign or self::s:validate or self::s:param]"/>


					<if test="$genListenerHooks">
						<call-template name="genForEach">
							<with-param name="var" select="'listener'"/>
							<with-param name="in" select="'listeners'"/>
							<with-param name="do">
								//from
								listener.onExit("<value-of select="$stateName"/>");
							</with-param>
							<!-- inner loop; assign these so we don't have a collision -->
							<with-param name="iteratorVarName" select="concat(generate-id(),'_iterator')"/>
							<with-param name="hoistVarName" select="concat(generate-id(),'_hoist')"/>
						</call-template>
					</if>
				}

				<call-template name="genStateHooks">
					<with-param name="state" select="$state"/>
				</call-template>
				

			}
			<value-of select="$constructorFunctionName"/>.prototype = <value-of select="$parentName"/>;
			return new <value-of select="$constructorFunctionName"/>();
		})();

	</template><template name="genStatesEnum">
		<param name="states"/>

		this._states = {
			<for-each select="$states">
				<value-of select="@id"/> : <value-of select="@id"/>
				<if test="not(position() = last())">,</if>
			</for-each>
		}

	</template><template match="s:if">
		if (<value-of select="@cond"/>) {
			<apply-templates select="c:executableContent/*"/>	
		}
		<apply-templates select="s:elseif"/>
		<apply-templates select="s:else"/>
	</template><template match="s:elseif">
		else if (<value-of select="@cond"/>) {
			<apply-templates select="c:executableContent/*"/>
		}
	</template><template match="s:else">
		else {
			<apply-templates select="c:executableContent/*"/>
		}
	</template><template match="s:log">
		<if test="@label">
			console.log( ' <value-of select="@label"/> : ' );
		</if>
		<if test="@expr">
			console.log(  <value-of select="@expr"/>  );
			
		</if>
	</template><template match="s:raise">
	<!--TODO-->
	</template><template match="s:script">
		<value-of select="."/>
	</template><template match="s:send">
		<variable select="@event" name="eventName"/>

		<choose>
			<when test="@delay">
				<!-- TODO: think about cancel -->
				<!-- TODO: fix GEN -->
				//send delayed event
				<value-of select="@id"/><value-of select="$delayedSendBaseVariableName"/> = window.setTimeout(function(){
					self['<value-of select="@event"/>'](
						<choose>
							<when test="@c:contentexpr">
								<value-of select="@c:contentexpr"/>
							</when>
							<otherwise>
								null
							</otherwise>
						</choose>
					);
				},<value-of select="number(@delay)*1000"/>);
			</when>
			<otherwise>
				<!--FIXME: hook up data part of this -->
				//send event
				innerEventQueue.push(
						<call-template name="genExternalTriggerDispatcherRunToCompletionEventValue">
							<with-param name="eventName" select="$eventName"/>
						</call-template>,
						<choose>
							<when test="@c:contentexpr">
								<value-of select="@c:contentexpr"/>
							</when>
							<otherwise>
								null
							</otherwise>
						</choose>,
						<value-of select="boolean($enumeratedEventsEnum[c:name/text() = $eventName])"/> );
			</otherwise>
		</choose>
	</template><template match="s:cancel">
		window.clearTimeout(<value-of select="@sendid"/><value-of select="$delayedSendBaseVariableName"/>);
	</template><template match="s:invoke">
	<!--TODO-->
	</template><template match="s:finalize">
	<!--TODO-->
	</template><template match="s:assign">
		<variable name="rhs">
			<choose>
				<when test="@expr">
					<value-of select="@expr"/>
				</when>
				<!-- if this inline content is JSON, we're good,  
					otherwise, we need to parse the xml DOM at runtime 	
					(using the DOMParser object) -->
				<when test="*">
					<value-of select="*"/>
				</when>
			</choose>
		</variable>

		<value-of select="@location"/> = <value-of select="$rhs"/>;
	</template><template match="s:validate">
	<!--TODO-->
	</template><template name="genInternalRuntimeFunctions">
		function sortByDepthDeepToShallow(a,b){
			return b.depth - a.depth;
		}
	</template><template name="genExternalTriggerDispatcher">
		<param name="event"/>

		this["<value-of select="$event/c:name"/>"] = function(data){
			if(isInStableState &amp;&amp; !destroyed){
				runToCompletion(
				//TODO: conditionally wrap in quotes for enumerated pattern
					<call-template name="genExternalTriggerDispatcherRunToCompletionEventValue">
						<with-param name="eventName" select="$event/c:name"/>
					</call-template>
				,data,
				<value-of select="boolean($enumeratedEventsEnum[c:name/text() = $event/c:name/text()])"/>)
			}else{
				return undefined;
			}
		}
	</template><template name="genBoilerplateDispatchCode">
		//static private member variables
		var currentConfiguration = []; //current configuration
		var innerEventQueue = []; //inner event queue
		var outerEventQueue = []; //outer event queue
		var isInStableState = true;
		var hasTakenDefaultTransition = false;
		var destroyed = false;
		var mainLoopCallback = null;

		//static private member functions
		function mainLoop() {

			if(!destroyed){
				//take an event from the current outer event queue
				if (outerEventQueue.length &amp;&amp; isInStableState) {
					runToCompletion(outerEventQueue.shift(),outerEventQueue.shift());
				}
				//call back
				mainLoopCallback = window.setTimeout(function() {
					mainLoop(); //FIXME: note that when calling mainloop this way, we won't have access to the "this" object. 
					//I don't think we ever use it though. Everything we need is private in function scope.
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
				//take any available default transitions
				microstep(<value-of select="$defaultEventLiteral"/>,null,true);

				if(!hasTakenDefaultTransition){
					
					if(!innerEventQueue.length){
						//we have no more generated events, and no default transitions fired, so
						//we are done, and have run to completion
						break;
					}else{
						//microstep, then dequeue next event sending in event
						microstep(innerEventQueue.shift(),innerEventQueue.shift(),innerEventQueue.shift());
					}
				}else{
					//he has taken a default transition, so reset the global variable to false and loop again
					hasTakenDefaultTransition = false;
				}

			}while(true)

			isInStableState = true;
		}

		function microstep(e,data,isEnumeratedEvent){
			var enabledTransitions = [], transition = null, preemptedBasicStates = {};

			//we set the event as a global, rather than passing it into the function invocation as a parameter,
			//because in cases of default events, the event object will be populated with previous event's data
			if(e !== <value-of select="$defaultEventLiteral"/> ){
				_event.name= isEnumeratedEvent ? <value-of select="$eventToNameMap"/> : e;
				_event.data=data;
			}

			if(isEnumeratedEvent){
				//e does not contain a dot, so dispatch as an enumerated event
				<call-template name="genForEach">
					<with-param name="var" select="'state'"/>
					<with-param name="in" select="'currentConfiguration'"/>
					<with-param name="do">
						<!-- TODO: move duplicate code out -->
						//check to make sure he is not preempted
						if(!(state in preemptedBasicStates)){
							//lookup the transition
							var transition = <value-of select="$enumeratedEventDispatchInvocation"/>
							if(transition){ 
								enabledTransitions.push(transition.action);
								mixin(transition.preemptedBasicStates,preemptedBasicStates);
							}
						}
					</with-param>
				</call-template>
			}else{
				//e contains a dot, so dispatch as a prefix event
				<call-template name="genForEach">
					<with-param name="var" select="'state'"/>
					<with-param name="in" select="'currentConfiguration'"/>
					<with-param name="do">
						<!-- TODO: move duplicate code out -->
						//check to make sure he is not preempted
						if(!(state in preemptedBasicStates)){
							//lookup the transition
							var transition = <value-of select="$prefixEventDispatchInvocation"/>
 
							if(transition){ 
								enabledTransitions.push(transition.action);
								mixin(transition.preemptedBasicStates,preemptedBasicStates);
							}
						}
					</with-param>
				</call-template>
			}

			//invoke selected transitions
			<call-template name="genForEach">
				<with-param name="var" select="'t'"/>
				<with-param name="in" select="'enabledTransitions'"/>
				<with-param name="do"> t(); </with-param>
			</call-template>

		}

		function mixin(from,to){
			for(var prop in from){
				to[prop] = from[prop]
			}
		}

		this.destroy = function(){
			//right now, this only disables timer and sets global destroyed variable to prevent future callbacks
			window.clearTimeout(mainLoopCallback);
			mainLoopCallback = null;
			destroyed = true;
		}


		//this is for async communication
		this.GEN = function(e,data){
			outerEventQueue.push(e,data);
		}

		//this may or may not be something we want to expose, but for right now, we at least need it for testing
		this.getCurrentConfiguration = function(){
			//slice it to return a copy of the configuration rather than the conf itself
			//this saves us all kinds of confusion involving references and stuff
			//TODO: refactor this name to be genCurrentConfigurationStatement 
			<value-of select="$currentConfigurationExpression"/>
			return currentConfigurationExpression;
		}

		//public API for In predicate
		this.$in = function(state){
			return In(state);
		}

		//end static boilerplate code
	</template><template name="genHistoryTriggerDispatcher">
		<param name="s"/>
		<param name="t"/>

		<variable name="isDeep" select="$s/@type = 'deep'"/>
		<variable name="isChildOfParallel" select="local-name($s/..) = 'parallel'"/>

		<variable name="historyStateReference">
			<call-template name="genHistoryTriggerDispatcherHistoryStateReference">
				<with-param name="s" select="$s"/>
			</call-template>
		</variable>


		//history state semantics
		if(<value-of select="$historyStateReference"/>.lastConfiguration){

			return {
				preemptedBasicStates: <call-template name="genPreemptedBasicStatesSet"><with-param name="t" select="$t"/></call-template>,
				action: function(){
					//transition action
					<if test="$log">
						<choose>
							<when test="$isDeep">
								console.log("return to last deep configuration");
							</when>
							<otherwise>
								console.log("return to last shallow configuration");
							</otherwise>
						</choose>
					</if>
							
						
					<!--gen executable content for t-->
					<apply-templates select="$t/*[self::s:if or self::s:raise or self::s:log or self::s:script or self::s:send or self::s:cancel or self::s:invoke or self::s:finalize or self::s:assign or self::s:validate ]"/>

					<if test="$genListenerHooks">
						<call-template name="genForEach">
							<with-param name="var" select="'l'"/>
							<with-param name="in" select="'listeners'"/>
							<with-param name="do">
								//transition id
								<for-each select="$t/c:targets/c:target">
									l.onTransition(
										"<value-of select="../../../@id"/>",
										"<value-of select="c:targetState"/>",
										"<value-of select="@c:id"/>" );
								</for-each>
							</with-param>
						</call-template>
					</if>



					var historyState = <value-of select="$historyStateReference"/>;

					<if test="not($isDeep)">
						var newConfiguration = [];
					</if>

					<if test="$isChildOfParallel">
						<variable name="siblingStates" select="$s/../s:state | $s/../s:parallel"/>

						var siblingStates = [
							<for-each select="$siblingStates">

								<value-of select="@id"/>

								<if test="not(position()=last())">
								,
								</if>
							</for-each>
						];
						
					</if>

					var historyStateParent = <value-of select="$historyStateReference"/>.parent;

					<call-template name="genForEach">
						<with-param name="var" select="'state'"/>
						<with-param name="in">
							<value-of select="$historyStateReference"/>.lastConfiguration
						</with-param>
						<with-param name="do">
							<call-template name="genHistoryTriggerDispatcherInnerForEach">
								<with-param name="isDeep" select="$isDeep"/>
								<with-param name="isChildOfParallel" select="$isChildOfParallel"/>
							</call-template>
						</with-param>
						<with-param name="when">
							<call-template name="genIndexOf">
								<with-param name="in">
									<value-of select="$genHistoryTriggerDispatcherInnerForEachStateReference"/>.ancestors
								</with-param>
								<with-param name="var" select="'historyStateParent'"/>
							 </call-template> !=-1
						</with-param>
					</call-template>
					
					<choose>
						<when test="$isDeep">
							currentConfiguration =  <value-of select="$historyStateReference"/>.lastConfiguration.slice();
						</when>
						<otherwise>
							<call-template name="genFilter">
								<with-param name="returnArrayVarName" select="'filteredConfiguration'"/>
								<with-param name="var" select="'state'"/>
								<with-param name="in" select="'currentConfiguration'"/>
								<with-param name="when">
									<call-template name="genIndexOf">
										<with-param name="in">
											<value-of select="$genHistoryTriggerDispatcherInnerForEachStateReference"/>.ancestors
										</with-param>
										<with-param name="var" select="'historyStateParent'"/>
									 </call-template> == -1
								</with-param>
							</call-template>

							newConfiguration = newConfiguration.concat(filteredConfiguration)

							<!-- TODO: refactor this name to be genHistoryTriggerDispatcherCurrentConfigurationAssignment -->
							<value-of select="$genHistoryTriggerDispatcherCurrentConfigurationAssignmentRHS"/>
							currentConfiguration = historyTriggerDispatcherCurrentConfigurationAssignmentRHS;
						</otherwise>
					</choose>
				}
			}

			
		}else{
			<call-template name="genTriggerDispatcherGuardConditionBlockContents">
				<with-param name="s" select="$s"/>
				<with-param name="t" select="$t"/>
			</call-template>
		}
	</template><template name="genHistoryTriggerDispatcherInnerForEach">
		<param name="isDeep"/>
		<param name="isChildOfParallel"/>

		var statesEntered = [<value-of select="$genHistoryTriggerDispatcherInnerForEachStateReference"/>]; 

		for(var parent = <value-of select="$genHistoryTriggerDispatcherInnerForEachStateReference"/>.parent; 
			parent != null &amp;&amp;
			<choose>
				<when test="$isChildOfParallel">
					<call-template name="genIndexOf">
						<with-param name="in" select="'siblingStates'"/>
						<with-param name="var" select="'parent'"/>
					</call-template> == -1
				</when>
				<otherwise>
					parent != historyState.parent 
				</otherwise>
			</choose>; 
			parent = parent.parent){
			statesEntered.push(parent);
		}

		
		var topState = statesEntered.pop();

		<if test="$isChildOfParallel">
			<!-- this is because he will be entering the parallel region, whose enter action will also need to be executed -->
			topState.parent.enterAction();
		</if>
		topState.enterAction();

		<choose>
			<when test="$isDeep">
				<!-- execute the other states -->
				while(topState = statesEntered.pop()){
					topState.enterAction();
				}
			</when>
			<otherwise>
				newConfiguration.push(topState.initial ? topState.initial : topState );	
			</otherwise>
		</choose>
	</template><template name="genNonBasicTriggerDispatcherExitBlock">
		<param name="t"/> 

		var statesExited = [];
		var lca = <value-of select="$t/c:lca"/>;

		<value-of select="$genNonBasicTriggerDispatcherExitBlockIteratorExpression"/>

		<call-template name="genForEach">
			<with-param name="var" select="'state'"/>
			<with-param name="in" select="'nonBasicTriggerDispatcherExitBlockIteratorExpression'"/>
			<with-param name="do">
				do{
					statesExited.push(state);
				}while((state = state.parent) &amp;&amp;
					state != lca &amp;&amp; 
					<call-template name="genIndexOf">
						<with-param name="in" select="'statesExited'"/>
						<with-param name="var" select="'state'"/>
					</call-template> == -1)
			</with-param>
			<with-param name="when">					
				<call-template name="genIndexOf">
					<with-param name="in" select="'state.ancestors'"/>
					<with-param name="var" select="'lca'"/>
				</call-template> !== -1
			</with-param>
		</call-template>

		//sort by depth
		statesExited.sort(sortByDepthDeepToShallow);

		//execute actions for each of these states

		<call-template name="genForEach">
			<with-param name="var" select="'state'"/>
			<with-param name="in" select="'statesExited'"/>
			<with-param name="do">
				state.exitAction();
			</with-param>
		</call-template>
	</template><template name="genTriggerDispatcherContents">
		<param name="s"/>
		<param name="transitions"/>
		<param name="eventName"/>

		<choose>
			<when test="$s/@c:isHistory">
				<call-template name="genHistoryTriggerDispatcher">
					<with-param name="s" select="$s"/>
					<with-param name="t" select="$transitions[1]"/>
				</call-template>
			</when>
			<otherwise>
				<for-each select="$transitions">
					<call-template name="genTriggerDispatcherGuardConditionBlockContents">
						<with-param name="s" select="$s"/>
						<with-param name="t" select="."/>
					</call-template>
				</for-each>
			</otherwise>
		</choose>
	</template><template name="genTriggerDispatcherGuardConditionBlockContents"> 
		<param name="s"/>
		<param name="t"/>

		<!-- conditionally wrap contents in an if block for the guard condition -->
		<choose>
			<when test="$t/@cond">
				if(<value-of select="$t/@cond"/>){
					<call-template name="genTriggerDispatcherInnerContents">
						<with-param name="s" select="$s"/>
						<with-param name="t" select="$t"/>
					</call-template>
				}
			</when>
			<otherwise>
				<call-template name="genTriggerDispatcherInnerContents">
					<with-param name="s" select="$s"/>
					<with-param name="t" select="$t"/>
				</call-template>
			</otherwise>	
		</choose>
	</template><template name="genTriggerDispatcherInnerContents">
		<param name="s"/>
		<param name="t"/>

		<!-- TODO: wrap this in a return function -->
		<!-- TODO: deal with history -->
		return {
			preemptedBasicStates : <call-template name="genPreemptedBasicStatesSet"><with-param name="t" select="$t"/></call-template>,
			action : function(){
				<if test="not($t/@event)">
					hasTakenDefaultTransition = true;
				</if>

				<variable name="precomputeExit" select="local-name($s) = 'initial' or local-name($s) = 'history' or         ( $s/@c:isBasic and          ( not($s/@c:isParallelSubstate) or           ($s/@c:isParallelSubstate and not($t/@c:exitsParallelRegion))))"/>

				//exit states
				<choose>
					<when test="$precomputeExit">
						<for-each select="$t/c:exitpath/c:state">
							<value-of select="."/>.exitAction();
						</for-each>
					</when>
					<otherwise>
						<call-template name="genNonBasicTriggerDispatcherExitBlock">
							<with-param name="t" select="$t"/>
						</call-template>
					</otherwise>
				</choose>

				//transition action
				<apply-templates select="$t/*[self::s:if or self::s:raise or self::s:log or self::s:script or self::s:send or self::s:cancel or self::s:invoke or self::s:finalize or self::s:assign or self::s:validate ]"/>
				<if test="$genListenerHooks">

					<call-template name="genForEach">
						<with-param name="var" select="'listener'"/>
						<with-param name="in" select="'listeners'"/>
						<with-param name="do">
							//transition id
							<for-each select="$t/c:targets/c:target">
								listener.onTransition(
									"<value-of select="../../../@id"/>",
									"<value-of select="c:targetState"/>",
									"<value-of select="@c:id"/>" );
							</for-each>
						</with-param>
					</call-template>
				</if>

				//enter states
				<for-each select="$t/c:targets/c:target/c:enterpath/c:state"> 
					<!-- iterate in reverse order -->
					<sort select="position()" data-type="number" order="descending"/>
					<value-of select="."/>.enterAction();
				</for-each>

				//update configuration
				<choose>
					<when test="$s/@c:isParallelSubstate and not($t/@c:exitsParallelRegion) and not($s/@c:isBasic)">
						<call-template name="genParallelSubstateAndCompositeConfigurationSetString">
							<with-param name="s" select="$s"/>
							<with-param name="t" select="$t"/>
						</call-template>
					</when>
					<when test="$s/@c:isParallelSubstate and not($t/@c:exitsParallelRegion) and $s/@c:isBasic">
						<call-template name="genParallelSubstateConfigurationSetString">
							<with-param name="s" select="$s"/>
							<with-param name="t" select="$t"/>
						</call-template>
					</when>
					<otherwise>
						<call-template name="genNonParallelSubstateConfigurationSetString">
							<with-param name="s" select="$s"/>
							<with-param name="t" select="$t"/>
						</call-template>
					</otherwise>
				</choose>
			}
		}

	</template><variable name="genInPredicateFunction">
		function In(state){
			state = typeof state == "string" ? self._states[state] : state;

			var toReturn;

			if(state.isBasic){
				toReturn = 	<call-template name="genIndexOf">
							<with-param name="in" select="'currentConfiguration'"/>
							<with-param name="var" select="$inPredicateFunctionStateReference"/>
						</call-template> != -1;
			}else{
				<call-template name="genSome">
					<with-param name="returnVarName" select="'toReturn'"/>
					<with-param name="var" select="'s'"/>
					<with-param name="in" select="'currentConfiguration'"/>
					<with-param name="when">
						<call-template name="genIndexOf">
							<with-param name="in">
								<value-of select="$inPredicateFunctionStateIdReference"/>.ancestors
							</with-param>
							<with-param name="var" select="'state'"/>
						</call-template> != -1
					</with-param>
				</call-template>
			}

			return toReturn;
		}
	</variable><variable name="genListenerHookRegistrationFunctions">
		var listeners = [];
		//TODO:listeners support adding listeners for a particular state
		this.addListener = function(listener){
			listeners.push(listener); 
		}

		this.removeListener = function(listener){
			listeners.splice(	<call-template name="genIndexOf">
							<with-param name="in" select="'listeners'"/>
							<with-param name="var" select="'listener'"/>
						</call-template> ,1);
		}
	</variable><template name="genContextHooks"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/addDefaultTransitionToHistoryStates.xsl"/>
		<c:dependency path="ir-compiler/addBasicDescendantsToTransitions.xsl"/>
		<c:dependency path="ir-compiler/addEventRegularExpressions.xsl"/>
		<c:dependency path="ir-compiler/appendBasicStateInformation.xsl"/>
		<c:dependency path="ir-compiler/appendStateInformation.xsl"/>
		<c:dependency path="ir-compiler/appendTransitionInformation.xsl"/>
		<c:dependency path="ir-compiler/changeTransitionsPointingToCompoundStatesToPointToInitialStates.xsl"/>
		<c:dependency path="ir-compiler/computeLCA.xsl"/>
		<c:dependency path="ir-compiler/copyEnumeratedEventTransitions.xsl"/>
		<c:dependency path="ir-compiler/enumerateEvents.xsl"/>
		<c:dependency path="ir-compiler/expandStarEvent.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueInitialStateIds.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueStateIds.xsl"/>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
		<c:dependency path="ir-compiler/splitTransitionTargets.xsl"/>
		<c:dependency path="ir-compiler/transformIf.xsl"/>
		<c:dependency path="layout/addTransitionTargetIds.xsl"/>
	</c:dependencies>

	<!-- TODO: refactor name of enumeratedEventDispatchInvocation variable. it is no longer an invocation -->
	<variable name="enumeratedEventDispatchInvocation" select="'state[e]();'"/>
	<variable name="prefixEventDispatchInvocation" select="'state.$dispatchPrefixEvent(e)'"/>
	<variable name="defaultEventLiteral" select="'&quot;$default&quot;'"/>
	<variable name="currentConfigurationExpression" select="'var currentConfigurationExpression = currentConfiguration.slice();'"/>
	<variable name="inPredicateFunctionStateReference" select="'state'"/>
	<variable name="inPredicateFunctionStateIdReference" select="'s'"/>

	<variable name="genHistoryTriggerDispatcherCurrentConfigurationAssignmentRHS" select="'var historyTriggerDispatcherCurrentConfigurationAssignmentRHS = newConfiguration;'"/>
	<variable name="genHistoryTriggerDispatcherInnerForEachStateReference" select="'state'"/>
	<variable name="genNonBasicTriggerDispatcherExitBlockIteratorExpression" select="'var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;'"/>

	<variable name="eventToNameMap" select="'e'"/>

	<template name="genStateHooks">
		<param name="state"/>

		<!-- iterate through groups of transitions, grouped by event -->
		<!--FIXME: this is likely to be a bit slow, as we're iterating through all events -->
		<for-each select="$enumeratedEventsEnum/c:name">
			<variable name="eventName">
				<value-of select="."/>
			</variable>

			<variable name="transitionsForEvent" select="$state/c:enumeratedEventTransitions/c:enumeratedTransition[@event = $eventName]"/>
			<if test="$transitionsForEvent">
				<call-template name="genTriggerDispatcherContext">
					<with-param name="s" select="$state"/>
					<with-param name="transitions" select="$transitionsForEvent"/>
					<with-param name="eventName" select="$eventName"/>
				</call-template>
			</if>
		</for-each>

		<!-- now do default transitions -->
		<variable name="defaultTransitionsForState" select="$state/c:enumeratedEventTransitions/c:enumeratedTransition[not(@event)]"/>
		<if test="$defaultTransitionsForState">
			<call-template name="genTriggerDispatcherContext">
				<with-param name="s" select="$state"/>
				<with-param name="transitions" select="$defaultTransitionsForState"/>
				<with-param name="eventName" select="'$default'"/>
			</call-template>
		</if>

		<!-- now do prefix event handler -->
		<!-- TODO: consolidate all of these references to dispatchPrefixEvent into a global variable -->
		this.$dispatchPrefixEvent = function(e){
			<!-- we skip default events, as these will always be enumerated, hence will never end up in this region -->
			<for-each select="$state/s:transition[@event]">
				<!-- look up regexp name -->
				<variable name="eventName" select="@event"/>
				<variable name="regexpName" select="$allEventsEnum[c:name/text() = $eventName]/c:regexp/c:name"/>
				
				if(e.match(<value-of select="$regexpName"/>)
					<if test="@cond">
						&amp;&amp; <value-of select="@cond"/>
					</if>){
					<call-template name="genTriggerDispatcherContents">
						<with-param name="s" select="$state"/>
						<with-param name="transitions" select="."/>
						<with-param name="eventName" select="$eventName"/>
					</call-template>
				}
			</for-each>

			<variable name="parentName">
				<call-template name="getParentNameFromState">
					<with-param name="s" select="$state"/>
				</call-template>
			</variable>	

			return <value-of select="$parentName"/>.$dispatchPrefixEvent(e);
		}
		
	</template>

	<template name="genParallelSubstateAndCompositeConfigurationSetString">
		<param name="s"/>
		<param name="t"/>

		currentConfiguration.splice(
			<call-template name="genIndexOf">
				<with-param name="in" select="'currentConfiguration'"/>
				<with-param name="var" select="'statesExited[0]'"/>
			</call-template>
			,1,
			<for-each select="$t/c:targets/c:target/c:targetState">
				<value-of select="."/>
				<if test="not(position() = last())">,</if>
			</for-each> 
		); 
	</template>

	<template name="genParallelSubstateConfigurationSetString">
		<param name="s"/>
		<param name="t"/>

		currentConfiguration.splice(
			<call-template name="genIndexOf">
				<with-param name="in" select="'currentConfiguration'"/>
				<with-param name="var" select="$s/@id"/>
			</call-template>
			,1,
			<for-each select="$t/c:targets/c:target/c:targetState">
				<value-of select="."/>
				<if test="not(position() = last())">,</if>
			</for-each> 
		); 
	</template>

	<template name="genNonParallelSubstateConfigurationSetString">
		<param name="t"/>
		<param name="s"/>

		currentConfiguration = [
			<for-each select="$t/c:targets/c:target/c:targetState">
				<value-of select="."/>
				<if test="not(position() = last())">,</if>
			</for-each>
		]; 
	</template>

	<template name="genInitialization">

		<variable name="initialStateName">
			<value-of select="/s:scxml/s:initial/s:transition/c:targets/c:target/c:targetState"/>
		</variable>
 
		this.initialize = function(){
			currentConfiguration = [<value-of select="$initialStateName"/>];
			runToCompletion();
			mainLoop();
		}

	</template>

	<template name="genTriggerDispatcherContext">
		<param name="s"/>
		<param name="transitions"/>
		<param name="eventName"/>

		this.<value-of select="$eventName"/> = function(){

			<call-template name="genTriggerDispatcherContents">
				<with-param name="s" select="$s"/>
				<with-param name="transitions" select="$transitions"/>
				<with-param name="eventName" select="$eventName"/>
			</call-template>

			<!-- if by this point he hasn't returned, then none of the transitions passed, 
				and we need to pass the transition up the hierarchy chain -->
			<variable name="parentName">
				<call-template name="getParentNameFromState">
					<with-param name="s" select="$s"/>
				</call-template>
			</variable>	

			return <value-of select="$parentName"/>['<value-of select="$eventName"/>']();
		}
	</template>

	<!-- FIXME: this can now be taken out/consolidated, as it no longer needds to be parameterized -->
	<template name="genHistoryTriggerDispatcherHistoryStateReference">
		<param name="s"/>

		<value-of select="$s/@id"/>
	</template> 

	<template name="genExternalTriggerDispatcherRunToCompletionEventValue">
		<param name="eventName"/>

		"<value-of select="$eventName"/>"
	</template>

       <template name="genPreemptedBasicStatesSet">
               <param name="t"/>
               
               {
                       <for-each select="$t/c:basicStateDescendantsOfLCA/c:basicStateDescendant">
                               <value-of select="text()"/> : true
                               <if test="position() != last()">,</if>
                       </for-each>
               }
       </template>


</stylesheet>