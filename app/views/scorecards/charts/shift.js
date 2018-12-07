'use strict';

define(['jquery', 'underscore', 'backbone', 'd3', 'text!templates/scorecards/charts/shift.html'], function ($, _, Backbone, d3, ShiftTemplate) {
  var ShiftView = Backbone.View.extend({
    className: 'shift-chart',

    initialize: function initialize(options) {
      this.template = _.template(ShiftTemplate);
      this.formatters = options.formatters;
      this.data = options.data || [];
      this.view = options.view;
      this.no_year = options.no_year || false;
      this.selected_year = options.selected_year;
      this.previous_year = options.previous_year;
      this.isCity = options.isCity || false;
    },

    validNumber: function validNumber(x) {
      return _.isNumber(x) && _.isFinite(x);
    },

    calculateChange: function calculateChange() {
      if (!this.data || !this.data.length) return null;

      var years = [];

      this.data.filter(function (d) {
        return d.influencer;
      }).forEach(function (d) {
        years.push({
          yr: d.year,
          val: d.value
        });
      });

      years.sort(function (a, b) {
        return a.yr - b.yr;
      });

      var last = years.length - 1;
      if (years.length < 2) {
        return null;
      }

      return (years[last].val - years[last - 1].val) / years[last].val * 100;
    },

    extractChangeData: function extractChangeData() {
      this.data.sort(function (a, b) {
        return a.year - b.year;
      });

      var years = d3.set(this.data.map(function (d) {
        return d.year;
      })).values().slice(-2);

      var change = this.calculateChange();

      var direction = change < 0 ? 'decreased' : change === 0 ? '' : 'increased';

      var isValid = this.validNumber(change);

      return {
        chart: this.data,
        template: {
          isValid: isValid,
          direction: direction,
          years: years,
          change: change,
          noyear: false,
          isCity: this.isCity,
          pct: this.formatters.fixedOne(Math.abs(change)) + '%'
        }
      };
    },

    getGradientId: function getGradientId(base, field) {
      return base + '_' + field;
    },

    setSVGGradient: function setSVGGradient(rootElm, id, data) {
      var _this = this;

      var defs = rootElm.select('svg').append('defs');

      var fields = data.filter(function (d) {
        return d.colorize;
      }).reduce(function (a, b) {
        if (!a.hasOwnProperty(b.field)) {
          a[b.field] = {
            min: b.year,
            max: b.year,
            minclr: b.clr,
            maxclr: b.clr
          };

          return a;
        }

        if (b.year < a[b.field].min) {
          a[b.field].min = b.year;
          a[b.field].minclr = b.clr;
        } else if (b.year > a[b.field].max) {
          a[b.field].max = b.year;
          a[b.field].maxclr = b.clr;
        }

        return a;
      }, {});

      Object.keys(fields).forEach(function (k) {
        var field = fields[k];

        var gradient = defs.append('linearGradient').attr('id', _this.getGradientId(id, k)).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');

        gradient.append('stop').attr('offset', '0%').attr('stop-color', field.minclr).attr('stop-opacity', 1);

        gradient.append('stop').attr('offset', '100%').attr('stop-color', field.maxclr).attr('stop-opacity', 1);
      });
    },

    renderChangeChart: function renderChangeChart(isValid, data, selector) {
      var _this2 = this;

      var container = d3.select(selector);

      var rootElm = container.select('#change-chart-vis');
      var yearsElm = container.select('#change-chart-years');

      if (!isValid) return;

      // Filter data to past two years
      var allowedYears = d3.set(data.map(function (d) {
        return d.year;
      })).values().map(function (y) {
        return parseInt(y);
      }).slice(-2);
      var filteredData = data.filter(function (d) {
        return allowedYears.indexOf(d.year) >= 0;
      });

      var diameter = 10;
      var yearExtent = d3.extent(filteredData, function (d) {
        return d.year;
      });
      var valueExtent = d3.extent(filteredData, function (d) {
        return d.value;
      });

      var yearWidth = yearsElm.select('p').node().offsetWidth;
      var baseWidth = yearsElm.node().offsetWidth - yearWidth * 2;

      baseWidth += diameter;

      rootElm.style('margin-left', yearWidth - diameter / 2 + 'px');

      var margin = { top: 0, right: 0, bottom: 0, left: 0 };
      var width = baseWidth - margin.left - margin.right;
      var height = rootElm.node().offsetHeight - margin.top - margin.bottom;

      var svg = rootElm.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var gradientID = 'gradient-' + this.view;
      this.setSVGGradient(rootElm, gradientID, filteredData);

      var x = d3.scale.ordinal().range([0, width]).domain(yearExtent);

      var y = d3.scale.linear().domain(valueExtent).range([height, 0]);

      var line = d3.svg.line().x(function (d) {
        return x(d.year);
      }).y(function (d) {
        return y(d.value);
      });

      var connections = d3.nest().key(function (d) {
        return d.label;
      }).entries(filteredData);

      svg.selectAll('.line').data(connections).enter().append('path').attr('class', function (d) {
        var colorize = d.values[0].colorize ? '' : ' no-clr';
        var field = d.values[0].field;

        return 'line shift-line-' + field + ' ' + colorize;
      }).style('stroke', function (d) {
        var colorize = d.values[0].colorize;
        if (!colorize) return null;

        var field = d.values[0].field;
        return 'url(#' + _this2.getGradientId(gradientID, field) + ')';
      }).attr('d', function (d) {
        return line(d.values);
      });

      var bar = svg.selectAll('.dot').data(filteredData).enter().append('g').attr('class', function (d) {
        var colorize = d.colorize ? '' : ' no-clr';
        var field = d.field;

        return 'dot shift-dot-' + field + ' ' + colorize;
      }).attr('transform', function (d) {
        return 'translate(' + x(d.year) + ',' + y(d.value) + ')';
      });

      bar.append('circle').attr('r', 5).attr('fill', function (d) {
        return d.clr;
      });

      var firstyear = x.domain()[0];
      var lastyear = x.domain()[1];

      var label = rootElm.selectAll('.label').data(filteredData).enter().append('div').attr('class', 'label').attr('class', function (d) {
        var colorize = d.colorize ? '' : ' no-clr';
        var field = d.field;

        return 'label shift-label-' + field + ' ' + colorize;
      }).style('color', function (d) {
        return d.clr;
      }).style('left', function (d) {
        if (d.year === firstyear) return x(d.year) + 'px';
        return x(d.year) + 10 + 'px';
      }).style('top', function (d) {
        return y(d.value) + 'px';
      });

      var innerLabel = label.append('table').append('td');

      innerLabel.append('p').text(function (d) {
        return _this2.formatters.fixedOne(d.value);
      });
      innerLabel.append('p').attr('class', 'metric small').text(function (d) {
        return d.unit;
      });

      label.each(function (d) {
        var el = d3.select(this);
        var w = el.node().offsetWidth;

        if (d.year === firstyear) {
          el.style('margin-left', -(w + 10) + 'px');
        }
      });

      label.filter(function (d) {
        return d.year === lastyear;
      }).select('table').append('td').append('span').attr('class', 'building').text(function (d) {
        return d.label;
      });

      var me = this;
      var prev = void 0;
      label.each(function (d) {
        if (prev) {
          var rect1 = me.makeRect(prev);
          var rect2 = me.makeRect(this);
          var attempts = 10;

          while (me.collision(rect1, rect2) && attempts > 0) {
            attempts--;
            prev.style.top = rect1.top - 2 + 'px';
            this.style.top = rect2.top + 2 + 'px';

            rect1 = me.makeRect(prev);
            rect2 = me.makeRect(this);
          }
        }
        prev = this;
      });
    },

    makeRect: function makeRect(el) {
      var t = el.offsetTop;
      var l = el.offsetLeft;

      return {
        top: t,
        right: l + el.offsetWidth,
        bottom: t + el.offsetHeight,
        left: l
      };
    },

    collision: function collision(rect1, rect2) {
      return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
    },

    chartData: function chartData(cb) {
      cb(this.extractChangeData());
    },

    render: function render(cb, viewSelector) {
      var _this3 = this;

      if (this.no_year) {
        cb(this.template({
          noyear: true,
          year_needed: this.previous_year,
          isCity: this.isCity
        }));
        return;
      }

      this.chartData(function (d) {
        cb(_this3.template(d.template));
        _this3.renderChangeChart(d.template.isValid, d.chart, viewSelector);
      });
    }
  });

  return ShiftView;
});