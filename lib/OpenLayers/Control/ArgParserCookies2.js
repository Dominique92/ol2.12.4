/*DCM++ © Dominique Cavailhez 2012.
 * Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full text of the license. */

/**
 * @requires OpenLayers/Control/ArgParser.js
 * @requires OpenLayers/Control/PermalinkCookies.js
 * @requires OpenLayers/Util/Cookies.js
 */

/**
 * Class: OpenLayers.Control.ArgParserCookies
 * Create an instance of OpenLayers.Control.ArgParser that keep lon,lat, zoom & active layers in cookies
 *
 * Inherits from:
 *  - <OpenLayers.ArgParser>
 */

OpenLayers.Control.ArgParserCookies = OpenLayers.Class(OpenLayers.Control.ArgParser, {

	// Paramètres invariants suivant les couches présentes sur les différentes cartes
    scale: null, // L'échèle en clair
    baseLayer: null, // La couche de base en clair

    getParameters: function(map) {
		// par ordre inverse de priorité
		// Si rien d'autre n'est spécifié
		this.params = {
			zoom: 6,
			lat: 47,
			lon: 2,
			layers: 'B' // Sinon, n'appelle pas configureLayers
		};

		// Les défauts déclarés dans le PermalinkCookies
		var plc = this.map.getControlsByClass ('OpenLayers.Control.PermalinkCookies');
		if (plc.length && plc[0].defaut)
			OpenLayers.Util.extend (this.params, plc[0].defaut);

		// ou ArgParserCookies
		OpenLayers.Util.extend (this.params, this.defaut);

		// Les paramètres mémorisés par le cookie OLparams
		var cookies = OpenLayers.Util.readCookie ('params');
		if (cookies) 
			OpenLayers.Util.extend (this.params, OpenLayers.Util.getParameters('?'+cookies));

		// Les arguments de la ligne de commande
		var args = OpenLayers.Util.getParameters(window.location.href);
		// Annule les paramètres supplémentaires précédents
		OpenLayers.Util.extend (this.params, args);
		
		// Les valeurs forcées déclarés dans le PermalinkCookies
		if (plc.length && plc[0].force)
			OpenLayers.Util.extend (this.params, plc[0].force);

		// ou ArgParserCookies
		OpenLayers.Util.extend (this.params, this.force);

		return this.params;
    },

    configureLayers: function() {
var debug = Array();
		var baseLayerInvalide = !this.params.baseLayer;
		var firstValidLayer = null;
		for (var i=0, len=this.map.layers.length; i<len; i++)
			if (this.map.layers[i].isBaseLayer) {
				var extent = this.map.layers[i].validExtent
					? this.map.layers[i].validExtent
					: this.map.layers[i].maxExtent;
				var isParamLayer = this.map.layers[i].name == this.params.baseLayer || // Si c'est la couche demandée par le paramètre
					baseLayerInvalide; // Ou pas de paramètre ou déja vue mais pas valide
/*
debug.push(this.map.layers[i].name+' A:'+baseLayerInvalide+' B:'+firstValidLayer+' C:'+isParamLayer
+' D:'+(!extent)+' E:'+extent.containsLonLat (this.map.center)+' F:'+(!extent || extent.containsLonLat (this.map.center)
)+' G:'+extent.clone().transform (this.map.layers[i].projection, 'EPSG:4326')+' H:'+this.map.center.clone().transform (this.map.layers[i].projection, 'EPSG:4326'));
*/
				if (!extent || extent.containsLonLat (this.map.center)) { // La couche est valide pour la position de la carte
					if (isParamLayer) {
						this.map.setBaseLayer (this.map.layers[i]); // On l'affiche
						this.map.events.unregister('addlayer', this, this.configureLayers); // Et on arrête là
					} else {
						if (!firstValidLayer) // Mémorise la première couche valide
							firstValidLayer = this.map.layers[i];
					}
				} else {
					if (isParamLayer) {
						baseLayerInvalide = true;
					} else {
						this.map.setBaseLayer (firstValidLayer); // On affiche la première valide 
						this.map.events.unregister('addlayer', this, this.configureLayers); // Et on arrête là
					}
				}
			}
//{var v=debug,r='';for(i in v)r+=i+'='+(typeof v[i]=='function'?'function':typeof v[i]+' '+v[i]+' '+(v[i]&&v[i].CLASS_NAME?'('+v[i].CLASS_NAME+')':''))+"\n";alert(r)}
    },

    setCenter: function(map) {
		// Réinitialise le zoom avec l'échele de la carte mémorisée (si toutes les cartes n'ont pas les mêmes résolutions)
		// Ce calcul est fait ici car la baselayer est définie
		if (this.map.baseLayer && this.params.scale) {
			var resolution = OpenLayers.Util.getResolutionFromScale (this.params.scale, this.map.baseLayer.units);
			this.zoom = this.map.getZoomForResolution (resolution, true);
		}
		OpenLayers.Control.ArgParser.prototype.setCenter.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.ArgParserCookies"
});
