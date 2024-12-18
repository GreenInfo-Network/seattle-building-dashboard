define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  './building_scorecard',
  'text!templates/scorecards/scorecard.html'
], function ($, _, Backbone, d3, BuildingScorecard, ScorecardTemplate) {
  const ScorecardController = Backbone.View.extend({
    el: $('#scorecard'),

    initialize: function (options) {
      this.state = options.state;
      this.mapView = options.mapView;

      this.listenTo(this.state, 'change:allbuildings', this.onBuildingsChange);
      this.listenTo(
        this.state,
        'change:report_active',
        this.onBuildingReportActive
      );

      this.listenTo(this.state, 'change:tab', this.setTabClasses);

      const scorecard = this.state.get('scorecard');
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
        abbreviate: (n, fmtr) => {
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

    copyUrl: function () {
      const url = window.location.href;
      try {
        // This will only work in a prod env with https
        navigator.clipboard.writeText(url);
      } catch (err) {
        console.warn(err);
      }
    },

    onBuildingsChange: function () {
      if (this.dirty) this.render();
    },

    onViewChange: function () {
      this.updateViewClass();
      if (this.view && this.view.onViewChange) this.view.onViewChange();
    },

    updateViewClass: function () {
      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');

      const klass = `show-${view}-view`;

      this.$el.attr('class', `active ${klass}`);
    },

    onBuildingReportActive: function () {
      this.activekey = 'report_active';
      this.viewclass = BuildingScorecard;
      // Set initial tab on load
      if (this.state.get('report_active') === true) {
        const initialTab = this.state.get('tab') ?? 'benchmarking_overview';
        this.state.set({ tab: initialTab });
      }
      this.render();
    },

    showComparisonView: function (evt) {
      evt.preventDefault();
      this.state.trigger('clearMapPopup');
      this.state.set({
        [this.activekey]: false,
        building: null,
        building_compare_active: true,
        tab: null
      });
    },

    setTab: function (evt) {
      const nextTab = evt?.target?.id;
      if (!nextTab) return;
      // set state
      this.state.set({ tab: nextTab });
    },

    setTabClasses: function () {
      const activeTab = this.state.get('tab');

      // set classes on tabs
      const tabs = [
        'benchmarking_overview',
        'emissions_targets',
        'energy_targets'
      ];
      const inActiveTabs = tabs.filter(t => t !== activeTab);

      const activeEl = $(`div#${activeTab}`);
      activeEl.addClass('active');

      for (const id of inActiveTabs) {
        const inactiveEl = $(`div#${id}`);
        inactiveEl.removeClass('active');
      }
    },

    closeReport: function (evt) {
      evt.preventDefault();
      this.state.set({ [this.activekey]: false, tab: null });
    },

    toggleView: function (evt) {
      evt.preventDefault();

      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');

      var target = evt.target;
      var value = target.dataset.view;

      if (value === view) {
        evt.preventDefault();
        return false;
      }

      scorecardState.set({ view: value });
    },

    loadView: function (view) {
      this.removeView();
      this.view = view;

      this.view.render();
    },

    removeView: function () {
      if (this.view) {
        this.view.close();
        this.view.remove();
      }
      this.view = null;
    },

    getSubViewOptions: function () {
      return {
        el: '#scorecard-content',
        state: this.state,
        formatters: this.formatters,
        metricFilters: this.mapView.getControls(),
        parentEl: this.$el
      };
    },

    showScorecard: function () {
      this.$el.toggleClass('active', true);

      const building = this.state.get('building');
      let name;
      let building_type;
      let energy_star_score;
      let comments;
      const isBuildingRenderer = this.viewclass === BuildingScorecard;
      let year;

      if (isBuildingRenderer) {
        year = this.state.get('year');
        const buildings = this.state.get('allbuildings');
        const buildingModel = buildings.get(building);
        name = buildingModel.get('property_name');
        building_type = buildingModel.get('property_type');
        energy_star_score = buildingModel.get('energy_star_score');
        comments = buildingModel.get('comments');
      } else {
        name = 'Citywide Report';
        building_type = 'citywide';
      }

      this.$el.html(
        this.template({
          building_view: this.viewclass === BuildingScorecard,
          comments,
          name,
          energy_star_score,
          year,
          tab: this.state.get('tab')
        })
      );

      this.updateViewClass();

      if (!this.viewclass) return;
      const view = new this.viewclass(this.getSubViewOptions());
      this.loadView(view);
    },

    hideScorecard: function () {
      this.$el.toggleClass('active', false);
      this.removeView();
      this.viewclass = null;
      this.$el.html('');
    },

    render: function () {
      const buildings = this.state.get('allbuildings');
      const active = this.state.get(this.activekey);

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
