'use strict';

const webdriver = require('webdriverio');
const expect = require('chai').expect;
const URL = 'http://localhost:3001/demo/';

const options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

let client;

const MAX_X = 9999;
const MAX_Y = 9999;
const POINT_OFFSET_LEFT = 7;
const POINT_OFFSET_RIGTH = 7;

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

    it('Ресайз кропа в сторону северо-запада', function() {
        let sizerRect;

        return client
            .url(URL)
            .waitForVisible('.konan', 3000)
            .getSizerRect()
            .then(function(res) {
                sizerRect = res.value;
            })

            .moveToObject('.konan__point_nw', 2, 2)
            .buttonDown()
            .moveToObject('.konan__point_nw', -(50 - POINT_OFFSET_LEFT), -(50 - POINT_OFFSET_RIGTH))
            .buttonUp()
            .pause(100)

            .getSizerRect()
            .then(function(res) {
                expect(res.value.top + res.value.height).to.equal(sizerRect.top + sizerRect.height);
                expect(res.value.left + res.value.width).to.equal(sizerRect.left + sizerRect.width);
                expect(res.value.width === sizerRect.width + 50).to.be.true;
                expect(res.value.height === sizerRect.height + 50).to.be.true;
            })

            .buttonDown()
            .moveToObject('.konan__point_nw', 50 + POINT_OFFSET_LEFT, 50 + POINT_OFFSET_RIGTH)
            .buttonUp()
            .pause(100)
            .getSizerRect()
            .then(function(res) {
                expect(res.value.top).to.equal(sizerRect.top);
                expect(res.value.left).to.equal(sizerRect.left);
            });
    });

    it('Ресайз кропа в сторону северо-востока', function() {
        let sizerRect;

        return client
            .url(URL)
            .waitForVisible('.konan', 3000)
            .getSizerRect()
            .then(function(res) {
                sizerRect = res.value;
            })

            .moveToObject('.konan__point_ne', 2, 2)
            .buttonDown()
            .moveToObject('.konan__point_ne', 50 - POINT_OFFSET_LEFT, -(50 - POINT_OFFSET_RIGTH))
            .buttonUp()
            .pause(100)

            .getSizerRect()
            .then(function(res) {
                expect(res.value.top + res.value.height).to.equal(sizerRect.top + sizerRect.height);
                expect(res.value.left).to.equal(sizerRect.left);
                expect(res.value.width === sizerRect.width + 50).to.be.true;
                expect(res.value.height === sizerRect.height + 50).to.be.true;
            })

            .moveToObject('.konan__point_ne', 2, 2)
            .buttonDown()
            .moveToObject('.konan__point_ne', -(50 + POINT_OFFSET_LEFT), 50 + POINT_OFFSET_RIGTH)
            .buttonUp()
            .getSizerRect()
            .then(function(res) {
                expect(res.value.top).to.equal(sizerRect.top);
                expect(res.value.left).to.equal(sizerRect.left);
            });
    });

    it('Ресайз кропа в сторону юго-востока', function() {
        let sizerRect;

        return client
            .url(URL)
            .waitForVisible('.konan', 3000)
            .getSizerRect()
            .then(function(res) {
                sizerRect = res.value;
            })

            .moveToObject('.konan__point_se')
            .buttonDown()
            .moveToObject('.konan__point_se', 50 + POINT_OFFSET_LEFT, 50 + POINT_OFFSET_RIGTH)
            .buttonUp()
            .pause(100)

            .getSizerRect()
            .then(function(res) {
                expect(res.value.top).to.equal(sizerRect.top);
                expect(res.value.left).to.equal(sizerRect.left);
                expect(res.value.width === sizerRect.width + 50).to.be.true;
                expect(res.value.height === sizerRect.height + 50).to.be.true;
            })

            .moveToObject('.konan__point_se', 2, 2)
            .buttonDown()
            .moveToObject('.konan__point_se', -(50 - POINT_OFFSET_LEFT), -(50 - POINT_OFFSET_RIGTH))
            .buttonUp()
            .getSizerRect()
            .then(function(res) {
                expect(res.value.width).to.equal(sizerRect.width);
                expect(res.value.height).to.equal(sizerRect.height);
            });
    });

    it('Ресайз кропа в сторону юго-запада', function() {
        let sizerRect;

        return client
            .url(URL)
            .waitForVisible('.konan', 3000)
            .getSizerRect()
            .then(function(res) {
                sizerRect = res.value;
            })

            .moveToObject('.konan__point_sw')
            .buttonDown()
            .moveToObject('.konan__point_sw', -(50 - POINT_OFFSET_LEFT), 50 - POINT_OFFSET_RIGTH)
            .buttonUp()
            .pause(100)

            .getSizerRect()
            .then(function(res) {
                expect(res.value.top).to.equal(sizerRect.top);
                expect(res.value.left + res.value.width).to.equal(sizerRect.left + sizerRect.width);
                expect(res.value.width === sizerRect.width + 50).to.be.true;
                expect(res.value.height === sizerRect.height + 50).to.be.true;
            })

            .moveToObject('.konan__point_sw', 2, 2)
            .buttonDown()
            .moveToObject('.konan__point_sw', 50 + POINT_OFFSET_LEFT, -(50 + POINT_OFFSET_RIGTH))
            .buttonUp()
            .getSizerRect()
            .then(function(res) {
                expect(res.value.width).to.equal(sizerRect.width);
                expect(res.value.height).to.equal(sizerRect.height);
            });
    });
});
