<?php

	require 'IronWorker.php';

	class Consensus_Model_Job extends Data_Model_Base {

		protected $_collection	= 'jobs';
		protected $_className	= 'Consensus_Model_Job';

		public function pushToWorker() {
			$config = Zend_Registry::get('config');

			$Worker = new IronWorker(array(
    			'token' => $config->ironworker->token,
    			'project_id' => $config->ironworker->project_id
			));

			$Worker->postTask('searcher', array('job_id' => $this->id));
		}
	}
?>