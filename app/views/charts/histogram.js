"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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