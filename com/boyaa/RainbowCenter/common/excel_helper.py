# -*- coding:utf-8 -*-
"""
Created on 2014.12.22

@author: FoxHu
"""
import os
import xlrd
import xlwt

class WriteExcelHelper(object):
    
    def __init__(self, path):
        self.path = path
        self.wb = xlwt.Workbook()
    
    def create_sheet(self, sheet_name):
        sheet = self.wb.add_sheet(sheet_name)
        return sheet
    
    def write(self, sheet, data):
        row_count = len(data)
        col_count = len(data[0])
        for row in range(0, row_count): 
            col_count = len(data[row]) 
            for col in range(0, col_count):
                sheet.write(row, col, data[row][col])
        self.wb.save(self.path)
        
    def save(self):
        self.wb.save(self.path)

class ReadExcelHelper(object):
    def __init__(self, file_name):
        self.file_name = file_name
        if os.path.exists(self.file_name):
            self.xlrd = xlrd.open_workbook(file_name)
    
    def sheets(self):
        sheets = self.xlrd.sheets()
        return sheets   
    
    def get_cell(self, row, col, sheet_name):    
        sheet = self.xlrd.sheet_by_name(sheet_name)
        return sheet.cell_value(row, col)  
    
    def get_row_datas(self, sheet_name):  
        sheet = self.xlrd.sheet_by_name(sheet_name)
        row = sheet.nrows
        datas = []
        for i in range(row):
            datas.append(sheet.row_values(i))
        return datas
    
    def get_row_data(self, row, sheet_name):  
        sheet = self.xlrd.sheet_by_name(sheet_name)
        return sheet.row_values(row) 
    
    def get_col_data(self, col, sheet_name):  
        sheet = self.xlrd.sheet_by_name(sheet_name)
        return sheet.col_values(col) 
    
    def col_count(self, sheet_name):
        "return used columns count"
        sheet = self.xlrd.sheet_by_name(sheet_name)
        return sheet.ncols
