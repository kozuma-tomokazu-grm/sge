/**
 * @fileOverview コード
 */

var _ = require('underscore');

/**
 * コード
 *
 * @class コード
 * @param {Array} codeList コードリスト
 */
function Code(codeList) {
    var self = this;
    _.each(codeList, function(code) {
        self[code] = code;
    });
};

module.exports = Code;