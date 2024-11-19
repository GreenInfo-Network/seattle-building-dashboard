define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  'text!templates/scorecards/charts/use_types.html'
], function ($, _, Backbone, d3, wrap, UseTypesTemplate) {
  var UseTypesView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(UseTypesTemplate);
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

      const {
        largestpropertyusetypegfa,
        secondlargestpropertyusetypegfa,
        thirdlargestpropertyusetypegfa,
        largestpropertyusetype,
        secondlargestpropertyusetype,
        thirdlargestpropertyusetype,
        id,
        yearbuilt_string,
        yearbuilt
      } = data[0];

      const totalGfa =
        Number(largestpropertyusetypegfa) +
        Number(secondlargestpropertyusetypegfa) +
        Number(thirdlargestpropertyusetypegfa);

      const chartData = {
        first: (largestpropertyusetypegfa / totalGfa) * 100,
        second: (secondlargestpropertyusetypegfa / totalGfa) * 100,
        third: (thirdlargestpropertyusetypegfa / totalGfa) * 100
      };

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      const _totalSquareFootage = numberWithCommas(totalGfa);

      const _legendFirstText = `${Math.round(
        chartData.first
      )}% ${largestpropertyusetype}`;
      const _legendSecondText = `${Math.round(
        chartData.second
      )}% ${secondlargestpropertyusetype}`;
      const _legendThirdText = `${Math.round(
        chartData.third
      )}% ${thirdlargestpropertyusetype}`;

      const _buildingId = id;

      const _yearBuilt = yearbuilt_string ?? `${yearbuilt}`;

      return {
        chartData,
        _totalSquareFootage,
        _legendFirstText,
        _legendSecondText,
        _legendThirdText,
        _buildingId,
        _yearBuilt
      };
    },

    renderChart: function (chartData) {
      const FONT_SIZE = 12;

      const parent = d3.select(this.viewParent).select('.use-types-chart');

      if (!parent.node() || !chartData) return;

      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;

      // set the dimensions and margins of the graph
      var margin = 10;
      const height = outerHeight - margin * 2;
      const width = outerWidth - margin * 2;

      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      var radius = Math.min(width, height) / 2 - margin;

      // append the svg object to the div called 'my_dataviz'
      var svg = parent
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

      // Compute the position of each group on the pie:
      var pie = d3.pie().value(function (d) {
        return d.value;
      });
      var data_ready = pie(d3.entries(chartData));
      // Now I know that group A goes from 0 degrees to x degrees and so on.

      // shape helper to build arcs:
      var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr(
          'class',
          d => `use-types-chart-section use-types-chart-${d.data.key}`
        );

      // Now add the annotation. Use the centroid method to get the best coordinates
      svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) {
          const percent = `${Math.round(d.value)}%`;
          return percent;
        })
        .attr('transform', function (d) {
          return 'translate(' + arcGenerator.centroid(d) + ')';
        })
        .attr('class', 'text-chart')
        .style('text-anchor', 'middle')
        .style('font-size', FONT_SIZE);
    },

    render: function () {
      return this.template(this.chartData());
    },

    afterRender: function () {
      const chartData = this.chartData();
      this.renderChart(chartData?.chartData);
    }
  });

  return UseTypesView;
});
