/*DCM++ © Dominique Cavailhez 2012
 * Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.SaveFeature
 * Create an instance of OpenLayers.Control that upload the features changes on the server
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

OpenLayers.Control.SaveFeature = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIMethod: activate
     * Activate the control.
     * 
     * Returns:
     * {Boolean} Successfully activated the control.
     */
    activate: function () {
        var r = OpenLayers.Control.prototype.activate.apply(this,arguments);
        
        // On force l'upload pour tous les segments
        // Sinon, seuls les segments créés ou modifiés sont remontés et on ne sait pas lesquels ont été supprimés
        for (f = 0; f < this.layer.features.length; f++)
            this.layer.features[f].state = OpenLayers.State.INSERT; 

        this.layer.saveStrategy.save (); //DCMM TODO c'est pas BO ! A refaire
        this.deactivate(); // Aucune raison de le laisser sélecté quand le save est fait
        this.layer.map.zoomToExtent (this.layer.getDataExtent ()); // On recadre sur l'ensemble des features au cas ou il y aurait des égarés loin
        
        return r;
    },

    CLASS_NAME: "OpenLayers.Control.SaveFeature"
});
