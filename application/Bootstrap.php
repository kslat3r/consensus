<?php

	class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

		protected function _initAutoload() {
		    Zend_Loader_Autoloader::getInstance()->setFallbackAutoloader(true);

		    $autoloader = new Zend_Application_Module_Autoloader(array('namespace' => 'Data', 'basePath' => APPLICATION_PATH.'/../library/Data'));
            $autoloader->addResourceType('Data_Models', 'models', 'Data_Model');
            $autoloader->addResourceType('Data_Mappers', 'models/mappers', 'Data_Model_Mapper');

            $autoloader = new Zend_Application_Module_Autoloader(array('namespace' => 'Consensus', 'basePath' => APPLICATION_PATH.'/../library/Consensus'));
            $autoloader->addResourceType('Consensus_Models', 'models', 'Consensus_Model');
            $autoloader->addResourceType('Consensus_Mappers', 'models/mappers', 'Consensus_Model_Mapper');
		}

		protected function _initConfig() {
			$config = new Zend_Config($this->getOptions());
			Zend_Registry::set('config', $config);
		}

	    protected function _initErrorHandling() {
	        $front = Zend_Controller_Front::getInstance();
	        $front->registerPlugin(new Generic_ModuleErrorHandler());
	    }

		protected function _initTimezone() {
	        date_default_timezone_set('Europe/London');
	    }

	    protected function _initMongo() {
	    	$config = Zend_Registry::get('config');

	    	if (!Zend_Registry::isRegistered('mongo')) {
		    	$connection = new MongoClient($config->mongo->protocol.$config->mongo->username.':'.$config->mongo->password.'@'.$config->mongo->hostname.':'.$config->mongo->port.'/'.$config->mongo->database_name);
		    	$db_name	= $config->mongo->database_name;
		    	$mongo		= $connection->$db_name;

		    	Zend_Registry::set('mongo', $mongo);
		    }
	    }

	    protected function _initSession() {
	    	Zend_Session::start();

	    	$Sessions 	= new Consensus_Model_Mapper_Sessions();
	    	$Sessions	= $Sessions->find(array('session_id'=>Zend_Session::getId()));
	    	$Session	= isset($Sessions[0]) ? $Sessions[0] : null;

	    	if (!$Session instanceof Consensus_Model_Session) {
	    		$Session 				= new Consensus_Model_Session();
	    		$Session->session_id	= Zend_Session::getId();
	    		$Session->date_created 	= date('Y-m-d H:i:s');
	    		$Session->show_overlay	= true;
	    		$Session->save();
	    	}

	    	Zend_Registry::set('session', $Session);
	    }
	}
