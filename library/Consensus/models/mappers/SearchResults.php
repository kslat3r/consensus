<?php

	class Consensus_Model_Mapper_SearchResults extends Data_Factory {

		protected $_collection 	= 'search_results';
		protected $_className	= 'Consensus_Model_SearchResult';

		public function find($data) {
			if (!isset($data['from_id']) && !isset($data['to_id'])) {
				return parent::find($data);
			}

			$sql = "SELECT * FROM ".$this->_name;

			$statements = array();

			if (isset($data['from_id'])) {
				$statements[] = "id > ".$data['from_id'];
			}

			if (isset($data['to_id'])) {
				$statements[] = "id < ".$data['to_id'];
			}

			if (isset($data['job_id'])) {
				$statements[] = "job_id = ".$data['job_id'];
			}

			if (count($statements) > 0) {
				$sql .= " WHERE ".implode(' AND ', $statements);
			}

			if (isset($data['order_by'])) {
				$sql .= " ORDER BY ".$data['order_by'];
			}

			if (isset($data['limit'])) {
				$sql .= " LIMIT ".$data['limit'];
			}

			return $this->findFromSql($sql);
		}
	}
?>