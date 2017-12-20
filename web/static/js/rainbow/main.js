$(function(){
	active_tab('main');
	
    var case_summary = [];
    var case_coverage_rate = [];
    
    $.ajax({
        url: '/main/init_index',
        type: 'POST',
        async: false,
        data: {},
        success: function (data) {
        	if (error_message(data) == true){
        		return;
        	}
        	case_summary = data["result"]['case_summary'];
        	case_coverage_rate = data["result"]['case_coverage'];
        },
        error: function () {
        	show_danger('系统错误，请通知管理员');
        }
    });

    //var ctx = document.getElementById("chart-area").getContext("2d");
    var case_sum = $("#case_summary").get(0).getContext("2d");
	var pie1 = new Chart(case_sum).Pie(case_summary);
	var case_coverage = $("#case_coverage").get(0).getContext("2d");
	var pie2 = new Chart(case_coverage).Pie(case_coverage_rate);
});