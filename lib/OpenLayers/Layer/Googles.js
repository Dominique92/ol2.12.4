/*DCM++ � Dominique Cavailhez 2012.
 * Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full text of the license. */
 
//DCM  TODO: int�grer script src="http://maps.google.com/maps/api/js?v=3&amp;sensor=false"
//*DCM*/document.write('<script src="http://maps.google.com/maps/api/js?v=3&amp;sensor=false"></script>'); // Inclue la d�claration google

/**
 * @requires OpenLayers/Layer/Google.js
 * @requires OpenLayers/Layer/SphericalMercator.js
 * @requires OpenLayers/Layer/EventPane.js
 * @requires OpenLayers/Layer/FixedZoomLevels.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Class: OpenLayers.Layer.Google...
 * Create various Google layers
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Google>
 */

//DCM  TODO ??? OpenLayers.Layer.Google.prototype.MIN_ZOOM_LEVEL = 2;

OpenLayers.Layer.Google.Terrain = OpenLayers.Class(OpenLayers.Layer.Google, {
	type: google.maps.MapTypeId.TERRAIN,
	MAX_ZOOM_LEVEL: 15,
    CLASS_NAME: "OpenLayers.Google.Terrain"
});
 
OpenLayers.Layer.Google.Photo = OpenLayers.Class(OpenLayers.Layer.Google, {
	type: google.maps.MapTypeId.SATELLITE,
    CLASS_NAME: "OpenLayers.Google.Photo"
});
 
OpenLayers.Layer.Google.Hybrid = OpenLayers.Class(OpenLayers.Layer.Google, {
	type: google.maps.MapTypeId.HYBRID,
    CLASS_NAME: "OpenLayers.Google.Hybrid"
});