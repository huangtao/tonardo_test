function init_index(){
	active_tab('user');
    $.ajax({
        url: 'init_index',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	
        	var product_list = data['result']['product_list'];
        	change_select('select_product', product_list, {'id' : 0, 'name' : '选择所属工作室'}, '');
        	
        	var role_list = data['result']['role_list'];
        	change_select('select_role', role_list, {'id' : 0, 'name' : '选择角色'}, '');
        	
        	var user_list = result["user_list"];
        	draw_tb_user_list(user_list, 1);
        	
        	var method_name = 'get_users';
        	var method_params = [null, null, null, null];
        	draw_pagination(method_name, method_params, 'user_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
    
    //check/uncheck -- product
    $("#cb_users").click(function(){
    	if(this.checked){
    		$("input[id^=cb_user_]").each(function() {
    			this.checked = true;
    		});
    	} else {
    		$("input[id^=cb_user_]").each(function() {
    			this.checked = false;
    		});
    	}
    });
}

function draw_tb_user_list(user_list, cur_page){
	var row_html = "";
	var count = (cur_page - 1) * 10 + 1;
	for (var i in user_list){
		var product_name = user_list[i]['product_name'];
		if (user_list[i]['role_id'] == 1){//系统管理员
			product_name = '';
		}
		
		row_html += '<tr>'
			+ '<td><input id="cb_user_' + user_list[i]['id'] + '" type="checkbox"></td>'
			+ '<td>' + (count++) + '</td>'
			+ '<td><a id="user_' + user_list[i]['id'] + '">' + user_list[i]['name'] + '</a></td>'
			+ '<td>' + user_list[i]['role_name'] + '</td>'
			+ '<td>' + product_name + '</td>'
			+ '<td>' + user_list[i]['create_date'] + '</td>'
			+ '<td>' + user_list[i]['last_login_time'] + '</td>'
			+ '<td>' + user_list[i]['login_times'] + '</td>'
			+ '<td>' + user_list[i]['email'] + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="9">没有任何数据</td></tr>';
	}
	$('#tb_user_list tbody').remove();
	$('#tb_user_list').append(row_html);
	//click
	$("a[id^=user_]").each(function(){
	    $(this).click(function(){
	    	to_user_detail(this);
	    });
	});
}

function get_users(user_name, email, product_id, role_id, cur_page){
	//json data
	var data = {
		user_name : user_name,
		email : email,
		product_id : product_id,
		role_id : role_id,
		cur_page : cur_page
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
        	var result = data['result'];
        	var user_list = result['user_list'];
        	draw_tb_user_list(user_list, cur_page);
        	
        	var method_name = 'get_users';
        	var method_params = [user_name, email, product_id, role_id];
        	draw_pagination(method_name, method_params, 'user_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function to_user_detail(element){
	alert('Coming soon.');
}

function search(){
	var user_name = trim($('#txt_condition_user_name').val());
	var email = trim($('#txt_condition_email').val());
	var product_id = $("#select_product").val();
	var role_id = $("#select_role").val();
	
	get_users(user_name, email, product_id, role_id, 1);
}

function create_user(){
	var product_id = $("#select_product_for_create_modal").val();
	if (product_id == 0){
		show_warning('请选择所属工作室');
		return;
	}
	
	var role_id = $("#select_role_for_create_modal").val();
	if (role_id == 0){
		show_warning('请选择角色');
		return;
	}
	
	var email = trim($('#txt_email').val());
	if (email == ""){
		show_warning('用户名不能为空');
		return;
	}else{
		if (email.length > 20){
			show_warning('Email的字符长度不能超过20');
			return;
		}else{
			 if (check_str2(email) == false){
				 show_warning('Email中只能包含英文字母、数字或下划线');
				 return;
			 }
		}
	}
	var user_name = email;
	
	//json data
	var data = {
		user_name : user_name,
		email : email + '@boyaa.com',
		product_id : product_id,
		role_id : role_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'create_user',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$("#modal_create_user").modal("hide");
        		return;
        	}
        	$("#modal_create_user").modal("hide");
        	var result = data['result'];
        	var user_list = result["user_list"];
        	draw_tb_user_list(user_list, 1);
        	
        	var method_name = 'get_users';
        	var method_params = [null, null, null, null];
        	draw_pagination(method_name, method_params, 'user_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        	$("#modal_create_user").modal("hide");
        }
    });
	
}

function to_create_user(){
    $.ajax({
        url: 'to_create_user',
        type: 'POST',
        async: true,
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var product_list = data['result']['product_list'];
        	change_select('select_product_for_create_modal', product_list, {'id' : 0, 'name' : '选择所属工作室'}, '');
        	
        	var role_list = data['result']['role_list'];
        	change_select('select_role_for_create_modal', role_list, {'id' : 0, 'name' : '选择角色'}, '');
        	
        	$('#txt_email').val('');
        	$("#progress_bar_for_create_modal").hide();
        	$('#modal_create_user').modal("show");
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function to_modify_user(){
	var user_ids = [];
	$("input[id^=cb_user_]").each(function() {
		if($(this).prop("checked") == true){
			var user_id = $(this).attr("id").replace("cb_user_", "");
			user_ids.push(user_id);
		}
	});

	if (user_ids.length == 0){
		show_warning('请选择一个待修改的用户');
		return;
	} else if (user_ids.length > 1){
		show_warning('请选择一个待修改的用户');
		return;
	}
	
	//json data
	var data = {
		user_id : user_ids[0]
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'to_modify_user',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var user = result['user'];
        	
        	var product_name = user['product_name'];
        	var role_name = user['role_name'];
        	
        	var product_list = result['product_list'];
        	change_select('select_product_for_modify_modal', product_list, {'id' : 0, 'name' : '选择所属工作室'}, product_name);
        	
        	var role_list = result['role_list'];
        	change_select('select_role_for_modify_modal', role_list, {'id' : 0, 'name' : '选择角色'}, role_name);
        	
        	//click role
        	$('#select_role_for_modify_modal').change(function(){
        		var role = $(this).val();
        		if (role == 1){
        			$('#select_product_for_modify_modal').attr('disabled','disabled');
        			change_select('select_product_for_modify_modal', product_list, {'id' : 0, 'name' : '选择所属工作室'}, '选择所属工作室');
        		} else {
        			$('#select_product_for_modify_modal').removeAttr('disabled');
        			change_select('select_product_for_modify_modal', product_list, {'id' : 0, 'name' : '选择所属工作室'}, product_name);
        		}
        	});
        	
        	
        	$('#txt_user_name').val(user['name']);
        	$('#txt_user_id').val(user['id']);
        	$('#modal_modify_user').modal('show');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function modify_user(){
	var role_id = $('#select_role_for_modify_modal').val();
	
	//json data
	var data = {
		user_id : $('#txt_user_id').val(),
		product_id : $('#select_product_for_modify_modal').val(),
		role_id : role_id
		
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'modify_user',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		$('#modal_modify_user').modal('hide');
        		return;
        	}
        	$('#modal_modify_user').modal('hide');
        	var result = data['result'];
        	var user_list = result['user_list'];
        	draw_tb_user_list(user_list, 1);
        	
        	var method_name = 'get_users';
        	var method_params = [null, null, null, null];
        	draw_pagination(method_name, method_params, 'user_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function del_user(){
	var user_ids = [];
	$("input[id^=cb_user_]").each(function() {
		if($(this).prop("checked") == true){
			var user_id = $(this).attr("id").replace("cb_user_", "");
			user_ids.push(user_id);
		}
	});

	if (user_ids.length == 0){
		show_warning('请选择待删除用户');
		return;
	}
	
	var confirm_msg = '用户删除后，将无法恢复。继续删除用户吗？';
	if (show_confirm(confirm_msg) == false){
		return;
	}
	
	//json data
	var data = {
		user_ids : user_ids
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'del_users',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var user_list = result["user_list"];
        	draw_tb_user_list(user_list, 1);
        	
        	var method_name = 'get_users';
        	var method_params = [null, null, null, null];
        	draw_pagination(method_name, method_params, 'user_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}
