define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  '../../../../lib/validate_building_data',
  'text!templates/scorecards/charts/fueluse.html'
], function ($, _, Backbone, d3, wrap, validateBuildingData, FuelUseTemplate) {
  var FuelUseView = Backbone.View.extend({
    TYPICAL_CAR_EMMISSION: 4.7,

    initialize: function (options) {
      this.template = _.template(FuelUseTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.showChart = true;
    },

    showPercents: function (num) {
      if (isNaN(num)) return null;
      const number = Number(num);
      return number > 0;
    },

    chartData: function () {
      const data = this.data;

      const buildingData = data[0];

      const { typedData, valid } = validateBuildingData(buildingData, {
        gas_ghg_percent: 'number',
        electricity_ghg_percent: 'number',
        steam_ghg_percent: 'number',
        gas_pct: 'number',
        electricity_pct: 'number',
        steam_pct: 'number',
        total_ghg_emissions: 'number',
        total_kbtu: 'number'
      });

      if (!valid) {
        this.showChart = false;
        return false;
      }

      const {
        gas_ghg_percent,
        electricity_ghg_percent,
        steam_ghg_percent,
        gas_pct,
        electricity_pct,
        steam_pct,
        total_ghg_emissions,
        total_kbtu
      } = typedData;

      const normalizeNum = num => {
        if (isNaN(num)) return 0;
        let next = Number(num ?? 0) * 100;
        return Math.round(next);
      };

      const chartData = [
        {
          electricity: normalizeNum(electricity_pct),
          gas: normalizeNum(gas_pct),
          group: 'usage',
          steam: normalizeNum(steam_pct)
        },
        {
          electricity: normalizeNum(electricity_ghg_percent),
          gas: normalizeNum(gas_ghg_percent),
          group: 'emissions',
          steam: normalizeNum(steam_ghg_percent)
        }
      ];

      let _showGas =
        this.showPercents(gas_ghg_percent) || this.showPercents(gas_pct);
      let _showElectricity =
        this.showPercents(electricity_ghg_percent) ||
        this.showPercents(electricity_pct);
      let _showSteam =
        this.showPercents(steam_ghg_percent) || this.showPercents(steam_pct);

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      const totals = {
        emissions: numberWithCommas(total_ghg_emissions),
        usage: numberWithCommas(total_kbtu)
      };

      return {
        totals,
        chartData,
        _showGas,
        _showElectricity,
        _showSteam
      };
    },

    renderChart: function (chartData, totals) {
      const FONT_SIZE = 12;
      const X_AXIS_PADDING = 6;
      const PERCENTAGE_BOTTOM_PADDING = 3;

      const parent = d3.select(this.viewParent).select('.fueluse-chart');

      if (!parent.node()) return;

      const margin = { top: 50, right: 0, bottom: 50, left: 0 };
      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;
      const width = outerWidth - margin.left - margin.right;
      const height = outerHeight - margin.top - margin.bottom;

      const labels = {
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

      const parentSvg = parent
        .append('svg')
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

      const svg = parentSvg
        .append('g')
        .attr('transform', `translate(0, ${margin.top})`);

      let groups = ['emissions', 'usage'];
      let subgroups = ['gas', 'steam', 'electricity'];

      // Add bottom X axis
      var x = d3
        .scaleBand()
        .domain(groups)
        .range([0, width])
        .paddingInner([0.1]);

      const xAxisA = svg
        .append('g')
        .attr('transform', `translate(0, ${Number(height) + X_AXIS_PADDING})`)
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickSizeOuter(0)
            .tickFormat(d => {
              return `${labels[d]?.label}`;
            })
        );

      const xAxisB = svg
        .append('g')
        .attr(
          'transform',
          `translate(0, ${Number(height) + X_AXIS_PADDING + FONT_SIZE})`
        )
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickSizeOuter(0)
            .tickFormat(d => {
              return `${labels[d]?.labelUnits}`;
            })
        );

      // Make the x axis line invisible
      xAxisA.select('.domain').attr('stroke', 'transparent');
      xAxisB.select('.domain').attr('stroke', 'transparent');

      // Add top X axis
      const xAxisTop = svg
        .append('g')
        .attr('transform', `translate(0, ${-1 * X_AXIS_PADDING})`)
        .call(
          d3
            .axisTop(x)
            .tickSize(0)
            .tickSizeOuter(0)
            .tickFormat(d => {
              return `${totals[d]} ${labels[d]?.totalUnits}`;
            })
        );

      // Make the x axis line invisible
      xAxisTop.select('.domain').attr('stroke', 'transparent');

      var ticks = svg.selectAll('.tick text');
      ticks.attr('class', 'fueluse-bar-axis-text text-chart');

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
      // svg.append('g').call(d3.axisLeft(y));

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      // Show the bars
      svg
        .append('g')
        .selectAll('g')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', d => {
          return `fueluse-bar fueluse-bar-${d.key}`;
        })
        .selectAll('rect')
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return x(d.data.group);
        })
        .attr('y', function (d) {
          return y(d[1]);
        })
        .attr('height', function (d) {
          return y(d[0]) - y(d[1]);
        })
        .attr('width', x.bandwidth());

      const EMISSIONS_INDEX = 0;
      const USAGE_INDEX = 1;

      // Emissions percentages
      svg
        .selectAll('.fueluse-bar')
        .append('text')
        .attr('class', 'text-tiny fueluse-bar-percentages')
        .attr('font-size', FONT_SIZE)
        .attr('x', function (d) {
          const barWidth = x.bandwidth();
          return x(d[EMISSIONS_INDEX].data.group) + barWidth / 2;
        })
        .attr('y', function (d) {
          const height = y(d[EMISSIONS_INDEX][0]) - y(d[EMISSIONS_INDEX][1]);
          return y(d[EMISSIONS_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
        })
        .text(d => {
          return `${d[EMISSIONS_INDEX]?.data?.[d?.key]}%`;
        });

      // Usage percentages
      svg
        .selectAll('.fueluse-bar')
        .append('text')
        .attr('class', 'text-tiny fueluse-bar-percentages')
        .attr('font-size', FONT_SIZE)
        .attr('x', function (d) {
          const barWidth = x.bandwidth();
          return x(d[USAGE_INDEX].data.group) + barWidth / 2;
        })
        .attr('y', function (d) {
          const height = y(d[USAGE_INDEX][0]) - y(d[USAGE_INDEX][1]);
          return y(d[USAGE_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
        })
        .text(d => {
          return `${d[USAGE_INDEX]?.data?.[d?.key]}%`;
        });
    },

    render: function () {
      const chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },

    afterRender: function () {
      const chartData = this.chartData();
      if (!chartData) return;
      this.renderChart(chartData.chartData, chartData.totals);
    }
  });

  return FuelUseView;
});
