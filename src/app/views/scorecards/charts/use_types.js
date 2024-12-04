define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  '../../../../lib/validate_building_data',
  'text!templates/scorecards/charts/use_types.html'
], function ($, _, Backbone, d3, wrap, validateBuildingData, UseTypesTemplate) {
  var UseTypesView = Backbone.View.extend({
    initialize: function (options) {
      this.template = _.template(UseTypesTemplate);
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

      const buildingData = data[0];

      const { typedData, valid } = validateBuildingData(buildingData, {
        largestpropertyusetypegfa: 'number',
        secondlargestpropertyusetypegfa: 'number',
        thirdlargestpropertyusetypegfa: 'number',
        largestpropertyusetype: 'string',
        secondlargestpropertyusetype: 'string',
        thirdlargestpropertyusetype: 'string',
        id: 'number',
        yearbuilt_string: 'string',
        yearbuilt: 'number'
      });

      if (!valid) {
        this.showChart = false;
        return false;
      }

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
      } = typedData;

      const totalGfa =
        Number(largestpropertyusetypegfa ?? 0) +
        Number(secondlargestpropertyusetypegfa ?? 0) +
        Number(thirdlargestpropertyusetypegfa ?? 0);

      const chartData = {
        first: largestpropertyusetypegfa
          ? (largestpropertyusetypegfa / totalGfa) * 100
          : 0,
        second: secondlargestpropertyusetypegfa
          ? (secondlargestpropertyusetypegfa / totalGfa) * 100
          : 0,
        third: thirdlargestpropertyusetypegfa
          ? (thirdlargestpropertyusetypegfa / totalGfa) * 100
          : 0
      };

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      const _totalSquareFootage = numberWithCommas(totalGfa);

      const getLegendText = (gfa, useType) => {
        if (isNaN(gfa)) return null;
        let roundedGfa = Math.round(gfa);
        if (gfa === 0) return null;
        let next = `${roundedGfa}% ${useType}`;
        return next;
      };

      const _legendFirstText = getLegendText(
        chartData.first,
        largestpropertyusetype
      );

      const _legendSecondText = getLegendText(
        chartData.second,
        secondlargestpropertyusetype
      );

      const _legendThirdText = getLegendText(
        chartData.third,
        thirdlargestpropertyusetype
      );

      const _buildingId = id;

      const _yearBuilt = yearbuilt_string ?? `${yearbuilt}`;

      const _useTypeNum = [
        _legendFirstText,
        _legendSecondText,
        _legendThirdText
      ].filter(v => v !== null).length;

      return {
        chartData,
        _totalSquareFootage,
        _legendFirstText,
        _legendSecondText,
        _legendThirdText,
        _useTypeNum,
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
        .attr(
          'transform',
          'translate(' + width / 2 + ',' + outerHeight / 2 + ')'
        );

      // Compute the position of each group on the pie:
      var pie = d3.pie().value(function (d) {
        return d.value;
      });

      const filteredChartData = Object.fromEntries(
        Object.entries(chartData).filter(([k, v]) => v > 0)
      );

      var data_ready = pie(d3.entries(filteredChartData));
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

  return UseTypesView;
});
