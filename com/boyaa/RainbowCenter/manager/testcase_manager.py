#!/usr/bin/env python
# -*- coding:utf-8 -*-
import ast
import glob
import hashlib
import os
import re
import shutil
import traceback

import time

import com.boyaa.RainbowCenter.common.constant as constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper
from com.boyaa.RainbowCenter.common.exception import error_constant
from com.boyaa.RainbowCenter.common.exception.exception import RainbowCenterException
from com.boyaa.RainbowCenter.manager.base import BaseManager


class TestCaseManager(BaseManager):
    __cfg_helper = InitHelper(constant.cfg_file_path)

    def __init__(self):
        BaseManager.__init__(self)
        self.cfg_helper = self.__cfg_helper

    def get_case_sum_by_condition(self, condition=None):
        cases = None
        try:
            sql = """
                select pd.id product_id, pd.name product_name, pj.id project_id, pj.name project_name, ts.id suite_id, ts.name suite_name, tc.*
                  from test_case tc
                  left join test_suite ts on tc.test_suite_id = ts.id
                  left join project pj on ts.project_id = pj.id
                  left join product pd on pj.product_id = pd.id
                 where 1 = 1
            """
            params = []
            dics = {
                'pd.id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pj.id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'ts.id': (condition and 'suite_id' in condition) and condition['suite_id'] or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            cases = self.db.query(sql,params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return cases

    def get_case_count(self):
        #测试用例数量
        count = 0
        try:
            sql = 'select distinct id from test_case'
            count = self.db.row_count(sql)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return count

    def scan_cases(self, project):
        """创建项目时，如果勾选扫面测试用例，则会扫描多有版本的测试用例"""
        success = False
        dest_path = os.sep.join([constant.test_case, u'常规项目'])
        svn_url = self.cfg_helper.get_value('svn', 'svn_basetest_url', '')
        try:
            if not os.path.exists(dest_path):
                utils.checkout(svn_url, dest_path)
            # else:
            #     # svn update
            #     utils.svn_update(dest_path)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.case_scan_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)
        try:
            self.scan_cases_local()
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.case_scan_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)
        return success

    def scan_cases_local(self):
        '''扫描本地已下载的测试用例'''
        success = False
        result = []
        local_path = os.sep.join([constant.test_case, u'常规项目'])
        #遍历当前项目
        projects = utils.list_dir(local_path)
        self.log.debug("projects:" + str(projects))
        for project in projects:
            versions = utils.list_dir(local_path, project)
            for version in versions:
                pycharm_projects = utils.list_dir(local_path, project, version)
                for pycharm_project in pycharm_projects:
                    case_dir = os.path.join(local_path, project, version, pycharm_project,'src','cases')
                    print('case_dir:' + str(case_dir))
                    modules = utils.list_dir(case_dir)
                    for m in modules:
                        if os.path.isfile(os.path.join(case_dir,m)):
                            if os.path.splitext(m)[1] == '.py':
                                self.parse2Data(os.path.join(case_dir, m), os.path.join(local_path, project), 'cases', '', os.path.basename(m), [], None, version, pycharm_project, project)
                                # 目录作为一级模块
                            else:
                                #在目录下的__init__.py里获取模块描述
                                module_desc = ''
                                if os.path.isfile(os.path.join(case_dir, m, '__init__.py')):
                                    f = open(os.path.join(case_dir, m, '__init__.py'))
                                    p = ast.parse(f.read()).body
                                    module_desc = p[0].value.s if p else ''
                                    f.close()
                                for root, dirs, files in os.walk(os.path.join(case_dir, m)):
                                    for file in files:
                                        if os.path.splitext(file) == '.py':
                                            modules = utils.relative(os.path.join(root, file), case_dir)[0:-1]
                                            package = utils.relative(os.path.join(root, file), os.path.dirname(case_dir))[0:-1]
                                            package = '.'.join(package)
                                            result.extend(
                                                self.parse2Data(os.path.join(root, file), os.path.join(local_path, project), package,
                                                             m, os.path.basename(os.path.splitext(file)[0]), modules, module_desc, version,
                                                             pycharm_project, project))

                    return result


    def parse2Data(self,pyfile, pro_base_url, package, module, sub_module, modules, module_desc, version, pycharm_project, project_kind):
        t = re.compile('testcase', re.I)
        def _getAttributeValue(attribute):
            result = ''
            if type(attribute) == ast.Attribute:
                k = _getAttributeValue(attribute.value)
                result = result + k +'.'+ attribute.attr
            elif type(attribute) == ast.Name:
                result = result + attribute.id
            return result
        result = []
        with open(pyfile,encoding='UTF-8') as f:
            try:
                p = ast.parse(f.read(),filename=pyfile)
                print(str(p))
            except:
                restr = traceback.format_exc()
                self.log.debug(restr)
                return []
            classes = []
            for c in p.body:
                print(type(c))
                if type(c) == ast.ClassDef:
                    print(map(lambda name: name.id, c.bases))
                    print(c.bases)
                    if list(set(constant.TARGET_BASE_CLASS).intersection(map(lambda name: name.id, c.bases))):
                        print(list(set(constant.TARGET_BASE_CLASS).intersection(map(lambda name: name.id, c.bases))))
                        constant.TARGET_BASE_CLASS.append(c.name)
                        print(c.name)
                        print(constant.TARGET_BASE_CLASS)
                        if filter(lambda f:type(f) == ast.FunctionDef and f.name == 'run_test', c.body):
                            classes.append(c)
                    elif filter(lambda  name : t.search(name.id), c.bases):
                        constant.TARGET_BASE_CLASS.append(c.name)
            if module_desc == None:
                module_desc = p.body[0].value.s if p.body and type(p.body[0]) == ast.Expr else ''

            for c in classes:
                property = {}
                property['pending'] = ''
                # 类名 (这个属性不会为空)
                for i in range(0, len(c.body)):
                    property_object = c.body[i]
                    # doc string只能是紧随类定义下面
                    # print(property_object.value.s.strip())
                    property['doc_string'] = property_object.value.s.strip() if i == 0 and type(property_object) == ast.Expr else property.get('doc_string', '')
                    if type(property_object) == ast.Assign:
                        key = property_object.targets[0].id
                        value = property_object.value
                        if type(value) == ast.Str:
                            value = value.s
                        elif type(value) == ast.Num:
                            value = value.n
                        elif type(value) == ast.Name:
                            value = value.id
                        elif type(value) == ast.Attribute:
                            value = _getAttributeValue(value)
                        else:
                            value = None
                        if value != None:
                            property[key] = value
                property['class_name'] = c.name
                property['local_path'] = pyfile
                property['base_url'] = pro_base_url
                property['project_name'] = os.path.basename(pro_base_url)
                property['package'] = package
                property['module'] = module
                property['sub_module'] = sub_module
                property['modules'] = modules
                property['module_desc'] = module_desc
                property['case_version'] = version
                property['logic_id'] = c.name.split('_')[0]
                property['name_for_query'] = '%s.%s.%s' % (package, sub_module, c.name)

                src = '%s%s' % (c.name, pyfile)
                m = hashlib.md5()
                m.update(src.encode(encoding='utf-8'))
                property['id'] = m.hexdigest()

                filemt = time.localtime(os.stat(pyfile).st_mtime)
                property['mtime'] = time.strftime("%Y/%m/%d %H:%M:%S", filemt)

                property['pycharm_project'] = pycharm_project
                property['project_kind'] = project_kind
                # if not property['pending']:
                #     property['pending'] = ''
                print(property['pending'])
                # sql = '''
                #     insert into test_case (case_id, case_version, base_url,class_name,doc_string,local_path,logic_id, module, module_desc,
                #     mtime,modules,name_for_query,owner,package,priority,project_kind,project_name,pycharm_project,status,sub_module,
                #     timeout,pending)
                #     values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s, %s, %s,%s, %s, %s, %s, %s, %s, %s)
                #     '''
                # params = (property['id'], property['case_version'], property['base_url'],property['class_name'],property['doc_string'],property['local_path'],
                #           property['logic_id'],property['modules'],property['module_desc'],property['mtime'],property['modules'],property['name_for_query'],
                #           property['owner'],property['package'],property['priority'],property['project_kind'],property['project_name'],property['pycharm_project'],
                #           property['status'],property['sub_module'],property['timeout'],property['pending'])
                #查询是否存在
                sql = '''select * from test_case where 'case_id' = %s '''
                # params = (property['id'])
                row_count = self.db.row_count(sql, [property['id']])
                if row_count > 0:
                    sql = '''
                        update test_case set 'case_version' = %s, 'base_url' = %s, 'class_name' = %s, 'doc_string' = %s, 'local_path' = %s,
                        'logic_id' = %s, 'module' = %s, 'module_desc' = %s, 'mtime' = %s, 'name_for_query' = %s, 'owner' = %s,
                        'package' = %s, 'priority' = %s, 'project_kind' = %s, 'project_name' = %s, 'pycharm_project' = %s,
                        'status' = %s, 'sub_module' = %s, 'timeout' = %s, 'pending' = %s where 'case_id' = %s
                        '''
                    params = (property['case_version'], property['base_url'],property['class_name'],property['doc_string'],property['local_path'],
                              property['logic_id'], property['module'], property['module_desc'], property['mtime'], property['name_for_query'], property['owner'],
                              property['package'], property['priority'], property['project_kind'], property['project_name'],property['pycharm_project'],
                              property['status'],property['sub_module'],property['timeout'],property['pending'], property['id'])

                    self.db.execute(sql, params)

                else:
                    sql = '''
                        insert into test_case (case_id, case_version, base_url, class_name, doc_string, local_path,
                        logic_id, module, module_desc, mtime, name_for_query, owner,
                        package, priority,project_kind,project_name,pycharm_project,
                        status,sub_module,timeout,pending)
                        values(%s,%s,%s,%s,%s,%s,
                        %s,%s,%s,%s,%s,%s,
                        %s,%s,%s,%s,%s,
                        %s,%s,%s,%s)
                        '''
                    params = (property['id'], property['case_version'], property['base_url'],property['class_name'],property['doc_string'],property['local_path'],
                              property['logic_id'], property['module'], property['module_desc'], property['mtime'], property['name_for_query'], property['owner'],
                              property['package'], property['priority'], property['project_kind'], property['project_name'],property['pycharm_project'],
                              property['status'],property['sub_module'],property['timeout'],property['pending'])

                    self.db.execute(sql, params)


    def update_caseinfo(self, *args):
        sql = ''

    def __get_svn_version(self, project_id):
        sql = 'select * from project_svn_version where project_id = %s'
        result = self.db.query(sql,[project_id])
        return result

    def scan_cases_by_version_id(self, version_id, project):
        success = False
        try:
            sql = "select * from project_svn_version where id = %s"
            version_obj = self.db.query(sql, [version_id])
            svn_path = version_obj[0]['svn_path']
            code_path = os.sep.join([project['path'], 'code', svn_path]).replace('/', '\\')

            self.__update_rainbow2()

            svn_url = project['svn_url'] + '/' + svn_path
            if os.path.exists(code_path):
                utils.svn_update(code_path)
            else:
                utils.checkout(svn_url, code_path)

            version = utils.get_revision_from_svn(svn_url)
            self.__update_svn_version(version_id, version)

            self.__update_project(project['id'])

            self.__make_jar_with_dependency(code_path)

            src_jar_path = code_path + os.sep + 'target'
            desc_jar_path = project['path'] + os.sep + 'jar'
            desc_jar_path = desc_jar_path.replace('/', '\\')
            if not os.path.exists(desc_jar_path):
                os.makedirs(desc_jar_path)

            files = glob.glob(src_jar_path + os.sep + '*.jar')
            file = files[0]
            suffix = ''
            if svn_path.find('/') ==-1:
                suffix = svn_path
            else:
                suffix = svn_path.split('/')[1]

            jar_file_name = str(project['id']) + '_' + suffix + '.jar'
            shutil.copyfile(os.path.abspath(file), desc_jar_path + os.sep + jar_file_name)

            # scan
            cmd = "java -jar " + constant.case_jar_path + os.sep + "ScanCase.jar -scanCaseToDB " + str(
                project['id']) + ' ' + str(version_id)
            cmd_result = utils.popen_has_result(cmd, 'gbk')
            for tmp in cmd_result:
                if tmp.find("Scan caseinfo successful") != -1:
                    self.log.info("Scan " + project['name'] + '(' + svn_path + ") successfully")
                    success = True
                    break
            if not success:
                error_code = error_constant.case_scan_failed
                error_msg = error_constant.errors[error_code]
                raise RainbowCenterException(error_msg, error_code)
            else:
                self.__update_plan(project['id'], version_id)
        except RainbowCenterException as ex:
            raise ex
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.case_scan_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)
        return success

    def __update_plan(self, project_id, version_id):
        rel_case_ids = None
        sql = """
            select pcr.case_id
              from plan_case_rel pcr
              left join plan p on p.id = pcr.plan_id
             where p.project_id = %s and p.version_id = %s
        """

        result = self.db.query(sql, [project_id, version_id])
        if result:
            rel_case_ids = [tmp['case_id'] for tmp in result]

        case_ids = None
        sql = """
            select tc.id from test_case tc
              left join test_suite ts on ts.id = tc.test_suite_id
              left join project p on p.id = ts.project_id
             where p.id = %s and ts.version_id = %s
        """
        result = self.db.query(sql, [project_id, version_id])
        if result:
            case_ids = [tmp['id'] for tmp in result]

        del_case_ids = None
        if rel_case_ids:
            if case_ids:
                del_case_ids = list(set(rel_case_ids).difference(set(case_ids)))
            else:
                del_case_ids = rel_case_ids

        if del_case_ids:
            tmp = '%s,' * len(del_case_ids)
            sql = 'delete from plan_case_rel where case_id in ('
            sql += tmp[:-1]
            sql += ')'
            self.db.execute(sql, del_case_ids)


    def __update_rainbow2(self):
        update = True
        section = 'rainbow2'
        svn_url = self.cfg_helper.get_value(section,'svn_url',"")
        svn_revision_old = int(self.cfg_helper.get_value(section, 'svn_version', 0))
        svn_revision_new = utils.get_revision_from_svn(svn_url)
        self.log.debug('rainbow2 svn_revision_old = %d' %svn_revision_old)
        self.log.debug('rainbow2 svn_revision_new = %d' %svn_revision_new)
        if svn_revision_new != svn_revision_old:
            self.cfg_helper.set_value(section,'svn_version', svn_revision_new)

            path = os.sep.join([constant.test_project,'rainbow2'])
            utils.checkout(svn_url, path)
            self.__make_jar(path)
            jar_name = 'Rainbow2_1.2.jar'
            jar_path = os.sep.join([path, 'target', jar_name])
            self.__copy_rainbow2_to_repository(path, jar_path)
        else:
            update = False
        return update

    def __make_jar(self, path):
        cmd = 'mvn clean compile package'
        path = path.replace('/', '\\')
        utils.popen(cmd, path)

    def __copy_rainbow2_to_repository(self, path, jarpath):
        path = path.replace('/', '\\')
        cmd = 'mvn install'
        utils.popen(cmd,path)

    def __update_svn_version(self, version_id, version):
        sql = 'update project_svn_version set `version` = %s where `id` = %s'
        self.db.execute(sql, [version, version_id])

    def __update_project(self, project_id):
        sql = """
            update project set update_date = now() where `id` = %s
        """
        self.db.execute(sql, [project_id])

    def __make_jar_with_dependency(self, path):
        cmd = 'mvn clean compile assembly:single'
        path = path.replace('/', '\\')
        utils.popen(cmd, path)

    def del_cases(self, version_id):
        success = True
        try:
            suite_sql = 'select * from `test_suite` where version_id = %s'
            suites = self.db.query(suite_sql, [version_id])
            for suite in suites:
                del_case = 'delete from test_case where test_suite_id = %s '
                self.db.execute(del_case, (suite['id'],))

                del_suite = 'delete from test_suite where id = %s '
                self.db.execute(del_suite, (suite['id'],))
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success

    def count_suite(self, condition=None):
        row_count = 0
        try:
            sql = """
                select *
                from test_suite ts
                left join project pj on pj.id = ts.project_id
                left join product pd on pd.id = pj.product_id
                where 1 = 1
            """
            params = []
            dics = {
                'ts.project_id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'pj.product_id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pd.name': (condition and 'product_name' in condition) and condition['product_name'] or None,
                'ts.id': (condition and 'suite_id' in condition) and condition['suite_id'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            self.log.debug(sql)
            row_count = self.db.row_count(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def get_suites(self, condition):
        suites = []
        try:
            sql = """
                select ts.*, pj.name project_name, pd.name product_name, ts.name suite_name, psv.svn_path
                  from test_suite ts
                  left join project pj on pj.id = ts.project_id
                  left join product pd on pd.id = pj.product_id
                  left join project_svn_version psv on psv.id = ts.version_id
                 where 1 = 1
            """
            params = []
            dics = {
                'ts.project_id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'ts.version_id': (condition and 'version_id' in condition) and condition['version_id'] or None,
                'pj.product_id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pd.name': (condition and 'product_name' in condition) and condition['product_name'] or None,
                'ts.id': (condition and 'suite_id' in condition) and condition['suite_id'] or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            result = self.db.query(sql, params)
            for item in result:
                svn_path = item['svn_path']
                item['svn_version'] = svn_path
                if svn_path.find('branches') != -1:
                    item['svn_version'] = svn_path.replace('branches/', '')
                suites.append(item)

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return suites

    def count_case(self, condition=None):
        row_count = 0
        try:
            sql = """
                select *
                  from test_case tc
                  left join test_suite ts on tc.test_suite_id = ts.id
                  left join project pj on ts.project_id = pj.id
                  left join product pd on pj.product_id = pd.id
                 where 1 = 1
            """
            params = []
            dics = {
                'pd.id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pj.id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'ts.id': (condition and 'suite_id' in condition) and condition['suite_id'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            row_count = self.db.row_count(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def get_suite(self, suite_id):
        suite = None
        try:
            sql = '''
                select ts.name, pd.name product_name, pj.name project_name, ts.package, ts.class, ts.parameter, ts.desc
                  from test_suite ts
                  left join project pj on pj.id = ts.project_id
                  left join product pd on pd.id = pj.product_id
                 where ts.id = %s
            '''
            result = self.db.query(sql, [suite_id])
            if result:
                suite = result[0]

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return  suite

    def get_cases(self, condition):
        cases = None
        try:
            sql = """
                select tc.*, ts.name suite_name, tc.name case_name , tc.id case_id
                  from test_case tc
                left join test_suite ts on ts.id = tc.test_suite_id
                 where 1 = 1
            """
            params = []
            if condition:
                if 'suite_ids' in condition and condition['suite_ids']:
                    suite_ids = condition['suite_ids']
                    if suite_ids:
                        sql += " and tc.test_suite_id in ("
                        tmp = ""
                        for suite_id in suite_ids:
                            #                         tmp += ",%d" % suite_id
                            tmp += ',%s'
                            params.append(suite_id)
                        sql += tmp[1:] + ") "

                if 'case_ids' in condition and condition['case_ids']:
                    case_ids = condition['case_ids']
                    if case_ids:
                        sql += " and tc.id in ("
                        tmp = ""
                        for case_id in case_ids:
                            tmp += ',%s'
                            params.append(case_id)
                        sql += tmp[1:] + ") "

                if 'cur_page' in condition and condition['cur_page']:
                    sql += ' limit %s, %s '
                    params.append((condition['cur_page'] - 1) * constant.page_size)
                    params.append(constant.page_size)

            cases = self.db.query(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return cases

    def check_case_exist(self, project_id, version_id):
        case_exist = False
        try:
            sql = '''
                select count(*) case_count
                from test_case tc
                left join test_suite ts on tc.test_suite_id = ts.id
                left join project pj on ts.project_id = pj.id
                where pj.id = %s and ts.version_id = %s
            '''
            tmp_result = self.db.query(sql, [project_id, version_id])
            if tmp_result:
                count = tmp_result[0]['case_count']
                if count and count > 0:
                    case_exist = True
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return case_exist


