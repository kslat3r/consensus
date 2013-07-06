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
                $data['job_id'] = $request['job_id'];
            }

            if (isset($request['order_by'])) {
                $data['order_by'] = $request['order_by'];
            }
            else {
                $data['order_by'] = 'source_date_created_timestamp DESC';
            }

            if (isset($request['limit'])) {
                $data['limit'] = $request['limit'];
            }

            $SearchResults = $this->_mapper->find($data);

            $classified_check = true;

            foreach ($SearchResults as $SearchResult) {
                if ($SearchResult->classified == false) {
                    $classified_check = false;
                }
            }

            if ($classified_check == true) {
                $out = array();
                foreach ($SearchResults as $SearchResult) {
                    $out[] = $SearchResult->toArray();
                }

                $Jobs = new Consensus_Model_Mapper_Jobs();
                $Job = $Jobs->findById($data['job_id']);
                $Job->pushToWorker();

                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode($out));
            }
            else if ($classified_check == false) {
                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode(false));
            }
            else {
                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode(array()));
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