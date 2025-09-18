"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', '../../../../lib/validate_building_data', 'text!templates/scorecards/charts/first_compliance_interval.html'], function ($, _, Backbone, d3, wrap, validateBuildingData, FirstComplianceIntervalTemplate) {
  var FirstComplianceIntervalView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(FirstComplianceIntervalTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.latestYear = options.latestYear || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.showChart = true;
    },
    // Templating for the HTML + chart
    chartData: function chartData() {
      var data = this.data;
      var buildingData = data[0];
      var _validateBuildingData = validateBuildingData(buildingData, {
          site_eui_wn: 'number',
          // current
          cbpseuitarget: 'number',
          //target
          cbps_date: 'number',
          // compliance year
          cbps_flag: 'boolean' //compliance flag TODO if flag and no target, dont show
        }),
        typedData = _validateBuildingData.typedData,
        valid = _validateBuildingData.valid;
      if (!valid) {
        this.showChart = false;
        return false;
      }
      var site_eui_wn = typedData.site_eui_wn,
        cbpseuitarget = typedData.cbpseuitarget,
        cbps_date = typedData.cbps_date,
        cbps_flag = typedData.cbps_flag;
      if (!cbps_flag || !cbpseuitarget) {
        this.showChart = false;
        return false;
      }
      function roundUpNum(num) {
        var nearestFifty = Math.ceil(num / 50) * 50;
        if (Math.abs(num - nearestFifty) < 20) {
          nearestFifty = nearestFifty + 20;
        }
        return nearestFifty;
      }
      var maxVal = roundUpNum(Math.max(Number(site_eui_wn), Number(cbpseuitarget)));
      var nextTargetValue = Number(cbpseuitarget);
      var currentValue = Number(Number(site_eui_wn).toFixed(1));
      var greenBar = 0;
      var greenStripedBar = 0;
      var redBar = 0;
      var whiteBackground = 0;
      var greenBarLabel = '';
      var greenStripedBarLabel = '';
      var redBarLabel = '';
      var isMeetingTarget;
      if (currentValue > nextTargetValue) {
        redBar = currentValue - nextTargetValue;
        greenBar = nextTargetValue;
        whiteBackground = maxVal - (redBar + greenBar);
        redBarLabel = "EUI current: ".concat(currentValue);
        greenBarLabel = "EUI target: ".concat(nextTargetValue);
        isMeetingTarget = false;
      } else {
        greenStripedBar = nextTargetValue - currentValue;
        greenBar = currentValue;
        whiteBackground = maxVal - (greenStripedBar + greenBar);
        greenStripedBarLabel = "(EUI target) ".concat(nextTargetValue);
        greenBarLabel = "(EUI current) ".concat(Number(currentValue).toFixed(1));
        isMeetingTarget = true;
      }
      var chartData = [{
        group: 'first_compliance_interval',
        greenBar: greenBar,
        greenStripedBar: greenStripedBar,
        redBar: redBar,
        greenBarLabel: greenBarLabel,
        greenStripedBarLabel: greenStripedBarLabel,
        redBarLabel: redBarLabel,
        whiteBackground: whiteBackground
      }];
      return {
        chartData: chartData,
        maxVal: maxVal,
        cbps_date: cbps_date,
        cbps_flag: cbps_flag,
        _nextTargetValue: nextTargetValue,
        _isMeetingTarget: isMeetingTarget
      };
    },
    renderChart: function renderChart(chartData, maxVal) {
      var FONT_SIZE = 12;
      var PADDING = 6;
      var parent = d3.select(this.viewParent).select('.first-compliance-interval-chart');
      if (!parent.node() || !chartData) return;
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var horizontalPadding = outerWidth / 5;

      // set the dimensions and margins of the graph
      var margin = {
          top: 40,
          right: horizontalPadding,
          bottom: 40,
          left: horizontalPadding
        },
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = parent.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      var groups = ['first_compliance_interval'];
      // The order here matters! greenBar should always be first
      var subgroups = ['greenBar', 'redBar', 'greenStripedBar', 'whiteBackground'];

      // Add Y axis
      var y = d3.scaleBand().domain(groups).range([0, height]).padding([0.2]);

      // Add X axis
      var x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
      var xAxis = svg.append('g').attr('class', 'first-compliance-interval-x-axis text-chart').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x).ticks(Math.abs(maxVal / 20)).tickSize(0));

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');

      // Add an X axis label
      svg.append('text').attr('transform', "translate(".concat(width / 2, ",").concat(height + FONT_SIZE + FONT_SIZE + PADDING, ")")).attr('class', 'first-compliance-interval-x-axis-label text-chart').attr('text-anchor', 'middle').text('EUI (kBtu/SF/year)');

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);
      svg.append('defs').append('pattern').attr('id', 'diagonalHatch').attr('patternUnits', 'userSpaceOnUse').attr('width', 4).attr('height', 4).append('path').attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2').attr('class', 'first-compliance-interval-pattern');

      // Show the bars
      svg.append('g').selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData).enter().append('g').attr('class', function (d) {
        return "first-compliance-interval-".concat(d.key);
      }).selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) {
        return d;
      }).enter().append('rect').attr('x', function (d) {
        return x(d[0]);
      }).attr('y', function (d) {
        return y(d.data.group);
      }).attr('height', function (d) {
        return y.bandwidth();
      }).attr('width', function (d) {
        return x(d[1]) - x(d[0]);
      });
      var labelTextAnchor = {
        greenBarLabel: 'end',
        redBarLabel: 'start',
        greenStripedBarLabel: 'start'
      };
      var labelData = Object.fromEntries(Object.entries(chartData[0]).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        return k.endsWith('Label') && !!v;
      }));
      var _loop = function _loop() {
        var entry = _Object$entries[_i];
        var _entry = _slicedToArray(entry, 2),
          k = _entry[0],
          v = _entry[1];
        var barName = ".first-compliance-interval-".concat(k.replace('Label', ''));
        d3.select(barName).append('text').attr('class', 'first-compliance-interval-x-axis-label text-chart').attr('text-anchor', function (d) {
          var anchor = labelTextAnchor[k];
          return anchor;
        }).attr('x', function (d) {
          return x(d[0][1]);
        }).attr('y', function (d) {
          return -2 * PADDING;
        }).text(v);
        d3.select(barName).append('path').attr('transform', function (d) {
          // -3 is based on size of svg path
          // 3 is half of width
          return "translate( ".concat(x(d[0][1]) - 3, ", ").concat(PADDING * -1, ")");
        }).attr('d', 'M3.43259 4.25C3.24014 4.58333 2.75902 4.58333 2.56657 4.25L0.834517 1.25C0.642067 0.916667 0.882629 0.5 1.26753 0.5L4.73163 0.5C5.11653 0.5 5.35709 0.916667 5.16464 1.25L3.43259 4.25Z').attr('fill', 'black');
      };
      for (var _i = 0, _Object$entries = Object.entries(labelData); _i < _Object$entries.length; _i++) {
        _loop();
      }
    },
    render: function render() {
      var chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },
    afterRender: function afterRender() {
      var chartData = this.chartData();
      if (!chartData || !(chartData !== null && chartData !== void 0 && chartData.cbps_flag)) return;
      this.renderChart(chartData.chartData, chartData.maxVal);
    }
  });
  return FirstComplianceIntervalView;
});