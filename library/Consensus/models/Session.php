<?php

	class Consensus_Model_Session extends Data_Model_Base {

		protected $_collection	= 'sessions';
		protected $_className	= 'Consensus_Model_Session';

		public function delete() {

			//delete all jobs

			$Jobs = new Consensus_Model_Mapper_Jobs();
			$Jobs = $Jobs->find(array('session_id'=>$this->id));

			if (is_array($Jobs)) {
				foreach ($Jobs as $Job) {
					$Job->delete();
				}
			}

			parent::delete();
		}
	}
?>