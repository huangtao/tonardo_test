#!/usr/bin/env python
# -*- coding:utf-8 -*-
import os
import traceback

from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.manager.base import BaseManager
from com.boyaa.RainbowCenter.manager.project_manager import ProjectManager

class ProductManager(BaseManager):
    __project_manager = ProjectManager()

    def __init__(self):
        BaseManager.__init__(self)
        self.project_manager = self.__project_manager

    def get_products(self, condition=None):
        products  = {}
        try:
            params = []
            sql = """
                select pd.id, pd.name, pd.create_date, pd.update_date, pd.desc, u.name creator
                  from product pd
                  left join user u on u.id = pd.creator_id
                  where 1 = 1
            """
            dics = {
                'pd.name': (condition and 'product_name' in condition and condition['product_name']) and '%' + condition[
                    'product_name'] + '%' or None,
                'u.name': (condition and 'creator' in condition and condition['creator']) and '%' + condition[
                    'creator'] + '%' or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            result = self.db.query(sql, params)
            for item in result:
                product = {}
                has_project = False
                product['base_info'] = item
                select_project_sql = 'select * from project where product_id = %s '
                project_result = self.db.query(select_project_sql, [item['id']])
                projects = []
                for project in project_result:
                    project['create_date'] = str(project['create_date'])
                    project['update_date'] = str(project['update_date'])
                    projects.append(project)
                product['projects'] = projects
                if projects:
                    has_project = True
                product['has_project'] = has_project
                products[item['name']] = product
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return products

    def count_product(self, condition=None):
        row_count = 0
        try:
            params = []
            sql = """
                select *
                  from product pd
                  left join user u on u.id = pd.creator_id
                  where 1 = 1
            """
            dics = {
                'pd.name' : (condition and 'product_name' in condition and condition['product_name']) and '%' + condition['product_name'] + '%' or None,
                'u.name' : (condition and 'creator' in condition and condition['creator']) and '%' + condition['creator'] + '%' or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            row_count = self.db.row_count(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def get_products_by_id(self, ids):
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

    def delete(self, product_ids):
        #删除产品，先删除对应的项目
        success = True
        try:
            if product_ids:
                for product_id in product_ids:
                    param = (product_id,)
                    projects = self.project_manager.get_projects({'product_id' : product_id})
                    if projects:
                        project_ids = [project['id'] for project in projects]
                        self.project_manager.delete(product_ids)
                    product = self.get_product({"product_id" : product_id})
                    if not product:
                        continue
                    #delete product
                    del_product_sql = "delete from product where id = %s"
                    self.db.execute(del_product_sql, param)

                    path = os.sep.join([constant.test_project, str(product_id)])

                    if os.path.exists(path):
                        os.system('rd /S /Q %s' % path)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success

    def get_product(self, condition=None):
        product = None
        try:
            sql = """
                select pd.*, u.name creator
                  from product pd
                  left join user u on u.id = pd.creator_id
                 where 1 = 1 """
            params = []
            dics = {
                'pd.name' : (condition and 'product_name' in condition) and condition['product_name'].strip() or None,
                'pd.id' : (condition and 'product_id' in condition) and condition['product_id'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and')
            result = self.db.query(sql, params)
            if result:
                product = result[0]
                product['create_date'] = str(product['create_date'])
                product['update_date'] = str(product['update_date'])
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return product

    def check_product_name_exist(self, product_name):
        exist = False
        try:
            sql = 'select count(*) product_count from product where `name` = %s '

            tmp_result = self.db.query(sql, [product_name])
            if tmp_result:
                count = tmp_result[0]['product_count']
                if count and count > 0:
                    exist = True
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return exist

    def add(self, infos):
        success = True
        try:
            name = infos['product_name']
            desc = infos['product_desc']
            creator_id = infos['creator_id']
            svn_url = infos['svn_url']
            sql = 'insert into product (`name`, `creator_id`, `create_date`, `update_date`, `desc`, svn_url) values (%s, %s, now(), now(), %s, %s)'
            params = (name, creator_id, desc, svn_url)
            product_id = self.db.execute(sql, params)

            path = os.sep.join([constant.test_project, str(product_id)])
            path = path.replace('/', '\\')
            if os.path.exists(path):
                os.system('rd /S /Q %s' % path)
                #                 shutil.rmtree(path)
            os.makedirs(path)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success

    def update(self, infos):
        success = True
        try:
            sql = 'update product set `desc` = %s, update_date = now(), svn_url = %s where `id` = %s '
            params = (infos['product_desc'].strip(), infos['svn_url'], infos['product_id'])
            self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success



