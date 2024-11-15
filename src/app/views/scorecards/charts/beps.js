define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  'text!templates/scorecards/charts/beps.html'
], function ($, _, Backbone, d3, wrap, BepsTemplate) {
  var BepsView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(BepsTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
    },

    // Templating for the HTML + chart
    chartData: function () {
      const data = this.data;

      return data;
    },

    renderChart: function (building) {
      const buildingData = building[0];

      const maxGhgi = 5;
      const totalGhgi = buildingData?.total_ghg_emissions_intensity;

      const divisor = 100 / maxGhgi;
      const multiplier = totalGhgi / maxGhgi;

      const chartData = [
        {
          group: 'ghgi',
          gas: ((buildingData?.gas_ghg_percent * 100) / divisor) * multiplier,
          steam:
            ((buildingData?.steam_ghg_percent * 100) / divisor) * multiplier,
          electricity:
            ((buildingData?.electricity_ghg_percent * 100) / divisor) *
            multiplier
        }
      ];

      const parent = d3.select(this.viewParent).select('.beps-chart');

      if (!parent.node()) return;

      const margin = { top: 25, right: 0, bottom: 50, left: 25 };
      // TODO use the parent
      const outerWidth = 250; // parent.node().offsetWidth;
      const outerHeight = 250; // parent.node().offsetHeight;

      const height = outerHeight - margin.top - margin.bottom;
      const width = (outerWidth - margin.left - margin.right) / 2;

      const parentSvg = parent
        .append('svg')
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

      const FONT_SIZE = 12;
      const X_AXIS_PADDING = 6;

      const svg = parentSvg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left}, ${
            margin.top + X_AXIS_PADDING + FONT_SIZE
          })`
        );

      let groups = ['ghgi'];
      let subgroups = [
        ...new Set(chartData.map(d => Object.keys(d)).flat())
      ].filter(v => v !== 'group');

      // Add a background

      svg
        .append('rect')
        .attr('class', 'beps-bar-background-rect')
        .attr('width', outerWidth - margin.right)
        .attr('height', height);

      // Add bottom X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.1]);

      const xAxisA = svg
        .append('g')
        .attr('transform', `translate(0, ${Number(height) + X_AXIS_PADDING})`)
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickSizeOuter(0)
            .tickFormat(d => {
              return this.year;
            })
        );

      // Make the x axis line invisible
      xAxisA.select('.domain').attr('stroke', 'transparent');

      var ticks = svg.selectAll('.tick text');
      ticks.attr('class', 'beps-bar-axis-text text-chart');

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 5]).range([height, 0]);

      const yAxis = svg
        .append('g')
        .attr('transform', `translate(${X_AXIS_PADDING * -1}, 0)`)
        .call(d3.axisLeft(y).ticks(6).tickSize(0));

      yAxis.select('.domain').attr('stroke', 'transparent');

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
          return `beps-bar beps-bar-${d.key}`;
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

      // Add year targets
      var yearX = d3
        .scaleBand()
        .domain(groups)
        .range([0, width * 2])
        .padding([0.1]);

      const targetYears = Object.entries(buildingData)
        .filter(([k, v]) => k.startsWith('BEPStarget_'))
        .reduce((acc, [k, v]) => {
          const year = k.split('_')[1];
          acc[year] = Number(v);
          return acc;
        }, {});

      let targets = new Set();

      for (const targetData of Object.entries(targetYears)) {
        const [year, target] = targetData;

        console.log({ year, target });

        if (targets.has(target)) continue;

        targets.add(target);

        const multiplier = target === 0 ? 0 : target / maxGhgi;

        const yPos = Number(height) - Number(height) * multiplier;

        const PADDING = 12;

        const targetText = `${year}: target ${target.toFixed(2)}`;

        svg
          .append('line')
          .attr('class', 'beps-bar-target-line')
          .attr('x1', 0)
          .attr('y1', yPos)
          .attr('x2', outerWidth)
          .attr('y2', yPos);

        svg
          .append('text')
          .attr('class', 'beps-bar-target-text')
          .attr('font-size', FONT_SIZE)
          .attr('x', outerWidth - margin.left - margin.right)
          .attr('y', yPos - X_AXIS_PADDING)
          .text(targetText);
      }
    },

    render: function () {
      return this.template(this.chartData());
    },

    afterRender: function () {
      const chartData = this.chartData();
      this.renderChart(chartData);
    }
  });

  return BepsView;
});
