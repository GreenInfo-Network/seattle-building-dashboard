"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
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