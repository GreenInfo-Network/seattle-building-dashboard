"use strict";

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
        electricity: normalizeNum(electricity_pct),
        gas: normalizeNum(gas_pct),
        group: 'usage',
        steam: normalizeNum(steam_pct)
      }, {
        electricity: normalizeNum(electricity_ghg_percent),
        gas: normalizeNum(gas_ghg_percent),
        group: 'emissions',
        steam: normalizeNum(steam_ghg_percent)
      }];
      var _showGas = this.showPercents(gas_ghg_percent) || this.showPercents(gas_pct);
      var _showElectricity = this.showPercents(electricity_ghg_percent) || this.showPercents(electricity_pct);
      var _showSteam = this.showPercents(steam_ghg_percent) || this.showPercents(steam_pct);
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      var totals = {
        emissions: numberWithCommas(total_ghg_emissions),
        usage: numberWithCommas(total_kbtu)
      };
      return {
        totals: totals,
        chartData: chartData,
        _showGas: _showGas,
        _showElectricity: _showElectricity,
        _showSteam: _showSteam
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
        emissions: {
          label: 'Metric Tons',
          labelUnits: '(MT CO2e)',
          totalUnits: 'MT CO2e'
        },
        usage: {
          label: 'Energy Used',
          labelUnits: '(kBtu)',
          totalUnits: 'kBtu'
        }
      };
      var parentSvg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));
      var svg = parentSvg.append('g').attr('transform', "translate(0, ".concat(margin.top, ")"));
      var groups = ['emissions', 'usage'];
      var subgroups = ['gas', 'steam', 'electricity'];

      // Add bottom X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).paddingInner([0.1]);
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
      var EMISSIONS_INDEX = 0;
      var USAGE_INDEX = 1;

      // Emissions percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[EMISSIONS_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[EMISSIONS_INDEX][0]) - y(d[EMISSIONS_INDEX][1]);
        return y(d[EMISSIONS_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$EMISSIONS_INDEX, _d$EMISSIONS_INDEX$da;
        return "".concat((_d$EMISSIONS_INDEX = d[EMISSIONS_INDEX]) === null || _d$EMISSIONS_INDEX === void 0 ? void 0 : (_d$EMISSIONS_INDEX$da = _d$EMISSIONS_INDEX.data) === null || _d$EMISSIONS_INDEX$da === void 0 ? void 0 : _d$EMISSIONS_INDEX$da[d === null || d === void 0 ? void 0 : d.key], "%");
      });

      // Usage percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[USAGE_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[USAGE_INDEX][0]) - y(d[USAGE_INDEX][1]);
        return y(d[USAGE_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$USAGE_INDEX, _d$USAGE_INDEX$data;
        return "".concat((_d$USAGE_INDEX = d[USAGE_INDEX]) === null || _d$USAGE_INDEX === void 0 ? void 0 : (_d$USAGE_INDEX$data = _d$USAGE_INDEX.data) === null || _d$USAGE_INDEX$data === void 0 ? void 0 : _d$USAGE_INDEX$data[d === null || d === void 0 ? void 0 : d.key], "%");
      });
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