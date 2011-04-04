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
This stylesheet augments the SCXML document to add extra information to
transitions. Specifically, this will precompute the Least Common Ancestor
(lca), the exit path, and the entry of the transition, and add this information
to the input document as children in the scxml-js namespace.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/splitTransitionTargets.xsl"/>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
		<c:dependency path="ir-compiler/changeTransitionsPointingToCompoundStatesToPointToInitialStates.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueInitialStateIds.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueStateIds.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<xsl:template name="genStateTree">
		<xsl:param name="current"/>
		<xsl:param name="end"/>

		<!--
		<xsl:message>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>Current: </xsl:text>
			<xsl:value-of select="$current/@id"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>End: </xsl:text>
			<xsl:value-of select="$end/@id"/>
			<xsl:text>&#10;</xsl:text>
		</xsl:message>
		-->

		<xsl:if test="not($current=$end)">

			<xsl:variable name="parent" select="$current/parent::*"/>

			<c:state>
				<xsl:value-of select="$current/@id"/>
			</c:state>

			<xsl:call-template name="genStateTree">
				<xsl:with-param name="current" select="$parent"/>
				<xsl:with-param name="end" select="$end"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>


	<xsl:template match="c:target">
		<xsl:param name="lca"/>

		<!-- get the target state -->
		<xsl:variable name="targetId" select="./c:targetState/text()"/>
		<xsl:variable name="targetState" select="//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history) and @id = $targetId]"/>

		<!--
		<xsl:message>
			<xsl:text>In template match="c:target"</xsl:text>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>targetId: </xsl:text>
			<xsl:value-of select="$targetId"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>targetState: </xsl:text>
			<xsl:value-of select="$targetState/@id"/>
			<xsl:text>&#10;</xsl:text>
			<xsl:text>lca: </xsl:text>
			<xsl:value-of select="$lca/@id"/>
			<xsl:text>&#10;</xsl:text>
		</xsl:message>
		-->

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<c:enterpath>
				<xsl:call-template name="genStateTree">
					<xsl:with-param name="current" select="$targetState"/>
					<xsl:with-param name="end" select="$lca"/>
				</xsl:call-template>
			</c:enterpath>

			<xsl:apply-templates select="node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- identity transform -->
	<xsl:template match="c:targets">
		<xsl:param name="lca"/>

		<xsl:copy>
			<xsl:apply-templates select="@*|node()">
				<xsl:with-param name="lca" select="$lca"/>
			</xsl:apply-templates>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="s:transition">

		<xsl:variable name="srcState" select="parent::*"/>

		<xsl:variable name="firstTargetStateId" select="c:targets/c:target/c:targetState/text()[1]"/>
		<xsl:variable name="firstTargetState" select="//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history) and @id = $firstTargetStateId]"/>

		<xsl:choose>
			<xsl:when test="not($firstTargetStateId)">
				<xsl:message terminate="yes">
					Error compiling statechart: target state does not have id, for source state with id: <xsl:value-of select="$srcState/@id"/>
				</xsl:message>
			</xsl:when>
			<xsl:when test="not($firstTargetState)">
				<xsl:message terminate="yes">
					Error compiling statechart: Could not find targe state with id <xsl:value-of select="$firstTargetStateId"/>
				</xsl:message>
			</xsl:when>
		</xsl:choose>

		<!-- compute the least common ancestor using the Kaysian method for intersection-->
		<!-- http://stackoverflow.com/questions/538293/find-common-parent-using-xpath -->
		<xsl:variable name="lca" select="$srcState/ancestor::* [count(. | $firstTargetState/ancestor::*) = count($firstTargetState/ancestor::*) ] [1]"/>

		<xsl:copy>

			<xsl:apply-templates select="@*"/>

			<!-- call recursive function to populate exit and entry paths -->
			<!--
			<xsl:message>
				<xsl:text>START&#10;</xsl:text>
				<xsl:text>srcState: </xsl:text>
				<xsl:value-of select="$srcState/@id"/>
				<xsl:text>&#10;</xsl:text>
			</xsl:message>
			-->

			<c:exitpath>
				<xsl:call-template name="genStateTree">
					<xsl:with-param name="current" select="$srcState"/>
					<xsl:with-param name="end" select="$lca"/>
				</xsl:call-template>
			</c:exitpath>

			<c:lca>
				<xsl:value-of select="$lca/@id"/>
			</c:lca>

			<xsl:apply-templates select="c:targets">
				<xsl:with-param name="lca" select="$lca"/>
			</xsl:apply-templates>

			<xsl:apply-templates select="node()[not(self::c:targets)]"/>
		</xsl:copy>

	</xsl:template>

</xsl:stylesheet>