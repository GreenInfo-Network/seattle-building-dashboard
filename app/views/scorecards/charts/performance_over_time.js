"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', '../../../../lib/validate_building_data', 'text!templates/scorecards/charts/performance_over_time.html'], function ($, _, Backbone, d3, wrap, validateBuildingData, PerformanceOverTimeTemplate) {
  var PerformanceOverTimeView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(PerformanceOverTimeTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.showChart = true;
    },
    // Templating for the HTML + chart
    chartData: function chartData() {
      var data = this.data;

      // No historical data when looking at earliest year
      if (!data || !Array.isArray(data)) {
        this.showChart = false;
        return false;
      }
      var validated = data
      // Some points haven't been reported, but this shouldn't invalidate it
      // Remove unreported points
      .filter(function (d) {
        return d.value !== null && d.value !== undefined;
      }).map(function (d) {
        return validateBuildingData(d, {
          id: 'string',
          value: 'number',
          year: 'number'
        });
      });
      var valid = validated.every(function (d) {
        return d.valid;
      });
      var typedData = validated.map(function (d) {
        return d.typedData;
      });
      if (!valid) {
        this.showChart = false;
        return false;
      }
      var chartData = typedData.map(function (v) {
        return {
          n: v === null || v === void 0 ? void 0 : v.value,
          name: v === null || v === void 0 ? void 0 : v.id,
          year: v === null || v === void 0 ? void 0 : v.year
        };
      });
      return {
        chartData: chartData
      };
    },
    renderChart: function renderChart(chartData) {
      var FONT_SIZE = 12;
      var AXIS_PADDING = 6;
      var parent = d3.select(this.viewParent).select('.performance-over-time-chart');
      if (!parent.node() || !chartData) return;
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;

      // set the dimensions and margins of the graph
      var margin = {
          top: 10,
          right: 30,
          bottom: 40,
          left: 60
        },
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = parent.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Add a background
      svg.append('rect').attr('class', 'performance-over-time-background-rect').attr('width', outerWidth - margin.left).attr('height', height);

      // group the data: I want to draw one line per group
      var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) {
        return d.name;
      }).entries(chartData);

      // Add X axis --> it is a date format
      var x = d3.scaleLinear().domain(d3.extent(chartData, function (d) {
        return d.year;
      })).range([30, width]);
      var xAxisTicks = _toConsumableArray(new Set(chartData.map(function (d) {
        return d.year;
      })));
      var xAxis = svg.append('g').attr("transform", "translate(0,".concat(height + AXIS_PADDING, ")")).attr('class', 'text-chart').call(d3.axisBottom(x).tickSize(0).tickValues(xAxisTicks).tickFormat(function (v) {
        return "".concat(v);
      }));
      svg.append('text').attr('class', 'performance-over-time-axis-label text-chart').attr('text-anchor', 'middle').attr('y', height + (AXIS_PADDING * 4 + FONT_SIZE)).attr('x', width / 2).text('Reporting year');

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');
      function roundUpNum(num) {
        var upper = Math.ceil(num * 1.15);
        return upper;
      }
      function roundDownNum(num) {
        var lower = Math.floor(num * 0.85);
        return lower;
      }
      var max = roundUpNum(d3.max(chartData, function (d) {
        return +d.n;
      }));
      var min = roundDownNum(d3.min(chartData, function (d) {
        return +d.n;
      }));
      var tickSize = (max - min) / 5;

      // Add Y axis
      var y = d3.scaleLinear().domain([min, max]).range([height, 0]);
      var yAxis = svg.append('g').attr("transform", "translate(".concat(AXIS_PADDING * -1, ", 0)")).attr('class', 'text-chart').call(d3.axisLeft(y).ticks(max / tickSize).tickSize(0));

      // Make the y axis line invisible
      yAxis.select('.domain').attr('stroke', 'transparent');
      svg.append('text').attr('class', 'performance-over-time-axis-label text-chart').attr('text-anchor', 'middle').attr('y', -1 * (AXIS_PADDING * 4 + FONT_SIZE)).attr('x', height / -2).attr('transform', 'rotate(-90)').text('Weather Normalized Site EUI (kBtu/SF)');

      // Draw the background lines
      var yAxisExtent = [min, max];
      for (var i = yAxisExtent[0] + tickSize; i < yAxisExtent[1]; i += tickSize) {
        svg.append('line').attr('class', 'performance-over-time-background-line').attr('x1', 0).attr('y1', y(i)).attr('x2', outerWidth).attr('y2', y(i));
      }

      // Draw the line
      svg.selectAll('.line').data(sumstat).enter().append('path').attr('fill', 'none').attr('class', function (d) {
        return "performance-over-time-".concat(d.key, "-line");
      }).attr('d', function (d) {
        return d3.line().x(function (d) {
          return x(d.year);
        }).y(function (d) {
          return y(+d.n);
        })(d.values);
      });

      // Draw the dots
      var _iterator = _createForOfIteratorHelper(sumstat),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var graphLine = _step.value;
          var key = graphLine.key,
            values = graphLine.values;
          var _iterator3 = _createForOfIteratorHelper(values),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var v = _step3.value;
              svg.append('circle').attr('class', "performance-over-time-".concat(key, "-dot")).attr('cx', x(v.year)).attr('cy', y(+v.n));
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = _createForOfIteratorHelper(sumstat),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _graphLine = _step2.value;
          var _key = _graphLine.key,
            _values = _graphLine.values;
          var _iterator4 = _createForOfIteratorHelper(_values),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var _v = _step4.value;
              var dotContainer = svg.append('g').attr('class', 'performance-over-time-dot-container');

              // Just to make the hover target larger
              dotContainer.append('circle').attr('fill', "transparent").attr('r', '1rem').attr('cx', x(_v.year)).attr('cy', y(+_v.n));
              var bgWidth = Math.max(40, 8 * "".concat(_v.n).length);
              dotContainer.append('rect').attr('class', "performance-over-time-".concat(_key, "-text-bg")).attr('width', "".concat(bgWidth, "px")).attr('height', '20px')
              // minus full height
              .attr('y', y(+_v.n) - AXIS_PADDING - 20)
              // minus half of width
              .attr('x', x(_v.year) - bgWidth / 2);
              dotContainer.append('text').attr('class', "performance-over-time-".concat(_key, "-hover-text text-chart")).attr('text-anchor', 'middle').attr('y', y(+_v.n) - AXIS_PADDING * 2).attr('x', x(_v.year)).text(_v.n);
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    render: function render() {
      var chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },
    afterRender: function afterRender() {
      var chartData = this.chartData();
      if (!chartData) return;
      this.renderChart(chartData.chartData);
    }
  });
  return PerformanceOverTimeView;
});