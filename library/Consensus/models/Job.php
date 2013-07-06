<?php

	class Consensus_Model_Job extends Data_Base {

		protected $_collection	= 'jobs';
		protected $_className	= 'Consensus_Model_Job';

		public function pushToQueue() {
			$config = Zend_Registry::get('config');

			try {
                $AMQP = new Queue_AMQP($config->amqp->exchange, 'job');
                $AMQP->publishMessage($this->toArray());

                return true;
            }
            catch (Exception $e) {

                //logging must be added here

                return false;
            }
		}
	}
?>