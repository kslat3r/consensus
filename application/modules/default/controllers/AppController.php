<?php

    class AppController extends Zend_Controller_Action {

    	public function init() {

            //set layout

            $this->_helper->layout()->setLayoutPath(APPLICATION_PATH.'/modules/default/layouts/scripts');
            $this->_helper->layout()->setLayout('app');

            //check for access token

            $Session = Zend_Registry::get('session');

            if (!is_array($Session->access_token)) {
                $this->_helper->redirector('index', 'index');
            }
        }

        public function indexAction() {

        }
    }
?>