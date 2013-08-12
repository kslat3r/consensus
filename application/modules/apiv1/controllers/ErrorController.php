<?php

    class Apiv1_ErrorController extends Zend_Rest_Controller {

        public function init() {
            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);
        }

        public function indexAction() {
            //placeholder
            exit;
        }

        public function getAction() {
            //placeholder
            exit;
        }

        public function postAction() {
            //placeholder
            exit;
        }

        public function putAction() {
            //placeholder
            exit;
        }

        public function deleteAction() {
            //placeholder
            exit;
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
        }

        public function accountnotfoundAction() {
            $this->getResponse()->setHttpResponseCode(400);
            $this->getResponse()->appendBody('400 Bad Request');
        }

        public function loggedoutAction() {
            $this->getResponse()->setHttpResponseCode(401);
            $this->getResponse()->appendBody('401 Unauthorized');
        }

        public function unpaidAction() {
            $this->getResponse()->setHttpResponseCode(402);
            $this->getResponse()->appendBody('402 Payment Required');
        }

        public function forbiddenAction() {
            $this->getResponse()->setHttpResponseCode(403);
            $this->getResponse()->appendBody('403 Forbidden');
        }

        public function notfoundAction($errors) {
            if ($errors && $errors instanceof ArrayObject && $this->getInvokeArg('displayExceptions') == true) {
                $exception = $errors->exception;
            }

            $this->getResponse()->setHttpResponseCode(404);
            $this->getResponse()->appendBody('404 Not Found');
        }

        public function trialoverAction() {
            $this->getResponse()->setHttpResponseCode(410);
            $this->getResponse()->appendBody('410 Gone');
        }

        public function servererrorAction($errors) {
            if ($errors && $errors instanceof ArrayObject && $this->getInvokeArg('displayExceptions') == true) {
                $exception = $errors->exception;
            }

            $this->getResponse()->setHttpResponseCode(500);
            $this->getResponse()->appendBody($exception->getMessage());
        }
    }
?>