/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * � Dominique Cavailhez 2012.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/WMS.js
 */

/**
 * Class: OpenLayers.Layer.IGM
 * Instances of the IGM class allow viewing maps of IGM (Istituto Geografico Militare) Geoportale Nazionale
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.WMS>
 */
OpenLayers.Layer.IGM = OpenLayers.Class(OpenLayers.Layer.WMS, {

    /**
     * APIProperty: mapUrl
     * {String} The url where the WMS service is distributed by IGM
     */
	mapUrl: 'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/',
	
    /**
     * Property: serverResolutions
     * {Array} the resolutions provided by the Bing servers.
     */
	resolutions: [
/* TODO: les grandes �ch�les
		1.40625,
		0.703125,
		0.3515625,
		0.17578125,
		0.087890625,
		0.0439453125,
		0.02197265625,
		0.010986328125,
		0.0054931640625,
		0.00274658203125,
		0.001373291015625,
*/
		0.0006866455078125,
		0.00034332275390625,
		0.000171661376953125,
		0.0000858306884765625,
		0.00004291534423828125,
		0.00004291534423828125/2
	],
	
    /**
     * Property: attribution
     * {String} list of parameters of attribution to display on the layer
     */
	attribution: {
		name: 'IGM',
		site: 'http://www.pcn.minambiente.it/viewer/',
		licence: 'http://www.pcn.minambiente.it/GN/terminidiservizio.php',
		style: 'color:white;background-color:#6A0000'
	},
	
    /**
     * Constructor: OpenLayers.Layer.IGM
     * Create a new IGM layer.
     */
    initialize: function(name) {
        OpenLayers.Layer.WMS.prototype.initialize.call(this, name, 
		null, 
		{layers: this.layerName},
		{
			maxExtent: new OpenLayers.Bounds (6.6, 36.7, 18.5, 47),
			buffer: 0,
			tileSize: new OpenLayers.Size (512, 512), // Moins de filigranes
			resolutions: this.resolutions,
			attribution: '<a class="DCattribution" style="'+this.attribution.style+'" href="'+this.attribution.site+'" title"Site d\'origine">&copy; '+this.attribution.name+'</a>&nbsp;<a href="'+this.attribution.licence+'" title="Conditions d\'utilisation">Conditions d\'utilisation</a>'
		});
    },
	
    /**
     * Method: moveTo
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean} Tells when zoom has changed, as layers have to
     *     do some init work in that case.
     * dragging - {Boolean}
     */
    moveTo: function(bounds, zoomChanged, dragging) {
		if(zoomChanged) {
/* TODO pour mettre la carte exp�rimentale OSM format WMS pour les grandes �ch�les
			if (this.map.zoom < 11) {
				this.url = 'http://129.206.228.72/cached/osm?';
				this.params.LAYERS= 'osm_auto:all';
				this.params.FORMAT= 'image/png';
			} else
*/
			if (this.map.zoom < this.resolutions.length - 4) {
				this.url = this.mapUrl + 'IGM_250000.map';
				this.params.LAYERS= 'CB.IGM250000';
			} else
			if (this.map.zoom < this.resolutions.length - 2) {
				this.params.LAYERS= 'MB.IGM100000';
				this.url = this.mapUrl + 'IGM_100000.map';
			} else {
				this.url = this.mapUrl + 'IGM_25000.map';
				this.params.LAYERS= 'CB.IGM25000';
			}
		}
		return OpenLayers.Layer.WMS.prototype.moveTo.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Layer.IGM"
});