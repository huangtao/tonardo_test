function init_index(){
	active_tab('log');
    $.ajax({
        url: 'init_index',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var log_list = data['result']['log_list'];
        	draw_tb_log_list(log_list);
        	
        	var method_name = 'get_logs';
        	var method_params = [null, -1];
        	draw_pagination(method_name, method_params, 'log_pagination', 1, result['total_page'], result['total_count']);
        },
        error: function (request, error, errorThrown) {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function get_logs(user_name, operate_status, cur_page){
	
	//json data
	var data = {
		user_name : user_name,
		operate_status : operate_status,
		cur_page : cur_page
	};
	var json_data = JSON.stringify(data);
	
    $.ajax({
        url: 'get_logs',
        type: 'POST',
        data: json_data,
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	var result = data['result'];
        	var log_list = data['result']['log_list'];
        	draw_tb_log_list(log_list);
        	
        	var method_name = 'get_logs';
        	var method_params = [user_name, operate_status];
        	draw_pagination(method_name, method_params, 'log_pagination', result['cur_page'], result['total_page'], result['total_count']);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function search(){
	var user_name = trim($('#txt_condition_user_name').val());
	var operate_status = $('#select_status').val();
	get_logs(user_name, operate_status, 1);
}

function del_logs(){
    $.ajax({
        url: 'del_logs',
        type: 'POST',
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	
        	draw_tb_log_list(null);
        	draw_pagination('get_logs', [null, null], 'log_pagination', 1, 0, 0);
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });
}

function draw_tb_log_list(log_list){
	var row_html = "";
	var count = 1;
	if (log_list != null){
		for (var i in log_list){
			var status = operate_status_2_str(log_list[i]['status']);
			row_html += '<tr id="log_' + log_list[i]['id'] + '">'
				+ '<td>' + (count++) + '</td>'
				+ '<td>' + log_list[i]['user_name'] + '</td>'
				+ '<td>' + log_list[i]['content'] + '</td>'
				+ '<td>' + status + '</td>'
				+ '<td>' + log_list[i]['create_date'] + '</td>'
				+ '</tr>';
		}
	}
	
	if (row_html == ""){
		row_html = '<tr><td colspan="5">没有任何数据</td></tr>';
	}
	draw_table('tb_log_list', row_html);
}

function operate_status_2_str(operate_status){
	var status = '';
	if (operate_status == 0){
		status = '失败';
	} else if (operate_status == 1){
		status = '成功';
	}
	return status;
}