<?php
	header("Access-Control-Allow-Origin: *");
	
	if (! isset($_POST['request']) || 
	    ! isset($_POST['data'])){
		die("false: specify request & data");
	}
	
	$request = @ $_POST['request'];	
	$data    = @ $_POST['data'];
	$data = trim($data);
	
	if (!strlen($data)){
		die("false: strlen == 0");
	} 
	
	$filename = "cart.json";
	
	switch ($request){
		case 'export':
				if (!file_put_contents($filename, $data . PHP_EOL)){
					die("false: file_put_contents failed");
				}
				
				die( "true" );
				
		case 'import':
				if (!file_exists($filename))
					die("false: file does not exist");
				else {
					 $contents = file_get_contents($filename);
					 $contents = trim($contents);
					 if (!strlen($contents))
					 	die("No data in file");
					 else {
					 	die($contents);
					 }	
				}
	}
	
	echo "false: unknown request";
?>