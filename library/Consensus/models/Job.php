<?php

	require 'IronWorker.php';

	class Consensus_Model_Job extends Data_Model_Base {

		protected $_collection	= 'jobs';
		protected $_className	= 'Consensus_Model_Job';
		private $_priority		= 0;

		public function delete() {

			//find all search results

			$SearchResults = new Consensus_Model_Mapper_SearchResults();
			$SearchResults = $SearchResults->find(array('job_id'=>new MongoId($this->id)));

			if (is_array($SearchResults)) {
				foreach ($SearchResults as $SearchResult) {
					$SearchResult->delete();
				}
			}

			parent::delete();
		}

		public function pushToWorker() {
			$config = Zend_Registry::get('config');

			$Worker = new IronWorker(array(
    			'token' => $config->ironworker->token,
    			'project_id' => $config->ironworker->project_id
			));

			if (APPLICATION_ENV == 'production') {
				$Worker->postTask('classifier', array('job_id' => $this->id), array('priority'=>$this->_priority));
			}
			elseif (APPLICATION_ENV == 'development') {
				$Worker->postTask('classifier_dev', array('job_id' => $this->id), array('priority'=>$this->_priority));	
			}
		}
	}
?>