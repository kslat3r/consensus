<?php

    class IndexController extends Zend_Controller_Action {

    	public function init() {

            //set layout

            $this->_helper->layout()->setLayoutPath(APPLICATION_PATH.'/modules/default/layouts/scripts');
            $this->_helper->layout()->setLayout('site');
        }

        public function indexAction() {

        }
    }
?>