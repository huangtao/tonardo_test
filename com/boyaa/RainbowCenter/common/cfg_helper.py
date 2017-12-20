#!/usr/bin/env python
# -*- coding:utf-8 -*- 
#Author: Lucyliu
import codecs
import configparser
import traceback

from com.boyaa.RainbowCenter.common.exception.exception import RainbowCenterException


class InitHelper(object):
    def __init__(self, file_name):
        self.file_name = file_name
        self.cfg = configparser.ConfigParser()
        try:
            self.cfg_handle = codecs.open(self.file_name, "r", "utf-8")
            self.cfg.readfp(self.cfg_handle)
            self.initflag = True
        except:
            self.initflag = False

    def __del__(self):
        if self.initflag:
            self.cfg_handle.close()

    def get_value(self,section, key, default):
        try:
            value = self.cfg.get(section, key)
        except configparser.NoSectionError:
            value = default
        except configparser.NoOptionError:
            value = default
        except Exception:
            value = default
        return value

    def set_value(self, section, key, value):
        write_handle = None
        try:
            write_handle = codecs.open(self.file_name,"w+", "utf-8")
            if not self.cfg.has_section(section):
                self.cfg.add_section(section)
            self.cfg.set(section,key,str(value))
            self.cfg.write(write_handle)
        except Exception:
            exstr = traceback.format_exc()
            raise RainbowCenterException(exstr)
        finally:
            if not write_handle:
                write_handle.close()

