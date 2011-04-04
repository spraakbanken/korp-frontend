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
--><!--
This stylesheet changes transitions that point to non-basic states to point
instead to the initial states.  

Note that it only changes the transitions stored in our custom-namespaced
elements, so this should still generate valid SCXML.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/splitTransitionTargets.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueInitialStateIds.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueStateIds.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<!--
	//
	util.foreach(conf.transitions,function(t){
			util.foreach(t.msdl::targets.msdl::target,function(targetNode){
				var target = conf.allStates.(@id == targetNode.msdl::targetState.text());
				
				//if he is a composite, update the transition to point to his initial state
				if(conf.compositeStates.contains(target)){
					targetNode.msdl::targetState.setChildren(target.initial.@id.toString());
				}
			});
	});
	-->
	
	<xsl:template match="c:targetState">
		<!-- get the target state node-->
		<xsl:variable name="targetId">
			<xsl:value-of select="text()"/>
		</xsl:variable>

		<xsl:variable name="targetState" select="//*[(self::s:state or self::s:parallel) and @id = $targetId]"/>

		<xsl:variable name="isTargetStateComposite" select="$targetState    and $targetState//s:*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)]"/>
	
		<xsl:variable name="targetStateInitialId" select="$targetState/s:initial/@id"/>

		<!--
		<xsl:message>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>targetId: </xsl:text>
			<xsl:value-of select="$targetId"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>targetState: </xsl:text>
			<xsl:value-of select="$targetState/@id"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>isTargetStateComposite: </xsl:text>
			<xsl:value-of select="$isTargetStateComposite"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>targetStateInitialId: </xsl:text>
			<xsl:value-of select="$targetStateInitialId"/>
		</xsl:message>
		-->

		<xsl:copy>
			<xsl:choose>
				<xsl:when test="$isTargetStateComposite">
					<xsl:value-of select="$targetState/s:initial/@id"/>		
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="text()"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:copy>

	</xsl:template>

</xsl:stylesheet>