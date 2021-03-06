#!/usr/bin/env python
# -*- coding:utf-8 -*- 
'''
癞子场界面（正式/测试）
'''
import time
from runcenter.enums import EnumStatus, EnumPriority
from runcenter.testcase import TestCase, debug_run_all
from common.common import Common
from uilib.game_page import Game_Page
from uilib.hall_page import Hall_Page
from uilib.level_page import Level_Page

class D25684_LaiziRoom_Switch(TestCase):
    '''
    天地癞子与普通癞子切换正常
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15
    # pending = True

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.game_page = Game_Page()
        self.level_page = Level_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.hall_page.wait_element("同步标志")
        self.start_step("进入癞子场")
        while self.hall_page.element_is_exist("游戏列表"):
            elments1 = self.hall_page.get_elements("游戏列表")
            ##print len(elments1)
            elments1[1].click()
        self.start_step("查看天地癞子界面")
        self.game_page.element_is_exist("天地癞子")
        self.hall_page.screenshot("天地癞子房间列表.png")
        self.start_step("切换到癞子场")
        self.game_page.wait_element("切换按钮").click()
        elments = self.game_page.get_elements("切换玩法")
        elments[0].click()
        time.sleep(3)
        self.game_page.element_is_exist("天地癞子") == False
        # self.level_page.wait_element("快速开始").click()
        self.game_page.screenshot("癞子场.png")

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

class D25700_LaiziRoom_Buy(TestCase):
    '''
    房间内快捷购买
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15
    # pending = True

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.game_page = Game_Page()
        self.level_page = Level_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.hall_page.wait_element("同步标志")
        self.start_step("进入癞子场")
        while self.hall_page.element_is_exist("游戏列表"):
            elments1 = self.hall_page.get_elements("游戏列表")
            elments1[1].click()
            self.start_step("切换到癞子场")
            self.game_page.wait_element("切换按钮").click()
            elments = self.game_page.get_elements("切换玩法")
            elments[0].click()
            # self.level_page.wait_element("快速开始").click()
        self.start_step("点击初级场房间")
        while self.level_page.element_is_exist("房间列表"):
            self.level_page.wait_element("房间列表").click()
        while self.game_page.element_is_exist("购买金币") == False:
            self.level_page.wait_element("房间列表").click()
        self.start_step("查看金币支付页面")
        self.game_page.wait_element("倍数说明", 40)
        self.game_page.wait_element("购买金币").click()
        while self.game_page.element_is_exist("立即购买") == False:
            self.game_page.screenshot("购买金币.png")
            self.game_page.wait_element("购买金币").click()
        self.game_page.wait_element("立即购买", 60).click()
        self.game_page.screenshot("金币购买界面.png")
        while self.game_page.element_is_exist("购买金币",1)==False:
            try:
                self.luadriver.keyevent(4)
            except:
                self.log_info("未出现支付页面")
        try:
            self.game_page.wait_element("关闭1").click()
        except:
            self.log_info("未出现关闭1按钮")
        self.start_step("记牌器支付页面")
        if self.game_page.element_is_exist("记牌器"):
            self.game_page.wait_element("记牌器").click()
            self.game_page.screenshot("记牌器购买界面.png")
            time.sleep(4)
            elments1 = self.game_page.get_elements("记牌器购买")
            for e in elments1:
                if "钻石" in e.get_attribute("text"):
                    e.click()
                    self.game_page.screenshot("点击记牌器购买界面.png")
                    break
            # self.game_page.get_elements("记牌器购买").click()
            self.game_page.wait_element("立即购买").click()
            self.game_page.screenshot("立即购买界面.png")
            self.game_page.wait_element("关闭1").click()
        else:
            self.log_info("未出现记牌器按钮")

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

class D25685and25686_LaiziRoom_Effect(TestCase):
    '''
    金币推荐场次特效
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15

    # pending = True

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.level_page = Level_Page()
        self.game_page = Game_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.start_step("进去癞子场")
        while self.hall_page.element_is_exist("游戏列表"):
            elments1 = self.hall_page.get_elements("游戏列表")
            elments1[1].click()
            self.game_page.wait_element("切换按钮").click()
            elments = self.game_page.get_elements("切换玩法")
            elments[0].click()
            self.level_page.wait_element("快速开始").click()
        self.start_step("查看场次特效")
        self.game_page.screenshot("场次界面特效_1.png", sleeptime=2)
        self.game_page.screenshot("场次界面特效_2.png", sleeptime=0)
        self.game_page.screenshot("场次界面特效_3.png", sleeptime=0)

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

class D25697_LaiziRoom_Talk_Display(TestCase):
    '''
    房间内聊天
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15
    # pending = True

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.game_page = Game_Page()
        self.level_page = Level_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.start_step("进去癞子场")
        while self.hall_page.element_is_exist("游戏列表"):
            elments1 = self.hall_page.get_elements("游戏列表")
            elments1[1].click()
            self.game_page.wait_element("切换按钮").click()
            elments = self.game_page.get_elements("切换玩法")
            elments[0].click()
            # self.level_page.wait_element("快速开始").click()
        self.start_step("进入房间")
        while self.level_page.element_is_exist("房间列表"):
            self.level_page.wait_element("房间列表").click()
        while self.game_page.element_is_exist("常用语聊天列表") == False:
            self.game_page.wait_element("聊天").click()
        self.game_page.wait_element("常用语聊天列表").click()
        self.game_page.screenshot("常用语聊天.png", sleeptime=0)
        while self.game_page.element_is_exist("常用表情tab") == False:
            self.game_page.wait_element("聊天").click()
        self.game_page.wait_element("常用表情tab").click()
        self.game_page.wait_element("表情1").click()
        self.game_page.screenshot("常用表情聊天.png", sleeptime=0)
        while self.game_page.element_is_exist("常用语tab") == False:
            self.game_page.wait_element("聊天").click()
        self.game_page.wait_element("常用语tab").click()
        text = self.common.random_str(5)
        self.game_page.wait_element("输入聊天信息").send_keys(text)
        self.game_page.wait_element("输入聊天信息").click()
        self.game_page.wait_element("发送").click()
        self.game_page.screenshot("发送自定义聊天信息.png")
        self.start_step("退出玩牌房间")
        self.game_page.is_in_gameroom(self.luadriver)

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

class D25748_LaiziRoom_Money_Display(TestCase):
    '''
    房间金币元宝显示
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15
    pending = True

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.game_page = Game_Page()
        self.level_page = Level_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.hall_page.wait_element("同步标志")
        self.start_step("进去癞子场")
        while self.hall_page.element_is_exist("游戏列表"):
            elments1 = self.hall_page.get_elements("游戏列表")
            elments1[1].click()
            self.game_page.wait_element("切换按钮").click()
            elments = self.game_page.get_elements("切换玩法")
            elments[0].click()
            # self.level_page.wait_element("快速开始").click()
        self.start_step("进入房间")
        while self.level_page.element_is_exist("房间列表"):
            self.level_page.wait_element("房间列表").click()
        time.sleep(5)
        self.game_page.screenshot("金币元宝显示.png")
        elment1 = self.game_page.wait_element("购买金币")
        text = self.common.image_text(elment1)
        self.log_info("text:" + text)
        if text.isdigit():
            self.start_step("界面获取的金币数目为：%s" % text)
        self.game_page.is_in_gameroom(self.luadriver)

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

class D25703_LaiziRoom_Change_Table(TestCase):
    '''
    换桌
    '''
    owner = "LucyLiu"
    status = EnumStatus.Design
    priority = EnumPriority.High
    timeout = 15

    def pre_test(self):
        self.common = Common()
        self.hall_page = Hall_Page()
        self.game_page = Game_Page()
        self.level_page = Level_Page()
        self.start_step("初始化driver")
        self.luadriver = self.common.setupdriver()
        self.common.closeactivity()
        self.common.user_money(money=1000)

    def run_test(self):
        self.hall_page.wait_element("同步标志")
        self.start_step("进去癞子场")
        while self.hall_page.element_is_exist("游戏列表",1):
            elments1 = self.hall_page.get_elements("游戏列表")
            elments1[1].click()
            self.game_page.wait_element("切换按钮").click()
            elments = self.game_page.get_elements("切换玩法")
            elments[0].click()
            # self.level_page.wait_element("快速开始").click()
        self.start_step("进入房间")
        while self.level_page.element_is_exist("房间列表"):
            self.level_page.wait_element("房间列表").click()
        time.sleep(6)
        self.game_page.wait_element("换桌").click()
        self.level_page.screenshot("换桌.png",sleeptime=0)
        self.level_page.screenshot("换桌1.png",sleeptime=1)
        self.start_step("退出玩牌房间")
        self.game_page.is_in_gameroom(self.luadriver)

    def post_test(self):
        try:
            self.game_page.is_in_gameroom(self.luadriver)
        finally:
            self.common.closedriver()

__qtaf_seq_tests__ = [D25700_LaiziRoom_Buy]
if __name__ == '__main__':
    # C039_DFQP_Activity = C039_DFQP_Activity()
    # C039_DFQP_Activity.debug_run()
    debug_run_all()


