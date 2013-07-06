<?php

    abstract class Data_Model_Mapper_Factory {

        private $_pk = '_id';

        protected $_collection;
        protected $_className;
        protected $_mongo;

        public function __construct() {
            $this->_mongo   = Zend_Registry::get('mongo');
            $col            = $this->_collection;
            $this->_mongo   = $this->_mongo->$col;
        }

        public function find($params = array()) {
            return $this->returnInstances($this->_mongo->find($params));
        }

        public function findById($id) {
            $out = $this->returnInstances($this->_mongo->find(array($this->_pk=>$id)));

            if (isset($out[0])) {
                return new $this->_className($out[0]);
            }

            return null;
        }

        public function returnInstances($results) {
            $out = array();

            foreach ($results as $result) {
                if (is_array($result)) {
                    $out[]  = new $this->_className($result);
                }
                else {
                    throw new Exception(array('msg'=>'MongoDB returned a non-array value - WTF'));
                }
            }

            return $out;
        }

        public function create($arr) {
            $obj = new $this->_className($arr);

            $obj->save();
            return $obj;
        }
    }
?>