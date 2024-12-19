"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', '../../../../lib/validate_building_data', 'text!templates/scorecards/charts/use_types.html'], function ($, _, Backbone, d3, wrap, validateBuildingData, UseTypesTemplate) {
  var UseTypesView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(UseTypesTemplate);
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
      var buildingData = data[0];
      var _validateBuildingData = validateBuildingData(buildingData, {
          largestpropertyusetypegfa: 'number',
          secondlargestpropertyusetypegfa: 'number',
          thirdlargestpropertyusetypegfa: 'number',
          largestpropertyusetype: 'string',
          secondlargestpropertyusetype: 'string',
          thirdlargestpropertyusetype: 'string',
          id: 'number',
          yearbuilt_string: 'string',
          yearbuilt: 'number',
          propertygfabuildings: 'number'
        }),
        typedData = _validateBuildingData.typedData,
        valid = _validateBuildingData.valid;
      if (!valid) {
        this.showChart = false;
        return false;
      }
      var largestpropertyusetypegfa = typedData.largestpropertyusetypegfa,
        secondlargestpropertyusetypegfa = typedData.secondlargestpropertyusetypegfa,
        thirdlargestpropertyusetypegfa = typedData.thirdlargestpropertyusetypegfa,
        largestpropertyusetype = typedData.largestpropertyusetype,
        secondlargestpropertyusetype = typedData.secondlargestpropertyusetype,
        thirdlargestpropertyusetype = typedData.thirdlargestpropertyusetype,
        id = typedData.id,
        yearbuilt_string = typedData.yearbuilt_string,
        yearbuilt = typedData.yearbuilt,
        propertygfabuildings = typedData.propertygfabuildings;

      // In the data, if all the targets are 0, null, or undefined, don't show the chart
      var dataException = [largestpropertyusetypegfa, secondlargestpropertyusetypegfa, thirdlargestpropertyusetypegfa].every(function (v) {
        return !v;
      });
      if (dataException) {
        this.showChart = false;
        return false;
      }
      var totalGfa = Number(largestpropertyusetypegfa !== null && largestpropertyusetypegfa !== void 0 ? largestpropertyusetypegfa : 0) + Number(secondlargestpropertyusetypegfa !== null && secondlargestpropertyusetypegfa !== void 0 ? secondlargestpropertyusetypegfa : 0) + Number(thirdlargestpropertyusetypegfa !== null && thirdlargestpropertyusetypegfa !== void 0 ? thirdlargestpropertyusetypegfa : 0);
      var chartData = {
        first: largestpropertyusetypegfa ? largestpropertyusetypegfa / totalGfa * 100 : 0,
        second: secondlargestpropertyusetypegfa ? secondlargestpropertyusetypegfa / totalGfa * 100 : 0,
        third: thirdlargestpropertyusetypegfa ? thirdlargestpropertyusetypegfa / totalGfa * 100 : 0
      };
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      var _totalSquareFootage = numberWithCommas(propertygfabuildings);
      var getLegendText = function getLegendText(gfa, useType) {
        if (isNaN(gfa)) return null;
        var roundedGfa = Math.round(gfa);
        if (gfa === 0) return null;
        var next = "".concat(roundedGfa, "% ").concat(useType);
        return next;
      };
      var _legendFirstText = getLegendText(chartData.first, largestpropertyusetype);
      var _legendSecondText = getLegendText(chartData.second, secondlargestpropertyusetype);
      var _legendThirdText = getLegendText(chartData.third, thirdlargestpropertyusetype);
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
      var PADDING = 6;
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
      var padLabel = FONT_SIZE + PADDING;
      var compareTranslation;
      var largerRadius = radius + padLabel;
      var largerRadiusArcGenerator = d3.arc().innerRadius(0).outerRadius(largerRadius);
      var testing = data_ready
      // Sort largest to smallest
      .sort(function (a, b) {
        return b.value - a.value;
      })
      // If overlapping, calculate translation on larger arc out from center
      .reduce(function (acc, d) {
        var translate = arcGenerator.centroid(d);
        if (compareTranslation) {
          var _compareTranslation = compareTranslation,
            _compareTranslation2 = _slicedToArray(_compareTranslation, 2),
            x = _compareTranslation2[0],
            y = _compareTranslation2[1];
          var _translate = translate,
            _translate2 = _slicedToArray(_translate, 2),
            tx = _translate2[0],
            ty = _translate2[1];
          if (Math.abs(tx - x) < padLabel || Math.abs(ty - y) < padLabel) {
            translate = largerRadiusArcGenerator.centroid(d);
            largerRadius = largerRadius + padLabel;
            largerRadiusArcGenerator = d3.arc().innerRadius(0).outerRadius(largerRadius);
          }
        }
        compareTranslation = translate;
        var next = _objectSpread(_objectSpread({}, d), {}, {
          translate: translate
        });
        acc.push(next);
        return acc;
      }, []);

      // Now add the annotation. Use the centroid method to get the best coordinates
      // This is just to add a stroke behind percentage text
      svg.selectAll('mySlices').data(testing).enter().append('text').text(function (d) {
        var percent = "".concat(Math.round(d.value), "%");
        return percent;
      }).attr('transform', function (d) {
        return 'translate(' + d.translate + ')';
      }).attr('class', 'text-chart pie-chart-text').style('text-anchor', 'middle').style('font-size', FONT_SIZE);
      // This is the percentage text itself
      svg.selectAll('mySlices').data(testing).enter().append('text').text(function (d) {
        var percent = "".concat(Math.round(d.value), "%");
        return percent;
      }).attr('transform', function (d) {
        return 'translate(' + d.translate + ')';
      }).attr('class', 'text-chart').style('text-anchor', 'middle').style('font-size', FONT_SIZE);
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
  return UseTypesView;
});