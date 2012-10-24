/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * © Dominique Cavailhez 2012.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/ModifyFeature.js
 */

/**
 * Class: OpenLayers.Control.CutFeature
 * Create an instance of OpenLayers.Control.ModifyFeature that removes one vertex or segment or the full vertice
 *
 * Inherits from:
 *  - <OpenLayers.Control.ModifyFeature>
 */

OpenLayers.Control.CutFeature = OpenLayers.Class(OpenLayers.Control.ModifyFeature, {

    /**
     * APIProperty: pointCursor
     * {String} Curseur à appliquer aux cercles
     */
	pointCursor: 'Crosshair',

    /**
     * Method: dragStart
     * Called by the drag feature control with before a feature is dragged.
     *     This method is used to differentiate between points and vertices
     *     of higher order geometries.  This respects the <geometryTypes>
     *     property and forces a select of points when the drag control is
     *     already active (and stops events from propagating to the select
     *     control).
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The point or vertex about to be
     *     dragged.
     * pixel - {<OpenLayers.Pixel>} Pixel location of the mouse event.
     */
	dragStart: function(feature, pixel) {
		if(this.feature) {
			var vertex = this.dragControl.feature;
			if (vertex &&
				!this.dragControl.handlers.drag.dragging &&
				vertex.geometry.parent)
			{
				// Si c'est un vrai sommet, on l'enlève
				if (OpenLayers.Util.indexOf(this.vertices, vertex) != -1) 
					vertex.geometry.parent.removeComponent(vertex.geometry);
					
				// Si c'est un point virtuel (au milieu d'un segment), on coupe de la ligne en 2 segments
				else if (OpenLayers.Util.indexOf(this.virtualVertices, vertex) != -1) {
					var v = OpenLayers.Util.indexOf(this.virtualVertices, vertex); // n° du segment cliqué
					if (!v) // Cas du premier segment
						vertex.geometry.parent.removeComponent (this.vertices [0].geometry); // On retire le premier point
					else if (v == this.virtualVertices.length - 1) // ou du dernier
						vertex.geometry.parent.removeComponent (this.vertices [this.vertices.length - 1].geometry); // On retire le dernier point
					else { // Il y a au moins un segment de chaque côté: On retire ce segment et on se retrouve avec deux tronçons
						// On crée une nouvelle ligne
						var l = new OpenLayers.Feature.Vector (
							new OpenLayers.Geometry.LineString()
						);
						for (i=0; i<=v; i++) { // Pour les n premiers points de la ligne
							vertex.geometry.parent.removeComponent (this.vertices [i].geometry); // On retire les n premiers points
							l.geometry.addComponent(this.vertices [i].geometry, i); // On les insère dans la nouvelle ligne
						}
						this.layer.addFeatures([l]); // On ajoute la ligne à la couche
					}
				} else
					return; // On n'a rien fait
					
				// Avertissements d'usage et nétoyage de l'affichage
				this.layer.events.triggerEvent("vertexremoved", {
					vertex: vertex.geometry,
					feature: this.feature,
					pixel: pixel
				});
				this.layer.drawFeature(this.feature, this.standalone ?
					undefined :
					this.selectControl.renderIntent);
				this.modified = true;
				this.resetVertices();
				this.setFeatureState();
				this.onModification(this.feature);
				this.layer.events.triggerEvent("featuremodified", {feature: this.feature});
			}
		}
	},

	CLASS_NAME: "OpenLayers.Control.CutFeature"
});
