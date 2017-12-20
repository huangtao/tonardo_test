#!/usr/bin/env python
# -*- coding:utf-8 -*-
import os
import tornado.ioloop
import tornado.web
from tornado.httpserver import HTTPServer
from tornado.options import define, options, parse_command_line
import com.boyaa.RainbowCenter.common.constant as constant
from com.boyaa.RainbowCenter.manager.device_manager import DeviceManager
from com.boyaa.RainbowCenter.web.handler.auth import LoginHandler, LogoutHandler
from com.boyaa.RainbowCenter.web.handler.case import CaseHandler
from com.boyaa.RainbowCenter.web.handler.error import PageNotFoundHandler
from com.boyaa.RainbowCenter.web.handler.log import LogHandler
from com.boyaa.RainbowCenter.web.handler.main import MainHandler
from com.boyaa.RainbowCenter.web.handler.plan import PlanHandler
from com.boyaa.RainbowCenter.web.handler.system import SystemHandler

define("port", default=constant.port, help="run on the given port", type=int)
class Application(tornado.web.Application):
    def __init__(self):
        settings = {
            "static_path" : os.path.join(os.path.dirname(__file__), "web" + os.sep +"static"),
            "template_path": os.path.join(os.path.dirname(__file__), "web" + os.sep + "html"),
            "cookie_secret": "e446976943b4e8442f099fed1f3fea28462d5832f483a0ed9a3d5d3859f==78d",
            "session_secret" : "3cdcb1f00803b6e78ab50b466a40b9977db396840c28307f428b25e2277f1bcc",
            "login_url" : "/login/to_login",
            "title" : "自动化测试平台"
        }

        handlers = [
            (r"/", MainHandler),
            (r"/case/(\w+)", CaseHandler),
            # (r"/device/(\w+)", DeviceHandler),
            # (r"/download/(\w+)", DownloadHandler),
            (r"/login/(\w+)", LoginHandler),
            (r"/logout", LogoutHandler),
            (r"/log/(\w+)", LogHandler),
            (r"/main/(\w+)", MainHandler),
            (r"/plan/(\w+)", PlanHandler),
            # (r"/report/(\w+)", ReportHandler),
            (r"/system/(\w+)", SystemHandler),
            # (r"/user/(\w+)", UserHandler),
            # (r"/operation/(\w+)", OperationHandler),
            (r".*", PageNotFoundHandler)
        ]

        session_settings = dict(
            driver = "memory",
            driver_settings = dict(
                host = self,
            ),
            force_persistence = True,
        )
        settings.update(session=session_settings)
        tornado.web.Application.__init__(self, handlers, **settings)

tornado.web.ErrorHandler = PageNotFoundHandler

if __name__ == "__main__":
    device_manager = DeviceManager()

    online_device_ids = device_manager.get_online_device_ids()
    devices = device_manager.get_devices()
    for device in devices:
        device_id = device['id']
        if device_id not in online_device_ids:
            device_manager.update_status(device_id, constant.device_status_offline)
        else:
            device_manager.update_status(device['id'], constant.device_status_waiting)


    options.logging = 'debug'
    parse_command_line()

    app = Application()
    http_server = HTTPServer(app, xheaders=True)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()