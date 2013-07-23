var Util = {

	parseDate: function(s) {
		var date 	= new Date(s * 1000);
		var string 	= this.pad(date.getHours(), 2) + ':' + this.pad(date.getMinutes(), 2) + ':' + this.pad(date.getSeconds(), 2) + ' ' + this.pad(date.getUTCDate(), 2) + '/' + this.pad((date.getUTCMonth() + 1), 2) + '/' + date.getUTCFullYear();

		return string;
	},

	pad: function(num, len) {
		if (num.length < len) {
			str = ''

			for (i = 0; i < len; i++) {
				str += '0';
			}

			str += num;
		}

		return num;
	} 
}