@echo off
set db_name=rainbow_center
set db_user_name=root
set db_password=123456
set "Ymd=%date:~,4%%date:~5,2%%date:~8,2%"
set backup_folder=D:\db_backup
set backup_file_name=%db_name%_%Ymd%.sql

if not exist %backup_folder% md %backup_folder%
mysqldump --opt -u%db_user_name% -p%db_password% %db_name% > %backup_folder%\%backup_file_name%
@echo on