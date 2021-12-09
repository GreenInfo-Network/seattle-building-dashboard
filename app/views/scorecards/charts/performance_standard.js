'use strict';

define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', 'text!templates/scorecards/charts/performance_standard.html'], function ($, _, Backbone, d3, wrap, PerformanceStandardTemplate) {
  var PerformanceStandardView = Backbone.View.extend({
    className: 'performance-standard-chart',

    TYPICAL_CAR_EMMISSION: 4.7,

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
    },

    chartData: function chartData() {
      // // const data = this.data;

      // let total_ghg_emissions;
      // let total_ghg_emissions_intensity;
      // let total_usage;

      // let fuels;

      // var totals = {
      //   usage: d3.format(',d')(d3.round(total_usage, 0)),
      //   emissions: d3.format(',d')(d3.round(total_ghg_emissions, 0))
      // };

      // return {
      //   fuels,
      //   totals,
      //   total_ghg_emissions,
      //   total_ghg_emissions_intensity,
      //   isCity: this.isCity,
      //   building_name: this.building_name,
      //   year: this.year,
      //   cars: this.formatters.fixedOne(total_ghg_emissions / this.TYPICAL_CAR_EMMISSION)
      // };
      return {
        current_eui: this.current_eui,
        target_eui: this.target_eui,
        compliance_year: this.compliance_year,
        cbps_flag: this.cbps_flag
      };
    },

    getLabelSizes: function getLabelSizes(labels) {
      var sizes = [];

      labels.each(function () {
        var pw = this.offsetWidth;
        var cw = this.firstChild.offsetWidth;

        if (pw === 0) return;

        sizes.push({
          elm: this,
          pw: pw,
          cw: cw,
          dirty: cw > pw,
          pct: +this.style.width.replace('%', '')
        });
      });

      return sizes;
    },

    adjSizes: function adjSizes(labels, ct) {
      var sizes = this.getLabelSizes(labels);

      if (!sizes.length) return;

      var ctr = ct || 0;
      ctr += 1;
      if (ctr > 100) return;

      var dirty = _.findIndex(sizes, function (d) {
        return d.dirty;
      });

      if (dirty > -1) {
        var available = sizes.filter(function (d) {
          return !d.dirty;
        });

        var additional = 0;

        available.forEach(function (d) {
          additional += 1;
          d3.select(d.elm).style('width', d.pct - 1 + '%');
        });

        d3.select(sizes[dirty].elm).style('width', sizes[dirty].pct + additional + '%');

        this.adjSizes(labels, ctr);
      }
    },

    hideLabels: function hideLabels(labels) {
      var sizes = this.getLabelSizes(labels);
      sizes.forEach(function (d) {
        if (d.dirty) {
          d3.select(d.elm.firstChild).style('display', 'none');
        }
      });
    },

    renderPerformanceStandardChart: function renderPerformanceStandardChart(data, totals) {
      // const parent = d3.select(this.viewParent).select('.performance-standard-bar-chart-container');
      // if (!parent.node()) return;

      // const margin = { top: 20, right: 30, bottom: 20, left: 30 };
      // const outerWidth = parent.node().offsetWidth;
      // const outerHeight = parent.node().offsetHeight;
      // const width = outerWidth - margin.left - margin.right;

      // const svg = parent.append('svg')
      //   .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

      // const totalBarWidth = width * (3 / 5);

      // const chartData = data.map((row, i) => {
      //   return {
      //     ...row,
      //     emissions: {
      //       ...row.emissions,
      //       pctBefore: d3.sum(data.map((d, k) => k >= i ? 0 : d.emissions.pct_actual))
      //     },
      //     usage: {
      //       ...row.usage,
      //       pctBefore: d3.sum(data.map((d, k) => k >= i ? 0 : d.usage.pct_actual))
      //     }
      //   };
      // });

      // const labels = {
      //   emissions: {
      //     label: 'Resulting Emissions',
      //     labelUnits: '(% ghg)'
      //   },
      //   usage: {
      //     label: 'Energy Consumed',
      //     labelUnits: '(% kBtu)'
      //   }
      // };

      // const energyConsumedGroup = svg.append('g');
      // this.renderBarChart(energyConsumedGroup, chartData, labels, totals, 10, width, totalBarWidth, 30, 'usage');

      // const emissionsGroup = svg.append('g')
      //   .attr('transform', `translate(0, 60)`);
      // this.renderBarChart(emissionsGroup, chartData, labels, totals, 15, width, totalBarWidth, 30, 'emissions');
    },

    renderBarChart: function renderBarChart(parent, data, labels, totals, yOffset, chartWidth, barWidth, barHeight, metric) {
      var chartGroup = parent.append('g').attr('transform', 'translate(0, ' + yOffset + ')');

      // Width of text on either side of bars
      var textWidth = (chartWidth - barWidth) / 2;
      var barStart = textWidth;
      var barGroup = chartGroup.append('g').attr('transform', 'translate(' + barStart + ', 15)');
      barGroup.selectAll('.bar-item').data(data).enter().append('rect').attr('class', function (d) {
        return d.key;
      }).classed('bar-item', true).attr('height', barHeight).attr('width', function (d) {
        return d[metric].pct_actual * barWidth;
      }).attr('x', function (d) {
        return d[metric].pctBefore * barWidth;
      });

      var labelGroup = chartGroup.append('g').classed('bar-chart-label', true).attr('transform', 'translate(' + (barStart - 5) + ', 25)');

      labelGroup.append('text').attr('x', 0).text(labels[metric].label).call(wrap, textWidth);

      labelGroup.selectAll('tspan').classed('bar-chart-label-name', true);

      labelGroup.select('text').append('tspan').attr('x', 0).attr('dy', '1.1em').text(labels[metric].labelUnits);

      var totalGroup = chartGroup.append('g').attr('transform', 'translate(' + (barStart + barWidth + 5) + ', 25)');

      var totalText = totalGroup.append('text').classed('bar-chart-total', true);

      totalText.append('tspan').attr('x', 0).classed('bar-chart-total-value', true).text(totals[metric]);
      totalText.append('tspan').attr('dx', '.25em').text(metric === 'usage' ? 'kBtu' : 'metric tons');

      var barLabels = chartGroup.append('g').attr('transform', 'translate(0, 10)').classed('bar-labels', true);
      var barLabelText = barLabels.selectAll('.bar-label').data(data).enter().append('text').attr('class', function (d) {
        return d.key;
      }).classed('bar-label', true).attr('x', function (d) {
        return barStart + (d[metric].pctBefore + d[metric].pct_actual / 2) * barWidth;
      }).text(function (d) {
        if (metric === 'usage') return d.label + ' ' + d[metric].pct + '%';
        return d[metric].pct + '%';
      });

      barLabelText.call(detectHorizontalCollision);

      function detectHorizontalCollision() {
        this.each(function () {
          var node = this;
          var box = node.getBBox();

          // Only have to detect horizontally, vertically will be on the same
          var x0 = box.x;
          var x1 = x0 + box.width;

          barLabelText.each(function () {
            if (this !== node) {
              var otherBox = this.getBBox();
              var otherX0 = otherBox.x;

              // Only interested in labels that should be to the left of other
              // labels
              if (x0 < otherX0 && x1 > otherX0) {
                var overlapSize = x1 - otherX0 + 2;
                d3.select(node).attr('dx', -(overlapSize / 2));

                d3.select(this).attr('dx', overlapSize / 2);
              }
            }
          });
        });
      }
    },

    render: function render() {
      return this.template(this.chartData());
    },

    afterRender: function afterRender() {
      if (!this.isCity) {
        var chartData = this.chartData();
        this.renderPerformanceStandardChart(chartData);
      }
    }
  });

  return PerformanceStandardView;
});