<?php

defined('APPLICATION_PATH') || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../application'));

defined('APPLICATION_ENV') || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

// Ensure library/ is on include_path

set_include_path(
    implode(PATH_SEPARATOR, array(
        realpath(APPLICATION_PATH . '/../library'),
        realpath(APPLICATION_PATH . '/modules'),
        realpath(APPLICATION_PATH . '/../library/IronWorker'),
        get_include_path()
    ))
);

require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');
$application->bootstrap()->run();
