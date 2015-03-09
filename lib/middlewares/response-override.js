
/**
 * Module dependencies.
 */
var _ = require('underscore');

function responseOverride() {
    return function(request, response, callback) {
        response._defaultRender = response.render;
        response.render = function(view, options, fn) {
            if (!options) {
                options = {};
            }
            console.log('00000000000000');

            var rf = request.param('rf') || request.param('responseFormat');

            if(!rf || rf !== 'json'){
                response._defaultRender(view, options, fn);
                return;
            }
console.log('111111111111111')
            response.send(JSON.stringify(options));
        }
        callback();
    };
}

module.exports = responseOverride;