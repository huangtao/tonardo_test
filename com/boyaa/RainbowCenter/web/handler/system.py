#!/usr/bin/env python
# -*- coding:utf-8 -*-
import os
import traceback
import math
import tornado
from tornado.escape import json_decode
import com.boyaa.RainbowCenter.common.constant as constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper
from com.boyaa.RainbowCenter.common.exception import error_constant
from com.boyaa.RainbowCenter.common.exception.exception import RainbowCenterException
from com.boyaa.RainbowCenter.manager.product_manager import ProductManager
from com.boyaa.RainbowCenter.manager.project_manager import ProjectManager
from com.boyaa.RainbowCenter.manager.testcase_manager import TestCaseManager
from com.boyaa.RainbowCenter.web.handler.base import BaseHandler

class SystemHandler(BaseHandler):
    __product_manager = ProductManager()
    __project_manager = ProjectManager()
    __case_manager = TestCaseManager()
    __cfg_helper = InitHelper(constant.cfg_file_path)
    # __upgrade_package_manager = UpgradePackageManager()

    def __init__(self, *args, **kwargs):
        super(SystemHandler, self).__init__(*args, **kwargs)
        self.product_manager = self.__product_manager
        self.project_manager = self.__project_manager
        self.case_manager = self.__case_manager
        self.cfg_helper = self.__cfg_helper
        # self.upgrade_package_manager = self.__upgrade_package_manager

    def get(self, param):
        self.post(param)

    @tornado.web.authenticated
    def post(self, param):
        self.log.debug(param)
        switch = {
            'index': self.index,
            'save_db': self.save_db,
            'get_db_info': self.get_db_info,
            'get_share_folder_info': self.get_share_folder_info,
            'save_share_folder': self.save_share_folder,
            'save_svn': self.save_svn,
            'get_svn_info': self.get_svn_info,
            'check_product_name_exist': self.check_product_name_exist,
            'check_project_name_exist': self.check_project_name_exist,
            'create_product': self.create_product,
            'update_product': self.update_product,
            'get_products': self.get_products,
            'del_products': self.del_products,
            'to_create_project': self.to_create_project,
            'create_project': self.create_project,
            'update_project': self.update_project,
            'del_projects': self.del_projects,
            'get_projects': self.get_projects,
            'to_project_detail': self.to_project_detail,
            'init_project_detail': self.init_project_detail,
            'to_modify_project': self.to_modify_project,
            'to_product_detail': self.to_product_detail,
            'get_product_detail': self.get_product_detail,
            # 'upload_file': self.upload_file,
            'update_file': self.update_file,
            'del_file': self.del_file,
            'get_files': self.get_files,
            'update_ui_repository': self.update_ui_repository,
            'get_ui_repository': self.get_ui_repository,
            'get_svn_paths': self.get_svn_paths,
            'get_versions': self.get_versions
        }
        if param in switch:
            switch[param]()
        else:
            url = "system/%s.html" % param
            self.render(url)

    def index(self):
        url = 'system/index.html'
        result = {}
        result["db_info"] = self.__get_db_info()
        result['svn_info'] = self.__get_svn_info()
        result['share_folder'] = self.cfg_helper.get_value("share", "share_folder", "")
        result['product_list'] = self.__get_products()
        result['project_list'] = self.project_manager.get_projects()

        svn_base_url = self.cfg_helper.get_value('svn', 'svn_base_url', '')
        result['path_list'] = utils.get_path_list_from_svn(svn_base_url)
        self.render(url,result=result)

    def save_db(self):
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        host = json_obj["host"]
        port = utils.str_to_int(json_obj['port'])
        user = json_obj['user']
        password = json_obj['password']

        content = "update db"
        section = 'mysql'
        try:
            if host:
                self.cfg_helper.set_value(section, "db_host", host)
            if port:
                self.cfg_helper.set_value(section, "db_port", port)
            if user:
                self.cfg_helper.set_value(section, "db_user_name", user)
            if password:
                self.cfg_helper.set_value(section, "db_password", password)
            self.operate_log(content, constant.log_status_success)
        except Exception:
            self.operate_log(content, constant.log_status_failed)
        result = {}
        result['db_info'] = self.__get_db_info()
        self.result(0, "", result)


    def __get_db_info(self):
        db_info = {}
        section = 'mysql'
        db_info['host'] = self.cfg_helper.get_value(section, "db_host", "")
        db_info['port'] = self.cfg_helper.get_value(section, 'db_port', 3306)
        db_info['user'] = self.cfg_helper.get_value(section, 'db_name', '')
        db_info['password'] = self.cfg_helper.get_value(section, 'db_password', '')
        print(db_info)
        return db_info

    def __get_svn_info(self):
        svn_info = {}
        section = 'svn'
        svn_info['user_name'] = self.cfg_helper.get_value(section, "svn_user_name", "")
        svn_info['password'] = self.cfg_helper.get_value(section, "svn_password", "")
        print(svn_info)
        return svn_info

    def __get_products(self, condition=None):
        result = self.product_manager.get_products()
        product_list = []
        for key in result:
            base_info = result[key]['base_info']
            product = {}
            product['id'] = base_info['id']
            product['name'] = key
            product['creator'] = base_info['creator']
            product['create_date'] = str(base_info['create_date'])
            product['update_date'] = str(base_info['update_date'])
            product['desc'] = base_info['desc']
            if result[key]['has_project']:
                product['project_sum'] = len(result[key]['projects'])
            else:
                product['project_sum'] = 0

            product_list.append(product)
        return product_list

    def get_db_info(self):
        result = {}
        db_info = self.__get_db_info()
        self.log.debug(db_info)
        result['db_info'] = db_info
        self.result(0, "", result)

    def get_share_folder_info(self):
        result = {}
        share_folder_info = self.__get_share_folder_info()
        self.log.debug(share_folder_info)
        result['share_folder_info'] = share_folder_info
        self.result(0, "", result)

    def save_share_folder(self):
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        share_folder = json_obj["share_folder"]
        content = '修改共享目录'
        try:
            self.cfg_helper.set_value('share', "share_folder", share_folder)
            self.operate_log(content, constant.log_status_success)
        except Exception:
            self.operate_log(content, constant.log_status_failed)

        result = {}
        result['share_folder_info'] = self.__get_share_folder_info()
        self.log.debug('share_folder_info = ', result)
        self.result(0, "", result)

    def save_svn(self):
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        user_name = json_obj["user_name"]
        password = json_obj["password"]
        section = "svn"
        content = '修改svn'
        try:
            if user_name:
                self.cfg_helper.set_value(section, "svn_user_name", user_name)

            if password:
                self.cfg_helper.set_value(section, "svn_password", password)

            self.operate_log(content, constant.log_status_success)
        except Exception:
            self.operate_log(content, constant.log_status_failed)

        result = {}
        result['svn_info'] = self.__get_svn_info()
        self.result(0, "", result)

    def get_svn_info(self):
        result = {}
        svn_info = self.__get_svn_info()
        self.log.debug(svn_info)

        result['svn_info'] = svn_info
        self.result(0, "", result)

    def check_product_name_exist(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        product_name = json_obj["product_name"]

        exist = self.product_manager.check_product_name_exist(product_name)
        result['exist'] = exist

        self.result(error_code, error_msg, result)

    def check_project_name_exist(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        product_id = utils.str_to_int(json_obj["product_id"])
        project_name = json_obj["project_name"]

        exist = self.project_manager.check_project_name_exist(product_id, project_name)
        result['exist'] = exist

        self.result(error_code, error_msg, result)

    def create_product(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_desc = json_obj['product_desc']
        creator_id = self.get_current_user()['id']

        # svn_base_url = self.cfg_helper.get_value('svn', 'svn_base_url', '')
        # svn_url = svn_base_url + json_obj['svn_path']
        svn_url = json_obj['svn_path']
        product_name = json_obj['product_name']
        exist = self.product_manager.check_product_name_exist(product_name)
        content = '创建工作室：%s' % product_name
        if not exist:
            success = self.product_manager.add(
                {'product_name': product_name, 'product_desc': product_desc, 'creator_id': creator_id,
                 'svn_url': svn_url})
            if success:
                result['product_list'] = self.__get_products()
                self.operate_log(content, constant.log_status_success)
            else:
                error_code = error_constant.product_create_failed
                error_msg = error_constant.errors.get(error_code)
                self.operate_log(content, constant.log_status_failed)
        else:
            error_code = error_constant.product_exist
            error_msg = error_constant.errors.get(error_code)

        self.result(error_code, error_msg, result)

    def update_product(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        """
        json_obj
        {
            'product_id' : product_id,
            'product_desc' : product_desc,
            'svn_path' : svn_path
        }
        """
        product_id = utils.str_to_int(json_obj['product_id'])
        product_desc = json_obj['product_desc']

        svn_base_url = self.cfg_helper.get_value('svn', 'svn_base_url', '')
        svn_url = svn_base_url + json_obj['svn_path']

        product = self.product_manager.get_product({'product_id': product_id})
        if product:
            content = '更新工作室：%s' % product['name']
            success = self.product_manager.update(
                {'product_id': product_id, 'product_desc': product_desc, 'svn_url': svn_url})
            if not success:
                error_code = error_constant.product_create_failed
                error_msg = error_constant.errors.get(error_code)
                self.operate_log(content, constant.log_status_failed)
            else:
                self.operate_log(content, constant.log_status_success)
        else:
            error_code = error_constant.product_not_exist
            error_msg = error_constant.errors.get(error_code)

        result['product_list'] = self.__get_products()
        self.result(error_code, error_msg, result)

    def to_create_project(self):
        error_code, error_msg, result = 0, "", {}
        result['product_list'] = self.__get_products()
        result['data_org'] = self.__get_data_org()
        self.result(error_code, error_msg, result)

    def create_project(self):
        error_code, error_msg, result = 0, '', {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        """
        json_obj
        {
            'project_name' : project_name,
            'project_desc' : project_desc,
            'product_id' : product_id,
            'data_org' : data_org,
            'scan_case' : scan_case,
            'svn_url' : svn_url
        }
        """
        json_obj['creator_id'] = self.get_current_user()['id']
        project_name = json_obj['project_name']

        content = '创建项目：%s' % project_name
        product = self.product_manager.get_product({"product_id": utils.str_to_int(json_obj['product_id'])})
        if product:
            json_obj['product_name'] = product['name']
            self.log.debug(json_obj)
            print(product['id'])
            exist = self.project_manager.check_project_name_exist(product['id'], json_obj['project_name'])
            if exist:
                error_code = error_constant.project_exist
                error_msg = error_constant.errors.get(error_code)
            else:
                try:
                    self.project_manager.create_project(json_obj)
                    self.operate_log(content, constant.log_status_success)
                except RainbowCenterException as ex:
                    error_code = ex.code
                    error_msg = ex.message
                    self.operate_log(content, constant.log_status_failed)
                except Exception:
                    exstr = traceback.format_exc()
                    self.log.error(exstr)
                    error_code = error_constant.project_create_failed
                    error_msg = error_constant.errors.get(error_code)
                    self.operate_log(content, constant.log_status_failed)
        else:
            error_code = error_constant.product_not_exist
            error_msg = error_constant.errors.get(error_code)
            self.operate_log(content, constant.log_status_failed)

        result['project_list'] = self.project_manager.get_projects()
        self.result(error_code, error_msg, result)

    def update_project(self):
        error_code, error_msg, result = 0, '', {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        """
        json_obj
        {'project_id' : project_id, 'project_desc' : project_desc} -- 更新描述
        or
        {'project_id' : project_id, 'svn_url' : svn_url} -- 更新svn url
        """
        project_id = utils.str_to_int(json_obj['project_id'])
        project = self.project_manager.get_project(project_id)

        values = {}
        values['project_id'] = project_id
        if project:
            content = '更新项目【%s】的' % project['name']
            if 'project_desc' in json_obj:
                content += '描述'
                values['desc'] = json_obj['project_desc']
            elif 'svn_url' in json_obj:
                content += 'SVN URL'
                values['svn_url'] = json_obj['svn_url']
            try:
                self.project_manager.update(values)
                self.operate_log(content, constant.log_status_success)
            except RainbowCenterException as ex:
                error_code = ex.code
                error_msg = ex.message
                self.operate_log(content, constant.log_status_failed)
            except Exception:
                exstr = traceback.format_exc()
                self.log.error(exstr)
                error_code = error_constant.project_update_failed
                error_msg = error_constant.errors.get(error_code)
                self.operate_log(content, constant.log_status_failed)
        else:
            error_code = error_constant.project_not_exist
            error_msg = error_constant.errors.get(error_code)

        self.result(error_code, error_msg, result)

    def get_products(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        cur_page = utils.str_to_int(json_obj['cur_page'])
        condition = {
            'product_name': json_obj['product_name'],
            'creator': json_obj['creator'],
            'cur_page': cur_page
        }

        result['product_list'] = self.__get_products(condition)
        result['total_count'] = self.product_manager.count_product(condition)
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def get_projects(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        cur_page = utils.str_to_int(json_obj['cur_page'])
        condition = {
            'product_id': utils.str_to_int(json_obj['product_id']),
            'project_name': json_obj['project_name'],
            'creator': json_obj['creator']
        }

        result['project_list'] = self.project_manager.get_projects(condition)
        result['total_count'] = self.project_manager.count_project(condition)
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def del_products(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_ids = []
        for tmp_id in json_obj['product_ids']:
            product_id = utils.str_to_int(tmp_id)
            product_ids.append(product_id)
        content = '删除工作室：'
        del_products = self.product_manager.get_products_by_id(product_ids)
        for del_product in del_products:
            content += '%s, ' % del_product['name']
        content = content.strip()[:-1]

        success = self.product_manager.delete(product_ids)
        if success:
            self.operate_log(content, constant.log_status_success)
        else:
            error_code = error_constant.product_del_failed
            error_msg = error_constant.errors.get(error_code)
            self.operate_log(content, constant.log_status_failed)

        result['product_list'] = self.__get_products()
        self.result(error_code, error_msg, result)


    def del_projects(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_ids = []
        for tmp_id in json_obj['project_ids']:
            project_id = utils.str_to_int(tmp_id)
            project_ids.append(project_id)

        content = '删除项目：'
        del_projects = self.project_manager.get_projects_by_id(project_ids)
        for del_project in del_projects:
            content += '%s, ' % del_project['name']
        content = content.strip()[:-1]

        success = self.project_manager.delete(project_ids)
        if not success:
            error_code = error_constant.project_del_failed
            error_msg = error_constant.errors.get(error_code)
            self.operate_log(content, constant.log_status_failed)
        else:
            self.operate_log(content, constant.log_status_success)

        result['project_list'] = self.project_manager.get_projects()
        self.result(error_code, error_msg, result)

    def to_project_detail(self):
        result = {}
        url = "system/project_detail.html"
        project_id = utils.str_to_int(self.get_argument("project_id"))
        #
        result['project'] = self.project_manager.get_project(project_id)
        self.render(url, result=result)

    def init_project_detail(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        project_id = utils.str_to_int(json_obj['project_id'])
        project = self.project_manager.get_project(project_id)
        if project:
            ui_total_count = self.project_manager.count_ui_repository(project_id)
            result['ui_repository'] = {
                'list': self.project_manager.get_ui_repository({'project_id': project['id'], 'cur_page': 1}),
                'total_count': ui_total_count,
                'total_page': math.ceil(ui_total_count / constant.page_size)
            }

            # apk_list = self.apk_manager.get_apks({'project_id': project_id, 'cur_page': 1})
            # apk_total_count = self.apk_manager.count_apk({'project_id': project_id})
            # result['apks'] = {
            #     'list': apk_list,
            #     'total_count': apk_total_count,
            #     'total_page': math.ceil(apk_total_count / constant.page_size)
            # }
            #
            # package_list = self.upgrade_package_manager.get_packages({'project_id': project_id, 'cur_page': 1})
            # package_total_count = self.upgrade_package_manager.count_package({'project_id': project_id})
            # result['packages'] = {
            #     'list': package_list,
            #     'total_count': package_total_count,
            #     'total_page': math.ceil(package_total_count / constant.page_size)
            # }
        else:
            error_code = error_constant.project_not_exist
            error_msg = error_constant.errors.get(error_code)

        self.result(error_code, error_msg, result)

    def get_ui_repository(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        cur_page = utils.str_to_int(json_obj['cur_page'])

        result['ui_repository'] = self.project_manager.get_ui_repository(
            {'project_id': project_id, 'cur_page': cur_page})
        result['total_count'] = self.project_manager.count_ui_repository(project_id)
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def get_svn_paths(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_id = utils.str_to_int(json_obj['product_id'])

        product = self.product_manager.get_product({'product_id': product_id})
        product_name = product['name']
        if product_name == '地方棋牌':
            hall_svn_url = product['svn_url']
            hall_path_list = utils.get_path_list_from_svn(hall_svn_url)
            hall_path_list.remove('HallCommon')
            hall_path_list.remove('TestHallBase')
            local_chess_svn_url = self.cfg_helper.get_value('svn', 'svn_base_url', '') + 'LocalChess'
            local_chess_path_list = utils.get_path_list_from_svn(local_chess_svn_url)
            result['path_list'] = hall_path_list + local_chess_path_list
        else:
            svn_url = product['svn_url']
            result['path_list'] = utils.get_path_list_from_svn(svn_url)

        self.result(error_code, error_msg, result)

    def get_versions(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])

        self.project_manager.update_svn_version(project_id)
        result['project'] = self.project_manager.get_project(project_id)
        result['version_list'] = self.project_manager.get_versions({'project_id': project_id})
        self.result(error_code, error_msg, result)

    def get_files(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        file_type = utils.str_to_int(json_obj['file_type'])
        cur_page = utils.str_to_int(json_obj['cur_page'])

        if file_type == constant.file_type_apk:
            result['apk_list'] = self.apk_manager.get_apks({'project_id': project_id, 'cur_page': cur_page})
            result['total_count'] = self.apk_manager.count_apk({'project_id': project_id})
        elif file_type == constant.file_type_upgrade_package:
            result['package_list'] = self.upgrade_package_manager.get_packages(
                {'project_id': project_id, 'cur_page': cur_page})
            result['total_count'] = self.upgrade_package_manager.count_package({'project_id': project_id})
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def to_modify_project(self):
        result = {}
        url = "system/modify_project.html"
        project_id = utils.str_to_int(self.get_argument('project_id'))

        result['project'] = self.project_manager.get_project(project_id)
        self.render(url, result=result)

    def to_product_detail(self):
        result = {}
        url = "system/product_detail.html"
        product_id = utils.str_to_int(self.get_argument('product_id'))
        condition = {'product_id': product_id}
        result['product'] = self.product_manager.get_product(condition)
        result['project_list'] = self.project_manager.get_projects(condition)
        self.render(url, result=result)

    def get_product_detail(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_id = utils.str_to_int(json_obj['product_id'])
        condition = {'product_id': product_id}
        result['product'] = self.product_manager.get_product(condition)
        result['project_list'] = self.project_manager.get_projects(condition)
        self.result(error_code, error_msg, result)

    def update_file(self):
        error_code, error_msg, result = 0, "", {}
        project_id = utils.str_to_int(self.get_argument('project_id'))
        file_type = utils.str_to_int(self.get_argument('file_type'))
        project = self.project_manager.get_project(project_id)

        obj_id = utils.str_to_int(self.get_argument('obj_id'))

        obj = None
        if file_type == constant.file_type_apk:
            obj = self.apk_manager.get_apk(obj_id)
            content = '更新项目【%s】的apk' % project['name']
        elif file_type == constant.file_type_upgrade_package:
            obj = self.upgrade_package_manager.get_package(obj_id)
            content = '更新项目【%s】的升级包' % project['name']

        if project:
            if obj:
                try:
                    name = 'file'
                    files = self.request.files[name]
                    if files and len(files) > 0:
                        uploadFile = files[0]
                        file_name = obj['file_name']
                        if file_type == constant.file_type_apk:
                            dest_file_dir = project['path'] + os.sep + 'apk' + os.sep + str(obj['id'])
                        elif file_type == constant.file_type_upgrade_package:
                            dest_file_dir = project['path'] + os.sep + constant.upgrade_package_path + os.sep + str(
                                obj['id'])
                        os.makedirs(dest_file_dir, exist_ok=True)
                        dest_file_path = os.path.join(dest_file_dir, file_name)
                        fileObj = open(dest_file_path, 'wb')
                        fileObj.write(uploadFile['body'])
                        fileObj.close()
                        if file_type == constant.file_type_apk:
                            self.apk_manager.update(project, obj_id, dest_file_path)

                            from com.boyaa.RainbowCenter.common.apk_helper import \
                                APKHelper  # repack the apk to embed autotest support files
                            my_apk_helper = APKHelper(dest_file_path)
                            my_apk_helper.repack()
                        elif file_type == constant.file_type_upgrade_package:
                            values = {}
                            values['desc'] = self.upgrade_package_manager.parase_package(dest_file_path)
                            #                             values['md5'] = file_helper.get_md5(dest_file_path)
                            #                             values['size'] = file_helper.get_size(dest_file_path)
                            #                             self.upgrade_package_manager.update(obj_id, dest_file_path, values)
                            # 重新打包
                            # suffix = file_helper.get_suffix(dest_file_path)
                            # if suffix == 'apk':
                            #     from com.boyaa.RainbowCenter.common.apk_helper import \
                            #         APKHelper  # repack the apk to embed autotest support files
                            #     my_apk_helper = APKHelper(dest_file_path)
                            #     my_apk_helper.repack()
                            #     if not file_name.startswith('autotest_'):
                            #         dest_file_path = os.sep.join([dest_file_dir, 'autotest_' + file_name])
                            # values['md5'] = file_helper.get_md5(dest_file_path)
                            # values['size'] = file_helper.get_size(dest_file_path)
                            self.upgrade_package_manager.update(obj_id, dest_file_path, values)
                        self.operate_log(content, constant.log_status_success)
                except Exception:
                    error_code = error_constant.upload_failed
                    error_msg = error_constant.errors.get(error_code)
                    self.operate_log(content, constant.log_status_failed)
            else:
                error_code = error_constant.apk_not_exist
                error_msg = error_constant.errors.get(error_code)
        else:
            error_code = error_constant.project_not_exist
            error_msg = error_constant.errors.get(error_code)

        self.result(error_code, error_msg, result)

    def del_file(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        file_type = utils.str_to_int(json_obj['file_type'])
        project_id = utils.str_to_int(json_obj['project_id'])
        obj_id = utils.str_to_int(json_obj['obj_id'])

        if file_type == constant.file_type_apk:
            is_used = self.apk_manager.check_in_used(obj_id)
        elif file_type == constant.file_type_upgrade_package:
            is_used = self.upgrade_package_manager.check_in_used(obj_id)

        if not is_used:
            if file_type == constant.file_type_apk:  # 待删除apk未被plan选中
                success = self.apk_manager.delete(obj_id)

                apk_list = self.apk_manager.get_apks({'project_id': project_id, 'cur_page': 1})
                apk_total_count = self.apk_manager.count_apk({'project_id': project_id})
                result['apks'] = {
                    'list': apk_list,
                    'total_count': apk_total_count,
                    'total_page': math.ceil(apk_total_count / constant.page_size)
                }
            elif file_type == constant.file_type_upgrade_package:
                success = self.upgrade_package_manager.delete(obj_id)
                package_list = self.upgrade_package_manager.get_packages({'project_id': project_id, 'cur_page': 1})
                package_total_count = self.upgrade_package_manager.count_package({'project_id': project_id})
                result['packages'] = {
                    'list': package_list,
                    'total_count': package_total_count,
                    'total_page': math.ceil(package_total_count / constant.page_size)
                }
            if not success:
                error_code = error_constant.apk_del_failed
                error_msg = error_constant.errors.get(error_code)
        else:
            error_code = error_constant.apk_in_used
            error_msg = error_constant.errors.get(error_code)
        self.result(error_code, error_msg, result)

    def update_ui_repository(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])

        project = self.project_manager.get_project(project_id)
        content = '更新项目【%s】的UI库'
        if project:
            try:
                self.project_manager.scan_ui_repository(project)

                result['ui_repository'] = self.project_manager.get_ui_repository(
                    {'project_id': project_id, 'cur_page': 1})
                result['total_count'] = self.project_manager.count_ui_repository(project_id)
                result['cur_page'] = 1
                result['total_page'] = math.ceil(result['total_count'] / constant.page_size)

                self.operate_log(content, constant.log_status_success)
            except Exception:
                self.operate_log(content, constant.log_status_failed)
        else:
            error_code = error_constant.project_not_exist
            error_msg = error_constant.errors.get(error_code)
        self.result(error_code, error_msg, result)

    def __get_db_info(self):
        db_info = {}
        section = "mysql"

        db_info['host'] = self.cfg_helper.get_value(section, "db_host", "")
        db_info['port'] = self.cfg_helper.get_value(section, "db_port", 3306)
        db_info['user'] = self.cfg_helper.get_value(section, "db_user_name", "")

        password = self.cfg_helper.get_value(section, "db_password", "")
        db_info['password'] = password

        return db_info

    def __get_share_folder_info(self):
        share_folder_info = {}
        section = "share"

        share_folder_info['share_folder'] = self.cfg_helper.get_value(section, "share_folder", "")

        return share_folder_info

    def __get_svn_info(self):
        svn_info = {}
        section = "svn"

        svn_info['user_name'] = self.cfg_helper.get_value(section, "svn_user_name", "")

        password = self.cfg_helper.get_value(section, "svn_password", "")
        svn_info['password'] = password
        return svn_info

    def __get_products(self, condition=None):
        result = self.product_manager.get_products(condition)
        product_list = []
        for key in result:
            base_info = result[key]['base_info']
            product = {}
            product['id'] = base_info['id']
            product['name'] = key
            product['creator'] = base_info['creator']
            product['create_date'] = str(base_info['create_date'])
            product['update_date'] = str(base_info['update_date'])
            product['desc'] = base_info['desc']
            if result[key]['has_project']:
                product['project_sum'] = len(result[key]['projects'])
            else:
                product['project_sum'] = 0

            product_list.append(product)
        return product_list

    def __get_data_org(self):
        datas = []
        share_folder = self.cfg_helper.get_value('share', 'share_folder', '')
        for root, dirs, files in os.walk(share_folder):
            for tmp_dir in dirs:
                path = os.sep.join([root, tmp_dir]).replace(share_folder, '')[1:]
                if not self.__filter_dir(path):
                    datas.append(path)
        return datas

    def __filter_dir(self, path):
        is_filter = False
        filter_list = ['.svn', 'data', 'apk']
        for tmp in filter_list:
            if tmp in path.lower():
                is_filter = True
                break

        return is_filter




