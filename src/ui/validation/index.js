/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-02 14:20
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var Validation = require('../../libs/validation.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var string = require('../../utils/string.js');
    var ui = require('../');
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法',
        // 规则的 data 属性
        dataAttribute: 'validation',
        // data 规则分隔符
        dataSep: ',',
        // data 规则等于符
        dataEqual: ':',
        // 验证的表单项目选择器
        itemSelector: 'input,select,textarea',
        // 提交按钮
        submitSelector: '.form-submit',
        // 验证事件
        event: 'focusout change'
    };
    //var typeRegExpMap = {
    //    number: /^\d+$/,
    //    url: ''
    //};
    var validationMap = {};
    var ValidationUI = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._$form = selector.query($form)[0];
            the.update();
            the._initEvent();
        },


        /**
         * 更新验证规则
         * @returns {ValidationUI}
         */
        update: function () {
            var the = this;

            the._validation = new Validation(the._options);
            the._validation.pipe(the);
            the._parseItems();

            return the;
        },


        /**
         * 获取表单数据
         * @returns {{}}
         */
        getData: function () {
            var the = this;
            var data = {};

            dato.each(the._$items, function (i, $item) {
                var path = $item.name;

                data[path] = $item.value;
            });

            return data;
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            event.on(the._$form, 'click', options.submitSelector, the._onsubmit = function () {
                the._validation.validate(the.getData());
            });
        },


        /**
         * 解析表单项目
         * @private
         */
        _parseItems: function () {
            var the = this;
            var options = the._options;

            the._items = [];
            the._$items = selector.query(options.itemSelector, the._$form);
            dato.each(the._$items, function (i, $item) {
                the._parseRules($item);
            });
        },


        /**
         * 解析项目规则
         * @param $item {Object}
         * @private
         */
        _parseRules: function ($item) {
            var the = this;
            var options = the._options;
            var path = $item.name;
            var type = $item.type;
            var validationStr = attribute.data($item, options.dataAttribute);
            var validationList = the._parseValidation(validationStr);

            debugger;

            // 规则顺序
            // required => type => minLength => maxLength => pattern => data

            if ($item.required) {
                the._validation.addRule(path, 'required');
            }

            switch (type) {
                case 'number':
                case 'email':
                case 'url':
                    the._validation.addRule(path, type);
                    break;
            }

            validationList.forEach(function (item) {
                the._validation.addRule(path, item.name);
            });
        },


        /**
         * 解析 data 验证规则
         * @param ruleString
         * @returns {Array}
         * @private
         */
        _parseValidation: function (ruleString) {
            var the = this;
            var options = the._options;
            var list1 = ruleString.split(options.dataSep);
            var list2 = [];

            list1.forEach(function (item) {
                var temp = item.split(options.dataEqual);

                list2.push({
                    name: temp[0].trim(),
                    value: temp[1] ? temp[1].trim() : true
                });
            });

            return list2;
        }
    });

    ValidationUI.addRule = function (ruleName, value, fn) {
        if(validationMap[name] && DEBUG){
            console.warn('override rule of ' + name);
        }

        validationMap[name] = function(){};
    };

    require('./rules.js');
    ValidationUI.defaults = defaults;
    module.exports = ValidationUI;
});