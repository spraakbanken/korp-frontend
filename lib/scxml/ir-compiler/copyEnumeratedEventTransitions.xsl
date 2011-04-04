<?xml version="1.0" encoding="UTF-8"?><!--
    Document   : separateEnumeratedEventTransitions.xsl
    Created on : July 20, 2010, 1:33 PM
    Author     : jacob
    Description:
        Purpose of transformation follows.
--><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/computeLCA.xsl"/>
		<c:dependency path="ir-compiler/nameTransitions.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="s:*[s:transition]">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>

			<c:enumeratedEventTransitions>
				<xsl:for-each select="s:transition[not(@event) or not(contains(@event,'.'))]">
					<c:enumeratedTransition>
						<xsl:apply-templates select="@*|node()"/>
					</c:enumeratedTransition>
				</xsl:for-each>
			</c:enumeratedEventTransitions>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="*[s:send]">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>

			<c:enumeratedSendElements>
				<xsl:for-each select="s:send[@event and not(contains(@event,'.'))]">
					<c:enumeratedSend>
						<xsl:apply-templates select="@*|node()"/>
					</c:enumeratedSend>
				</xsl:for-each>
			</c:enumeratedSendElements>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>