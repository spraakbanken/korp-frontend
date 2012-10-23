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
This transform attaches an @tName attribute to each transition.  This attribute
is based on the id of the source state and the name of the event ("$default" if
there is no event), and so should be unique as long as there are no duplicate
transitions with events. In practice, it is legal to have transitions
originating from the same state, with the same event (in SCXML, priority is
assigned based on document order), and so this is something that will need to
be fixed in the future.  

This attribute is used to generate the names of state transition functions in
enuemrated statechart backends.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/flattenTransitions.xsl" when-property-is-enabled="flatten-transitions"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template name="replacePeriodsWithUnderscores">
		<xsl:param name="eventName"/> 

		<xsl:variable name="first" select="substring-before($eventName, '.')"/> 
		<xsl:variable name="remaining" select="substring-after($eventName, '.')"/> 

		<!--
		<xsl:message>
			eventName:<xsl:value-of select="$eventName"/>
			first:<xsl:value-of select="$first"/>
			remaining:<xsl:value-of select="$remaining"/>
		</xsl:message>
		-->

		<xsl:choose>
			<xsl:when test="$first and $remaining">
				<xsl:value-of select="$first"/><xsl:text>_</xsl:text>

				<xsl:call-template name="replacePeriodsWithUnderscores">
					<xsl:with-param name="eventName" select="$remaining"/> 
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$eventName"/>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

	<xsl:template match="s:transition">

		<xsl:variable name="eventName">
			<xsl:choose>
				<xsl:when test="@event">
				    <xsl:call-template name="replacePeriodsWithUnderscores">
					    <xsl:with-param name="eventName" select="@event"/>
				    </xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="'$default'"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
	
		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<xsl:attribute name="tName" namespace="http://commons.apache.org/scxml-js">
				<xsl:choose>
					<xsl:when test="$eventName='*'">
						<xsl:value-of select="concat(../@id,'_star')"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="concat(../@id,'_',$eventName)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>

			<xsl:apply-templates select="node()"/>
		</xsl:copy>
	</xsl:template>


</xsl:stylesheet>