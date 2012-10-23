require.def("src/javascript/scxml/cgf/util/geometry",
{

	distance : function(p1x, p1y, p2x, p2y){
		/*
		   Calculates the distance between the two points given by (p1x, p1y) (p2x, p2y)
		 */
		return Math.sqrt((p1x-p2x)*(p1x-p2x)+(p1y-p2y)*(p1y-p2y))
	},
	getMidpoint2D : function( p1,p2 ){
		// Midpoint of 2 points in 2D
		return {
			x:( p1.x + p2.x ) / 2,
			y:( p1.y + p2.y ) / 2
		}
	},
	vectorLength2D : function( v ){
		// Calculates the length of the 2D vector v
		return Math.sqrt( v[0] * v[0] + v[1] * v[1] )
	}

})
