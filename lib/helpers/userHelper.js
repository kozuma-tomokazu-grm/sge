var async = require('async');
var _ = require('underscore');
var userDao = require('dao/userDao');

exports.createUserUrl = function(userId){
	return "/user/" + userId;
}

exports.isLogin = function(request){
  if(request.session.userId){
    return true
  }
  return false;
}

exports.loginUser = function(request, callback){
  if(this.isLogin(request)){
    var userId = request.session.userId;
    userDao.getByUserId(userId, callback);
  }else{
    callback();
  }
}