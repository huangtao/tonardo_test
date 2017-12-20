function init_index(){
	active_tab('system');
	$("#btn_cancel_db").hide();
	$("#btn_save_db").hide();
	
	$("#btn_cancel_share_folder").hide();
	$("#btn_save_share_folder").hide();
	
	$("#btn_cancel_svn").hide();
	$("#btn_save_svn").hide();
	
	$("#base_data").find("input[id^=txt_condition_]").each(function() {
		$(this).val("");
	});
	$("input[type='checkbox']").each(function() {
		$(this).removeAttr("checked");
	});
    
	var str = $.get_url_var('tab_href');
	if (str !== null && str !== undefined && trim(str) != ""){
		var tab_name = str.split(",")[0];
		$('ul.nav-tabs a[href="#' + tab_name + '"]').tab('show');
		show_tab(tab_name);
	}
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		var tab_name = $(e.target).attr("href").substr(1); // activated tab
		show_tab(tab_name);
	});
	
	$("a[id^=project_]").each(function(){
	    $(this).click(function(){
	    	get_project_detail(this);
	    });
	});
	
	$("a[id^=product_]").each(function(){
	    $(this).click(function(){
	    	get_product_detail(this);
	    });
	});
	
	$("#project_info").find("button[id^=btn_update_test_case_]").each(function() {
	    $(this).click(function(){
	    	open_update_case_modal(this);
	    });
	});
    $("#cb_products").click(function(){
    	if(this.checked){
    		$("input[id^=cb_product_]").each(function() {
    			this.checked = true;
    		});
    	} else {
    		$("input[id^=cb_product_]").each(function() {
    			this.checked = false;
    		});
    	}
    });
    
    //check/uncheck -- project
    $("#cb_projects").click(function(){
    	if(this.checked){
    		$("input[id^=cb_project_]").each(function() {
    			this.checked = true;
    		});
    	} else {
    		$("input[id^=cb_project_]").each(function() {
    			this.checked = false;
    		});
    	}
    });
    
	//click product(创建project时)
	$("#select_product_for_modal").change(function(){
		$('#txt_svn_url').val('');
	});
}

function init_base_info_tab(){
	active_tab('system');
}

function init_product_info_tab(){
	active_tab('system');
}

function init_project_info_tab(){
	active_tab('system');
}

function init_modify_project(){
	active_tab('system');
}

function init_product_detail(){
	active_tab('system');
}

function init_project_detail(){
	active_tab('system');
	
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	var data = {
		project_id : project_id
	};
	
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'init_project_detail',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	var result = data['result'];
        	var ui_repository = result['ui_repository'];
        	draw_tb_ui_repository(ui_repository['list'], 1);
        	draw_pagination('get_ui_repository', [project_id], 'ui_repository_pagination', 1, ui_repository['total_page'], ui_repository['total_count']);
        	
        	var apks = result['apks'];
        	draw_tb_apk(apks['list'], 1);
        	draw_pagination('get_apks', [project_id], 'apk_pagination', 1, apks['total_page'], apks['total_count']);
        	
        	var packages = result['packages'];
        	draw_tb_upgrade_package(packages['list'], 1);
        	draw_pagination('get_upgrade_package', [project_id], 'upgrade_package_pagination', 1, packages['total_page'], packages['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
	
	$('#edit_svn_url').click(function(){//点击编辑图标
		if($('#txt_svn_url').attr('readonly') == undefined){
			modify_project_svn_url();
		} else {
			$('#txt_svn_url').removeAttr('readonly');
			$('#txt_svn_url').css('border-color', '#1abc9c');
			$('#edit_svn_url').css('border-color', '#1abc9c');
			$('#edit_svn_url').css('background-color', '#1abc9c');
		}
	});
	
	$('#txt_svn_url').blur(function(){
		modify_project_svn_url();
	});
	
	$('#edit_desc').click(function(){//点击编辑图标
		if($('#txt_desc').attr('readonly') == undefined){
			modify_project_desc();
		} else {
			$('#txt_desc').removeAttr('readonly');
			$('#txt_desc').css('border-color', '#1abc9c');
			$('#edit_desc').css('border-color', '#1abc9c');
			$('#edit_desc').css('background-color', '#1abc9c');
		}
	});
	
	$('#txt_desc').blur(function(){
		modify_project_desc();
	});
}

function modify_project_svn_url(){
	var svn_url = trim($('#txt_svn_url').val());
	if (svn_url == ""){
		show_warning('SVN URL不能为空');
		return;
	}else{
		if (svn_url.length > 256){
			show_warning('SVN URL的字符长度不能超过256');
			return;
		}else{
			 if (is_url(svn_url) == false){
				 show_warning('SVN URL的格式错误');
				 return;
			 }
		}
	}
	
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	var data = {
		project_id : project_id,
		svn_url : svn_url
	};
	
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'update_project',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	$('#txt_svn_url').attr('readonly','readonly');
			$('#txt_svn_url').css('border-color', '#d5dbdb');
			$('#edit_svn_url').css('border-color', '#d5dbdb');
			$('#edit_svn_url').css('background-color', '#d5dbdb');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function modify_project_desc(){
	var project_desc = trim($('#txt_desc').val());
	if (project_desc != ""){
		if (project_desc.length > 100){
			show_warning('项目描述的字符长度不能超过100');
			return;
		}else{
			 if (check_str1(project_desc) == false){
				 show_warning('项目描述中只能包含数字、字母或中文');
				 return;
			 }
		}
	}
	
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	var data = {
		project_id : project_id,
		project_desc : project_desc
	};
	
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'update_project',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	$('#txt_desc').attr('readonly','readonly');
			$('#txt_desc').css('border-color', '#d5dbdb');
			$('#edit_desc').css('border-color', '#d5dbdb');
			$('#edit_desc').css('background-color', '#d5dbdb');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function show_tab(tab_name){
	if (tab_name == 'product_info'){
		get_products(null, null, 1);
	} else if (tab_name == 'project_info'){
		get_projects(null, null, null, 1);
	}
}

function modify_share_folder(){
	$("#btn_modify_share_folder").hide();
	$("#btn_cancel_share_folder").show();
	$("#btn_save_share_folder").show();
	$('#txt_share_folder').attr('disabled', false);
}

function save_share_folder(){
	//check
	var share_folder = trim($('#txt_share_folder').val());
	if (share_folder == ""){
		show_warning("共享目录不能为空。");
		return;
	}
	
	$("#btn_modify_share_folder").show();
	$("#btn_cancel_share_folder").hide();
	$("#btn_save_share_folder").hide();
	$('#txt_share_folder').attr('disabled', true);
	
	//json data
	var data = {
		share_folder : share_folder
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'save_share_folder',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var share_folder_info = data["result"]['share_folder_info']
        	$('#txt_share_folder').val(share_folder_info['share_folder']);
        	$('#txt_share_folder').attr('disabled', true);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function cancel_share_folder(){
	$("#btn_modify_share_folder").show();
	$("#btn_cancel_share_folder").hide();
	$("#btn_save_share_folder").hide();
	
    $.ajax({
        url: 'get_share_folder_info',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var share_folder_info = data["result"]['share_folder_info']
        	$('#txt_share_folder').val(share_folder_info['share_folder']);
        	$('#txt_share_folder').attr('disabled', true);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function modify_db(){
	$("#btn_modify_db").hide();
	$("#btn_cancel_db").show();
	$("#btn_save_db").show();
	$("#base_info").find('input[id^=txt_db_]').each(function() {
		$(this).attr('disabled', false);
	});
}

function save_db(){
	//check
	var check = check_db();
	if (check == false){
		return;
	}
	
	$("#btn_modify_db").show();
	$("#btn_cancel_db").hide();
	$("#btn_save_db").hide();
	$("#base_info").find('input[id^=txt_db_]').each(function() {
		$(this).attr('disabled', true);
	});
	
	var host = trim($("#txt_db_host").val());
	var port = trim($("#txt_db_port").val());
	var user = trim($("#txt_db_user").val());
	var password = trim($("#txt_db_password").val());
	
	//json data
	var data = {
		user : user,
		password : password,
		host : host,
		port : port
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'save_db',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var db_info = data["result"]['db_info']
        	set_db_info(db_info);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function check_db(){
	var success = true;
	
	return success;
}

function cancel_db(){
	$("#btn_modify_db").show();
	$("#btn_cancel_db").hide();
	$("#btn_save_db").hide();
	
    $.ajax({
        url: 'get_db_info',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var db_info = data["result"]['db_info']
        	set_db_info(db_info);
        	$("#base_info").find('input[id^=txt_db_]').each(function() {
        		$(this).attr('disabled', true);
        	});
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function set_db_info(db_info){
	$("#txt_db_host").val(db_info['host']);
	$("#txt_db_port").val(db_info['port']);
	$("#txt_db_user").val(db_info['user']);
	$("#txt_db_password").val(db_info['password']);
}

function modify_svn(){
	$("#btn_modify_svn").hide();
	$("#btn_cancel_svn").show();
	$("#btn_save_svn").show();
	$("#base_info").find('input[id^=txt_svn_]').each(function() {
		$(this).attr('disabled', false);
	});
}

function save_svn(){
	//check
	var check = check_svn();
	if (check == false){
		return;
	}
	
	$("#btn_modify_svn").show();
	$("#btn_cancel_svn").hide();
	$("#btn_save_svn").hide();
	$("#base_info").find('input[id^=txt_svn_]').each(function() {
		$(this).attr('disabled', true);
	});
	
	var user_name = trim($("#txt_svn_user_name").val());
	var password = trim($("#txt_svn_password").val());
	
	//json data
	var data = {
		user_name : user_name,
		password : password
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'save_svn',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var svn_info = data["result"]['svn_info']
        	set_svn_info(svn_info);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function check_svn(){
	var success = true;
	
	return success;
}

function cancel_svn(){
	$("#btn_modify_svn").show();
	$("#btn_cancel_svn").hide();
	$("#btn_save_svn").hide();
	
    $.ajax({
        url: 'get_svn_info',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var svn_info = data["result"]['svn_info']
        	set_svn_info(svn_info);
        	$("#base_info").find('input[id^=txt_svn_]').each(function() {
        		$(this).attr('disabled', true);
        	});
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function set_svn_info(svn_info){
	$("#txt_svn_user_name").val(svn_info['user_name']);
	$("#txt_svn_password").val(svn_info['password']);
}

function to_create_product(){
	//show modal
	$('#modal_product').modal("show");
	
	$('#select_svn_product').val(0);
	
	//set title
	$("#title").html('新建工作室');
	
	//隐藏进度条
	$("#progress_bar_for_product").hide();
	
	//清空输入框
	$("#txt_product_name").val("");
	$("#txt_svn_url").val("");
	$("#txt_product_desc").val("");
}

function save_product(){
	var product_name = $.trim($("#txt_product_name").val());
	var svn_path = trim($("#txt_svn_url").val());
	var product_desc = trim($("#txt_product_desc").val());
	var product_id = $("#txt_product_id").val();
	
	if (product_name == ""){
		show_warning('工作室名称不能为空');
		return;
	}else{
		if (product_name.length > 20){
			show_warning('工作室名称的字符长度不能超过20');
			return;
		}else{
			 if (check_str1(product_name) == false){
				 show_warning('工作室名称中只能包含英文字母、数字或中文');
				return;
			 }
		}
	}
	
//	if ($('#select_svn_product').val() == 0){
//		show_warning('请选择SVN对应工作室');
//		return;
//	}
//	var svn_path = $('#select_svn_product').find('option:selected').text();
	
	if (product_desc != ""){
		if (product_desc.length > 100){
			show_warning('工作室描述的字符长度不能超过100');
			return;
		}else{
			 if (check_str1(product_desc) == false){
				 show_warning('工作室描述中只能包含英文字母、数字或中文');
				return;
			 }
		}
	}
	
	var data = {};
	var url = '';
	if($('#txt_product_name').prop('disabled') == true){
		url = 'update_product';
		data = {
			product_desc : product_desc,
			product_id : product_id,
			svn_path : svn_path
		};
	} else {
		url = 'create_product';
		data = {
			product_name : product_name,
			product_desc : product_desc,
			svn_path : svn_path
		};
	}
	
	var json_data = JSON.stringify(data);
    $.ajax({
        url: url,
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	$('#modal_product').modal("hide");
        	var product_list = data["result"]['product_list'];
    		draw_tb_product(product_list, 1);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
            $('#modal_product').modal("hide");
        }
    });
}

function to_create_project(){
    $.ajax({
        url: 'to_create_project',
        type: 'POST',
        async: true,
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var product_list = data['result']['product_list'];
        	change_select('select_product_for_modal', product_list, {'id' : 0, 'name' : '选择所属工作室'}, '');
        	
        	var data_org_list = data['result']['data_org'];
        	var tmp_data_org_list = [];
        	for (var i in data_org_list){
        		var tmp = {'id' : i, 'name' : data_org_list[i]};
        		tmp_data_org_list[i] = tmp;
        	}
        	change_select('select_data_org', tmp_data_org_list, {'id' : 0, 'name' : '选择数据源'}, '');
        	
        	$('#txt_project_name').val('');
        	$('#txt_svn_url1').val('');
        	$('#txt_project_desc').val('');
        	$('#progress_bar_for_project').hide();
        	$('#modal_project').modal('show');
//        	$('#select_svn_project').val('0');
//        	$('#txt_svn_url').val('');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function create_project(){
	var product_id = $("#select_product_for_modal").val();
	if (product_id == 0){
		show_warning('请选择所属工作室');
		return;
	}
	
	var project_name = trim($("#txt_project_name").val());
	if (project_name == ""){
		show_warning('项目名称不能为空');
		return;
	}else{
		if (project_name.length > 20){
			show_warning('项目名称的字符长度不能超过20');
			return;
		}else{
			 if (check_str1(project_name) == false){
				 show_warning('项目名称中只能包含英文字母、数字或中文');
				 return;
			 }
		}
	}
	
	var svn_url = trim($('#txt_svn_url1').val());
	if (svn_url == ""){
		show_warning('SVN URL不能为空');
		return;
	}else{
		if (svn_url.length > 256){
			show_warning('SVN URL的字符长度不能超过256');
			return;
		}else{
			 if (is_url(svn_url) == false){
				 show_warning('SVN URL的格式错误');
				 return;
			 }
		}
	}
//	if ($('#select_svn_project').val() == 0){
//		show_warning('请选择SVN对应项目');
//		return;
//	}
//	var svn_path = $('#select_svn_project').find('option:selected').text();
	
	var data_org_id = $('#select_data_org').val();
	var data_org = '';
	if (data_org_id == 0){
		show_warning('请选择数据源');
		return;
	}else{
		data_org = $('#select_data_org').find("option:selected").text();
	}
	
	var project_desc = $('#txt_project_desc').val();
	if (project_desc != ""){
		if (project_desc.length > 100){
			show_warning('项目描述的字符长度不能超过100');
			return;
		}else{
			 if (check_str1(project_desc) == false){
				 show_warning('项目描述中只能包含数字、字母或中文');
				 return;
			 }
		}
	}
	
	var scan_case = 0;//0: not scan; 1: scan
	if($('#cb_scan_case').prop("checked") == true){
		scan_case = 1;
	}
	
	var data = {
		project_name : project_name,
		project_desc : project_desc,
		product_id : product_id,
		svn_url : svn_url,
		data_org : data_org,
//		svn_path : svn_path
		scan_case : scan_case
	};

	$('#progress_bar_for_project').show();
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'create_project',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_project').modal('hide');
        		return;
        	}
    		$('#modal_project').modal('hide');
        	
        	var project_list = data['result']['project_list'];
    		draw_tb_project(project_list, 1);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
            $("#modal_product").modal("hide");
        }
    });
}

function modify_project(){
	var project_id = $('#txt_project_id').val();
	
	var svn_url = trim($("#txt_svn_url").val());
	if (svn_url == ""){
		show_warning('SVN URL不能为空');
		return;
	}else{
		if (svn_url.length > 256){
			show_warning('SVN URL的字符长度不能超过256');
			return;
		}else{
			 if (is_url(svn_url) == false){
				 show_warning('SVN URL的格式错误');
				 return;
			 }
		}
	}
	
	var project_desc = trim($("#txt_project_desc").val());
	if (project_desc != ""){
		if (project_desc.length > 100){
			show_warning('项目描述的字符长度不能超过100');
			return;
		}else{
			 if (check_str1(project_desc) == false){
				 show_warning('项目描述中只能包含数字、字母或中文');
				 return;
			 }
		}
	}
	
	var scan_case = 0;//0: not scan; 1: scan
	if($('#cb_scan_case').prop("checked") == true){
		scan_case = 1;
	}
	
	var scan_ui = 0;//0: not scan; 1: scan
	if($('#cb_scan_ui').prop("checked") == true){
		scan_ui = 1;
	}
	
	var data = {
		project_id : project_id,
		project_desc : project_desc,
		svn_url : svn_url,
		scan_case : scan_case,
		scan_ui : scan_ui
	};
	
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'update_project',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	show_info('项目更新成功');
        	window.location.href = "/system/index#project_info";
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
            $("#modal_product").modal("hide");
        }
    });
}

function search_product(){
	var product_name = trim($('#txt_condition_product_name').val());
	var creator = $('#txt_condition_creator').val();
	
	get_products(product_name, creator, 1);
}

function search_project(){
	var product_id = $("#select_product").val();
	var project_name = trim($('#txt_condition_project_name').val());
	var creator = $('#txt_condition_project_creator').val();
	
	get_projects(product_id, project_name, creator, 1);
}

function draw_tb_product(product_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in product_list){
		row_html += '<tr><td><input id="cb_product_' + product_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ '<td><a id="product_' + product_list[i]['id'] + '">' + product_list[i]['name'] + '</a></td>'
			+ '<td>' + product_list[i]['creator'] + '</td>'
			+ '<td>' + product_list[i]['create_date'] + '</td>'
			+ '<td>' + product_list[i]['update_date'] + '</td>'
			+ '<td>' + product_list[i]['project_sum'] + '</td>'
			+ '<td>' + product_list[i]['desc'] + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="8">没有任何数据</td></tr>';
	}
	$('#tb_product tbody').remove();
	$('#tb_product').append(row_html);
	
	$("a[id^=product_]").each(function(){
	    $(this).click(function(){
	    	get_product_detail(this);
	    });
	});
}

function draw_tb_project(project_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in project_list){
		row_html += '<tr><td><input id="cb_project_' + project_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ '<td><a id="project_' + project_list[i]['id'] + '">' + project_list[i]['name'] + '</a></td>'
			+ '<td>' + project_list[i]['product_name'] + '</td>'
			+ '<td>' + project_list[i]['creator'] + '</td>'
			+ '<td>' + project_list[i]['create_date'] + '</td>'
			+ '<td>' + project_list[i]['update_date'] + '</td>'
			+ '<td>' + project_list[i]['desc'] + '</td>'
			
		    + '<td width="30%">'
//		    + '<div class="row">'
//			+ '<div class="col-sm-6">'
//			+ '<div class="form-group">'
//			+ '<input id="txt_update_apk_' + project_list[i]['id'] + '" name="txt_update_apk_' + project_list[i]['id'] + '" type="file" class="filestyle btn btn-primary" data-icon="false" data-iconName="glyphicon-inbox">'
//			+ '</div>'
//			+ '</div>'
//			+ '<div class="col-sm-2">'
//			+ '<button id="btn_update_apk_' + project_list[i]['id'] + '" type="button" class="btn btn-primary">更新apk</button>'
//			+ '</div>'
//			+ '</div>'
			+ '<div class="row">'
			+ '<div class="col-sm-8">'
			+ '<button id="btn_update_test_case_' + project_list[i]['id'] + '" type="button" class="btn btn-primary">更新测试用例</button>'
//			+ '&nbsp;'
//			+ '<button id="btn_update_ui_' + project_list[i]['id'] + '" type="button" class="btn btn-primary">更新UI存储库</button>'
			+ '</div>'
			+ '</div>'
			+ '</td>'
			
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="9">没有任何数据</td></tr>';
	}
	$('#tb_project tbody').remove();
	$('#tb_project').append(row_html);
	
	$(":file").filestyle('clear');
	$(":file").filestyle('icon', false);
	
	$("a[id^=project_]").each(function(){
	    $(this).click(function(){
	    	get_project_detail(this);
	    });
	});
	
	$("#project_info").find("button[id^=btn_update_test_case_]").each(function() {
	    $(this).click(function(){
	    	open_update_case_modal(this);
	    });
	});
	
	$("#project_info").find("button[id^=btn_update_apk_]").each(function() {
	    $(this).click(function(){
	    	update_apk(this);
	    });
	});
	
//	$("#project_info").find("button[id^=btn_update_ui_]").each(function() {
//	    $(this).click(function(){
//	    	update_ui_repository(this);
//	    });
//	});
}

function open_update_case_modal(element){
	var project_id = $(element).attr("id").replace("btn_update_test_case_", "");
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
        	
        	var project = data['result']['project'];
        	$('#txt_project_name_for_scan_case').val(project['name']);
        	$('#txt_project_id_for_scan_case').val(project['id']);
        	
        	var version_list = data['result']['version_list'];
        	var tmp_version_list = [];
        	for (var i in version_list){
        		var tmp = {'id' : version_list[i]['id'], 'name' : version_list[i]['svn_version']};
        		tmp_version_list[i] = tmp;
        	}
        	change_select('select_version_for_scan_case', tmp_version_list, {'id' : 0, 'name' : '选择版本'}, '');
        	
        	$('#progress_bar_for_scan_case').hide();
        	$('#modal_scan_case').modal('show');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function scan_cases(){
	var project_id = $('#txt_project_id_for_scan_case').val();
	var version_id = $('#select_version_for_scan_case').val();
	if (version_id == "0"){
		show_warning("请选择版本。");
		return;
	}
	$('#progress_bar_for_scan_case').show();
	//json data
	var data = {
		project_id : project_id,
		version_id : version_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: '/case/scan_cases',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_scan_case').modal('hide');
        		return;
        	}
        	$('#modal_scan_case').modal('hide');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

//function update_test_case(element){
//	var project_id = $(element).attr("id").replace("btn_update_test_case_", "");
//	$(element).val('用例更新中');
//	$(element).attr('disabled', true);
//	//json data
//	var data = {
//		project_id : project_id
//	};
//	var json_data = JSON.stringify(data);
//	
//    $.ajax({
//        url: '/case/scan_cases',
//        type: 'POST',
//        data: json_data,
//        success: function (data) {
//        	if (error_message(data) == false){
//        		show_info('更新测试用例成功');
//        	}
//        	$(element).val('更新测试用例');
//        	$(element).attr('disabled', false);
//        },
//        error: function () {
//        	show_danger('系统错误，请通知管理员');
//        }
//    });
//}

function upload_apk(){
	upload_file(1);
}

function upload_package(){
	upload_file(2);
}

/**
 * 上传文件
 * @param file_type 文件类型，其中：1表示apk；2表示升级包
 */
function upload_file(file_type){
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	var file_ele_name = '';
	var progress_bar_name = '';
	var cancel_btn_name = '';
	var upload_btn_name = '';
	if (file_type == 1){
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
		file_ele_name = 'upload_apk';
		progress_bar_name = 'progress_bar_for_upload_apk';
		cancel_btn_name = 'btn_cancel';
		upload_btn_name = 'btn_upload';
	} else if (file_type == 2){
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
		file_ele_name = 'upload_package';
		progress_bar_name = 'progress_bar_for_upload_package';
		cancel_btn_name = 'btn_package_cancel';
		upload_btn_name = 'btn_package_upload';
	}
	
	$('#' + progress_bar_name).show();
	$('#' + file_ele_name).attr('disabled', true);
	$('#' + cancel_btn_name).attr('disabled', true);
	$('#' + upload_btn_name).attr('disabled', true);
	
	
	var file_obj = document.getElementById(file_ele_name).files[0];
	var form = new FormData();
	form.append('project_id', project_id);
	form.append('file', file_obj);
	form.append('file_type', file_type);
	var xhr = new XMLHttpRequest();
	xhr.open('post', 'upload_file', true);
	xhr.onload = function () {
		if (file_type == 1){
			$('#modal_upload_apk').modal('hide');
			show_info('上传apk成功');
		} else if (file_type == 2){
			$('#modal_upload_package').modal('hide');
			show_info('上传升级包成功');
		}
    	$('#' + file_ele_name).attr('disabled', false);
    	$('#' + cancel_btn_name).attr('disabled', false);
    	$('#' + upload_btn_name).attr('disabled', false);
    	
    	get_files(project_id, file_type, 1);
    };
    xhr.send(form);
}

function update_ui_repository(){
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	$('#btn_update_ui_repository').html('UI存储库更新中');
	$('#btn_update_ui_repository').attr('disabled', true);
	//json data
	var data = {
		project_id : project_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'update_ui_repository',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	show_info('更新UI存储库成功');
        	
        	var result = data['result'];
        	var ui_repository = result['ui_repository'];
        	draw_tb_ui_repository(ui_repository, 1);
        	
        	var method_name = 'get_ui_repository';
        	var method_params = [project_id];
        	draw_pagination(method_name, method_params, 'ui_repository_pagination', 1, result['total_page'], result['total_count']);
        	
        	$('#btn_update_ui_repository').html('更新UI存储库');
        	$('#btn_update_ui_repository').attr('disabled', false);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

//function confirm_del_products(){
//	var product_ids = [];
//	$("input[id^=cb_product_]").each(function() {
//		if($(this).prop("checked") == true){
//			var product_id = $(this).attr("id").replace("cb_product_", "");
//			product_ids.push(product_id);
//		}
//	});
//	
//	if (product_ids.length == 0){
//		show_warning('请选择待删除工作室');
//		return;
//	}
//	
//}

function del_products(){
	var product_ids = [];
	$("input[id^=cb_product_]").each(function() {
		if($(this).prop("checked") == true){
			var product_id = $(this).attr("id").replace("cb_product_", "");
			product_ids.push(product_id);
		}
	});

	if (product_ids.length == 0){
		show_warning('请选择待删除工作室');
		return;
	}
	
	var confirm_msg = '如果所选择工作室下，已经存在测试计划，该工作室仍会被删除。继续删除工作室吗？';
	if (show_confirm(confirm_msg) == false){
		return;
	}
	
	//json data
	var data = {
		product_ids : product_ids
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'del_products',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var product_list = data["result"]['product_list'];
    		draw_tb_product(product_list, 1);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function to_modify_product(){
	var product_ids = [];
	$("input[id^=cb_product_]").each(function() {
		if($(this).prop("checked") == true){
			var product_id = $(this).attr("id").replace("cb_product_", "");
			product_ids.push(product_id);
		}
	});
	
	if (product_ids.length == 0){
		show_warning("请选择待修改工作室。");
		return;
	}
	
	if (product_ids.length > 1){
		show_warning("请选择一个需要修改工作室。");
		return;
	}
	
	var product_id = product_ids[0];
	//json data
	var data = {
		product_id : product_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_product_detail',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	var product = data["result"]['product'];
        	
        	//show_modal
        	$('#modal_product').modal("show");
        	
        	//set title
        	$("#title").html('修改工作室');
        	
        	//隐藏进度条
        	$("#progress_bar_for_product").hide();
        	
        	$("#txt_product_name").val(product['name']);
        	$("#txt_product_name").attr('disabled', true);
        	$("#txt_product_desc").val(product['desc']);
        	$("#txt_product_id").val(product['id']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
            $("#modal_product").modal("hide");
        }
    });
}

function to_modify_project(){
	var project_ids = [];
	$("input[id^=cb_project_]").each(function() {
		if($(this).prop("checked") == true){
			var project_id = $(this).attr("id").replace("cb_project_", "");
			project_ids.push(project_id);
		}
	});
	
	if (project_ids.length == 0){
		show_warning("请选择待修改项目。");
		return;
	}
	
	if (project_ids.length > 1){
		show_warning("请选择一个需要修改项目。");
		return;
	}
	
	var project_id = project_ids[0];
	window.location.href = "/system/to_modify_project?project_id=" + project_id;
}

function modify_project_in_detail(project_id){
	window.location.href = "/system/to_modify_project?project_id=" + project_id;
}

function del_projects(){
	var project_ids = [];
	$("input[id^=cb_project_]").each(function() {
		if($(this).prop("checked") == true){
			var project_id = $(this).attr("id").replace("cb_project_", "");
			project_ids.push(project_id);
		}
	});
	
	if (project_ids.length == 0){
		show_warning("请选择待删除项目。");
		return;
	}
	
	var confirm_msg = '确定删除所选项目吗？';
	if (show_confirm(confirm_msg) == false){
		return;
	}
	
	//json data
	var data = {
		project_ids : project_ids
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'del_projects',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var project_list = data["result"]['project_list'];
    		draw_tb_project(project_list, 1);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function get_product_detail(element){
	var product_id = $(element).attr("id").replace("product_", "");
	window.location.href = "/system/to_product_detail?product_id=" + product_id;
}

function get_project_detail(element){
	var project_id = $(element).attr("id").replace("project_", "");
	window.location.href = "/system/to_project_detail?project_id=" + project_id + "&cur_page=" + 1;
}

function get_ui_repository(project_id, cur_page){
	//json data
	var data = {
		project_id : project_id,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'get_ui_repository',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var ui_repository = result['ui_repository'];
        	draw_tb_ui_repository(ui_repository, result['cur_page']);
        	
        	var method_name = 'get_ui_repository';
        	var method_params = [project_id];
        	draw_pagination(method_name, method_params, 'ui_repository_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function get_files(project_id, file_type, cur_page){
	//json data
	var data = {
		project_id : project_id,
		file_type : file_type,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'get_files',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var method_name = 'get_files';
        	var method_params = [project_id, file_type];
        	if (file_type == 1){
        		var apk_list = result['apk_list'];
        		draw_tb_apk(apk_list, result['cur_page']);
        		draw_pagination(method_name, method_params, 'apk_pagination', result['cur_page'], result['total_page'], result['total_count']);
        	} else if (file_type == 2){
        		var package_list = result['package_list'];
        		draw_tb_upgrade_package(package_list, 1);
            	draw_pagination(method_name, method_params, 'upgrade_package_pagination', result['cur_page'], result['total_page'], result['total_count']);
        	}
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_ui_repository(ui_repository, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in ui_repository){
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + ui_repository[i]['page_name'] + '</td>'
			+ '<td>' + ui_repository[i]['name'] + '</td>'
			+ '<td>' + ui_repository[i]['find_method'] + '</td>'
			+ '<td>' + ui_repository[i]['value'] + '</td>'
			+ '<td>' + ui_repository[i]['index'] + '</td>'
			+ '<td>' + ui_repository[i]['desc'] + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="7">没有任何数据</td></tr>';
	}
	$('#tb_ui_repository tbody').remove();
	$('#tb_ui_repository').append(row_html);
}

function draw_tb_apk(apk_list, cur_page){
	var row_html = "";
	var operator = '';
	var count = (cur_page - 1) * 10 + 1;
	for (var i in apk_list){
		operator = '<button onclick="open_update_modal(' + apk_list[i]['id'] + ', 1)" type="button" class="btn btn-xs btn-primary" title="更新APK"><span class="glyphicon glyphicon-refresh"></span>&nbsp;</button>'
			+ '&nbsp;'
			+ '<button onclick="delete_file(' + apk_list[i]['id'] + ', 1)" type="button" class="btn btn-xs btn-primary" title="删除APK"><span class="glyphicon glyphicon-minus"></span>&nbsp;</button>';
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + apk_list[i]['file_name'] + '</td>'
			+ '<td>' + apk_list[i]['version'] + '</td>'
			+ '<td>' + apk_list[i]['create_date'] + '</td>'
			+ '<td>' + apk_list[i]['update_date'] + '</td>'
			+ '<td>' + apk_list[i]['package_name'] + '</td>'
			+ '<td>' + apk_list[i]['desc'] + '</td>'
			+ '<td>' + operator + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="8">没有任何数据</td></tr>';
	}
	$('#tb_apk tbody').remove();
	$('#tb_apk').append(row_html);
}

function draw_tb_upgrade_package(package_list, cur_page){
	var row_html = "";
	var operator = '';
	var count = (cur_page - 1) * 10 + 1;
	for (var i in package_list){
		operator = '<button onclick="open_update_modal(' + package_list[i]['id'] + ', 2)" type="button" class="btn btn-xs btn-primary" title="更新升级包"><span class="glyphicon glyphicon-refresh"></span>&nbsp;</button>'
			+ '&nbsp;'
			+ '<button onclick="delete_file(' + package_list[i]['id'] + ', 2)" type="button" class="btn btn-xs btn-primary" title="删除升级包"><span class="glyphicon glyphicon-minus"></span>&nbsp;</button>';
		row_html += '<tr>'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + package_list[i]['file_name'] + '</td>'
			+ '<td>' + package_list[i]['create_date'] + '</td>'
			+ '<td>' + package_list[i]['update_date'] + '</td>'
			+ '<td>' + operator + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="5">没有任何数据</td></tr>';
	}
	$('#tb_upgrade_package tbody').remove();
	$('#tb_upgrade_package').append(row_html);
}

function get_products(product_name, creator, cur_page){
	//json data
	var data = {
		product_name : product_name,
		creator : creator,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_products',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var product_list = result['product_list'];
        	draw_tb_product(product_list, cur_page);
        	
        	var method_name = 'get_products';
        	var method_params = [product_name, creator];
        	draw_pagination(method_name, method_params, 'product_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function get_projects(product_id, project_name, creator, cur_page){
	//json data
	var data = {
		product_id : product_id,
		project_name : project_name,
		creator : creator,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_projects',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var project_list = result['project_list'];
        	draw_tb_project(project_list, cur_page);
        	
        	var method_name = 'get_projects';
        	var method_params = [product_id, project_name, creator];
        	draw_pagination(method_name, method_params, 'project_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function search_ui(){
	alert('Coming soon.');
}

function open_upload_modal(file_type){
	if (file_type == 1){//apk
		if (!show_confirm("目前仅支持测试包，不支持无debug日志、不能切换环境的包。如要继续请点击【OK】。")){
			return;
		}
		$('#progress_bar_for_upload_apk').hide();
		$('#modal_upload_apk').modal('show');
	} else if (file_type == 2){//升级包
		$('#progress_bar_for_upload_package').hide();
		$('#modal_upload_package').modal('show');
	}
}

function open_update_modal(obj_id, file_type){
	if (file_type == 1){//apk
		if (!show_confirm("目前仅支持测试包，不支持无debug日志、不能切换环境的包。如要继续请点击【OK】。")){
			return;
		}
		$('#progress_bar_for_update_apk').hide();
		$('#modal_update_apk').modal('show');
		$('#txt_apk_id').val(obj_id);
	} else if (file_type == 2){//升级包
		$('#progress_bar_for_update_package').hide();
		$('#modal_update_package').modal('show');
		$('#txt_package_id').val(obj_id);
	}
}

/**
 * 更新文件
 * @param file_type 文件类型，其中：1表示apk；2表示升级包
 */
function update_file(file_type){
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	var file_ele_name = '';
	var progress_bar_name = '';
	var cancel_btn_name = '';
	var update_btn_name = '';
	if (file_type == 1){
		obj_id = $('#txt_apk_id').val();
		var file_path = trim($('#update_apk').val());
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
		file_ele_name = 'update_apk';
		progress_bar_name = 'progress_bar_for_update_apk';
		cancel_btn_name = 'btn_update_apk_cancel';
		update_btn_name = 'btn_update_apk_update';
	} else if (file_type == 2){
		obj_id = $('#txt_package_id').val();
		var file_path = trim($('#update_package').val());
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
		file_ele_name = 'update_package';
		progress_bar_name = 'progress_bar_for_update_package';
		cancel_btn_name = 'btn_update_package_cancel';
		update_btn_name = 'btn_update_package_update';
	}
	$('#' + progress_bar_name).show();
	$('#' + file_ele_name).attr('disabled', true);
	$('#' + cancel_btn_name).attr('disabled', true);
	$('#' + update_btn_name).attr('disabled', true);
	
	var file_obj = document.getElementById(file_ele_name).files[0];
	var url = 'update_file';
	var form = new FormData();
	form.append('project_id', project_id);
	form.append('file_type', file_type);
	form.append('obj_id', obj_id);
	form.append('file', file_obj);
	var xhr = new XMLHttpRequest();
	xhr.open('post', url, true);
	xhr.onload = function () {
		if (file_type == 1){
			$('#modal_update_apk').modal('hide');
			show_info('更新apk成功');
		} else if (file_type == 2){
			$('#modal_update_package').modal('hide');
			show_info('更新升级包成功');
		}
    	$('#' + file_ele_name).attr('disabled', false);
    	$('#' + cancel_btn_name).attr('disabled', false);
    	$('#' + update_btn_name).attr('disabled', false);
    	
    	get_files(project_id, file_type, 1);
    };
    xhr.send(form);
}

/**
 * 删除文件
 * @param obj_id
 * @param file_type
 */
function delete_file(obj_id, file_type){
	var message = '';
	if (file_type == 1){//apk
		message = '确定删除所选APK？';
	} else if (file_type == 2){//升级包
		message = '确定删除所选升级包？';
	}
	
	
	if (!show_confirm(message)){
		return;
	}
	
	var str = $.get_url_var('project_id');
	var project_id = str.split(",")[0];
	
	//json data
	var data = {
		obj_id : obj_id,
		project_id : project_id,
		file_type : file_type
	};
	var json_data = JSON.stringify(data);
    $.ajax({
        url: 'del_file',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	if (file_type == 1){//apk
        		var apks = result['apks'];
            	draw_tb_apk(apks['list'], 1);
            	draw_pagination('get_apks', [project_id], 'apk_pagination', 1, apks['total_page'], apks['total_count']);
        	} else if (file_type == 2){//升级包
        		var packages = result['packages'];
            	draw_tb_upgrade_package(packages['list'], 1);
            	draw_pagination('get_upgrade_package', [project_id], 'upgrade_package_pagination', 1, packages['total_page'], packages['total_count']);
        	}
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}
