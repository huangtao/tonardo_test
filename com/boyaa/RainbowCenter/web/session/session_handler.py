#!/usr/bin/env python
# -*- coding:utf-8 -*-
import tornado.web
from com.boyaa.RainbowCenter.web.handler.session import SessionMixin

class SessionBaseHandler(tornado.web.RequestHandler, SessionMixin):

    def prepare(self):
        pass

    def on_finish(self):
        self.session.flush()