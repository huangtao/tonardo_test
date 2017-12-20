var http_path = "/";

//获取url中的参数
$.extend({
	get_url_vars : function() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	get_url_var : function(name) {
		return $.get_url_vars()[name];
	}
});

Chart.defaults.global.customTooltips = function(tooltip) {
	// Tooltip Element
    var tooltipEl = $('#chartjs-tooltip');
    // Hide if no tooltip
    if (!tooltip) {
        tooltipEl.css({
            opacity: 0
        });
        return;
    }
    // Set caret Position
    tooltipEl.removeClass('above below');
    tooltipEl.addClass(tooltip.yAlign);
    // Set Text
    tooltipEl.html(tooltip.text);
    // Find Y Location on page
    var top;
    if (tooltip.yAlign == 'above') {
        top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
    } else {
        top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
    }
    // Display, position, and set styles for font
    tooltipEl.css({
        opacity: 1,
        left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
        top: tooltip.chart.canvas.offsetTop + top + 'px',
        fontFamily: tooltip.fontFamily,
        fontSize: tooltip.fontSize,
        fontStyle: tooltip.fontStyle,
    });
};

function click_a(relative_path){
	url = "/";
	if (relative_path != "/") {
		url = http_path + relative_path;
	}
    window.location.href = url;
}

function active_tab(tab_name){
	$('#rainbow_nav li a').each(function(){
		var id = $(this).attr("id");
		if (id == tab_name){
			$(this).parent().addClass('active');
		}
	});
}

function click_nav(relative_path){
	var tab_name = relative_path.split('/')[0];
	$('#rainbow_nav li').removeClass('active');
	var url = relative_path;
	if (tab_name == 'main'){
		url = '/';
	}
	click_a(url);
	active_tab(tab_name);
}

function trim(str) {
	var ret = '';
	if (str !== null && str !== undefined && str.replace(/(^\s*)|(\s*$)/g, "").length != 0){
		ret = str.replace(/(^\s+)|(\s+$)/g, "");
	}
	return ret;
}

/**
 * 判断字符串只能为数字、字母或中文
 * @param str
 */
function check_str1(str){
	var regex = /^[^_][/\u4E00-\u9FA5a-zA-Z0-9\-]*$/ ;
	var ret = regex.test(str);
    return ret;
}

/**
 * 判断字符串只能为数字、字母或下划线
 * @param str
 * @returns
 */
function check_str2(str){
	var regex = /^\w+$/;
	var ret = regex.test(str);
    return ret;
}

function check_str3(str){
	var regex = /^[/\u4E00-\u9FA5a-zA-Z0-9._\-]*$/ ;
	var ret = regex.test(str);
    return ret;
}

/**
 * 判断字符串是否包含中文
 * @param str
 * @returns true表示包含中文，false表示不包含中文
 */
function check_str4(str){
	var regex = /[\u4E00-\u9FA5]/g;
	var ret = regex.test(str);
    return ret;
}

function check_file_extension(file_name, extension_list){
	var flag = true;
	var ext_start = file_name.lastIndexOf(".") + 1;
	var ext = file_name.substring(ext_start,file_name.length).toLowerCase(); 
	if (extension_list.indexOf(ext) < 0){
		flag = false;
	}
	return flag;
}

function show_info(message){
	alert(message);
}

function show_warning(message){
	alert(message);
}

function show_danger(message){
	alert(message);
//	$.notify({
//		title: '<strong>警告</strong> ',
//		message: message,
//		target: '_self'
//	},{
//		type: 'danger'
//	});
}

function show_confirm(message){
	return confirm(message);
}

function error_message(data){
	var has_error = false;
	var error_code = data['errorCode'];
	if (error_code != 0){
		show_danger(data['errorMessage']);
		has_error = true;
	}
	return has_error;
}

function is_url(str_url){ 
	var is_url = true;
    //URL pattern based on rfc1738 and rfc3986
    var rg_pctEncoded = "%[0-9a-fA-F]{2}";
    var rg_protocol = "(http|https):\\/\\/";

    var rg_userinfo = "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";

    var rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])"; // 0-255
    var rg_ipv4address = "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
    var rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
    var rg_port = "[0-9]+";

    var rg_hostport = "(" + rg_ipv4address + "|localhost|" + rg_hostname + ")(:" + rg_port + ")?";

    // chars sets
    // safe           = "$" | "-" | "_" | "." | "+"
    // extra          = "!" | "*" | "'" | "(" | ")" | ","
    // hsegment       = *[ alpha | digit | safe | extra | ";" | ":" | "@" | "&" | "=" | escape ]
    var rg_pchar = "a-zA-Z0-9$\\-_.+!*'(),;:@&=";
    var rg_segment = "([" + rg_pchar + "]|" + rg_pctEncoded + ")*";

    var rg_path = rg_segment + "(\\/" + rg_segment + ")*";
    var rg_query = "\\?" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
    var rg_fragment = "\\#" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";

    var rgHttpUrl = new RegExp( 
        "^"
        + rg_protocol
        + "(" + rg_userinfo + ")?"
        + rg_hostport
        + "(\\/"
        + "(" + rg_path + ")?"
        + "(" + rg_query + ")?"
        + "(" + rg_fragment + ")?"
        + ")?"
        + "$"
    );
    if (rgHttpUrl.test(str_url)) {
    	is_url = true;
    } else {
    	is_url = false;
    }
    return is_url;
}

/**
 * 分页
 * @param method_name
 * @param method_params
 * @param pagination_id
 * @param cur_page
 * @param total_page
 * @param total_count
 */
function draw_pagination(method_name, method_params, pagination_id, cur_page, total_page, total_count){
	if (total_count == 0){
		$('#' + pagination_id).empty();
		return;
	}
	
	var html_str = '';
	var step_size = 10;
	var previous_page = cur_page - 1;
	var next_page = cur_page + 1;
	var onclick_method = '';
	
	if (total_page == 0) {
		html_str = '';
	} else {
		onclick_method += method_name + '(';
		$.each(method_params, function(i,val){
			if (val == ''){
				val = null;
			}
			onclick_method += val + ',';
		});
		
		html_str += '<ul>';
		if (previous_page != 0){
			html_str += '<li class="previous"><a onclick="' + onclick_method + previous_page + ')" class="fui-arrow-left"></a></li>';
		}
		
		if (total_page <= step_size){
			for (var i = 1; i <= total_page; i++){
				if (i == cur_page){
					html_str += '<li class="active"><a onclick="' + onclick_method + i + ')">' + i + '</a></li>';
				} else {
					html_str += '<li><a onclick="' + onclick_method + i + ')">' + i + '</a></li>';
				}
			}
		}else{
			var tmp = Math.floor(cur_page / step_size);
			if (cur_page % step_size == 0){
				tmp = tmp - 1;
			}
			var tmp_step_size = step_size;
			if (total_page == cur_page){
				if (total_page % step_size != 0){
					tmp_step_size = total_page % step_size;
				}
			} else {
				if (cur_page % step_size == 0){
					tmp_step_size = step_size;
				} else {
					if (tmp == 0){
						tmp_step_size = step_size;
					} else {
						if ((total_page - cur_page + 1) < step_size){
							tmp_step_size = total_page - tmp * step_size;
						}
					}
				}
			}
			for (var i = 1; i <= tmp_step_size; i++){
				var page = tmp * step_size + i;
				if (page == cur_page){
					html_str += '<li class="active"><a onclick="' + onclick_method + page + ')">' + page + '</a></li>';
				} else {
					html_str += '<li><a onclick="' + onclick_method + page + ')">' + page + '</a></li>';
				}
			}
			if (total_page - Math.ceil(cur_page / step_size)*step_size > 0){
				html_str += '<li><a onclick="' + onclick_method + ((tmp+1)*step_size+1) + ')">...</a></li>';
			}
		}
		
		if (next_page <= total_page){
			html_str += '<li class="next"><a onclick="' + onclick_method + next_page + ')" class="fui-arrow-right"></a></li>';
		}
		html_str += '</ul>';
		html_str += '共' + total_count + '条，' + total_page + '页';
	}
	if (html_str != ''){
		$('#' + pagination_id).empty();
		$('#' + pagination_id).html(html_str);
	}
}

function draw_table(id, html_str){
	$('#' + id + ' tbody').remove();
	$('#' + id).append(html_str);
}

/**
 * 当信息过长时，在列中截取信息并显示省略号，鼠标移至列时，将在tip中显示完整信息
 * @param msg 列中显示的信息
 */
function omit_tb(msg){
	return '<td style="white-space:nowrap;overflow:hidden;text-overflow: ellipsis;" title="' + encode_html(msg) + '">' + encode_html(msg) + '</td>';
}

function encode_html(s){
	var regx_html_encode = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
	var ret = (typeof s != "string") ? s :  
        s.replace(regx_html_encode, function($0){  
            var c = $0.charCodeAt(0), r = ["&#"];  
            c = (c == 0x20) ? 0xA0 : c;  
            r.push(c); r.push(";");  
            return r.join("");  
        });
    return ret;
}

function change_select(element_id, list, first_item, selected_item){
	$('#' + element_id).find("option").remove();
	$('#' + element_id).append('<option value="' + first_item['id'] + '">' + first_item['name'] + '</option>');
	if (list != null){
		for (var i in list){
			var name = list[i]["name"];
			var id = list[i]["id"];
			var option = "";
			if (selected_item == name){
				option = "<option value='" + id + "' selected>" + name + "</option>";
			} else {
				option = "<option value='" + id + "'>" + name + "</option>";
			}
			$('#' + element_id).append(option);
		}
	}
}

function download_apk(plan_id){
	window.location.href = "/download/download_apk?plan_id=" + plan_id;
}

function download_upgrade_package(plan_id){
	window.location.href = "/download/download_upgrade_package?plan_id=" + plan_id;
}

function download_report(report_id){
	window.location.href = "/download/download_report?report_id=" + report_id;
}