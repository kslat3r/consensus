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
            $params = $this->getRequest()->getParams();
            $extra  = explode('&', $params['id']);
            
            if (count($extra) == 2) {
                $Job = $this->_mapper->findById($extra[0]);

                if ($Job instanceof Consensus_Model_Job) {

                    #perms?

                    if ($Job->session_id != $this->_Session->id) {
                        $this->getResponse()->setHttpResponseCode(404);
                        return;
                    }

                    if ($Job->executing == false && $Job->started == true) {
                        $Job->pushToWorker();                    
                    }

                    $this->getResponse()->setHttpResponseCode(200);
                    $this->getResponse()->appendBody(json_encode($Job->toArray()));
                    return;
                }                
            }

            $this->getResponse()->setHttpResponseCode(404);
            return;
    	}

    	public function postAction() {
            $data = $this->getRequest()->getRawBody();
            $data = !empty($data) ? json_decode($data, true) : array();

            $data['session_id']     = $this->_Session->id;
            $data['date_created']   = date('Y-m-d H:i:s');
            $data['executing']      = false;
            $data['started']        = false;

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
            $params = $this->getRequest()->getParams();

            if (isset($params['id'])) {
                $Job = $this->_mapper->findById($params['id']);

                if ($Job instanceof Consensus_Model_Job) {

                    #perms?

                    if ($Job->session_id != $this->_Session->id) {
                        $this->getResponse()->setHttpResponseCode(404);
                        return;
                    }

                    $Job->delete();
                    $this->getResponse()->setHttpResponseCode(200);
                    return;
                }                
            }
            
            $this->getResponse()->setHttpResponseCode(204);
            return;
    	}
    }
?>