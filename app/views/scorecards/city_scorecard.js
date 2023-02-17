"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
define(['jquery', 'underscore', 'backbone', './charts/fueluse', './charts/shift', './charts/building_type_table', 'models/building_color_bucket_calculator', 'text!templates/scorecards/city.html'], function ($, _, Backbone, FuelUseView, ShiftView, BuildingTypeTableView, BuildingColorBucketCalculator, ScorecardTemplate) {
  var CityScorecard = Backbone.View.extend({
    initialize: function initialize(options) {
      this.state = options.state;
      this.formatters = options.formatters;
      this.parentEl = options.parentEl;
      this.template = _.template(ScorecardTemplate);
      return this;
    },
    events: {
      'click .sc-toggle--input': 'toggleView'
    },
    close: function close() {
      // do some house cleaning before being removed
    },
    toggleView: function toggleView(evt) {
      evt.preventDefault();
      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');
      var target = evt.target;
      var value = target.dataset.view;
      if (value === view) {
        return false;
      }
      scorecardState.set({
        'view': value
      });
    },
    onViewChange: function onViewChange() {
      this.render();
    },
    render: function render() {
      var _this = this;
      if (!this.state.get('city_report_active')) return;
      if (this.scoreCardData) return this.postRender();

      // load data from carto
      var city = this.state.get('city');
      var scorecardConfig = city.get('scorecard');
      var table = scorecardConfig.citywide.table;

      // Get building data for all years
      d3.json("https://cityenergy-seattle.carto.com/api/v2/sql?q=SELECT * FROM ".concat(table, " WHERE year is not null"), function (payload) {
        if (!_this.state.get('city_report_active')) return;
        if (!payload) {
          console.error('There was an error loading citywide data for the scorecard');
          return;
        }
        var data = {};
        payload.rows.forEach(function (d) {
          data[d.year] = _objectSpread({}, d);
        });
        _this.scoreCardData = data;
        _this.postRender();
      });
    },
    postRender: function postRender() {
      this.show('eui');
      this.show('ess');
    },
    validNumber: function validNumber(x) {
      return _.isNumber(x) && _.isFinite(x);
    },
    buildingStats: function buildingStats(data) {
      return {
        reporting: this.formatters.fixedZero(data.reporting),
        required: this.formatters.fixedZero(data.required),
        pct: data.compliance_rate
      };
    },
    compliance: function compliance(data) {
      return {
        consumption: this.formatters.fixedZero(data.total_consump),
        ghg: this.formatters.fixedZero(data.total_emissions),
        gfa: this.formatters.fixedZero(data.total_gfa)
      };
    },
    show: function show(view) {
      if (!this.scoreCardData) {
        return console.error('No city scorecard data found');
      }
      var buildings = this.state.get('allbuildings');
      var city = this.state.get('city');
      var years = _.keys(city.get('years')).map(function (d) {
        return +d;
      }).sort(function (a, b) {
        return a - b;
      });
      var year = this.state.get('year');
      var scorecardConfig = city.get('scorecard');
      var viewSelector = "#".concat(view, "-scorecard-view");
      var el = this.$el.find(viewSelector);
      var compareField = view === 'eui' ? 'med_eui' : 'med_ess';
      var data = this.scoreCardData;
      if (!data.hasOwnProperty(year)) {
        return console.error('No year found in citywide data!');
      }
      el.html(this.template({
        stats: this.buildingStats(data[year]),
        compliance: this.compliance(data[year]),
        year: year,
        view: view,
        value: data[year][compareField]
      }));
      if (!this.chart_fueluse) {
        this.chart_fueluse = new FuelUseView({
          formatters: this.formatters,
          data: data[year],
          isCity: true,
          parent: el[0]
        });
      }
      if (view === 'eui') {
        el.find('#fuel-use-chart').html(this.chart_fueluse.render());
      }
      if (!this.chart_shift) {
        var shiftConfig = scorecardConfig.change_chart.city;
        var previousYear = year - 1;
        var hasPreviousYear = years.indexOf(previousYear) > -1;
        var shift_data = hasPreviousYear ? this.extractChangeData(data, shiftConfig) : null;
        this.chart_shift = new ShiftView({
          view: view,
          formatters: this.formatters,
          data: shift_data,
          no_year: !hasPreviousYear,
          selected_year: year,
          previous_year: previousYear,
          isCity: true
        });
      }
      if (view === 'eui' && this.chart_shift) {
        this.chart_shift.render(function (t) {
          el.find('#compare-shift-chart').html(t);
        }, viewSelector);
      }
      if (!this.building_table) {
        this.building_table = new BuildingTypeTableView({
          formatters: this.formatters,
          data: buildings,
          year: year,
          schema: scorecardConfig.thresholds.eui_schema,
          thresholds: scorecardConfig.thresholds.eui
        });
      }
      el.find('#building-type-table').html(this.building_table.render());
      return this;
    },
    extractChangeData: function extractChangeData(data, config) {
      var _this2 = this;
      var o = [];
      Object.keys(data).forEach(function (year) {
        var bldings = data[year];
        config.metrics.forEach(function (metric) {
          var label = '';
          if (metric.label.charAt(0) === '{') {
            var labelKey = metric.label.replace(/\{|\}/gi, '');
            label = bldings[labelKey];
          } else {
            label = metric.label;
          }
          var value = bldings[metric.field];
          if (!_this2.validNumber(value)) {
            value = null;
          } else {
            value = +value.toFixed(1);
          }
          var clr = '#999';
          o.push({
            label: label,
            field: metric.field,
            value: value,
            clr: clr,
            year: +year,
            colorize: metric.colorize,
            unit: metric.unit || '',
            influencer: metric.influencer
          });
        });
      });
      return o.sort(function (a, b) {
        return a.year - b.year;
      });
    }
  });
  return CityScorecard;
});