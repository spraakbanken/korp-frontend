<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<!--consume-->
	<!--gets siblings until you hit else or elseif or null-->
	<xsl:template name="consume">
		<xsl:param name="currentNode"/>

		<!--
		<xsl:message>
			<xsl:text>start</xsl:text>
			<xsl:copy-of select="local-name($currentNode)"/>
			<xsl:text>end</xsl:text>
		</xsl:message>
		-->
		
		<xsl:if test="$currentNode and     not($currentNode/self::else or $currentNode/self::elseif)">

			<xsl:apply-templates select="$currentNode"/>

			<xsl:call-template name="consume">
				<xsl:with-param name="currentNode" select="$currentNode/following-sibling::*"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template match="s:if">

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<c:executableContent>
				<xsl:call-template name="consume">
					<xsl:with-param name="currentNode" select="*[1]"/>
				</xsl:call-template>
			</c:executableContent>

			<xsl:for-each select="s:elseif | s:else">
				<c:executableContent>
					<xsl:apply-templates select="./following-sibling::*"/>
				</c:executableContent>
			</xsl:for-each>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="s:elseif | s:else">
	   <xsl:copy>
		<c:executableContent>
		      <xsl:apply-templates select="@*|node()"/>
		</c:executableContent>
	   </xsl:copy>
	</xsl:template>

</xsl:stylesheet>