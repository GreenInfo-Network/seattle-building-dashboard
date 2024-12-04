"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
      var validated = data.map(function (d) {
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
      })).range([0, width]);
      var xAxisTicks = _toConsumableArray(new Set(chartData.map(function (d) {
        return d.year;
      })));
      var xAxis = svg.append('g').attr("transform", "translate(0,".concat(height + AXIS_PADDING, ")")).attr('class', 'text-chart').call(d3.axisBottom(x).tickSize(0).tickValues(xAxisTicks).tickFormat(function (v) {
        return "".concat(v);
      }));
      svg.append('text').attr('class', 'performance-over-time-axis-label text-chart').attr('text-anchor', 'middle').attr('y', height + (AXIS_PADDING * 4 + FONT_SIZE)).attr('x', width / 2).text('Reporting year');

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');
      function roundnum(num) {
        return Math.ceil(num / 50) * 50;
      }
      var max = roundnum(d3.max(chartData, function (d) {
        return +d.n;
      }));
      // Add Y axis
      var y = d3.scaleLinear().domain([0, max]).range([height, 0]);
      var yAxis = svg.append('g').attr("transform", "translate(".concat(AXIS_PADDING * -1, ", 0)")).attr('class', 'text-chart').call(d3.axisLeft(y).ticks(max / 50).tickSize(0));

      // Make the y axis line invisible
      yAxis.select('.domain').attr('stroke', 'transparent');
      svg.append('text').attr('class', 'performance-over-time-axis-label text-chart').attr('text-anchor', 'middle').attr('y', -1 * (AXIS_PADDING * 4 + FONT_SIZE)).attr('x', height / -2).attr('transform', 'rotate(-90)').text('Weather Normalized Site EUI (kBtu/SF)');

      // Draw the background lines
      var yAxisExtent = [0, max];
      for (var i = yAxisExtent[0] + 50; i < yAxisExtent[1]; i += 50) {
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
          var _iterator2 = _createForOfIteratorHelper(values),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var v = _step2.value;
              svg.append('circle').attr('class', "performance-over-time-".concat(key, "-dot")).attr('cx', x(v.year)).attr('cy', y(+v.n));
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
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