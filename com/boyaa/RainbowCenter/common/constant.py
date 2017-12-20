#!/usr/bin/env python
# -*- coding:utf-8 -*- 
#Author: Lucyliu
import os

# domain = 'zidonghua.oa.com'
domain = "172.20.108.36"
port = 8080
page_size = 10
# 必须继承的基类
TARGET_BASE_CLASS = ['TestCase', 'testbase.testcase.TestCase']

# path
run_path = os.getcwd()
test_case = os.sep.join([run_path, 'testcase'])
log_path = os.sep.join([run_path, 'logs'])
cfg_file_path = os.sep.join([run_path, 'cfg', 'cfg.ini'])

report_path = os.sep.join([run_path, 'reports'])
tool_path = os.sep.join([run_path, 'tools'])
report_tool_path = os.sep.join([tool_path, 'report'])
case_jar_path = os.sep.join([tool_path, 'caseinfojar'])

upgrade_package_path = 'upgrade_package'

#appium_server status start
appium_status_waiting = 0#未占用
appium_status_running = 1#占用
#appium_server status end

#appium_server type start
appium_type_native = 1#原生
appium_type_lua = 2#lua
appium_type_hybrid = 3#hybrid
#appium_server type end

#device status start
device_status_waiting = 0#未占用
device_status_running = 1#占用
device_status_offline = 2#离线
#device status end

#plan status start
plan_status_waiting = 0#等待
plan_status_running = 1#执行
plan_status_idle = 2#空闲
#plan status end

#plan type start
plan_type_function = 1#功能测试
plan_type_upgrade = 2#升级测试
#plan type end

#plan env_type start
env_type_test = 1#测试环境
env_type_online = 2#线上环境
evn_type_prepublic = 3#预发布环境
#plan env_type end

#upgrade type start
upgrade_type_app = 0#应用升级
upgrade_type_hall = 1#大厅升级
upgrade_type_game = 2#游戏升级
#upgrade type end

#report_case status start
report_case_status_waiting = 0#等待
report_case_status_running = 1#执行
report_case_status_success = 2#成功
report_case_status_failed = 3#失败
#report_case status end

#execute_mode of execute plan start
plan_exec_mode_immi = 1#立即执行
plan_exec_mode_cron = 2#周期执行
plan_exec_mode_once = 3#定时执行
#execute_mode of execute plan end

#report status start
report_status_failed = 0#失败
report_status_success = 1#成功
report_status_running = 2#计划正在执行
report_status_stop = 3#计划被停止
#report status end

#os type start
os_android = 1
os_ios = 2
#os type end

#operate_log status start
log_status_failed = 0#失败
log_status_success = 1#成功
#operate_log status end

# type of email reviver start
reciver_type_to = 0
reciver_type_cc = 1
# type of email reviver end

#upload file type start
file_type_apk = 1#APK文件
file_type_upgrade_package = 2#升级包文件
#upload file type end