#!/usr/bin/env python
# -*- coding:utf-8 -*-
import os
import traceback
from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper
from com.boyaa.RainbowCenter.common.excel_helper import ReadExcelHelper
from com.boyaa.RainbowCenter.common.exception import error_constant
from com.boyaa.RainbowCenter.common.exception.exception import RainbowCenterException
from com.boyaa.RainbowCenter.manager.base import BaseManager
from com.boyaa.RainbowCenter.manager.testcase_manager import TestCaseManager

class ProjectManager(BaseManager):

    __cfg_helper = InitHelper(constant.cfg_file_path)
    __testcast_manager = TestCaseManager()

    def __init__(self):
        BaseManager.__init__(self)
        self.cfg_helper = self.__cfg_helper
        self.testcase_manager = self.__testcast_manager

    def get_projects(self, condition=None):
        projects = []
        try:
            params = []
            sql = """
                select pj.*, pd.name product_name, u.name creator
                  from project pj
                left join product pd on pd.id = pj.product_id
                left join user u on u.id = pj.creator_id
                 where 1 = 1 """
            dics = {
                'pd.id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pj.name': (condition and 'project_name' in condition and condition['project_name']) and '%' +
                                                                                                         condition[
                                                                                                             'project_name'] + '%' or None,
                'u.name': (condition and 'creator' in condition and condition['creator']) and '%' + condition[
                    'creator'] + '%' or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            print(dics)
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            result = self.db.query(sql, params)
            for project in result:
                project['create_date'] = str(project['create_date'])
                project['update_date'] = str(project['update_date'])
                projects.append(project)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return projects

    def count_project(self, condition=None):
        row_count = 0
        try:
            params = []
            sql = """
                select *
                  from project pj
                left join product pd on pd.id = pj.product_id
                left join user u on u.id = pj.creator_id
                 where 1 = 1
            """
            dics = {
                'pd.id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'pj.name': (condition and 'project_name' in condition and condition['project_name']) and '%' +
                                                                                                         condition[
                                                                                                             'project_name'] + '%' or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            row_count = self.db.row_count(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def add(self, infos):
        project_id = None
        try:
            project_name = infos['project_name']
            project_desc = infos['project_desc']
            product_id = utils.str_to_int(infos['product_id'])
            creator_id = infos['creator_id']
            svn_url = infos['svn_url']
            path = ''
            data_org = infos['data_org']
            sql = """
                insert into project (`product_id`,`name`, `creator_id`, `path`, `data_org`, `svn_url`, `create_date`, `update_date`, `desc`)
                values (%s, %s, %s, %s, %s, %s, now(), now(), %s)
            """
            params = [product_id, project_name, creator_id, path, data_org, svn_url, project_desc]
            project_id = self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.project_create_failed
            error_msg = error_constant.errors[error_code]
            raise RainbowCenterException(error_msg, error_code)
        return project_id

    def creat_project(self, infos):
        success = False
        # try:
        #     project_id = self.add(infos)

    def get_projects_by_id(self, ids):
        result = []
        try:
            sql = 'select * from product where id in ('

            tmp = '%s,' * len(ids)
            sql += tmp[:-1]
            sql += ')'

            result = self.db.query(sql, ids)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return result

    def check_project_name_exist(self, project_id, project_name):
        exist = False
        try:
            sql = "select * from project where name = %s"
            param = []
            param.append(project_name)
            if project_id:
                sql += ' and product_id = %s '
                param.append(project_id)
            count = self.db.row_count(sql, param)
            if count:
                exist = True
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return exist

    def create_project(self, infos):
        success = False
        try:
            project_id = self.add(infos)
            version_datas = []
            svn_url = infos['svn_url']
            path_list = utils.get_path_list_from_svn(svn_url)
            for path in path_list:
                version_data = []  # project_id, path, revision
                version_data.append(project_id)
                if path == 'trunk':
                    version_data.append('trunk')
                    path = svn_url + '/' + path
                    revision = utils.get_revision_from_svn(path)
                    version_data.append(revision)
                    version_datas.append(version_data)
                elif path == 'branches':
                    path = svn_url + '/' + path
                    branch_path_list = utils.get_path_list_from_svn(path)
                    for branch_path in branch_path_list:
                        version_data.append('branches/' + branch_path)
                        branch_path = path + '/' + branch_path
                        revision = utils.get_revision_from_svn(path)
                        version_data.append(revision)
                        version_datas.append(version_data)
            sql = 'insert into project_svn_version (project_id, svn_path, version) values(%s, %s, %s)'
            self.db.execute_many(sql, version_datas)
            # create path
            path = os.sep.join([constant.test_project, str(infos['product_id']), str(project_id)])
            if os.path.exists(path):
                os.system('rd /S /Q %s' % path)
            os.makedirs(path, exist_ok=True)
            path = path.replace(os.sep, "/")
            sql = 'update project set path = %s where id = %s'
            self.db.execute(sql, [path, project_id])
            # checkout project from svn
            code_path = os.sep.join([path, 'code'])
            utils.checkout(infos['svn_url'], code_path)

            project = self.get_project(project_id)

            self.scan_ui_repository(project)
            # scan case
            if infos['scan_case']:  # 0: not scan; 1: scan
                # scan cases
                project['scan_case'] = infos['scan_case']
                self.testcase_manager.scan_cases(project)
            success = True
        except RainbowCenterException as ex:
            raise ex
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.project_create_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)
        return success

    def get_project(self, project_id):
        project = None
        try:
            sql = """
                select pj.*, pd.name product_name, u.name creator
                  from project pj
                  left join product pd on pd.id = pj.product_id
                  left join user u on u.id = pj.creator_id
                where pj.id = %s
            """
            projects = self.db.query(sql, [project_id])
            if projects:
                project = projects[0]
                project['create_date'] = str(project['create_date'])
                project['update_date'] = str(project['update_date'])
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return project

    def __get_pages(self, project_id):
        sql = 'select * from `page` where project_id = %s'
        pages = self.db.query(sql, [project_id])
        return pages

    def scan_ui_repository(self, project):
        ui_repository_path = None
        try:
            # get project_id
            project_id = project['id']

            # delete ui_repository
            pages = self.__get_pages(project['id'])
            page_ids = []
            for page in pages:
                data = (page['id'],)
                page_ids.append(data)
            del_ui_sql = "delete from ui_repository where page_id = %s "
            self.db.execute_many(del_ui_sql, page_ids)

            del_page_sql = 'delete from page where project_id = %s '
            self.db.execute(del_page_sql, (project_id,))

            # get path
            share_folder = self.cfg_helper.get_value("share", "share_folder", "")
            ui_repository_path = os.sep.join([share_folder, project['data_org'], 'UIRepository.xls'])

            # get datas
            if os.path.exists(ui_repository_path):
                excel_helper = ReadExcelHelper(ui_repository_path)

                sheet_name = 'UIElements'
                datas = excel_helper.get_row_datas(sheet_name)
                datas = datas[1:]
                ui_repository = {}
                page_name = None
                pages = []
                for data in datas:
                    if data[0]:
                        page_name = data[0]
                        pages.append(page_name)
                        ui_repository[page_name] = []
                    ui_repository[page_name].append(
                        {'name': data[1], 'find_method': data[2], 'value': data[3], 'index': data[4], 'desc': data[5]})

                # insert into db
                for page in pages:
                    page_sql = 'insert into `page` (project_id, `name`, os_type) values (%s, %s ,%s) '
                    params = (project_id, page, 1)
                    page_id = utils.str_to_int(self.db.execute(page_sql, params))
                    uis = ui_repository[page]
                    ui_datas = []
                    for ui in uis:
                        ui_data = (page_id, ui['name'], ui['find_method'], str(ui['value']).replace("'", "\'"),
                                   utils.str_to_int(ui['index']), ui['desc'].replace("'", "\'"))
                        ui_datas.append(ui_data)
                    ui_sql = """
                        insert into ui_repository (`page_id`, `name`, `find_method`, `value`, `index`, `desc`)
                        values (%s, %s, %s, %s, %s, %s)
                    """
                    self.db.execute_many(ui_sql, ui_datas)
            else:
                error_code = error_constant.project_ui_repository_not_exist
                error_msg = error_constant.errors.get(error_code) % ui_repository_path
                raise RainbowCenterException(error_msg, error_code)
        except RainbowCenterException as ex:
            raise ex
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.project_scan_ui_repository_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)

    def update(self, values):
        success = False
        try:
            project_id = values['project_id']
            project = self.get_projects(project_id)

            if not project:
                error_code = error_constant.project_not_exist
                error_msg = error_constant.errors.get(error_code)
                raise RainbowCenterException(error_msg, error_code)

            if 'svn_url' in values:
                svn_revision = utils.get_revision_from_svn(values['svn_url'])
                if svn_revision:
                    values['svn_revision'] = svn_revision
                else:
                    error_code = error_constant.project_svn_url_invalid
                    error_msg = error_constant.errors.get(error_code)
                    raise RainbowCenterException(error_msg, error_code)
            sql = '''update porject set update_date = now()'''
            params = []
            sql, params = self.db.assemble_sql(sql,params, values, "")
            sql += ' where id = %s '
            params.append(project_id)
            self.db.execute(sql,params)

            if 'svn_url' in values:
                code_path = os.sep.join([project['path'], 'code']).replace('/','\\')
                utils.checkout(values['svn_url', code_path])

            if 'scan_case' in values and values['scan_case']:
                self.testcase_manager.del_cases(project_id)
                project['scan_case'] = values['scan_case']
                self.testcase_manager.scan_cases(project)

            if 'scan_ui' in values and values['scan_ui']:
                self.scan_ui_repository(project)

            success = True

        except RainbowCenterException as ex:
            raise ex
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            error_code = error_constant.project_update_failed
            error_msg = error_constant.errors.get(error_code)
            raise RainbowCenterException(error_msg, error_code)
        return success

    def update_svn_version(self, project_id):
        project = self.get_project(project_id)
        svn_url = project['svn_url']

        versions = self.get_versions({'project_id': project_id})
        path_list = []
        tmp_list = utils.get_path_list_from_svn(svn_url)

        for path in tmp_list:
            version_data = []  # project_id, path, revision
            version_data.append(project_id)
            if path == 'trunk':
                path_list.append(path)
            elif path == 'branches':
                path = svn_url + '/' + path
                branch_path_list = utils.get_path_list_from_svn(path)
                for branch_path in branch_path_list:
                    path_list.append('branches/' + branch_path)

        update_datas = []
        del_datas = []
        for version in versions:
            svn_path = version['svn_path']
            version_id = version['id']
            if svn_path in path_list:
                revision = utils.get_revision_from_svn(svn_url + '/' + svn_path)
                update_datas.append([revision, version_id])
                path_list.remove(svn_path)
            else:
                del_datas.append(version_id)

        if update_datas:
            update_sql = 'update project_svn_version set `version` = %s where id = %s'
            self.db.execute_many(update_sql, update_datas)

        if del_datas:
            tmp = '%s,' * len(del_datas)
            del_sql = 'delete from project_svn_version where id in ('
            del_sql += tmp[:-1]
            del_sql += ')'
            self.db.execute(del_sql, del_datas)

        insert_datas = []
        if path_list:
            for path in path_list:
                revision = utils.get_revision_from_svn(svn_url + '/' + path)
                insert_datas.append([project_id, path, revision])
            insert_sql = 'insert into project_svn_version (project_id, svn_path, `version`) values (%s, %s, %s)'
            self.db.execute_many(insert_sql, insert_datas)

    def get_versions(self, condition=None):
        versions = []
        try:
            params = []
            sql = 'select * from project_svn_version where 1 = 1 '
            dics = {
                'project_id' : (condition and 'project_id' in condition) and condition['project_id'] or None,
                'id' : (condition and 'version_id' in condition) and condition['version_id'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            result = self.db.query(sql, params)
            for item in result:
                svn_path = item['svn_path']
                item['svn_version'] = svn_path
                if svn_path.find('branches') != -1:
                    item['svn_version'] = svn_path.replace('branches/', '')
                versions.append(item)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return versions

    def count_ui_repository(self, project_id):
        row_count = 0
        try:
            sql = """
                select ur.*, p.name page_name
                  from ui_repository ur
                  left join page p on p.id = ur.page_id
                  left join project pj on pj.id = p.project_id
                 where pj.id = %s
            """
            row_count = self.db.row_count(sql, [project_id])
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def get_ui_repository(self, condition=None):
        ui_repository = None
        try:
            params = []
            sql = """
                select ur.*, p.name page_name
                  from ui_repository ur
                  left join page p on p.id = ur.page_id
                  left join project pj on pj.id = p.project_id
                 where 1 =1
            """
            dics = {
                'pj.id': (condition and 'project_id' in condition) and condition['project_id'] or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and', 'ur.id', 'asc')
            ui_repository = self.db.query(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return ui_repository
