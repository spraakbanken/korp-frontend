<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
		<c:dependency path="ir-compiler/addDefaultTransitionToHistoryStates.xsl"/>
	</c:dependencies>

	<!-- identity transform -->
	<xsl:template match="@*|node()">
	   <xsl:copy>
	      <xsl:apply-templates select="@*|node()"/>
	   </xsl:copy>
	</xsl:template>

	<!--
	var targetIds = t.@target.toString().split(" ");

	targetIds.forEach(function(targetId){
		t.msdl::targets.msdl::target += <target xmlns={msdlNs}><targetState>{targetId}</targetState></target>;
	});
	-->

	<!-- recursive template -->
	<xsl:template name="transitionAttributeToNodeList">
	    <xsl:param name="list"/> 
	    <xsl:variable name="newlist" select="concat(normalize-space($list), ' ')"/> 
	    <xsl:variable name="first" select="substring-before($newlist, ' ')"/> 
	    <xsl:variable name="remaining" select="substring-after($newlist, ' ')"/> 

	    <c:target>
		<c:targetState>
			<xsl:value-of select="$first"/> 
		</c:targetState>
	    </c:target>

	    <xsl:if test="$remaining">
		<xsl:call-template name="transitionAttributeToNodeList">
			<xsl:with-param name="list" select="$remaining"/> 
		</xsl:call-template>
	    </xsl:if>
	</xsl:template>

	
	<xsl:template match="s:transition">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
			<c:targets>
				<xsl:call-template name="transitionAttributeToNodeList">
					<xsl:with-param name="list" select="@target"/>
				</xsl:call-template>	
			</c:targets>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>