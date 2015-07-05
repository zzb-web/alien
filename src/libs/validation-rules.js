/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-05 22:40
 */


define(function (require, exports, module) {
    /**
     * @module libs/validation-rules
     * @requires utils/typeis
     * @requires utils/number
     */

    'use strict';

    var typeis = require('../utils/typeis.js');
    var number = require('../utils/number.js');
    var REG_NUMBERIC = /^[\d.]+$/;

    module.exports = function (Validation) {
        Validation.addRule('type', function (val, done, param0) {
            switch (param0) {
                case 'number':
                    return done(/^\d+$/.test(val) ? null : '${path}必须是数字');

                case 'mobile':
                    return done(/^1\d{10}$/.test(val) ? null : '${path}必须是手机号');

                case 'email':
                    return done(typeis.email(val) ? null : '${path}必须是邮箱');

                case 'url':
                    return done(typeis.url(val) ? null : '${path}必须是 url 地址');
            }
        });


        Validation.addRule('required', function (val, done) {
            var boolean = typeis(val) === 'file' ? true :
            (_isMultiple(val) ? val : (val || '')).length > 0;

            done(boolean ? null : '${path}不能为空');
        });


        var _createLength = function (type) {
            var typeMap = {
                0: ['至少需要', '少于'],
                1: ['最多只能', '超过']
            };

            return function (val, done, param0) {
                param0 = number.parseInt(param0);

                var isMultiple = _isMultiple(val);
                var length = (isMultiple ? val : (val || '')).length;
                var boolean = type === 0 ? length >= param0 : length <= param0;

                done(boolean ? null : '${path}' +
                    (isMultiple ? typeMap[type][0] + '选择' + param0 + '项' : '不能' + typeMap[type][1] + param0 + '个字符')
                );
            };
        };

        Validation.addRule('minLength', _createLength(0));
        Validation.addRule('maxLength', _createLength(1));


        Validation.addRule('equal', function (val, done, param0) {
            val = val || '';
            done(val === this.getData(param0) ? null : '${path}必须与' + this.getAlias(param0) + '相同');
        });


        Validation.addRule('min', function (val, done, param0) {
            val = val || '';

            if (!REG_NUMBERIC.test(val)) {
                return done('${path}必须为数值格式');
            }

            val = number.parseFloat(val);
            param0 = number.parseFloat(param0);
            done(val >= param0 ? null : '${path}不能小于' + param0);
        });


        Validation.addRule('max', function (val, done, param0) {
            val = val || '';

            if (!REG_NUMBERIC.test(val)) {
                return done('${path}必须为数值格式');
            }

            val = number.parseFloat(val);
            param0 = number.parseFloat(param0);
            done(val <= param0 ? null : '${path}不能大于' + param0);
        });
    };


    //============================================================
    //============================================================
    //============================================================

    /**
     * 判断是否为多值类型
     * @param obj
     * @returns {boolean}
     */
    function _isMultiple(obj) {
        return typeis.array(obj) || typeis(obj) === 'filelist';
    }
});