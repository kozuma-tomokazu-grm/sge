'use strict';

//configure
var configure = {
    _config : {},
    add: function(key, val){
        if(this._config[key]){
            throw new Error('Configure Error: The key [' + key + '] is already exists.');
        }
        this._config[key] = val;
    },
    mod: function(key, val){
        if(this._config[key] == undefined){
            throw new Error('Configure Error: The key [' + key + '] is not exists.');
        }
        this._config[key] = val;
    },
    get: function(key){
        return this._config[key];
    }
};

configure.add('requirejsSettings',
    {
        baseUrl: '/javascripts/lib',
        paths: {
            'angular': 'angular.min',
            'angular-map': 'angular.min.js.map',
            'backbone': 'backbone-min',
            'bootstrap-tagsinput': 'bootstrap-tagsinput',
            'bootstrap-tagsinput-angular': 'bootstrap-tagsinput-angular',
            'bootstrap': 'bootstrap.min',
            'jquery': 'jquery.min',
            'jquery-sidr': 'jquery.sidr.min',
            'jquery-bottom': 'jquery.bottom-1.0',
            'jquery-ui-core': 'jquery_ui_core',
            'jquery-ui-datepicker': 'jquery.ui.datepicker.min',
            'jquery-ui-slider-access': 'jquery-ui-slider-access',
            'jquery-timepicker-addon': 'jquery-timepicker-addon',
            'underscore': 'underscore-min',
            'pager': 'pager',
            'datepicker': 'datepicker',
            'slider': 'slider'
        },
        // moduleの依存関係
        shim: {
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            'bootstrap-tagsinput-angular': {
                deps: ['angular'],
                exports: 'bootstrap-tagsinput-angular'
            },
            'jquery-ui-core': {
                deps: ['jquery'],
                exports: 'jquery-ui-core'
            },
            'jquery-ui-datepicker': {
                deps: ['jquery'],
                exports: 'jquery-ui-datepicker'
            },
            'jquery-ui-slider-access': {
                deps: ['jquery'],
                exports: 'jquery-ui-slider-access'
            },
            'jquery-timepicker-addon': {
                deps: ['jquery'],
                exports: 'jquery-timepicker-addon'
            },
            'datepicker': {
                deps: ['jquery', 'jquery-timepicker-addon'],
                exports: 'datepicker'
            },
            'jquery-bottom': {
                deps: ['jquery'],
                exports: 'jquery-bottom'
            },
            'pager': {
                deps: ['jquery'],
                exports: 'pager'
            },
            'slider': {
                deps: ['jquery', 'jquery-ui-core'],
                exports: 'slider'
            }
        }
    }
);

if(typeof requirejs == 'object'){
    requirejs.config(configure.get('requirejsSettings'));
}

//for node.js
if(typeof exports != 'undefined'){
    module.exports = {
        configure: configure,
    }
}
