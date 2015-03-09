var config = require('config');

exports.test = function(){
	return "image helper";
}

exports.imageUrl = function(imagePath, width, height, type){
    width    = width    || 600;
    height = height || 500;
    type     = type     || 'resize'; // resize or crop 
    var url = config.img_root_url + '/' + imagePath;
    url += '?width=' + width + '&height=' + height + '&type=' + type;
    return url;
}
