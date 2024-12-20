define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../lib/wrap',
  './charts/fueluse',
  './charts/beps',
  './charts/use_types',
  './charts/performance_over_time',
  './charts/first_ghgi_target',
  './charts/first_compliance_interval',
  './charts/comments',
  'text!templates/scorecards/building.html'
], function (
  $,
  _,
  Backbone,
  d3,
  wrap,
  FuelUseView,
  BepsView,
  UseTypesView,
  PerformanceOverTimeView,
  FirstGhgiTargetView,
  FirstComplianceIntervalView,
  CommentView,
  BuildingTemplate
) {
  var BuildingScorecard = Backbone.View.extend({
    initialize: function (options) {
      this.state = options.state;
      this.formatters = options.formatters;
      this.metricFilters = options.metricFilters;
      this.parentEl = options.parentEl;
      this.templateArgs = {};
      this.template = _.template(BuildingTemplate);

      this.listenTo(this.state, 'change:tab', this.onChangeTab);

      // Re-render when re-sizing
      $(window).on('resize', () => {
        this.render();
      });

      // This re-renders all charts on print
      if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        const that = this;
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

    onClickOut: function (evt) {
      const nextTab = evt?.target?.id;
      if (!nextTab) return;
      this.state.set({ tab: nextTab });
    },

    onChangeTab: function () {
      this.render();
    },

    close: function () {
      this.scoreCardData = null;
    },

    onViewChange: function () {
      this.render();
    },

    render: function () {
      if (!this.state.get('report_active')) return;

      var id = this.state.get('building');
      var year = this.state.get('year');
      var buildings = this.state.get('allbuildings');

      var city = this.state.get('city');
      var table = city.get('table_name');
      var years = _.keys(city.get('years'))
        .map(d => +d)
        .sort((a, b) => {
          return a - b;
        })
        .concat(['2023']);

      if (this.scoreCardData && this.scoreCardData.id === id) {
        this.show(buildings, this.scoreCardData.data, year, years);
      } else {
        const yearWhereClause = years.reduce((a, b) => {
          if (!a.length) return `year=${b}`;
          return a + ` OR year=${b}`;
        }, '');

        // Get building data for all years
        d3.json(
          `https://cityenergy-seattle.carto.com/api/v2/sql?q=SELECT+ST_X(the_geom)+AS+lng%2C+ST_Y(the_geom)+AS+lat%2C*+FROM+${table}+WHERE+id=${id} AND(${yearWhereClause})`,
          payload => {
            if (!this.state.get('report_active')) return;

            if (!payload) {
              console.error(
                'There was an error loading building data for the scorecard'
              );
              return;
            }

            var data = {};
            payload.rows.forEach(d => {
              data[d.year] = { ...d };
            });

            this.scoreCardData = {
              id: this.state.get('building'),
              data
            };

            this.show(buildings, data, year, years);
          }
        );
      }
    },

    show: function (buildings, building_data, selected_year, avail_years) {
      this.processBuilding(
        buildings,
        building_data,
        selected_year,
        avail_years
      );
    },

    getViewField: function (view) {
      return view === 'eui' ? 'site_eui_wn' : 'energy_star_score';
    },

    energyStarCertified: function (view, building, config) {
      if (view === 'eui') return false;

      const certifiedField = config.certified_field || null;

      if (certifiedField === null) return false;

      return !!building[certifiedField];
    },

    processBuilding: function (
      buildings,
      building_data,
      selected_year,
      avail_years
    ) {
      var building = building_data[selected_year];
      var name = building.property_name;

      // for building details first card "energy per square foot"
      var site_eui_wn = building.site_eui_wn || 0;

      // for building details second card "emissions per square foot"
      var total_ghg = building.total_ghg_emissions_intensity || 0;

      var config = this.state.get('city').get('scorecard');

      var viewSelector = `#scorecard-view`;
      var el = this.$el.find(viewSelector);

      var {
        bepstarget_2031,
        bepstarget_2036,
        bepstarget_2041,
        bepstarget_2046
      } = building;

      // CHARTS
      // set chart hash
      if (!this.charts.hasOwnProperty('eui')) this.charts['eui'] = {};

      const showCharts = {
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
      showCharts.fueluse =
        this.charts['eui']?.chart_fueluse?.showChart ?? false;

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
      showCharts.beps = this.charts['eui']?.chart_beps?.showChart ?? false;

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
      showCharts.use_types =
        this.charts['eui']?.chart_use_types?.showChart ?? false;

      // Performance over time
      if (!this.charts['eui'].chart_performance_over_time) {
        // avail_years comes from seattle.json and shows all available years
        // we want all years for this building
        let building_years = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });

        var shiftConfig = config.change_chart.building;
        var previousYear = building_years[0];

        // by definition, we should always have a previous year, or else a single year of data
        // so how can no_year be a condition?
        var hasPreviousYear = previousYear !== selected_year;

        const change_data = hasPreviousYear
          ? this.extractChangeData(
              building_data,
              buildings,
              building,
              shiftConfig
            )
          : null;

        // trap case where there is a range of only one year, send to the view for rendering an error
        const single_year = building_years.length === 1;

        this.charts['eui'].chart_performance_over_time =
          new PerformanceOverTimeView({
            formatters: this.formatters,
            data: change_data,
            no_year: !hasPreviousYear,
            single_year: single_year,
            previous_year: previousYear,
            selected_year,
            view: 'eui',
            parent: el[0]
          });
        this.charts['eui'].chart_performance_over_time.chartData();
      }

      showCharts.performance_over_time =
        this.charts['eui']?.chart_performance_over_time?.showChart ?? false;

      // First GHGI target
      if (!this.charts['eui'].chart_first_ghgi_target) {
        let building_years = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });

        const latestYear = building_years[building_years.length - 1];

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

      showCharts.first_ghgi_target =
        this.charts['eui']?.chart_first_ghgi_target?.showChart ?? false;

      // First compliance interval
      // render first compliance interval chart (first_compliance_interval.js)
      if (!this.charts['eui'].chart_first_compliance_interval) {
        let building_years = Object.keys(building_data).sort(function (a, b) {
          return parseInt(a) - parseInt(b);
        });

        const latestYear = building_years[building_years.length - 1];

        this.charts['eui'].chart_first_compliance_interval =
          new FirstComplianceIntervalView({
            formatters: this.formatters,
            data: [building],
            name: name,
            year: selected_year,
            latestYear: latestYear,
            parent: el[0]
          });
        this.charts['eui'].chart_first_compliance_interval.chartData();
      }

      showCharts.first_compliance_interval =
        this.charts['eui']?.chart_first_compliance_interval?.showChart ?? false;

      const getSfText = () => {
        function numberWithCommas(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        const totalGfa = building?.propertygfabuildings ?? 0;

        const amounts = [
          [0, 20000],
          [20001, 30000],
          [30001, 50000],
          [50001, 90000],
          [90001, 220000],
          [220000]
        ];

        let relevantAmounts = amounts.find(
          range => range[0] <= totalGfa && (!range[1] || range[1] >= totalGfa)
        );

        if (!relevantAmounts) return '';

        const relevantAmountsText = relevantAmounts.map(numberWithCommas);

        let rangeText = ``;

        if (relevantAmounts === amounts[0]) {
          rangeText = `< ${relevantAmountsText[1]}`;
        } else if (relevantAmounts === amounts[amounts.length - 1]) {
          rangeText = `> ${relevantAmountsText[0]}`;
        } else {
          rangeText = `${relevantAmountsText[0]}-${relevantAmountsText[1]}`;
        }
        return rangeText;
      };

      const sfRangeText = getSfText();

      const firstComplianceYear = Number(
        building?.beps_firstcomplianceyear ?? 2031
      );

      const reporting2027ByFirstComplianceYear = {
        2031: 2027,
        2032: 2027,
        2033: 2028,
        2034: 2029,
        2035: 2030
      };

      const yearWindowShift = firstComplianceYear - 2031;

      const targetYears = {
        // Note that bepstarget_2027 is not a real field
        bepstarget_2027:
          reporting2027ByFirstComplianceYear[firstComplianceYear],
        bepstarget_2031: 2031 + yearWindowShift,
        bepstarget_2036: 2036 + yearWindowShift,
        bepstarget_2041: 2041 + yearWindowShift,
        bepstarget_2046: 2046 + yearWindowShift
      };

      try {
        this.templateArgs = {
          dataError: false,
          active: 'active',
          name,
          addr1: building?.reported_address ?? null,
          addr2: this.addressLine2(building),
          year: selected_year,
          year_built: building?.yearbuilt ?? null,
          ess_logo: this.energyStarCertified('eui', building, config),
          site_eui_wn:
            site_eui_wn !== null && !isNaN(site_eui_wn)
              ? Number(site_eui_wn).toFixed(1)
              : null,
          total_ghg:
            total_ghg !== null && !isNaN(total_ghg)
              ? Number(total_ghg).toFixed(2)
              : null,
          tab: this.state.get('tab'),
          bepstarget_2031:
            bepstarget_2031 !== null && bepstarget_2031 !== undefined
              ? bepstarget_2031.toFixed(2)
              : null,
          bepstarget_2036:
            bepstarget_2036 !== null && bepstarget_2036 !== undefined
              ? bepstarget_2036.toFixed(2)
              : null,
          bepstarget_2041:
            bepstarget_2041 !== null && bepstarget_2041 !== undefined
              ? bepstarget_2041.toFixed(2)
              : null,
          bepstarget_2046:
            bepstarget_2046 !== null && bepstarget_2046 !== undefined
              ? bepstarget_2046.toFixed(2)
              : null,
          // Since the fields above are windows, each building has specific years in those windows
          targetYears,
          cbpsFlag: building.cbps_flag,
          // show chart flags
          showCharts,
          sfRangeText
        };
      } catch (err) {
        // Set null to all expected fields in template to prevent crash, dataError
        // set to true will simply display a message that they cannot generate a report.
        // This will only happen if there's an unexpected JS error in the logic of the template.
        // Otherwise each individual piece will appear or not depending.
        this.templateArgs = {
          dataError: true,
          active: null,
          name: null,
          addr1: null,
          addr2: null,
          year: null,
          year_built: null,
          ess_logo: null,
          total_ghg: null,
          tab: null,
          bepstarget_2031: null,
          bepstarget_2036: null,
          bepstarget_2041: null,
          bepstarget_2046: null,
          targetYears: null,
          cbpsFlag: null,
          showCharts: null,
          sfRangeText: null
        };
        console.warn(err);
      }

      el.html(this.template(this.templateArgs));

      // Render charts

      // render fuel use chart (fueluse.js)
      el.find('#fueluse-chart').html(this.charts['eui'].chart_fueluse.render());
      this.charts['eui'].chart_fueluse.afterRender();

      // render BEPs chart (beps.js)
      el.find('#beps-chart').html(this.charts['eui'].chart_beps.render());
      this.charts['eui'].chart_beps.afterRender();

      // render building use type chart (use_types.js)
      el.find('#use-types-chart').html(
        this.charts['eui'].chart_use_types.render()
      );
      this.charts['eui'].chart_use_types.afterRender();

      // render performance over time chart (performance_over_time.js)
      el.find('#performance-over-time-chart').html(
        this.charts['eui'].chart_performance_over_time.render()
      );
      this.charts['eui'].chart_performance_over_time.afterRender();

      // render first ghgi target chart (first_ghgi_target.js)

      el.find('#first-ghgi-target-chart').html(
        this.charts['eui'].chart_first_ghgi_target.render()
      );
      this.charts['eui'].chart_first_ghgi_target.afterRender();

      // render first compliance interval chart (first_compliance_interval.js)
      el.find('#first-compliance-interval-chart').html(
        this.charts['eui'].chart_first_compliance_interval.render()
      );
      this.charts['eui'].chart_first_compliance_interval.afterRender();

      // Add building comments (??)
      if (!this.commentview) {
        this.commentview = new CommentView({ building });

        this.commentview.render(markup => {
          this.parentEl.find('#building-comments').html(markup);
        });
      }
    },

    addressLine2: function (building) {
      var city = building?.city ?? '';
      var state = building?.state ?? '';
      var zip = building?.zip ?? '';

      var addr = city;
      if (state) {
        addr += ' ' + state;
      }
      if (zip) {
        addr += ' ' + zip;
      }

      return addr;
    },

    validNumber: function (x) {
      return _.isNumber(x) && _.isFinite(x);
    },

    extractChangeData: function (yearly, buildings, building, config) {
      const o = [];

      Object.keys(yearly).forEach(year => {
        const bldings = yearly[year];
        config.metrics.forEach(metric => {
          let id = '';
          let label = '';
          if (metric.label.charAt(0) === '{') {
            const labelKey = metric.label.replace(/\{|\}/gi, '');
            label = bldings[labelKey];
            id = 'building';
          } else {
            id = 'average';
            label = metric.label;
          }

          let value = bldings[metric.field];

          if (!this.validNumber(value)) {
            value = null;
          } else {
            value = +value.toFixed(1);
          }

          o.push({
            id,
            label,
            field: metric.field,
            value,
            year: +year,
            unit: metric.unit || '',
            influencer: metric.influencer
          });
        });
      });

      return o.sort((a, b) => a.year - b.year);
    }
  });

  return BuildingScorecard;
});
