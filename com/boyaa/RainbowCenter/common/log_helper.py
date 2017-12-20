#!/usr/bin/env python
# -*- coding:utf-8 -*-
#Author: Lucyliu
import logging.handlers
import os
import time
import com.boyaa.RainbowCenter.common.constant as constant
from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper

global_logger = None

class Logger(object):
    def __init__(self):
        self.cfg = InitHelper(constant.cfg_file_path)
        self.__init_logger()

        log_path = self.__get_log_file()
        self.file_handler = logging.handlers.RotatingFileHandler(log_path,maxBytes=1024*1024,backupCount=5)

        self.console_handler = logging.StreamHandler()

        self.__set_log_level()
        self.__set_formatter()
        self.__set_filter()

        global_logger.addHandler(self.file_handler)
        global_logger.addHandler(self.console_handler)

    def get_logger(self):
        return global_logger

    def __init_logger(self):
        global global_logger

        if global_logger is None:
            global_logger = logging.getLogger("RainbowCenter")
        else:
            logging.shutdown()
            global_logger.handlers = []

    def __get_log_file(self):
        log_path = constant.log_path
        if not os.path.exists(log_path):
            os.mkdir(log_path)

        log_file = log_path + "\\" + time.strftime('%Y-%m-%d',time.localtime(time.time())) + ".log"
        return log_file

    def __set_formatter(self):
        pattern = "%(asctime)s %(filename)s methed:%(funcName)s line:%(lineno)s %(levelname)s - %(message)s"
        print(pattern)
        formatter = logging.Formatter(pattern,"%Y-%m-%d %H:%M:%S")
        self.file_handler.setFormatter(formatter)
        self.console_handler.setFormatter(formatter)

    def __set_filter(self):
        log_filter = LogFilter("RainbowCenter")
        self.file_handler.addFilter(log_filter)
        self.console_handler.addFilter(log_filter)
        global_logger.addFilter(log_filter)

    def __set_log_level(self):
        numeric_level = logging.ERROR
        level = self.cfg.get_value("log","log_Level","DEBUG").upper()
        log_levels = {}
        log_levels["CRITICAL"] = logging.CRITICAL
        log_levels["ERROR"] = logging.ERROR
        log_levels["WARNING"] = logging.WARN
        log_levels["INFO"] = logging.INFO
        log_levels["DEBUG"] = logging.DEBUG

        if level in log_levels:
            numeric_level = log_levels[level]

        global_logger.setLevel(numeric_level)
        self.file_handler.setLevel(numeric_level)
        self.console_handler.setLevel(numeric_level)

class LogFilter(logging.Filter):
    def __init__(self, filter_str):
        self.filter_str = filter_str

    def filter(self, record):
        ret = True

        return ret
