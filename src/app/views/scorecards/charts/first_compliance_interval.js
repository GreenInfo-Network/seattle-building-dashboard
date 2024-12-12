define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  '../../../../lib/validate_building_data',
  'text!templates/scorecards/charts/first_compliance_interval.html'
], function (
  $,
  _,
  Backbone,
  d3,
  wrap,
  validateBuildingData,
  FirstComplianceIntervalTemplate
) {
  var FirstComplianceIntervalView = Backbone.View.extend({
    initialize: function (options) {
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
    chartData: function () {
      const data = this.data;

      const buildingData = data[0];

      const { typedData, valid } = validateBuildingData(buildingData, {
        site_eui_wn: 'number', // current
        cbpseuitarget: 'number', //target
        cbps_date: 'number', // compliance year
        cbps_flag: 'boolean' //compliance flag TODO if flag and no target, dont show
      });

      if (!valid) {
        this.showChart = false;
        return false;
      }

      const { site_eui_wn, cbpseuitarget, cbps_date, cbps_flag } = typedData;

      if (!cbps_flag || !cbpseuitarget) {
        this.showChart = false;
        return false;
      }

      function roundUpNum(num) {
        let nearestFifty = Math.ceil(num / 50) * 50;
        if (Math.abs(num - nearestFifty) < 20) {
          nearestFifty = nearestFifty + 20;
        }
        return nearestFifty;
      }

      const maxVal = roundUpNum(
        Math.max(Number(site_eui_wn), Number(cbpseuitarget))
      );

      const nextTargetValue = Number(cbpseuitarget);
      const currentValue = Number(Number(site_eui_wn).toFixed(1));

      let greenBar = 0;
      let greenStripedBar = 0;
      let redBar = 0;
      let whiteBackground = 0;

      let greenBarLabel = '';
      let greenStripedBarLabel = '';
      let redBarLabel = '';

      let isMeetingTarget;

      if (currentValue > nextTargetValue) {
        redBar = currentValue - nextTargetValue;
        greenBar = nextTargetValue;

        whiteBackground = maxVal - (redBar + greenBar);

        redBarLabel = `(EUI current) ${currentValue}`;
        greenBarLabel = `(EUI target) ${nextTargetValue}`;

        isMeetingTarget = false;
      } else {
        greenStripedBar = nextTargetValue - currentValue;
        greenBar = currentValue;

        whiteBackground = maxVal - (greenStripedBar + greenBar);

        greenStripedBarLabel = `(EUI target) ${nextTargetValue}`;
        greenBarLabel = `(EUI current) ${Number(currentValue).toFixed(1)}`;

        isMeetingTarget = true;
      }

      const chartData = [
        {
          group: 'first_compliance_interval',
          greenBar,
          greenStripedBar,
          redBar,
          greenBarLabel,
          greenStripedBarLabel,
          redBarLabel,
          whiteBackground
        }
      ];

      return {
        chartData,
        maxVal,
        cbps_date,
        cbps_flag,
        _nextTargetValue: nextTargetValue,
        _isMeetingTarget: isMeetingTarget
      };
    },

    renderChart: function (chartData, maxVal) {
      const FONT_SIZE = 12;
      const PADDING = 6;

      const parent = d3
        .select(this.viewParent)
        .select('.first-compliance-interval-chart');

      if (!parent.node() || !chartData) return;

      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;

      const horizontalPadding = outerWidth / 5;

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
      var svg = parent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      const groups = ['first_compliance_interval'];
      // The order here matters! greenBar should always be first
      const subgroups = [
        'greenBar',
        'redBar',
        'greenStripedBar',
        'whiteBackground'
      ];

      // Add Y axis
      var y = d3.scaleBand().domain(groups).range([0, height]).padding([0.2]);

      // Add X axis
      var x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
      const xAxis = svg
        .append('g')
        .attr('class', 'first-compliance-interval-x-axis text-chart')
        .attr('transform', 'translate(0,' + height + ')')
        .call(
          d3
            .axisBottom(x)
            .ticks(Math.abs(maxVal / 20))
            .tickSize(0)
        );

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');

      // Add an X axis label
      svg
        .append('text')
        .attr(
          'transform',
          `translate(${width / 2},${height + FONT_SIZE + FONT_SIZE + PADDING})`
        )
        .attr('class', 'first-compliance-interval-x-axis-label text-chart')
        .attr('text-anchor', 'middle')
        .text('EUI (kBtu/SF/year)');

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      svg
        .append('defs')
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('class', 'first-compliance-interval-pattern');

      // Show the bars
      svg
        .append('g')
        .selectAll('g')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', d => {
          return `first-compliance-interval-${d.key}`;
        })
        .selectAll('rect')
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return x(d[0]);
        })
        .attr('y', function (d) {
          return y(d.data.group);
        })
        .attr('height', function (d) {
          return y.bandwidth();
        })
        .attr('width', d => {
          return x(d[1]) - x(d[0]);
        });

      const labelTextAnchor = {
        greenBarLabel: 'end',
        redBarLabel: 'start',
        greenStripedBarLabel: 'start'
      };

      const labelData = Object.fromEntries(
        Object.entries(chartData[0]).filter(([k, v]) => {
          return k.endsWith('Label') && !!v;
        })
      );

      for (const entry of Object.entries(labelData)) {
        const [k, v] = entry;

        const barName = `.first-compliance-interval-${k.replace('Label', '')}`;

        d3.select(barName)
          .append('text')
          .attr('class', 'first-compliance-interval-x-axis-label text-chart')
          .attr('text-anchor', d => {
            let anchor = labelTextAnchor[k];
            return anchor;
          })
          .attr('x', d => {
            return x(d[0][1]);
          })
          .attr('y', d => {
            return -2 * PADDING;
          })
          .text(v);

        d3.select(barName)
          .append('path')
          .attr('transform', d => {
            // -3 is based on size of svg path
            // 3 is half of width
            return `translate( ${x(d[0][1]) - 3}, ${PADDING * -1})`;
          })
          .attr(
            'd',
            'M3.43259 4.25C3.24014 4.58333 2.75902 4.58333 2.56657 4.25L0.834517 1.25C0.642067 0.916667 0.882629 0.5 1.26753 0.5L4.73163 0.5C5.11653 0.5 5.35709 0.916667 5.16464 1.25L3.43259 4.25Z'
          )
          .attr('fill', 'black');
      }
    },

    render: function () {
      const chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },

    afterRender: function () {
      const chartData = this.chartData();
      if (!chartData || !chartData?.cbps_flag) return;
      this.renderChart(chartData.chartData, chartData.maxVal);
    }
  });

  return FirstComplianceIntervalView;
});
