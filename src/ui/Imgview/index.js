/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:43
 */


define(function (require, exports, module) {
    /**
     * @module ui/Viewer
     */
    'use strict';


    var generator = require('../generator.js');
    var Dialog = require('../Dialog/');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var Template = require('../../libs/Template.js');
    var templateWrap = require('html!./wrap.html');
    var templateLoading = require('html!./loading.html');
    var templateNav = require('html!./nav.html');
    var style = require('css!./style.css');
    var dato = require('../../util/dato.js');
    var tplWrap = new Template(templateWrap);
    var tplLoading = new Template(templateLoading);
    var tplNav = new Template(templateNav);
    var alienClass = 'alien-ui-imgview';
    var noop = function () {
        // ignore
    };
    var defaults = {
        loading: {
            src: 'http://s.ydr.me/p/i/loading-128.gif',
            width: 64,
            height: 64,
            text: '加载中……'
        },
        nav: {
            prev: {
                icon: '&laquo;',
                text: '上一张'
            },
            next: {
                icon: '&raquo;',
                text: '下一张'
            }
        }
    };
    var Imgview = generator({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initData();
            the._initNode();
            the._initDialog();
            the._initEvent();

            return the;
        },


        /**
         * 初始化数据
         * @private
         */
        _initData: function () {
            var the = this;

            the._list = [];
            the._index = 0;
            the._isSame = false;
            the._hasFirstShow = false;
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var htmlWrap = tplWrap.render(options);
            var htmlLoading = tplLoading.render(options);
            var nodeWrap = modification.parse(htmlWrap)[0];
            var nodeLoading = modification.parse(htmlLoading)[0];
            var nodes = selector.query('.j-flag', nodeWrap);

            the._load(options.loading.src);
            modification.insert(nodeWrap, document.body, 'beforeend');
            the._$ele = nodeWrap;
            the._$loading = nodeLoading;
            the._$mainParent = nodes[0];
            the._$navParent = nodes[1];
            the._$prev = nodes[2];
            the._$next = nodes[3];
        },


        /**
         * 初始化对话框
         * @private
         */
        _initDialog: function () {
            var the = this;

            the._dialogOptions = {
                title: null,
                addClass: alienClass + '-dialog',
                canDrag: false
            };
            the._dialog = new Dialog(the._$ele, the._dialogOptions);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var onclose = function () {
                this.close();
                return false;
            };

            // 单击背景
            the._dialog.on('hitbg', onclose);

            // 按 esc
            the._dialog.on('esc', onclose);

            // 打开
            the._dialog.on('open', function () {
                the._show();
            });

            // 上一张
            event.on(the._$prev, 'click', function () {
                var length = the._list.length;

                if (length > 1 && the._index > 0) {
                    the._index--;
                    the._show();
                }
            });

            // 下一张
            event.on(the._$next, 'click', function () {
                var length = the._list.length;

                if (length > 1 && the._index < length - 1) {
                    the._index++;
                    the._show();
                }
            });

            // 导航切换
            event.on(the._$navParent, 'click', '.' + alienClass + '-nav-item', function () {
                var index = attribute.data(this, 'index') * 1;

                if (index !== the._index) {
                    the._index = index;
                    the._show();
                }
            });
        },


        /**
         * 加载图片
         * @param src {String} 图片地址
         * @param [onbefore] {Function} 加载之前
         * @param [callback] {Function} 加载之后
         * @private
         */
        _load: function (src, onbefore, callback) {
            var img = new Image();
            var index = this._index;

            img.src = src;
            onbefore = onbefore || noop;
            callback = callback || noop;

            if (img.complete) {
                callback(null, {
                    index: index,
                    src: src,
                    width: img.width,
                    height: img.height
                });
            } else {
                onbefore();
                img.onload = function () {
                    callback(null, {
                        index: index,
                        src: src,
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = callback;
            }
        },


        /**
         * 控制
         * @private
         */
        _ctrl: function () {
            var the = this;
            var disabledClass = alienClass + '-ctrl-disabled';

            if (the._index === 0) {
                attribute.addClass(the._$prev, disabledClass);
            } else {
                attribute.removeClass(the._$prev, disabledClass);
            }

            if (the._index === the._list.length - 1) {
                attribute.addClass(the._$next, disabledClass);
            } else {
                attribute.removeClass(the._$next, disabledClass);
            }
        },


        /**
         * 导航
         * @private
         */
        _nav: function () {
            var the = this;
            var $items = selector.query('.' + alienClass + '-nav-item');
            var activeClass = alienClass + '-nav-item-active';

            $items.forEach(function ($item, index) {
                if (index === the._index) {
                    attribute.addClass($item, activeClass);
                } else {
                    attribute.removeClass($item, activeClass);
                }
            });
        },


        /**
         * resize
         * @private
         */
        _resize: function () {
            var the = this;
            var clientWidth = the._dialog._$bg.clientWidth;
            var offsetWidth = the._dialog._$bg.offsetWidth;

            if (clientWidth !== offsetWidth) {
                the._dialog.setOptions('width', clientWidth - 20);
                the._dialog.resize();
            }
        },


        /**
         * 展示之前动画
         * @params callback {Function} 回调
         * @private
         */
        _preShow: function (callback) {
            var the = this;

            if (!the._hasFirstShow) {
                the._hasFirstShow = true;
                return callback();
            }

            var to = {
                width: 200,
                height: 200,
                left: (attribute.width(window) - 200) / 2,
                top: (attribute.height(window) - 200)  / 2
            };

            attribute.css(the._$mainParent, 'visibility', 'hidden');
            the._dialog.animate(to, callback);
        },


        /**
         * 展示
         * @private
         */
        _show: function () {
            var the = this;

            if (the._isSame) {
                the._isSame = false;
                return;
            }

            the._ctrl();
            the._nav();
            the._load(the._list[the._index], function () {
                the._preShow(function () {
                    attribute.css(the._$mainParent, 'visibility', 'visible');
                    the._$mainParent.innerHTML = '';
                    modification.insert(the._$loading, the._$mainParent, 'beforeend');
                    the._dialog.resize(the._resize.bind(the));
                });
            }, function (err, info) {
                if (err) {
                    return the.emit('error', err);
                }

                if (the._index === info.index) {
                    the._preShow(function () {
                        var $img = modification.create('img', info);
                        var width = Math.min(info.width, attribute.width(window) - 20);

                        attribute.css(the._$mainParent, 'visibility', 'visible');
                        the._$mainParent.innerHTML = '';
                        modification.insert($img, the._$mainParent, 'beforeend');
                        the._dialog.setOptions('width', width);
                        the._dialog.resize(the._resize.bind(the));
                    });
                }
            });
        },


        /**
         * 判断本次和上次是否一致
         * @param list
         * @param index
         * @returns {boolean}
         * @private
         */
        _compare: function (list, index) {
            index = index || 0;

            var the = this;

            if ((index !== the._index) || (list.length !== the._list.length)) {
                return false;
            }

            var compare = dato.compare(list, the._list);

            return !compare.different.length && !compare.only[0].length && !compare.only[1].length;
        },


        /**
         * 打开图片查看器
         * @param list {Array} 图片列表
         * @param [index=0] {Number} 打开时显示的图片索引
         */
        open: function (list, index) {
            var the = this;
            var navHTML = tplNav.render({
                list: list
            });

            the._isSame = the._compare(list, index);
            the._list = list;
            the._index = index || 0;

            if (!the._isSame) {
                the._$navParent.innerHTML = navHTML;
                the._$mainParent.innerHTML = '';
            }

            the._dialog.setOptions('width', 300);
            the._dialog.open();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._dialog.destroy(function () {
                modification.remove(the._$ele);
            });
            event.un(the._$prev, 'click');
            event.un(the._$next, 'click');
            event.un(the._$navParent, 'click');
        }
    });

    modification.importStyle(style);
    module.exports = Imgview;
});