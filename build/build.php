<?php
$openLayersVersion = '2.12';

require 'jsmin-1.1.1.php';

// Lit la liste des includes
$openLayersJs = explode ('/*SPLIT*/', file_get_contents ('../lib/OpenLayers.js'));
// 0: entete
// 1: if(!singleFile) {
// 2: "OpenLayers/*.js",
// 3: ]; // etc.}
// 4: fin

// Fichier lib/OpenLayers.js tronqué (pour inclusion du code aprés minification)
$fp = fopen ('OpenLayers.tmp', 'wb');
$nbcar_ecrits = 0;
$nbcar_ecrits += fwrite ($fp, "/* Fichier temporaire généré automatiquement par build.php. Ne pas modifier */\n");
$nbcar_ecrits += fwrite ($fp, "var OpenLayers={singleFile:true};\n");
$nbcar_ecrits += fwrite ($fp, $openLayersJs[0]);
$nbcar_ecrits += fwrite ($fp, $openLayersJs[4]);
fclose ($fp);
echo "OpenLayers.tmp : $nbcar_ecrits caractères écrits<br>";

// Liste de tous les fichiers à inclure
eval ('$files ["../OpenLayers.js"] = Array ("../build/OpenLayers.tmp", ' .$openLayersJs[2] .');');
//eval ('$files ["../Editor.js"] = Array (' .$openLayersJs[3] .');');

// D'abord remplacer provisoirement les caractères qui ne passent pas dans le compresseur
$carspe = array (
	'�' => '@AG@',
	'�' => '@EE@',
	'�' => '@EG@',
	'�' => '@UG@',
	'�' => '@DG@',
	'à' => '@uAG@',
	'é' => '@uEE@',
	'è' => '@uEG@',
	'°' => '@uDG@',
	'ù' => '@uUG@',
);
$specar = array_flip ($carspe);

$log = '';
$deb = time();
foreach ($files AS $fn => $fs) {
	$ol = "/* Librairie minifiée Openlayers générée sur {$_SERVER['SERVER_NAME']} le " .date('r')."\n\n"
		 .file_get_contents ('../licenses.txt')."*/\n";
		 
	foreach ($fs AS $f) {
		$cf = file_get_contents ("../lib/$f");
		$c = str_replace ($specar, $carspe, $cf);
		$c = utf8_decode (JSMin::minify ($c));
		$c = str_replace ($carspe, $specar, $c);
		$ol .= $c;
		$o = '';
		foreach (explode ("\n", "\n$cf") AS $k => $v)
			switch (substr ($v, 0, 7)) {
			case '//DCM  ': // Introduction de la modif
				$o .= "<br>\n<i>"   .htmlspecialchars (trim (substr ($v, 6))) ."</i>";
				break;
			case '/*DCM++': // Nouveau fichier
				$o .= ": <i>nouveau fichier</i>";
				break;
			case '//DCM//': // Lignes supprimées
				$o .= "<br>\n$k---" .htmlspecialchars (trim (substr ($v, 6)));
				break;
			case '/*DCM*/': // Ligne ajoutée
				$o .= "<br>\n$k++"  .htmlspecialchars (trim (substr ($v, 6)));
				break;
			case '//DCM<<': // Lignes ajoutées
				$o .= "<br>\nPlusieurs lignes ajoutées: "  .htmlspecialchars (trim (substr ($v, 6)));
				break;
			}
		if ($o)
			$log .= "<b>$f</b>$o<hr>\n";
	}
	// Ecriture de la lib en 1 seule fois pour minimiser la durée d'indisponibilité
	$log .= "Écriture $fn ".strlen($ol)." octets<hr>\n";
	$fp = fopen ($fn, 'wb');
	$nbcar_ecrits = fwrite ($fp, $ol);
	fclose ($fp);
	echo "$fn : $nbcar_ecrits caractères écrits<br>";
}

$elapsed = time () - $deb;
echo "<b>OpenLayers.js généré en $elapsed s " .date('r') ."</b><br>\nModifications par rapport à OpenLayers-$openLayersVersion:<hr>$log";
$fpl = fopen ('build.log.html', 'w');
$nbcar_ecrits = fwrite ($fpl, "<b>Openlayers.js généré sur {$_SERVER['SERVER_NAME']} le " .date('r') 
	."</b><br>\nModifications par rapport à OpenLayers-$openLayersVersion:<hr>\n$log");
fclose ($fpl);
echo "build.log.html : $nbcar_ecrits caractères écrits<br>";
?>