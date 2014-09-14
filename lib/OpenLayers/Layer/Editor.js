/*DCM++ © Dominique Cavailhez 2014
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Format.js
 * @requires OpenLayers/Format/Compact.js
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/StyleMap.js
 * @requires OpenLayers/Control/DownloadFeature.js
 * @requires OpenLayers/Control/LoadFeature.js
 * @requires OpenLayers/Control/CutFeature.js
 * @requires OpenLayers/Control/ModifyFeature.js
 * @requires OpenLayers/Control/DrawFeaturePath.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Projection.js
 * @requires OpenLayers/Control/Snapping.js
 */

/**
 * Class: OpenLayers.Layer.Editor
 * Create an editable instance of OpenLayers.Layer.Vector
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Editor = OpenLayers.Class(OpenLayers.Layer.Vector, {

	/**
	 * Property: name
	 * {String}
	 * Default name
	 */
	name: 'Editor',

	/**
	 * Property: inputId
	 * {String}
	 * Dom element contenant le texte des lignes
	 */
	inputId: 'inputId',

	/**
	 * Property: inputDom
	 * {DOMElement}
	 * Dom element contenant le texte des lignes
	 */
	inputDom: null,

	/**
	 * Property: format
	 * {Array(<OpenLayers.Format>)}
	 * Default format
	 */
	format: null,

	/**
	 * Property: panel
	 * {[<OpenLayers.Control.Panel>]}
	 * Editor's panel
	 */
	panel: new OpenLayers.Control.Panel ({
		displayClass: 'olControlEditingToolbar'
	}),

	/**
	 * Property: controls
	 * {[<OpenLayers.Control>]}
	 * Controls to be added to the editor
	 */
	controls: [],

	/**
	 * Property: layers
	 * {[<OpenLayers.Layer.Vector>]}
	 * List of background layers to include to the editor
	 */
	layers: [],

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
	 * Constructor: OpenLayers.Layer.Editor
	 * Create a new vector layer
	 *
	 * Parameters:
	 * name - {String} A name for the layer
	 * options - {Object} Optional object with non-default properties to set on
	 *		   the layer.
	 *
	 * Returns:
	 * {<OpenLayers.Layer.Editor>} A new vector layer
	 */
	initialize: function (options) {
		OpenLayers.Util.extend (this, options);

		OpenLayers.Layer.Vector.prototype.initialize.call (
			this,
			this.name,
			{styleMap: this.styleMap}
		);
	},

	/**
	 * Method: addControls
	 * The layer has been added to the map.
	 *
	 * If there is no renderer set, the layer can't be used. Remove it.
	 * Otherwise, give the renderer a reference to the map and set its size.
	 *
	 * Parameters:
	 * controls - {[<OpenLayers.Control>]}
	 */
	addControls: function (controls) {
		var newControls = [];
		for (var c = 0; c < controls.length; c++)
			if (!controls[c].notApplicable) {
				controls[c].layer = this;
				controls[c].title = OpenLayers.i18n(controls[c].CLASS_NAME .replace('OpenLayers.Control.','')); // Pour le popup aide à l'utilisation
				newControls.push (controls[c]);
			}
		this.panel.addControls (newControls);
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
		map.addControl (this.panel);
		this.addControls (this.controls); // Les contrôles paramètrables
		this.addControls ([ // Les controles de base
			new OpenLayers.Control.DownloadFeature (), // Du dernier au premier
			new OpenLayers.Control.LoadFeature (),
			new OpenLayers.Control.CutFeature (this),
			new OpenLayers.Control.ModifyFeature (this),
			new OpenLayers.Control.DrawFeaturePath (this),
			new OpenLayers.Control.Navigation ()
		]);

		if (this.layers.length)
			map.addLayers (this.layers);

		// La couche à éditer
		this.format = new OpenLayers.Format.Compact ({
			'internalProjection': map.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection('EPSG:4326')
		});
		this.inputDom = document.getElementById(this.inputId);
		if (this.inputDom)
			this.addFeatures (this.format.read (this.inputDom.innerHTML));

		// Configure the snapping agent
		this.snap.push (this);
		var snap = new OpenLayers.Control.Snapping ({
			layer: this,
			targets: this.snap
		});
		map.addControl (snap);
		snap.activate ();
	},

    drawFeature: function(feature, style) {
		OpenLayers.Layer.Vector.prototype.drawFeature.apply(this, arguments);

		// Surcharge le la méthode pur sauvegarder chaque modif
		this.inputDom.innerHTML = this.format.write (this.features);
	},

	CLASS_NAME: "OpenLayers.Layer.Editor"
});
