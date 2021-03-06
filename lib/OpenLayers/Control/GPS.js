/*DCM++ © Dominique Cavailhez 2012
 * Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full text of the license.
 * DCM++ FROM: http://openlayers.org/dev/examples/geolocation.html
 * Nécéssite quelques ajouts dans theme/default/styles.css
 */

/**
 * @requires OpenLayers/Control/Geolocate.js
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Control/Panel.js
 */

/**
 * Class: OpenLayers.Control.GPS
 * Create a control to display the geolocation
 *
 * Inherits from:
 *  - <OpenLayers.Control.Geolocate>
 */

OpenLayers.Control.GPS = OpenLayers.Class(OpenLayers.Control.Geolocate, {

    /**
     * APIProperty: type
     * {Number} Controls can have a 'type'. The type determines the type of
     * interactions which are possible with them when they are placed in an
     * <OpenLayers.Control.Panel>.
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * Property: nbIteration
     * {Integer} The number of position updates to be done when activated. 0 for loop
     */
    nbIteration: 0,

    /**
     * Property: iteration
     * {Integer} The number of position updates left to be done
     */
    iteration: 0,

    /**
     * Property: timerId
     * {Integer} The window timer ID for location refresh
     */
    timerId: 0,

    /**
     * Property: timerPeriod
     * {Integer} The delay (in milliseconds) between 2 location refresh
     */
    timerPeriod: 5000,

    /**
     * Property: timerPeriod
     * {Integer} The delay (in milliseconds) between 2 location refresh
     */
    timerPeriod: 5000,

    /**
     * Property: callBack
     * function (OpenLayers.Geometry.Point) To be called eachtime location is completed
     */
    callBack: function () {},

    /**
     * APIMethod: activate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (!this.geolocation) {
            alert (OpenLayers.i18n('locationuncapable'));
            return false;
        }
        this.events.register ("locationupdated", this, this.locationUpdated);
        this.iteration = this.nbIteration;
        if (OpenLayers.Control.Geolocate.prototype.activate.apply(this, arguments)) {
            this.timerId = window.setInterval (
                OpenLayers.Function.bind (this.getCurrentLocation, this),
                this.timerPeriod
            );
        } else
            return false;
    },

    /**
     * APIMethod: deactivate
     * Deactivates a control and it's associated handler if any.  The exact
     * effect of this depends on the control itself.
     *
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function() {
        window.clearInterval (this.timerId);
        this.events.remove ("locationupdated");

        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            if (this.vector)
                this.vector.removeAllFeatures();
        } else
            return false;
    },

    /**
     * APIMethod: locationUpdated
     * To be executed each time that the position is updated
     */
    locationUpdated: function(e) {
        if (!this.vector) {
            this.vector = new OpenLayers.Layer.Vector ('GPS');
            map.addLayer (this.vector);
        }
        this.vector.removeAllFeatures();
        this.vector.addFeatures([
            new OpenLayers.Feature.Vector( // Une croix rouge à l'emplacement géolocalisé
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector( // Un cercle gris de zone de précision
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy/2,
                    40,
                    0
                ),
                {},
                {
                    fillColor: '#000',
                    fillOpacity: 0.1,
                    strokeWidth: 0
                }
            )
        ]);
		this.callBack (new OpenLayers.Geometry.Point(e.point.x, e.point.y));
		if (!--this.iteration) // On arrête le timer aprés nbIteration
			window.clearInterval (this.timerId);
    },

    /**
     * Method: failure
     * method called on browser's geolocation failure
     *
     */
    failure: function (geoPositionError) {
        this.deactivate();
        var wording = 'UNKNOWN';
        switch (geoPositionError.code) {
            case 1: // PERMISSION_DENIED
                wording = 'PERMISSION_DENIED';
                break;
            case 2: // POSITION_UNAVAILABLE
                wording = 'POSITION_UNAVAILABLE';
                break;
            case 3: // TIMEOUT
                wording = 'TIMEOUT';
        }
        alert (OpenLayers.i18n ('locationfailed', {wording:wording}));
    },

    CLASS_NAME: "OpenLayers.Control.GPS"
});


/**
 * Class: OpenLayers.Control.GPSPanel
 * Create the panel to handle OpenLayers.Control.GPS
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */

OpenLayers.Control.GPSPanel = OpenLayers.Class(OpenLayers.Control.Panel, {

    /**
     * Property: displayClass
     * {Sting} class to display the panel
     */
    displayClass: 'olControlGPSPanel',

    /**
     * Constructor: OpenLayers.Control.Panel
     * Create a new control panel.
     */
    initialize: function(panelOptions, GPSoptions) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, arguments);

        this.addControls([
            new OpenLayers.Control.GPS(
				OpenLayers.Util.extend(
					{
						title: OpenLayers.i18n('gpscontrol')
					},
					GPSoptions
				)
			)
        ]);
    },

    CLASS_NAME: "OpenLayers.Control.GPSPanel"
});
