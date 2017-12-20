# -*- coding:utf-8 -*-
'''
Created on 2015.12.17

@author: SissiWu
'''
import math

from tornado.escape import json_decode

import com.boyaa.RainbowCenter.common.constant as constant
import com.boyaa.RainbowCenter.common.utils as utils

from com.boyaa.RainbowCenter.web.handler.base import BaseHandler
from com.boyaa.RainbowCenter.manager.log_manager import LogManager

class LogHandler(BaseHandler):

    def __init__(self, *argc, **argkw):
        super(LogHandler, self).__init__(*argc, **argkw)
        self.log_manager = LogManager()
    
    def get(self, param):
        self.post(param)
    
    def post(self, param):
        self.log.debug('param = %s' % param)
        switch = {
            'init_index' : self.init_index,
            'get_logs' : self.get_logs,
            'del_logs' : self.del_logs
        }
        if param in switch:
            switch[param]()
        else:
            url = 'log/%s.html' % param
            self.render(url)
    
    def init_index(self):
        error_code, error_msg, result = 0, "", {}
        result['log_list'] = self.log_manager.get_logs({'cur_page' : 1})
        result['total_count'] = self.log_manager.count_log()
        result['cur_page'] = 1
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)
        
    def get_logs(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        cur_page = utils.str_to_int(json_obj['cur_page'])
        condition = {
            'user_name' : json_obj['user_name'],
            'operate_status' : utils.str_to_int(json_obj['operate_status']),
            'cur_page' : cur_page
        }
        result['log_list'] = self.log_manager.get_logs(condition)
        result['total_count'] = self.log_manager.count_log(condition)
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)
    
    def del_logs(self):
        error_code, error_msg, result = 0, "", {}
        success = self.log_manager.delete()
        content = '清空日志'
        if success:
            self.operate_log(content, constant.log_status_success)
        else:
            self.operate_log(content, constant.log_status_failed)
        self.result(error_code, error_msg, result)