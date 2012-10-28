/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/WMS.js
 * @requires proj4js-combined.js
*/

/**
 * Class: OpenLayers.Layer.IDEE
 * Instances of the IDEE class allow viewing maps of Infraestructura de Datos Espaciales de España
 * IDEE Espana
 * From : http://mapa.ign.gob.ar/docs/OpenLayers
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.WMS>
 */
OpenLayers.Layer.IDEE = OpenLayers.Class(OpenLayers.Layer.WMS, {

    /**
     * Constructor: OpenLayers.Layer.IDEE
     * Create a new IDEE layer.
     */
    initialize: function(name) {
		if (typeof Proj4js == 'object')
			Proj4js.defs["EPSG:23030"] = "+proj=utm +zone=30 +ellps=intl +towgs84=-131,-100.3,-163.4,-1.244,-0.020,-1.144,9.39 +units=m +no_defs";
		else
			alert ('ERROR: This map needs to include proj4js-combined.js');
		
        OpenLayers.Layer.WMS.prototype.initialize.call(this, name, 
			'http://www.idee.es/wms/MTN-Raster/MTN-Raster', 
			{layers: 'mtn_rasterizado'},
			{
				buffer: 0,
				maxExtent: new OpenLayers.Bounds (-100000, 3950000, 1150000, 4900000),
				projection: 'EPSG:23030',
				resolutions: [1800,900,450,225,120,50,25,10,4.5,3,2],
				attribution:
					'<a style="text-decoration:none;padding:0px 4px 2px 4px;color:black;font-size:12;font-family:Arial black;color:white;background-color:#E2BF0D"'+
						' title="Llegar IDEE"'+
						' href="http://www.idee.es/clientesIGN/wmsGenericClient">'+
						'&copy; IDEE'+
					'</a> '+
					'<a href="http://www.idee.es/fr/web/guest/aviso-legal" title="Aviso Legal">'+
						'Aviso Legal'+
					'</a>'
			}
		);
    },

    CLASS_NAME: "OpenLayers.Layer.IDEE"
});
