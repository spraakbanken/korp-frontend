/*******************************************************************************
 jquery.raphael.spinner
 email: hunterae@gmail.com
 site: http://captico.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
	VERSION: Raphael Spinner jQuery Plugin 1.0

	REQUIRES: jquery.js (tested with 1.4.2), Raphael JS (tested with 1.5.2)

	SYNTAX: $(selector).spinner(options);     // Creates new spinner

	OPTIONS:

    innerRadius : integer (default = 6) 
    outerRadius : integer (default = 12) 
    dashes      : integer (default = 12) 
    strokeWidth : integer (default = 2) 
    color       : string (default = "#333")
    
  See http://raphaeljs.com/spin-spin-spin.html for a demo usage of these parameters
  (innerRadius is called "Radius 1" there and outerRadius is called "Radius 2" there)  

	The innerRadius parameter specifies the distance between the inner most point in the
	spinner and the start of the dashes.
	
	The outerRadius parameter specifies the length of the dashes.
	
	The dashes parameter specifies the number of dashes that make up the spinner. 
	
	The strokeWidth parameter specifies how thick the dashes of the spinner are.
	
	The color parameter specifies the color of the spinner.
	
	EXPLANATION:
	
	This jQuery plug-in leverages Raphaël (http://raphaeljs.com/) to very easily 
	create custom-tailored spinners that have your desired color, radii, stroke
	widths, and number of dashes.
	
  A sample usage of this plugin would be:
  
  $(".some-spinner-class").spinner({innerRadius: 50, outerRadius: 100, dashes: 40, strokeWidth: 4});
  
  Please note that whatever element you specify in the jQuery selector will not be replaced with the spinner;
  rather it will merely draw the Raphael canvas within that element.
				
	AUTHOR: Andrew Hunter (hunterae@gmail.com) and Todd Fisher (todd@captico.com) 
	Thanks to RaphaelJS!!!!
	This work is in the public domain, and it is not supported in any way. Use it at your own risk.
*/

(function($) {
  // thanks to RaphaelJS!!!!
  function spinner(holderid, R1, R2, count, stroke_width, colour) {
    var sectorsCount = count || 12,
        color = colour || "#fff",
        width = stroke_width || 15,
        r1 = Math.min(R1, R2) || 35,
        r2 = Math.max(R1, R2) || 60,
        cx = r2 + width,
        cy = r2 + width,
        r = Raphael(holderid, r2 * 2 + width * 2, r2 * 2 + width * 2),

        sectors = [],
        opacity = [],
        beta = 2 * Math.PI / sectorsCount,

        pathParams = {stroke: color, "stroke-width": width, "stroke-linecap": "round"};
        Raphael.getColor.reset();
    for (var i = 0; i < sectorsCount; i++) {
        var alpha = beta * i - Math.PI / 2,
            cos = Math.cos(alpha),
            sin = Math.sin(alpha);
        opacity[i] = 1 / sectorsCount * i;
        sectors[i] = r.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
        if (color == "rainbow") {
            sectors[i].attr("stroke", Raphael.getColor());
        }
    }
    (function ticker() {
        opacity.unshift(opacity.pop());
        for (var i = 0; i < sectorsCount; i++) {
            sectors[i].attr("opacity", opacity[i]);
        }
        r.safari();
        tick = setTimeout(ticker, 2000 / sectorsCount);
    })();
    return function () {
        clearTimeout(tick);
        r.remove();
    };
  }
  
  $.fn.spinner = function(options) {
    options = $.extend({
      innerRadius: 6, 
      outerRadius: 12, 
      dashes: 12, 
      strokeWidth: 2, 
      color: "#333"
    }, options);
    
    $(this).each(function() {
      spinner(this, options['innerRadius'], options['outerRadius'], options['dashes'], options['strokeWidth'], options['color']);
    });
    
    return this;
  }
})(jQuery);