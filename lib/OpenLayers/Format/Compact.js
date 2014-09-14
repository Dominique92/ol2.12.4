/*DCM++ © Dominique Cavailhez 2014
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Feature/Vector.js
 */

/**
 * Class: OpenLayers.Format.Compact
 * Read Compact format. Create a new instance with the <OpenLayers.Format.Compact>
 *	 constructor. This reads text which is formatted like 5.8373,45.24352 5.76729,45.14965 ...
 *
 * Inherits from:
 *  - <OpenLayers.Format>
 */
OpenLayers.Format.Compact = OpenLayers.Class(OpenLayers.Format, {

	/**
	 * APIMethod: read
	 * Return a list of features from a compact text string.
	 *
	 * Parameters:
	 * text - {String}
	 *
	 * Returns:
	 * Array({<OpenLayers.Feature.Vector>})
	 */
	read: function (texte) {
		var features = [];
		var style = this.defaultStyle ?
			OpenLayers.Util.applyDefaults({}, this.defaultStyle) :
			null;
		var lignes = texte.split ('\n');
		for (var l in lignes) {
			var Gpoints = [];
			var points = lignes[l].split (' ');
			for (var p in points)
				if (points[p]) {
					var coords = points[p].split (',');
					if (coords.length == 2)
						Gpoints.push (new OpenLayers.Geometry.Point (coords[0], coords[1]));
				}
			if (Gpoints.length > 0) {
				var geom = new OpenLayers.Geometry.LineString (Gpoints);
				if (this.internalProjection && this.externalProjection)
					geom.transform (this.externalProjection, this.internalProjection);
				features.push (new OpenLayers.Feature.Vector (geom, {}, style));
			}
		}
		return features;
	},

	/**
	 * Method: write
	 * Accept features, and return a string.
	 *
	 * Parameters:
	 * object - {features} Features to be serialized
	 *
	 * Returns:
	 * {String} A string representation of the features.
	 */
	write: function (features) {
		var Tlignes = [];
		for (var f in features) {
			var Tpoints = [];
			var geom = features[f].geometry.clone().transform (this.internalProjection, this.externalProjection);
			for (var c in geom.components)
				Tpoints.push (Math.round (geom.components[c].x*100000)/100000 + ',' + Math.round(geom.components[c].y*100000)/100000);

			Tlignes.push (Tpoints.join (' ')); 
		}
		return Tlignes.join ('\n');
	},

	CLASS_NAME: "OpenLayers.Format.Compact"
});
