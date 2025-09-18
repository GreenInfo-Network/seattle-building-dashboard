"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', '../../../../lib/validate_building_data', 'text!templates/scorecards/charts/fueluse.html'], function ($, _, Backbone, d3, wrap, validateBuildingData, FuelUseTemplate) {
  var FuelUseView = Backbone.View.extend({
    TYPICAL_CAR_EMMISSION: 4.7,
    initialize: function initialize(options) {
      this.template = _.template(FuelUseTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.showChart = true;
    },
    showPercents: function showPercents(num) {
      if (isNaN(num)) return null;
      var number = Number(num);
      return number > 0;
    },
    chartData: function chartData() {
      var data = this.data;
      var buildingData = data[0];
      var _validateBuildingData = validateBuildingData(buildingData, {
          gas_ghg_percent: 'number',
          electricity_ghg_percent: 'number',
          steam_ghg_percent: 'number',
          gas_pct: 'number',
          electricity_pct: 'number',
          steam_pct: 'number',
          total_ghg_emissions: 'number',
          total_kbtu: 'number'
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
        gas_pct = typedData.gas_pct,
        electricity_pct = typedData.electricity_pct,
        steam_pct = typedData.steam_pct,
        total_ghg_emissions = typedData.total_ghg_emissions,
        total_kbtu = typedData.total_kbtu;
      var normalizeNum = function normalizeNum(num) {
        if (isNaN(num)) return 0;
        var next = Number(num !== null && num !== void 0 ? num : 0) * 100;
        return Math.round(next);
      };
      var chartData = [{
        group: 'usage',
        electricity: normalizeNum(electricity_pct),
        gas: normalizeNum(gas_pct),
        steam: normalizeNum(steam_pct)
      }, {
        group: 'emissions',
        electricity: normalizeNum(electricity_ghg_percent),
        gas: normalizeNum(gas_ghg_percent),
        steam: normalizeNum(steam_ghg_percent)
      }];
      var _showGas = this.showPercents(gas_ghg_percent) || this.showPercents(gas_pct);
      var _showElectricity = this.showPercents(electricity_ghg_percent) || this.showPercents(electricity_pct);
      var _showSteam = this.showPercents(steam_ghg_percent) || this.showPercents(steam_pct);
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      var totals = {
        usage: numberWithCommas(total_kbtu),
        emissions: numberWithCommas(total_ghg_emissions)
      };
      var legendText = chartData.reduce(function (acc, entry) {
        var nextEntry = _objectSpread({}, entry);
        delete nextEntry.group;
        nextEntry = Object.fromEntries(Object.entries(nextEntry).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];
          return [k, "".concat(v, "%")];
        }));
        acc[entry.group] = nextEntry;
        return acc;
      }, {});
      return {
        totals: totals,
        chartData: chartData,
        _showGas: _showGas,
        _showElectricity: _showElectricity,
        _showSteam: _showSteam,
        _legendText: legendText
      };
    },
    renderChart: function renderChart(chartData, totals) {
      var FONT_SIZE = 12;
      var X_AXIS_PADDING = 6;
      var PERCENTAGE_BOTTOM_PADDING = 3;
      var parent = d3.select(this.viewParent).select('.fueluse-chart');
      if (!parent.node()) return;
      var margin = {
        top: 50,
        right: 0,
        bottom: 50,
        left: 0
      };
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var width = outerWidth - margin.left - margin.right;
      var height = outerHeight - margin.top - margin.bottom;
      var labels = {
        usage: {
          label: 'Energy Used',
          labelUnits: '(kBtu)',
          totalUnits: 'kBtu'
        },
        emissions: {
          label: 'Emissions',
          labelUnits: '(MT CO2e)',
          totalUnits: 'MT CO2e'
        }
      };
      var parentSvg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));
      var svg = parentSvg.append('g').attr('transform', "translate(0, ".concat(margin.top, ")"));
      var groups = ['usage', 'emissions'];
      var subgroups = ['electricity', 'steam', 'gas'];
      var USAGE_INDEX = groups.findIndex(function (v) {
        return v === 'usage';
      });
      var EMISSIONS_INDEX = groups.findIndex(function (v) {
        return v === 'emissions';
      });

      // Add bottom X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).paddingInner([0.25]);
      var xAxisA = svg.append('g').attr('transform', "translate(0, ".concat(Number(height) + X_AXIS_PADDING, ")")).call(d3.axisBottom(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d;
        return "".concat((_labels$d = labels[d]) === null || _labels$d === void 0 ? void 0 : _labels$d.label);
      }));
      var xAxisB = svg.append('g').attr('transform', "translate(0, ".concat(Number(height) + X_AXIS_PADDING + FONT_SIZE, ")")).call(d3.axisBottom(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d2;
        return "".concat((_labels$d2 = labels[d]) === null || _labels$d2 === void 0 ? void 0 : _labels$d2.labelUnits);
      }));

      // Make the x axis line invisible
      xAxisA.select('.domain').attr('stroke', 'transparent');
      xAxisB.select('.domain').attr('stroke', 'transparent');

      // Add top X axis
      var xAxisTop = svg.append('g').attr('transform', "translate(0, ".concat(-1 * X_AXIS_PADDING, ")")).call(d3.axisTop(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d3;
        return "".concat(totals[d], " ").concat((_labels$d3 = labels[d]) === null || _labels$d3 === void 0 ? void 0 : _labels$d3.totalUnits);
      }));

      // Make the x axis line invisible
      xAxisTop.select('.domain').attr('stroke', 'transparent');
      var ticks = svg.selectAll('.tick text');
      ticks.attr('class', 'fueluse-bar-axis-text text-chart');

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      // Show the bars
      svg.append('g').selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData).enter().append('g').attr('class', function (d) {
        return "fueluse-bar fueluse-bar-".concat(d.key);
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

      // <path d="M1 6.5C0.447715 6.5 -4.82823e-08 6.94772 0 7.5C4.82823e-08 8.05228 0.447715 8.5 1 8.5L1 6.5ZM17.7071 8.20711C18.0976 7.81658 18.0976 7.18342 17.7071 6.79289L11.3431 0.428931C10.9526 0.038407 10.3195 0.0384071 9.92893 0.428931C9.53841 0.819456 9.53841 1.45262 9.92893 1.84314L15.5858 7.5L9.92893 13.1569C9.53841 13.5474 9.53841 14.1805 9.92893 14.5711C10.3195 14.9616 10.9526 14.9616 11.3431 14.5711L17.7071 8.20711ZM1 8.5L17 8.5L17 6.5L1 6.5L1 8.5Z" fill="#333333"/>

      // Emissions percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[EMISSIONS_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[EMISSIONS_INDEX][0]) - y(d[EMISSIONS_INDEX][1]);
        return y(d[EMISSIONS_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$EMISSIONS_INDEX;
        var percent = Number((_d$EMISSIONS_INDEX = d[EMISSIONS_INDEX]) === null || _d$EMISSIONS_INDEX === void 0 || (_d$EMISSIONS_INDEX = _d$EMISSIONS_INDEX.data) === null || _d$EMISSIONS_INDEX === void 0 ? void 0 : _d$EMISSIONS_INDEX[d === null || d === void 0 ? void 0 : d.key]);
        // Below 8%, you can't see the percentage in the chart well
        // so it's clearer to remove it
        return percent >= 8 ? "".concat(percent, "%") : '';
      });

      // Usage percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[USAGE_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[USAGE_INDEX][0]) - y(d[USAGE_INDEX][1]);
        return y(d[USAGE_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$USAGE_INDEX;
        var percent = Number((_d$USAGE_INDEX = d[USAGE_INDEX]) === null || _d$USAGE_INDEX === void 0 || (_d$USAGE_INDEX = _d$USAGE_INDEX.data) === null || _d$USAGE_INDEX === void 0 ? void 0 : _d$USAGE_INDEX[d === null || d === void 0 ? void 0 : d.key]);
        // Below 8%, you can't see the percentage in the chart well
        // so it's clearer to remove it
        return percent >= 8 ? "".concat(percent, "%") : '';
      });

      // Arrow
      var arrowHeight = 15;
      var arrowWidth = 18;
      svg.append('path').attr('class', 'fueluse-bar-arrow').attr('d', 'M1 6.5C0.447715 6.5 -4.82823e-08 6.94772 0 7.5C4.82823e-08 8.05228 0.447715 8.5 1 8.5L1 6.5ZM17.7071 8.20711C18.0976 7.81658 18.0976 7.18342 17.7071 6.79289L11.3431 0.428931C10.9526 0.038407 10.3195 0.0384071 9.92893 0.428931C9.53841 0.819456 9.53841 1.45262 9.92893 1.84314L15.5858 7.5L9.92893 13.1569C9.53841 13.5474 9.53841 14.1805 9.92893 14.5711C10.3195 14.9616 10.9526 14.9616 11.3431 14.5711L17.7071 8.20711ZM1 8.5L17 8.5L17 6.5L1 6.5L1 8.5Z').attr('transform', "translate(".concat(Number(width) / 2 - arrowWidth / 2, ", ").concat(Number(height) / 2 - arrowHeight / 2, ")"));
    },
    render: function render() {
      var chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },
    afterRender: function afterRender() {
      var chartData = this.chartData();
      if (!chartData) return;
      this.renderChart(chartData.chartData, chartData.totals);
    }
  });
  return FuelUseView;
});