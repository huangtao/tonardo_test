#!/usr/bin/env python
# -*- coding:utf-8 -*- 
#Author: Lucyliu
import traceback

from com.boyaa.RainbowCenter.base_obj import BaseObject
from com.boyaa.RainbowCenter.common.db_helper import MySQLDB


class LogManager(BaseObject):

    def __init__(self):
        BaseObject.__init__(self)
        self.db = MySQLDB()

    def add(self, user_id, connect, status):
        try:
            sql = """
                insert into operate_log (`user_id`, `content`, `status`, create_date) values(%s, %s, %s, now())
            """
            params = (user_id, connect, status)
            self.db.execute(sql,params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)

    def get_logs(self, condition=None):
        log_list = []
        try:
            sql = """
                select log.content, u.name user_name, log.create_date, log.status
                  from operate_log log
                  left join user u on u.id = log.user_id
                 where 1 = 1
            """
            params = []
            dics = {
                'log.user_id': (condition and 'user_id' in condition) and condition['user_id'] or None,
                'u.name': (condition and 'user_name' in condition and condition['user_name']) and '%' + condition[
                    'user_name'] + '%' or None,
                'log.status': (condition and 'operate_status' in condition and condition['operate_status'] != -1) and
                              condition['operate_status'] or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and', 'log.create_date', 'desc')
            result = self.db.query(sql, params)
            for log in result:
                log['create_date'] = str(log['create_date'])
                log_list.append(log)

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return log_list

    def count_log(self, condition=None):
        row_count = 0
        try:
            sql = """
                select log.content, u.name user_name, log.create_date
                  from operate_log log
                  left join user u on u.id = log.user_id
                 where 1 = 1
            """
            params = []
            dics = {
                'log.user_id': (condition and 'user_id' in condition) and condition['user_id'] or None,
                'u.name': (condition and 'user_name' in condition and condition['user_name']) and '%' + condition[
                    'user_name'] + '%' or None,
                'log.status': (
                              condition and 'operate_status' in condition and condition['operate_status'] != -1) and
                              condition['operate_status'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and', 'log.create_date', 'desc')
            row_count = self.db.row_count(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return row_count

    def delete(self):
        success = True
        try:
            sql = 'delete from operate_log'
            self.db.execute(sql)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success
