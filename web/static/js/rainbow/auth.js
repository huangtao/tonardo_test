function init_login(){
	$('#rainbow_navbar').hide();
	$('#rainbow_footer').hide();
	$('#txt_user_name').focus();
	$('#txt_password').keydown(function(e){
		if(e.keyCode == 13){//回车
			login();
		}
	});
}

function login_as_guest(){
	$('#txt_user_name').val('Guest');
	$('#txt_password').val('Guest');
	login();
}

function login(){
	var user_name = $('#txt_user_name').val();
	var password = $('#txt_password').val();
	var next = $.get_url_var('next');
	if (next == null || next == undefined){
		next = '/';
	}
	
	//json data
	var data = {
		user_name : user_name,
		password : password
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'login',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	window.location.href = decodeURIComponent(next);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function logout(){
	window.location.href = '/logout';
}


function to_modify_pwd(){
	$('#txt_old_pwd').val('');
	$('#txt_new_pwd').val('');
	$('#txt_confirm_pwd').val('');
	$('#modal_modify_pwd').modal("show");
}

function modify_pwd(){
	$('#modal_modify_pwd').modal("hide");
	
	var old_pwd = trim($('#txt_old_pwd').val());
	var new_pwd = trim($('#txt_new_pwd').val());
	var confirm_pwd = trim($('#txt_confirm_pwd').val());
	
	if (old_pwd == ""){
		show_warning('密码不能为空');
		return;
	}else{
		if (old_pwd.length > 10 || old_pwd.length < 6){
			show_warning('密码长度为6-10');
			return;
		}else{
			 if (check_str2(old_pwd) == false){
				 show_warning('密码中只能包含英文字母、数字或下划线');
				 return;
			 }
		}
	}
	
	if (new_pwd == ""){
		show_warning('新密码不能为空');
		return;
	}else{
		if (new_pwd.length > 10 || new_pwd.length < 6){
			show_warning('密码长度为6-10');
			return;
		}else{
			 if (check_str2(new_pwd) == false){
				 show_warning('密码中只能包含英文字母、数字或下划线');
				 return;
			 }
		}
	}
	
	if (confirm_pwd != new_pwd){
		show_warning('确认密码与新密码不一致');
		return;
	}
	
	//json data
	var data = {
		old_pwd : old_pwd,
		new_pwd : new_pwd
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: '/user/modify_pwd',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	show_info('修改密码成功');
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}