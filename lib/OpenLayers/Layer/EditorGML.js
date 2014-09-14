/*DCM++ © Dominique Cavailhez 2012
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Format/GML.js
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/SaveFeature.js
 * @requires OpenLayers/Control/DownloadFeature.js
 * @requires OpenLayers/Control/LoadFeature.js
 * @requires OpenLayers/Strategy/Save.js
 * @requires OpenLayers/StyleMap.js
 * @requires OpenLayers/Protocol/HTTP.js
 * @requires OpenLayers/Strategy/Fixed.js
 * @requires OpenLayers/Control/CutFeature.js
 * @requires OpenLayers/Control/ModifyFeature.js
 * @requires OpenLayers/Control/DrawFeaturePath.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/Snapping.js
 */

/**
 * Class: OpenLayers.Layer.EditorGML
 * Create an editable instance of OpenLayers.Layer.Vector
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 *
 * DCMM TODO: Hériter de OpenLayers.Layer.Editor
 */
OpenLayers.Layer.EditorGML = OpenLayers.Class(OpenLayers.Layer.Vector, {

	/**
	 * Property: name
	 * {String}
	 * Default name
	 */
	name: 'EditorGML',

	/**
	 * Property: controls
	 * {[<OpenLayers.Control>]}
	 * List of editor's panel controls
	 */
	controls: [],

	/**
	 * Property: snap
	 * {[<OpenLayers.Layer.Vector>]}
	 * List of objects for configuring target layers for snapping control
	 */
	snap: [],

	/**
	 * Property: styleMap
	 * {<OpenLayers.styleMap>}
	 * Style d'affichage des lignes
	 */
	styleMap: new OpenLayers.StyleMap ({
		'default': { // Visualisation d'une trace
			strokeColor: 'red',
			strokeWidth: 3,
			cursor: 'pointer',
			fillColor: 'orange',
			fillOpacity: 0.4,
			pointRadius: 6
		},
		'temporary': { // Création d'une trace
			strokeColor: 'red',
			strokeWidth: 3,
			cursor: 'pointer',
			fillColor: 'orange',
			fillOpacity: 0.3,
			pointRadius: 6,
			strokeOpacity: 0.4
		},
		'select': { // Edition d'une trace
			strokeOpacity: 0.3
		}
	}),

	/**
	 * Constructor: OpenLayers.Layer.EditorGML
	 * Create a new vector layer
	 *
	 * Parameters:
	 * name - {String} A name for the layer
	 * options - {Object} Optional object with non-default properties to set on
	 *		   the layer.
	 *
	 * Returns:
	 * {<OpenLayers.Layer.EditorGML>} A new vector layer
	 */
	initialize: function (name, url, options) {
		OpenLayers.Util.extend (this, options);

		OpenLayers.Layer.Vector.prototype.initialize.call (this, name, {
			protocol: new OpenLayers.Protocol.HTTP ({
				url: url,
				format: new OpenLayers.Format.GML ()
			}),
			strategies: [
				this.saveStrategy = new OpenLayers.Strategy.Save(),
				new OpenLayers.Strategy.Fixed ()
			]
		});

		// Initialisation de la stratégie de sauvegarde
		this.saveStrategy.events.register ('success', null, function () {
			alert (OpenLayers.i18n('uploadSuccess'));
			this.layer.refresh (); // Va rechercher le résultat sur le serveur et le réaffiche pour être sur qu'on a bien enregistré
		});
		this.saveStrategy.events.register ('fail', null, function (e) {
			alert (OpenLayers.i18n('uploadFailure') +"\nError "+ e.response.priv.status +" : "+ e.response.priv.statusText +"\n"+ e.response.priv.responseText);
			// Nécéssite le patch finalResponse.priv = response.priv; en ligne 504 de lib/Openlayers/Protocol/HTTP.js
		});
	},

	/**
	 * Method: setMap
	 * The layer has been added to the map.
	 *
	 * If there is no renderer set, the layer can't be used. Remove it.
	 * Otherwise, give the renderer a reference to the map and set its size.
	 *
	 * Parameters:
	 * map - {<OpenLayers.Map>}
	 */
	setMap: function(map) {
		OpenLayers.Layer.Vector.prototype.setMap.apply(this, arguments);

		// Add the editing tools to a panel
		var panel = new OpenLayers.Control.Panel ({
			displayClass: 'olControlEditingToolbar'
		});
		map.addControl (panel);
		this.controls.push (
			new OpenLayers.Control.SaveFeature (), // Du dernier au premier
			new OpenLayers.Control.DownloadFeature (), // Du dernier au premier
			new OpenLayers.Control.LoadFeature (),
			new OpenLayers.Control.CutFeature (this),
			new OpenLayers.Control.ModifyFeature (this),
			new OpenLayers.Control.DrawFeaturePath (this),
			new OpenLayers.Control.Navigation ()
		);
		for (var c = 0; c < this.controls.length; c++)
			if (!this.controls[c].notApplicable) {
				this.controls[c].layer = this;
				this.controls[c].title = OpenLayers.i18n(this.controls[c].CLASS_NAME .replace('OpenLayers.Control.','')); // Pour le popup aide à l'utilisation
				panel.addControls (this.controls[c]);
			}

		// Configure the snapping agent
		this.snap.push (this);
		var snap = new OpenLayers.Control.Snapping ({
			layer: this,
			targets: this.snap
		});
		map.addControl (snap);
		snap.activate ();
	},

	CLASS_NAME: "OpenLayers.Layer.EditorGML"
});
