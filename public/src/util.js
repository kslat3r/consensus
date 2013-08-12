var Util = {

	parseDate: function(s) {
		var date 	= new Date(s * 1000);
		var string 	= this.pad(date.getHours(), 2) + ':' + this.pad(date.getMinutes(), 2) + ':' + this.pad(date.getSeconds(), 2) + ' ' + this.pad(date.getUTCDate(), 2) + '/' + this.pad((date.getUTCMonth() + 1), 2) + '/' + date.getUTCFullYear();

		return string;

		/*var date = new Date();
		var dist = (parseInt(date.getTime() / 1000)) - (parseInt(s));
		
		var months = dist / 2678400;
		var weeks = dist / 604800;
		var days = dist / 86400;
		var hours = dist / 3600;
		var minutes = dist / 60;

		if (months >= 1) {
			return months + (months > 1 ? this.pluralize(' month') : ' month') + " ago";
		}
		else if (weeks >= 1) {
			return weeks + (weeks > 1 ? this.pluralize(' week') : ' week') + " ago";
		}
		else if (days >= 1) {
			return days + (days > 1 ? this.pluralize(' day') : ' day') + " ago";
		}
		else if (hours >= 1) {
			return hours + (hours > 1 ? this.pluralize(' hour') : ' hour') + " ago";
		}
		else if (minutes >= 1) {
			return minutes + (minutes > 1 ? this.pluralize(' minute') : ' minute') + " ago";
		}
		else {
			return "Just now";
		}*/
	},

	pluralize: function(str) {
		return str + 's';
	},

	pad: function(num, len) {
		if (num.toString().length < len) {
			str = ''

			for (i = 1; i < len; i++) {
				str += '0';
			}

			str += num;

			return str;
		}

		return num;
	} 
}