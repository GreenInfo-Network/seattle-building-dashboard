define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  '../../../../lib/wrap',
  'text!templates/scorecards/charts/fueluse.html'
], function ($, _, Backbone, d3, wrap, FuelUseTemplate) {
  var FuelUseView = Backbone.View.extend({
    className: 'fueluse-chart',

    TYPICAL_CAR_EMMISSION: 4.7,

    initialize: function (options) {
      this.template = _.template(FuelUseTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
      this.building_name = options.name || '';
      this.year = options.year || '';
      this.isCity = options.isCity || false;
      this.viewParent = options.parent;

      this.fuels = [
        {
          label: 'Electric',
          key: 'electricity'
        },
        {
          label: 'Steam',
          key: 'steam'
        },
        {
          label: 'Gas',
          key: 'gas'
        }
      ];
    },

    getMean: function (key, data) {
      if (data.pluck) {
        return d3.mean(data.pluck(key));
      } else {
        return d3.mean(data.map(d => d[key]));
      }
    },

    getSum: function (key, data) {
      if (data.pluck) {
        return d3.sum(data.pluck(key));
      } else {
        return d3.sum(data.map(d => d[key]));
      }
    },

    validNumber: function (n) {
      return _.isNumber(n) && _.isFinite(n);
    },

    validFuel: function (pct, amt) {
      return (
        this.validNumber(pct) && pct > 0 && this.validNumber(amt) && amt > 0
      );
    },

    getBuildingFuels: function (fuels, data) {
      fuels.forEach(d => {
        const emmission_pct = this.getMean(d.key + '_ghg_percent', data);
        const emmission_amt = this.getMean(d.key + '_ghg', data);
        const usage_pct = this.getMean(d.key + '_pct', data);
        const usage_amt = this.getMean(d.key, data);

        d.emissions = {};
        d.emissions.isValid = this.validFuel(emmission_pct, emmission_amt);
        d.emissions.pct = d.emissions.pct_raw = emmission_pct * 100;
        d.emissions.pct_actual = emmission_pct;
        d.emissions.amt = emmission_amt;
        d.emissions.cars = this.formatters.fixedOne(
          emmission_amt / this.TYPICAL_CAR_EMMISSION
        );

        d.usage = {};
        d.usage.isValid = this.validFuel(usage_pct, usage_amt);
        d.usage.pct = d.usage.pct_raw = usage_pct * 100;
        d.usage.pct_actual = usage_pct;
        d.usage.amt = usage_amt;
      });

      return fuels.filter(d => d.usage.isValid || d.emissions.isValid);
    },

    getCityWideFuels: function (fuels, data) {
      let total_emissions = data.total_emissions;
      let total_usage = data.total_consump;

      fuels.forEach(d => {
        const emission_key = `pct_${d.key}_ghg`;
        const usage_key = `pct_${d.key}`;

        const emmission_pct = data[emission_key];
        const usage_pct = data[usage_key];

        d.emissions = {};
        d.emissions.isValid = this.validFuel(emmission_pct, total_emissions);
        d.emissions.pct = d.emissions.pct_raw = emmission_pct * 100;
        d.emissions.pct_actual = emmission_pct;

        d.usage = {};
        d.usage.isValid = this.validFuel(usage_pct, total_usage);
        d.usage.pct = d.usage.pct_raw = usage_pct * 100;
        d.usage.pct_actual = usage_pct;
      });

      return fuels.filter(d => {
        return d.usage.isValid && d.emissions.isValid;
      });
    },

    fixPercents: function (fuels, prop) {
      const values = fuels
        .map((d, i) => {
          const decimal = +(d[prop].pct_raw % 1);
          const val = Math.floor(d[prop].pct_raw);
          return {
            idx: i,
            val,
            iszero: val === 0,
            decimal: val === 0 ? 1 : decimal
          };
        })
        .sort((a, b) => {
          return b.decimal - a.decimal;
        });

      const sum = d3.sum(values, d => d.val);

      let diff = 100 - sum;

      values.forEach(d => {
        if (diff === 0) return;

        diff -= 1;
        d.val += 1;

        d.iszero = false;
      });

      // we need to bump up zero values
      const zeros = values.filter(d => d.iszero);
      let zeros_length = zeros.length;

      if (zeros_length > 0) {
        while (zeros_length > 0) {
          zeros_length--;
          values.forEach(d => {
            if (!d.iszero && d.val > 1) {
              d.val -= 1;
            }

            if (d.iszero) {
              d.val += 1;
            }
          });
        }
      }

      values.forEach(d => {
        fuels[d.idx][prop].pct = d.val;
        fuels[d.idx][prop].pct_raw = d.val;
      });
    },

    chartData: function () {
      const data = this.data;

      let total_ghg_emissions;
      let total_ghg_emissions_intensity;
      let total_usage;

      let fuels;
      if (this.isCity) {
        fuels = this.getCityWideFuels([...this.fuels], data);
        total_ghg_emissions = data.total_emissions;
        total_ghg_emissions_intensity = data.total_emissions_intensity;
        total_usage = data.total_consump;
      } else {
        fuels = this.getBuildingFuels([...this.fuels], data);
        total_ghg_emissions = this.getSum('total_ghg_emissions', data);
        total_ghg_emissions_intensity = this.getSum(
          'total_ghg_emissions_intensity',
          data
        );
        total_usage = this.getSum('total_kbtu', data);
      }

      // what the heck is this?
      this.fixPercents(fuels, 'emissions');
      this.fixPercents(fuels, 'usage');

      var all_electric = fuels
        .filter(d => d.key == 'electricity')
        .reduce((z, e) => e.usage.pct > 99, false);

      var totals = {
        usage_raw: total_usage,
        usage: d3.format(',d')(Math.round(total_usage)),
        emissions_raw: total_ghg_emissions,
        emissions: d3.format(',d')(Math.round(total_ghg_emissions))
      };

      return {
        fuels,
        totals,
        total_ghg_emissions,
        all_electric: all_electric,
        total_ghg_emissions_intensity,
        isCity: this.isCity,
        building_name: this.building_name,
        year: this.year,
        cars: this.formatters.fixedOne(
          total_ghg_emissions / this.TYPICAL_CAR_EMMISSION
        )
      };
    },

    renderEnergyConsumptionChart: function (data, totals) {
      const parent = d3
        .select(this.viewParent)
        .select('.energy-consumption-bar-chart-container');
      if (!parent.node()) return;

      const margin = { top: 20, right: 10, bottom: 20, left: 10 };
      const outerWidth = parent.node().offsetWidth;
      const outerHeight = parent.node().offsetHeight;
      const width = outerWidth - margin.left - margin.right;

      const svg = parent
        .append('svg')
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

      // Extra padding here for dynamic labels on either end of the bars
      const totalBarWidth = width * 0.7;

      const chartData = data.map((row, i) => {
        return {
          ...row,
          emissions: {
            ...row.emissions,
            pctBefore: d3.sum(
              data.map((d, k) => (k >= i ? 0 : d.emissions.pct_actual))
            )
          },
          usage: {
            ...row.usage,
            pctBefore: d3.sum(
              data.map((d, k) => (k >= i ? 0 : d.usage.pct_actual))
            )
          }
        };
      });

      const labels = {
        emissions: {
          label: 'Resulting Emissions',
          labelUnits: '(% ghg)'
        },
        usage: {
          label: 'Energy Consumed',
          labelUnits: '(% kBtu)'
        }
      };

      const energyConsumedGroup = svg.append('g');
      this.renderBarChart(
        energyConsumedGroup,
        chartData,
        labels,
        totals,
        10,
        width
      );
    },

    renderBarChart: function (
      parent,
      data,
      labels,
      totals,
      yOffset,
      chartWidth
    ) {
      const svg = parent
        .append('g')
        .attr('transform', `translate(0, ${yOffset})`);

      const width = chartWidth;
      const height = 100;

      let groups = ['emissions', 'usage'];
      let subgroups = [...new Set(data.map(d => d.key).flat())];

      let chartData = data.reduce(
        (acc, d) => {
          acc.emissions[d.key] = d?.emissions?.pct;
          acc.usage[d.key] = d?.usage?.pct;
          return acc;
        },
        { emissions: {}, usage: {} }
      );

      chartData = Object.entries(chartData).reduce((acc, [k, v]) => {
        acc.push({ group: k, ...v });
        return acc;
      }, []);

      // Add X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);

      svg
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
      svg.append('g').call(d3.axisLeft(y));

      // color palette = one color per subgroup
      var color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(['red', 'aqua', 'yellow']);

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(chartData);

      // Show the bars
      svg
        .append('g')
        .selectAll('g')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append('g')
        .attr('fill', function (d) {
          return color(d.key);
        })
        .selectAll('rect')
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return x(d.data.group);
        })
        .attr('y', function (d) {
          return y(d[1]);
        })
        .attr('height', function (d) {
          return y(d[0]) - y(d[1]);
        })
        .attr('width', x.bandwidth());
    },

    render: function () {
      return this.template(this.chartData());
    },

    afterRender: function () {
      const chartData = this.chartData();
      this.renderEnergyConsumptionChart(chartData.fuels, chartData.totals);
    }
  });

  return FuelUseView;
});
