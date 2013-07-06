<?php

    class AuthController extends Zend_Controller_Action {

    	public function init() {

            //set layout

            $this->_helper->layout()->setLayoutPath(APPLICATION_PATH.'/modules/default/layouts/scripts');
            $this->_helper->layout()->setLayout('site');
        }

        public function indexAction() {
            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);

            $this->_helper->redirector('login', 'auth');
        }

        public function loginAction() {
            $this->_checkLoggedIn();
        }

        public function oauthAction() {
            $this->_checkLoggedIn();

            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);

            $Config     = Zend_Registry::get('config');
            $Session    = Zend_Registry::get('session');

            $TwitterOAuth   = new Frontend_TwitterOAuth($Config->twitter->consumer_key, $Config->twitter->consumer_secret);
            $request_token  = $TwitterOAuth->getRequestToken($Config->twitter->callback_url);

            $Session->oauth_token           = isset($request_token['oauth_token']) ? $request_token['oauth_token'] : null;
            $Session->oauth_token_secret    = isset($request_token['oauth_token_secret']) ? $request_token['oauth_token_secret'] : null;
            $Session->save();

            switch($TwitterOAuth->http_code) {
                case 200:
                    $this->_redirect($TwitterOAuth->getAuthorizeURL($Session->oauth_token));
                    break;
                default:
                    $this->_helper->redirector('servererror', 'error');
                    break;
            }
        }

        public function callbackAction() {
            $this->_checkLoggedIn();

            $this->_helper->layout()->disableLayout();
            $this->_helper->viewRenderer->setNoRender(true);

            $Config     = Zend_Registry::get('config');
            $Session    = Zend_Registry::get('session');
            $params     = $this->getRequest()->getParams();

            if (isset($params['oauth_token']) && $Session->oauth_token != $params['oauth_token']) {
                $this->_clearSession();
            }

            if (!isset($params['oauth_verifier'])) {
                $this->_helper->redirector('servererror', 'error');
                return;
            }

            $TwitterOAuth           = new Frontend_TwitterOAuth($Config->twitter->consumer_key, $Config->twitter->consumer_secret, $Session->oauth_token, $Session->oauth_token_secret);
            $access_token           = $TwitterOAuth->getAccessToken($params['oauth_verifier']);
            $Session->access_token  = $access_token;

            $Session->remove('oauth_token');
            $Session->remove('oauth_token_secret');

            if ($TwitterOAuth->http_code == 200) {

                //save session in db

                $Session->save();

                //redirect

                $this->_helper->redirector('index', 'app');
            }
            else {
                $this->_clearSession();
            }
        }

        public function logoutAction() {
            $this->_clearSession();
        }

        private function _clearSession() {
            $Session = Zend_Registry::get('session');
            $Session->delete();

            $this->_helper->redirector('login', 'auth');
            return;
        }

        private function _checkLoggedIn() {
            $Session = Zend_Registry::get('session');

            if ($Session->access_token !== null && is_array($Session->access_token)) {
                $this->_helper->redirector('index', 'app');
                return;
            }
        }
    }
?>