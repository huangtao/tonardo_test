#!/usr/bin/env python
# -*- coding:utf-8 -*- 
#Author: Lucyliu

class BaseException(Exception):
    def __init__(self):
        Exception.__init__(self)

class RainbowCenterException(BaseException):

    def __init__(self, message, code=None):
        BaseException.__init__(self)
        self.message = message
        self.code = code