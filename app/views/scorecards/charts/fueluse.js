"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
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
        usage: d3.format(',d')(Math.round(total_usage)),
        emissions_raw: total_ghg_emissions,
        emissions: d3.format(',d')(Math.round(total_ghg_emissions))
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
    renderEnergyConsumptionChart: function renderEnergyConsumptionChart(data, totals) {
      var parent = d3.select(this.viewParent).select('.fueluse-chart');
      if (!parent.node()) return;
      var margin = {
        top: 25,
        right: 0,
        bottom: 25,
        left: 0
      };
      var outerWidth = parent.node().offsetWidth;
      var outerHeight = parent.node().offsetHeight;
      var width = outerWidth - margin.left - margin.right;
      var svg = parent.append('svg').attr('viewBox', "0 0 ".concat(outerWidth, " ").concat(outerHeight));
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
          label: 'Metric Tons',
          labelUnits: '(MT CO2e)',
          totalUnits: 'MT CO2e'
        },
        usage: {
          label: 'Energy Used',
          labelUnits: '(kBtu)',
          totalUnits: 'kBtu'
        }
      };
      var chartGroup = svg.append('g');
      var chartHeight = outerHeight - margin.top - margin.bottom;
      this.renderBarChart(chartGroup, chartData, labels, totals, width, chartHeight, margin);
    },
    renderBarChart: function renderBarChart(parent, data, labels, totals, chartWidth, chartHeight, margin) {
      var FONT_SIZE = 12;
      var X_AXIS_PADDING = 6;
      var PERCENTAGE_BOTTOM_PADDING = 3;
      var svg = parent.append('g').attr('transform', "translate(0, ".concat(margin.top + X_AXIS_PADDING + FONT_SIZE, ")"));
      var width = chartWidth;
      var height = chartHeight - margin.top - margin.bottom;
      var groups = ['emissions', 'usage'];
      var subgroups = _toConsumableArray(new Set(data.map(function (d) {
        return d.key;
      }).flat()));
      var chartData = data.reduce(function (acc, d) {
        var _d$emissions, _d$usage;
        acc.emissions[d.key] = d === null || d === void 0 ? void 0 : (_d$emissions = d.emissions) === null || _d$emissions === void 0 ? void 0 : _d$emissions.pct;
        acc.usage[d.key] = d === null || d === void 0 ? void 0 : (_d$usage = d.usage) === null || _d$usage === void 0 ? void 0 : _d$usage.pct;
        return acc;
      }, {
        emissions: {},
        usage: {}
      });
      chartData = Object.entries(chartData).reduce(function (acc, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        acc.push(_objectSpread({
          group: k
        }, v));
        return acc;
      }, []);

      // Add bottom X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).paddingInner([0.1]);
      var xAxisA = svg.append('g').attr('transform', "translate(0, ".concat(Number(height) + X_AXIS_PADDING, ")")).call(d3.axisBottom(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d;
        return "".concat((_labels$d = labels[d]) === null || _labels$d === void 0 ? void 0 : _labels$d.label);
      }));
      var xAxisB = svg.append('g').attr('transform', "translate(0, ".concat(Number(height) + X_AXIS_PADDING + FONT_SIZE, ")")).call(d3.axisBottom(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d2;
        return "".concat((_labels$d2 = labels[d]) === null || _labels$d2 === void 0 ? void 0 : _labels$d2.labelUnits);
      }));

      // Make the x axis line invisible
      xAxisA.select('.domain').attr('stroke', 'transparent');
      xAxisB.select('.domain').attr('stroke', 'transparent');

      // Add top X axis
      var xAxisTop = svg.append('g').attr('transform', "translate(0, ".concat(-1 * X_AXIS_PADDING, ")")).call(d3.axisTop(x).tickSize(0).tickSizeOuter(0).tickFormat(function (d) {
        var _labels$d3;
        return "".concat(totals[d], " ").concat((_labels$d3 = labels[d]) === null || _labels$d3 === void 0 ? void 0 : _labels$d3.totalUnits);
      }));

      // Make the x axis line invisible
      xAxisTop.select('.domain').attr('stroke', 'transparent');
      var ticks = svg.selectAll('.tick text');
      ticks.attr('class', 'fueluse-bar-axis-text text-chart');

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
      // svg.append('g').call(d3.axisLeft(y));

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      // Show the bars
      svg.append('g').selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData).enter().append('g').attr('class', function (d) {
        return "fueluse-bar fueluse-bar-".concat(d.key);
      }).selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) {
        return d;
      }).enter().append('rect').attr('x', function (d) {
        return x(d.data.group);
      }).attr('y', function (d) {
        return y(d[1]);
      }).attr('height', function (d) {
        return y(d[0]) - y(d[1]);
      }).attr('width', x.bandwidth());
      var EMISSIONS_INDEX = 0;
      var USAGE_INDEX = 1;

      // Emissions percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[EMISSIONS_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[EMISSIONS_INDEX][0]) - y(d[EMISSIONS_INDEX][1]);
        return y(d[EMISSIONS_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$EMISSIONS_INDEX, _d$EMISSIONS_INDEX$da;
        return "".concat((_d$EMISSIONS_INDEX = d[EMISSIONS_INDEX]) === null || _d$EMISSIONS_INDEX === void 0 ? void 0 : (_d$EMISSIONS_INDEX$da = _d$EMISSIONS_INDEX.data) === null || _d$EMISSIONS_INDEX$da === void 0 ? void 0 : _d$EMISSIONS_INDEX$da[d === null || d === void 0 ? void 0 : d.key], "%");
      });

      // Usage percentages
      svg.selectAll('.fueluse-bar').append('text').attr('class', 'text-tiny fueluse-bar-percentages').attr('font-size', FONT_SIZE).attr('x', function (d) {
        var barWidth = x.bandwidth();
        return x(d[USAGE_INDEX].data.group) + barWidth / 2;
      }).attr('y', function (d) {
        var height = y(d[USAGE_INDEX][0]) - y(d[USAGE_INDEX][1]);
        return y(d[USAGE_INDEX][1]) + height - PERCENTAGE_BOTTOM_PADDING;
      }).text(function (d) {
        var _d$USAGE_INDEX, _d$USAGE_INDEX$data;
        return "".concat((_d$USAGE_INDEX = d[USAGE_INDEX]) === null || _d$USAGE_INDEX === void 0 ? void 0 : (_d$USAGE_INDEX$data = _d$USAGE_INDEX.data) === null || _d$USAGE_INDEX$data === void 0 ? void 0 : _d$USAGE_INDEX$data[d === null || d === void 0 ? void 0 : d.key], "%");
      });
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