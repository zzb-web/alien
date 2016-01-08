/**
 * ui markdown
 * @author ydr.me
 * @create 2015-12-23 14:38
 */


define(function (require, exports, module) {
    'use strict';

    var w = window;
    var d = w.document;
    var marked = require('../../3rd/marked.js');
    var ui = require('../index.js');
    var Textarea = require('../textarea/index.js');
    var controller = require('../../utils/controller.js');
    var number = require('../../utils/number.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var eventParser = require('../../utils/event.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var Template = require('../../libs/template.js');
    var Hotkey = require('../../ui/hotkey/index.js');
    var template = require('template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');

    var namespace = 'alien-ui-markdown';
    var alienIndex = 0;
    var markedRender = new marked.Renderer();
    markedRender.image = require('./_marked-render-image.js');
    markedRender.table = require('./_marked-render-table.js');
    var REG_ORDER = /^\s*([1-9]\d*)\. /;
    var REG_UNORDER = /^\s*([-+*]) /;
    var defaults = {
        marked: {
            highlight: null,
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: true
        },
        style: {
            width: 'auto',
            height: 400
        },
        headers: [],
        footers: [],
        tabSize: 4,
        prevClassName: ''
    };
    var Markdown = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._eTextarea = selector.query($textarea)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._index = alienIndex++;
            the._initData();
            the._initNode();
            the._initEvent();
        },


        _initData: function () {
            var the = this;
            var history = the._textarea.getHistory();

        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var html = tpl.render({
                index: the._index,
                prevClassName: options.prevClassName
            });
            var node = the._eMarkdown = modification.parse(html)[0];
            var $flag = the._eFlag = modification.create('#comment', namespace + '-' + the._index);

            attribute.css(node, options.style);
            attribute.prop(the._eTextarea, 'spellcheck', false);
            modification.insert($flag, the._eTextarea, 'afterend');
            modification.insert(node, $flag, 'afterend');
            var nodes = selector.query('.j-flag', node);
            the._eHeader = nodes[0];
            the._eInput = nodes[1];
            the._eOutput = nodes[2];
            the._eCount = nodes[3];
            the._eHelp = nodes[4];
            the._eTips = nodes[5];
            modification.insert(the._eTextarea, the._eInput);
            the._textarea = new Textarea(the._eTextarea, {
                tabSize: options.tabSize
            });
        },

        _initEvent: function () {
            var the = this;
            var eTextarea = the._eTextarea;
            var render = controller.debounce(function () {
                the._eOutput.innerHTML = marked(the._textarea.getValue(), {
                    renderer: markedRender
                });
            });
            // 全屏
            var fullscreen = false;
            // 写作模式
            var writen = false;
            // 预览模式
            var live = false;
            // 切换全屏模式
            var toggleFullscreen = function (boolean) {
                var className = namespace + '-fullscreen';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                fullscreen = boolean;
            };
            // 切换写作模式
            var toggleWriten = function (boolean) {
                var className = namespace + '-writen';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                writen = boolean;
            };
            // 切换预览模式
            var toggleLive = function (boolean) {
                var className = namespace + '-live';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                    render();
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                live = boolean;
            };

            var ctrl = Hotkey.MAC_OS ? 'cmd' : 'ctrl';

            // fullscreen
            the._textarea.bind(ctrl + '+f11', function () {
                if (fullscreen) {
                    if (live) {
                        toggleLive(false);
                        toggleWriten(true);
                    } else {
                        toggleFullscreen(false);
                        toggleWriten(false);
                    }
                } else {
                    toggleFullscreen(true);
                    toggleWriten(true);
                }
                return false;
            });

            // live
            the._textarea.bind(ctrl + '+f12', function () {
                if (fullscreen) {
                    if (writen) {
                        toggleWriten(false);
                        toggleLive(true);
                    } else {
                        toggleFullscreen(false);
                        toggleLive(false);
                    }
                } else {
                    toggleFullscreen(true);
                    toggleLive(true);
                }
                return false;
            });

            // `code`
            the._textarea.bind('`', function () {
                the._textarea.wrap('`', '`', true);
                return false;
            });

            // **bold**
            the._textarea.bind(ctrl + '+b', function () {
                the._textarea.wrap('**', '**', true);
                return false;
            });

            // **italic**
            the._textarea.bind(ctrl + '+i', function () {
                the._textarea.wrap('*', '*', true);
                return false;
            });

            // -----
            the._textarea.bind(ctrl + '+r', function () {
                the._textarea.insert('\n\n-----\n\n', false);
                return false;
            });

            // [](link)
            the._textarea.bind(ctrl + '+l', function () {
                var link_url = 'link url';
                the._textarea.insert('<' + link_url + '>', [1, link_url.length + 1]);
                return false;
            });

            // ![](image)
            the._textarea.bind(ctrl + '+g', function () {
                var link_url = 'image url';
                the._textarea.insert('![](' + link_url + ')', [4, link_url.length + 4]);
                return false;
            });

            // \n```\nblock code\n```\n
            the._textarea.bind(ctrl + '+k', function () {
                the._textarea.wrap('\n```\n', '\n```\n\n', true);
                return false;
            });

            the._textarea.bind('enter', function () {
                var nowLine0 = the._textarea.getLines()[0];
                var prevSel = the._textarea.getSelection();
                // 减去当前行的空白，定位到上一行末尾
                var prevLines = the._textarea.getLines(prevSel[0] - 1 - nowLine0.text.length);
                var prevLine0 = prevLines[0];
                var prevText0 = prevLine0.text;
                var match;

                // order list
                if ((match = prevText0.match(REG_ORDER))) {
                    var nextOrder = number.parseInt(match[1]) + 1;
                    the._textarea.insert(nextOrder + '. ', false);
                }
                // unorder list
                else if ((match = prevText0.match(REG_UNORDER))) {
                    var nextUnorder = match[1];
                    the._textarea.insert(nextUnorder + ' ', false);
                }

                return false;
            });

            // live
            the._textarea.on('change', function () {
                the._eCount.innerHTML = this.getValue().length;
                if (!live) {
                    return;
                }

                render();
            });

            // scroll
            event.on(eTextarea, 'scroll', controller.throttle(function () {
                if (!live) {
                    return;
                }

                var inputScrollTop = attribute.scrollTop(eTextarea);
                var inputScrollHeight = attribute.scrollHeight(eTextarea);
                var inputScrollRate = inputScrollTop / inputScrollHeight;
                var outputScrollHeight = attribute.scrollHeight(the._eOutput);
                the._eOutput.scrollTop = outputScrollHeight * inputScrollRate;
            }));

            // drag
            event.on(eTextarea, 'dragenter dragover', function () {
                return false;
            });

            var onUploadSuccess = function (img) {
                if (typeis.String(img)) {
                    img = {url: img};
                }

                if (img && img.url) {
                    var alt = img.title || 'img description';
                    var text = '!['.concat(
                        alt,
                        '](',
                        img.url,
                        img.width ? ' =' + img.width + 'x' + img.height : '',
                        ')');
                    the._textarea.insert(text, [2, alt.length + 2]);
                }
            };

            // upload
            event.on(eTextarea, 'paste drop', function (eve) {
                var img = eventParser.parseFiles(eve, this)[0];

                if (!img) {
                    return;
                }

                the.emit('upload', eve, img, onUploadSuccess);
            });

            // show help
            event.on(the._eHelp, 'click', function () {
                attribute.css(the._eTips, 'zIndex', ui.getZindex());
                attribute.show(the._eTips, 'block');
                return false;
            });

            // stop propagation
            event.on(the._eTips, 'click', function (eve) {
                eve.stopPropagation();
            });

            event.on(d, 'click esc', function () {
                attribute.hide(the._eTips);
            });
        }
    });

    ui.importStyle(style);
    Markdown.defaults = defaults;
    module.exports = Markdown;
});