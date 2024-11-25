"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
define(['jquery', 'underscore', 'backbone', 'd3'], function ($, _, Backbone, d3) {
  var HistogramView = Backbone.View.extend({
    className: 'histogram',
    initialize: function initialize(options) {
      this.aspectRatio = options.aspectRatio || 7 / 1;
      this.height = 100;
      this.width = this.height * this.aspectRatio;
      this.selected_value = options.selected_value || null;
      this.gradients = options.gradients;
      this.colorScale = options.colorScale;
      this.filterRange = options.filterRange;
      this.fieldName = options.fieldName;
      this.slices = options.slices; // Not sure why we have slices, when that value can be extrapulated from this.gradients

      this.chart = d3.select(this.el).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 ' + this.width + ' ' + this.height).attr('preserveAspectRatio', 'none').attr('background', 'transparent');
      this.g = this.chart.append('g');
    },
    update: function update(options) {
      var _this = this;
      Object.keys(options).forEach(function (k) {
        if (_this.hasOwnProperty(k)) {
          _this[k] = options[k];
        }
      });
    },
    findQuantileIndexForValue: function findQuantileIndexForValue(val, quantiles) {
      if (!quantiles) {
        quantiles = this.colorScale.quantiles ? _toConsumableArray(this.colorScale.quantiles()) : _toConsumableArray(this.colorScale.domain());
      }
      var len = quantiles.length - 1;
      return _.reduce(quantiles, function (prev, curr, i) {
        // bail if we found an index
        if (prev > -1) return prev;

        // special case first index
        if (i === 0 && val < quantiles[0]) return i;

        // check if val is within range
        if (val >= quantiles[i - 1] && val < quantiles[i]) return i;

        // if no match yet, return index for the last bar
        if (i === len) return i + 1;

        // return current index
        return prev;
      }, -1);
    },
    updateHighlight: function updateHighlight(val) {
      if (!this.chart || this.selected_value === val) return;
      this.selected_value = val;
      this.chart.selectAll('rect').call(this.highlightBar, this);
    },
    highlightBar: function highlightBar(bars, context) {
      var ctxValue = context.selected_value;
      var quantiles = context.colorScale.quantiles ? _toConsumableArray(context.colorScale.quantiles()) : _toConsumableArray(context.colorScale.domain());
      var highlightIndex = ctxValue !== null ? context.findQuantileIndexForValue(ctxValue, quantiles) : null;
      bars.classed('highlight', function (d, i) {
        return i === highlightIndex;
      });
    },
    render: function render() {
      var colorScale = this.colorScale;
      var isThreshold = colorScale.quantiles ? false : true;
      var gradients = this.gradients;
      var counts = _.pluck(gradients, 'count');
      var height = this.height;
      var yScale = d3.scaleLinear().domain([0, d3.max(counts)]).range([0, this.height]);
      var xScale = d3.scaleBand().domain(d3.range(0, this.slices)).range([0, this.width]).padding(0.2);

      // threshold types use rounded bands for convienence
      if (isThreshold) {
        xScale.rangeRound([0, this.width]);
      }
      var bardata = xScale.domain().map(function (d, i) {
        return _objectSpread(_objectSpread({}, gradients[i]), {}, {
          idx: i,
          data: d,
          xpos: xScale(d) + xScale.bandwidth() / 2
        });
      });
      var filterValueForXpos = d3.scaleLinear().range(this.filterRange).domain([0, this.width]);

      // make scale available to caller
      this.xScale = xScale;

      // draw
      var bars = this.g.selectAll('rect').data(bardata, function (d) {
        return d.color;
      });
      bars.enter().append('rect').attr('fill', function (d) {
        // not on a continous scale
        // so just need the color from data
        if (isThreshold) return d.color;

        // mapping the color continously
        // so need to calculate the color for
        // this xpos
        //
        return colorScale(filterValueForXpos(d.xpos));
      }).attr('width', xScale.bandwidth()).attr('stroke-width', 0).attr('height', function (d) {
        return yScale(d.count);
      }).attr('x', function (d) {
        return xScale(d.data);
      }).attr('y', function (d) {
        return height - yScale(d.count);
      });
      bars.exit().remove();
      bars.call(this.highlightBar, this);
      this.g.selectAll('rect').filter(function (bucket, index) {
        return bucket.current === index;
      }).classed('current', true);
      return this.el;
    }
  });
  return HistogramView;
});