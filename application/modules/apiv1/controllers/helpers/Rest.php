<?php

    class Apiv1_Helper_Rest extends Zend_Controller_Action_Helper_Abstract {

        private $_request_body;
        public $pluginLoader;

        public function __construct() {
            $this->pluginLoader = new Zend_Loader_PluginLoader();
        }

        public function index(Consensus_Model_Mapper_Factory $mapper, $params = array()) {
            $this->getResponse()->setHttpResponseCode(200);

            $request = $this->getRequest()->getQuery();

            $objs = $mapper->find(array_merge($request, $params));

            $out = array();
            foreach ($objs as $obj) {
                $out[] = $obj->toArray();
            }

            $this->getResponse()->setHttpResponseCode(200);
            $this->getResponse()->appendBody(json_encode($out));
        }

        public function get(Consensus_Model_Mapper_Factory $mapper, $params = array()) {
            $id = $this->getRequest()->getParam('id');

            if ($id !== null) {
                $obj = $mapper->findById($id);

                $this->getResponse()->setHttpResponseCode(200);
                $this->getResponse()->appendBody(json_encode($obj->toArray()));
            }
            else {
                $this->getResponse()->setHttpResponseCode(404);
            }
        }

        public function post(Consensus_Model_Mapper_Factory $mapper, $request_body = null) {
            if ($request_body === null) {
                $request_body = $this->getRequest()->getRawBody();
                $request_body = !empty($request_body) ? json_decode($request_body, true) : array();
            }

            unset($request_body['id']);

            $obj = $mapper->create($request_body);

            $this->getResponse()->setHttpResponseCode(201);
            $this->getResponse()->setHeader('Location', $this->getRequest()->REQUEST_URI.'/'.$obj->id);
            $this->getResponse()->appendBody(json_encode($obj->toArray()));
        }

        public function put(Consensus_Model_Mapper_Factory $mapper, $request_body = null) {
            $id = $this->getRequest()->getParam('id');

            if ($request_body === null) {
                $request_body = $this->getRequest()->getRawBody();
                $request_body = !empty($request_body) ? json_decode($request_body, true) : array();
            }

            if ($id !== null) {
                $obj = $mapper->findById($id);

                if ($obj instanceof Consensus_Model_Base) {
                    unset($request_body['id']);
                    $obj->update($request_body);
                    $obj->save();

                    $this->getResponse()->setHttpResponseCode(200);
                    $this->getResponse()->appendBody(json_encode($obj->toArray()));
                }
                else {
                    $this->getResponse()->setHttpResponseCode(404);
                }
            }
            else {
                $this->getResponse()->setHttpResponseCode(404);
            }
        }

        public function delete(Consensus_Model_Mapper_Factory $mapper, $params = array()) {
            $id = $this->getRequest()->getParam('id');

            if ($id !== null) {
                $obj = $mapper->findById($id);

                $this->getResponse()->setHttpResponseCode(204);

                if ($obj instanceof Consensus_Model_Base) {
                    $obj->delete();
                }
            }
            else {
                $this->getResponse()->setHttpResponseCode(404);
            }
        }
    }
?>