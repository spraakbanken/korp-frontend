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
This stylesheet adds attributes isBasic="true" to basic states, and
isHistory="true" to history states.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<xsl:template match="*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)      and not(.//*[(self::s:state or self::s:parallel or self::s:final or self::s:initial or self::s:scxml or self::s:history)])]">
		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<xsl:attribute name="isBasic" namespace="http://commons.apache.org/scxml-js">
				<xsl:value-of select="'true'"/>
			</xsl:attribute> 

			<xsl:if test="./self::s:history">
				<xsl:attribute name="isHistory" namespace="http://commons.apache.org/scxml-js">
					<xsl:value-of select="'true'"/>
				</xsl:attribute> 
			</xsl:if>

			<xsl:apply-templates select="node()"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>