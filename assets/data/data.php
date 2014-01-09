<?php

$http_origin = $_SERVER['HTTP_ORIGIN'];

if ($http_origin == "http://www.iotschool.org")
{
    	header("Access-Control-Allow-Origin: $http_origin");
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');
}

function get_data($url) {
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;
}

echo get_data('http://dashboard.iotschool.org/assets/data/devices.json');
?>
