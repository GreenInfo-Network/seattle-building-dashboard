"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
define(['jquery', 'underscore', 'backbone', 'd3', './building_scorecard', 'text!templates/scorecards/scorecard.html'], function ($, _, Backbone, d3, BuildingScorecard, ScorecardTemplate) {
  var ScorecardController = Backbone.View.extend({
    el: $('#scorecard'),
    initialize: function initialize(options) {
      this.state = options.state;
      this.mapView = options.mapView;
      this.listenTo(this.state, 'change:allbuildings', this.onBuildingsChange);
      this.listenTo(this.state, 'change:report_active', this.onBuildingReportActive);
      this.listenTo(this.state, 'change:tab', this.setTabClasses);
      var scorecard = this.state.get('scorecard');
      this.listenTo(scorecard, 'change:view', this.onViewChange);
      this.template = _.template(ScorecardTemplate);
      this.formatters = {
        currency: d3.format('$,.2f'),
        currency_zero: d3.format('$,.0f'),
        commaize: d3.format(',.2r'),
        percent: d3.format('.0%'),
        fixed: d3.format(',.2f'),
        fixedOne: d3.format(',.1f'),
        fixedZero: d3.format(',.0f'),
        abbreviate: function abbreviate(n, fmtr) {
          if (n >= 1000000) {
            return [fmtr(n / 1000000), 'million'];
          }
          if (n > 1000) {
            return [fmtr(n / 1000), 'thousand'];
          }
          return fmtr(n, '');
        }
      };
    },
    events: {
      'click #back-to-map-link': 'closeReport',
      'click .scorecard-tab-click': 'setTab',
      'click #share-link': 'copyUrl'
    },
    copyUrl: function copyUrl() {
      var url = window.location.href;
      try {
        // This will only work in a prod env with https
        navigator.clipboard.writeText(url);
      } catch (err) {
        console.warn(err);
      }
    },
    onBuildingsChange: function onBuildingsChange() {
      if (this.dirty) this.render();
    },
    onViewChange: function onViewChange() {
      this.updateViewClass();
      if (this.view && this.view.onViewChange) this.view.onViewChange();
    },
    updateViewClass: function updateViewClass() {
      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');
      var klass = "show-".concat(view, "-view");
      this.$el.attr('class', "active ".concat(klass));
    },
    onBuildingReportActive: function onBuildingReportActive() {
      this.activekey = 'report_active';
      this.viewclass = BuildingScorecard;
      // Set initial tab on load
      if (this.state.get('report_active') === true) {
        this.state.set({
          tab: 'benchmarking_overview'
        });
      }
      this.render();
    },
    showComparisonView: function showComparisonView(evt) {
      evt.preventDefault();
      this.state.trigger('clearMapPopup');
      this.state.set(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, this.activekey, false), "building", null), "building_compare_active", true), "tab", null));
    },
    setTab: function setTab(evt) {
      var _evt$target;
      var nextTab = evt === null || evt === void 0 || (_evt$target = evt.target) === null || _evt$target === void 0 ? void 0 : _evt$target.id;
      if (!nextTab) return;
      // set state
      this.state.set({
        tab: nextTab
      });
    },
    setTabClasses: function setTabClasses() {
      var activeTab = this.state.get('tab');

      // set classes on tabs
      var tabs = ['benchmarking_overview', 'emissions_targets', 'energy_targets'];
      var inActiveTabs = tabs.filter(function (t) {
        return t !== activeTab;
      });
      var activeEl = $("div#".concat(activeTab));
      activeEl.addClass('active');
      var _iterator = _createForOfIteratorHelper(inActiveTabs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          var inactiveEl = $("div#".concat(id));
          inactiveEl.removeClass('active');
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    closeReport: function closeReport(evt) {
      evt.preventDefault();
      this.state.set(_defineProperty(_defineProperty({}, this.activekey, false), "tab", null));
    },
    toggleView: function toggleView(evt) {
      evt.preventDefault();
      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');
      var target = evt.target;
      var value = target.dataset.view;
      if (value === view) {
        evt.preventDefault();
        return false;
      }
      scorecardState.set({
        view: value
      });
    },
    loadView: function loadView(view) {
      this.removeView();
      this.view = view;
      this.view.render();
    },
    removeView: function removeView() {
      if (this.view) {
        this.view.close();
        this.view.remove();
      }
      this.view = null;
    },
    getSubViewOptions: function getSubViewOptions() {
      return {
        el: '#scorecard-content',
        state: this.state,
        formatters: this.formatters,
        metricFilters: this.mapView.getControls(),
        parentEl: this.$el
      };
    },
    showScorecard: function showScorecard() {
      this.$el.toggleClass('active', true);
      var building = this.state.get('building');
      var name;
      var building_type;
      var energy_star_score;
      var comments;
      var isBuildingRenderer = this.viewclass === BuildingScorecard;
      var year;
      if (isBuildingRenderer) {
        year = this.state.get('year');
        var buildings = this.state.get('allbuildings');
        var buildingModel = buildings.get(building);
        name = buildingModel.get('property_name');
        building_type = buildingModel.get('property_type');
        energy_star_score = buildingModel.get('energy_star_score');
        comments = buildingModel.get('comments');
      } else {
        name = 'Citywide Report';
        building_type = 'citywide';
      }
      this.$el.html(this.template({
        building_view: this.viewclass === BuildingScorecard,
        comments: comments,
        name: name,
        energy_star_score: energy_star_score,
        year: year,
        tab: this.state.get('tab')
      }));
      this.updateViewClass();
      if (!this.viewclass) return;
      var view = new this.viewclass(this.getSubViewOptions());
      this.loadView(view);
    },
    hideScorecard: function hideScorecard() {
      this.$el.toggleClass('active', false);
      this.removeView();
      this.viewclass = null;
      this.$el.html('');
    },
    render: function render() {
      var buildings = this.state.get('allbuildings');
      var active = this.state.get(this.activekey);
      if (active) {
        if (!buildings) {
          this.dirty = true;
          return;
        }
        this.showScorecard();
      } else {
        this.hideScorecard();
      }
      this.dirty = false;
      this.setTabClasses();
      return this;
    }
  });
  return ScorecardController;
});