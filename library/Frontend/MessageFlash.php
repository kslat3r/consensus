<?php

	class Frontend_MessageFlash extends Frontend_Session {

		public function __construct() {
			parent::__construct('message_flash');
		}

		//singleton

		public function getInstance() {
			static $instance;

			if (!$instance instanceof Frontend_MessageFlash) {
				$instance = new Frontend_MessageFlash();
			}

			return $instance;
		}

		public function error($msg) {
			$this->errors = array_merge(is_array($this->errors) ? $this->errors : array(), array($msg));
		}

		public function success($msg) {
			$this->successes = array_merge(is_array($this->successes) ? $this->successes : array(), array($msg));
		}

		public function info($msg) {
			$this->infos = array_merge(is_array($this->infos) ? $this->infos : array(), array($msg));
		}

		public function warning($msg) {
			$this->warnings = array_merge(is_array($this->warnings) ? $this->warnings : array(), array($msg));
		}

		public function errorsCount() {
			return count($this->errors);
		}

		public function successesCount() {
			return count($this->successes);
		}

		public function infosCount() {
			return count($this->infos);
		}

		public function warningsCount() {
			return count($this->warnings);
		}

		public function getErrors() {
			$out = $this->errors;
			$this->errors = array();

			return $out;
		}

		public function getSuccesses() {
			$out = $this->successes;
			$this->successes = array();

			return $out;
		}

		public function getInfos() {
			$out = $this->infos;
			$this->infos = array();

			return $out;
		}

		public function getWarnings() {
			$out = $this->warnings;
			$this->warnings = array();

			return $out;
		}

		public function reset() {
			$this->errors 		= array();
			$this->successes	= array();
			$this->infos		= array();
			$this->warnings		= array();
		}
	}
?>