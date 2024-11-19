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

      const chartData = data[0];

      console.log(chartData);

      const example = {
        n: '636',
        name: 'Helen',
        year: '1880'
      };

      return {
        chartData
      };
    },

    renderChart: function (chartData) {
      const FONT_SIZE = 12;

      const parent = d3
        .select(this.viewParent)
        .select('.performance-over-time-chart');

      if (!parent.node() || !chartData) return;

      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;

      // -----------------------------------------------------------------

      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = parent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //Read the data
      d3.csv(
        'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv',
        function (data) {
          console.log(data);

          // group the data: I want to draw one line per group
          var sumstat = d3
            .nest() // nest function allows to group the calculation per level of a factor
            .key(function (d) {
              return d.name;
            })
            .entries(data);

          // Add X axis --> it is a date format
          var x = d3
            .scaleLinear()
            .domain(
              d3.extent(data, function (d) {
                return d.year;
              })
            )
            .range([0, width]);
          svg
            .append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x).ticks(5));

          // Add Y axis
          var y = d3
            .scaleLinear()
            .domain([
              0,
              d3.max(data, function (d) {
                return +d.n;
              })
            ])
            .range([height, 0]);
          svg.append('g').call(d3.axisLeft(y));

          // color palette
          var res = sumstat.map(function (d) {
            return d.key;
          }); // list of group names
          var color = d3
            .scaleOrdinal()
            .domain(res)
            .range([
              '#e41a1c',
              '#377eb8',
              '#4daf4a',
              '#984ea3',
              '#ff7f00',
              '#ffff33',
              '#a65628',
              '#f781bf',
              '#999999'
            ]);

          // Draw the line
          svg
            .selectAll('.line')
            .data(sumstat)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', function (d) {
              return color(d.key);
            })
            .attr('stroke-width', 1.5)
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
        }
      );
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
