/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Map.js
 */

/**
 * Class: OpenLayers.MapDC
 * Instances of the map with all basics baselayers
 * 
 * Inherits from:
 *  - <OpenLayers.Map>
 */
OpenLayers.MapDC = OpenLayers.Class(OpenLayers.Map, {

    /**
     * Constructor: OpenLayers.MapDC
     * Create a new IGM layer.
     */
    initialize: function (div, options, key) {
        OpenLayers.Map.prototype.initialize.call(this, div, {
            displayProjection: 'EPSG:4326', // Affichage en °
            controls: [
                new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoom(),
                new OpenLayers.Control.ScaleLine({geodesic: true}), // L'échelle n'est pas la bonne pour les projections de type mercator. En effet, dans cette projection, le rapport nombre pixel/distance réél augmente quand on se rapproche des pôles.Pour corriger ça, un simple geodesic:yes fait l'affaire (SLY 29/11/2010)
                new OpenLayers.Control.LayerSwitcherConditional(),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.GPSPanel(),
                new OpenLayers.Control.FullScreenPanel(),
                new OpenLayers.Control.PermalinkCookies (options),
                new OpenLayers.Control.Attribution()
            ],
            layers: [
                new OpenLayers.Layer.MRI                 ('Refuges.Info'),
                new OpenLayers.Layer.OSM                 ('OSM'),
                new OpenLayers.Layer.OCM                 ('OpenCycleMap'),
                new OpenLayers.Layer.OCM.Transport       ('Transport'),
                new OpenLayers.Layer.OCM.Landscape       ('Landscape'),
                new OpenLayers.Layer.OCM.Outdoors        ('Outdoors'),

                new OpenLayers.Layer.IGN                 ('IGN',          key.IGN),
                new OpenLayers.Layer.IGN.Photo           ('IGN photo',    key.IGN),
                new OpenLayers.Layer.IGN.Cadastre        ('IGN cadastre', key.IGN),
                
                new OpenLayers.Layer.SwissTopo           ('SwissTopo'),
                new OpenLayers.Layer.SwissTopo.Siegfried ('Swiss 1949'),
                new OpenLayers.Layer.SwissTopo.Dufour    ('Swiss 1864'),
                new OpenLayers.Layer.SwissTopo.Photo     ('Swiss photo'),
                 
                new OpenLayers.Layer.IDEE                ('Espa&ntilde;a'), 
                new OpenLayers.Layer.IGM                 ('Italia'),
                new OpenLayers.Layer.OS                  ('Great Britain', key.OS),
//                new OpenLayers.Layer.OB                  ('OberBayern') // UK Ordonance Survey Layer,
                
                new OpenLayers.Layer.Bing                ({name: 'Bing',        type: 'Road',             key: key.Bing}),
                new OpenLayers.Layer.Bing                ({name: 'Bing photo',  type: 'Aerial',           key: key.Bing}),
                new OpenLayers.Layer.Bing                ({name: 'Bing hybrid', type: 'AerialWithLabels', key: key.Bing}),
                
                new OpenLayers.Layer.Google.Terrain      ('Google'),
                new OpenLayers.Layer.Google              ('Google map',    {visibility: false}), // Cachées au début sinon, apparaissent fugitivement
                new OpenLayers.Layer.Google.Photo        ('Google photo',  {visibility: false}),
                new OpenLayers.Layer.Google.Hybrid       ('Google hybrid', {visibility: false})
            ],
            numZoomLevels: 22
        });
    },

    CLASS_NAME: "OpenLayers.MapDC"
});
