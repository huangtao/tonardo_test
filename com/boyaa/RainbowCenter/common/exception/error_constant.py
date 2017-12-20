# -*- coding:utf-8 -*-
"""
Created on 2015.06.08

@author: SissiWu
"""

#product_error_code start
product_error_code = 10000
product_create_failed = str(product_error_code + 1)
product_del_failed = str(product_error_code + 2)
product_not_exist = str(product_error_code + 3)
product_exist = str(product_error_code + 4)
#product_error_code end

#project_error_code start
project_error_code = 20000
project_not_exist = str(project_error_code + 1)
project_create_failed = str(project_error_code + 2)
project_del_failed = str(project_error_code + 3)
project_scan_ui_repository_failed = str(project_error_code + 4)
project_ui_repository_not_exist = str(project_error_code + 5)
project_update_failed = str(project_error_code + 6)
project_exist = str(project_error_code + 7)
project_svn_url_invalid = str(project_error_code + 8)
#project_error_code end

#case_error_code start
case_error_code = 30000
case_del_failed = str(case_error_code + 1)
case_scan_failed = str(case_error_code + 2)
case_scan_not_continue = str(case_error_code + 3)
#case_error_code end

#plan_error_code start
plan_error_code = 40000
plan_create_failed = str(plan_error_code + 1)
plan_not_exist = str(plan_error_code + 2)
plan_is_waiting = str(plan_error_code + 3)
plan_is_running = str(plan_error_code + 4)
plan_modify_failed_01 = str(plan_error_code + 5)
plan_modify_failed_02 = str(plan_error_code + 6)
plan_save_failed_01 = str(plan_error_code + 7)
plan_save_failed_02 = str(plan_error_code + 8)
plan_save_failed_03 = str(plan_error_code + 9)
plan_save_failed_check_update = str(plan_error_code + 10)
#plan_error_code end

#upload_error_code start
upload_error_code = 50000
upload_failed = str(upload_error_code + 1)
#upload_error_code end

#user_error_code start
user_error_code = 60000
user_create_failed = str(user_error_code + 1)
user_del_failed = str(user_error_code + 2)
user_exist = str(user_error_code + 3)
user_modify_pwd_failed_01 = str(user_error_code + 4)
user_modify_pwd_failed_02 = str(user_error_code + 5)
user_not_exist = str(user_error_code + 6)
user_modify_failed = str(user_error_code + 7)
#user_error_code end

#device_error_code start
device_error_code = 70000
device_modify_failed = str(device_error_code + 1)
#device_error_code end

#apk_error_code start
apk_error_code = 80000
apk_del_failed = str(apk_error_code + 1)
apk_not_exist = str(apk_error_code + 2)
apk_in_used = str(apk_error_code + 3)
#apk_error_code end

#report_error_code start
report_error_code = 90000
report_not_exist = str(report_error_code + 1)
#report_error_code end

errors = {
    #product_error_code
    product_create_failed : '创建工作室失败',
    product_del_failed : '删除工作室失败',
    product_not_exist : '工作室不存在',
    product_exist : '工作室名称已存在',
    
    #project_error_code
    project_not_exist : '项目不存在',
    project_create_failed : '创建项目失败',
    project_del_failed : '删除项目失败',
    project_scan_ui_repository_failed : '扫描UI存储库失败',
    project_ui_repository_not_exist : '项目已创建，但扫描UI存储库失败。\r原因：%s文件不存在。 ',
    project_update_failed : '更新项目失败',
    project_exist : '项目名称已存在',
    project_svn_url_invalid : 'SVN URL无效',
    
    #case_error_code
    case_del_failed : '删除测试用例失败',
    case_scan_failed : '扫描测试用例失败',
    case_scan_not_continue : '不能重新扫描测试用例。\r原因：项目所属计划正在执行或等待执行。',
    
    #plan_error_code
    plan_create_failed : '创建计划失败',
    plan_not_exist : '计划不存在',
    plan_is_waiting : '计划处于等待状态',
    plan_is_running : '计划正在执行',
    plan_modify_failed_01 : '修改计划失败',
    plan_modify_failed_02 : '计划处于等待或运行状态，不允许修改。\r当计划处于空闲状态方可修改。',
    plan_save_failed_01 : '待升级包中不包含任何子游戏',
    plan_save_failed_02 : '升级包中不包含任何游戏',
    plan_save_failed_03 : '升级包中包含的子游戏在待升级包中不存在',
    
    #upload_error_code
    upload_failed : '上传文件失败',
    
    #user_error_code
    user_create_failed : '创建用户失败',
    user_del_failed : '删除用户失败',
    user_exist : '用户名已存在',
    user_modify_pwd_failed_01 : '旧密码错误',
    user_modify_pwd_failed_02 : '修改密码失败',
    user_not_exist : '用户不存在',
    user_modify_failed : '修改用户信息失败',
    
    #device_error_code
    device_modify_failed : '修改设备失败',
    
    #apk_error_code
    apk_del_failed : '删除APK失败',
    apk_not_exist : 'APK不存在',
    apk_in_used : 'APK已被测试计划使用',
    
    #report_error_code
    report_not_exist : '测试报告不存在'
}