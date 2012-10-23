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
This stylesheet copies transitions recursively from a composite states to their
descendant basic states. As the scxml-js compiler respects inner-first
transition semantics, the descendant state has priority in the case of an event
collision. 
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/computeLCA.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!--
		if the origin is non-basic
			for each of the origin's substates
				if the substate is nonbasic and the substate is not the origin for any transitions that have the same event as the origin transition
					then copy the original transition as a child of the substate

		for each non-basic state
			for each transition where he is the origin
				for each of his descendant basic states
					if the descendant basic state does not already have a transition where he is the origin that has the same event as the original transition
						then copy the original transition as a child of the basic state

		also, if we hit another composite state that has a transition with the same event, then that one taks priority. That will make it work.
	-->

	<!-- basic states -->
	<xsl:template match="*[(self::s:state or self::s:parallel) and     not(.//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:history)])]">

		<!-- if no param passed in, then initialized to empty node-list -->
		<xsl:param name="parentTransitions" select="/.."/>	

		<xsl:variable name="currentTransitions" select="s:transition"/>

		<!-- we used to filter the parent transitions here to avoid transitions with duplicate events,
			but this is no longer necessary, as parent transitions will have lower priority
			as they are appended in a deeper document order -->

		<xsl:variable name="activeTransitions" select="$currentTransitions | $parentTransitions"/>

		<!--
		<xsl:message>
			current id : <xsl:value-of select="@id"/>
			local-name : <xsl:value-of select="local-name()"/>
			currentTransitions : <xsl:copy-of select="$currentTransitions"/>
			parentTransitions : <xsl:copy-of select="$parentTransitions"/>
			filteredParentTransitions : <xsl:copy-of select="$filteredParentTransitions"/>
			activeTransitions : <xsl:copy-of select="$activeTransitions"/>
		</xsl:message>
		-->


		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<!-- replace all of his transitions with the set of active transitions, which have been carried down from the root -->
			<xsl:copy-of select="$activeTransitions"/>
		
			<xsl:apply-templates select="node()[not(self::s:transition)]"/>
		</xsl:copy>
	</xsl:template>

	<!-- non-basic states -->
	<xsl:template match="s:scxml |      *[(self::s:state or self::s:parallel) and      .//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:history)]]">

		<!-- if no param passed in, then initialized to empty node-list -->
		<xsl:param name="parentTransitions" select="/.."/>	

		<!-- merge parent transitions with his own transitions -->

		<xsl:variable name="currentTransitions" select="s:transition"/>

		<!-- we used to filter the parent transitions here to avoid transitions with duplicate events,
			but this is no longer necessary, as parent transitions will have lower priority
			as they are appended in a deeper document order -->

		<xsl:variable name="activeTransitions" select="$currentTransitions | $parentTransitions"/>

		<!--
		<xsl:message>
			current id : <xsl:value-of select="@id"/>
			local-name : <xsl:value-of select="local-name()"/>
			currentTransitions : <xsl:copy-of select="$currentTransitions"/>
			parentTransitions : <xsl:copy-of select="$parentTransitions"/>
			filteredParentTransitions : <xsl:copy-of select="$filteredParentTransitions"/>
			activeTransitions : <xsl:copy-of select="$activeTransitions"/>
		</xsl:message>
		-->

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<xsl:apply-templates select="s:state | s:parallel">
				<xsl:with-param name="parentTransitions" select="$activeTransitions"/> 
			</xsl:apply-templates>
		
			<xsl:apply-templates select="node()[not(self::s:state or self::s:parallel or self::s:transition)]"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>