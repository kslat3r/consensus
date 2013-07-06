<?php

class ErrorController extends Zend_Controller_Action {

    public function init() {
        $this->_helper->layout()->setLayoutPath(APPLICATION_PATH.'/modules/default/layouts/scripts');
        $this->_helper->layout()->setLayout('error');
    }

    public function errorAction() {
        $errors = $this->_getParam('error_handler');

        switch ($errors->type) {
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ROUTE:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:
                $this->notfoundAction($errors);
                break;
            default:
                $this->servererrorAction($errors);
                break;
        }

        $this->view->request = $errors->request;
    }

    public function notfoundAction($errors = false) {
        if ($errors && $errors instanceof ArrayObject && $this->getInvokeArg('displayExceptions') == true) {
            $this->view->exception = $errors->exception;
        }

        $this->getResponse()->setHttpResponseCode(404);
        $this->_helper->viewRenderer->setRender('error/404', null, true);
    }

    public function servererrorAction($errors = false) {
        if ($errors && $errors instanceof ArrayObject && $this->getInvokeArg('displayExceptions') == true) {
            $this->view->exception = $errors->exception;
        }

        $this->getResponse()->setHttpResponseCode(500);
        $this->_helper->viewRenderer->setRender('error/500', null, true);
    }
}