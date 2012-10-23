<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" version="1.0">
	<xsl:output method="xml"/>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<xsl:template match="s:*[@initial]">
		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<initial id="{concat(@id,'_initial')}">
				<transition target="{@initial}"/>
			</initial>
			<xsl:apply-templates select="node()"/>

		</xsl:copy>	
	</xsl:template>

	<xsl:template match="s:parallel">
		<!-- parallel states do not have use "initial" tag or attribute to specify initial states; instead it's implied.
			we add initial tag here as it makes transformations easier, but I should probably move it to a different
			namespace, as this makes the IR invalid SCXML -->
		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<initial id="{concat(@id,'_initial')}">
				<xsl:choose>
					<xsl:when test="s:history">
						<transition target="{s:history/@id}"/>
					</xsl:when>
					<xsl:otherwise>
						<transition>
							<!-- make a space-separate list of targets. this will get broken up by later transitions -->
							<xsl:attribute name="target">
								<xsl:for-each select="s:state">
									<xsl:value-of select="@id"/><xsl:text> </xsl:text>
								</xsl:for-each>
							</xsl:attribute>
						</transition>
					</xsl:otherwise>
				</xsl:choose>
			</initial>
			<xsl:apply-templates select="node()"/>

		</xsl:copy>	
	</xsl:template>
</xsl:stylesheet>