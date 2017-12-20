#!/usr/bin/env python
# -*- coding:utf-8 -*-
import traceback
import subprocess
from com.boyaa.RainbowCenter.common import constant
from com.boyaa.RainbowCenter.common import utils
from com.boyaa.RainbowCenter.manager.base import BaseManager

class DeviceManager(BaseManager):

    def __init__(self):
        BaseManager.__init__(self);

    def add(self, device):
        device_id = None
        try:
            sql = """
                insert into device (`name`, `serial_no`, create_date, os_type, status) values(%s, %s, now(), %s, %s)
            """
            params = (device['name'], device['serial_no'], device['os_type'], device['status'])
            device_id = self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return device_id

    def get_online_device_ids(self):
        #获取当前在线的设备
        online_devices = self.scan_devices()
        online_device_ids = [device['id'] for device in online_devices]
        return online_device_ids

    def __start_adb_server(self):
        #启动adb服务
        self.log.debug('start adb server')
        cmd = 'adb start-server'
        pipe = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        pipe.communicate()

    def scan_devices(self):
        '''
        扫描当前机器连接的手机设备列表
        '''
        devices = []
        try:
            self.__start_adb_server()
            cmd = 'adb devices -l|findstr "\<device\>" '
            cmd_result = utils.popen_has_result(cmd)
            if cmd_result:
                for tmp in cmd_result:
                    tmp_list = tmp.split()
                    if len(tmp_list) < 3:
                        continue
                    device_name = tmp_list[3].split(':')[1]
                    serial_no = tmp_list[0]

                    device = self.get_device({'sn': serial_no})
                    info = {
                        'serial_no': serial_no,
                        'name': device_name,
                        'os_type': constant.os_android,
                        'status': constant.device_status_waiting
                    }
                    if not device:
                        device_id = self.add(info)
                    else:
                        device_id = device['id']
                        if device['status'] == constant.device_status_offline:
                            self.update_status(device_id, constant.device_status_waiting)
                    info['id'] = device_id
                    devices.append(info)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return devices

    def get_devices(self, condition=None):
        #查询数据库中的设备信息
        devices = []
        try:
            sql = 'select * from device where 1 = 1 '
            params = []
            sql, params = self.db.assemble_sql(sql, params, condition, 'and')
            self.log.debug(sql)
            print(sql)
            result = self.db.query(sql, params)
            for device in result:
                if device['create_date']:
                    device['create_date'] = str(device['create_date'])
                else:
                    device['create_date'] = ''
                if device['update_date']:
                    device['update_date'] = str(device['update_date'])
                else:
                    device['update_date'] = ''
                devices.append(device)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return devices

    def get_device(self, condition=None):
        device = None
        params = []
        try:
            sql = 'select * from device where 1=1 '
            if condition:
                if 'device_id' in condition and condition['device_id']:
                    sql += ' and id = %s '
                    params.append(condition['device_id'])
                if 'sn' in condition and condition['sn']:
                    sql += ' and serial_no = %s '
                    params.append(condition['sn'])
            self.log.debug(sql)
            self.log.debug(params)
            # sql = 'select * from device where 1=1  and serial_no = "R3E4C16B26009686"'
            devices = self.db.query(sql,params)
            if devices:
                device = devices[0]
                if device['create_date']:
                    device['create_date'] = str(device['create_date'])
                else:
                    device['create_date'] = ''
                if device['update_date']:
                    device['update_date'] = str(device['update_date'])
                else:
                    device['update_date'] = ''
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return device

    def check_device(self, device_id):
        device = None
        if device_id:
            devices = self.scan_devices()
            for tmp in devices:
                if device_id == tmp['id']:
                    device = self.get_device({'sn': tmp['serial_no']})
                    break
        return device

    def update(self, device_id, values):
        success = True
        try:
            params = []
            sql = """
                update device set
            """
            if values:
                if 'use' in values:
                    sql += '`use` = %s, '
                    params.append(values['use'])
                if 'desc' in values:
                    sql += '`desc` = %s, '
                    params.append(values['desc'])
            sql += ' update_date = now() where id = %s '
            params.append(device_id)

            self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success

    def update_status(self, device_id, status):
        success = True
        try:
            sql = 'update device set `status` = %s where id = %s '
            params = (status, device_id)
            self.db.execute(sql, params)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
            success = False
        return success