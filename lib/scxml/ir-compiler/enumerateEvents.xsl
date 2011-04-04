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
This stylesheet creates a list of unique transition events, and adds it to the
source document under the namespaced <eventsEnum> element.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/copyEnumeratedEventTransitions.xsl"/>
	</c:dependencies>

	<xsl:key name="enumeratedEvents" match="c:enumeratedTransition | c:enumeratedSend" use="@event"/>	<!-- used for generating unique list -->
	<xsl:key name="allEvents" match="s:transition | s:send" use="@event"/>	<!-- used for generating unique list -->

	<!-- we copy them, so that we can use their positions as identifiers -->

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="/s:scxml">
		<xsl:variable name="uniqueEvents" select="//*[(self::s:transition or self::s:send)]                         [generate-id(.)=generate-id(key('allEvents',@event)[1])]/@event"/>
		<xsl:variable name="uniqueEnumeratedEvents" select="//*[self::c:enumeratedTransition or self::c:enumeratedSend]                              [generate-id(.)=generate-id(key('enumeratedEvents',@event)[1])][not(@event='*')]/@event"/>

		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
	
			<c:enumeratedEventsEnum>
				<!-- start with default event -->
				<!-- FIXME: this may be a bit specfic to the JavaScript backend, hence a bit evil. might be better to separate this out -->
				<c:event>
					<c:name>
						<xsl:value-of select="'$default'"/>
					</c:name>
					<c:id>
						<xsl:value-of select="0"/>
					</c:id>
				</c:event>

				<xsl:for-each select="$uniqueEnumeratedEvents">
					<c:event>
						<c:name>
							<xsl:value-of select="."/>
						</c:name>
						<c:id>
							<xsl:value-of select="position()"/>
						</c:id>
					</c:event>
				</xsl:for-each>	
			</c:enumeratedEventsEnum>
			<c:allEventsEnum>
				<c:event>
					<c:name>
						<xsl:value-of select="'$default'"/>
					</c:name>
					<c:id>
						<xsl:value-of select="0"/>
					</c:id>
				</c:event>

				<xsl:for-each select="$uniqueEvents">
					<c:event>
						<c:name>
							<xsl:value-of select="."/>
						</c:name>
						<c:id>
							<xsl:value-of select="position()"/>
						</c:id>
					</c:event>
				</xsl:for-each>	
			</c:allEventsEnum>
		</xsl:copy>
	</xsl:template>


</xsl:stylesheet>