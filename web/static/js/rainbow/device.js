function init_index(){
	active_tab('device');
    $.ajax({
        url: 'get_devices',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var device_list = data['result']['device_list'];
        	draw_tb_device_list(device_list);
        },
        error: function (request, error, errorThrown) {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_device_list(device_list){
	var row_html = "";
	var count = 1;
	for (var i in device_list){
		var status = device_status_2_str(device_list[i]['status']);
		var os_type = device_ostype_2_str(device_list[i]['os_type']);
		var use = device_use_2_str(device_list[i]['use']);
		var operator = '<button onclick="to_modify_device(' + device_list[i]['id'] + ')" type="button" class="btn btn-xs btn-primary" title="修改">'
			+ '<span class="glyphicon glyphicon-edit"></span>&nbsp;'
			+ '</button>';
		row_html += '<tr id="device_' + device_list[i]['id'] + '">'
			+ '<td>' + (count++) + '</td>'
			+ '<td>' + device_list[i]['name'] + '</td>'
			+ '<td>' + device_list[i]['serial_no'] + '</td>'
			+ '<td>' + os_type + '</td>'
			+ '<td>' + device_list[i]['create_date'] + '</td>'
			+ '<td>' + device_list[i]['update_date'] + '</td>'
			+ '<td>' + use + '</td>'
			+ '<td>' + status + '</td>'
			+ '<td>' + device_list[i]['desc'] + '</td>'
			+ '<td>' + operator + '</td>'
			+ '</tr>';
	}
	if (row_html == ""){
		row_html = '<tr><td colspan="10">没有任何数据</td></tr>';
	}
	draw_table('tb_device_list', row_html);
}

function device_status_2_str(device_status){
	var status = '';
	if (device_status == 0){//未占用
		status = '未占用';
	} else if (device_status == 1){//占用
		status = '占用';
	} else if (device_status == 2){//离线
		status = '离线';
	}
	return status;
}

function device_ostype_2_str(device_os_type){
	var os_type = '';
	if (device_os_type == 0){
		os_type = '未知';
	} else if (device_os_type == 1){
		os_type = 'Android';
	} else if (device_os_type == 2){
		os_type = 'iOS';
	}
	return os_type;
}

function device_use_2_str(device_use){
	var use = '';
	if (device_use == 1){
		use = '测试专用';
	} else if (device_use == 2){
		use = '运维专用';
	}
	return use;
}

function search(){
	var os_type = $('#select_os').val();
	var name = trim($("#txt_condition_name").val());
	var sn = trim($("#txt_condition_sn").val());
	
	//json data
	var data = {
		os_type : os_type,
		name :　name,
		sn : sn
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'search',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var device_list = data['result']['device_list'];
        	draw_tb_device_list(device_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}

function to_modify_device(device_id){
	//json data
	var data = {
		device_id : device_id
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'init_modify_device',
        type: 'POST',
        async: true,
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	$("#modal_modify_device").modal("show");
        	var result = data['result'];
        	var device = result['device'];
        	$('#txt_name').val(device['name']);
        	$('#txt_sn').val(device['serial_no']);
        	$('#txt_os').val(device_ostype_2_str(device['os_type']));
        	$('#txt_device_id').val(device['id']);
        	
        	
        	var use_list = [
                {'id' : 1, 'name' : '测试专用'},
                {'id' : 2, 'name' : '运维专用'}
        	];
        	var selected_item = device_use_2_str(device['use']);
        	change_select('select_use', use_list, {'id' : 0, 'name' : '选择设备'}, selected_item);
        	
        	$('#txt_desc').val(device['desc']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        	$("#modal_modify_device").modal("hide");
        }
    });
}

function modify_device(){
	var use = $("#select_use").val();
	if (use == 0){
		show_warning('请选择设备用途');
		return false;
	}
	
	var desc = trim($("#txt_desc").val());
	if (desc != ""){
		if (desc.length > 100){
			show_warning('设备描述的字符长度不能超过100');
			return false;
		}
	}
	//json data
	var data = {
		device_id : $('#txt_device_id').val(),
		desc : desc,
		use : use
	};
	
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'modify_device',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	$('#modal_modify_device').modal("hide");
        	var device_list = data['result']['device_list'];
        	draw_tb_device_list(device_list);
        },
        error: function () {
            show_danger('系统错误，请通知管理员');
        }
    });
}