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

		// La couche à éditer
		this.format = new OpenLayers.Format.Compact ({
			'internalProjection': map.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection('EPSG:4326')
		});
		this.inputDom = document.getElementById(this.inputId);
		if (this.inputDom)
			this.addFeatures (this.format.read (this.inputDom.value));

		// Configure the snapping agent
		this.snap.push (this);
		var snap = new OpenLayers.Control.Snapping ({
			layer: this,
			targets: this.snap
		});
		map.addControl (snap);
		snap.activate ();

		this.events.on ({
			"featureadded":    formatWrite = function () {this.inputDom.value = this.format.write (this.features)},
			"featuremodified": formatWrite,
			"featureremoved":  formatWrite,
			scope: this
		});
		
        map.zoomToExtent (this.getDataExtent ()); // On recadre sur l'ensemble des features au cas ou il y aurait des égarés loin
	},

	CLASS_NAME: "OpenLayers.Layer.Editor"
});
