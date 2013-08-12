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

        public function find($data = array(), $order_by = null, $direction = null, $limit = null) {
            $out = $this->_mongo->find($data);

            if ($order_by !== null && $direction !== null) {
                $out = $out->sort(array($order_by=>(int) $direction));
            }

            if ($limit !== null) {
                $out = $out->limit($limit);
            }

            return $this->returnInstances($out);
        }

        public function findById($id) {
            $out = $this->returnInstances($this->_mongo->find(array($this->_pk=>new MongoId($id))));

            if (isset($out[0]) && $out[0] instanceof Data_Model_Base) {
                return $out[0];
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