//module dependencies
var fs = require("fs");
var _ = require('underscore');
var async = require('async');

/**
 * void arrayFilter
 * getable key and iterator in object and array loop
 * @param {mix} obj
 * @param {function} callback
 */
var arrayFilter = function(obj, callback){
    if(typeof(obj) == "object"){
        var iterator = 0,
        isArray = function(obj){
            return typeof(obj.length) != "undefined";
        },
        retunValues = isArray(obj) ? [] : {};

        for(var key in obj){
            retunValues[key] = callback(key, obj[key], iterator);
            iterator++;
        }
        return retunValues;
    }else{
        throw new Error("You have to give array or object to first arguments");
    }
};

var root;
exports.setRoot = function(rootDir){
    root = rootDir + '/';
    return this;
};

var onErrorFn = null;
exports.onError = function(fn){
    onErrorFn = fn;
    return this;
};

var filterStack = [];
exports.config = function(configFilePath) {

    var text = fs.readFileSync(configFilePath, 'utf8');
    var filterConfig = JSON.parse(text).filters;

    var dirList = [];
    arrayFilter(filterConfig.include_paths, function(key, dir, iterator) {
            if (!fs.existsSync(root + dir)) {
                    throw new Error("Directory [" + root + dir + "] was not found on server.");
            }
            dirList.push(dir);
    });

    arrayFilter(filterConfig.rules, function(key, _filter, iterator) {
            var fileName = _filter.name_space.split(".")[0];
            var action = _filter.name_space.split(".")[1];

            var dir = _.find(dirList, function(dir) {
                    return fs.existsSync(root + dir + "/" + fileName + ".js");
            });

            if (dir) {
                var filter = require(root + dir + "/" + fileName);

                filter[action].name = _filter.name_space;
                filter[action].applies = _filter.applies;
                filter[action].ignores = _filter.ignores;
                filter[action].as = (typeof _filter.as == "undefined") ? null : _filter.as;

                filterStack.push(filter[action]);
            }
    });
    console.log("completed to register express-filters.");
    return this;
};


/**
* void doFilter
* @param express object app
*/
exports.doFilter = function(app){
    var getUri = function(path){
        if(path == "/"){
            return {routes : "", action : ""}
        }
        var spt = path.split("/");
        return {routes : spt[1], action : (typeof(spt[2]) != "undefined") ? spt[2] : "index" }
    },
    isApply = function(applies, routes, path){
        return _.contains(arrayFilter(applies, function(key, apply, ite){
            if(apply == "/*"
                    || (apply.match(/[.]*\/*/) && routes == apply.split("/")[0])
                    || apply == path
            ){
                return true;
            }
        }),true);
    },
    isIgnore = function(ignores, routes, path){
            var matches = [];
            for(var i in ignores){
                var ignore = ignores[i];
                routes = (routes == '/' || routes == "") ? 'index' : routes;

                var checkWildCard = function(){
                    var isIgnoreAll = ignore.match(/\/\*$/, '');
                    if(isIgnoreAll){
                        if(routes == ignore.replace('/*', '')){
                            return true;
                        }
                    }
                    return false;
                }
                //regexp
                ,checkReg = function(){
                    if(ignore[0] == '/' && ignore[ignore.length-1] == '/'){
                        return path.match(new RegExp(ignore.replace(/^\//, '').replace(/\/$/, ''))) != null;
                    }
                };

                var m = function(){
                    if((ignore.match(/[.]*\/*/) && routes == ignore.split("/")[0])
                        || ignore == path
                        || checkWildCard()
                        || checkReg())
                    {
                        return true;
                    }else{
                        return false;
                    }
                };
                matches.push(m());
            }
            return _.contains(matches, true);
    };


    return function(req, res, next) {

        req.express = app;

        //initialize filterValue
        res.filterValues = {};

        var uri = getUri(req.path);

        //execute filter function
        if(filterStack.length == 0){
            next();
        }

        var applyFilters = [];
        _.each(filterStack, function(filterObj){
            if(isApply(filterObj.applies, uri.routes, req.path) && !isIgnore(filterObj.ignores, uri.routes, req.path)){
                applyFilters.push(filterObj);
            }
        });

        var filterFuncList = [];
        var count = 0;
        _.each(applyFilters, function(applyFilter){
            var f = function(cb){
                var filterObj = applyFilters[count];
                count++;
                filterObj.filter(req, res, function(error, returnValue){
                    if(error){
                        onErrorFn(error, req, res);
                        return;
                    }
                    if(returnValue){
                        res.filterValues[(filterObj.as == null) ? filterObj.name : filterObj.as] = returnValue;
                    }
                    cb();
                });
            };
            filterFuncList.push(f);
        });

        async.series(filterFuncList, function(err, results){
            next();
        });

    };
};

exports.getFilterStack = function(){
    return filterStack;
};