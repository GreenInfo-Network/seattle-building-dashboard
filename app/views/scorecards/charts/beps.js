"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', 'text!templates/scorecards/charts/beps.html'], function ($, _, Backbone, d3, wrap, BepsTemplate) {
  var BepsView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(BepsTemplate);
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
      return data;
    },
    renderChart: function renderChart(building) {
      var _this = this;
      var buildingData = building[0];
      var maxGhgi = 5;
      var totalGhgi = buildingData === null || buildingData === void 0 ? void 0 : buildingData.total_ghg_emissions_intensity;
      var divisor = 100 / maxGhgi;
      var multiplier = totalGhgi / maxGhgi;
      var chartData = [{
        group: 'ghgi',
        gas: (buildingData === null || buildingData === void 0 ? void 0 : buildingData.gas_ghg_percent) * 100 / divisor * multiplier,
        steam: (buildingData === null || buildingData === void 0 ? void 0 : buildingData.steam_ghg_percent) * 100 / divisor * multiplier,
        electricity: (buildingData === null || buildingData === void 0 ? void 0 : buildingData.electricity_ghg_percent) * 100 / divisor * multiplier
      }];
      var parent = d3.select(this.viewParent).select('.beps-chart');
      if (!parent.node()) return;
      var margin = {
        top: 25,
        right: 0,
        bottom: 50,
        left: 50
      };
      // TODO use the parent
      var outerWidth = 250; // parent.node().offsetWidth;
      var outerHeight = 250; // parent.node().offsetHeight;

      var height = outerHeight - margin.top - margin.bottom;
      var width = (outerWidth - margin.left - margin.right) / 2;
      var parentSvg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));
      var FONT_SIZE = 12;
      var X_AXIS_PADDING = 6;
      var svg = parentSvg.append('g').attr('transform', "translate(".concat(margin.left, ", ").concat(margin.top + X_AXIS_PADDING + FONT_SIZE, ")"));
      var groups = ['ghgi'];
      var subgroups = _toConsumableArray(new Set(chartData.map(function (d) {
        return Object.keys(d);
      }).flat())).filter(function (v) {
        return v !== 'group';
      });

      // Add a background

      svg.append('rect').attr('class', 'beps-bar-background-rect').attr('width', outerWidth - margin.right).attr('height', height);

      // Add bottom X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.1]);
      var xAxisA = svg.append('g').attr('transform', "translate(0, ".concat(Number(height) + X_AXIS_PADDING, ")")).call(d3.axisBottom(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        return _this.year;
      }));

      // Make the x axis line invisible
      xAxisA.select('.domain').attr('stroke', 'transparent');
      var ticks = svg.selectAll('.tick text');
      ticks.attr('class', 'beps-bar-axis-text text-chart');

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 5]).range([height, 0]);
      var yAxis = svg.append('g').attr('class', 'text-chart').attr('transform', "translate(".concat(X_AXIS_PADDING * -1, ", 0)")).call(d3.axisLeft(y).ticks(6).tickSize(0));
      yAxis.select('.domain').attr('stroke', 'transparent');
      svg.append('text').attr('class', 'beps-bar-y-axis-label text-chart').attr('text-anchor', 'middle').attr('y', -1 * (X_AXIS_PADDING + X_AXIS_PADDING + FONT_SIZE)).attr('x', height / -2).attr('transform', 'rotate(-90)').text('GHGI (kgCO2e/sf/yr)');

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      // Show the bars
      svg.append('g').selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData).enter().append('g').attr('class', function (d) {
        return "beps-bar beps-bar-".concat(d.key);
      }).selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) {
        return d;
      }).enter().append('rect').attr('x', function (d) {
        return x(d.data.group);
      }).attr('y', function (d) {
        return y(d[1]);
      }).attr('height', function (d) {
        return y(d[0]) - y(d[1]);
      }).attr('width', x.bandwidth());

      // Add year targets
      var targetYears = Object.entries(buildingData).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        return k.startsWith('BEPStarget_');
      }).reduce(function (acc, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[0],
          v = _ref4[1];
        var year = k.split('_')[1];
        acc[year] = Number(v);
        return acc;
      }, {});
      var targets = new Set();
      for (var _i2 = 0, _Object$entries = Object.entries(targetYears); _i2 < _Object$entries.length; _i2++) {
        var targetData = _Object$entries[_i2];
        var _targetData = _slicedToArray(targetData, 2),
          year = _targetData[0],
          target = _targetData[1];
        if (targets.has(target)) continue;
        targets.add(target);
        var _multiplier = target === 0 ? 0 : target / maxGhgi;
        var yPos = Number(height) - Number(height) * _multiplier;
        var targetText = "".concat(year, ": target ").concat(target.toFixed(2));
        svg.append('line').attr('class', 'beps-bar-target-line').attr('x1', 0).attr('y1', yPos).attr('x2', outerWidth).attr('y2', yPos);
        svg.append('text').attr('class', 'beps-bar-target-text  text-chart').attr('font-size', FONT_SIZE).attr('x', outerWidth - margin.left - margin.right).attr('y', yPos - X_AXIS_PADDING).text(targetText);
      }
    },
    render: function render() {
      return this.template(this.chartData());
    },
    afterRender: function afterRender() {
      var chartData = this.chartData();
      this.renderChart(chartData);
    }
  });
  return BepsView;
});