define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  'text!templates/scorecards/charts/performance_over_time.html'
], function ($, _, Backbone, d3, wrap, PerformanceOverTimeTemplate) {
  var PerformanceOverTimeView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(PerformanceOverTimeTemplate);
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

      const chartData = data.map(v => {
        return {
          n: v?.value,
          name: v?.id,
          year: v?.year
        };
      });

      return {
        chartData
      };
    },

    renderChart: function (chartData) {
      const FONT_SIZE = 12;
      const AXIS_PADDING = 6;

      const parent = d3
        .select(this.viewParent)
        .select('.performance-over-time-chart');

      if (!parent.node() || !chartData) return;

      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;

      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 40, left: 60 },
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = parent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Add a background
      svg
        .append('rect')
        .attr('class', 'performance-over-time-background-rect')
        .attr('width', outerWidth - margin.left)
        .attr('height', height);

      // group the data: I want to draw one line per group
      var sumstat = d3
        .nest() // nest function allows to group the calculation per level of a factor
        .key(function (d) {
          return d.name;
        })
        .entries(chartData);

      // Add X axis --> it is a date format
      var x = d3
        .scaleLinear()
        .domain(
          d3.extent(chartData, function (d) {
            return d.year;
          })
        )
        .range([0, width]);

      const xAxisTicks = [...new Set(chartData.map(d => d.year))];

      const xAxis = svg
        .append('g')
        .attr(`transform`, `translate(0,${height + AXIS_PADDING})`)
        .attr('class', 'text-chart')
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickValues(xAxisTicks)
            .tickFormat(v => `${v}`)
        );

      svg
        .append('text')
        .attr('class', 'performance-over-time-axis-label text-chart')
        .attr('text-anchor', 'middle')
        .attr('y', height + (AXIS_PADDING * 4 + FONT_SIZE))
        .attr('x', width / 2)
        .text('Reporting year');

      // Make the x axis line invisible
      xAxis.select('.domain').attr('stroke', 'transparent');

      function roundnum(num) {
        return Math.ceil(num / 50) * 50;
      }

      const max = roundnum(
        d3.max(chartData, function (d) {
          return +d.n;
        })
      );
      // Add Y axis
      var y = d3.scaleLinear().domain([0, max]).range([height, 0]);

      const yAxis = svg
        .append('g')
        .attr(`transform`, `translate(${AXIS_PADDING * -1}, 0)`)
        .attr('class', 'text-chart')
        .call(
          d3
            .axisLeft(y)
            .ticks(max / 50)
            .tickSize(0)
        );

      // Make the y axis line invisible
      yAxis.select('.domain').attr('stroke', 'transparent');

      svg
        .append('text')
        .attr('class', 'performance-over-time-axis-label text-chart')
        .attr('text-anchor', 'middle')
        .attr('y', -1 * (AXIS_PADDING * 4 + FONT_SIZE))
        .attr('x', height / -2)
        .attr('transform', 'rotate(-90)')
        .text('Weather Normalized Site EUI (kBtu/SF)');

      // Draw the background lines
      const yAxisExtent = [0, max];

      for (let i = yAxisExtent[0] + 50; i < yAxisExtent[1]; i += 50) {
        svg
          .append('line')
          .attr('class', 'performance-over-time-background-line')
          .attr('x1', 0)
          .attr('y1', y(i))
          .attr('x2', outerWidth)
          .attr('y2', y(i));
      }

      // Draw the line
      svg
        .selectAll('.line')
        .data(sumstat)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', d => `performance-over-time-${d.key}-line`)
        .attr('d', function (d) {
          return d3
            .line()
            .x(function (d) {
              return x(d.year);
            })
            .y(function (d) {
              return y(+d.n);
            })(d.values);
        });

      // Draw the dots
      for (const graphLine of sumstat) {
        const { key, values } = graphLine;

        for (const v of values) {
          svg
            .append('circle')
            .attr('class', `performance-over-time-${key}-dot`)
            .attr('cx', x(v.year))
            .attr('cy', y(+v.n));
        }
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

  return PerformanceOverTimeView;
});
