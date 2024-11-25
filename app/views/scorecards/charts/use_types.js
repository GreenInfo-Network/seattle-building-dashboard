"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', 'text!templates/scorecards/charts/use_types.html'], function ($, _, Backbone, d3, wrap, UseTypesTemplate) {
  var UseTypesView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(UseTypesTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
    },
    // Templating for the HTML + chart
    chartData: function chartData() {
      var data = this.data;
      var _data$ = data[0],
        largestpropertyusetypegfa = _data$.largestpropertyusetypegfa,
        secondlargestpropertyusetypegfa = _data$.secondlargestpropertyusetypegfa,
        thirdlargestpropertyusetypegfa = _data$.thirdlargestpropertyusetypegfa,
        largestpropertyusetype = _data$.largestpropertyusetype,
        secondlargestpropertyusetype = _data$.secondlargestpropertyusetype,
        thirdlargestpropertyusetype = _data$.thirdlargestpropertyusetype,
        id = _data$.id,
        yearbuilt_string = _data$.yearbuilt_string,
        yearbuilt = _data$.yearbuilt;
      var totalGfa = Number(largestpropertyusetypegfa !== null && largestpropertyusetypegfa !== void 0 ? largestpropertyusetypegfa : 0) + Number(secondlargestpropertyusetypegfa !== null && secondlargestpropertyusetypegfa !== void 0 ? secondlargestpropertyusetypegfa : 0) + Number(thirdlargestpropertyusetypegfa !== null && thirdlargestpropertyusetypegfa !== void 0 ? thirdlargestpropertyusetypegfa : 0);
      var chartData = {
        first: largestpropertyusetypegfa ? largestpropertyusetypegfa / totalGfa * 100 : 0,
        second: secondlargestpropertyusetypegfa ? secondlargestpropertyusetypegfa / totalGfa * 100 : 0,
        third: thirdlargestpropertyusetypegfa ? thirdlargestpropertyusetypegfa / totalGfa * 100 : 0
      };
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      var _totalSquareFootage = numberWithCommas(totalGfa);
      var getLegendText = function getLegendText(gfa) {
        if (isNaN(gfa)) return null;
        var roundedGfa = Math.round(gfa);
        if (gfa === 0) return null;
        var next = "".concat(roundedGfa, "% ").concat(largestpropertyusetype);
        return next;
      };
      var _legendFirstText = getLegendText(chartData.first);
      var _legendSecondText = getLegendText(chartData.second);
      var _legendThirdText = getLegendText(chartData.third);
      var _buildingId = id;
      var _yearBuilt = yearbuilt_string !== null && yearbuilt_string !== void 0 ? yearbuilt_string : "".concat(yearbuilt);
      var _useTypeNum = [_legendFirstText, _legendSecondText, _legendThirdText].filter(function (v) {
        return v !== null;
      }).length;
      return {
        chartData: chartData,
        _totalSquareFootage: _totalSquareFootage,
        _legendFirstText: _legendFirstText,
        _legendSecondText: _legendSecondText,
        _legendThirdText: _legendThirdText,
        _useTypeNum: _useTypeNum,
        _buildingId: _buildingId,
        _yearBuilt: _yearBuilt
      };
    },
    renderChart: function renderChart(chartData) {
      var FONT_SIZE = 12;
      var parent = d3.select(this.viewParent).select('.use-types-chart');
      if (!parent.node() || !chartData) return;
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;

      // set the dimensions and margins of the graph
      var margin = 10;
      var height = outerHeight - margin * 2;
      var width = outerWidth - margin * 2;

      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      var radius = Math.min(width, height) / 2 - margin;

      // append the svg object to the div called 'my_dataviz'
      var svg = parent.append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + outerHeight / 2 + ')');

      // Compute the position of each group on the pie:
      var pie = d3.pie().value(function (d) {
        return d.value;
      });
      var filteredChartData = Object.fromEntries(Object.entries(chartData).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        return v > 0;
      }));
      var data_ready = pie(d3.entries(filteredChartData));
      // Now I know that group A goes from 0 degrees to x degrees and so on.

      // shape helper to build arcs:
      var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg.selectAll('mySlices').data(data_ready).enter().append('path').attr('d', arcGenerator).attr('class', function (d) {
        return "use-types-chart-section use-types-chart-".concat(d.data.key);
      });

      // Now add the annotation. Use the centroid method to get the best coordinates
      svg.selectAll('mySlices').data(data_ready).enter().append('text').text(function (d) {
        var percent = "".concat(Math.round(d.value), "%");
        return percent;
      }).attr('transform', function (d) {
        return 'translate(' + arcGenerator.centroid(d) + ')';
      }).attr('class', 'text-chart').style('text-anchor', 'middle').style('font-size', FONT_SIZE);
    },
    render: function render() {
      return this.template(this.chartData());
    },
    afterRender: function afterRender() {
      var chartData = this.chartData();
      this.renderChart(chartData === null || chartData === void 0 ? void 0 : chartData.chartData);
    }
  });
  return UseTypesView;
});