/*DCM++ © Dominique Cavailhez 2012.
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * © Dominique Cavailhez 2012.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Navigation.js
 */

/**
 * Class: OpenLayers.Control.SaveFeature
 * Create an instance of OpenLayers.Control.Navigation that completely remove a feature
 *
 * Inherits from:
 *  - <OpenLayers.Control.Navigation>
 */

OpenLayers.Control.SaveFeature = OpenLayers.Class(OpenLayers.Control.Navigation, {

    /**
     * APIMethod: activate
     * Activate the control.
     * 
     * Returns:
     * {Boolean} Successfully activated the control.
     */
    activate: function () {
        var r = OpenLayers.Control.Navigation.prototype.activate.apply(this,arguments);
		
		// On force l'upload pour tous les segments
		for (f = 0; f < this.layer.features.length; f++)
			this.layer.features[f].state = OpenLayers.State.INSERT; 
			
		this.layer.saveStrategy.save ();
		
		return r;
    },

	CLASS_NAME: "OpenLayers.Control.SaveFeature"
});
