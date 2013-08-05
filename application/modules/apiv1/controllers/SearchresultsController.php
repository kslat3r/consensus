<?php

    class Apiv1_SearchresultsController extends Zend_Rest_Controller {

        private $_mapper;

        public function init() {
    		$this->_mapper  = new Consensus_Model_Mapper_SearchResults();
            
            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);

            $this->getResponse()->setHeader('Content-type', 'application/json');
    	}

    	public function indexAction() {
            $request = $this->getRequest()->getParams();

            //data

            $data = array();

            if (isset($request['job_id'])) {
                $data['job_id'] = new MongoId($request['job_id']);
            }

            if (isset($request['order_by'])) {
                $order_by = $request['order_by'];
            }
            else {
                $order_by = 'source_date_created_timestamp';
            }

            if (isset($request['direction'])) {
                $direction = $request['direction'];
            }
            else {
                $direction = -1;
            }            

            if (isset($request['limit'])) {
                $limit = $request['limit'];
            }
            else {
                $limit = null;
            }

            if (isset($request['from_id'])) {
                $SearchResult = $this->_mapper->findById($request['from_id']);

                if ($SearchResult instanceof Consensus_Model_SearchResult) {
                    $data['source_date_created_timestamp'] = array('$gt'=>$SearchResult->source_date_created_timestamp);
                }
            }

            if (isset($request['to_id'])) {
                $SearchResult = $this->_mapper->findById($request['to_id']);

                if ($SearchResult instanceof Consensus_Model_SearchResult) {
                    $data['source_date_created_timestamp'] = array('$lt'=>$SearchResult->source_date_created_timestamp);
                }
            }

            $SearchResults = $this->_mapper->find($data, $order_by, $direction, $limit);

            $out = array();
            if (is_array($SearchResults)) {
                foreach ($SearchResults as $SearchResult) {
                    $out[] = $SearchResult->toArray();
                }
            }

            $this->getResponse()->setHttpResponseCode(200);
            $this->getResponse()->appendBody(json_encode($out));
    	}

    	public function getAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function postAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function putAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function deleteAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    }
?>