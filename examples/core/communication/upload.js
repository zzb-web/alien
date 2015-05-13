define(function (require) {
    'use strict';

    var upload = require('/src/core/communication/upload.js');
    var $ret = document.getElementById('ret');

    document.getElementById('file').onchange = function () {
        upload({
            url: './data.json',
            file: this
        }).on('success', function (json) {
            console.log(json);
        }).on('error', function (err) {
            console.log(err);
        }).on('progress', function (eve) {
            console.log(eve.alienDetail.complete);
            $ret.innerHTML = eve.alienDetail.percent;
        });
    };
});