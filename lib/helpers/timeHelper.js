exports.createDisplayTime = function(datetime){
  if(!datetime) {
    return ''
  }
  datetime = new Date(datetime);

//  if(range < 3 * 60 * 1000) { // now(3min)
//    return '今';
//  }else if(range < 60 * 60 * 1000) { // minute
//    var i = Math.floor(range / (60 * 1000));
//    return i + '分前';
//  }else if(range < 24 * 60 * 60 * 1000) { // hour
//    var i = Math.floor(range / (60 * 60 * 1000));
//    return i + '時間前';
//  }else if(range < 30 * 24 * 60 * 60 * 1000) { // day
//    var i = Math.floor(range / (24 * 60 * 60 * 1000));
//    return i + '日前';
//  }else if(range < 30 * 30 * 24 * 60 * 60 * 1000) { // month
//    var i = Math.floor(range / (24 * 60 * 60 * 30 * 1000));
//    return i + 'ヶ月前';
//  }

  var y = datetime.getFullYear();
  var m = toDoubleDigits(datetime.getMonth() + 1);
  var d = toDoubleDigits(datetime.getDate());
  var h = toDoubleDigits(datetime.getHours());
  var min = toDoubleDigits(datetime.getMinutes());
  return y + '/' + m + '/' + d + ' ' + h + ':' + min;
};

exports.parseISOString = function (isoDateStr) {
    if (!isoDateStr) {
        return new Date;
    }
    var isoDateRegex = /(\d{4})-?(\d{2})-?(\d{2})([T ](\d{2})(:?(\d{2})(:?(\d{2}(\.\d+)?))?)?(Z|([+-])(\d{2}):?(\d{2})?)?)?/;
    var res = isoDateRegex.exec(isoDateStr);
    if (!res) {
        throw "invalid ISO date";
    }
    var year = parseInt(res[1], 10) || 1970;
    var month = (parseInt(res[2], 10) || 1) - 1;
    var date = parseInt(res[3], 10) || 0;
    var hour = parseInt(res[5], 10) || 0;
    var min = parseInt(res[7], 10) || 0;
    var sec = parseFloat(res[9]) || 0;
    var ms = Math.round(sec % 1 * 1000);
    sec -= ms / 1000;
    var time = Date.UTC(year, month, date, hour, min, sec, ms);
    if (res[11] && res[11] != "Z") {
        var ofs = 0;
        ofs += (parseInt(res[13], 10) || 0) * 60 * 60 * 1000;
        ofs += (parseInt(res[14], 10) || 0) * 60 * 1000;
        if (res[12] == "+") {
            ofs *= -1;
        }
        time += ofs;
    }
    return new Date(time);
};

function pad(str, length) {
	str = String(str);
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
};

function toDoubleDigits(num) {
  num += '';
  if (num.length === 1) {
    num = '0' + num;
  }
  return num;
};
