define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  '../../../../lib/validate_building_data',
  'text!templates/scorecards/charts/performance_over_time.html'
], function (
  $,
  _,
  Backbone,
  d3,
  wrap,
  validateBuildingData,
  PerformanceOverTimeTemplate
) {
  var PerformanceOverTimeView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(PerformanceOverTimeTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.showChart = true;
    },

    // Templating for the HTML + chart
    chartData: function () {
      const data = this.data;

      // No historical data when looking at earliest year
      if (!data || !Array.isArray(data)) {
        this.showChart = false;
        return false;
      }

      const validated = data
        // Some points haven't been reported, but this shouldn't invalidate it
        // Remove unreported points
        .filter(d => d.value !== null && d.value !== undefined)
        .map(d =>
          validateBuildingData(d, {
            id: 'string',
            value: 'number',
            year: 'number'
          })
        );

      const valid = validated.every(d => d.valid);
      const typedData = validated.map(d => d.typedData);

      if (!valid) {
        this.showChart = false;
        return false;
      }

      const chartData = typedData.map(v => {
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
        .range([30, width]);

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

      function roundUpNum(num) {
        const upper = Math.ceil(num * 1.15);
        return upper;
      }

      function roundDownNum(num) {
        const lower = Math.floor(num * 0.85);
        return lower;
      }

      const max = roundUpNum(
        d3.max(chartData, function (d) {
          return +d.n;
        })
      );

      const min = roundDownNum(
        d3.min(chartData, function (d) {
          return +d.n;
        })
      );

      const tickSize = (max - min) / 5;

      // Add Y axis
      var y = d3.scaleLinear().domain([min, max]).range([height, 0]);

      const yAxis = svg
        .append('g')
        .attr(`transform`, `translate(${AXIS_PADDING * -1}, 0)`)
        .attr('class', 'text-chart')
        .call(
          d3
            .axisLeft(y)
            .ticks(max / tickSize)
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
      const yAxisExtent = [min, max];

      for (
        let i = yAxisExtent[0] + tickSize;
        i < yAxisExtent[1];
        i += tickSize
      ) {
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

      for (const graphLine of sumstat) {
        const { key, values } = graphLine;

        for (const v of values) {
          const dotContainer = svg
            .append('g')
            .attr('class', 'performance-over-time-dot-container');

          // Just to make the hover target larger
          dotContainer
            .append('circle')
            .attr('fill', `transparent`)
            .attr('r', '1rem')
            .attr('cx', x(v.year))
            .attr('cy', y(+v.n));

          const bgWidth = Math.max(40, 8 * `${v.n}`.length);

          dotContainer
            .append('rect')
            .attr('class', `performance-over-time-${key}-text-bg`)
            .attr('width', `${bgWidth}px`)
            .attr('height', '20px')
            // minus full height
            .attr('y', y(+v.n) - AXIS_PADDING - 20)
            // minus half of width
            .attr('x', x(v.year) - bgWidth / 2);

          dotContainer
            .append('text')
            .attr('class', `performance-over-time-${key}-hover-text text-chart`)
            .attr('text-anchor', 'middle')
            .attr('y', y(+v.n) - AXIS_PADDING * 2)
            .attr('x', x(v.year))
            .text(v.n);
        }
      }
    },

    render: function () {
      const chartData = this.chartData();
      if (!chartData) return;
      return this.template(chartData);
    },

    afterRender: function () {
      const chartData = this.chartData();
      if (!chartData) return;
      this.renderChart(chartData.chartData);
    }
  });

  return PerformanceOverTimeView;
});
