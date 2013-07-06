var Util = {

	parseDate: function(s) {
		var parts         = s.split(/[- :]/)
        var date 	      = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);

        var out = '';

        var hour = date.getHours();
        if (hour.toString().length == 1) {
        	hour = '0' + hour;
        }

        out += hour + ':';

        var minute = date.getMinutes();
        if (minute.toString().length == 1) {
        	minute = '0' + minute;
        }

        out += minute + ':';

        var second = date.getSeconds();
        if (second.toString().length == 1) {
        	second = '0' + second;
        }

        out += second + ' ';

		var day = date.getDate();
		if (day.toString().length == 1) {
			day = '0' + day;
		}

		out += day + '/';

		var month = date.getMonth() + 1;
		if (month.toString().length == 1) {
			month = '0' + month;
		}

		out += month + '/' + date.getFullYear();

		return out;
	},

  generateSerial: function(len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 10;
    var randomstring = '';

    for (var x=0;x<string_length;x++) {

        var letterOrNumber = Math.floor(Math.random() * 2);
        if (letterOrNumber == 0) {
            var newNum = Math.floor(Math.random() * 9);
            randomstring += newNum;
        } else {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }

    }

    return randomstring;
  }
}