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
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/enumerateEvents.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>


	<xsl:template name="escapePeriods">
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
				<xsl:value-of select="$first"/><xsl:text>\.</xsl:text>

				<xsl:call-template name="escapePeriods">
					<xsl:with-param name="eventName" select="$remaining"/> 
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$eventName"/>
			</xsl:otherwise>
		</xsl:choose>

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

	<!-- recursive template -->
	<xsl:template name="eventNameToJsRegExpLiteral">
	    <xsl:param name="eventName"/> 

	    <xsl:text>/^(</xsl:text>
	    <xsl:call-template name="escapePeriods">
		    <xsl:with-param name="eventName" select="$eventName"/>
	    </xsl:call-template>
	    <xsl:text>)/</xsl:text>
	</xsl:template>

	<xsl:template match="/s:scxml/c:allEventsEnum/c:event">

		<xsl:variable name="safeRegexpName">
			<xsl:choose>
				<xsl:when test="c:name/text() = '*'">
					<xsl:text>star</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="replacePeriodsWithUnderscores">
						<xsl:with-param name="eventName" select="c:name"/>
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="regexpName" select="concat($safeRegexpName,'_Regexp_',generate-id())"/>

		<xsl:variable name="regexpValue">
			<xsl:choose>
				<xsl:when test="c:name/text() = '*'">
					<xsl:text>/.*/</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="eventNameToJsRegExpLiteral">
						<xsl:with-param name="eventName" select="c:name/text()"/>
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
	
		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<c:regexp>
				<c:name><xsl:value-of select="$regexpName"/></c:name>
				<c:value><xsl:value-of select="$regexpValue"/></c:value>
			</c:regexp>

			<xsl:apply-templates select="node()"/>
		</xsl:copy>
	</xsl:template>


</xsl:stylesheet>