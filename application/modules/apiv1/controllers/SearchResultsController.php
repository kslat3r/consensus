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

            $SearchResults = $this->_mapper->find($data, $order_by, $direction, $limit);

            $classified_check = true;

            if (is_array($SearchResults)) {
                foreach ($SearchResults as $SearchResult) {
                    if ($SearchResult->classified == false) {
                        $classified_check = false;
                    }
                }
            }

            if ($classified_check == true && count($SearchResults) > 0) {
                $out = array();

                if (is_array($SearchResults)) {
                    foreach ($SearchResults as $SearchResult) {
                        $out[] = $SearchResult->toArray();
                    }
                }

                $Jobs = new Consensus_Model_Mapper_Jobs();
                $Job = $Jobs->findById($data['job_id']);
                
                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode($out));
            }
            else {
                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode(false));
            }
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