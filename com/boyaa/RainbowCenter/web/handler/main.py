# -*- coding:utf-8 -*-
"""
Created on 2015.05.22

@author: SissiWu
"""
import tornado

from com.boyaa.RainbowCenter.manager.testcase_manager import TestCaseManager
from com.boyaa.RainbowCenter.web.handler.base import BaseHandler
# from com.boyaa.RainbowCenter.manager.plan_manager import PlanManager

colors = [
    {'color' : "#F7464A", 'highlight' : "#FF5A5E"},
    {'color' : "#46BFBD", 'highlight' : "#5AD3D1"},
    {'color' : "#FDB45C", 'highlight' : "#FFC870"},
    {'color' : "#949FB1", 'highlight' : "#A8B3C5"},
    {'color' : "#4D5360", 'highlight' : "#616774"}
]
color_len = len(colors)

class MainHandler(BaseHandler):

    __case_manager = TestCaseManager()
    # __plan_manager = PlanManager()
    
    def __init__(self, *argc, **argkw):
        super(MainHandler, self).__init__(*argc, **argkw)
        self.case_manager = self.__case_manager
        # self.plan_manager = self.__plan_manager

    def get(self, param=None):
        if not param:
            param = 'index'
        self.post(param)
    
    @tornado.web.authenticated
    def post(self, param):
        self.log.debug('param = %s' % param)
        switch = {
            'init_index' : self.init_index
        }
        if param in switch:
            switch[param]()
        else:
            url = '%s.html' % param
            self.render(url)

    def init_index(self):
        result = {}
        result['case_summary'] = self.__case_summary()
        result['case_coverage'] = self.__case_coverage_rate()
        
        self.result(0, "", result)

    def __case_summary(self):
        chart_data = []
        case_list = self.case_manager.get_case_sum_by_condition()
        case_sum = {}
        for case_item in case_list:
            project_id = case_item['project_id']
            case = None
            key = str(project_id)
            if key in case_sum:
                case = case_sum[key]
                case['count'] = case['count'] + 1
            else:
                case = {}
                case['project_name'] = case_item['project_name']
                case['count'] = 1
            
            case_sum[key] = case
        
        i = 1
        for project_id in case_sum:
            data = {}
            data['value'] = case_sum[project_id]['count']
            data['label'] = case_sum[project_id]['project_name']
            data['color'] = colors[i%color_len]['color']
            data['highlight'] = colors[i%color_len]['highlight']
            i += 1
            chart_data.append(data)
        return chart_data
    
    def __case_coverage_rate(self):
        chart_data = []
        case_count = self.case_manager.get_case_count()
        # rel_case_count = self.plan_manager.get_rel_case_count()
        rel_case_count = 0 #临时
        covered_data = {
            'value' : rel_case_count,
            'label' : '已覆盖',
            'color' : colors[0]['color'],
            'highlight' : colors[0]['highlight']
        }
        chart_data.append(covered_data)
        
        not_covered_data = {
            'value' : case_count - rel_case_count,
            'label' : '未覆盖',
            'color' : colors[1]['color'],
            'highlight' : colors[1]['highlight']
        }
        chart_data.append(not_covered_data)
        
        return chart_data