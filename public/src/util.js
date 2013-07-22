var Util = {

	parseDate: function(s) {
		var date 	= new Date(s * 1000);
		var string 	= date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ' + date.getUTCDate() + '/' + (date.getUTCMonth() + 1) + '/' + date.getUTCFullYear();

		return string;
	}  
}