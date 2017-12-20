#!/usr/bin/env python
# -*- coding:utf-8 -*-
import math
import traceback
import tornado
from tornado.escape import json_decode
from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.common.exception import error_constant
from com.boyaa.RainbowCenter.common.exception.exception import RainbowCenterException
from com.boyaa.RainbowCenter.manager.plan_manager import PlanManager
from com.boyaa.RainbowCenter.manager.product_manager import ProductManager
from com.boyaa.RainbowCenter.manager.project_manager import ProjectManager
from com.boyaa.RainbowCenter.manager.testcase_manager import TestCaseManager
from com.boyaa.RainbowCenter.web.handler.base import BaseHandler

class CaseHandler(BaseHandler):
    __case_manager = TestCaseManager()
    __plan_manager = PlanManager()
    __product_manager = ProductManager()
    __project_manager = ProjectManager()

    def __init__(self, *argc, **argkw):
        super(CaseHandler, self).__init__(*argc, **argkw)
        self.case_manager = self.__case_manager
        self.plan_manager = self.__plan_manager
        self.product_manager = self.__product_manager
        self.project_manager = self.__project_manager

    def get(self, param):
        self.post(param)
    @tornado.web.authenticated
    def post(self, param):
        self.log.debug('param = %s' % param)
        switch = {
            'init_index' : self.init_index,
            "scan_cases": self.scan_cases,
            # 'del_cases': self.del_cases,
            "check_case_exist": self.check_case_exist,
            "get_projects_by_product_id": self.get_projects_by_product_id,
            "get_suites_by_project_id": self.get_suites_by_project_id,
            'to_suite_detail': self.to_suite_detail,
            'get_suites': self.get_suites,
            'get_cases': self.get_cases,
            'get_versions': self.get_versions
        }
        if param in switch:
            switch[param]()
        else:
            url = 'case/%s.html' % param
            self.render(url)

    def init_index(self):
        result = {}
        result['product_list'] = self.__get_products()

        result['suite_list'] = self.__get_suites({'cur_page':1,"product_name":'地方棋牌'})
        result['total_count'] = self.case_manager.count_suite({'product_name' : '地方棋牌'})

        product = self.product_manager.get_product({'product_name' : '地方棋牌'})
        result['project_list'] = self.project_manager.get_projects({'product_id' : product['id']})

        result['cur_page'] = 1
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(0, "", result)

    def __get_products(self):
        result = self.product_manager.get_products()
        product_list = []
        for key in result:
            product = {}
            product['id'] = result[key]['base_info']['id']
            product['name'] = key
            product_list.append(product)
        return product_list

    def __get_suites(self, condition=None):
        suite_list = self.case_manager.get_suites(condition)
        for suite in suite_list:
            suite['count'] = self.case_manager.count_case({'suite_id' : suite['id']})
        return suite_list

    def scan_cases(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        version_id = utils.str_to_int(json_obj['version_id'])

        project = self.project_manager.get_project(project_id)
        try:
            self.case_manager.scan_cases(project)
        except:
            exstr = traceback.format_exc()
            self.log.debug(exstr)
        content = '扫描常规项目的测试用例'
        if project:
            try:
                if error_code == 0:
                    if version_id:
                        self.case_manager.scan_cases_by_version_id(version_id, project)
                    else:
                        self.case_manager.scan_cases(project)
                    self.operate_log(content, constant.log_status_success)
            except RainbowCenterException as ex:
                self.operate_log(content, constant.log_status_failed)
                error_code = ex.code
                error_msg = ex.message
            except Exception:
                exstr = traceback.format_exc()
                self.log.error(exstr)
                self.operate_log(content, constant.log_status_failed)
                error_code = error_constant.case_scan_failed
                error_msg = error_constant.errors.get(error_code)
        else:
            self.operate_log(content, constant.log_status_failed)
            error_code = error_constant.project_not_exist
            error_msg = error_constant.errors[error_code]

        result['suite_list'] = self.__get_suites({'cur_page': 1})
        result['total_count'] = self.case_manager.count_suite()
        result['cur_page'] = 1
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def get_suites(self):
        error_code, error_msg, result = 0, '', {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        cur_page = utils.str_to_int(json_obj['cur_page'])
        condition = {
            'product_id': utils.str_to_int(json_obj['product_id']),
            'project_id': utils.str_to_int(json_obj['project_id']),
            'suite_id': utils.str_to_int(json_obj['suite_id']),
            'cur_page': cur_page
        }
        result['suite_list'] = self.__get_suites(condition)
        result['total_count'] = self.case_manager.count_suite(condition)
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def to_suite_detail(self):
        result = {}
        url = 'case/suite_detail.html'
        suite_id = utils.str_to_int(self.get_argument("suite_id"))

        result['suite'] = self.case_manager.get_suite(suite_id)
        self.render(url, result= result)

    def get_cases(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        suite_id = utils.str_to_int(json_obj['suite_id'])
        cur_page = utils.str_to_int(json_obj['cur_page'])
        condition = {
            'suite_ids' : [suite_id],
            'cur_page' : cur_page
        }
        case_list = self.case_manager.get_cases(condition)
        result['case_list'] = case_list
        result['total_count'] = self.case_manager.count_case({'suite_id' : suite_id})
        result['cur_page'] = cur_page
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)
        self.result(error_code, error_msg, result)

    def get_suites_by_project_id(self):
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        condition = {
            'project_id':project_id
        }
        suites = self.case_manager.get_suites(condition)
        self.result(0,"",suites)

    def get_projects_by_product_id(self):
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_id = utils.str_to_int(json_obj['product_id'])
        condition = {
            "product_id" : product_id
        }
        projects = self.project_manager.get_projects(condition)
        self.result(0,'',projects)

    def get_versions(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj["project_id"])
        result["version_list"] = self.project_manager.get_versions({"project_id" : project_id})
        self.result(error_code, error_msg, result)

    def check_case_exist(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        version_id = utils.str_to_int(json_obj['version_id'])
        case_exist = self.case_manager.check_case_exist(project_id,version_id)
        result['case_exist'] = case_exist
        self.result(error_code, error_msg, result)

    def del_cases(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        project_id = utils.str_to_int(json_obj['project_id'])
        version_id = utils.str_to_int(json_obj['version_id'])

        success = self.case_manager.del_cases(version_id)
        result['suite_list'] = self.__get_suites({'cur_page': 1})
        result['total_count'] = self.case_manager.count_suite()
        result['cur_page'] = 1
        result['total_page'] = math.ceil(result['total_count'] / constant.page_size)

        project = self.project_manager.get_project(project_id)
        content = '删除项目【%s】的测试用例' % project['name']
        if not success:
            error_code = error_constant.case_del_failed
            error_msg = error_constant.errors[error_code]
            self.operate_log(content, constant.log_status_failed)
        else:
            self.operate_log(content, constant.log_status_success)

        self.result(error_code, error_msg, result)

