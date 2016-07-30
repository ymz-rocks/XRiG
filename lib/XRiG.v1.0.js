// Array filter polyfill - provided by MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

if (!Array.prototype.filter) 
{
    Array.prototype.filter = function (func)
    {
        'use strict';

        if (this === void 0 || this === null) throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;

        if (typeof func !== 'function') throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;

        for (var i = 0; i < len; i++)
        {
            if (i in t)
            {
                if (func.call(thisArg, t[i], i, t)) res.push(t[i]);
            }
        }

        return res;
    };
}

// Array map polyfill - provided by MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

if (!Array.prototype.map)
{
    Array.prototype.map = function (callback, thisArg)
    {
        var T, A, k, kValue, mappedValue;

        if (this == null)
        {
            throw new TypeError(' this is null or not defined');
        }

        var O = Object(this);
        var len = O.length >>> 0;

        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');

        if (arguments.length > 1) T = thisArg;

        A = new Array(len); k = 0;

        while (k < len)
        {
            if (k in O)
            {
                kValue = O[k];

                mappedValue = callback.call(T, kValue, k, O);

                A[k] = mappedValue;
            }
            
            k++;
        }

        return A;
    };
}

/*
 * XRiG JavaScript Library v1.0
 * Copyright (c) 2016 ymz
 * Released under a Creative Commons Attribution 4.0 International License
 * https://github.com/ymz-rocks/XRiG/blob/master/LICENSE.md
 */

function XRiG(config)
{
    if (!config) return; var instance = {}, me = this;

    function Helpers() { }

    Helpers.color = function (values)
    {
        return 'rgba(' + values.join(',') + ',1)';
    };

    Helpers.getElement = function (parent, tag)
    {
        var element = document.getElementsByTagName(tag);

        return element && element[0] ? element[0] : undefined;
    };

    Helpers.on = function (name, invoke, element)
    {
        if (!element) element = window;

        if (window.attachEvent) element.attachEvent('on' + name, invoke);
        else element.addEventListener(name, invoke, false);
    };

    function XCell(canvas, ctx, x, y, size)
    {
        this.top = y * size;
        this.left = x * size;
        this.radius = size / 2;
        this.value = 0;

        this.right = this.left + size;
        this.bottom = this.top + size;

        this.space = 0;
        this.offset = 0;

        if (config.style.space && config.style.space > 0)
        {
            this.space = config.style.space;
            this.offset = this.space / (this.space - 2);
        }

        this.active = function (e)
        {
            var x = e.offsetX || e.layerX - canvas.offsetLeft, y = e.offsetY || e.layerY - canvas.offsetTop;
            
            return x > this.left && x < this.right && y > this.top && y < this.bottom;
        };

        this.draw = function ()
        {
            var x = this.left + this.radius + this.offset,
                y = this.top + this.radius + this.offset,
                r = this.radius - this.space;

            ctx.clearRect(this.left, this.top, size, size);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.closePath();

            ctx.fillStyle = instance.pallete[this.value].replace('1)', config.style.alpha + ')');
            ctx.fill();
        };

        this.update = function (e, timespan)
        {
            if (!timespan) timespan = 0;

            this.value += config.tolerance > timespan ? 1 : -1;

            if (this.value == instance.pallete.length) this.value = 0;
            else if (this.value < 0) this.value = instance.pallete.length - 1;

            this.draw();
        };
    }

    function XValue(val)
    {
        this.code = val;
        this.hex = val.toString(16).toUpperCase();

        if (this.hex.length == 1) this.hex = '0' + this.hex;
    }

    XValue.prototype.toString = function ()
    {
        return this.hex;
    };

    this.draw = function (ctx, canvas)
    {
        var size = config.size.canvas / config.size.rig, x, y;
        
        for (var i = 0; i < instance.matrix.length; i++)
        {
            x = i % config.size.rig;
            y = parseInt(i / config.size.rig);
            
            if (instance.init) instance.matrix[i] = new XCell(canvas, ctx, x, y, size);

            instance.matrix[i].draw();
        }
    };

    this.each = function (invoke)
    {
        if (!invoke) return;

        for (var i in instance.matrix) invoke(instance.matrix[i], i);
    };

    this.refresh = function ()
    {
        var rig = Helpers.getElement(config.parent || document, 'x-rig'); if (!rig) return;

        var canvas = Helpers.getElement(rig, 'canvas'); if (!canvas || !canvas.getContext) return;

        canvas.width = canvas.height = config.size.canvas;

        var ctx = canvas.getContext('2d');

        rig.style.display = 'block';
        rig.style.width = config.size.canvas + 'px';
        rig.style.margin = '0 auto';

        me.draw(ctx, canvas); if (!instance.init) return;

        Helpers.on('mousedown', function (e)
        {
            instance.time = new Date().getTime();
        });

        Helpers.on('mouseup', function (e)
        {
            if (e.stopPropagation) e.stopPropagation();

            instance.matrix.filter(function (cell)
            {
                return cell.active(e);

            })[0].update(e, new Date().getTime() - instance.time);

            instance.fire.change();

        }, canvas);

        instance.fire.load();
    };

    this.reset = function()
    {
        this.each(function (cell)
        {
            cell.value = 0;
            cell.draw();
        });

        instance.fire.change();
    };

    this.val = function ()
    {
        var hash = [], next;

        for (var i = 0; i < instance.matrix.length; i += 2)
        {
            next = instance.matrix[i + 1] ? instance.matrix[i + 1].value : 0;

            hash.push(new XValue(instance.matrix[i].value * 10 + next));
        }

        return hash;
    };

    config.size = config.size || {};
    config.size.rig = config.size.rig || 4;
    config.size.canvas = config.size.canvas || 200
    config.style = config.style || {};
    config.style.alpha = config.style.alpha || 1;
    config.tolerance = config.tolerance || 150;
    config.on = config.on || {};

    instance.init = true;
    instance.matrix = new Array(Math.pow(config.size.rig, 2));
    instance.pallete = config.palette.map(function (item) { return Helpers.color(item); });
    instance.fire =
    {
        change: function ()
        {
            if (config.on.change)
            {
                config.on.change(me.val());
            }
        },

        load: function ()
        {
            instance.init = false;

            if (config.on.load)
            {
                config.on.load(me);
            }
        }
    };

    Helpers.on('load', this.refresh);
}
