<?php

    abstract class Data_Model_Base {

        private $_pk = '_id';

        protected $_collection;
        protected $_className;
        protected $_mongo;

        protected $_details = array();

        public function __construct(array $details = null) {
            $this->_mongo   = Zend_Registry::get('mongo');
            $col            = $this->_collection;
            $this->_mongo   = $this->_mongo->$col;

            if ($details != null) {
                $this->_details = $details;
            }
        }

        public function __get($key) {
            if ($key == 'id') {
                return (string) $this->_details[$this->_pk];
            }
            else {
                return isset($this->_details[$key]) ? $this->_details[$key] : null;
            }
        }

        public function __set($key, $value) {
            $this->_details[$key] = $value;
        }

        public function remove($key) {
            $this->_mongo->update(array($this->_pk=>$this->_details[$this->_pk]), array('$unset'=>array($key=>1)));
            unset($this->_details[$key]);
        }

        public function update(array $arr) {
            foreach ($arr as $key=>$val) {
                $this->$key = $val;
            }

            $this->save();
        }

        public function save() {
            $this->_mongo->save($this->_details);
        }

        public function delete() {
            $this->_mongo->remove(array($this->_pk=>new MongoId($this->_details[$this->_pk])));
        }

        public function toArray() {
            return $this->_details;
        }
    }
?>