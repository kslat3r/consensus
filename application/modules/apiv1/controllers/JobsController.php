<?php

    class Apiv1_JobsController extends Zend_Rest_Controller {

        private $_mapper;
        private $_Session;

        public function init() {
    		$this->_mapper  = new Consensus_Model_Mapper_Jobs();

            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);

            $this->getResponse()->setHeader('Content-type', 'application/json');

            $this->_Session = Zend_Registry::get('session');
    	}

    	public function indexAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function getAction() {
            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function postAction() {
            $data = $this->getRequest()->getRawBody();
            $data = !empty($data) ? json_decode($data, true) : array();

            $data['session_id']     = $this->_Session->id;
            $data['date_created']   = date('Y-m-d H:i:s');

            //create

            $Job = $this->_mapper->create($data);
            $Job->pushToWorker();

            $this->getResponse()->setHttpResponseCode(201);
            $this->getResponse()->setHeader('Location', $this->getRequest()->REQUEST_URI.'/'.$Job->id);
            $this->getResponse()->appendBody(json_encode($Job->toArray()));
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