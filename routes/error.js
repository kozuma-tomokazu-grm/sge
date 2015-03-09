/*
 * error page.
 */

var helper = require('helpers/applicationHelper');

exports.init = function(app){

  app.get('*', function(req, res){
    helper.responseError(res, null, 404);
  });

  app.use(function(err, req, res, next){
    helper.responseError(res, err, 500);
    next();
  });

};