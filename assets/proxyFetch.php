<?php
	header('Content-Type: application/json');

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

	if(isset($_GET['cat'])){
		echo get_data("http://iostp.org:8080/cat");
	}else if(isset($_GET['feeds'])){
		echo get_data("http://iostp.org:8080/cat/feeds");
	}else{
		echo get_data("http://iostp.org:8080/cat/feeds");
	}

?>