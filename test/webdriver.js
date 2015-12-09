'use strict';

const webdriver = require('webdriverio');
const expect = require('chai').expect;
const URL = 'http://localhost:3001/demo/';

let options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

let client;

const MAX_X = 9999;
const MAX_Y = 9999;

describe('Функциональные тесты для Konan', function() {
    beforeEach(function() {
        client = webdriver.remote(options);

        client.addCommand('getBoardRect', function() {
            return client.execute(function() {
                var $element = $('.konan__board');

                return {
                    width: $element.width(),
                    height: $element.height()
                }
            });
        });

        client.addCommand('getSizerRect', function() {
            return client.execute(function() {
                var $element = $('.konan__sizer');

                return {
                    top: parseInt($element.css('top'), 10),
                    left: parseInt($element.css('left'), 10),
                    width: $element.width(),
                    height: $element.height()
                }
            });
        });

        return client.init();
    });

    afterEach(function() {
        return client.end();
    });

    it('Перемещение кропа в разные углы доски', function() {
        let boardRect;

        return client
            .url(URL)
            .waitForVisible('.konan', 3000)
            .getBoardRect()
            .then(function(res) {
                boardRect = res.value;
            })

            .moveToObject('.konan__face', 50, 50)
            .buttonDown()
            .moveToObject('body', 0, 0)
            .buttonUp()
            .pause(100)
            .getSizerRect()
            .then(function(res) {
                expect({
                    left: res.value.left,
                    top: res.value.top
                }).to.deep.equal({top: 0, left: 0});
            })

            .moveToObject('.konan__face', 50, 50)
            .buttonDown()
            .moveToObject('body', MAX_X, 0)
            .buttonUp()
            .pause(100)
            .getSizerRect()
            .then(function(res) {
                expect({
                    left: res.value.left,
                    top: res.value.top
                }).to.deep.equal({
                    left: boardRect.width - res.value.width,
                    top: 0
                });
            })

            .moveToObject('.konan__face', 50, 50)
            .buttonDown()
            .moveToObject('body', MAX_X, MAX_Y)
            .buttonUp()
            .pause(100)
            .getSizerRect()
            .then(function(res) {
                expect({
                    left: res.value.left,
                    top: res.value.top
                }).to.deep.equal({
                    left: boardRect.width - res.value.width,
                    top: boardRect.height - res.value.height
                });
            })

            .moveToObject('.konan__face', 50, 50)
            .buttonDown()
            .moveToObject('body', 0, MAX_Y)
            .buttonUp()
            .pause(100)
            .getSizerRect()
            .then(function(res) {
                expect({
                    left: res.value.left,
                    top: res.value.top
                }).to.deep.equal({
                    left: 0,
                    top: boardRect.height - res.value.height
                });
            });
    });
});
