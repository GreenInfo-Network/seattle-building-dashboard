"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../../lib/wrap', 'text!templates/scorecards/charts/fueluse.html'], function ($, _, Backbone, d3, wrap, FuelUseTemplate) {
  var FuelUseView = Backbone.View.extend({
    className: 'fueluse-chart',
    TYPICAL_CAR_EMMISSION: 4.7,
    initialize: function initialize(options) {
      this.template = _.template(FuelUseTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;
      this.fuels = [{
        label: 'Electric',
        key: 'electricity'
      }, {
        label: 'Steam',
        key: 'steam'
      }, {
        label: 'Gas',
        key: 'gas'
      }];
    },
    getMean: function getMean(key, data) {
      if (data.pluck) {
        return d3.mean(data.pluck(key));
      } else {
        return d3.mean(data.map(function (d) {
          return d[key];
        }));
      }
    },
    getSum: function getSum(key, data) {
      if (data.pluck) {
        return d3.sum(data.pluck(key));
      } else {
        return d3.sum(data.map(function (d) {
          return d[key];
        }));
      }
    },
    pctFormat: function pctFormat(n) {
      var val = n * 100;
      return d3.format('.0f')(val);
    },
    validNumber: function validNumber(n) {
      return _.isNumber(n) && _.isFinite(n);
    },
    validFuel: function validFuel(pct, amt) {
      return this.validNumber(pct) && pct > 0 && this.validNumber(amt) && amt > 0;
    },
    getBuildingFuels: function getBuildingFuels(fuels, data) {
      var _this = this;
      fuels.forEach(function (d) {
        var emmission_pct = _this.getMean(d.key + '_ghg_percent', data);
        var emmission_amt = _this.getMean(d.key + '_ghg', data);
        var usage_pct = _this.getMean(d.key + '_pct', data);
        var usage_amt = _this.getMean(d.key, data);
        d.emissions = {};
        d.emissions.isValid = _this.validFuel(emmission_pct, emmission_amt);
        d.emissions.pct = d.emissions.pct_raw = emmission_pct * 100;
        d.emissions.pct_actual = emmission_pct;
        d.emissions.amt = emmission_amt;
        d.emissions.cars = _this.formatters.fixedOne(emmission_amt / _this.TYPICAL_CAR_EMMISSION);
        d.usage = {};
        d.usage.isValid = _this.validFuel(usage_pct, usage_amt);
        d.usage.pct = d.usage.pct_raw = usage_pct * 100;
        d.usage.pct_actual = usage_pct;
        d.usage.amt = usage_amt;
      });
      return fuels.filter(function (d) {
        return d.usage.isValid || d.emissions.isValid;
      });
    },
    getCityWideFuels: function getCityWideFuels(fuels, data) {
      var _this2 = this;
      var total_emissions = data.total_emissions;
      var total_usage = data.total_consump;
      fuels.forEach(function (d) {
        var emission_key = "pct_".concat(d.key, "_ghg");
        var usage_key = "pct_".concat(d.key);
        var emmission_pct = data[emission_key];
        var usage_pct = data[usage_key];
        d.emissions = {};
        d.emissions.isValid = _this2.validFuel(emmission_pct, total_emissions);
        d.emissions.pct = d.emissions.pct_raw = emmission_pct * 100;
        d.emissions.pct_actual = emmission_pct;
        d.usage = {};
        d.usage.isValid = _this2.validFuel(usage_pct, total_usage);
        d.usage.pct = d.usage.pct_raw = usage_pct * 100;
        d.usage.pct_actual = usage_pct;
      });
      return fuels.filter(function (d) {
        return d.usage.isValid && d.emissions.isValid;
      });
    },
    fixPercents: function fixPercents(fuels, prop) {
      var values = fuels.map(function (d, i) {
        var decimal = +(d[prop].pct_raw % 1);
        var val = Math.floor(d[prop].pct_raw);
        return {
          idx: i,
          val: val,
          iszero: val === 0,
          decimal: val === 0 ? 1 : decimal
        };
      }).sort(function (a, b) {
        return b.decimal - a.decimal;
      });
      var sum = d3.sum(values, function (d) {
        return d.val;
      });
      var diff = 100 - sum;
      values.forEach(function (d) {
        if (diff === 0) return;
        diff -= 1;
        d.val += 1;
        d.iszero = false;
      });

      // we need to bump up zero values
      var zeros = values.filter(function (d) {
        return d.iszero;
      });
      var zeros_length = zeros.length;
      if (zeros_length > 0) {
        while (zeros_length > 0) {
          zeros_length--;
          values.forEach(function (d) {
            if (!d.iszero && d.val > 1) {
              d.val -= 1;
            }
            if (d.iszero) {
              d.val += 1;
            }
          });
        }
      }
      values.forEach(function (d) {
        fuels[d.idx][prop].pct = d.val;
        fuels[d.idx][prop].pct_raw = d.val;
      });
    },
    chartData: function chartData() {
      var data = this.data;
      var total_ghg_emissions;
      var total_ghg_emissions_intensity;
      var total_usage;
      var fuels;
      if (this.isCity) {
        fuels = this.getCityWideFuels(_toConsumableArray(this.fuels), data);
        total_ghg_emissions = data.total_emissions;
        total_ghg_emissions_intensity = data.total_emissions_intensity;
        total_usage = data.total_consump;
      } else {
        fuels = this.getBuildingFuels(_toConsumableArray(this.fuels), data);
        total_ghg_emissions = this.getSum('total_ghg_emissions', data);
        total_ghg_emissions_intensity = this.getSum('total_ghg_emissions_intensity', data);
        total_usage = this.getSum('total_kbtu', data);
      }

      // what the heck is this?
      this.fixPercents(fuels, 'emissions');
      this.fixPercents(fuels, 'usage');
      var all_electric = fuels.filter(function (d) {
        return d.key == 'electricity';
      }).reduce(function (z, e) {
        return e.usage.pct > 99;
      }, false);
      var totals = {
        usage_raw: total_usage,
        usage: d3.format(',d')(d3.round(total_usage, 0)),
        emissions_raw: total_ghg_emissions,
        emissions: d3.format(',d')(d3.round(total_ghg_emissions, 0))
      };
      return {
        fuels: fuels,
        totals: totals,
        total_ghg_emissions: total_ghg_emissions,
        all_electric: all_electric,
        total_ghg_emissions_intensity: total_ghg_emissions_intensity,
        isCity: this.isCity,
        building_name: this.building_name,
        year: this.year,
        cars: this.formatters.fixedOne(total_ghg_emissions / this.TYPICAL_CAR_EMMISSION)
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
    findQuartile: function findQuartile(quartiles, value) {
      var i = 1;
      for (; i <= quartiles.length; i++) {
        if (value < quartiles[i - 1]) return i;
      }
      return i - 1;
    },
    renderEnergyConsumptionChart: function renderEnergyConsumptionChart(data, totals) {
      var parent = d3.select(this.viewParent).select('.energy-consumption-bar-chart-container');
      if (!parent.node()) return;
      var margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10
      };
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var width = outerWidth - margin.left - margin.right;
      var svg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));

      // Extra padding here for dynamic labels on either end of the bars
      var totalBarWidth = width * 0.7;
      var chartData = data.map(function (row, i) {
        return _objectSpread(_objectSpread({}, row), {}, {
          emissions: _objectSpread(_objectSpread({}, row.emissions), {}, {
            pctBefore: d3.sum(data.map(function (d, k) {
              return k >= i ? 0 : d.emissions.pct_actual;
            }))
          }),
          usage: _objectSpread(_objectSpread({}, row.usage), {}, {
            pctBefore: d3.sum(data.map(function (d, k) {
              return k >= i ? 0 : d.usage.pct_actual;
            }))
          })
        });
      });
      var labels = {
        emissions: {
          label: 'Resulting Emissions',
          labelUnits: '(% ghg)'
        },
        usage: {
          label: 'Energy Consumed',
          labelUnits: '(% kBtu)'
        }
      };
      var energyConsumedGroup = svg.append('g');
      this.renderBarChart(energyConsumedGroup, chartData, labels, totals, 10, width, totalBarWidth, 30, 'usage');
      var emissionsGroup = svg.append('g').attr('transform', "translate(0, 60)");
      this.renderBarChart(emissionsGroup, chartData, labels, totals, 15, width, totalBarWidth, 30, 'emissions');
    },
    renderBarChart: function renderBarChart(parent, data, labels, totals, yOffset, chartWidth, barWidth, barHeight, metric) {
      var chartGroup = parent.append('g').attr('transform', "translate(0, ".concat(yOffset, ")"));

      // Width of text on either side of bars
      var textWidth = (chartWidth - barWidth) / 2;
      var barStart = textWidth;
      var barGroup = chartGroup.append('g').attr('transform', "translate(".concat(barStart, ", 15)"));
      barGroup.selectAll('.bar-item').data(data).enter().append('rect').attr('class', function (d) {
        return d.key;
      }).classed('bar-item', true).attr('height', barHeight).attr('width', function (d) {
        return d[metric].pct_actual * barWidth;
      }).attr('x', function (d) {
        return d[metric].pctBefore * barWidth;
      });
      var labelGroup = chartGroup.append('g').classed('bar-chart-label', true).attr('transform', "translate(".concat(barStart - 5, ", 25)"));
      labelGroup.append('text').attr('x', 0).text(labels[metric].label).call(wrap, textWidth);
      labelGroup.selectAll('tspan').classed('bar-chart-label-name', true);
      labelGroup.select('text').append('tspan').attr('x', 0).attr('dy', '1.1em').text(labels[metric].labelUnits);
      var totalGroup = chartGroup.append('g').attr('transform', "translate(".concat(barStart + barWidth + 5, ", 25)"));
      var totalText = totalGroup.append('text').classed('bar-chart-total', true);
      totalText.append('tspan').attr('x', 0).classed('bar-chart-total-value', true).text(totals[metric]);
      totalText.append('tspan').attr('dx', '.25em').text(metric === 'usage' ? 'kBtu' : 'metric tons');
      var barLabels = chartGroup.append('g').attr('transform', "translate(0, 10)").classed('bar-labels', true);
      var barLabelText = barLabels.selectAll('.bar-label').data(data).enter().append('text').attr('class', function (d) {
        return d.key;
      }).classed('bar-label', true).attr('x', function (d) {
        return barStart + (d[metric].pctBefore + d[metric].pct_actual / 2) * barWidth;
      }).text(function (d) {
        if (metric === 'usage') return "".concat(d.label, " ").concat(d[metric].pct, "%");
        return "".concat(d[metric].pct, "%");
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
      var chartData = this.chartData();
      this.renderEnergyConsumptionChart(chartData.fuels, chartData.totals);
    }
  });
  return FuelUseView;
});