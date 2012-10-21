/*DCM++ � Dominique Cavailhez 2012.
 * Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full text of the license. */

/**
 * @requires OpenLayers/Layer/Vector.js
 */

/**
 * Class: OpenLayers.Control.Editor
 * Create an editable instance of OpenLayers.Layer.Vector
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */

OpenLayers.Layer.Editor = OpenLayers.Class(OpenLayers.Layer.Vector, {
	format: new OpenLayers.Format.GML (), // Format par d�faut                           
	
	bounds: null, // Bornes cumul�es
		
    initialize: function (name, url, options) {
		if (OpenLayers.BROWSER_NAME == 'msie') {
			alert ('Editeur non support� sous Internet Explorer');
			return;
		}
		OpenLayers.Util.extend (this, options);
		
		// Initialisation de la strat�gie de sauvegarde
		this.saveStrategy = new OpenLayers.Strategy.Save();
		this.saveStrategy.events.register ('success', null, function () {
			alert ("Modifications enregistr�es");
			this.layer.refresh (); // Va rechercher le r�sultat sur le serveur et le r�affiche pour �tre sur qu'on a bien enregistr�
		});
		this.saveStrategy.events.register ('fail', null, function () {
			alert ("Erreur lors de l'enregistrement des modifications");
		});

        OpenLayers.Layer.Vector.prototype.initialize.call (this, name, {
			styleMap: new OpenLayers.StyleMap({
				'default': {
					strokeColor: 'red',
					strokeWidth: 3,
					cursor: 'pointer',
					fillColor: 'orange',
					fillOpacity: 0.4, 
					pointRadius: 6
				},
				'select': {
					strokeOpacity: 0.3
				}
			}),
			protocol: new OpenLayers.Protocol.HTTP ({
				url: url,
				format: this.format
			}),
			strategies: [
				this.saveStrategy,
				new OpenLayers.Strategy.Fixed ()
			],
			onFeatureInsert: function () { // Quand la couche est re�ue
				this.map.zoomToExtent (this.getDataExtent ()); // On recadre � chaque fichier car on ne sait pas dans quel ordre ils sont upload�s
			}
		});
    },

    setMap: function(map) {        
        OpenLayers.Layer.Vector.prototype.setMap.apply(this, arguments);

		// add some editing tools to a panel
		var panel = new OpenLayers.Control.Panel ({
			displayClass: 'olControlEditingToolbar'
		});
		panel.addControls([
			new OpenLayers.Control.SaveFeature ({
				layer: this,
				title: "Sauvegarder les modifications du trac�"
			}),
			new OpenLayers.Control.DeleteFeature (this, {
				title:
					"Supprimer une ligne: Cliquer sur la ligne puis accepter"
			}),
			new OpenLayers.Control.CutFeature (this, {
				title:
					"Supprimer un sommet: Cliquer sur la ligne puis sur le sommet � supprimer\n\n"+
					"Couper une ligne en 2: Cliquer sur la ligne puis sur le mileu du segment � supprimer"
			}),
			new OpenLayers.Control.ModifyFeature (this, {
				deleteCodes: [32, 46, 67, 99, 68, 100, 83, 115],
				title:
					"D�placer un sommet: Cliquer sur la ligne, cliquer sur le sommet, maintenir et faire glisser\n\n"+
					"Ajouter un sommet � une ligne: Cliquer sur la ligne, cliquer et faire glisser le mileu d un segment\n\n"+
					"Supprimer un sommet d une ligne: Cliquer sur la ligne, survoler le sommet � supprimer et apuyer sur S"
			}),
			new OpenLayers.Control.DrawFeatureExtended (this, OpenLayers.Handler.Path, {
				displayClass: 'olControlDrawFeaturePoint', 
				title: 
					"Ajouter une ligne: Cliquer � l'emplacement du d�but, sur chaque point interm�diaire, double cliquer � la fin\n\n"+
					"Etendre une ligne: Cliquer sur une extr�mit�, sur chaque point interm�diaire, double cliquer � la fin\n\n"+
					"Joindre deux lignes: Cliquer sur une extr�mit�, double cliquer sur l'autre"
			}),
			new OpenLayers.Control.Navigation ({
				title: "Naviguer sur la carte"
			})
		]);
		map.addControl(panel);

		// configure the snapping agent
		var snap = new OpenLayers.Control.Snapping({layer: this});
		map.addControl(snap);
		snap.activate();
    },

	// On a lu le nom d'un fichier sur le disque
	// <input type="file" onchange="Editor.onAddFile(this.files)" />
    addFiles: function(files) {
		if (window.FileReader)
			for (i in files)
				if (this.file = files[i]) {
					var fr = new FileReader();
					fr.owner = this; // Pour r�f�rence dans le callback
					fr.onload = function (e) {this.owner.addFile (e.target.result)}
					fr.readAsText (this.file);
				} else 
					alert ('Failed to load file');
		else 
			alert ('FileReader non support� par cet explorateur');
    },

	// Le contenu du fichier est lu
    addFile: function (file) {
		var format = new OpenLayers.Format.GPX({
			'internalProjection': this.map.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection('EPSG:4326')
		});
		var features = format.read(file);
		if (features) {
			// On recopie tous les points dans une seule nouvelle ligne pour �viter les points orphelins partout
			var ligne = new OpenLayers.Feature.Vector (
				new OpenLayers.Geometry.LineString()
			);
			for (f in features) {
				var vertices = features[f].geometry.getVertices ();
				for (v in vertices)
					ligne.geometry.addComponent (vertices [v].clone ()); // On les ins�re dans la nouvelle ligne
			}
			this.addFeatures ([ligne]);
			this.boundsAdded = this.boundsAdded
				? this.boundsAdded.extend (ligne.geometry.getBounds()) // On cumule les bornes
				: ligne.geometry.getBounds();
		}
		this.map.zoomToExtent (this.getDataExtent ()); // On recadre � chaque fichier car on ne sait pas dans quel ordre ils sont upload�s
    },
   
	CLASS_NAME: "OpenLayers.Layer.Editor" 
});