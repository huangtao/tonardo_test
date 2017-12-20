#!/usr/bin/env python
# -*- coding:utf-8 -*-

from com.boyaa.RainbowCenter.base_obj import BaseObject
from com.boyaa.RainbowCenter.common.db_helper import MySQLDB
from com.boyaa.RainbowCenter.manager.log_manager import LogManager


class BaseManager(BaseObject):

    def __init__(self):
        BaseObject.__init__(self)
        self.db = MySQLDB()
        self.log_manager = LogManager()

