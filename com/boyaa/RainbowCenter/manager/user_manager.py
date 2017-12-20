#!/usr/bin/env python
# -*- coding:utf-8 -*-
#Author: Lucyliu
import hashlib
import traceback

from com.boyaa.RainbowCenter.manager.base import BaseManager

class UserManager(BaseManager):
    def __init__(self):
        BaseManager.__init__(self)

    def check_auth(self, user_name, password):
        user = None
        try:
            # if user_name == "admin" or user_name =="guest":
            password_md5 = hashlib.md5(password.encode('utf-8')).hexdigest()
            print("password_md5 = ", password_md5)
            sql = "select id, name, email, role_id from user where name = %s and password= %s"
            params = [user_name, password_md5]
            result = self.db.query(sql, params)
            if (result and len(result) > 0 ):
                user = result[0]
            if not user:
                user = {'user_name' : user_name, "password" : password, "email" : user_name + '@boyaa.com', "role_id" :3}
                user_id = self.create_user(user)
                user = self.get_user({"user_id" : user_id})

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return user

    def get_user(self, condition=None):
        user = None
        try:
            user_list = self.get_users(condition)
            if user_list:
                user = user_list[0]
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return user

    def create_user(self,user):
        user_id = None
        try:
            password_md5 = hashlib.md5(user['password'].encode('utf-8')).hexdigest()
            print("create password_md5:"+password_md5)

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return user_id

    def get_users(self, condition=None):
        user_list = []
        try:
            params = []
            sql =  """
                select u.*, r.name role_name, p.name product_name
                  from user u
                  left join role r on r.id = u.role_id
                  left join user_pd_pj_rel uppr on uppr.user_id = u.id
                  left join product p on p.id = uppr.product_id
                 where 1 = 1 and u.name not in ('admin', 'Guest')
            """
            dics = {
                'u.name': (condition and 'user_name' in condition) and condition['user_name'] or None,
                'u.id': (condition and 'user_id' in condition) and condition['user_id'] or None,
                'u.email': (condition and 'email' in condition) and condition['email'] or None,
                'uppr.product_id': (condition and 'product_id' in condition) and condition['product_id'] or None,
                'r.id': (condition and 'role_id' in condition) and condition['role_id'] or None,
                'cur_page': (condition and 'cur_page' in condition) and condition['cur_page'] or None
            }
            sql, params = self.db.assemble_sql(sql, params, dics, 'and', 'u.name', 'asc')

            result = self.db.query(sql, params)
            for user in result:
                user['create_date'] = str(user['create_date'])
                if user['last_login_time']:
                    user['last_login_time'] = str(user['last_login_time'])
                else:
                    user['last_login_time'] = ''
                if not user['product_name']:
                    user['product_name'] = ''
                user_list.append(user)

        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return user_list

    def update_user(self, user_id, values=None):
        success = True
        try:
            params = []
            sql = 'update user set id = id'
            if values:
                if 'last_login_time' in values:
                    values['last_login_time'] = 'now()'
                if 'login_times' in values:
                    values['login_times'] = 'login_times + 1'
            sql, params = self.db.assemble_sql(sql, params, values, ',')
            sql += ' where id = %s '
            params.append(user_id)
            self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success
