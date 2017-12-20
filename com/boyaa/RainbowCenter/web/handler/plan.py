#!/usr/bin/env python
# -*- coding:utf-8 -*-
from tornado.escape import json_decode

from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.manager.apk_manager import APKManager
from com.boyaa.RainbowCenter.manager.plan_manager import PlanManager
from com.boyaa.RainbowCenter.manager.project_manager import ProjectManager
from com.boyaa.RainbowCenter.web.handler.base import BaseHandler


class PlanHandler(BaseHandler):
    __plan_manager = PlanManager()
    __project_manager = ProjectManager()
    __apk_manager = APKManager()


    def __init__(self, *args, **kwargs):
        super(PlanHandler,self).__init__(*args, **kwargs)
        self.plan_manager = self.__plan_manager
        self.project_manager = self.__project_manager
        self.apk_manager = self.__apk_manager


    def get(self, param):
        self.post(param)

    def post(self, param):
        if param not in ['get_plans',"report_detail"]:
            self.log.debug('param = %s' % param)
        switch = {
            'index' : self.index,
            'init_create_plan' : self.init_create_plan,
            'to_create_function_plan' : self.to_create_function_plan,
            'check_plan_exist' : self.check_plan_exist,
            'get_projects_by_product_id' : self.get_projects_by_product_id,
            'get_related_datas_of_project' : self.get_related_datas_of_project,


        }

        if param in switch:
            switch[param]()
        else:
            url = 'plan/%s.html' % param
            self.render(url)

    def index(self):
        url = "plan/index.html"
        result = {}

        result['plan_list'] = self.plan_manager.get_plans()
        result['product_list'] = self.__get_products()
        self.render(url, result=result)

    def __get_products(self, condition=None):
        result = self.product_manager.get_products(condition)
        product_list = []
        for key in result:
            product = {}
            product['id'] = result[key]['base_info']['id']
            product['name'] = key
            product_list.append(product)
        return product_list

    def init_create_plan(self):
        error_code, error_msg, result = 0, '', {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        plan_type = utils.str_to_int(json_obj['plan_type'])
        product_list = []
        if plan_type == constant.plan_type_function:
            product_list = self.__get_products()
        elif plan_type == constant.plan_type_upgrade:
            product_list = self.__get_products({"product_name" : "地方棋牌"})
            condition = {"product_id" : product_list[0]['id']}
            result['project_list'] = self.project_manager.get_projects(condition)
        result['product_list'] = product_list
        self.result(error_code, error_msg, result)

    def to_create_function_plan(self):
        result = {}
        url = "plan/create_function_plan.html"
        self.render(url, result=result)

    def check_plan_exist(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        plan_name = json_obj['plan_name']
        condition = {"plan_name" : plan_name}
        plan =  self.plan_manager.get_plan(condition)

        exist = False
        if plan:
            exist = True
        result['exist'] = exist
        self.result(error_code, error_msg, result)

    def get_projects_by_product_id(self):
        result = {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)
        product_id = utils.str_to_int(json_obj['product_id'])
        condition = {'product_id' : product_id}
        result['project_list'] = self.project_manager.get_projects(condition)
        self.result(0, "", result)

    def get_related_datas_of_project(self):
        error_code, error_msg, result = 0, "", {}
        json_obj = json_decode(self.request.body)
        self.log.debug(json_obj)

        project_id = json_obj["project_id"]
        result["apklist"] = self.apk_manager.get_apks()

        result['package_list'] = self.upgrade_package_manager.get_packages({'project_id': project_id})
        result['version_list'] = self.project_manager.get_versions({'project_id': project_id})

        self.result(error_code, error_msg, result)

