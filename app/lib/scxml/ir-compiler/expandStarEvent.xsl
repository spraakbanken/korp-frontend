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

	<xsl:variable name="enumeratedEventsEnum" select="/s:scxml/c:enumeratedEventsEnum/c:event"/>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="c:enumeratedTransition[@event='*']">

		<xsl:variable name="currentEnumeratedEventTransition" select="."/>

		<xsl:for-each select="$enumeratedEventsEnum[not(c:name/text() = '$default')]">
			<c:enumeratedTransition>
				<xsl:apply-templates select="$currentEnumeratedEventTransition/@*[not(self::event)]"/>

				<xsl:attribute name="event">
					<xsl:value-of select="c:name"/>
				</xsl:attribute>

				<xsl:apply-templates select="$currentEnumeratedEventTransition/node()"/>
			</c:enumeratedTransition>
		</xsl:for-each>
	</xsl:template>


</xsl:stylesheet>