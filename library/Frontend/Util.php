<?php

	class Frontend_Util {

		public function generate_random_alphastring($length = 10) {
			$chars = "abcdefghijklmnopqrstuvwxyz0123456789";
			$code = "";
			while (strlen($code) < $length) {
				$code .= $chars[mt_rand(0,strlen($chars)-1)];
			}
			return $code;
		}
	}
?>