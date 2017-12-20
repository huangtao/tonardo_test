# -*- coding:utf-8 -*-
"""
Created on 2015.05.07

@author: SissiWu
"""
import os
import glob
import hashlib
import psutil
import shutil
import socket
import subprocess
import time
import traceback

import com.boyaa.RainbowCenter.common.constant as constant

from com.boyaa.RainbowCenter.common.cfg_helper import InitHelper
from com.boyaa.RainbowCenter.common.log_helper import Logger

logger = Logger()
log = logger.get_logger()

cfg_helper = InitHelper(constant.cfg_file_path)


def singleton(cls, *args, **kw):
    instances = {}

    def _singleton():
        if cls not in instances:
            instances[cls] = cls(*args, **kw)
        return instances[cls]

    return _singleton


def get_hostname():
    host_name = socket.getfqdn(socket.gethostname())
    return host_name


def get_ip():
    host_name = get_hostname()
    ip = socket.gethostbyname(host_name)
    return ip


def is_open(ip, port):
    """查看端口占用情况"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((ip, int(port)))
        s.shutdown(2)
        log.debug('%d is open' % port)
        return True
    except:
        log.debug('%d is down' % port)
        return False


def str_to_int(int_str):
    ret = 0
    if int_str:
        ret = int(int_str)
    return ret


def svn_update(path):
    is_update = False
    svn_config = {
        'user_name': cfg_helper.get_value("svn", "svn_user_name", ""),
        'password': cfg_helper.get_value("svn", "svn_password", "")
    }
    cmd = 'svn update --username %(user_name)s --password %(password)s' % svn_config
    cmd_result = popen_has_result(cmd, 'gbk', path)
    print(cmd_result)
    for tmp in cmd_result:
        tmp = tmp.lstrip()
        if tmp.find('U ') == 0 or tmp.find('A ') == 0 or tmp.find('D ') == 0:
            is_update = True
            break
    return is_update


def checkout(url,dest):
    svn_config = {
        'url': url,  # svn地址
        'dest': dest.replace(os.sep, "/"),  # 目标地址
        'user_name': cfg_helper.get_value("svn", "svn_user_name", ""),
        'password': cfg_helper.get_value("svn", "svn_password", "")
    }
    try:
        # cleanup
        if os.path.exists(svn_config['dest']):
            cmd = 'svn cleanup --username %(user_name)s --password %(password)s' % svn_config
            popen(cmd, svn_config['dest'])
    except Exception:
        exstr = traceback.format_exc()
        log.error(exstr)
    # checkout
    cmd = 'svn checkout %(url)s %(dest)s --username %(user_name)s --password %(password)s' % svn_config
    popen(cmd)

# def update(svn_url,dest):
#     svn_config = {
#         'url': svn_url,  # svn地址
#         'dest': dest.replace(os.sep, "/"),  # 目标地址
#         'user_name': cfg_helper.get_value("svn", "svn_user_name", ""),
#         'password': cfg_helper.get_value("svn", "svn_password", "")
#     }
#     cmd = 'svn list --username %(user_name)s --password %(password)s'  % svn_config
#     popen(cmd,svn_url[dest])



def get_path_list_from_svn(url):
    path_list = []
    svn_config = {
        'url': url,  # svn地址
        'user_name': cfg_helper.get_value("svn", "svn_user_name", ""),
        'password': cfg_helper.get_value("svn", "svn_password", "")
    }
    cmd = 'svn ls %(url)s --username %(user_name)s --password %(password)s' % svn_config
    # cmd_result = popen_has_result(cmd, 'gbk')
    cmd_result = popen_has_result(cmd)
    for tmp in cmd_result:
        path_list.append(tmp.strip()[:-1])
    return path_list


def get_revision_from_svn(url):
    revision = 0
    svn_config = {
        'url': url,  # svn地址
        'user_name': cfg_helper.get_value("svn", "svn_user_name", ""),
        'password': cfg_helper.get_value("svn", "svn_password", "")
    }
    cmd = 'svn info %(url)s --username %(user_name)s --password %(password)s' % svn_config
    cmd_result = popen_has_result(cmd, 'gbk')
    for tmp in cmd_result:
        if tmp.find('Last Changed Rev') != -1:
            revision = int(tmp[len("Last Changed Rev:"):].strip())
            break
    return revision


def set_env(env_name, value):
    env = os.environ
    try:
        env[env_name] = value
    except KeyError:
        # 打印日志，设置环境变量失败
        log.error("fail to set %s" % env_name)


def popen_has_result(cmd, coding='utf-8', path=None):
    log.debug("command = %s" % cmd)
    result = []
    p = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         cwd=path)
    lines = p.stdout.readlines()
    retval = p.wait()
    for line in lines:
        line_decode = line.decode(coding)
        result.append(line_decode)
    # log.debug('result = %s' % result)
    return result


# def popen_in_path(cmd, path):
#     log.debug("command = %s" % cmd)
#     log.debug("path = %s" % path)
#     p = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,cwd=path)
#     lines = p.stdout.readlines()
#     retval = p.wait()
#     log.debug('retval = %s' % retval)

def call(cmd, path=None):
    # 父进程等待子进程完成
    log.debug("command = %s" % cmd)
    subprocess.call(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=path)


def popen(cmd, path=None):
    log.debug("command = %s" % cmd)
    if path:
        log.debug("path = %s" % path)
    p = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         cwd=path)
    lines = p.stdout.readlines()
    retval = p.wait()
    log.debug('retval = %s' % retval)


def popen_to_file(cmd, log_path, path=None, is_wait=None):
    log.debug("command = %s" % cmd)
    if path:
        log.debug("path = %s" % path)
    f = open(log_path, 'a')
    progress = subprocess.Popen(cmd, shell=True, stdin=f.fileno(), stdout=f.fileno(), stderr=f.fileno(), cwd=path)
    if is_wait:
        progress.communicate()
    f.flush()
    f.close()
    return progress


def popen_by_os(cmd):
    log.debug("command = %s" % cmd)
    cmd_result = os.popen(cmd).read()
    time.sleep(2)
    log.debug("result = %s" % cmd_result)
    return cmd_result


def kill_process(pid):
    try:
        if not psutil.pid_exists(pid):
            return

        process = psutil.Process(pid)
        for child in process.children(recursive=True):
            child.kill()
        if process.is_running():
            process.kill()
    except Exception as ex:
        exstr = traceback.format_exc()
        print(exstr)

def relative(start, to):
    r_p = os.path.relpath(start, to)
    result = []
    while True:
        t = os.path.split(r_p)
        result.append(t[1])
        if t[0] == '':
            break
        r_p = t[0]
    return result[::-1]

def list_dir(*args):
    path = args[0]
    ret_list = []
    for arg in range(1, len(args)):
        print(str(args[arg]))
        if args[arg] != '.svn':
            path = os.path.join(path, args[arg])
    if os.path.isdir(path):
        ret_list = os.listdir(path)
        for list in ret_list:
            if list == '.svn':
                ret_list.remove(list)
    return ret_list


