<?php

    class Apiv1_Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

    	protected function _initAutoload() {
            $autoloader = new Zend_Application_Module_Autoloader(array ('namespace' => '', 'basePath' => APPLICATION_PATH.'/modules/apiv1'));
            $autoloader->addResourceType('Plugins', 'controllers/plugins', 'Apiv1_Plugin_');
            $autoloader->addResourceType('Helpers', 'controllers/helpers', 'Apiv1_Helper_');
        }

        protected function _initConfig() {
            $config = new Zend_Config_Ini(APPLICATION_PATH.'/modules/apiv1/configs/module.ini', APPLICATION_ENV);
            Zend_Registry::set('apiv1_config', $config);
        }

        protected function _initRest() {
            $front  = Zend_Controller_Front::getInstance();
            $router = $front->getRouter();

            //specifying the "apiv2" module only as RESTful:

            $restRoute = new Zend_Rest_Route($front, array(), array('apiv1'));
            $router->addRoute('apiv1', $restRoute);
        }

        protected function _initHelpers() {
            Zend_Controller_Action_HelperBroker::addHelper(new Apiv1_Helper_Rest());
        }
    }
?>
