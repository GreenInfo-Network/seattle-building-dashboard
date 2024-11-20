define(['jquery', 'underscore', 'backbone', 'd3'], function (
  $,
  _,
  Backbone,
  d3
) {
  var HistogramView = Backbone.View.extend({
    className: 'histogram',

    initialize: function (options) {
      this.aspectRatio = options.aspectRatio || 7 / 1;
      this.height = 100;
      this.width = this.height * this.aspectRatio;

      this.selected_value = options.selected_value || null;
      this.gradients = options.gradients;
      this.colorScale = options.colorScale;
      this.filterRange = options.filterRange;
      this.fieldName = options.fieldName;
      this.slices = options.slices; // Not sure why we have slices, when that value can be extrapulated from this.gradients

      this.chart = d3
        .select(this.el)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
        .attr('preserveAspectRatio', 'none')
        .attr('background', 'transparent');

      this.g = this.chart.append('g');
    },

    update: function (options) {
      Object.keys(options).forEach(k => {
        if (this.hasOwnProperty(k)) {
          this[k] = options[k];
        }
      });
    },

    findQuantileIndexForValue: function (val, quantiles) {
      if (!quantiles) {
        quantiles = this.colorScale.quantiles
          ? [...this.colorScale.quantiles()]
          : [...this.colorScale.domain()];
      }

      const len = quantiles.length - 1;

      return _.reduce(
        quantiles,
        function (prev, curr, i) {
          // bail if we found an index
          if (prev > -1) return prev;

          // special case first index
          if (i === 0 && val < quantiles[0]) return i;

          // check if val is within range
          if (val >= quantiles[i - 1] && val < quantiles[i]) return i;

          // if no match yet, return index for the last bar
          if (i === len) return i + 1;

          // return current index
          return prev;
        },
        -1
      );
    },

    updateHighlight: function (val) {
      if (!this.chart || this.selected_value === val) return;
      this.selected_value = val;
      this.chart.selectAll('rect').call(this.highlightBar, this);
    },

    highlightBar: function (bars, context) {
      const ctxValue = context.selected_value;

      const quantiles = context.colorScale.quantiles
        ? [...context.colorScale.quantiles()]
        : [...context.colorScale.domain()];

      const highlightIndex =
        ctxValue !== null
          ? context.findQuantileIndexForValue(ctxValue, quantiles)
          : null;

      bars.classed('highlight', function (d, i) {
        return i === highlightIndex;
      });
    },

    render: function () {
      const colorScale = this.colorScale;
      const isThreshold = colorScale.quantiles ? false : true;

      const gradients = this.gradients;
      const counts = _.pluck(gradients, 'count');
      const height = this.height;

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(counts)])
        .range([0, this.height]);

      const xScale = d3
        .scaleBand()
        .domain(d3.range(0, this.slices))
        .range([0, this.width])
        .padding(0.2);

      // threshold types use rounded bands for convienence
      if (isThreshold) {
        xScale.rangeRound([0, this.width]);
      }

      const bardata = xScale.domain().map((d, i) => {
        return {
          ...gradients[i],
          idx: i,
          data: d,
          xpos: xScale(d) + xScale.bandwidth() / 2
        };
      });

      const filterValueForXpos = d3
        .scaleLinear()
        .range(this.filterRange)
        .domain([0, this.width]);

      // make scale available to caller
      this.xScale = xScale;

      // draw
      const bars = this.g.selectAll('rect').data(bardata, function (d) {
        return d.color;
      });

      bars
        .enter()
        .append('rect')
        .attr('fill', d => {
          // not on a continous scale
          // so just need the color from data
          if (isThreshold) return d.color;

          // mapping the color continously
          // so need to calculate the color for
          // this xpos
          //
          return colorScale(filterValueForXpos(d.xpos));
        })
        .attr('width', xScale.bandwidth())
        .attr('stroke-width', 0)
        .attr('height', d => yScale(d.count))
        .attr('x', d => {
          return xScale(d.data);
        })
        .attr('y', d => {
          return height - yScale(d.count);
        });

      bars.exit().remove();

      bars.call(this.highlightBar, this);

      this.g
        .selectAll('rect')
        .filter((bucket, index) => {
          return bucket.current === index;
        })
        .classed('current', true);

      return this.el;
    }
  });

  return HistogramView;
});
