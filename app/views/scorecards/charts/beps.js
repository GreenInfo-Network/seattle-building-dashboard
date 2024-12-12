"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', '../../../../lib/validate_building_data', 'text!templates/scorecards/charts/beps.html'], function ($, _, Backbone, d3, wrap, validateBuildingData, BepsTemplate) {
  var BepsView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(BepsTemplate);
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
          gas_ghg_percent: 'number',
          electricity_ghg_percent: 'number',
          steam_ghg_percent: 'number',
          year: 'number',
          total_ghg_emissions_intensity: 'number',
          bepstarget_2031: 'number',
          bepstarget_2036: 'number',
          bepstarget_2041: 'number',
          bepstarget_2046: 'number',
          beps_firstcomplianceyear: 'number'
        }),
        typedData = _validateBuildingData.typedData,
        valid = _validateBuildingData.valid;
      if (!valid) {
        this.showChart = false;
        return false;
      }
      var gas_ghg_percent = typedData.gas_ghg_percent,
        electricity_ghg_percent = typedData.electricity_ghg_percent,
        steam_ghg_percent = typedData.steam_ghg_percent,
        year = typedData.year,
        bepstarget_2031 = typedData.bepstarget_2031,
        bepstarget_2036 = typedData.bepstarget_2036,
        bepstarget_2041 = typedData.bepstarget_2041,
        bepstarget_2046 = typedData.bepstarget_2046;

      // In the data, if all the targets are 0, null, or undefined, don't show the chart
      var dataException = [bepstarget_2031, bepstarget_2036, bepstarget_2041, bepstarget_2046].every(function (v) {
        return !v;
      });
      if (dataException) {
        this.showChart = false;
        return false;
      }
      return {
        chartData: typedData,
        _showGas: !isNaN(gas_ghg_percent) && Number(gas_ghg_percent) > 0,
        _showElectricity: !isNaN(electricity_ghg_percent) && Number(electricity_ghg_percent) > 0,
        _showSteam: !isNaN(steam_ghg_percent) && Number(steam_ghg_percent) > 0,
        _year: year
      };
    },
    renderChart: function renderChart(buildingData) {
      var _buildingData$bepstar,
        _gas_ghg_percent,
        _electricity_ghg_perc,
        _steam_ghg_percent,
        _this = this,
        _buildingData$beps_fi;
      var totalGhgi = buildingData === null || buildingData === void 0 ? void 0 : buildingData.total_ghg_emissions_intensity;
      function roundUpNum(num) {
        var nearestRound = Math.ceil(num / 2) * 2;
        if (Math.abs(num - nearestRound) < 1) {
          nearestRound = nearestRound + 1;
        }
        return nearestRound;
      }
      var maxGhgi = Math.max(roundUpNum((_buildingData$bepstar = buildingData === null || buildingData === void 0 ? void 0 : buildingData.bepstarget_2031) !== null && _buildingData$bepstar !== void 0 ? _buildingData$bepstar : 0), roundUpNum(totalGhgi));
      var divisor = 100 / maxGhgi;
      var multiplier = totalGhgi / maxGhgi;
      var gas_ghg_percent = buildingData.gas_ghg_percent,
        electricity_ghg_percent = buildingData.electricity_ghg_percent,
        steam_ghg_percent = buildingData.steam_ghg_percent;
      gas_ghg_percent = Number((_gas_ghg_percent = gas_ghg_percent) !== null && _gas_ghg_percent !== void 0 ? _gas_ghg_percent : 0);
      electricity_ghg_percent = Number((_electricity_ghg_perc = electricity_ghg_percent) !== null && _electricity_ghg_perc !== void 0 ? _electricity_ghg_perc : 0);
      steam_ghg_percent = Number((_steam_ghg_percent = steam_ghg_percent) !== null && _steam_ghg_percent !== void 0 ? _steam_ghg_percent : 0);
      var chartData = [{
        group: 'ghgi',
        gas: gas_ghg_percent * 100 / divisor * multiplier,
        steam: steam_ghg_percent * 100 / divisor * multiplier,
        electricity: electricity_ghg_percent * 100 / divisor * multiplier
      }];
      var parent = d3.select(this.viewParent).select('.beps-chart');
      if (!parent.node()) return;
      var margin = {
        top: 20,
        right: 0,
        bottom: 50,
        left: 50
      };
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var height = outerHeight - margin.top - margin.bottom;
      var width = (outerWidth - margin.left - margin.right) / 2;
      var parentSvg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));
      var FONT_SIZE = 12;
      var X_AXIS_PADDING = 6;
      var svg = parentSvg.append('g').attr('transform', "translate(".concat(margin.left, ", ").concat(margin.top + FONT_SIZE, ")"));
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
      var y = d3.scaleLinear().domain([0, maxGhgi]).range([height, 0]);
      var yAxis = svg.append('g').attr('class', 'text-chart').attr('transform', "translate(".concat(X_AXIS_PADDING * -1, ", 0)")).call(d3.axisLeft(y).ticks(6).tickSize(0).tickFormat(function (d) {
        return "".concat(d.toFixed(1));
      }));
      yAxis.select('.domain').attr('stroke', 'transparent');
      svg.append('text').attr('class', 'beps-bar-y-axis-label text-chart').attr('text-anchor', 'middle').attr('y', -1 * ((X_AXIS_PADDING + FONT_SIZE) * 2)).attr('x', height / -2).attr('transform', 'rotate(-90)').text('GHGI (kgCO2e/sf/yr)');

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
      // 2031 is the start of the first window (2031 - 2035) so the shift
      // states where in a window a particular building's targets are
      var firstComplianceYear = Number((_buildingData$beps_fi = buildingData === null || buildingData === void 0 ? void 0 : buildingData.beps_firstcomplianceyear) !== null && _buildingData$beps_fi !== void 0 ? _buildingData$beps_fi : 2031);
      var yearWindowShift = firstComplianceYear - 2031;
      var targetYears = Object.entries(buildingData).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        return k.startsWith('bepstarget_');
      }).reduce(function (acc, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[0],
          v = _ref4[1];
        var year = "".concat(Number(k.split('_')[1]) + yearWindowShift);
        acc[year] = Number(v);
        return acc;
      }, {});
      var targets = new Set();
      for (var _i = 0, _Object$entries = Object.entries(targetYears); _i < _Object$entries.length; _i++) {
        var targetData = _Object$entries[_i];
        var _targetData = _slicedToArray(targetData, 2),
          year = _targetData[0],
          target = _targetData[1];
        if (targets.has(target)) continue;
        targets.add(target);
        var _multiplier = target === 0 ? 0 : target / maxGhgi;
        var yPos = Number(height) - Number(height) * _multiplier;
        var targetText = "".concat(year, " target: ").concat(target.toFixed(2));
        svg.append('line').attr('class', 'beps-bar-target-line').attr('x1', 0).attr('y1', yPos).attr('x2', outerWidth).attr('y2', yPos);
        svg.append('text').attr('class', 'beps-bar-target-text  text-chart').attr('font-size', FONT_SIZE).attr('x', outerWidth - margin.left - margin.right - X_AXIS_PADDING).attr('y', yPos - X_AXIS_PADDING).text(targetText);
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
  return BepsView;
});