function init_index(){
	active_tab('report');
    $.ajax({
        url: 'init_index',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	
        	//init product_dropdown
        	var product_list = result["product_list"];
        	init_product_dropdown(product_list);
        	
        	//init report_table
        	var report_list = result["report_list"];
        	draw_tb_reports(report_list, 1);
        	
        	var method_name = 'get_reports';
        	var method_params = [null, null];
        	draw_pagination(method_name, method_params, 'report_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
	
	//click product
	$("#select_product").change(function(){
		change_product();
	});
}

function init_report_detail(){
	active_tab('report');
	var str = $.get_url_var('report_id');
	var report_id = str.split(",")[0];
	var case_status = -1;//all
	get_rel_cases(report_id, case_status, 1);
	$('#select_case_status').change(function(){
		var case_status = $(this).val();
		get_rel_cases(report_id, case_status, 1);
	});
	
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
	get_rel_cases(report_id, case_status, 1);
}

//function get_failed_rel_cases(){
//	var str = $.get_url_var('report_id');
//	var report_id = str.split(",")[0];
//	var case_status = 3;//失败
//	change_case_status(case_status);
//	get_rel_cases(report_id, case_status, 1);
//}
//
//function get_success_rel_cases(){
//	var str = $.get_url_var('report_id');
//	var report_id = str.split(",")[0];
//	var case_status = 2;//成功
//	change_case_status(case_status);
//	get_rel_cases(report_id, case_status, 1);
//}

function get_rel_cases(report_id, case_status, cur_page){
	//json data
	var data = {
		report_id : report_id,
		case_status : case_status,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_rel_cases',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var case_list = result['case_list'];
        	draw_tb_rel_case_list(case_list, cur_page);
        	
        	var method_name = 'get_rel_cases';
        	var method_params = [report_id, case_status];
        	draw_pagination(method_name, method_params, 'rel_case_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
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

function draw_tb_rel_case_list(case_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in case_list){
		var message = case_list[i]['message'];
		var message_detail = case_list[i]['message_detail'];
		if (message_detail != ''){
			var div_id = 'message_detail_div_' + i;
			var a_id = 'message_detail_a_' + i;
			message += '<br><a id="' + a_id + '"onclick="show_message_detail(\'' + i + '\')" style="text-decoration:underline;">' + '错误详情[+]' + '</a>';
			message += '<div id="' + div_id + '" style="display:none;width:100%;word-break: break-all;">' + message_detail + '</div>';
		}
		
		var screenshot = '';
		if (case_list[i]['screenshot'] != ''){
			screenshot = '<a href="' + case_list[i]['screenshot'] + '" target="_blank">查看</a>'
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
	        url: 'set_remark',
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

function get_reports(product_id, project_id, cur_page){
//	// get product_id
//	var product_id = $("#select_product").val();
//	
//	//get project_id
//	var project_id = $("#select_project").val();
	
	//get plan name
	var plan_name = $('#txt_plan_name').val();
	//json data
	var data = {
		product_id : product_id,
		project_id : project_id,
		plan_name : plan_name,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'get_reports',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var report_list = result["report_list"];
        	draw_tb_reports(report_list, cur_page);
        	
        	var method_name = 'get_reports';
        	var method_params = [product_id, project_id];
        	draw_pagination(method_name, method_params, 'report_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function change_product(){
	// get product_id
	var product_id = $("#select_product").val();
	
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
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function init_product_dropdown(product_list){
	change_select('select_product', product_list, {'id' : 0, 'name' : '选择所属工作室'}, '');
}

function search(){
	// get product_id
	var product_id = $("#select_product").val();
	
	//get project_id
	var project_id = $("#select_project").val();
	
	//get plan name
	var plan_name = $('#txt_plan_name').val();
	
	//json data
	var data = {
		product_id : product_id,
		project_id : project_id,
		plan_name : plan_name,
		cur_page : 1
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_reports',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
    		var report_list = result['report_list'];
    		draw_tb_reports(report_list, 1);
    		
        	var method_name = 'get_reports';
        	var method_params = [product_id, project_id];
    		draw_pagination(method_name, method_params, 'report_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_reports(report_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in report_list){
		var status = report_list[i]['status'];
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + report_list[i]['plan_name'] + '</td>'
			+ '<td>' + report_list[i]['product_name'] + '</td>'
			+ '<td>' + report_list[i]['project_name'] + '</td>'
			+ '<td>' + report_list[i]['case_count'] + '</td>'
			+ '<td>' + report_list[i]['start_time'] + '</td>'
			+ '<td>' + report_list[i]['end_time'] + '</td>';
		if (status == 1){//完成
			row_html += '<td>完成</td>'
				+ '<td>'
				+ '<span style="color:#34495E">共:' + report_list[i]['sum']['total'] + '</span>&nbsp;'
				+ '<span style="color:#1ABC9C">成功:' + report_list[i]['sum']['success'] + '</span>&nbsp;'
				+ '<span style="color:#E74C3C">失败:' + report_list[i]['sum']['failed'] + '</span>&nbsp;'
				+ '<span style="color:#95A5A6">等待:' + report_list[i]['sum']['waiting'] + '</span><br/>'
				+ '<a onclick="to_report_detail(' + report_list[i]['id'] + ')" target="_blank">查看测试报告</a>'
				+ '</td>';
		} else if (status == 0){//失败
			row_html += '<td style="color:#F00;">失败</td>'
				+ '<td>'
				+ '<span style="color:#F00;">' + report_list[i]['message'] + '</span><br/>'
				+ '</td>';
		} else if (status == 2){//正在执行
			row_html += '<td>正在执行</td>' + '<td><a onclick="to_report_detail(' + report_list[i]['id'] + ')" target="_blank">进度详情</a></td>';
		} else if (status == 3){//被停止
			row_html += '<td style="color:#F00;">失败</td>'
				+ '<td>'
				+ '<span style="color:#F00;">' + report_list[i]['message'] + '</span><br/>';
			if (report_list[i]['case_count'] != 0){
				row_html += '<a onclick="to_report_detail(' + report_list[i]['id'] + ')" target="_blank">查看测试报告</a>';
			}
			row_html += '</td>';
		}
		
		row_html += '</tr>';
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="9">没有任何数据</td></tr>'
	}
	$('#tb_reports tbody').remove();
	$('#tb_reports').append(row_html);
}

function to_report_detail(report_id){
	window.open("/report/to_report_detail?report_id=" + report_id);
}

function clear_table(){
	$('#tb_reports tbody').remove();
	var row_html = '<tr><td colspan="8">没有任何数据</td></tr>';
	$('#tb_reports').append(row_html);
}