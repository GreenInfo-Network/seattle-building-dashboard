define([
  'jquery',
  'underscore',
  'backbone',
  '../../../lib/wrap',
  './charts/fueluse',
  './charts/performance_standard',
  './charts/shift',
  './charts/comments',
  'models/building_color_bucket_calculator',
  'text!templates/scorecards/building.html'
], function($, _, Backbone, wrap, FuelUseView, PerformanceStandardView, ShiftView, CommentView, BuildingColorBucketCalculator, BuildingTemplate){
  var BuildingScorecard = Backbone.View.extend({
    initialize: function(options){
      this.state = options.state;
      this.formatters = options.formatters;
      this.metricFilters = options.metricFilters;
      this.parentEl = options.parentEl;
      this.template = _.template(BuildingTemplate);

      this.charts = {};

      return this;
    },

    events: {
      'click .sc-toggle--input': 'toggleView',
      'click .cbps-learn-more-below': 'scrollToPerformanceStandardChart'
    },

    close: function() {
      this.scoreCardData = null;
    },

    scrollToPerformanceStandardChart: function(evt) {
      evt.preventDefault();
      this.parentEl[0].scrollTo(0, this.parentEl.find('#performance-standard-chart')[0].offsetTop);
      return false;
    },

    toggleView: function(evt) {
      evt.preventDefault();

      var scorecardState = this.state.get('scorecard');
      var view = scorecardState.get('view');

      var target = evt.target;
      var value = target.dataset.view;

      if (value === view) {
        return false;
      }

      scorecardState.set({ 'view': value });
    },

    onViewChange: function() {
      this.render();
    },

    render: function() {
      if (!this.state.get('report_active')) return;

      var id = this.state.get('building');
      var year = this.state.get('year');
      var buildings = this.state.get('allbuildings');

      var city = this.state.get('city');
      var table = city.get('table_name');
      var years = _.keys(city.get('years')).map(d => +d).sort((a, b) => {
        return a - b;
      });
      if (this.scoreCardData && this.scoreCardData.id === id) {
        this.show(buildings, this.scoreCardData.data, year, years);
      } else {
        const yearWhereClause = years.reduce((a, b) => {
          if (!a.length) return `year=${b}`;
          return a + ` OR year=${b}`;
        }, '');

        // Get building data for all years
        d3.json(`https://cityenergy-seattle.carto.com/api/v2/sql?q=SELECT+ST_X(the_geom)+AS+lng%2C+ST_Y(the_geom)+AS+lat%2C*+FROM+${table}+WHERE+id=${id} AND(${yearWhereClause})`, payload => {
          if (!this.state.get('report_active')) return;

          if (!payload) {
            console.error('There was an error loading building data for the scorecard');
            return;
          }

          var data = {};
          payload.rows.forEach(d => {
            data[d.year] = { ...d };
          });

          this.scoreCardData = {
            id: this.state.get('building'),
            data,
          };

          this.show(buildings, data, year, years);
        });
      }
    },

    show: function(buildings, building_data, selected_year, avail_years) {
      this.processBuilding(buildings, building_data, selected_year, avail_years);
    },

    getColor: function(field, value) {
      if (!this.metricFilters || !this.metricFilters._wrapped) return '#f1f1f1';

      // TODO: fix hacky way to deal w/ quartiles
      var filter = this.metricFilters._wrapped.find(function(item) {
        if (item.layer.id === 'site_eui_quartiles') {
          if (field === 'site_eui_quartiles') return true;
          return false;
        }

        return item.viewType === 'filter' && item.layer.field_name === field;
      });

      if (!filter) return 'red';

      return filter.getColorForValue(value);
    },

    getCompareChartBinnedData: function(config, buildings, prop_type, view, selected_year) {
      var compareField = this.getViewField(view);

      var buildingsOfType = buildings.where({ property_type: prop_type }).map(function(m) {
        return m.toJSON();
      });

      var buildingsOfType_max = d3.max(buildingsOfType, function(d){
        if (d.hasOwnProperty(compareField)) return d[compareField];
        return 0;
      });

      var buildingsOfType_min = d3.min(buildingsOfType, function(d){
        if (d.hasOwnProperty(compareField)) return d[compareField];
        return 0;
      });

      var _bins;
      if (view === 'eui') {
       _bins = this.calculateEuiBins(buildingsOfType_min, buildingsOfType_max, config.thresholds.eui[prop_type][selected_year], config.thresholds.eui_schema);
      } else {
        _bins = this.calculateEnergyStarBins(config.thresholds.energy_star);
      }

      var data = d3.layout.histogram()
          .bins(_bins)
          .value(function(d) {
            return d[compareField];
          })(buildingsOfType);

      data.forEach(function(d, i) {
        d.min = _bins[i];
        d.max = _bins[i + 1];
      });

      return data;
    },

    getCompareChartColor: function(data, thresholds, id) {
      var selectedIndex = null;

      data.forEach(function(d, i) {
        if (selectedIndex !== null) return;

        var f = d.find(function(r) {
          return r.id === id;
        });

        if (f) selectedIndex = i;
      });

      const threshold = thresholds.filter(d => {
        return selectedIndex >= d.indices[0] && selectedIndex <= d.indices[1];
      })[0];
      return threshold.clr;
    },

    getViewField: function(view) {
      return view === 'eui' ? 'site_eui_wn' : 'energy_star_score';
    },

    energyStarCertified: function(view, building, config) {
      if (view === 'eui') return false;

      const certifiedField = config.certified_field || null;

      if (certifiedField === null) return false;

      return !!building[certifiedField];
    },

    processBuilding: function(buildings, building_data, selected_year, avail_years) {
      var building = building_data[selected_year];
      const view = this.state.get('scorecard').get('view');
      var name = building.property_name;
      var sqft = +(building.reported_gross_floor_area);
      var prop_type = building.property_type;
      var id = building.id;

      // for building details first card "energy per square foot"
      var site_eui_wn = building.site_eui_wn || '';
      var building_eui_wn = building.building_type_eui_wn;
      var eui_difference = ((site_eui_wn - building_eui_wn) / building_eui_wn) * 100;
      var eui_direction = eui_difference < 0 ? 'decreased' : 'increased';
      var eui_direction_word = eui_difference < 0 ? 'lower' : 'higher';
      var eui_difference_formatted = Math.abs(eui_difference) / 100;

      eui_difference_formatted = eui_difference_formatted.toLocaleString('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      var eui_direction_statement = `${eui_difference_formatted} ${eui_direction_word}`;

      // for building details second card "emissions per square foot"
      var total_ghg = building.total_ghg_emissions_intensity || 0;
      var building_type_average_ghg = this.getMeanBuildingTypeGhg(buildings, prop_type);
      var ghg_difference = ((total_ghg - building_type_average_ghg) / building_type_average_ghg) * 100;
      var ghg_direction = ghg_difference < 0 ? 'decreased' : 'increased';
      var ghg_direction_word = ghg_difference < 0 ? 'lower' : 'higher';
      var ghg_difference_formatted = Math.abs(ghg_difference) / 100;
      ghg_difference_formatted = ghg_difference_formatted.toLocaleString('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      var ghg_direction_statement = `${ghg_difference_formatted} ${ghg_direction_word}`;

      var config = this.state.get('city').get('scorecard');

      var viewSelector = `#scorecard-view`;
      var el = this.$el.find(viewSelector);
      var compareField = this.getViewField('eui');

      var value = building.hasOwnProperty(compareField) ? building[compareField] : null;
      let data = this.getCompareChartBinnedData(config, buildings, prop_type, 'eui', selected_year);

      let thresholds = this.getThresholdLabels(config.thresholds.eui_schema);
      let valueColor = this.getColor(compareField, value);
      if (compareField === 'site_eui_wn') {
        valueColor = this.getCompareChartColor(data, thresholds, id);
      }
      if (!_.isNumber(value) || !_.isFinite(value)) {
        value = null;
        valueColor = '#aaa';
      }

      var chartdata = this.prepareCompareChartData(config, buildings, building, selected_year, 'eui', prop_type, id);
      var essChartData = this.prepareCompareChartData(config, buildings, building, selected_year, 'ess', prop_type, id);

      el.html(this.template({
        active: 'active',
        name,
        addr1: building.reported_address,
        addr2: this.addressLine2(building),
        sqft: sqft.toLocaleString(),
        type: prop_type,
        id,
        year: selected_year,
        year_built: building.yearbuilt,
        view,
        ess_logo: this.energyStarCertified('eui', building, config),
        value,
        valueColor,
        costs: this.costs(building, selected_year),
        compareEui: this.compare(building, 'eui', config, chartdata),
        compareEss: this.compare(building, 'ess', config, essChartData),
        site_eui_wn: site_eui_wn.toLocaleString(),
        eui_difference,
        eui_direction,
        eui_direction_statement,
        total_ghg,
        ghg_direction,
        ghg_direction_statement
      }));

      // set chart hash
      if (!this.charts.hasOwnProperty('eui')) this.charts['eui'] = {};

      // render fuel use chart (fueluse.js)
      if (!this.charts['eui'].chart_fueluse) {
        this.charts['eui'].chart_fueluse = new FuelUseView({
          formatters: this.formatters,
          data: [building],
          name: name,
          year: selected_year,
          parent: el[0],
        });
      }

      el.find('#fuel-use-chart').html(this.charts['eui'].chart_fueluse.render());
      this.charts['eui'].chart_fueluse.afterRender();

      // render Clean Building Performance Standard (CBPS) chart (performance_standard.js), but only if flagged
      if (building.cbps_flag) {
        if (!this.charts['eui'].chart_performance_standard) {
          this.charts['eui'].chart_performance_standard = new PerformanceStandardView({
            formatters: this.formatters,
            data: [building],
            name: name,
            parent: el[0],
            current_eui: building.site_eui_wn,
            target_eui: building.cbps_euit,
            compliance_year: building.cbps_date,
            cbps_flag: building.cbps_flag && building.cbps_euit,
            cbps_flag_but_no_cbps_euit: building.cbps_flag && ! building.cbps_euit
          });
        }

        el.find('#performance-standard-chart').html(this.charts['eui'].chart_performance_standard.render());
        this.charts['eui'].chart_performance_standard.afterRender();
        $('div#state-requirement-wrapper').removeClass('wrapper-hidden');
      } else {
        // if we aren't showing the CBPS chart, then hide this alert
        $('div#state-requirement-wrapper').addClass('wrapper-hidden');
      }

      // render Energy Use Trends (shift.js) chart
      if (!this.charts['eui'].chart_shift) {
        // avail_years comes from seattle.json and shows all available years
        // we want all years for this building
        let building_years = Object.keys(building_data).sort(function(a, b) { return parseInt(a) - parseInt(b); });

        var shiftConfig = config.change_chart.building;
        var previousYear = building_years[0];

        // by definition, we should always have a previous year, or else a single year of data
        // so how can no_year be a condition?
        var hasPreviousYear = previousYear !== selected_year;

        const change_data = hasPreviousYear ? this.extractChangeData(building_data, buildings, building, shiftConfig) : null;

        // trap case where there is a range of only one year, send to the view for rendering an error
        const single_year = building_years.length === 1;

        this.charts['eui'].chart_shift = new ShiftView({
          formatters: this.formatters,
          data: change_data,
          no_year: !hasPreviousYear,
          single_year: single_year,
          previous_year: previousYear,
          selected_year,
          view: 'eui'
        });
      }

      // now render
      if (this.charts['eui'].chart_shift) {
        this.charts['eui'].chart_shift.render(t => {
          el.find('#compare-shift-chart').html(t);
        }, viewSelector);
      }

      // Render Energy Use Compared To Average and Energy Star Score Compared To Average ("compare" chart)
      // Note: this one doesn't have a separate template, render is defined here (this.renderCompareChart)
      this.renderCompareChart(config, chartdata, 'eui', prop_type, name, viewSelector);
      this.renderCompareChart(config, essChartData, 'ess', prop_type, name, viewSelector + ' .screen-only');
      this.renderCompareChart(config, essChartData, 'ess', prop_type, name, viewSelector + ' .print-only');

      // Add building comments (??)
      if (!this.commentview) {
        this.commentview = new CommentView({ building });

        this.commentview.render(markup => {
          this.parentEl.find('#building-comments').html(markup);
        });
      }
    },

    addressLine2: function(building) {
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

    costs: function(building, year) {
      //  ft²
      var per_sqft = building.cost_sq_ft;
      if (per_sqft === null) {
        per_sqft = '0';
      } else {
        per_sqft = this.formatters.currency(per_sqft);
      }

      var annual = building.cost_annual;
      if (annual === null) {
        annual = '0';
      } else {
        annual = this.formatters.currency_zero(annual);
      }

      var save_pct = building.percent_save;
      if (save_pct === null) {
        save_pct = '0';
      } else {
        save_pct = this.formatters.percent(save_pct);
      }

      var savings = building.amount_save;
      if (savings === null) {
        savings = '0';
      } else {
        savings = this.formatters.currency_zero(savings);
      }

      return {
        per_sqft: per_sqft,
        annual: annual,
        save_pct: save_pct,
        savings: savings
      };
    },

    viewlabels: function(view, config) {
      return {
        view: view,
        label_long: config.labels[view].long,
        label_short: config.labels[view].short
      };
    },

    compare: function(building, view, config, chartdata) {
      var change_pct;
      var change_label;
      var isValid;
      var compareConfig = config.compare_chart;

      if (view === 'eui') {
        change_pct = ((building.site_eui_wn - building.building_type_eui_wn) / building.building_type_eui_wn) * 100;
        isValid = _.isNumber(change_pct) && _.isFinite(change_pct);
        change_label = change_pct < 0 ? 'lower' : 'higher';
        change_pct = this.formatters.percent(Math.abs(change_pct) / 100);
      } else {
        change_pct = Math.abs(chartdata.building_value - chartdata.mean);
        isValid = _.isNumber(change_pct) && _.isNumber(chartdata.building_value) && _.isFinite(change_pct);
        change_pct = this.formatters.fixedZero(change_pct);

        change_label = (chartdata.building_value >= chartdata.mean) ? 'higher' : 'lower';
      }

      const o = {
        isValid: isValid,
        change_label: change_label,
        change_pct: change_pct,
        error: !isValid ? compareConfig.nodata[view] : ''
      };

      return o;
    },

    calculateEuiBins: function(data_min, data_max, thresholds, schema) {
      var me = this;
      var _bins = [];
      var min;
      var max;

      schema.forEach(function(d, i) {
        min = (thresholds[i - 1]) ? thresholds[i - 1] : data_min;
        max = (thresholds[i]) ? thresholds[i] : data_max;

        me.binRange(min, max, d.steps, _bins);
      });

      _bins.push(data_max);

      return _bins.sort(function(a, b) { return a - b; });
    },

    calculateEnergyStarBins: function(thresholds) {
      var me = this;
      var _bins = [];

      _bins.push( thresholds[thresholds.length - 1].range[1] );

      thresholds.forEach(function(d, i){
        me.binRange(d.range[0], d.range[1], d.steps, _bins);
      });

      return _bins.sort(function(a, b) { return a - b; });
    },

    binRange: function(min, max, steps, arr) {
      var step = (max - min) / (steps + 1);

      var s = min;
      arr.push(min);
      for (var i=0; i < steps; i++) {
        s += step;
        arr.push(s);
      }
    },

    getMeanBuildingTypeGhg: function(buildings, property_type) {
      // first get all the buildings of this type
      let buildingsOfType = buildings.where({ property_type }).map(m => m.toJSON());
      // keep only a few fields, and remove blanks
      let buildingsFiltered = buildingsOfType.map(building => {
        return {
          id: building.id,
          eui_wn: building.site_eui_wn,
          emissions: building.total_ghg_emissions_intensity,
        };
      }).filter(d => d.eui_wn != null && d.emissions != null);

      // find the average (mean), and return it
      let mean = d3.mean(buildingsFiltered.map(d => d.emissions));
      return mean;
    },

    getThresholdLabels: function(thresholds) {
      var prev = 0;
      return thresholds.map(function(d, i) {
        var start = prev;
        var end = start + d.steps;
        prev = end + 1;

        return {
          label: d.label,
          clr: d.color,
          indices: [start, end]
        };
      });
    },

    validNumber: function(x) {
      return _.isNumber(x) && _.isFinite(x);
    },

    prepareCompareChartData: function(config, buildings, building, selected_year, view, prop_type, id) {
      var buildingsOfType = buildings.where({ property_type: prop_type }).map(function(m) {
        return m.toJSON();
      });
      let compareField = this.getViewField(view);
      let building_value = building.hasOwnProperty(compareField) ? building[compareField] : null;

      if (!this.validNumber(building_value)) {
        building_value = null;
      }
      let data = this.getCompareChartBinnedData(config, buildings, prop_type, view, selected_year);

      let thresholds;
      if (view === 'eui') {
        thresholds = this.getThresholdLabels(config.thresholds.eui_schema);
      } else {
        thresholds = this.getThresholdLabels(config.thresholds.energy_star);
      }

      var selectedIndex = null;
      var avgIndex = null;

      data.forEach(function(d, i) {
        if (selectedIndex !== null) return;

        var f = d.find(function(r){
          return r.id === id;
        });

        if (f) selectedIndex = i;
      });

      var avg = (view === 'eui') ?
        building.building_type_eui_wn :
        d3.mean(buildingsOfType, function(d) { return d[compareField]; });

      if (view !== 'eui') {
        avg = Math.round(avg);
      } else {
        avg = +this.formatters.fixedOne(avg);
      }

      data.forEach(function(d, i) {
        if (avgIndex !== null) return;

        var next = data[i + 1] || null;

        if (next === null) {
          avgIndex = i;
          return;
        }

        if (avg >= d.min && avg < next.min) avgIndex = i;
      });

      let avgColor;
      let selectedColor;

      if (compareField === 'site_eui_wn') {
        selectedColor = this.getCompareChartColor(data, thresholds, id);

        thresholds.forEach(d => {
          if (avgIndex >= d.indices[0] && avgIndex <= d.indices[1]) {
            avgColor = d.clr;
          }
        });
      } else {
        avgColor = this.getColor(compareField, avg);
        selectedColor = this.getColor(compareField, building_value);
      }

      if (!this.validNumber(avg)) avg = null;

      return {
        selectedIndex: selectedIndex,
        avgIndex: avgIndex,
        data: data,
        thresholds: thresholds,
        building_value: building_value,
        compareField: compareField,
        avgColor,
        selectedColor,
        mean: avg
      };
    },

    // Render Energy Use Compared To Average and Energy Star Score Compared To Average
    renderCompareChart: function(config, chartdata, view, prop_type, name, viewSelector) {
      const container = d3.select(viewSelector);
      const rootElm = container.select(`.${view}-compare-chart`);

      if (!rootElm.node()) return;
      if (chartdata.selectedIndex === null && (chartdata.avgIndex === null || chartdata.mean === null)) {
        console.warn('Could not find required data!', view, chartdata);
        return;
      }

      var outerWidth = rootElm.node().offsetWidth;
      var outerHeight = rootElm.node().offsetHeight;

      // Don't bother rendering a chart if it will be invisible
      if (outerWidth <= 0 || outerHeight <= 0) return;

      var compareChartConfig = config.compare_chart;
      var margin = { top: 65, right: 30, bottom: 40, left: 40 };
      var width = outerWidth - margin.left - margin.right;
      var height = outerHeight - margin.top - margin.bottom;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.3, 0)
        .domain(chartdata.data.map(d => d.x));

      var y = d3.scale.linear()
          .domain([0, d3.max(chartdata.data, function(d) { return d.y; })])
          .range([height, 0]);

      var svg = rootElm.append('svg')
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

      var chartGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      chartGroup.append('g')
        .attr('class', 'y axis')
        .call(d3.svg.axis().scale(y).orient('left').ticks(5).outerTickSize(0).innerTickSize(2));

      var threshold = chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', function(d) { return 'translate(0,' + (height + 10) + ')'; })
        .selectAll('.threshold')
        .data(chartdata.thresholds)
        .enter()
        .append('g')
          .attr('class', 'threshold')
          .attr('transform', function(d) {
            var indices = d.indices;
            var start = x(chartdata.data[indices[0]].x);
            return 'translate(' + start + ',0)';
          });

      threshold
        .append('line')
        .attr('x1', 0)
        .attr('x2', function(d) {
          var indices = d.indices;
          var start = x(chartdata.data[indices[0]].x);
          var end = x(chartdata.data[indices[1]].x) + x.rangeBand();
          return end - start;
        })
        .attr('fill', 'none')
        .attr('stroke', function(d){ return d.clr; });

      threshold
        .append('text')
        .attr('fill', function(d){ return d.clr; })
        .attr('dy', 14)
        .attr('dx', function(d) {
          var indices = d.indices;
          var start = x(chartdata.data[indices[0]].x);
          var end = x(chartdata.data[indices[1]].x) + x.rangeBand();
          var middle = (end - start) / 2;
          return middle;
        })
        .attr('text-anchor', function(d, i){
          if (i === 0 && view === 'eui') {
            return 'end';
          }
          if (i === 2 && view === 'eui') return 'start';

          return 'middle';
        })
        .text(function(d){ return d.label; });

      // Show min and max on Energy Star chart
      if (view === 'ess') {
        chartGroup.select('.x.axis').selectAll('.label')
          .data([1, 100])
          .enter()
            .append('g')
              .attr('class', 'label')
              .attr('transform', d => {
                const labelX = d === 1 ? 0 : width - 5;
                return `translate(${labelX}, 3)`;
              })
            .append('text')
              .text(d => d);
      }

      chartGroup
        .append('g')
        .attr('class', 'label')
        .attr('transform', function(d) { return 'translate(' + (-30) + ',' + (height / 2) + ')'; })
        .append('text')
        .text(compareChartConfig.y_label)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)');

      chartGroup
        .append('g')
        .attr('class', 'label')
        .attr('transform', function(d) { return 'translate(' + (width/2) + ',' + (height + 40) + ')'; })
        .append('text')
        .text(compareChartConfig.x_label[view])
        .attr('text-anchor', 'middle');

      var bar = chartGroup.selectAll('.bar')
          .data(chartdata.data)
        .enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function(d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

      bar.append('rect')
          .attr('x', 1)
          .attr('width', x.rangeBand())
          .attr('height', function(d) { let h = height - y(d.y); return h; })
          .attr('class', function(d, i) {
            if (i === chartdata.selectedIndex) return 'building-bar selected';
            if (i === chartdata.avgIndex) return 'avg-bar selected';
            return null;
          })
          .style('fill', function(d, i) {
            if (i === chartdata.selectedIndex) {
              if (chartdata.building_value === null) return '#F1F1F1';
              return chartdata.selectedColor;
            }

            if (i === chartdata.avgIndex) {
              return chartdata.avgColor;
            }

            return '#F1F1F1';
          })
          .attr('title', function(d) {
            return '>= ' + d.x + ' && < ' + (d.x + d.dx);
          });

      // Set selected building marker
      var xBandWidth = x.rangeBand();
      var xpos = chartdata.selectedIndex === null ? 0 : x(chartdata.data[chartdata.selectedIndex].x) + (xBandWidth / 2);
      var ypos = chartdata.selectedIndex === null ? 0 : y(chartdata.data[chartdata.selectedIndex].y);
      const selectedXPos = xpos;
      const circleRadius = 30;
      const highlightOffsetY = -62;
      const highlightTopMargin = margin.top + highlightOffsetY;

      var selectedCityHighlight = chartGroup.append('g')
        .classed('selected-city-highlight', true)
        .attr('transform', `translate(${xpos - circleRadius}, ${highlightOffsetY})`);

      const selectedValueTextGroup = selectedCityHighlight.append('g')
        .attr('transform', `translate(${circleRadius}, ${circleRadius})`);

      var selectedValueText = selectedValueTextGroup.append('text');

      // add EUI or ESS value
      let buildingValue = chartdata.building_value ? chartdata.building_value.toLocaleString() : null;
      selectedValueText.append('tspan')
        .attr('x', 0)
        .text(buildingValue)
        .style('fill', '#000')
        .classed('value', true);

      // add units
      selectedValueTextGroup.append('text')
        .text(compareChartConfig.highlight_metric[view])
        .attr('x', 0)
        .attr('y', 3)
        .attr('dy', '1em')
        .style('fill', '#000')
        .classed('units', true)
        .call(wrap, circleRadius * 2);

      selectedValueTextGroup
        .attr('transform', () => {
          const textGroupHeight = selectedValueTextGroup.node().getBBox().height;
          const valueHeight = selectedValueText.node().getBBox().height;
          const y = highlightTopMargin + valueHeight / 2 + (circleRadius - textGroupHeight / 2);
          return `translate(${circleRadius}, ${y})`;
        });

      const buildingNameText = selectedCityHighlight.append('g').append('text')
        .text(name)
        .classed('building-name', true)
        .call(wrap, 170);

      buildingNameText
        .attr('transform', () => {
          const bbox = buildingNameText.node().getBBox();
          const nodeWidth = bbox.width;
          const nodeHeight = bbox.height;
          let x = circleRadius * 2 + 7;

          if (nodeWidth + xpos + circleRadius > width) {
            x = -(nodeWidth + 5);
          }
          let y = circleRadius - (nodeHeight / 2) + highlightTopMargin + 6;
          return `translate(${x}, ${y})`;
        });

      let linebuffer = view == 'eui' ? -8 : -5;
      selectedCityHighlight.append('path')
        .classed('line', true)
        .attr('d', d3.svg.line()([
          [circleRadius + 1, circleRadius * 2 + linebuffer], // line start
          [circleRadius + 1, margin.top + ypos - highlightTopMargin], // line finish (top of bar)
        ]));

      //
      // Set average label and fill
      //
      if (chartdata.avgIndex === null) return;
      if (chartdata.mean === null) return;

      xpos = x(chartdata.data[chartdata.avgIndex].x);

      var avgPadding = 5;
      let xTranslate = xpos + xBandWidth + avgPadding;

      ypos = y(chartdata.data[chartdata.avgIndex].y); // top of bar

// var xBandWidth = x.rangeBand();
// var xpos = chartdata.selectedIndex === null ? 0 : x(chartdata.data[chartdata.avgIndex].x) + (xBandWidth / 2);
// var ypos = chartdata.selectedIndex === null ? 0 : y(chartdata.data[chartdata.avgIndex].y);
// const selectedXPos = xpos;
// const circleRadius = 30;
// const highlightOffsetY = -70;
// const highlightTopMargin = margin.top + highlightOffsetY;

// var averageTypeHighlight = chartGroup.append('g')
//   .classed('selected-city-highlight', true)
//   .attr('transform', `translate(${xpos - circleRadius}, ${highlightOffsetY})`);

// // averageTypeHighlight.append('circle')
// //   .attr('cx', 0)
// //   .attr('cy', 0)
// //   .attr('r', circleRadius)
// //   .attr('transform', `translate(${circleRadius}, ${circleRadius})`)
// //   .classed('circle', true);

// const averageValueTextGroup = averageTypeHighlight.append('g')
//   .attr('transform', `translate(${circleRadius}, ${circleRadius + 5})`);

// var averageValueText = averageValueTextGroup.append('text');

// // add EUI or ESS value
// averageValueText.append('tspan')
//   .attr('x', 0)
//   .text(chartdata.building_value.toLocaleString())
//   .style('fill', '#000')
//   .classed('value', true);

// // add units
// averageValueTextGroup.append('text')
//   .text(compareChartConfig.highlight_metric[view])
//   .attr('x', 0)
//   .attr('dy', '1em')
//   .style('fill', '#000')
//   .classed('units', true)
//   .call(wrap, circleRadius * 2);

// averageValueTextGroup
//   .attr('transform', () => {
//     const textGroupHeight = averageValueTextGroup.node().getBBox().height;
//     const valueHeight = averageValueText.node().getBBox().height;
//     return `translate(${circleRadius}, ${highlightTopMargin + valueHeight / 2 + (circleRadius - textGroupHeight / 2)})`;
//   });

// const averageNameText = averageTypeHighlight.append('g').append('text')
//   .text(name)
//   .classed('building-name', true)
//   .call(wrap, 150);

// averageNameText
//   .attr('transform', () => {
//     const bbox = averageNameText.node().getBBox();
//     const nodeWidth = bbox.width;
//     const nodeHeight = bbox.height;
//     let x = circleRadius * 2 + 5;

//     if (nodeWidth + xpos + circleRadius > width) {
//       x = -(nodeWidth + 5);
//     }
//     let y = circleRadius - (nodeHeight / 2) + highlightTopMargin;
//     return `translate(${x}, ${y})`;
//   });

// averageTypeHighlight.append('path')
//   .classed('line', true)
//   .attr('d', d3.svg.line()([
//     [circleRadius + 1, circleRadius * 2 - 5],
//     [circleRadius + 1, margin.top + ypos - highlightTopMargin],
//   ]));

      let yTranslate = ypos + 5;
      var averageBuildingHighlight = chartGroup.append('g')
        .classed('average-building-highlight', true)
        .attr('transform', `translate(${xTranslate}, ${yTranslate})`);

      const averageText = averageBuildingHighlight.append('text');

      averageText.append('tspan')
        .text('Building type average')
        .classed('building-name', true)
        .call(wrap, 75);

      averageText.append('tspan')
        .text(chartdata.mean)
        .attr('x', 0)
        .attr('dy', '.7em')
        .style('fill', '#707070')
        .classed('value', true);

      averageText.append('tspan')
        .text(compareChartConfig.highlight_metric[view])
        .attr('x', 0)
        .attr('dy', '1.5em')
        .style('fill', '#707070')
        .classed('label', true);

      const averageBbox = averageBuildingHighlight.node().getBBox();
      if (xpos < selectedXPos && xpos + averageBbox.width > selectedXPos) {
        xTranslate = xpos - avgPadding;
        averageBuildingHighlight.classed('align-right', true);
      }

      if (ypos + averageBbox.height > height) {
        yTranslate = height - averageBbox.height;
      }

      averageBuildingHighlight
        .attr('transform', `translate(${xTranslate}, ${yTranslate})`);
    },

    extractChangeData: function(yearly, buildings, building, config) {
      const o = [];
      const colorScales = {};
      config.metrics.forEach(metric => {
        if (metric.colorize && !colorScales.hasOwnProperty(metric.field)) {
          const gradientCalculator = new BuildingColorBucketCalculator(
              buildings,
              metric.field,
              metric.range_slice_count,
              metric.color_range, null, null);

          const scale = gradientCalculator.colorGradient().copy();
          const domain = scale.domain();
          const len = domain.length - 1;

          if (building[metric.field] > domain[len]) {
            domain[len] = building[metric.field];
          }

          scale.domain(domain);

          colorScales[metric.field] = scale;
        }
      });

      Object.keys(yearly).forEach(year => {
        const bldings = yearly[year];
        config.metrics.forEach(metric => {
          let label = '';
          if (metric.label.charAt(0) === '{') {
            const labelKey = metric.label.replace(/\{|\}/gi, '');
            label = bldings[labelKey];
          } else {
            label = metric.label;
          }

          let value = bldings[metric.field];

          if (!this.validNumber(value)) {
            value = null;
          } else {
            value = +(value.toFixed(1));
          }

          const clr = (colorScales.hasOwnProperty(metric.field) && metric.colorize) ?
            colorScales[metric.field](value) : null;

          o.push({
            label,
            field: metric.field,
            value,
            clr,
            year: +year,
            colorize: metric.colorize,
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
