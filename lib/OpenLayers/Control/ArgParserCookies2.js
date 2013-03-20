/*DCM++ � Dominique Cavailhez 2012.
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

	// Param�tres invariants suivant les couches pr�sentes sur les diff�rentes cartes
    scale: null, // L'�ch�le en clair
    baseLayer: null, // La couche de base en clair

    getParameters: function(map) {
		// par ordre inverse de priorit�
		// Si rien d'autre n'est sp�cifi�
		this.params = {
			zoom: 6,
			lat: 47,
			lon: 2,
			layers: 'B' // Sinon, n'appelle pas configureLayers
		};

		// Les d�fauts d�clar�s dans le PermalinkCookies
		var plc = this.map.getControlsByClass ('OpenLayers.Control.PermalinkCookies');
		if (plc.length && plc[0].defaut)
			OpenLayers.Util.extend (this.params, plc[0].defaut);

		// ou ArgParserCookies
		OpenLayers.Util.extend (this.params, this.defaut);

		// Les param�tres m�moris�s par le cookie OLparams
		var cookies = OpenLayers.Util.readCookie ('params');
		if (cookies) 
			OpenLayers.Util.extend (this.params, OpenLayers.Util.getParameters('?'+cookies));

		// Les arguments de la ligne de commande
		var args = OpenLayers.Util.getParameters(window.location.href);
		// Annule les param�tres suppl�mentaires pr�c�dents
		OpenLayers.Util.extend (this.params, args);
		
		// Les valeurs forc�es d�clar�s dans le PermalinkCookies
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
				var isParamLayer = this.map.layers[i].name == this.params.baseLayer || // Si c'est la couche demand�e par le param�tre
					baseLayerInvalide; // Ou pas de param�tre ou d�ja vue mais pas valide
/*
debug.push(this.map.layers[i].name+' A:'+baseLayerInvalide+' B:'+firstValidLayer+' C:'+isParamLayer
+' D:'+(!extent)+' E:'+extent.containsLonLat (this.map.center)+' F:'+(!extent || extent.containsLonLat (this.map.center)
)+' G:'+extent.clone().transform (this.map.layers[i].projection, 'EPSG:4326')+' H:'+this.map.center.clone().transform (this.map.layers[i].projection, 'EPSG:4326'));
*/
				if (!extent || extent.containsLonLat (this.map.center)) { // La couche est valide pour la position de la carte
					if (isParamLayer) {
						this.map.setBaseLayer (this.map.layers[i]); // On l'affiche
						this.map.events.unregister('addlayer', this, this.configureLayers); // Et on arr�te l�
					} else {
						if (!firstValidLayer) // M�morise la premi�re couche valide
							firstValidLayer = this.map.layers[i];
					}
				} else {
					if (isParamLayer) {
						baseLayerInvalide = true;
					} else {
						this.map.setBaseLayer (firstValidLayer); // On affiche la premi�re valide 
						this.map.events.unregister('addlayer', this, this.configureLayers); // Et on arr�te l�
					}
				}
			}
//{var v=debug,r='';for(i in v)r+=i+'='+(typeof v[i]=='function'?'function':typeof v[i]+' '+v[i]+' '+(v[i]&&v[i].CLASS_NAME?'('+v[i].CLASS_NAME+')':''))+"\n";alert(r)}
    },

    setCenter: function(map) {
		// R�initialise le zoom avec l'�chele de la carte m�moris�e (si toutes les cartes n'ont pas les m�mes r�solutions)
		// Ce calcul est fait ici car la baselayer est d�finie
		if (this.map.baseLayer && this.params.scale) {
			var resolution = OpenLayers.Util.getResolutionFromScale (this.params.scale, this.map.baseLayer.units);
			this.zoom = this.map.getZoomForResolution (resolution, true);
		}
		OpenLayers.Control.ArgParser.prototype.setCenter.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.ArgParserCookies"
});
