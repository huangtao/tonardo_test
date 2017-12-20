# -*- coding:utf-8 -*-
import itertools
import mysql.connector
import traceback
import com.boyaa.RainbowCenter.common.constant as constant
from com.boyaa.RainbowCenter.base_obj import BaseObject
from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper

class Row(dict):
    """A dict that allows for object-like property access syntax."""

    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name)


class MySQLDB(BaseObject):
    def __init__(self):
        BaseObject.__init__(self)
        self.cfg_helper = InitHelper(constant.cfg_file_path)
        self.db_config_info = self.__db_config_info()

    def assemble_sql(self, sql, params, dics, delimiter, order_col=None, order=None):
        tmp_sql = ''
        cur_page = None
        if dics:
            if 'cur_page' in dics and dics['cur_page']:
                cur_page = dics['cur_page']
                dics.pop('cur_page', None)
            for key in dics:
                value = dics[key]
                if value == None:
                    continue
                if isinstance(value, str):  # 判断value是否为字符串
                    value = value.strip()
                if value == 'now()':  # 设置时间
                    tmp_sql += ' %s = now() %s' % (key, delimiter)
                elif value == '%s + 1' % key:  # 自增长
                    tmp_sql += ' %s = %s + 1 %s' % (key, key, delimiter)
                else:
                    if value and isinstance(value, str) and value.startswith('%') and value.endswith('%'):
                        if key.find('.') == -1:
                            tmp_sql += ' `%s` like %r %s' % (key, value, delimiter)
                        else:
                            tmp_list = key.split('.')
                            tmp_sql += ' %s.`%s` like %r %s' % (tmp_list[0], tmp_list[1], value, delimiter)
                    else:
                        if key.find('.') == -1:
                            tmp_sql += ' `%s` = %%s %s' % (key, delimiter)
                        else:
                            tmp_list = key.split('.')
                            tmp_sql += ' %s.`%s` = %%s %s' % (tmp_list[0], tmp_list[1], delimiter)
                        params.append(dics[key])

            if tmp_sql.endswith(delimiter):
                tmp_sql = tmp_sql[:-len(delimiter)]
            if params or tmp_sql:
                tmp_sql = delimiter + tmp_sql
            sql += tmp_sql

        # 排序
        if order_col and order:
            if order_col.find('.') == -1:
                sql += ' order by %s %s ' % (order_col, order)
            else:
                tmp_list = order_col.split('.')
                sql += ' order by %s.`%s` %s' % (tmp_list[0], tmp_list[1], order)

        # 分页
        if cur_page:
            sql += ' limit %%s, %%s ' % ()
            params.append((cur_page - 1) * constant.page_size)
            params.append(constant.page_size)

        return sql, params

    def query(self, sql, param=None):
        connect = None
        cursor = None
        result = None
        try:
            connect = self.__connect()
            cursor = self.__cursor(connect)
            cursor.execute(sql, param)
            print(cursor.description)
            column_names = [d[0] for d in cursor.description]
            print(column_names)
            result = [Row(itertools.zip_longest(column_names, row)) for row in cursor.fetchall()]
        except Exception:
            exstr = traceback.format_exc()
            print(exstr)
        finally:
            self.__close(connect, cursor)
        return result

    def execute(self, sql, param=None):
        connect = None
        cursor = None
        last_row_id = None
        try:
            connect = self.__connect()
            cursor = self.__cursor(connect)
            cursor.execute(sql, param)
            last_row_id = cursor.lastrowid
        except Exception:
            exstr = traceback.format_exc()
            print(exstr)
        finally:
            self.__close(connect, cursor, True)
        return last_row_id

    def execute_many(self, sql, param=None):
        connect = None
        cursor = None
        try:
            connect = self.__connect()
            cursor = self.__cursor(connect)
            cursor.executemany(sql, param)
        except Exception:
            exstr = traceback.format_exc()
            print(exstr)
        finally:
            self.__close(connect, cursor, True)

    def row_count(self, sql, param=None):
        connect = None
        cursor = None
        row_count = None
        try:
            connect = self.__connect()
            cursor = self.__cursor(connect, True)
            cursor.execute(sql, param)
            row_count = cursor.rowcount
        except Exception:
            exstr = traceback.format_exc()
            print(exstr)
        finally:
            self.__close(connect, cursor, True)
        return row_count

    def __connect(self):
        connect = mysql.connector.connect(**self.db_config_info)
        return connect

    def __cursor(self, connect, buffered=None):
        cursor = connect.cursor(buffered)
        return cursor

    def __db_config_info(self):
        section = "mysql"
        host = self.cfg_helper.get_value(section, "db_host", "")
        port = self.cfg_helper.get_value(section, "db_port", 3306)
        db_name = self.cfg_helper.get_value(section, "db_name", "")
        user_name = self.cfg_helper.get_value(section, "db_user_name", "")
        password = self.cfg_helper.get_value(section, "db_password", "")
        config = {
            'user': user_name,
            'password': password,
            'host': host,
            'port': port,
            'database': db_name,
            'raise_on_warnings': True
        }

        return config

    def __close(self, connect, cursor, commit=False):
        try:
            if commit:
                connect.commit()
            if cursor:
                cursor.close()
            if connect:
                connect.close()
        except Exception:
            exstr = traceback.format_exc()
            print(exstr)