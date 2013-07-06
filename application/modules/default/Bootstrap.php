<?php

    class Default_Bootstrap extends Zend_Application_Module_Bootstrap {

        protected function _initAutoload() {
            $autoloader = new Zend_Application_Module_Autoloader(array ('namespace' => '', 'basePath' => APPLICATION_PATH.'/modules/default'));
            $autoloader->addResourceType('Forms_Validators', 'forms/validators', 'Form_Validator_');
            $autoloader->addResourceType('Plugins', 'controllers/plugins', 'Plugin_');
        }

        protected function _initConfig() {
            $config = new Zend_Config_Ini(APPLICATION_PATH.'/modules/default/configs/module.ini', APPLICATION_ENV);
            Zend_Registry::set('default_config', $config);
        }
    }
?>