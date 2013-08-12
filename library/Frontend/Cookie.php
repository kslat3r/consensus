<?php

	abstract class Frontend_Cookie {

		protected $_cookieName;

		protected function _isset() {
			return isset($_COOKIE[$this->_cookieName]);
		}

		protected function _get() {
			return $_COOKIE[$this->_cookieName];
		}

		protected function _set($val) {
			setcookie($this->_cookieName, $val, time()+60*60*24*365, '/');
		}
	}
?>