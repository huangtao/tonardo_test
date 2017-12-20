# -*- coding:utf-8 -*-
import os
import time
import traceback

from tornado.escape import json_decode, json_encode

import com.boyaa.RainbowCenter.common.constant as constant
import com.boyaa.RainbowCenter.common.exception.error_constant as error_constant
# import com.boyaa.RainbowCenter.common.utils as utils

from com.boyaa.RainbowCenter.common.log_helper import Logger
# from com.boyaa.RainbowCenter.manager.apk_manager import APKManager
from com.boyaa.RainbowCenter.manager.log_manager import LogManager
# from com.boyaa.RainbowCenter.manager.product_manager import ProductManager
# from com.boyaa.RainbowCenter.manager.upgrade_package_manager import UpgradePackageManager
from com.boyaa.RainbowCenter.manager.product_manager import ProductManager
from com.boyaa.RainbowCenter.web.session.session_handler import SessionBaseHandler

expires = 21600  # for test:0.25day=60*60*6


class BaseHandler(SessionBaseHandler):
    def __init__(self, *argc, **argkw):
        super(BaseHandler, self).__init__(*argc, **argkw)

        logger = Logger()
        self.log = logger.get_logger()
        # self.apk_manager = APKManager()
        # self.upgrade_package_manager = UpgradePackageManager()
        self.product_manager = ProductManager()
        self.log_manager = LogManager()

    def set_current_user(self, user):
        self.set_secure_cookie('user', json_encode(user), expires=time.time() + expires)

    def get_current_user(self):
        user = self.get_secure_cookie('user')
        json = None
        if user:
            self.set_secure_cookie('user', user, expires=time.time() + expires)
            json = json_decode(user)
        return json

    cur_user = property(get_current_user)

    # def get_products(self):
    #     result = self.product_manager.get_products()
    #     product_list = []
    #     for key in result:
    #         product = {}
    #         product['id'] = result[key]['base_info']['id']
    #         product['name'] = key
    #         product_list.append(product)
    #     return product_list

    # def upload_file(self):
    #     error_code, error_msg, result = 0, "", {}
    #
    #     # file_type = utils.str_to_int(self.get_argument('file_type'))
    #     # project_id = utils.str_to_int(self.get_argument('project_id'))
    #     project = self.project_manager.get_project(project_id)
    #     if file_type == constant.file_type_apk:
    #         content = '上传项目【%s】的apk' % project['name']
    #     elif file_type == constant.file_type_upgrade_package:
    #         content = '上传项目【%s】的升级包' % project['name']
    #     if project:
    #         try:
    #             name = 'file'
    #             files = self.request.files[name]
    #             if files and len(files) > 0:
    #                 uploadFile = files[0]
    #                 file_name = uploadFile['filename']
    #                 if file_type == constant.file_type_apk:
    #                     dest_dir = project['path'] + os.sep + 'apk' + os.sep + 'tmp'
    #                 elif file_type == constant.file_type_upgrade_package:
    #                     dest_dir = project['path'] + os.sep + constant.upgrade_package_path + os.sep + 'tmp'
    #
    #                 dest_dir = dest_dir.replace('/', '\\')
    #                 os.makedirs(dest_dir, exist_ok=True)
    #                 dest_dir = os.path.join(dest_dir, file_name)
    #                 fileObj = open(dest_dir, 'wb')
    #                 fileObj.write(uploadFile['body'])
    #                 fileObj.close()
    #                 if file_type == constant.file_type_apk:
    #                     self.apk_manager.add(project, dest_dir)
    #                 elif file_type == constant.file_type_upgrade_package:
    #                     self.upgrade_package_manager.add(project, dest_dir)
    #                 os.remove(dest_dir)
    #
    #                 self.operate_log(content, constant.log_status_success)
    #         except Exception:
    #             exstr = traceback.format_exc()
    #             print(exstr)
    #             error_code = error_constant.upload_failed
    #             error_msg = error_constant.errors.get(error_code)
    #             self.operate_log(content, constant.log_status_failed)
    #     else:
    #         error_code = error_constant.project_not_exist
    #         error_msg = error_constant.errors.get(error_code)
    #
    #     self.result(error_code, error_msg, result)

    def operate_log(self, content, status, user_id=None):
        if not user_id:
            cur_user_id = self.get_current_user()['id']
        else:
            cur_user_id = user_id
        self.log_manager.add(cur_user_id, content, status)

    def result(self, code, msg, result):
        ret = self.__format(code, msg, result)
        self.set_header("Content-Type", "application/json; charset=UTF-8")
        self.write(ret)

    def write_error(self, status_code, **kwargs):
        self.log.error('status_code = %d' % status_code)
        if status_code == 404:
            self.render('404.html')
        elif status_code == 500:
            self.render('500.html')
        else:
            super(BaseHandler, self).write_error(status_code, **kwargs)

    def __format(self, error_code=0, error_msg=None, result=None):
        ret = {"errorCode": error_code, "errorMessage": error_msg, "result": result}
        return json_encode(ret)
