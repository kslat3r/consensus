<?php

	class Frontend_String {

		public function __construct($value) {
			$this->value 	= $this->_stripUrls($value);
			$this->value	= $this->_stripHashTags($this->value);
			$this->value	= $this->_stripAtTags($this->value);
		}

		private function _stripUrls($string) {
			return preg_replace('/\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i', '', $string);
		}

		private function _stripHashTags($string) {
			return preg_replace('/\s?#(\w+)/', '', $string);
		}

		private function _stripAtTags($string) {
			return preg_replace('/@(\w+)/', '', $string);
		}

	}

?>