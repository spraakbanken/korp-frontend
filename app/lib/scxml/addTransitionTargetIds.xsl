<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.w3.org/2005/07/scxml" xmlns="http://www.w3.org/2005/07/scxml" xmlns:c="http://commons.apache.org/scxml-js" version="1.0">
	<xsl:output method="xml"/>

	<c:dependencies>
		<c:dependency path="ir-compiler/splitTransitionTargets.xsl"/>
		<c:dependency path="ir-compiler/normalizeInitialStates.xsl"/>
		<c:dependency path="ir-compiler/changeTransitionsPointingToCompoundStatesToPointToInitialStates.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueInitialStateIds.xsl"/>
		<c:dependency path="ir-compiler/generateUniqueStateIds.xsl"/>
	</c:dependencies>

	<!-- we copy them, so that we can use their positions as identifiers -->

	<!-- identity transform -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="c:target">

		<xsl:variable name="sourceStateId" select="../../../@id"/>
		<xsl:variable name="eventName">
			<xsl:choose>
				<xsl:when test="../../@event">
					<xsl:value-of select="../../@event"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="'$default'"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="targetNum">
			<xsl:number level="any" count="c:target"/>
		</xsl:variable>


		<!--
		<xsl:message>
			tName: <xsl:value-of select="@c:tName"/>
			transitionNum: <xsl:value-of select="$transitionNum"/>
		</xsl:message>
		-->

		<xsl:copy>
			<xsl:apply-templates select="@*"/>

			<!-- FIXME: subtract 1 for 0-based indexing in generated code?
				No, we probably want to adjust this in the code generator-->
			<!--FIXME: there has GOT to be a more efficient way to do this
				the way I'm doing it now takes an O(n) operation and makes it into an O(n^2) op. really bad)
				but it's not clear how else to get the position of a given node out of a node list...
			-->

			<xsl:attribute name="id" namespace="http://commons.apache.org/scxml-js">
				<xsl:value-of select="concat($sourceStateId,'_',$eventName,'_',$targetNum)"/>
			</xsl:attribute>

			<xsl:apply-templates select="node()"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>