<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" xmlns="http://www.w3.org/2005/07/scxml" version="1.0">
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

	<xsl:template match="s:history[not(s:transition)]">
		<!-- get the default state of the parent -->

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<s:transition target="{../s:initial/s:transition/@target}"/>

			<xsl:apply-templates select="node()"/>

		</xsl:copy>	
	</xsl:template>

</xsl:stylesheet>