# -*- coding:utf-8 -*-
from tornado.escape import json_decode

import com.boyaa.RainbowCenter.common.constant as constant
import com.boyaa.RainbowCenter.common.exception.error_constant as error_constant

from com.boyaa.RainbowCenter.manager.user_manager import UserManager
from com.boyaa.RainbowCenter.web.handler.base import BaseHandler


class LoginHandler(BaseHandler):
    __user_manager = UserManager()

    def __init__(self, *argc, **argkw):
        super(LoginHandler, self).__init__(*argc, **argkw)
        self.user_manager = self.__user_manager

    def get(self, param=None):
        print(param)
        url = 'auth/login.html'
        self.render(url)

    def post(self, param=None):
        self.log.debug('param = %s' % param)
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        user_name = json_obj['user_name'].lower()
        password = json_obj['password']
        self.log.debug('user_name = %s' % user_name)
        self.log.debug('password = %s' % password)
        user = self.user_manager.check_auth(user_name, password)
        if user:
            values = {
                'login_times': True,
                'last_login_time': True
            }
            self.user_manager.update_user(user['id'], values)
            self.set_current_user(user)
            self.operate_log('登录', constant.log_status_success, user['id'])
        else:
            error_code = error_constant.user_not_exist
            error_msg = error_constant.errors.get(error_code)
        self.result(error_code, error_msg, result)


class LogoutHandler(BaseHandler):
    def __init__(self, *argc, **argkw):
        super(LogoutHandler, self).__init__(*argc, **argkw)
        self.user_manager = UserManager()

    def get(self):
        user = self.get_current_user()
        self.log.debug('logout = %s' % user['name'])
        self.operate_log('退出', constant.log_status_success, user['id'])
        self.clear_cookie('user')
        self.redirect('/login/to_login')
