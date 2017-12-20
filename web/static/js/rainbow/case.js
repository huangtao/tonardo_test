function init_index(){
	active_tab('case');
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
        	var product_list = result['product_list'];
        	init_product_dropdown(product_list);
        	
        	//init project_dropdown
        	var project_list = result['project_list'];
        	change_select('select_project', project_list, {'id' : 0, 'name' : '所属项目'}, '');
        	
        	//init case_table
        	var suite_list = result['suite_list'];
        	draw_tb_suite_list(suite_list, 1);
        	
        	var method_name = 'get_suites';
        	var method_params = [null, null, null];
        	draw_pagination(method_name, method_params, 'suite_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
	
	//click product
	$("#select_product").change(function(){
		change_product(this, "");
	});
	
	//click project
	$("#select_project").change(function(){
		change_project(this);
	});
	
	//click product on add_cases modal
	$("#select_product_for_add_modal").change(function(){
		change_product(this, "add");
	});
	
	//click project on add_cases modal
	$("#select_project_for_add_modal").change(function(){
		change_project_for_modal("add");
	});
	
	//click version on add_cases modal
	$("#select_version_for_add_modal").change(function(){
		change_version();
	});
	
	//click product on del_cases modal
	$("#select_product_for_del_modal").change(function(){
		change_product(this, "del");
	});
	
	//click project on del_cases modal
	$("#select_project_for_del_modal").change(function(){
		change_project_for_modal("del");
	});
	
//	//click row
//	$("#tb_suite tr").click(function(){
//		to_suite_detail(this);
//	});
	
	$("a[id^=suite_]").each(function(){
	    $(this).click(function(){
	    	to_suite_detail(this);
	    });
	});
}

function init_product_dropdown(product_list){
	change_select('select_product', product_list, {'id' : 0, 'name' : '选择所属产品'}, '地方棋牌');
	change_select('select_product_for_add_modal', product_list, {'id' : 0, 'name' : '选择所属产品'}, '');
	change_select('select_product_for_del_modal', product_list, {'id' : 0, 'name' : '选择所属产品'}, '');
//	$("select[id^=select_product]").each(function() {
//		$(this).find("option").remove();
//		$(this).append('<option value="0">选择所属产品</option>');
//		for (i in product_list){
//			var product_name = product_list[i]["name"];
//			var product_id = product_list[i]["id"];
//			var option = "<option value='" + product_id + "'>" + product_name + "</option>";
//			if (product_name == '地方棋牌'){
//				option = "<option value='" + product_id + "' selected>" + product_name + "</option>";
//			}
//			$(this).append(option);
//		}
//	});
}

function search(){
	// get product_id
	var product_id = $("#select_product").val();
	
	//get project_id
	var project_id = $("#select_project").val();
	
	//get sutie_id
	var suite_id = $("#select_suite").val();
	
	get_suites(product_id, project_id, suite_id, 1);
}

function change_product(element, modal_type){
	var suffix = "";
	if (modal_type != ""){
		if (modal_type == "add"){
			suffix = "_for_add_modal";
		} else if (modal_type == "del"){
			suffix = "_for_del_modal";
		}
	}

	//获取选中option的value
	var product_id = $(element).val();
	if (product_id == 0){
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
        	var project_list = data["result"];
        	change_select('select_project' + suffix, project_list, {'id' : 0, 'name' : '所属项目'}, '');
        	change_select('select_version' + suffix, [], {'id' : 0, 'name' : '选择版本'}, '');
        	change_select('select_suite', [], {'id' : 0, 'name' : '所属模块'}, '');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function change_project(element){
	//获取选中option的value
	var project_id = $(element).val();
	
	//json data
	var data = {
		project_id : project_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_suites_by_project_id',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var suite_list = data["result"];
        	change_select('select_suite', suite_list, {'id' : 0, 'name' : '选择所属模块'}, '');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function change_project_for_modal(modal_type){
	var suffix = "";
	if (modal_type == "add"){
		suffix = "_for_add_modal";
	} else if (modal_type == "del"){
		suffix = "_for_del_modal";
	}
	
	//get project_id
	var project_id = $('#select_project' + suffix).val();
	
	//json data
	var data = {
		project_id : project_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_versions',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var version_list = data['result']['version_list'];
        	var tmp_version_list = [];
        	for (var i in version_list){
        		var tmp = {'id' : version_list[i]['id'], 'name' : version_list[i]['svn_version']};
        		tmp_version_list[i] = tmp;
        	}
        	change_select('select_version' + suffix, tmp_version_list, {'id' : 0, 'name' : '选择版本'}, '');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function change_version(){
	//get project_id
	var project_id = $('#select_project_for_add_modal').val();
	//get version
	var version_id = $('#select_version_for_add_modal').val();
	
	//json data
	var data = {
		project_id : project_id,
		version_id : version_id
	};
	var json_data = JSON.stringify(data);
	
	//判断所选择的项目是否已经扫描过测试用例
	var case_exist = false;
    $.ajax({
        url: 'check_case_exist',
        type: 'POST',
        async: false,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	case_exist = data['result']['case_exist'];
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
	
    if (case_exist == true){
		$("#alert_warning_for_add_modal").empty();
		$("#alert_warning_for_add_modal").append("所选项目已存在测试用例，点击【扫描】按钮后将重新扫描。");
		$("#alert_warning_for_add_modal").show();
    }
}

function open_add_cases_modal(){
	$('#modal_add_cases').modal('show');
	$('#progress_bar_for_add_modal').hide();
	$('#select_product_for_add_modal').val('0');
	$('#select_project_for_add_modal').val('0');
	$('#select_version_for_add_modal').val('0');
}

function open_del_cases_modal(){
	$('#modal_del_cases').modal('show');
	$("#progress_bar_for_del_modal").hide();
	$('#select_product_for_del_modal').val('0');
	$('#select_project_for_del_modal').val('0');
	$('#select_version_for_del_modal').val('0');
}

function scan_cases(){
	var suffix = "_for_add_modal"
	//get product_id
//	var product_id = $("#select_product" + suffix).val();
//	if (product_id == "0"){
//		show_warning("请选择所属产品。");
//		return;
//	}
	
	//get project_id
//	var project_select = $("#select_project").val('0');
	var project_id = $("#select_project").val();
//	if (project_id == "0"){
//		show_warning("请选择所属项目。");
//		return;
//	}
	
	//get version_id
	var version_id = $('#select_version').val();
//	if (version_id == "0"){
//		show_warning("请选择版本。");
//		return;
//	}
	
	//json data
	var data = {
		project_id : project_id,
		version_id : version_id
	};
	var json_data = JSON.stringify(data);
    
	//scan cases for project
	$("#progress_bar" + suffix).show();
    $.ajax({
        url: 'scan_cases',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_add_cases').modal("hide");
        		return;
        	}
        	$('#modal_add_cases').modal("hide");
        	var result = data['result'];
        	var suite_list = result['suite_list'];
        	draw_tb_suite_list(suite_list, 1);
        	
        	var method_name = 'get_suites';
        	var method_params = [null, null, null];
        	draw_pagination(method_name, method_params, 'suite_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
            $('#modal_add_cases').modal("hide");
        }
    });
}

function del_cases(){
	var suffix = "_for_del_modal"
	//get product_id
	var product_select = $("#select_product" + suffix).val();
	var product_id = product_select.replace(suffix, "");
	if (product_id == "0"){
		show_warning("请选择所属产品。");
		return;
	}
	
	//get project_id
	var project_select = $("#select_project" + suffix).val();
	var project_id = project_select.replace(suffix, "");
	if (project_id == "0"){
		show_warning("请选择所属项目。");
		return;
	}
	
	//get version_id
	var version_id = $('#select_version' + suffix).val();
	if (version_id == "0"){
		show_warning("请选择版本。");
		return;
	}
	
	//json data
	var data = {
		project_id : project_id,
		version_id : version_id
	};
	var json_data = JSON.stringify(data);
    
	//scan cases for project
	$('#progress_bar' + suffix).show();
    $.ajax({
        url: 'del_cases',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_del_cases').modal("hide");
        		return;
        	}
        	$('#modal_del_cases').modal("hide");
        	var suite_list = data['result']['suite_list'];
        	draw_tb_suite_list(suite_list, 1);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
            $('#modal_del_cases').modal("hide");
        }
    });
}

function draw_tb_suite_list(suite_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in suite_list){
		var svn_version = suite_list[i]['svn_version'];
		
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + suite_list[i]['product_name'] + '</td>'
			+ '<td>' + suite_list[i]['project_name'] + '</td>'
			+ '<td><a id="suite_' + suite_list[i]['id'] + '">' + suite_list[i]['suite_name'] + '</a></td>'
			+ '<td>' + svn_version + '</td>'
			+ '<td>' + suite_list[i]['count'] + '</td>'
			+ '<td>' + suite_list[i]['desc'] + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="7">没有任何数据</td></tr>';
	}
	$('#tb_suite_list tbody').remove();
	$('#tb_suite_list').append(row_html);
	//click
	$("a[id^=suite_]").each(function(){
	    $(this).click(function(){
	    	to_suite_detail(this);
	    });
	});
}

function init_suite_detail(){
	active_tab('case');
	var str = $.get_url_var('suite_id');
	var suite_id = str.split(",")[0];
	get_cases(suite_id, 1);
}

function draw_tb_case_list(case_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in case_list){
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + case_list[i]['name'] + '</td>'
			+ '<td>' + case_list[i]['logic_id'] + '</td>'
			+ '<td>' + case_list[i]['parameter'] + '</td>'
			+ '<td>' + case_list[i]['method'] + '</td>'
			+ '<td>' + case_list[i]['desc'] + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="6">没有任何数据</td></tr>';
	}
	$('#tb_case_list tbody').remove();
	$('#tb_case_list').append(row_html);
}

function to_suite_detail(element){
	var suite_id = $(element).attr("id").replace("suite_", "");
	window.location.href = "/case/to_suite_detail?suite_id=" + suite_id;
}

function get_suites(product_id, project_id, suite_id, cur_page){
	
	//json data
	var data = {
		product_id : product_id,
		project_id : project_id,
		suite_id : suite_id,
		cur_page : cur_page
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
        	var result = data['result'];
        	var suite_list = result['suite_list'];
        	draw_tb_suite_list(suite_list, cur_page);
        	
        	var method_name = 'get_suites';
        	var method_params = [product_id, project_id, suite_id];
        	draw_pagination(method_name, method_params, 'suite_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function get_cases(suite_id, cur_page){
	//json data
	var data = {
		suite_id : suite_id,
		cur_page : cur_page
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
        	var result = data['result'];
        	var case_list = result['case_list'];
        	draw_tb_case_list(case_list, cur_page);
        	
        	var method_name = 'get_cases';
        	var method_params = [suite_id];
        	draw_pagination(method_name, method_params, 'case_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}