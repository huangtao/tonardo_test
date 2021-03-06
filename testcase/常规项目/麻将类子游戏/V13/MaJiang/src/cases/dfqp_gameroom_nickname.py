#!/usr/bin/env python
# -*- coding:utf-8 -*-
'''
牌桌昵称
'''
import time
from runcenter.enums import EnumPriority,EnumStatus
from runcenter.testcase import debug_run_all,TestCase
from uilib.hall_page import Hall_Page
from uilib.personinfo_page import Personinfo_Page
from uilib.game_page import Game_Page
from uilib.yuepai_page import Yuepai_Page
from common.common import Common
import common.Interface as PHPInterface

class C27399_Nickname_Sixchar(TestCase):
    '''
    牌局中查看个人昵称1-6个英文或者其他特殊字符显示
    '''
    owner = "Lucyliu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 10
    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.personinfo_page =Personinfo_Page()
        self.game_page=Game_Page()
        self.yuepai_page =Yuepai_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        # 每个用例都需要关闭活动，把这个放在初始化里面实现
        self.common.closeactivity(self.luadriver)

    def see_nickname(self,is_next = False):
        game_list = self.game_page.get_game_list()
        for i in range(len(game_list)):
            self.start_step("进入子游戏:%s" % game_list[i].get_attribute("name"))
            game_list[i].click()
            if (self.game_page.game_is_download() == False):
                self.log_info("下载游戏ID：%s 失败" % game_list[i])
                self.game_page.screenshot("%s_downfail.png" % game_list[i])
                try:
                    self.hall_page.wait_element("关闭对话框").click()
                except:
                    ##print "关闭弹框"
                continue
            try:
                self.game_page.wait_element("同步标志", 20)
                self.log_info("进入游戏ID：%s 的房间" % game_list[i].get_attribute("name"))
                try:
                    self.log_info("进入游戏ID：%s 的第一个玩法" % game_list[i])
                    elements = self.game_page.game_play_way()
                    elements[0][1].click()
                except:
                    self.log_info("当前子游戏初级场")
                self.game_page.wait_element("房间场次").click()
                starttime = time.time()
                while self.game_page.element_is_exist("头像frame") ==False:
                    time.sleep(1)
                    endtime = time.time()
                    if (endtime-starttime)/1000 > 20:
                        break
                self.game_page.screenshot("%s_nickname.png" % game_list[i].get_attribute("name"))
            except:
                try:
                    self.hall_page.wait_element("关闭对话框").click()
                except:
                    self.log_info("未找到元素")
            try:
                self.start_step("退出房间")
                self.yuepai_page.is_exist_yuepairoom()
                self.game_page.wait_element("返回1").click()
                if is_next == True:
                    self.log_info("is_next为True则表示遍历的是第二页的子游戏")
                    try:
                        self.game_page.wait_element("右三角标").click()
                    except:
                        self.log_info("当前为第二页")
            except:
                self.log_info("未找到元素")


    def run_test(self):
        '''
        测试用例
        '''
        self.start_step("等待页面加载完成")
        self.hall_page.wait_element("同步标志")
        self.hall_page.wait_element("头像").click()
        self.start_step("修改用户名")
        nickname = self.common.random_str(6)
        ##print nickname
        self.personinfo_page.wait_element("设置用户名").send_keys(nickname)
        self.personinfo_page.wait_element("修改用户名").click()
        #点击页面其他元素，设置保存
        self.personinfo_page.wait_element("了解VIP特权").click()
        self.personinfo_page.screenshot('NicknameAlter.png')
        self.personinfo_page.wait_element("关闭").click()
        self.start_step("进入子游戏查看头像")
        self.start_step("获取首屏子游戏列表")
        self.see_nickname()
        while (self.hall_page.element_is_exist("同步标志") == False):
            self.game_page.wait_element("返回1").click()
        self.start_step("点击大厅第二页")
        if (self.game_page.element_is_exist("右三角标") == True):
            self.game_page.wait_element("右三角标").click()
        else:
            self.game_page.wait_element("左三角标").click()
        self.start_step("获取第二页的子游戏")
        self.see_nickname(is_next=True)

    def post_test(self):
        '''
        测试用例执行完成后，清理测试环境
        '''
        self.common.closedriver()

class C27400_Nickname_Morechar(TestCase):
    '''
    牌局中查看个人昵称7-12个英文或者其他特殊字符、表情显示
    '''
    owner = "Lucyliu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 10
    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.personinfo_page =Personinfo_Page()
        self.game_page=Game_Page()
        self.yuepai_page =Yuepai_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        # 每个用例都需要关闭活动，把这个放在初始化里面实现
        self.common.closeactivity(self.luadriver)

    def see_nickname(self,is_next = False):
        game_list = self.game_page.get_game_list()
        for i in range(len(game_list)):
            self.start_step("进入子游戏:%s" % game_list[i].get_attribute("name"))
            game_list[i].click()
            if (self.game_page.game_is_download() == False):
                self.log_info("下载游戏ID：%s 失败" % game_list[i])
                self.game_page.screenshot("%s_downfail.png" % game_list[i])
                try:
                    self.hall_page.wait_element("关闭对话框").click()
                except:
                    ##print "关闭弹框"
                continue
            try:
                self.game_page.wait_element("同步标志", 20)
                self.log_info("进入游戏ID：%s 的房间" % game_list[i].get_attribute("name"))
                try:
                    self.log_info("进入游戏ID：%s 的第一个玩法" % game_list[i])
                    elements = self.game_page.game_play_way()
                    elements[0][1].click()
                except:
                    self.log_info("当前子游戏初级场")
                self.game_page.wait_element("房间场次").click()
                starttime = time.time()
                while self.game_page.element_is_exist("头像frame") ==False:
                    time.sleep(1)
                    endtime = time.time()
                    if (endtime-starttime)/1000 > 20:
                        break
                self.game_page.screenshot("%s_nickname.png" % game_list[i].get_attribute("name"))
            except:
                try:
                    self.hall_page.wait_element("关闭对话框").click()
                except:
                    self.log_info("未找到元素")
            try:
                self.start_step("退出房间")
                self.yuepai_page.is_exist_yuepairoom()
                self.game_page.wait_element("返回1").click()
                if is_next == True:
                    self.log_info("is_next为True则表示遍历的是第二页的子游戏")
                    try:
                        self.game_page.wait_element("右三角标").click()
                    except:
                        self.log_info("当前为第二页")
            except:
                self.log_info("未找到元素")


    def run_test(self):
        '''
        测试用例
        '''
        self.start_step("等待页面加载完成")
        self.hall_page.wait_element("同步标志")
        self.hall_page.wait_element("头像").click()
        self.start_step("修改用户名")
        nickname = self.common.random_str(12)
        ##print nickname
        self.personinfo_page.wait_element("设置用户名").send_keys(nickname)
        self.personinfo_page.wait_element("修改用户名").click()
        #点击页面其他元素，设置保存
        self.personinfo_page.wait_element("了解VIP特权").click()
        self.personinfo_page.screenshot('NicknameAlter.png')
        self.personinfo_page.wait_element("关闭").click()
        self.start_step("进入子游戏查看头像")
        self.start_step("获取首屏子游戏列表")
        self.see_nickname()
        while (self.hall_page.element_is_exist("同步标志") == False):
            self.game_page.wait_element("返回1").click()
        self.start_step("点击大厅第二页")
        if (self.game_page.element_is_exist("右三角标") == True):
            self.game_page.wait_element("右三角标").click()
        else:
            self.game_page.wait_element("左三角标").click()
        self.start_step("获取第二页的子游戏")
        self.see_nickname(is_next=True)

    def post_test(self):
        '''
        测试用例执行完成后，清理测试环境
        '''
        self.common.closedriver()

# __qtaf_seq_tests__=[C27400_Nickname_Morechar]
if __name__ == '__main__':
    # C039_DFQP_Activity = C039_DFQP_Activity()
    # C039_DFQP_Activity.debug_run()
    debug_run_all()
