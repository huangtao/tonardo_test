#!/usr/bin/env python
# -*- coding:utf-8 -*-
import traceback

from com.boyaa.RainbowCenter.manager.base import BaseManager


class APKManager(BaseManager):

    def __init__(self):
        BaseManager.__init__(self)

    def get_apks(self, condition=None):
        apks = []
        try:
            params = []
            sql = "select * from apk where 1 = 1"
            sql, params = self.db.assemble_sql(sql, params, condition, 'and', 'update_date')
            result = self.db.query(sql, params)
            for item in result:
                item['create_date'] = str(item['create_date'])
                item['update_date'] = str(item['update_date'])

                desc = item['desc']
                version_info = 'APK版本为' + item['version'] + ','
                if desc:
                    desc_dic = eval(desc)
                    for key in desc_dic:
                        if key == 'hall':
                            version_info += '大厅版本为' + desc_dic[key] + ','
                        elif key == 'game':
                            game_dic = desc_dic[key]
                            for game_name in game_dic:
                                version_info += game_name + '版本为' + game_dic[game_name] + ','
                        else:
                            version_info += key + '版本为' + desc_dic[key] + ','
                if item['app_id']:
                    version_info += 'APP ID为' + item['app_id'] + ','
                if item['channel_id']:
                    version_info += '渠道ID为' + item['channel_id']
                item['desc'] = version_info

                apks.append(item)
        except Exception:
            exstr = traceback.format_exc()
            self.log.error(exstr)
        return apks