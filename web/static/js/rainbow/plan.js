function init_index(){
	active_tab('plan');
	//click product
	$("#select_product").change(function(){
		change_product(this);
	});
	
    //只显示“我”创建的计划
    $('#cb_only_for_me').click(function(){
    	get_plans();
    });
    
    
	$("a[id^=plan_]").each(function(){
	    $(this).click(function(){
	    	var plan_id = $(this).attr("id").replace("plan_", "");
	    	get_plan_detail(plan_id);
	    });
	});
	
	$("a[id^=progress_detail_]").each(function(){
	    $(this).click(function(){
	    	to_progress_detail(this);
	    });
	});
	
	//每30s刷新一次
	var has_alert = false;
	setInterval(function() {
		get_plans();
	}, 30000);
}

function get_plans(){
	var product_id = $('#select_product').val();
	var project_id = $('#select_project').val();
	
	var only_for_me = 0;//0表示显示所有测试计划；1表示只显示当前用户创建的测试计划
	if($('#cb_only_for_me').prop("checked") == true){
		only_for_me = 1;
	}
	
    //json data
	var data = {
		product_id : product_id,
		project_id : project_id,
		only_for_me : only_for_me
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_plans',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
//        	var sum_execute_times = data['result']['sum_execute_times'];
//        	$('#sum_execute_times').val('计划共运行' + sum_execute_times + '次');
        	
        	var plan_list = data['result']['plan_list'];
        	draw_tb_plan_list(plan_list);
        },
        error: function (request, error, errorThrown) {
        	if (request.status == 403){
        		window.location.href = '/plan/index'
        	} else {
        		if (has_alert == false){
        			show_danger('系统错误，请通知管理员');
        			has_alert = true;
        		}
        	}
        }
    });
}


function init_report_detail(){
	active_tab('report');
	var str = $.get_url_var('report_id');
	var report_id = str.split(",")[0];
	get_rel_cases(report_id, -1);
	
	$('#select_case_status').change(function(){
		var case_status = $(this).val();
		get_rel_cases(report_id, case_status);
	});
	
	//每30s刷新一次
	var has_alert = false;
	setInterval(function() {
		var case_status = $('#select_case_status').val();
	    //json data
		var data = {
			report_id : report_id,
			case_status : case_status
		};
		var json_data = JSON.stringify(data);
		
	    $.ajax({
	        url: 'report_detail',
	        type: 'POST',
	        data: json_data,
	        success: function (data) {
	        	if (error_message(data) == true){
	        		window.location.href = '/plan/index';
	        	}
	        	var result = data['result'];
	        	var case_list = result['case_list'];
	        	var plan = result['plan'];
	        	var report = result['report'];
	        	draw_tb_report_summary(plan, report);
	        	draw_tb_rel_case_list(case_list);
	        },
	        error: function (request, error, errorThrown) {
	        	if (request.status == 403){
	        		window.location.href = '/plan/to_report_detail?report_id=' + report_id;
	        	} else {
	        		if (has_alert == false){
	        			show_danger('系统错误，请通知管理员');
	        			has_alert = true;
	        		}
	        	}
	        }
	    });
	}, 30000);
}

function change_case_status(select_status){
	var status_list = [];
	status_list[0] = {'id' : 0, 'name' : '等待'};
	status_list[1] = {'id' : 1, 'name' : '执行'};
	status_list[2] = {'id' : 2, 'name' : '成功'};
	status_list[3] = {'id' : 3, 'name' : '失败'};
	var first_item = {'id' : -1, 'name' : '全部'};
	
	var select_str = '';
	switch(select_status){
	case 0:
		select_str = '等待';
		break;
	case 1:
		select_str = '执行';
		break;
	case 2:
		select_str = '成功';
		break;
	case 3:
		select_str = '失败';
		break;
	case -1:
		select_str = '全部';
		break;
	}
	
	change_select('select_case_status', status_list, first_item, select_str);
}

function get_rel_cases_by_status(case_status){
	var str = $.get_url_var('report_id');
	var report_id = str.split(",")[0];
	change_case_status(case_status);
	get_rel_cases(report_id, case_status);
}

function get_rel_cases(report_id, case_status){
    //json data
	var data = {
		report_id : report_id,
		case_status : case_status
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'report_detail',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var case_list = result['case_list'];
        	var plan = result['plan'];
        	var report = result['report'];
        	draw_tb_report_summary(plan, report);
        	draw_tb_rel_case_list(case_list);
        },
        error: function (request, error, errorThrown) {
        	if (request.status == 403){
        		window.location.href = '/plan/to_report_detail?report_id=' + report_id;
        	} else {
        		show_danger('系统错误，请通知管理员');
        	}
        }
    });
}

function init_plan_detail(){
	active_tab('plan');
}

function init_modify_plan(plan_type){
	active_tab('plan');
	$('#modal_progress').modal("hide");
	var str = $.get_url_var('plan_id');
	var plan_id = str.split(",")[0];
    //json data
	var data = {
		plan_id : plan_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_plan_detail',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	var plan = data['result']['plan'];
        	$("#txt_plan_name").val(plan['plan_name']);
        	$("#txt_product_name").val(plan['product_name']);
        	$("#txt_project_name").val(plan['project_name']);
        	$("#txt_project_id").val(plan['project_id']);
        	$("#txt_plan_desc").val(plan['desc']);
        	
        	//计划执行方式相关控件初始化
			var execute_mode = plan['execute_mode'];
			if (execute_mode == 1){//立即执行
				$('#rd_exec_immi').radiocheck('check');
			} else if (execute_mode == 2){//周期执行
				$('#rd_exec_regular').radiocheck('check');
				$('#txt_cron_hour').val(plan['hour']);
				$('#txt_cron_min').val(plan['min']);
				$('#txt_cron_hour').attr("disabled", false);
				$('#txt_cron_min').attr("disabled", false);
				$('#txt_once_hour').attr("disabled", true);
				$('#txt_once_min').attr("disabled", true);
			} else if (execute_mode == 3){//定时执行
				$('#rd_exec_once').radiocheck('check');
				$('#txt_once_hour').val(plan['hour']);
				$('#txt_once_min').val(plan['min']);
				$('#txt_cron_hour').attr("disabled", true);
				$('#txt_cron_min').attr("disabled", true);
				$('#txt_once_hour').attr("disabled", false);
				$('#txt_once_min').attr("disabled", false);
			}
			init_execute_mode();

			var to_user_list = data['result']['to_user_list'];
        	if (to_user_list != null && to_user_list.length != 0){
        		var user_ids = '';
        		for (var i in to_user_list){
        			user_ids +=  ',' + to_user_list[i]['id'];
        		}
        		$('#txt_tos').val(user_ids.substr(1, user_ids.length-1));
        	}
			
//        	var device_list = data['result']['device_list'];
//        	change_select('select_device', device_list, {'id' : 0, 'name' : '选择Device'}, plan['device_name']);
        	
        	var appium_type = plan['appium_type'];
        	var appium_list = [{'id' : 1, 'name' : '原生'}, {'id' : 2, 'name' : 'LUA'}];
        	var appium_select_item = '原生';
        	if (appium_type == 1){
        		appium_select_item = '原生';
        	} else if (appium_type == 2){
        		appium_select_item = 'LUA';
        	}
        	change_select('select_appium_type', appium_list, {'id' : 0, 'name' : '选择Appium类型'}, appium_select_item);
        	
        	apk_list = data['result']['apk_list'];
        	var tmp_apk_list = [];
        	for (var i in apk_list) {
        		var tmp = {'id' : apk_list[i]['id'], 'name' : apk_list[i]['file_name']};
        		tmp_apk_list[i] = tmp;
        	}
        	
        	if (plan_type == 1){//功能测试用例
        		change_select('select_apk', tmp_apk_list, {'id' : 0, 'name' : '选择待测APK'}, plan['apk_name']);
        		//select version
        		$('#select_version').change(function(){
        			change_version(this);
        		});
        		var version_list = data['result']['version_list'];
            	var tmp_version_list = [];
            	for (var i in version_list) {
            		var tmp = {'id' : version_list[i]['id'], 'name' : version_list[i]['svn_version']};
            		tmp_version_list[i] = tmp;
            	}
            	change_select('select_version', tmp_version_list, {'id' : 0, 'name' : '选择版本'}, plan['svn_version']);
        	} else if (plan_type == 2){//升级测试用例
        		change_select('select_apk', tmp_apk_list, {'id' : 0, 'name' : '选择待升级APK'}, plan['apk_name']);
        		$('#txt_version_id').val(plan['version_id']);
        		
        		package_list = data['result']['package_list'];
            	var selected_item = package_list[0];
//            	$('#txt_package').val(selected_item['file_name']);
//            	$('#txt_package_id').val(selected_item['id']);
            	var tmp_package_list = [];
            	for (var i in package_list){
            		var tmp = {'id' : package_list[i]['id'], 'name' : package_list[i]['file_name']};
            		tmp_package_list[i] = tmp;
            	}
            	change_select('select_package', tmp_package_list, {'id' : 0, 'name' : '选择升级包'}, plan['package_name']);
            	
            	$('#lb_package_info').text(plan['package_desc']);
            	//select package
            	$('#select_package').change(function(){
            		change_package(this);
            	});
        	}
        	
        	$('#lb_apk_info').text(plan['apk_desc']);
        	//select apk
        	$('#select_apk').change(function(){
        		change_apk(this);
        	});
        	
        	var env_type = plan['env_type'];
        	var env_list = [{'id' : 1, 'name' : '测试环境'}, {'id' : 3, 'name' : '预发布环境'}];
        	var evn_select_item = '测试环境';
        	if (env_type == 1){
        		evn_select_item = '测试环境';
        	} else if (env_type == 2){
        		evn_select_item = '正式环境';
        	} else if (env_type == 3){
        		evn_select_item = '预发布环境';
        	}
        	change_select('select_env_type', env_list, {'id' : 2, 'name' : '正式环境'}, evn_select_item);

        	var case_list = data['result']['case_list'];
        	draw_tb_case_list_for_modify(case_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

/**
 * 创建测试计划
 */
function init_create_plan(plan_type){
	active_tab('plan');
	$('#modal_progress').modal("hide");
    //json data
	var data = {
		plan_type : plan_type
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'init_create_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	//init product_dropdown
        	var product_list = data['result']['product_list'];
        	init_product_dropdown(product_list, plan_type);
        	
        	if (plan_type == 2){
        		var project_list = data['result']['project_list'];
            	change_select('select_project', project_list, {'id' : 0, 'name' : '选择所属项目'}, '');
        	}
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
    
    //select product
	$('#select_product').change(function(){
		change_product(this);
	});
	
    //select project
	$('#select_project').change(function(){
		change_project(this, plan_type);
	});
	
	//select version
	$('#select_version').change(function(){
		change_version(this);
	});
	
	//select apk
	$('#select_apk').change(function(){
		change_apk(this);
	});
	
	//select package
	$('#select_package').change(function(){
		change_package(this);
	});

//    //check/uncheck -- suite
//    $("#cb_suites").click(function(){
//    	if($(this).prop("checked") == true){
//    		$("input[id^=cb_suite_]").each(function() {
//    			$(this).attr("checked", true);
//    		});
//    	} else {
//    		$("input[id^=cb_suite_]").each(function() {
//    			$(this).removeAttr("checked");
//    		});
//    	}
//    });

	//计划执行方式相关控件初始化
	init_execute_mode();
	
    //计划名称输入框失去焦点时
    $("#txt_plan_name").blur(function(){
    	check_plan_exist();
    });
}

function init_execute_mode(){
	//radio
	$('#rd_exec_immi').change(function() {
		if($(this).prop("checked") == true){
			$('#txt_cron_hour').attr("disabled", true);
			$('#txt_cron_min').attr("disabled", true);
			$('#txt_once_hour').attr("disabled", true);
			$('#txt_once_min').attr("disabled", true);
		}
	});
   
	$('#rd_exec_regular').change(function() {
		if($(this).prop("checked") == true){
			$('#txt_cron_hour').attr("disabled", false);
			$('#txt_cron_min').attr("disabled", false);
			$('#txt_once_hour').attr("disabled", true);
			$('#txt_once_min').attr("disabled", true);
		}
	});
   
	$('#rd_exec_once').change(function() {
		if($(this).prop("checked") == true){
			$('#txt_cron_hour').attr("disabled", true);
			$('#txt_cron_min').attr("disabled", true);
			$('#txt_once_hour').attr("disabled", false);
			$('#txt_once_min').attr("disabled", false);
		}
	});
}

//创建功能测试计划
function to_create_function_plan(){
	window.location.href = "/plan/to_create_function_plan";
}

//创建升级测试计划
function to_create_upgrade_plan(){
	window.location.href = "/plan/to_create_upgrade_plan";
}

function to_modify_plan(from){
	var plan_id = 0;
	if (from == 1){//计划列表页面
		var plan_ids = [];
		$("input[id^=cb_plan_]").each(function() {
			if($(this).prop("checked") == true){
				var plan_id = $(this).attr("id").replace("cb_plan_", "");
				plan_ids.push(plan_id);
			}
		});
		
		if (plan_ids.length == 0 || plan_ids.length > 1){
			show_warning("请选择一个待修改计划。");
			return;
		}
		plan_id = plan_ids[0];
	} else if (from == 2) {//详情页面
		var str = $.get_url_var('plan_id');
		plan_id = str.split(",")[0];
	}
	
	//json data
	var data = {
		plan_id : plan_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'check_modify_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	window.location.href = "/plan/to_modify_plan?plan_id=" + plan_id;
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
	
}

function modify_plan(plan_type){
	var version_id = 0;
	var upgrade_package_id = 0;
	if (plan_type == 1){
		version_id = $('#select_version').val();
		if (version_id == '0'){
			show_warning('请选择版本');
			return false;
		}
	} else if (plan_type == 2){
		version_id = $('#txt_version_id').val();
		upgrade_package_id = $('#select_package').val();
//		upgrade_package_id = $('#txt_package_id').val();
	}
	
	if (check_execute_mode() == false){
		return false
	}

	var str = $.get_url_var('plan_id');
	var plan_id = str.split(",")[0];
	var plan_desc = $("#txt_plan_desc").val();
	if (plan_desc != ""){
		if (plan_desc.length > 100){
			show_warning('计划描述的字符长度不能超过100');
			return false;
		}
	}
	
	var case_ids = [];
	$('#tb_rel_case_list tbody tr').each(function(){
		if(typeof($(this).attr('id')) != 'undefined'){
			var case_id = $(this).attr("id").replace("case_", "");
			case_ids.push(case_id);
		}
	});
	if (case_ids.length == 0){
		show_warning("请选择待测试用例。");
		return false;
	}
	
	//执行方式，其中：0为不执行；1为立即执行；2为周期执行；3为定时执行
	var execute_mode = 0;
	var hour = 0;
	var min = 0;
	if($("#rd_exec_immi").prop("checked") == true){
		execute_mode = 1;//立即执行
	} else if ($("#rd_exec_regular").prop("checked") == true){
		execute_mode = 2;//周期执行
		hour = $('#txt_cron_hour').val();
		min = $('#txt_cron_min').val();
	} else if ($("#rd_exec_once").prop("checked") == true){
		execute_mode = 3;//定时执行
		hour = $('#txt_once_hour').val();
		min = $('#txt_once_min').val();
	}
	var apk_id = $('#select_apk').val();
	
    $.ajax({
        url: 'check_package',
        type: 'POST',
        data: JSON.stringify({plan_type : plan_type, apk_id : apk_id, package_id : upgrade_package_id}),
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	//json data
        	var data = {
        		case_ids : case_ids,
        		plan_id : plan_id,
        		version_id : version_id,
        		plan_desc : plan_desc,
        		execute_mode : execute_mode,
        		hour : hour,
        		min : min,
        		appium_type : $('#select_appium_type').val(),
        		env_type : $('#select_env_type').val(),
        		apk_id : apk_id,
        		tos : $('#txt_tos').val(),
        		plan_type : plan_type,
        		upgrade_package_id : upgrade_package_id
        	};
        	
        	var json_data = JSON.stringify(data);
        	$('#modal_progress').modal("show");
            $.ajax({
                url: 'modify_plan',
                type: 'POST',
                data: json_data,
                success: function (data) {
                	if (error_message(data) == true){
                		window.location.href = '/plan/index';
                		return;
                	}
                	
                	var plan = data['result']['plan'];
                	var plan_type = plan['plan_type'];
                	if (plan_type == 2 &&　plan['create_incre_file'] == true){//升级测试计划
                		create_incre_file(plan['plan_id'], 2);
                	} else {
                		$('#modal_progress').modal('hide');
                		show_info("修改计划成功");
                		window.location.href = "/plan/index";
                	}
                	
//                	$('#modal_progress').modal("hide");
//                	show_info("修改计划成功");
//                	window.location.href = '/plan/index';
                },
                error: function () {
                	$('#modal_progress').modal("hide");
                    show_danger('系统错误，请通知管理员');
                }
            });
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function check_plan_info(){
	var plan_name = trim($("#txt_plan_name").val());
	if (trim(plan_name) == ""){
		show_warning("计划名称不能为空。");
		$('#txt_plan_name').focus();
		return false;
	} else {
		if (plan_name.length > 50){
			show_warning('计划名称的字符长度不能超过50');
			return false;
		}else{
			 if (check_str3(plan_name) == false){
				show_warning('计划名称中只能包含英文字母、数字中文、下划线或“.”');
				return false;
			 }
		}
	}
	
	var plan_desc = $("#txt_plan_desc").val();
	if (plan_desc != ""){
		if (plan_desc.length > 100){
			show_warning('计划描述的字符长度不能超过100');
			return false;
		}
	}
//	var project_id = $("#select_project").val();
//	var appium_type = $("#select_appium_type").val();
	
	var version_id = $('#select_version').val();
	if (version_id == '0'){
		show_warning('请选择版本');
		return false;
	}
	
	var apk_name = $('#select_apk').val();
	if (apk_name == '0'){
		show_warning('请选择待测APK');
		return false;
	}
	
	if (check_execute_mode() == false){
		return false
	}
	
	var case_ids = [];
	$('#tb_rel_case_list tbody tr').each(function(){
		if(typeof($(this).attr('id')) != 'undefined'){
			var case_id = $(this).attr("id").replace("case_", "");
			case_ids.push(case_id);
		}
	});
	if (case_ids.length == 0){
		show_warning("请选择待测试用例。");
		return false;
	}
	return true;
}

function check_execute_mode(){
	var execute_mode = 0;//不执行
	var cron = '';
	var str_hour = '';
	var str_min = '';
	var hour = 0;
	var min = 0;
	if($("#rd_exec_immi").prop("checked") == true){
		execute_mode = 1;//立即执行
	} else if ($("#rd_exec_regular").prop("checked") == true){
		execute_mode = 2;//周期执行
		str_hour = trim($('#txt_cron_hour').val());
		str_min = trim($('#txt_cron_min').val());
		if (str_hour == ""){
			show_warning("小时不能为空。");
			$('#txt_cron_hour').focus();
			return false;
		} else {
			hour = parseInt(str_hour);
			if (hour < 0 || hour > 23){
				show_warning("小时的范围为0-23。");
				$('#txt_cron_hour').focus();
				return false;
			}
		}
		if (str_min == ""){
			show_warning("分钟不能为空。");
			$('#txt_cron_min').focus();
			return false;
		} else {
			min = parseInt(str_min);
			if (min < 0 || min > 59){
				show_warning("分钟的范围为0-59。");
				$('#txt_cron_min').focus();
				return false;
			}
		}
	} else if ($("#rd_exec_once").prop("checked") == true){
		var cur_date = new Date();
		var cur_hour = cur_date.getHours(); 
		var cur_min = cur_date.getMinutes(); 
		execute_mode = 3;//定时执行
		str_hour = trim($('#txt_once_hour').val());
		str_min = trim($('#txt_once_min').val());
		if (str_hour == ""){
			show_warning("小时不能为空。");
			$('#txt_once_hour').focus();
			return false;
		} else {
			hour = parseInt(str_hour);
			if (hour < 0 || hour > 23){
				show_warning("小时的范围为0-23。");
				$('#txt_once_hour').focus();
				return false;
			}
			if (hour < cur_hour){
				show_warning("设置的启动时间已过，请重新设置。");
				$('#txt_once_hour').focus();
				return false;
			}
		}
		
		if (str_min == ""){
			show_warning("分钟不能为空。");
			$('#txt_once_min').focus();
			return false;
		} else {
			min = parseInt(str_min);
			if (min < 0 || min > 59){
				show_warning("分钟的范围为0-59。");
				$('#txt_once_min').focus();
				return false;
			}
			if (hour == cur_hour && min <= cur_min){
				show_warning("设置的启动时间已过，请重新设置。");
				$('#txt_once_min').focus();
				return false;
			}
		}
	}
	return true;
}

/**
 * 保存测试计划
 * @param plan_type 1为功能测试计划，2为升级测试计划
 */
function save_plan(plan_type){
	if (check_plan_info() == false){
		return;
	}
	
	var case_ids = [];
	$("input[id^=cb_case_]").each(function(){
		if ($(this).prop("checked") == true){
			var case_id = $(this).attr("id").replace("cb_case_", "");
			case_ids.push(case_id);
		}
	});
	//执行方式，其中：0为不执行；1为立即执行；2为周期执行；3为定时执行
	var execute_mode = 1;
	var hour = 0;
	var min = 0;
	if($("#rd_exec_immi").prop("checked") == true){
		execute_mode = 1;//立即执行
	} else if ($("#rd_exec_regular").prop("checked") == true){
		execute_mode = 2;//周期执行
		hour = $('#txt_cron_hour').val();
		min = $('#txt_cron_min').val();
	} else if ($("#rd_exec_once").prop("checked") == true){
		execute_mode = 3;//定时执行
		hour = $('#txt_once_hour').val();
		min = $('#txt_once_min').val();
	}
	
	var version_id = 0;
	var upgrade_package_id = 0;
	if (plan_type == 2){//升级测试计划
		upgrade_package_id = $('#select_package').val();
//		upgrade_package_id = $('#txt_package_id').val();
		version_id = $('#txt_version_id').val();
	} else if (plan_type == 1){//功能测试计划
		version_id = $('#select_version').val();
	}
	var apk_id = $('#select_apk').val();
	
    $.ajax({
        url: 'check_package',
        type: 'POST',
        data: JSON.stringify({plan_type : plan_type, apk_id : apk_id, package_id : upgrade_package_id}),
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	//json data
        	var data = {
        		plan_name : trim($('#txt_plan_name').val()),
        		plan_desc : trim($('#txt_plan_desc').val()),
        		project_id : $('#select_project').val(),
        		version_id : version_id,
        		appium_type :　$('#select_appium_type').val(),
        		env_type : $('#select_env_type').val(),
        		execute_mode : execute_mode,
        		hour : hour,
        		min : min,
        		case_ids : case_ids,
        		apk_id : apk_id,
        		tos : $('#txt_tos').val(),
        		plan_type : plan_type,
        		upgrade_package_id : upgrade_package_id
        	};
        	var json_data = JSON.stringify(data);
        	
        	$('#progress_title').html('正在保存测试计划...');
        	$('#modal_progress').modal("show");
            $.ajax({
                url: 'create_plan',
                type: 'POST',
                data: json_data,
                success: function (data) {
                	if (error_message(data) == true){
                		$('#modal_progress').modal("hide");
                		return;
                	}
                	var plan = data['result']['plan'];
                	var plan_type = plan['plan_type'];
                	if (plan_type == 2){//升级测试计划
                		create_incre_file(plan['plan_id'], 1);
                	} else {
                		$('#modal_progress').modal('hide');
                		show_info("新建计划成功");
                		window.location.href = "/plan/index";
                	}
                	
                },
                error: function () {
                	$('#modal_progress').modal('hide');
                    show_danger('系统错误，请通知管理员');
                }
            });

        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

/**
 * 
 * @param plan_id
 * @param edit_type 1表示创建计划，2表示修改计划
 */
function create_incre_file(plan_id, edit_type){
	//json data
	var data = {
		plan_id : plan_id,
		edit_type : edit_type
	};
	var json_data = JSON.stringify(data);
	$('#progress_title').html('正在生成增量升级包...');
    $.ajax({
        url: 'create_incre_file',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_progress').modal("hide");
        		return;
        	}
        	$('#modal_progress').modal("hide");
        	if (edit_type == 1){
        		show_info("新建计划成功");
        	} else if (edit_type == 2){
        		show_info("修改计划成功");
        	}
    		window.location.href = "/plan/index";
        },
        error: function () {
        	$('#modal_progress').modal("hide");
            show_danger('系统错误，请通知管理员');
        }
    });
}

function init_product_dropdown(product_list, plan_type){
	var select_item = '';
	if (plan_type == 2){//升级测试计划
		select_item = '地方棋牌';
	}
	change_select('select_product', product_list, {'id' : 0, 'name' : '选择所属工作室'}, select_item);
}

function init_device_dropdown(device_list){
	change_select('select_device', device_list, {'id' : 0, 'name' : '选择Device'}, '');
}

//function search(){
//	var product_id = $('#select_product').val();
//	var project_id = $('#select_project').val();
//	
//	//json data
//	var data = {
//		product_id : product_id,
//		project_id :　project_id
//	};
//	var json_data = JSON.stringify(data);
//	
//    $.ajax({
//        url: 'search',
//        type: 'POST',
//        data: json_data,
//        success: function (data) {
//        	if (error_message(data) == true){
//        		return;
//        	}
//        	var plan_list = data["result"]['plan_list'];
//        	draw_tb_plan_list(plan_list);
//        },
//        error: function () {
//            show_danger('系统错误，请通知管理员');
//        }
//    });
//}

function execute_plan(plan_id){
	//json data
	var data = {
		plan_id : plan_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'execute_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	show_info('已将该测试计划添加至计划执行队列中。');
        	var plan_list = data['result']['plan_list'];
        	draw_tb_plan_list(plan_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function cancel_execute_plan(plan_id){
	//json data
	var data = {
		plan_id : plan_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'cancel_execute_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	show_info('已将该测试计划从计划执行队列中删除。');
        	var plan_list = data["result"]['plan_list'];
        	draw_tb_plan_list(plan_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function stop_plan(plan_id, report_id){
	//json data
	var data = {
		plan_id : plan_id,
		report_id : report_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'stop_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var plan_list = data['result']['plan_list'];
        	draw_tb_plan_list(plan_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_plan_list(plan_list){
	var row_html = "";
	var count = 1;
	for (var i in plan_list){
		var operator = '';
		var status = '';
		var plan_type_str = '';
		var plan_status = plan_list[i]['status'];
		var plan_name = plan_list[i]['plan_name'];
		var plan_id = plan_list[i]['plan_id'];
		var plan_type = plan_list[i]['plan_type'];
		if (plan_status == 2){//2：空闲
			status = '空闲';
			operator = '<button onclick="execute_plan(' + plan_id + ')" type="button" class="btn btn-xs btn-primary" title="立即运行">'
				+ '<span class="glyphicon glyphicon-play"></span>'
				+ '</button>';
		}else if (plan_status == 1){//1：正在执行
			status = '<span style="color:#34495E">共:' + plan_list[i]['progress']['total'] + '</span>&nbsp;'
				+ '<span style="color:#1ABC9C">成功:' + plan_list[i]['progress']['success'] + '</span>&nbsp;'
				+ '<span style="color:#E74C3C">失败:' + plan_list[i]['progress']['failed'] + '</span>&nbsp;'
				+ '<span style="color:#95A5A6">等待:' + plan_list[i]['progress']['waiting'] + '</span><br/>';
			if (plan_list[i]['report_id'] != '0'){
				status += '<a onclick="to_report_detail(' + plan_list[i]['report_id'] + ')">进度详情</a>';
			}
			operator = '<button onclick="stop_plan(' + plan_id + ', '+ plan_list[i]['report_id'] + ')" type="button" class="btn btn-xs btn-primary" title="停止执行">'
				+ '<span class="glyphicon glyphicon-stop"></span>'
				+ '</button>';
		} else if (plan_status == 0) {//0：等待执行
			status = '等待执行';
			operator = '<button onclick="cancel_execute_plan(' + plan_id + ')" type="button" class="btn btn-xs btn-primary" title="取消执行">'
				+ '<span class="glyphicon glyphicon-stop"></span>'
				+ '</button>';
		}
		
		if (plan_type == 1){
			plan_type_str = '功能测试';
		} else if (plan_type == 2){
			plan_type_str = '升级测试';
		}
		
		row_html += '<tr>'
//			+ '<td><input id="cb_plan_' + plan_id + '" type="checkbox"></td>'
//			+ '<td>' + (count++) + '</td>'
			+ '<td>' + plan_id + '</td>'
			+ '<td style="word-wrap:break-word;"><a id="plan_' + plan_id + '">' + plan_name + '</a></td>'
//			+ '<td><a id="plan_' + plan_id + '" title="id为' + plan_id + '">' + plan_name + '</a></td>'
			+ '<td>' + plan_type_str + '</td>'
			+ '<td>' + plan_list[i]['product_name'] + '</td>'
			+ '<td>' + plan_list[i]['project_name'] + '</td>'
//			+ omit_tb(plan_list[i]['project_name'])
			+ '<td>' + plan_list[i]['svn_version'] + '</td>'
//			+ '<td>' + plan_list[i]['creator'] + '</td>'
//			+ '<td>' + plan_list[i]['create_date'] + '</td>'
			+ '<td>' + plan_list[i]['update_date'] + '</td>'
			+ '<td>' + plan_list[i]['case_count'] + '</td>'
//			+ '<td>' + plan_list[i]['run_times'] + '</td>'
			+ '<td>' + status + '</td>'
//			+ '<td>' + plan_list[i]['device_name'] + '</td>'
			+ omit_tb(plan_list[i]['desc'])
			+ '<td>' + operator + '</td>'
			+ '</tr>';
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="11">没有任何数据</td></tr>'
	}
	$('#tb_plan_list tbody').remove();
	$('#tb_plan_list').append(row_html);
	
	$("a[id^=plan_]").each(function(){
	    $(this).click(function(){
	    	var plan_id = $(this).attr("id").replace("plan_", "");
	    	window.location.href = "/plan/to_plan_detail?plan_id=" + plan_id;
	    });
	});
}

function draw_tb_suite_list_for_modal(suite_list){
	var row_html = "";
	var count = 1;
	for (var i in suite_list){
		row_html += '<tr id="suite_' + suite_list[i]['id'] + '">'
			+ '<td><input id="cb_suite_' + suite_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ omit_tb(suite_list[i]['name'])
			+ omit_tb(suite_list[i]['desc'])
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="4">没有任何数据</td></tr>';
	}
	draw_table('tb_suite_list_modal', row_html);
	
    //check/uncheck
    $("#cb_suites").click(function(){
    	if(this.checked){
    		$("input[id^=cb_suite_]").each(function() {
    			this.checked = true;
    		});
    	} else {
    		$("input[id^=cb_suite_]").each(function() {
    			this.checked = false;
    		});
    	}
    });
	
}

function draw_tb_case_list_for_modal(tb_id, case_list){
	var row_html = "";
	var count = 1;
	for (var i in case_list){
		row_html += '<tr id="case_' + case_list[i]['id'] + '">'
			+ '<td><input id="cb_case_' + case_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ omit_tb(case_list[i]['name'])
			+ omit_tb(case_list[i]['suite_name'])
			+ omit_tb(case_list[i]['logic_id'])
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="5">没有任何数据</td></tr>';
	}
	draw_table(tb_id, row_html);
    //check/uncheck
    $("#cb_cases").click(function(){
    	if(this.checked){
    		$("input[id^=cb_case_]").each(function() {
    			this.checked = true;
    		});
    	} else {
    		$("input[id^=cb_case_]").each(function() {
    			this.checked = false;
    		});
    	}
    });
}

function delete_case(del_case_id){
	var case_ids = [];
	$('#tb_rel_case_list tbody tr').each(function(){
		var case_id = $(this).attr("id").replace("case_", "");
		if (case_id != del_case_id){
			case_ids.push(case_id);
		}
	});
	
	//json data
	var data = {
		case_ids : case_ids
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_case_infos',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var case_list = data['result']['case_list'];
        	draw_tb_case_list_for_modify(case_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function refresh_cases(){
	var case_ids = [];
	$("input[id^=cb_case_]").each(function(){
		if ($(this).prop("checked") == true){
			var case_id = $(this).attr("id").replace("cb_case_", "");
			case_ids.push(case_id);
		}
	});
	
	if (case_ids.length == 0){
		show_warning("请选择待测试用例。");
		return;
	}
	
	$('#modal_select_case').modal("hide");
	$('#tb_rel_case_list tbody tr').each(function(){
		if(typeof($(this).attr('id'))!='undefined'){
			var case_id = $(this).attr("id").replace("case_", "");
			case_ids.push(case_id);
		}
	});
	
	//json data
	var data = {
		case_ids : case_ids
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_case_infos',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var case_list = data['result']['case_list'];
        	draw_tb_case_list_for_modify(case_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function select_suites(){
	$('#modal_select_case').modal("hide");
	$('#modal_select_suite').modal("show");
}

/**
 * 打开选择测试模块对话框
 * @param open_type create表示从创建计划页面打开对话框，modify表示从修改计划页面打开对话框
 * @param plan_type 测试计划类型，其中：1表示功能测试计划；2表示升级测试计划
 */
function open_select_suite_modal(open_type, plan_type){
	var project_id = 0;
	var version_id = 0;
	if (open_type == 'modify'){
		project_id = $('#txt_project_id').val();
	} else if (open_type == 'create'){
		//check project
		project_id = $('#select_project').val();
		if (project_id == "" || project_id == '0'){
			show_warning("请选择所属项目。");
			return;
		}
	}
	
	if (plan_type == 1){
		//check version
		version_id = $('#select_version').val();
		if (version_id == '0'){
			show_warning("请选择版本。");
			return;
		}
	} else if (plan_type == 2){
		version_id = $('#txt_version_id').val();
	}
	
	//json data
	var data = {
		project_id : project_id,
		version_id : version_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_suites',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	//show modal
        	$('#modal_select_suite').modal("show");
        	
        	var suite_list = data["result"];
        	draw_tb_suite_list_for_modal(suite_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function open_select_case_modal(){
	var suite_ids = [];
	$("input[id^=cb_suite_]").each(function(){
		if ($(this).prop("checked") == true){
			var suite_id = $(this).attr("id").replace("cb_suite_", "");
			suite_ids.push(suite_id);
		}
	});
	
	if (suite_ids.length == 0){
		show_warning("请选择待测试模块。");
		return;
	}
	
	$('#modal_select_suite').modal("hide");
	//json data
	var data = {
		suite_ids : suite_ids
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_cases',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	//show modal
        	$('#modal_select_case').modal("show");
        	
        	var case_list = data["result"]['case_list'];
        	draw_tb_case_list_for_modal('tb_case_list_modal', case_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_case_list_for_modify(case_list){
	var row_html = "";
	var operator = '';
	var count = 1;
	for (var i in case_list){
		operator = '<button onclick="delete_case(' + case_list[i]['case_id'] + ')" type="button" class="btn btn-xs btn-primary" title="删除"><span class="glyphicon glyphicon-minus"></span>&nbsp;</button>'
		
		row_html += '<tr id="case_' + case_list[i]['case_id'] + '">'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + case_list[i]['case_name'] + '</td>'
			+ '<td>' + case_list[i]['suite_name'] + '</td>'
			+ '<td>' + case_list[i]['logic_id'] + '</td>'
			+ '<td>' + case_list[i]['parameter'] + '</td>'
			+ '<td>' + case_list[i]['method'] + '</td>'
			+ '<td>' + case_list[i]['desc'] + '</td>'
			+ '<td>' + operator + '</td>'
			+ '</tr>';
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="8">没有任何数据</td></tr>';
	}
	draw_table('tb_rel_case_list', row_html);
}


function draw_tb_case_list(case_list){
	var row_html = "";
	var count = 1;
	for (var i in case_list){
		row_html += '<tr id="case_' + case_list[i]['id'] + '">'
			+ '<td><input id="cb_case_' + case_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + case_list[i]['name'] + '</td>'
			+ '<td>' + case_list[i]['suite_name'] + '</td>'
			+ '<td>' + case_list[i]['logic_id'] + '</td>'
			+ '<td>' + case_list[i]['parameter'] + '</td>'
			+ '<td>' + case_list[i]['method'] + '</td>'
			+ '<td>' + case_list[i]['desc'] + '</td>'
			+ '</tr>';
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="8">没有任何数据</td></tr>';
	}
	draw_table('tb_case_list', row_html);
}

function draw_tb_report_summary(plan, report){
	var status = '';
	if (report['status'] == 0){
		status = '失败';
	} else if (report['status'] == 1){
		status = '完成';
	} else if (report['status'] == 2){
		status = '计划正在执行';
	} else if (report['status'] == 3){
		status = '计划被停止';
	}
	
	var download_apk = '<a onclick="download_apk(' + plan['id']+ ')" style="text-decoration:underline ;">'
		+ plan['apk_name']
		+ '</a>';
	
	
	var row_html = '<tr style="background-color:#1ABC9C;color:#FFFFFF;">'
		+ '<td style="font-weight:bold;width:20%;">开始时间</td>'
		+ '<td style="font-weight:bold;width:20%;">结束时间</td>'
		+ '<td style="font-weight:bold;width:20%;">持续时间</td>'
		+ '<td style="font-weight:bold;width:20%;">状态</td>'
		+ '<td style="font-weight:bold;width:20%;">测试APK</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td>' + report['start_time'] + '</td>'
		+ '<td>' + report['end_time'] + '</td>'
		+ '<td>' + report['execute_time'] + '</td>'
		+ '<td>' + status + '</td>'
		+ '<td>' + download_apk + '</td>'
		+ '</tr>'
		+ '<tr style="background-color:#1ABC9C;color:#FFFFFF;">'
		+ '<td>用例总数</td><td>成功用例</td><td>失败用例</td><td>未执行用例</td><td>运行设备</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td><a onclick="get_rel_cases_by_status(' + -1 + ')" style="text-decoration:underline;">' + report['case_total_count'] + '</td>'
		+ '<td><a onclick="get_rel_cases_by_status(' + 2 + ')" style="text-decoration:underline;">' + report['case_success_count'] + '</td>'
		+ '<td><a onclick="get_rel_cases_by_status(' + 3 + ')" style="color:red;text-decoration:underline;">' + report['case_failed_count'] + '</a></td>'
		+ '<td>' + report['case_waiting_count'] + '</td>'
		+ '<td>' + report['serial_no'] + '</td>'
		+ '</tr>';
	
	$('#tb_report_summary tbody').remove();
	$('#tb_report_summary').append(row_html);
}

function show_message_detail(id){
	var text = $('#message_detail_a_' + id).text();
	if (text.indexOf('[+]') > 0){
		$('#message_detail_a_' + id).text('错误详情[-]');
	}else{
		$('#message_detail_a_' + id).text('错误详情[+]');
	}
	$('#message_detail_div_' + id).toggle();
}

function draw_tb_rel_case_list(case_list){
	var row_html = "";
	var count = 1;
	for (var i in case_list){
		var message = case_list[i]['message'];
		var message_detail = case_list[i]['message_detail'];
		if (message_detail != ''){
			var div_id = 'message_detail_div_' + i;
			var a_id = 'message_detail_a_' + i;
			message += '<br><a id="' + a_id + '"onclick="show_message_detail(\'' + i + '\')" style="text-decoration:underline;">' + '错误详情[+]' + '</a>';
			message += '<div id="' + div_id + '" style="display:none;width:100%;word-break:break-all;">' + message_detail + '</div>';
		}
		
		var screenshot = '';
		if (trim(case_list[i]['screenshot']) != ""){
			screenshot = '<a href="' + case_list[i]['screenshot'] + '" target="_blank">查看</a>';
		}
		if (case_list[i]['status'] == '失败'){
			row_html += '<tr style="color:red;">';
		} else {
			row_html += '<tr>';
		}
		row_html += '<td>' + (count++) + '</td>'
			+ '<td style="word-wrap:break-word;">' + case_list[i]['case_name'] + '</td>'
			+ '<td style="word-wrap:break-word;">' + case_list[i]['logic_id'] + '</td>'
//			+ '<td style="word-wrap:break-word;">' + case_list[i]['method'] + '</td>'
			+ '<td style="word-wrap:break-word;">' + case_list[i]['suite_name'] + '</td>'
			+ '<td>' + case_list[i]['start_time'] + '</td>'
			+ '<td>' + case_list[i]['end_time'] + '</td>'
			+ '<td>' + case_list[i]['execute_time'] + '</td>'
			+ '<td>' + case_list[i]['status'] + '</td>'
//			+ omit_tb(case_list[i]['message'])
			+ '<td style="word-break: break-all;">' + message + '</td>'
			+ '<td>' + screenshot + '</td>'
			+ '<td><input id="txt_rel_case' + case_list[i]['id'] + '" type="text" value="' + case_list[i]['remark'] + '" class="form-control" /></td>'
			+ '</tr>';
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="11">没有任何数据</td></tr>';
	}
	$('#tb_rel_case_list tbody').remove();
	$('#tb_rel_case_list').append(row_html);
	
	$('#tb_rel_case_list input[type=text]').blur(function() {
	    var remark = $(this).val();
	    var rel_case_id = $(this).attr("id").replace("txt_rel_case", "");
	    
		//json data
		var data = {
			rel_case_id : rel_case_id,
			remark : remark
		};
		var json_data = JSON.stringify(data);
	    $.ajax({
	        url: '/report/set_remark',
	        type: 'POST',
	        data: json_data,
	        success: function (data) {
	        	if (error_message(data) == true){
	        		return;
	        	}
	        },
	        error: function () {
	            show_danger('系统错误，请通知管理员');
	        }
	    });
	});
}

function change_product(element){
	//获取选中option的value
	var product_id = $(element).val();
	if (product_id == '0'){//未选择工作室
    	change_select('select_project', null, {'id' : 0, 'name' : '选择所属项目'}, '');
    	
    	change_select('select_apk', null, {'id' : 0, 'name' : '选择待测APK'}, '');
    	change_select('select_version', null, {'id' : 0, 'name' : '选择版本'}, '');
    	
    	draw_tb_rel_case_list(null);
    	return;
	}
	
	//json data
	var data = {
		product_id : product_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_projects_by_product_id',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var project_list = data['result']['project_list'];
        	change_select('select_project', project_list, {'id' : 0, 'name' : '选择所属项目'}, '');
        	
        	change_select('select_apk', null, {'id' : 0, 'name' : '选择待测APK'}, '');
        	change_select('select_version', null, {'id' : 0, 'name' : '选择版本'}, '');
        	
        	draw_tb_rel_case_list(null);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}


function change_version(element){
	draw_tb_rel_case_list(null);
}

function change_apk(element){
	var apk_id = $(element).val();
	for (var i in apk_list){
		var apk = apk_list[i];
		var tmp_id = apk['id'];
		if (parseInt(apk_id) == tmp_id){
			$('#lb_apk_info').text(apk['desc']);
			break;
		}
	}	
}

function change_package(element){
	var package_id = $(element).val();
	for (var i in package_list){
		var pac = package_list[i];
		var tmp_id = pac['id'];
		if (parseInt(package_id) == tmp_id){
			$('#lb_package_info').text(pac['version_info']);
			break;
		}
	}	
}

var apk_list;
var package_list;
function change_project(element, plan_type){
	var project_id = $(element).val();
	
	//json data
	var data = {
		project_id : project_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_related_datas_of_project',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	apk_list = data['result']['apk_list'];
        	var tmp_apk_list = [];
        	for (var i in apk_list) {
        		var tmp = {'id' : apk_list[i]['id'], 'name' : apk_list[i]['file_name']};
        		tmp_apk_list[i] = tmp;
        	}
        	
        	var version_list = data['result']['version_list'];
        	var tmp_version_list = [];
        	for (var i in version_list){
        		var svn_version = version_list[i]['svn_version'];
        		if (svn_version == 'trunk' && plan_type == 2){//升级测试计划默认使用trunk下的测试用例
        			$('#txt_version_id').val(version_list[i]['id']);
        		}
        		var tmp = {'id' : version_list[i]['id'], 'name' : svn_version};
        		tmp_version_list[i] = tmp;
        	}
        	if (plan_type == 1){//功能测试计划
        		change_select('select_apk', tmp_apk_list, {'id' : 0, 'name' : '选择待测APK'}, '');
        		change_select('select_version', tmp_version_list, {'id' : 0, 'name' : '选择版本'}, '');
        	} else if (plan_type == 2){//升级测试计划
        		change_select('select_apk', tmp_apk_list, {'id' : 0, 'name' : '选择待升级APK'}, '');
//        		$('#txt_package').val('');
//            	$('#txt_package_id').val('');
        		package_list = data['result']['package_list'];
            	var tmp_package_list = [];
            	for (var i in package_list){
            		var tmp = {'id' : package_list[i]['id'], 'name' : package_list[i]['file_name']};
            		tmp_package_list[i] = tmp;
            	}
            	change_select('select_package', tmp_package_list, {'id' : 0, 'name' : '选择升级包'}, '');
        	}
        	
        	draw_tb_rel_case_list(null);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function del_plan(){
//	var plan_ids = [];
//	$("input[id^=cb_plan_]").each(function() {
//		if($(this).prop("checked") == true){
//			var plan_id = $(this).attr("id").replace("cb_plan_", "");
//			plan_ids.push(plan_id);
//		}
//	});
//	
//	if (plan_ids.length == 0){
//		show_warning("请选择待删除计划。");
//		return;
//	}
	
	var confirm_msg = '确定删除计划吗？';
	if (show_confirm(confirm_msg) == false){
		return;
	}
	
	var str = $.get_url_var('plan_id');
	var plan_id = str.split(",")[0];
	
	//json data
	var data = {
		plan_id : plan_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'del_plan',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	window.location.href = "/plan/index";
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function get_plan_detail(plan_id){
	window.location.href = "/plan/to_plan_detail?plan_id=" + plan_id;
}

function scan_device(){
    $.ajax({
        url: 'scan_device',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var device_list = data["result"]["device_list"];
        	init_device_dropdown(device_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function check_plan_exist(){
	var exist = false;
	var plan_name = $("#txt_plan_name").val();
	
	if (plan_name == ""){
		show_warning("计划名称不能为空。");
		return;
	}
	
	//json data
	var data = {
		plan_name : plan_name
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'check_plan_exist',
        type: 'POST',
        async: false,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	exist = data["result"]['exist'];
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
    
    if (exist == true){
    	show_warning("计划名称已存在，请重新填写。");
		$("#txt_plan_name").focus();
		return;
    }
}

function to_report_detail(report_id){
	window.location.href = '/plan/to_report_detail?report_id=' + report_id;
//	window.open("/plan/to_report_detail?report_id=" + report_id);
}

function open_add_email_modal(){
	var tos = $('#txt_tos').val();
	var data = {
		tos : tos
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'get_users',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	//show modal
        	$('#modal_add_email').modal('show');
        	
        	var from_user_list = data['result']['from_user_list'];
        	if (from_user_list != null && from_user_list.length != 0){
        		var from_first_user = from_user_list[0];
        		var from_tmp_list = from_user_list.slice(1);
        		var from_tmp_user_list = [];
        		for (var i in from_tmp_list) {
        			var tmp = {'id' : from_tmp_list[i]['id'], 'name' : from_tmp_list[i]['email']};
        			from_tmp_user_list[i] = tmp;
        		}
        		change_select('from', from_tmp_user_list, {'id' : from_first_user['id'], 'name' : from_first_user['email']}, '');
        	} else {
        		$('#from').find("option").remove();
        	}
        	
        	var to_user_list = data['result']['to_user_list'];
        	if (to_user_list != null && to_user_list.length != 0){
        		var to_first_user = to_user_list[0];
        		var to_tmp_list = to_user_list.slice(1);
        		var to_tmp_user_list = [];
        		for (var i in to_tmp_list) {
        			var tmp = {'id' : to_tmp_list[i]['id'], 'name' : to_tmp_list[i]['email']};
        			to_tmp_user_list[i] = tmp;
        		}
        		change_select('to', to_tmp_user_list, {'id' : to_first_user['id'], 'name' : to_first_user['email']}, '');
        	} else {
        		$('#to').find("option").remove();
        	}
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function add_emails(){
	$("#from option:selected").clone().appendTo("#to");
	$("#from option:selected").remove();
}

function remove_emails(){
	$("#to option:selected").clone().appendTo("#from");
	$("#to option:selected").remove();
}

function update_emails(){
	var user_ids = '';
	$('#to option').each(function(){
		var val = $(this).val();
		user_ids +=  ',' + val;
	});
	$('#txt_tos').val(user_ids.substr(1, user_ids.length-1));
	$('#modal_add_email').modal('hide');
}

function open_upload_apk_modal(){
	//check project
	var project_id = $('#select_project').val();
	if (project_id == "0"){
		show_warning("请选择所属项目。");
		return;
	}
	
	if (!show_confirm("目前仅支持测试包，不支持无debug日志、不能切换环境的包。如要继续请点击【OK】。")){
		return;
	}
	$('#progress_bar_for_upload_apk').hide();
	$('#modal_upload_apk').modal('show');
}

function open_upload_package_modal(){
	//check project
	var project_id = $('#select_project').val();
	if (project_id == "0"){
		show_warning("请选择所属项目。");
		return;
	}
	$('#progress_bar_for_upload_package').hide();
	$('#modal_upload_package').modal('show');
}

/**
 * 打开选择升级包对话框
 * @param open_type create表示从创建计划页面打开对话框，modify表示从修改计划页面打开对话框
 */
function open_select_package_modal(open_type){
	var project_id = 0;
	if (open_type == 'modify'){
		project_id = $('#txt_project_id').val();
	} else if (open_type == 'create'){
		//check project
		project_id = $('#select_project').val();
		if (project_id == "" || project_id == '0'){
			show_warning("请选择所属项目。");
			return;
		}
	}
	
	//json data
	var data = {
		project_id : project_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_packages',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	//show modal
        	$('#select_upgrade_package_modal').modal('show');
        	
        	var package_list = data['result']['package_list'];
        	draw_tb_package_list(package_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_package_list(package_list){
	var row_html = "";
	var count = 1;
	for (var i in package_list){
		row_html += '<tr id="package_' + package_list[i]['id'] + '">'
			+ '<td><input id="rb_package_' + package_list[i]['id'] + '" type="radio" value="' + package_list[i]['file_name'] + '"></td>'
			+ '<td>' + (count++) + '</td>'
			+ omit_tb(package_list[i]['file_name'])
			+ omit_tb(package_list[i]['version_info'])
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="4">没有任何数据</td></tr>';
	}
	draw_table('tb_package_list', row_html);
}

function refresh_package(){
	var package_id = '';
	var package_name = '';
	$("input[id^=rb_package_]").each(function(){
		if ($(this).prop("checked") == true){
			package_id = $(this).attr("id").replace("rb_package_", "");
			package_name = $(this).attr("value");
		}
	});
	
	if (package_id == ''){
		show_warning("请选择升级包。");
		return;
	}
	
	$('#txt_package').val(package_name);
	$('#txt_package_id').val(package_id);
	$('#select_upgrade_package_modal').modal('hide');
}

function upload_package(){
	var project_id;
	if ($('#select_project').length > 0){//创建计划页面通过此元素获取project_id
		project_id = $('#select_project').val();
	} else if ($('#txt_project_id').length > 0){//修改计划页面通过此元素获取project_id
		project_id = $('#txt_project_id').val();
	}
	
	var file_path = trim($('#upload_package').val());
	if (file_path == ""){
		show_warning("请选择一个升级文件。");
		return;
	}
	var tmp = file_path.split("\\");
	var file_name = tmp[tmp.length - 1];
	if (check_file_extension(file_name, ['zip', 'apk']) == false){
		show_warning("请选择一个zip文件或apk文件。");
		return;
	}
	if (check_str4(file_name) == true){
		show_warning("升级文件名称不能包含中文。");
		return;
	}
	
	$('#progress_bar_for_upload_package').show();
	$('#upload_package').attr("disabled", true);
	$('#btn_package_cancel').attr("disabled", true);
	$('#btn_package_upload').attr("disabled", true);
	
	var file_obj = document.getElementById('upload_package').files[0];
	var url = 'upload_file';
	var form = new FormData();
	form.append('project_id', project_id);
	form.append('file_type', 2);//2表示上传升级包
	form.append('file', file_obj);
	var xhr = new XMLHttpRequest();
	xhr.open('post', url, true);
	xhr.onload = function () {
		$('#modal_upload_package').modal('hide');
		show_info('上传升级文件成功');
    	$('#upload_package').attr('disabled', false);
    	$('#btn_package_cancel').attr("disabled", false);
    	$('#btn_package_upload').attr("disabled", false);
    	
    	var data = {
    		project_id : project_id
    	};
    	var json_data = JSON.stringify(data);
        $.ajax({
            url: 'get_packages',
            type: 'POST',
            async: true,
            data: json_data,
            success: function (data) {
            	if (error_message(data) == true){
            		return;
            	}
            	
            	var result = data['result'];
            	package_list = result['package_list'];
            	var selected_item = package_list[0];
//            	$('#txt_package').val(selected_item['file_name']);
//            	$('#txt_package_id').val(selected_item['id']);
            	var tmp_package_list = [];
            	for (var i in package_list) {
            		var tmp = {'id' : package_list[i]['id'], 'name' : package_list[i]['file_name']};
            		tmp_package_list[i] = tmp;
            	}
            	
            	var selected_item = tmp_package_list[0]['name'];
            	$('#lb_package_info').text(package_list[0]['version_info']);
            	change_select('select_package', tmp_package_list, {'id' : 0, 'name' : '选择升级包'}, selected_item);
            },
            error: function () {
            	show_danger('系统错误，请通知管理员');
            }
        });
    };
    xhr.send(form);
}

function upload_apk(){
	var project_id;
	if ($('#select_project').length > 0){//创建计划页面通过此元素获取project_id
		project_id = $('#select_project').val();
	} else if ($('#txt_project_id').length > 0){//修改计划页面通过此元素获取project_id
		project_id = $('#txt_project_id').val();
	}
	
	var file_path = trim($('#upload_apk').val());
	if (file_path == ""){
		show_warning("请选择一个apk文件。");
		return;
	}
	var tmp = file_path.split("\\");
	var file_name = tmp[tmp.length - 1];
	if (check_file_extension(file_name, ['apk']) == false){
		show_warning("请选择一个apk文件。");
		return;
	}
	if (check_str4(file_name) == true){
		show_warning("apk文件名称不能包含中文。");
		return;
	}
	
	$('#progress_bar_for_upload_apk').show();
	$('#upload_apk').attr("disabled", true);
	$('#btn_cancel').attr("disabled", true);
	$('#btn_upload').attr("disabled", true);
	
	var file_obj = document.getElementById('upload_apk').files[0];
	var url = 'upload_file';
	var form = new FormData();
	form.append('project_id', project_id);
	form.append('file_type', 1);//1表示上传apk
	form.append('file', file_obj);
	var xhr = new XMLHttpRequest();
	xhr.open('post', url, true);
	xhr.onload = function () {
		$('#modal_upload_apk').modal('hide');
		show_info('上传apk成功');
    	$('#upload_apk').attr('disabled', false);
    	$('#btn_cancel').attr("disabled", false);
    	$('#btn_upload').attr("disabled", false);
    	
    	var data = {
    		project_id : project_id
    	};
    	var json_data = JSON.stringify(data);
        $.ajax({
            url: 'get_apks',
            type: 'POST',
            async: true,
            data: json_data,
            success: function (data) {
            	if (error_message(data) == true){
            		return;
            	}
            	
            	var result = data['result'];
            	var apk_list = result['apk_list'];
            	var tmp_apk_list = [];
            	for (var i in apk_list) {
            		var tmp = {'id' : apk_list[i]['id'], 'name' : apk_list[i]['file_name']};
            		tmp_apk_list[i] = tmp;
            	}
            	
            	var selected_item = '';
//            	if ($('#txt_project_id').length > 0){//修改计划页面
//            		selected_item = $('#select_apk option:selected').text();
//            	}
            	selected_item = tmp_apk_list[0]['name'];
            	$('#lb_apk_info').text(apk_list[0]['desc']);
            	change_select('select_apk', tmp_apk_list, {'id' : 0, 'name' : '选择待测APK'}, selected_item);
            },
            error: function () {
            	show_danger('系统错误，请通知管理员');
            }
        });
    };
    xhr.send(form);
}
