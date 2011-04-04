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
This stylesheet appends extra information to transitions. Specifically, it
conditionally adds the following attributes:

@exitsParallelRegion: if the souce state of a transition is inside a parallel
region (a child of <parallel>), and the target state is outside of that region

--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/splitTransitionTargets.xsl"/>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
		<c:dependency path="ir-compiler/changeTransitionsPointingToCompoundStatesToPointToInitialStates.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueInitialStateIds.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueStateIds.xsl"/>
		<c:dependency path="ir-compiler/flattenTransitions.xsl" when-property-is-enabled="flatten-transitions"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<xsl:variable name="parallels" select="//s:parallel"/>

	<xsl:variable name="parallelRegions" select="$parallels/s:state"/>

	<xsl:template match="s:transition">
		<xsl:variable name="sourceState" select="parent::*"/>
		<xsl:variable name="targetId" select="c:targets/c:target/c:targetState[1]"/>

		<xsl:variable name="targetState" select="//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history) and @id = $targetId]"/>

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<!-- get his parallel region -->
			<xsl:variable name="sourceParallelRegion" select="$sourceState/ancestor::s:state[parent::s:parallel][1]"/>
			<xsl:variable name="targetParallelRegion" select="$targetState/ancestor::s:state[parent::s:parallel][1]"/>

			<!-- if source parallel region and end parallel region are not the same, 
				then we say he exits exitsParallelRegion -->
			<xsl:if test="$sourceParallelRegion       and not($sourceParallelRegion = $targetParallelRegion)">
				<xsl:attribute name="exitsParallelRegion" namespace="http://commons.apache.org/scxml-js">
					<xsl:value-of select="'true'"/>
				</xsl:attribute> 
			</xsl:if>
	
			<!--
			<xsl:message>
				<xsl:text>START&#10;</xsl:text>
				<xsl:text>Source State: </xsl:text>
				<xsl:value-of select="$sourceState/@id"/> 
				<xsl:text>&#10;</xsl:text>
				<xsl:text>Source  Encapsulating Parallel Region (if any): </xsl:text>
				<xsl:value-of select="$sourceParallelRegion/@id"/> 
				<xsl:text>&#10;</xsl:text>
				<xsl:text>Source  Encapsulating Parallel or Self (if any): </xsl:text>
				<xsl:value-of select="$sourceParallel/@id"/> 
				<xsl:text>&#10;</xsl:text>

				<xsl:text>&#10;</xsl:text>

				<xsl:text>Target State: </xsl:text>
				<xsl:value-of select="$targetState/@id"/> 
				<xsl:text>&#10;</xsl:text>
				<xsl:text>Target Encapsulating Parallel Region (if any): </xsl:text>
				<xsl:value-of select="$targetParallelRegion/@id"/> 
				<xsl:text>&#10;</xsl:text>
				<xsl:text>Target Encapsulating Parallel or Self (if any): </xsl:text>
				<xsl:value-of select="$targetParallel/@id"/> 
				<xsl:text>&#10;</xsl:text>

				<xsl:text>&#10;</xsl:text>

				<xsl:text>Exits parallel region: </xsl:text>
				<xsl:value-of select="$sourceParallelRegion 
							and not($sourceParallelRegion = $targetParallelRegion)"/> 
				<xsl:text>&#10;</xsl:text>
				<xsl:text>Exits parallel: </xsl:text>
				<xsl:value-of select="$sourceParallel
							and not($sourceParallel = $targetParallel)"/> 
				<xsl:text>&#10;</xsl:text>

				<xsl:text>END&#10;</xsl:text>
			</xsl:message>
			-->

			<xsl:apply-templates select="node()"/>
		</xsl:copy>

	</xsl:template>

</xsl:stylesheet>