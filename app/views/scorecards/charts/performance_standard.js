'use strict';

define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', 'text!templates/scorecards/charts/performance_standard.html'], function ($, _, Backbone, d3, wrap, PerformanceStandardTemplate) {
  var PerformanceStandardView = Backbone.View.extend({
    className: 'performance-standard-chart',

    initialize: function initialize(options) {
      this.template = _.template(PerformanceStandardTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.viewParent = options.parent;
      this.current_eui = options.current_eui;
      this.target_eui = options.target_eui;
      this.compliance_year = options.compliance_year;
      this.cbps_flag = options.cbps_flag;
      this.cbps_flag_but_no_cbps_euit = options.cbps_flag_but_no_cbps_euit;
    },

    chartData: function chartData() {
      return {
        current_eui: this.current_eui,
        target_eui: this.target_eui,
        compliance_year: this.compliance_year,
        cbps_flag: this.cbps_flag,
        cbps_flag_but_no_cbps_euit: this.cbps_flag_but_no_cbps_euit
      };
    },

    renderBarChart: function renderBarChart(data) {
      var parent = d3.select('div#performance-standard-bar-chart');
      if (!parent.node()) return;

      // const margin = { top: 20, right: 30, bottom: 20, left: 30 };
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var margin_right = 15;
      var margin_left = 5;
      var chartWidth = outerWidth - margin_left - margin_right;

      // barchart height and offset
      var barHeight = 30;
      // vertically center the bar chart in the middle of the overall SVG
      var chartOffset = outerHeight / 2 - barHeight / 2;
      // place the text just below the chart
      var tickOffset = outerHeight / 2 + barHeight;

      var svg = parent.append('svg').attr('viewBox', '0 0 ' + outerWidth + ' ' + outerHeight);

      var chartGroup = svg.append('g').attr('transform', 'translate(' + margin_left + ', ' + chartOffset + ')');

      var tickGroup = svg.append('g').attr('transform', 'translate(' + margin_left + ', ' + tickOffset + ')');

      var labelGroup = svg.append('g').attr('transform', 'translate(' + margin_left + ', ' + tickOffset + ')');

      // now some maths to work out a simple scale
      // we want the midpoint between two data points to be roughly the middle of the bar
      // then we figure out the max bar value from that
      var chart_midpoint = (data.current_eui + data.target_eui) / 2;
      var chart_maxvalue = chart_midpoint * 2;
      var quartile_rough = chart_maxvalue / 5;
      var quartile = this.roundQuartile(quartile_rough);

      // add the background bar, which is just a 100% width rect, with margin on the left to support the final label
      chartGroup.append('rect').attr('class', 'bar-outline').attr('height', barHeight).attr('width', chartWidth);

      // add the bar, no need for a data/enter type pattern
      // as there is just one bar and we can calc the width directly
      var barWidth = data.current_eui * chartWidth / (quartile * 5);
      chartGroup.append('rect').attr('class', 'bar-eui').attr('fill', function () {
        return data.current_eui <= data.target_eui ? '#90AE60' : '#C04F31';
      }).attr('height', barHeight).attr('width', barWidth).attr('text', barWidth);

      var quartiles = [0, quartile, quartile * 2, quartile * 3, quartile * 4, quartile * 5];
      var quartileWidth = chartWidth / 5;

      // add the tick values
      var tickGroupInnerGroup = tickGroup.selectAll('g').data(quartiles).enter().append('g')
      // we use this class to hide the first tick line (at 0) and the last tick line (at 100%)
      .classed('hide-line', function (d, i) {
        return i == 5 || i == 0;
      }).classed('tick-line-over-bar', function (d, i) {
        return d < data.current_eui;
      }).attr('transform', function (d, i) {
        var dx = quartileWidth * i;
        return 'translate(' + dx + ', 0)';
      });

      tickGroupInnerGroup.selectAll('.tick-label').data(function (d) {
        return [d];
      }).enter().append('text').attr('class', 'tick-label').attr('dx', function (d) {
        // offset the label according to its length
        // to more closely center it on the tick mark
        var chars = d.toString().length;
        return chars * -3.25;
      }).text(function (d) {
        return d;
      });

      tickGroupInnerGroup.selectAll('.tick-line').data(function (d) {
        return [d];
      }).enter().append('line').attr('class', 'tick-line').attr('x1', 0).attr('y1', -15).attr('y2', -barHeight - 15);

      // append a group to hold the ticks for the current and target EUI
      var euiLabelGroup = labelGroup.append('g').attr('transform', function () {
        return 'translate(' + (barWidth - 1) + ', 0)';
      });

      // now append the tick for the current EUI
      euiLabelGroup.append('line').attr('class', 'data-line').attr('x1', 0).attr('y1', 13).attr('y2', -15);

      // append a group to hold the tick for the target EUI
      var targetWidth = data.target_eui * chartWidth / (quartile * 5);
      var targetLabelGroup = labelGroup.append('g').attr('transform', function () {
        return 'translate(' + targetWidth + ', 0)';
      });

      // now append the tick for the target EUI
      targetLabelGroup.append('line').attr('class', 'data-line').attr('x1', 0).attr('y1', -45).attr('y2', -72).attr('dx', 5);

      // append a div to hold the label for target EUI
      // div is more flexible, auto-sizes, has border radius, etc.
      d3.select('#performance-standard-bar-chart').append('div').text(data.target_eui + ' (Estimated EUI Target)').attr('class', 'chart-label').style('left', targetWidth - 20 + 'px').style('bottom', '109px');

      // append a div to hold the label for current EUI
      d3.select('#performance-standard-bar-chart').append('div').text(data.current_eui.toLocaleString() + ' (Current EUI)').attr('class', 'chart-label').style('left', barWidth - 30 + 'px').style('bottom', '10px');

      // append a div to hold a lable for "Meets target"
      d3.select('#performance-standard-bar-chart').append('div').text('Meets EUI Target').attr('class', 'chart-label-meets-target').style('left', targetWidth - 120 + 'px').style('bottom', '87px');

      // append a div to hold a lable for "Misses target"
      d3.select('#performance-standard-bar-chart').append('div').text('Doesn\'t Meet EUI Target').attr('class', 'chart-label-misses-target').style('left', targetWidth + 20 + 'px').style('bottom', '87px');
    },

    roundToNearest: function roundToNearest(nearest, number) {
      // Math.ceil would take the upper?
      return Math.round(number / nearest) * nearest;
    },

    roundQuartile: function roundQuartile(quartile_rough) {
      // round the quartile according to the following rules
      var quartile = void 0;
      if (quartile_rough > 1000) {
        quartile = this.roundToNearest(50, quartile_rough);
      } else if (quartile_rough > 100 && quartile_rough <= 1000) {
        quartile = this.roundToNearest(25, quartile_rough);
      } else if (quartile_rough > 50 && quartile_rough <= 100) {
        quartile = this.roundToNearest(25, quartile_rough);
      } else if (quartile_rough > 30 && quartile_rough <= 50) {
        quartile = this.roundToNearest(10, quartile_rough);
      } else if (quartile_rough <= 30) {
        quartile = this.roundToNearest(5, quartile_rough);
      }
      return quartile;
    },

    render: function render() {
      return this.template(this.chartData());
    },

    afterRender: function afterRender() {
      if (!this.isCity) {
        var chartData = this.chartData();
        this.renderBarChart(chartData);
      }
    }
  });

  return PerformanceStandardView;
});