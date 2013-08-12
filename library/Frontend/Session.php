<?php

	class Frontend_Session {

		private $_session;

		public function __construct($namespace) {
			$this->registerSession($namespace);
		}

		public function __set($name, $val) {
			$this->_session->$name = (is_string($val) ? trim($val) : $val);
		}

		public function __get($name) {
			if (isset($this->_session->$name)) {
				return $this->_session->$name;
			}

			return null;
		}

		public function registerSession($namespace) {
			$this->_session = new Zend_Session_Namespace($namespace);
		}

		public function setData(array $array) {
			foreach ($array as $key=>$val) {
				$this->_session->$key = $val;
			}
		}

		public function getData() {
			$out = array();

			foreach ($this->_session as $key=>$val) {
				$out[$key] = $val;
			}

			return $out;
		}

		public function clearData() {
			foreach ($this->_session as $key=>$val) {
				$this->_session->$key = null;
			}
		}

		public function destroy() {
			$this->_session->unsetAll();
		}
	}
?>