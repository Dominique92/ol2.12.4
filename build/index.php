<?php
ini_set('error_reporting', E_ALL ^ E_NOTICE);
ini_set('display_errors', '1');
date_default_timezone_set('Europe/Paris');

$dir = '../../vues'; // Si inclu dans refuges.info
if (!is_dir ($dir)) $dir = '../TEST'; // Sinon, la page de test

require 'jsmin-1.1.1.php';

// R�cup�rer les ent�te & pied de Openlayers.js
$log = "<b>Openlayers.js g�n�r� sur ".$_SERVER['SERVER_NAME']." le " .date('r')."</b><br/>"
."Modifications par rapport � OpenLayers-2.12:";

$ollib = explode ('@@@', file_get_contents ('OpenLayers.js'));

$olmin = "/* Librairie minifi�e Openlayers g�n�r�e sur {$_SERVER['SERVER_NAME']} le " .date('r')."\n\n"
        .file_get_contents ('../licenses.txt')."*/\n"
        ."var OpenLayers={singleFile:true};"
        .compress ($ollib [0])
        .compress ($ollib [1]);

foreach (scandir ($dir) AS $f)
    if (is_file ($dir.'/'.$f)) {
        $fc = file_get_contents ($dir.'/'.$f);
        $fc = str_replace ('requires', 'new', $fc); // pour @requires OpenLayers/Layer/Googles.js
        $fc = str_replace ('/', '.', $fc);
        $fc = str_replace ('.js', '', $fc);
        preg_match_all ('/new ([A-Z|a-z|\.]*)/', $fc, $fcs);
        foreach ($fcs[1] AS $classe)
            addFile (str_replace ('.', '/', $classe).'.js');
    }

// Ecriture des lib en 1 seule fois pour minimiser la dur�e d'indisponibilit�
$ollib [] = $ollib [1]; // On ajoute la fin du fichier
unset ($ollib [1]);
file_put_contents ('../lib/OpenLayers.js', $ollib);
file_put_contents ('../OpenLayers.js', $olmin);
file_put_contents ('build.log.html', $log);
echo $log;

//------------------------------------------------------------------------------------------------
function addFile ($fileName) {
    $excuses = array (
        'OpenLayers/LonLat.js',
        'OpenLayers/Layer/IGN/Photo.js',
        'OpenLayers/Layer/IGN/Cadastre.js',
        'OpenLayers/Layer/SwissTopo/Siegfried.js',
        'OpenLayers/Layer/SwissTopo/Dufour.js',
        'OpenLayers/Layer/SwissTopo/Photo.js',
        'OpenLayers/Layer/Google/Terrain.js',
        'OpenLayers/Layer/Google/Photo.js',
        'OpenLayers/Layer/Google/Hybrid.js',
        'OpenLayers/Layer/Google/Terrain.js',
        'OpenLayers/Layer/Google/Photo.js',
    );
    global $files, $ollib, $olmin, $log;
    if (is_file ('../lib/'.$fileName) && !isset ($files [$fileName]) && !strstr ($fileName, 'SingleFile')) {
        $files [$fileName] = true;
        $fc = file_get_contents ('../lib/'.$fileName);
        preg_match_all ('/@requires ([A-Z|a-z|0-9|_|\-|\/|\.]*)/', $fc, $fcs);
        foreach ($fcs[1] AS $f)
            addFile ($f);
        $ollib [] = "'$fileName',\n";
        $olmin .= compress ($fc);
		$o = '';
		foreach (explode ("\n", "\n$fc") AS $k => $v) {
            $t = htmlspecialchars (trim (substr ($v, 6)));
			switch (substr ($v, 0, 7)) {
                case '//DCM  ': // Introduction de la modif
                    if ($t)
                        $o .= "<br/>\n<i>$t</i>";
                    break;
                case '/*DCM++': // Nouveau fichier
                    $o .= ": <i>nouveau fichier</i>";
                    break;
                case '//DCM//': // Lignes supprim�es
                    $o .= "<br/>\n$k---$t";
                    break;
                case '/*DCM*/': // Ligne ajout�e
                    $o .= "<br/>\n$k++$t";
                    break;
                case '//DCM<<': // Lignes ajout�es
                    $o .= "<br/>\nPlusieurs lignes ajout�es: $t";
                    break;
			}
        }
		if ($o)
			$log .= "<hr/><b>$fileName</b>$o\n";
    }
    else if (!is_file ('../lib/'.$fileName) && !in_array ($fileName, $excuses))
        echo'<pre style="background-color:white"><b>Erreur fichier inexistant:</b> '.var_export($fileName,true).'</pre>';
}
//------------------------------------------------------------------------------------------------
function compress ($js) {
    // Pour remplacer provisoirement les caract�res qui ne passent pas dans le compresseur
    $carspe = array (
        '�' => '@AG@',
        '�' => '@EE@',
        '�' => '@EG@',
        '�' => '@UG@',
        '�' => '@DG@',
        'à' => '@uAG@',
        'é' => '@uEE@',
        'è' => '@uEG@',
        'ù' => '@uUG@',
        '˚' => '@uDG@',
        '@pad@' => '@pad@',
    );
    $specar = array_flip ($carspe);

    $js = str_replace ($specar, $carspe, $js);
    $js = utf8_decode (JSMin::minify ($js));
    $js = str_replace ($carspe, $specar, $js);
    return $js;
}
?>