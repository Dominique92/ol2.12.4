<?php

$dir = '../../vues'; // Si inclu dans refuges.info
if (!is_dir ($dir)) $dir = '../TEST'; // Sinon, la page de test

require 'jsmin-1.1.1.php';

$ollib = explode ('@@@', file_get_contents ('OpenLayers.js'));

foreach (scandir ($dir) AS $f)
    if (is_file ($dir.'/'.$f)) {
        preg_match_all ('/new ([A-Z|a-z|\.]*)/', file_get_contents ($dir.'/'.$f), $fs2);
        foreach ($fs2[1] AS $classe)
            addFile (str_replace ('.', '/', $classe).'.js');
    }

$ollib [] = $ollib [1]; // On ajoute la fin du fichier
unset ($ollib [1]);
file_put_contents ('../lib/OpenLayers.js', $ollib);
    
function addFile ($fileName) {
    global $files, $ollib;
    if (is_file ('../lib/'.$fileName) && !isset ($files [$fileName]) && !strstr ($fileName, 'SingleFile')) {
        $files [$fileName] = true;
        preg_match_all ('/@requires ([A-Z|a-z|0-9|_|\-|\/|\.]*)/', file_get_contents ('../lib/'.$fileName), $fs);
        foreach ($fs[1] AS $f)
            addFile ($f);
        $ollib [] = "'$fileName',\n";
//*DCMM*/echo'<pre style="background-color:white">'.var_export($fileName,true).'</pre>';
    }
    else if (!is_file ('../lib/'.$fileName))
        echo'<pre style="background-color:white">ERREUR: fichier inexistant'.var_export($fileName,true).'</pre>';
}
    
    
    exit();
        add_file ($dir.'/'.$f);
 
function add_file ($f,$n=0) {
/*DCMM*/echo'<pre style="background-color:white">add_file'.var_export($f.' '.$n,true).'</pre>';
    global $flilesChecked, $files, $ollib;
    preg_match_all ('/@requires ([A-z|\/]*)/', file_get_contents ($f), $fs1);
    preg_match_all (      '/new ([A-z|\.]*)/', file_get_contents ($f), $fs2);
    foreach (array_merge ($fs1 [1], str_replace ('.', '/', $fs2 [1])) AS $fn)
{
        if (is_file ("../lib/$fn.js") && !isset ($flilesChecked ["../lib/$fn.js"]))
{
    $flilesChecked ["../lib/$fn.js"] = true;
//if ($n < 10)
            add_file ("../lib/$fn.js",$n+1);
            if (strstr ($fn, 'OpenLayers/') && !strstr ($fn, 'SingleFile')) {
                $ollib [] = "'$fn.js',\n";
echo'<pre>'.$n.var_export("../lib/$fn.js",true).'</pre>';
}
}
    }
}
?>