"""
Created on 2015.05.22
@author: SissiWu
"""
import tornado.web

from com.boyaa.RainbowCenter.web.handler.base import BaseHandler

class PageNotFoundHandler(BaseHandler):
    def get(self):
        raise tornado.web.HTTPError(404)