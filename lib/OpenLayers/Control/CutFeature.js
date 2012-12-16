/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
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
				vertex.geometry.parent) {
				var noPoint = OpenLayers.Util.indexOf(this.vertices, vertex);
				// Si c'est un vrai sommet, on l'enlève
				if (noPoint == 0 || noPoint == this.vertices.length - 1) { // Si c'est le premier ou le dernier point du segment
				}
				else if (noPoint != -1) {
					// Il y a au moins un segment de chaque côté: On dédouble ce sommet et on se retrouve avec deux segments
					// On crée le nouveau segment
					var l = new OpenLayers.Feature.Vector (
						new OpenLayers.Geometry.LineString()
					);
					for (i=0; i<=noPoint; i++) { // Pour les n premiers points de la ligne
						if (i != noPoint)
							vertex.geometry.parent.removeComponent (this.vertices [i].geometry); // On retire les n - 1 premiers points
						l.geometry.addComponent(this.vertices [i].geometry, i); // On les insère dans la nouvelle ligne
					}
					this.layer.addFeatures([l]); // On ajoute la ligne à la couche
				}
				// Si c'est un point virtuel (au milieu d'un segment), on coupe de la ligne en 2 segments
				else if (OpenLayers.Util.indexOf(this.virtualVertices, vertex) != -1) {
					var noCentre = OpenLayers.Util.indexOf(this.virtualVertices, vertex); // n° du segment cliqué
					if (!noCentre) // Cas du premier segment
						vertex.geometry.parent.removeComponent (this.vertices [0].geometry); // On retire le premier point
					else if (noCentre == this.virtualVertices.length - 1) // ou du dernier
						vertex.geometry.parent.removeComponent (this.vertices [this.vertices.length - 1].geometry); // On retire le dernier point
					else { // Il y a au moins un segment de chaque côté: On retire ce segment et on se retrouve avec deux tronçons
						// On crée une nouvelle ligne
						var l = new OpenLayers.Feature.Vector (
							new OpenLayers.Geometry.LineString()
						);
						for (i=0; i<=noCentre; i++) { // Pour les n premiers points de la ligne
							vertex.geometry.parent.removeComponent (this.vertices [i].geometry); // On retire les n premiers points
							l.geometry.addComponent(this.vertices [i].geometry, i); // On les insère dans la nouvelle ligne
						}
						this.layer.addFeatures([l]); // On ajoute la ligne à la couche
					}
				} else
					return; // On n'a rien fait
					
				// Avertissements d'usage et nétoyage de l'affichage
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

    /**
     * APIMethod: shiftClickFeature
     * Called when the SHIFT key is pressed on a feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The concerned feature.
     */
	shiftClickFeature: function(feature) {
		// La ligne déja sélectée
		var lineSelect = this.layer.selectedFeatures[0].geometry;
		var pointsSelect = lineSelect.getVertices();

		// La ligne survolée
		var lineHover = feature.geometry.parent ? feature.geometry.parent  : feature.geometry;
		var pointsHover = lineHover.getVertices();
		
		if (lineHover != lineSelect) {
			// Quelles sont les 2 extrémités le splus proches ?
			var dmin = 1000000000, amin, bmin;
			for (a=0; a<=pointsHover.length-1; a+=pointsHover.length-1)
			for (b=0; b<=pointsSelect.length-1; b+=pointsSelect.length-1) {
				var d = pointsHover [a].distanceTo (pointsSelect [b]);
				if (dmin > d) {
					dmin = d;
					amin = a;
					bmin = b;
				}
			}
			for (i in pointsHover)
				if (amin && bmin)
					lineSelect.addComponent (pointsHover [pointsHover.length-1 - i], pointsSelect.length-1 + i);
				else if (amin)
					lineSelect.addComponent (pointsHover [pointsHover.length-1 - i], 0);
				else if (bmin)
					lineSelect.addComponent (pointsHover [i], pointsSelect.length-1 + i);
				else
					lineSelect.addComponent (pointsHover [i], 0);

			// Suppression du segment intégré
			if (this.layer.events.triggerEvent("beforefeaturesremoved", {feature: feature}) !== false && feature) {
				feature.destroy ();
				this.layer.events.triggerEvent("featureremoved", {feature: feature})
			}
			// Nétoyage de l'affichage du segment allongé
			this.layer.drawFeature(this.layer.selectedFeatures[0], this.standalone ?
				undefined :
				this.selectControl.renderIntent);
			this.modified = true;
			this.resetVertices();
			this.setFeatureState();
			this.onModification(this.layer.selectedFeatures[0]);
			this.layer.events.triggerEvent("featuremodified", {feature: this.layer.selectedFeatures[0]});
		}
	},

    /**
     * Method: handleKeypress
     * Called by the feature handler on keypress.  This is used to delete vertex.
     *
     * Parameters:
     * evt - {Event} Keypress event.
     */
    handleKeypress: function (evt) {
        if (OpenLayers.Util.indexOf(this.deleteCodes, evt.keyCode) != -1 && // check for delete key
			this.layer.events.triggerEvent("beforefeaturesremoved", {feature: this.feature}) !== false &&
			this.feature) {
			this.feature.destroy ();
			this.unselectFeature(this.feature);
			this.layer.events.triggerEvent("featureremoved", {feature: this.feature})
        }
    },

	CLASS_NAME: "OpenLayers.Control.CutFeature"
});
