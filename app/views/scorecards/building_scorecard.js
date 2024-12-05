"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
define(['jquery', 'underscore', 'backbone', 'd3', '../../../lib/wrap', './charts/fueluse', './charts/beps', './charts/use_types', './charts/performance_over_time', './charts/first_ghgi_target', './charts/first_compliance_interval', './charts/comments', 'text!templates/scorecards/building.html'], function ($, _, Backbone, d3, wrap, FuelUseView, BepsView, UseTypesView, PerformanceOverTimeView, FirstGhgiTargetView, FirstComplianceIntervalView, CommentView, BuildingTemplate) {
  var BuildingScorecard = Backbone.View.extend({
    initialize: function initialize(options) {
      var _this = this;
      this.state = options.state;
      this.formatters = options.formatters;
      this.metricFilters = options.metricFilters;
      this.parentEl = options.parentEl;
      this.templateArgs = {};
      this.template = _.template(BuildingTemplate);
      this.listenTo(this.state, 'change:tab', this.onChangeTab);

      // Re-render when re-sizing
      $(window).on('resize', function () {
        _this.render();
      });

      // This re-renders all charts on print
      if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        var that = this;
        mediaQueryList.addListener(function (mql) {
          if (mql.matches) {
            that.render();
          } else {
            that.render();
          }
        });
      }
      this.charts = {};
      return this;
    },
    events: {
      'click .building-main-overview-button': 'onClickOut'
    },
    onClickOut: function onClickOut(evt) {
      var _evt$target;
      var nextTab = evt === null || evt === void 0 || (_evt$target = evt.target) === null || _evt$target === void 0 ? void 0 : _evt$target.id;
      if (!nextTab) return;
      this.state.set({
        tab: nextTab
      });
    },
    onChangeTab: function onChangeTab() {
      this.render();
    },
    close: function close() {
      this.scoreCardData = null;
    },
    onViewChange: function onViewChange() {
      this.render();
    },
    render: function render() {
      var _this2 = this;
      if (!this.state.get('report_active')) return;
      var id = this.state.get('building');
      var year = this.state.get('year');
      var buildings = this.state.get('allbuildings');
      var city = this.state.get('city');
      var table = city.get('table_name');
      var years = _.keys(city.get('years')).map(function (d) {
        return +d;
      }).sort(function (a, b) {
        return a - b;
      }).concat(['2023']);
      if (this.scoreCardData && this.scoreCardData.id === id) {
        this.show(buildings, this.scoreCardData.data, year, years);
      } else {
        var yearWhereClause = years.reduce(function (a, b) {
          if (!a.length) return "year=".concat(b);
          return a + " OR year=".concat(b);
        }, '');

        // Get building data for all years
        d3.json("https://cityenergy-seattle.carto.com/api/v2/sql?q=SELECT+ST_X(the_geom)+AS+lng%2C+ST_Y(the_geom)+AS+lat%2C*+FROM+".concat(table, "+WHERE+id=").concat(id, " AND(").concat(yearWhereClause, ")"), function (payload) {
          if (!_this2.state.get('report_active')) return;
          if (!payload) {
            console.error('There was an error loading building data for the scorecard');
            return;
          }
          var data = {};
          payload.rows.forEach(function (d) {
            data[d.year] = _objectSpread({}, d);
          });
          _this2.scoreCardData = {
            id: _this2.state.get('building'),
            data: data
          };
          _this2.show(buildings, data, year, years);
        });
      }
    },
    show: function show(buildings, building_data, selected_year, avail_years) {
      this.processBuilding(buildings, building_data, selected_year, avail_years);
    },
    getViewField: function getViewField(view) {
      return view === 'eui' ? 'site_eui_wn' : 'energy_star_score';
    },
    energyStarCertified: function energyStarCertified(view, building, config) {
      if (view === 'eui') return false;
      var certifiedField = config.certified_field || null;
      if (certifiedField === null) return false;
      return !!building[certifiedField];
    },
    processBuilding: function processBuilding(buildings, building_data, selected_year, avail_years) {
      var _this$charts$eui$char,
        _this$charts$eui,
        _this$charts$eui$char2,
        _this$charts$eui2,
        _this$charts$eui$char3,
        _this$charts$eui3,
        _this$charts$eui$char4,
        _this$charts$eui4,
        _this$charts$eui$char5,
        _this$charts$eui5,
        _this$charts$eui$char6,
        _this$charts$eui6,
        _building$beps_firstc,
        _this3 = this;
      var building = building_data[selected_year];
      var name = building.property_name;

      // for building details first card "energy per square foot"
      var site_eui_wn = building.site_eui_wn || 0;

      // for building details second card "emissions per square foot"
      var total_ghg = building.total_ghg_emissions_intensity || 0;
      var config = this.state.get('city').get('scorecard');
      var viewSelector = "#scorecard-view";
      var el = this.$el.find(viewSelector);
      var bepstarget_2031 = building.bepstarget_2031,
        bepstarget_2036 = building.bepstarget_2036,
        bepstarget_2041 = building.bepstarget_2041,
        bepstarget_2046 = building.bepstarget_2046;

      // CHARTS
      // set chart hash
      if (!this.charts.hasOwnProperty('eui')) this.charts['eui'] = {};
      var showCharts = {
        fueluse: false,
        beps: false
      };

      // Fueluse
      if (!this.charts['eui'].chart_fueluse) {
        this.charts['eui'].chart_fueluse = new FuelUseView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          parent: el[0]
        });
        this.charts['eui'].chart_fueluse.chartData();
      }
      showCharts.fueluse = (_this$charts$eui$char = (_this$charts$eui = this.charts['eui']) === null || _this$charts$eui === void 0 || (_this$charts$eui = _this$charts$eui.chart_fueluse) === null || _this$charts$eui === void 0 ? void 0 : _this$charts$eui.showChart) !== null && _this$charts$eui$char !== void 0 ? _this$charts$eui$char : false;

      // BEPs
      if (!this.charts['eui'].chart_beps) {
        this.charts['eui'].chart_beps = new BepsView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          parent: el[0]
        });
        this.charts['eui'].chart_beps.chartData();
      }
      showCharts.beps = (_this$charts$eui$char2 = (_this$charts$eui2 = this.charts['eui']) === null || _this$charts$eui2 === void 0 || (_this$charts$eui2 = _this$charts$eui2.chart_beps) === null || _this$charts$eui2 === void 0 ? void 0 : _this$charts$eui2.showChart) !== null && _this$charts$eui$char2 !== void 0 ? _this$charts$eui$char2 : false;

      // Building use types
      if (!this.charts['eui'].chart_use_types) {
        this.charts['eui'].chart_use_types = new UseTypesView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          parent: el[0]
        });
        this.charts['eui'].chart_use_types.chartData();
      }
      showCharts.use_types = (_this$charts$eui$char3 = (_this$charts$eui3 = this.charts['eui']) === null || _this$charts$eui3 === void 0 || (_this$charts$eui3 = _this$charts$eui3.chart_use_types) === null || _this$charts$eui3 === void 0 ? void 0 : _this$charts$eui3.showChart) !== null && _this$charts$eui$char3 !== void 0 ? _this$charts$eui$char3 : false;

      // Performance over time
      if (!this.charts['eui'].chart_performance_over_time) {
        // avail_years comes from seattle.json and shows all available years
        // we want all years for this building
        var building_years = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });
        var shiftConfig = config.change_chart.building;
        var previousYear = building_years[0];

        // by definition, we should always have a previous year, or else a single year of data
        // so how can no_year be a condition?
        var hasPreviousYear = previousYear !== selected_year;
        var change_data = hasPreviousYear ? this.extractChangeData(building_data, buildings, building, shiftConfig) : null;

        // trap case where there is a range of only one year, send to the view for rendering an error
        var single_year = building_years.length === 1;
        this.charts['eui'].chart_performance_over_time = new PerformanceOverTimeView({
          formatters: this.formatters,
          data: change_data,
          no_year: !hasPreviousYear,
          single_year: single_year,
          previous_year: previousYear,
          selected_year: selected_year,
          view: 'eui',
          parent: el[0]
        });
        this.charts['eui'].chart_performance_over_time.chartData();
      }
      showCharts.performance_over_time = (_this$charts$eui$char4 = (_this$charts$eui4 = this.charts['eui']) === null || _this$charts$eui4 === void 0 || (_this$charts$eui4 = _this$charts$eui4.chart_performance_over_time) === null || _this$charts$eui4 === void 0 ? void 0 : _this$charts$eui4.showChart) !== null && _this$charts$eui$char4 !== void 0 ? _this$charts$eui$char4 : false;

      // First GHGI target
      if (!this.charts['eui'].chart_first_ghgi_target) {
        var _building_years = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });
        var latestYear = _building_years[_building_years.length - 1];
        this.charts['eui'].chart_first_ghgi_target = new FirstGhgiTargetView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          latestYear: latestYear,
          parent: el[0]
        });
        this.charts['eui'].chart_first_ghgi_target.chartData();
      }
      showCharts.first_ghgi_target = (_this$charts$eui$char5 = (_this$charts$eui5 = this.charts['eui']) === null || _this$charts$eui5 === void 0 || (_this$charts$eui5 = _this$charts$eui5.chart_first_ghgi_target) === null || _this$charts$eui5 === void 0 ? void 0 : _this$charts$eui5.showChart) !== null && _this$charts$eui$char5 !== void 0 ? _this$charts$eui$char5 : false;

      // First compliance interval
      // render first compliance interval chart (first_compliance_interval.js)
      if (!this.charts['eui'].chart_first_compliance_interval) {
        var _building_years2 = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });
        var _latestYear = _building_years2[_building_years2.length - 1];
        this.charts['eui'].chart_first_compliance_interval = new FirstComplianceIntervalView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          latestYear: _latestYear,
          parent: el[0]
        });
        this.charts['eui'].chart_first_compliance_interval.chartData();
      }
      showCharts.first_compliance_interval = (_this$charts$eui$char6 = (_this$charts$eui6 = this.charts['eui']) === null || _this$charts$eui6 === void 0 || (_this$charts$eui6 = _this$charts$eui6.chart_first_compliance_interval) === null || _this$charts$eui6 === void 0 ? void 0 : _this$charts$eui6.showChart) !== null && _this$charts$eui$char6 !== void 0 ? _this$charts$eui$char6 : false;
      var firstComplianceYear = Number((_building$beps_firstc = building === null || building === void 0 ? void 0 : building.beps_firstcomplianceyear) !== null && _building$beps_firstc !== void 0 ? _building$beps_firstc : 2031);
      var yearWindowShift = firstComplianceYear - 2031;
      var targetYears = {
        // Note that bepstarget_2027 is not a real field
        bepstarget_2031: 2031 + yearWindowShift,
        bepstarget_2036: 2036 + yearWindowShift,
        bepstarget_2041: 2041 + yearWindowShift,
        bepstarget_2046: 2046 + yearWindowShift
      };
      var getSfText = function getSfText() {
        var _building$largestprop, _building$secondlarge, _building$thirdlarges;
        function numberWithCommas(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        var totalGfa = ((_building$largestprop = building === null || building === void 0 ? void 0 : building.largestpropertyusetypegfa) !== null && _building$largestprop !== void 0 ? _building$largestprop : 0) + ((_building$secondlarge = building === null || building === void 0 ? void 0 : building.secondlargestpropertyusetypegfa) !== null && _building$secondlarge !== void 0 ? _building$secondlarge : 0) + ((_building$thirdlarges = building === null || building === void 0 ? void 0 : building.thirdlargestpropertyusetypegfa) !== null && _building$thirdlarges !== void 0 ? _building$thirdlarges : 0);
        var amounts = [[0, 20000], [20001, 30000], [30001, 50000], [50001, 90000], [90001, 220000], [220000]];
        var relevantAmounts = amounts.find(function (range) {
          return range[0] <= totalGfa && (!range[1] || range[1] >= totalGfa);
        });
        if (!relevantAmounts) return '';
        var relevantAmountsText = relevantAmounts.map(numberWithCommas);
        var rangeText = "";
        if (relevantAmounts === amounts[0]) {
          rangeText = "for Buildings < ".concat(relevantAmountsText[1], " SF");
        } else if (relevantAmounts === amounts[amounts.length - 1]) {
          rangeText = "for Buildings > ".concat(relevantAmountsText[0], " SF");
        } else {
          rangeText = "for Buildings ".concat(relevantAmountsText[0], "-").concat(relevantAmountsText[1], " SF");
        }
        return rangeText;
      };
      this.templateArgs = {
        active: 'active',
        name: name,
        addr1: building.reported_address,
        addr2: this.addressLine2(building),
        year: selected_year,
        year_built: building.yearbuilt,
        ess_logo: this.energyStarCertified('eui', building, config),
        site_eui_wn: Number(site_eui_wn).toFixed(1),
        total_ghg: Number(total_ghg).toFixed(2),
        tab: this.state.get('tab'),
        bepstarget_2031: bepstarget_2031,
        bepstarget_2036: bepstarget_2036,
        bepstarget_2041: bepstarget_2041,
        bepstarget_2046: bepstarget_2046,
        // Since the fields above are windows, each building has specific years in those windows
        targetYears: targetYears,
        cbpsFlag: building.cbps_flag && building.cbpseuitarget,
        // show chart flags
        showCharts: showCharts,
        sfRangeText: getSfText()
      };
      el.html(this.template(this.templateArgs));

      // Render charts

      // render fuel use chart (fueluse.js)
      el.find('#fueluse-chart').html(this.charts['eui'].chart_fueluse.render());
      this.charts['eui'].chart_fueluse.afterRender();

      // render BEPs chart (beps.js)
      el.find('#beps-chart').html(this.charts['eui'].chart_beps.render());
      this.charts['eui'].chart_beps.afterRender();

      // render building use type chart (use_types.js)
      el.find('#use-types-chart').html(this.charts['eui'].chart_use_types.render());
      this.charts['eui'].chart_use_types.afterRender();

      // render performance over time chart (performance_over_time.js)
      el.find('#performance-over-time-chart').html(this.charts['eui'].chart_performance_over_time.render());
      this.charts['eui'].chart_performance_over_time.afterRender();

      // render first ghgi target chart (first_ghgi_target.js)

      el.find('#first-ghgi-target-chart').html(this.charts['eui'].chart_first_ghgi_target.render());
      this.charts['eui'].chart_first_ghgi_target.afterRender();

      // render first compliance interval chart (first_compliance_interval.js)
      el.find('#first-compliance-interval-chart').html(this.charts['eui'].chart_first_compliance_interval.render());
      this.charts['eui'].chart_first_compliance_interval.afterRender();

      // Add building comments (??)
      if (!this.commentview) {
        this.commentview = new CommentView({
          building: building
        });
        this.commentview.render(function (markup) {
          _this3.parentEl.find('#building-comments').html(markup);
        });
      }
    },
    addressLine2: function addressLine2(building) {
      var city = building.city;
      var state = building.state;
      var zip = building.zip;
      var addr = city;
      if (state) {
        addr += ' ' + state;
      }
      if (zip) {
        addr += ' ' + zip;
      }
      return addr;
    },
    validNumber: function validNumber(x) {
      return _.isNumber(x) && _.isFinite(x);
    },
    extractChangeData: function extractChangeData(yearly, buildings, building, config) {
      var _this4 = this;
      var o = [];
      Object.keys(yearly).forEach(function (year) {
        var bldings = yearly[year];
        config.metrics.forEach(function (metric) {
          var id = '';
          var label = '';
          if (metric.label.charAt(0) === '{') {
            var labelKey = metric.label.replace(/\{|\}/gi, '');
            label = bldings[labelKey];
            id = 'building';
          } else {
            id = 'average';
            label = metric.label;
          }
          var value = bldings[metric.field];
          if (!_this4.validNumber(value)) {
            value = null;
          } else {
            value = +value.toFixed(1);
          }
          o.push({
            id: id,
            label: label,
            field: metric.field,
            value: value,
            year: +year,
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
  return BuildingScorecard;
});