#!/usr/bin/env python
# -*- coding:utf-8 -*-
import traceback

import math
from tornado.escape import json_decode

from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.manager.base import BaseManager


class PlanManager(BaseManager):
    # __report_manager = ReportManager()

    def __init__(self):
        BaseManager.__init__(self)

    def get_plan(self, condition=None):
        plan = None
        try:
            sql = """
                select p.id plan_id, p.name plan_name, appium.port appium_port, p.appium_type, p.`status`, p.`desc`, p.execute_mode,
                       p.project_id, pj.name project_name, d.name device_name, p.device_id, pd.name product_name, u.name creator,
                       u.email, p.create_date, p.update_date, p.run_times, u.email, p.cron, a.file_name apk_name, p.version_id,
                       p.apk_id, a.version, p.env_type, psv.svn_path, p.version_id, p.`type` plan_type, p.upgrade_package_id,
                       up.file_name package_name, up.`md5` package_md5, up.`size` package_size, up.`desc` package_desc,
                       pj.path project_path, a.`desc` apk_desc, up.`version` package_version, a.app_id apk_app_id, a.channel_id apk_channel_id,
                       up.app_id package_app_id, up.channel_id package_channel_id
                  from plan p
                 left join device d on d.id = p.device_id
                 left join appium_server appium on appium.id = p.appium_id
                 left join project pj on pj.id = p.project_id
                 left join product pd on pd.id = pj.product_id
                 left join user u on u.id = p.creator_id
                 left join apk a on a.id = p.apk_id
                 left join upgrade_package up on up.id = p.upgrade_package_id
                 left join project_svn_version psv on psv.id = p.version_id
                where 1 = 1
            """
            params = []
            tmp_condition = {
                'p.name': (condition and 'plan_name' in condition) and condition['plan_name'] or None,
                'p.id': (condition and 'plan_id' in condition) and condition['plan_id'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, tmp_condition, 'and')
            plans = self.db.query(sql, params)
            if plans:
                plan = plans[0]
                plan['create_date'] = str(plan['create_date'])
                plan['update_date'] = str(plan['update_date'])
                case_list = self.get_rel_cases(plan['plan_id'])
                plan['case_count'] = len(case_list)
                svn_path = plan['svn_path']
                plan['svn_version'] = svn_path
                if svn_path.find('branches') != -1:
                    plan['svn_version'] = svn_path.replace('branches/', '')

                package_desc = plan['package_desc']
                plan['package_version_info'] = plan['package_desc']
                version = plan['package_version']
                version_info = ''
                if version:
                    version_info += '版本为' + version + ','
                if package_desc:
                    desc_dic = eval(package_desc)
                    for key in desc_dic:
                        if key == 'hall':
                            version_info += '大厅版本为' + desc_dic[key] + ','
                        elif key == 'game':
                            game_dic = desc_dic[key]
                            for game_name in game_dic:
                                version_info += game_name + '版本为' + game_dic[game_name] + ','
                        else:
                            version_info += key + '版本为' + desc_dic[key] + ','
                if plan['package_app_id']:
                    version_info += 'APP ID为' + plan['apk_app_id'] + ','
                if plan['package_channel_id']:
                    version_info += '渠道ID为' + plan['apk_channel_id']
                plan['package_desc'] = version_info

                apk_desc = plan['apk_desc']
                plan['apk_version_info'] = plan['apk_desc']
                version_info = 'APK版本为' + plan['version'] + ','
                if apk_desc:
                    desc_dic = eval(apk_desc)
                    for key in desc_dic:
                        if key == 'hall':
                            version_info += '大厅版本为' + desc_dic[key] + ','
                        elif key == 'game':
                            game_dic = desc_dic[key]
                            for game_name in game_dic:
                                version_info += game_name + '版本为' + game_dic[game_name] + ','
                        else:
                            version_info += key + '版本为' + desc_dic[key] + ','
                if plan['apk_app_id']:
                    version_info += 'APP ID为' + plan['apk_app_id'] + ','
                if plan['apk_channel_id']:
                    version_info += '渠道ID为' + plan['apk_channel_id']
                plan['apk_desc'] = version_info
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return plan

    def get_rel_cases(self, plan_id):
        case_list = []
        try:
            sql = """
                select ts.`name` suite_name, tc.`name` case_name, tc.logic_id, tc.parameter, tc.`desc`, tc.method, tc.id case_id
                  from plan_case_rel pcr
                  left join test_case tc on tc.id = pcr.case_id
                  left join test_suite ts on ts.id = tc.test_suite_id
                 where pcr.plan_id = %s
            """
            result = self.db.query(sql, [plan_id])
            for case in result:
                case_list.append(case)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return case_list

    def get_plans(self, condition=None):
        plan_list = []
        try:
            sql = """
                select p.id plan_id, p.name plan_name, p.status, p.desc, pj.name project_name, d.name device_name, pd.name product_name,
                       u.name creator, p.create_date, p.update_date, p.execute_mode, p.cron, p.run_times, p.appium_port, p.appium_type,
                       p.project_id, a.file_name apk_name, p.apk_id, p.version_id, p.env_type, psv.svn_path, p.version_id, p.`type`  plan_type,
                       p.upgrade_package_id, up.file_name package_name, up.`md5` package_md5, up.`size` package_size, pj.path project_path
                  from plan p
                  left join device d on d.id = p.device_id
                  left join appium_server appium on appium.id = p.appium_id
                  left join project pj on pj.id = p.project_id
                  left join product pd on pd.id = pj.product_id
                  left join user u on u.id = p.creator_id
                  left join apk a on a.id = p.apk_id
                  left join upgrade_package up on up.id = p.upgrade_package_id
                  left join project_svn_version psv on psv.id = p.version_id
                 where 1 = 1
            """
            params = []
            dics = {
                'pd.id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pj.id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'p.version_id': (condition and 'version_id' in condition) and condition['version_id'] or None,
                'p.status': (condition and 'status' in condition) and condition['status'] or None,
                'p.appium_type': (condition and 'appium_type' in condition) and condition['appium_type'] or None,
                'p.creator_id': (condition and 'creator_id' in condition) and condition['creator_id'] or None
            }

            sql, params = self.db.assemble_sql(sql, params, dics, 'and', 'p.create_date', 'desc')
            result = self.db.query(sql, params)
            for plan in result:
                case_list = self.get_rel_cases(plan['plan_id'])
                plan['case_count'] = len(case_list)
                plan['create_date'] = str(plan['create_date'])
                plan['update_date'] = str(plan['update_date'])
                progress = self.__get_plan_progress(plan)
                plan['progress'] = progress
                svn_path = plan['svn_path']
                plan['svn_version'] = svn_path
                if svn_path.find('branches') != -1:
                    plan['svn_version'] = svn_path.replace('branches/', '')

                plan_list.append(plan)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return plan_list

    def __get_plan_progress(self, plan):
        progress = {}
        case_total_count = 0
        case_waiting_count = 0
        case_running_count = 0
        case_failed_count = 0
        case_success_count = 0
        plan['report_id'] = 0
        if plan['status'] == constant.plan_status_running:
            condition = {'plan_id': plan['plan_id'], 'status': constant.report_status_running}
            report = self.report_manager.get_report(condition)
            if report:
                plan['report_id'] = report['id']
                cases = self.report_manager.get_cases4report({'report_id': report['id']})
                case_total_count = len(cases)

                for case in cases:
                    if case['status'] == constant.report_case_status_waiting:
                        case_waiting_count += 1
                    elif case['status'] == constant.report_case_status_running:
                        case_running_count += 1
                    elif case['status'] == constant.report_case_status_failed:
                        case_failed_count += 1
                    elif case['status'] == constant.report_case_status_success:
                        case_success_count += 1
        else:
            case_total_count = plan['case_count']
        progress['total'] = case_total_count
        progress['waiting'] = case_waiting_count
        progress['running'] = case_running_count
        progress['failed'] = case_failed_count
        progress['success'] = case_success_count
        return progress