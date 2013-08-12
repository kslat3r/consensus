<?php

    class AppController extends Zend_Controller_Action {

        private $_Session = null;

    	public function init() {

            //set layout

            $this->_helper->layout()->setLayoutPath(APPLICATION_PATH.'/modules/default/layouts/scripts');
            $this->_helper->layout()->setLayout('app');

            //check for access token

            $this->_Session = Zend_Registry::get('session');

            if (!is_array($this->_Session->access_token)) {
                $this->_helper->redirector('index', 'index');
            }
        }

        public function indexAction() {
            $this->view->show_overlay = $this->_Session->show_overlay;

            $this->_Session->show_overlay = false;
            $this->_Session->save();

            if (APPLICATION_ENV == 'development') {
                $this->view->show_overlay = true;
            }
        }
    }
?>