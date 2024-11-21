define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  'text!templates/scorecards/charts/first_ghgi_target.html'
], function ($, _, Backbone, d3, wrap, FirstGhgiTargetTemplate) {
  var FirstGhgiTargetView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(FirstGhgiTargetTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.latestYear = options.latestYear || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
    },

    // Templating for the HTML + chart
    chartData: function () {
      const data = this.data;

      const {
        total_ghg_emissions_intensity,
        bepstarget_2031,
        bepstarget_2036,
        bepstarget_2041,
        bepstarget_2046,
        beps_firstcomplianceyear
      } = data[0];

      // TODO Why does beps_firstcomplianceyear not match a target year for some buildings?
      // Sure this logic is incorrect
      // Example: http://0.0.0.0:8080/#seattle/2023?categories[0][field]=neighborhood&categories[0][values][]=DOWNTOWN&categories[0][values][]=EAST&categories[0][values][]=LAKE+UNION&categories[0][values][]=GREATER+DUWAMISH&categories[0][values][]=MAGNOLIA+%2F+QUEEN+ANNE&categories[0][values][]=NORTHWEST&categories[0][values][]=DELRIDGE+NEIGHBORHOODS&categories[0][values][]=CENTRAL&categories[0][values][]=NORTHEAST&categories[0][values][]=BALLARD&categories[0][values][]=SOUTHWEST&categories[0][values][]=SOUTHEAST&categories[0][values][]=NORTH&categories[0][values][]=&categories[0][other]=false&categories[1][field]=councildistrict&categories[1][values][]=1&categories[1][values][]=2&categories[1][values][]=3&categories[1][values][]=4&categories[1][values][]=5&categories[1][values][]=6&categories[1][values][]=7&categories[1][other]=false&layer=total_ghg_emissions&sort=total_ghg_emissions&order=desc&lat=47.61947&lng=-122.35637&zoom=14&building=745&report_active=true&tab=benchmark_overview
      const getNextTarget = () => {
        const years = [2031, 2036, 2041, 2046];
        const firstComplianceYear = Number(beps_firstcomplianceyear);
        return years.find(y => y >= firstComplianceYear);
      };

      const nextTargetValue = data[0][`bepstarget_${getNextTarget()}`];

      const currentValue = Number(
        Number(total_ghg_emissions_intensity).toFixed(2)
      );

      let greenBar = 0;
      let greenStripedBar = 0;
      let redBar = 0;
      let whiteBackground = 0;

      let greenBarLabel = '';
      let greenStripedBarLabel = '';
      let redBarLabel = '';

      if (currentValue > nextTargetValue) {
        redBar = currentValue - nextTargetValue;
        greenBar = nextTargetValue;

        whiteBackground = 5 - (redBar + greenBar);

        redBarLabel = `(GHGI current) ${currentValue}`;
        greenBarLabel = `(GHGI target) ${nextTargetValue}`;
      } else {
        greenStripedBar = nextTargetValue - currentValue;
        greenBar = currentValue;

        whiteBackground = 5 - (greenStripedBar + greenBar);

        greenStripedBarLabel = `(GHGI target) ${nextTargetValue}`;
        greenBarLabel = `(GHGI current) ${currentValue}`;
      }

      const chartData = [
        {
          group: 'first_ghgi_target',
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
        beps_firstcomplianceyear
      };
    },

    renderChart: function (chartData) {
      const FONT_SIZE = 12;
      const PADDING = 6;

      const parent = d3
        .select(this.viewParent)
        .select('.first-ghgi-target-chart');

      if (!parent.node() || !chartData) return;

      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;

      // set the dimensions and margins of the graph
      var margin = { top: 30, right: 30, bottom: 30, left: 50 },
        width = outerWidth - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = parent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      const groups = ['first_ghgi_target'];
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
      var x = d3.scaleLinear().domain([0, 5]).range([0, width]);
      const xAxis = svg
        .append('g')
        .attr('class', 'first-ghgi-target-x-axis text-chart')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(10).tickSize(0));

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');

      // Add an X axis label
      svg
        .append('text')
        .attr(
          'transform',
          `translate(${width / 2},${height + FONT_SIZE + FONT_SIZE + PADDING})`
        )
        .attr('class', 'first-ghgi-target-x-axis-label text-chart')
        .attr('text-anchor', 'middle')
        .text('GHGI (kg CO2e/SF/year)');

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
        .attr('class', 'first-ghgi-target-pattern');

      // Show the bars
      svg
        .append('g')
        .selectAll('g')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', d => {
          return `first-ghgi-target-${d.key}`;
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

        const barName = `.first-ghgi-target-${k.replace('Label', '')}`;

        d3.select(barName)
          .append('text')
          .attr('class', 'first-ghgi-target-x-axis-label text-chart')
          .attr('text-anchor', labelTextAnchor[k])
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
      return this.template(this.chartData());
    },

    afterRender: function () {
      const chartData = this.chartData();
      this.renderChart(chartData?.chartData);
    }
  });

  return FirstGhgiTargetView;
});
