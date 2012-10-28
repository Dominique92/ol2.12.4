/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/ModifyFeature.js
 */

/**
 * Class: OpenLayers.Control.DeleteFeature
 * Create an instance of OpenLayers.Control.ModifyFeature that completely remove a feature
 *
 * Inherits from:
 *  - <OpenLayers.Control.ModifyFeature>
 */

OpenLayers.Control.DeleteFeature = OpenLayers.Class(OpenLayers.Control.ModifyFeature, {

    /**
     * APIMethod: selectFeature
     * Destroy the selected feature
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    selectFeature: function(feature) {
        if ((!this.standalone ||
			this.layer.events.triggerEvent("beforefeaturesremoved", {feature: feature}) !== false
			) &&
			confirm ('Destruction ' + (feature.attributes.name || feature.id) + ' ?')) {
				feature.destroy ();
				this.layer.events.triggerEvent("featureremoved", {feature: feature})
			}
    },

	CLASS_NAME: "OpenLayers.Control.DeleteFeature"
});
