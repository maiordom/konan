'use strict';

(function ($, undefined, exports) {
    //eslint-disable-line

    'use strict' //eslint-disable-line

    ;
    var $doc = $(document); //eslint-disable-line

    function Konan($el) {
        //eslint-disable-line
        this.init($el);
    }

    Konan.prototype = { //eslint-disable-line
        $selection: null,
        scaleTo: { w: null, h: null },
        destImgSize: { w: null, h: null },
        container: { w: null, h: null },
        offset: { x: null, y: null },
        dragStart: { x: null, y: null },
        cropBox: { w: 200, h: 200, x: null, y: null, minW: null, minH: null },

        init: function init($el) {
            this.cacheNodes($el);
            this.scaleTo = {
                w: $el.width(),
                h: $el.height()
            };
        },

        startCropping: function startCropping(params) {
            $.extend(this.cropBox, params.cropBox);

            this.createCanvas();

            if (params.file) {
                this.readFile(params.file).then((function (src) {
                    this.processImage(src);
                }).bind(this));
            } else if (params.src) {
                this.processImage(params.src);
            }
        },

        processImage: function processImage(src) {
            this.getImage(src).then((function (img) {
                if (this.validateImage(img)) {
                    this.emit('start-crop');
                    this.initialize(img);
                } else {
                    this.emit('error-size');
                }
            }).bind(this));
        },

        cacheNodes: function cacheNodes($el) {
            this.$el = $el;
            this.$face = $el.find('.konan__face');
            this.$sizer = $el.find('.konan__sizer');
            this.$board = $el.find('.konan__board');
        },

        emit: function emit() {},

        getCroppedData: function getCroppedData() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var deferred = $.Deferred();

            canvas.setAttribute('width', this.cropBox.w);
            canvas.setAttribute('height', this.cropBox.h);
            canvas.setAttribute('class', 'konan__canvas');

            ctx.drawImage(this.$selection[0], this.cropBox.x, this.cropBox.y, this.cropBox.w, this.cropBox.h, 0, 0, this.cropBox.w, this.cropBox.h);

            if (canvas.toBlob) {
                canvas.toBlob(function (file) {
                    deferred.resolve(file);
                });
            } else {
                deferred.reject();
            }

            return deferred.promise();
        },

        initialize: function initialize(img) {
            this.calcSize(img);
            this.createSelection(img);
            this.drawSizer();
            this.setCoords();
            this.attachEventListeners();
        },

        attachEventListeners: function attachEventListeners() {
            this.$face.on('mousedown', this.onSizerFaceMouseDown.bind(this));
            this.$el.on('mousedown', '.konan__point', this.onSizerPointMouseDown.bind(this));
        },

        onSizerFaceMouseDown: function onSizerFaceMouseDown(evt) {
            this.startDrag(evt, 'face');
            $doc.on('mouseup.konan', this.stopMove.bind(this));
            $doc.on('mousemove.konan', this.move.bind(this));
            return false;
        },

        onSizerPointMouseDown: function onSizerPointMouseDown(evt) {
            this.startDrag(evt, 'point');
            $doc.on('mouseup.konan', this.stopResize.bind(this));
            $doc.on('mousemove.konan', this.resize.bind(this));
            return false;
        },

        startDrag: function startDrag(evt, type) {
            var sizer = this.$sizer;
            var sizerOffset = sizer.offset();
            var containerOffset = this.$el.offset();

            this.dragTrigger = $(evt.currentTarget);
            this.dragTrigger.addClass('konan__' + type + '_active');
            if (type === 'point') {
                this.dragType = this.dragTrigger.attr('class').match(/konan__point_(\w+)/)[1];
            }
            this.dragStart.x = evt.pageX - sizerOffset.left;
            this.dragStart.y = evt.pageY - sizerOffset.top;
            this.offset = {
                x: containerOffset.left,
                y: containerOffset.top
            };

            $.extend(this.cropBox, {
                w: sizer.width(),
                h: sizer.height(),
                x: sizer.position().left,
                y: sizer.position().top
            });

            this.emit('start');
        },

        resize: function resize(evt) {
            var pageX = evt.pageX;
            var pageY = evt.pageY;
            var dragType = this.dragType;
            var fixPageX;
            var fixPageY;
            var maxW;
            var maxH;
            var w = this.cropBox.w;
            var h = this.cropBox.h;
            var x = this.cropBox.x;
            var y = this.cropBox.y;

            switch (dragType) {
                case 'nw':
                    maxH = this.cropBox.y + this.cropBox.h;
                    maxW = this.cropBox.x + this.cropBox.w;
                    fixPageY = Math.max(pageY, this.offset.y);

                    h = this.cropBox.h - (fixPageY - this.offset.y - this.cropBox.y);
                    w = h = Math.min(maxW, Math.min(maxH, h));
                    y = maxH - h;
                    x = maxW - w;

                    break;

                case 'ne':
                    maxH = this.cropBox.y + this.cropBox.h;
                    maxW = this.container.w - this.cropBox.x;
                    fixPageY = Math.max(pageY, this.offset.y);

                    h = this.cropBox.h - (fixPageY - this.offset.y - this.cropBox.y);
                    w = h = Math.min(maxW, Math.min(maxH, h));
                    y = maxH - h;

                    break;

                case 'sw':
                    fixPageX = Math.max(pageX, this.offset.x);
                    maxH = this.container.h - this.cropBox.y;

                    w = this.cropBox.w - (fixPageX - this.offset.x - this.cropBox.x);
                    w = h = Math.min(maxH, w);
                    x = this.cropBox.x + (this.cropBox.w - w);

                    break;

                case 'se':
                    fixPageX = Math.min(pageX, this.offset.x + this.container.w);
                    maxH = this.container.h - this.cropBox.y;

                    w = fixPageX - this.offset.x - x;
                    w = h = Math.min(maxH, w);

                    break;
            }

            if (w >= this.cropBox.minW && w <= this.container.w && h >= this.cropBox.minH && h <= this.container.h) {
                this.cropBox.w = Math.floor(w);
                this.cropBox.h = Math.floor(h);
                this.cropBox.x = Math.floor(x);
                this.cropBox.y = Math.floor(y);
                this.renderCropBox();
                this.emitShowPreview(this.cropBox.w, this.cropBox.h, this.cropBox.x, this.cropBox.y);
            }

            this.setCoords();
            this.drawSizer();
        },

        renderCropBox: function renderCropBox() {
            this.$sizer.css({
                width: this.cropBox.w,
                height: this.cropBox.h,
                left: this.cropBox.x,
                top: this.cropBox.y
            });
        },

        move: function move(evt) {
            this.cropBox.x = Math.floor(evt.pageX - this.dragStart.x - this.offset.x);
            this.cropBox.y = Math.floor(evt.pageY - this.dragStart.y - this.offset.y);

            this.normalizeCoords();
            this.setCoords();
            this.emitShowPreview(this.cropBox.w, this.cropBox.h, this.cropBox.x, this.cropBox.y);
        },

        normalizeCoords: function normalizeCoords() {
            if (this.cropBox.x < 0) {
                this.cropBox.x = 0;
            }

            if (this.cropBox.x + this.cropBox.w > this.container.w) {
                this.cropBox.x = this.container.w - this.cropBox.w;
            }

            if (this.cropBox.y < 0) {
                this.cropBox.y = 0;
            }

            if (this.cropBox.y + this.cropBox.h > this.container.h) {
                this.cropBox.y = this.container.h - this.cropBox.h;
            }
        },

        stopResize: function stopResize() {
            $doc.off('mouseup.konan');
            $doc.off('mousemove.konan');
            this.dragTrigger.removeClass('konan__point_active');
            setTimeout((function () {
                this.emit('end');
            }).bind(this));
        },

        stopMove: function stopMove() {
            $doc.off('mouseup.konan');
            $doc.off('mousemove.konan');
            setTimeout((function () {
                this.emit('end');
            }).bind(this));
        },

        createSelection: function createSelection(img) {
            if (this.$selection) {
                this.$selection.remove();
            }

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            this.$face.append(canvas);
            canvas.className = 'konan__selection';
            canvas.setAttribute('width', this.container.w);
            canvas.setAttribute('height', this.container.h);
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.destImgSize.w, this.destImgSize.h);
            this.$selection = this.$el.find('.konan__selection');
        },

        setCoords: function setCoords() {
            this.$sizer.css('top', this.cropBox.y);
            this.$sizer.css('left', this.cropBox.x);
            this.$selection.css('top', -this.cropBox.y);
            this.$selection.css('left', -this.cropBox.x);
        },

        drawSizer: function drawSizer() {
            this.$sizer.removeClass('konan__sizer_hide');
            this.$sizer.width(this.cropBox.w);
            this.$sizer.height(this.cropBox.h);
        },

        validateImage: function validateImage(img) {
            return img.width >= this.cropBox.minW && img.height >= this.cropBox.minH;
        },

        emitShowPreview: function emitShowPreview(previewWidth, previewHeight, x, y) {
            this.emit('preview', {
                canvas: this.canvas,
                width: previewWidth,
                height: previewHeight,
                x: x,
                y: y
            });
        },

        calcSize: function calcSize(img) {
            var srcW = img.width;
            var srcH = img.height;
            var scaleTo = this.scaleTo;
            var aspectRatio = srcW / srcH;
            var destW;
            var destH;
            var side;

            if (srcH < scaleTo.w && srcW < scaleTo.h) {
                destW = srcW;
                destH = srcH;
            } else if (aspectRatio === 1) {
                side = Math.min(scaleTo.w, scaleTo.h);
                destW = side;
                destH = side;
            } else if (aspectRatio > 1) {
                destW = srcW > scaleTo.w ? scaleTo.w : srcW;
                destH = srcH * (scaleTo.w / srcW);
            } else {
                destW = srcW * (scaleTo.h / srcH);
                destH = srcH > scaleTo.h ? scaleTo.h : srcH;
            }

            this.destImgSize.w = Math.floor(destW);
            this.destImgSize.h = Math.floor(destH);
            this.setSize(this.destImgSize.w, this.destImgSize.h);
            this.ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, this.destImgSize.w, this.destImgSize.h);
            this.cropBox.x = Math.floor((this.container.w - this.cropBox.w) / 2);
            this.cropBox.y = Math.floor((this.container.h - this.cropBox.h) / 2);
            this.emitShowPreview(this.cropBox.w, this.cropBox.h, this.cropBox.x, this.cropBox.y);
        },

        setSize: function setSize(width, height) {
            this.canvas.setAttribute('width', width);
            this.canvas.setAttribute('height', height);
            this.$board.css('top', (this.scaleTo.h - height) / 2);
            this.$board.width(width);
            this.$board.height(height);
            this.container.w = width;
            this.container.h = height;
        },

        createCanvas: function createCanvas() {
            if (this.canvas) {
                return;
            }

            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('class', 'konan__canvas');
            this.ctx = this.canvas.getContext('2d');
            this.$board.append(this.canvas);
        },

        readFile: function readFile(file) {
            var reader = new FileReader();
            var deferred = $.Deferred();

            reader.onload = function (evt) {
                deferred.resolve(evt.target.result);
            };

            reader.onerror = function () {
                deferred.reject();
            };

            reader.readAsDataURL(file);

            return deferred.promise();
        },

        getImage: function getImage(src) {
            var img = new Image();
            var deferred = $.Deferred();

            img.onload = function () {
                deferred.resolve(img);
            };

            img.onerror = function () {
                deferred.reject();
            };

            img.src = src;

            return deferred.promise();
        }
    };

    exports.Konan = Konan; //eslint-disable-line
})(jQuery, undefined, window); //eslint-disable-line