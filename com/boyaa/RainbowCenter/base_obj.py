"""
Created on 2015.06.15

@author: SissiWu
"""
# -*- coding:utf-8 -*-
# from com import Logger
from com.boyaa.RainbowCenter.common.log_helper import Logger


class BaseObject(object):

    def __init__(self):
        logger = Logger()
        self.log = logger.get_logger()
    
