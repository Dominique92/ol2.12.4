// On charge la lib quand tout le reste de la page est chargé
window.addEventListener (
	'load',
	function () {
		var scripts = document.getElementsByTagName ('script');
		for (var i=0, len=scripts.length; i<len; i++) {
			var src = scripts[i].getAttribute ('src');
			if (src) {
				var base = src.match(/(.*)onload\/Openlayers.js/i);
				if (base){
					var script = document.createElement ('script');
					script.type = 'text/javascript';
					script.src = base[1]+'OpenLayers.js';
					document.body.appendChild (script);
				}	
			}	
		}	
	}, 
	false
);
