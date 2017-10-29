define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/scorecards/links.html'
], function($, _, Backbone, d3, LinksTemplate){
  var LinksView = Backbone.View.extend({
    initialize: function(options){
      this.template = _.template(LinksTemplate);
      this.el = options.el;
      this.link_type = options.link_type;
      this.active = true;

      this.load();
    },

    close: function() {
      this.active = false;
      this.el.html('');
      this.el = null;
    },

    active: function(x) {
      this.active = x;
    },

    format: function(data) {
      const slots = [1, 2, 3];
      // building_type', 'ad_href', 'ad_img',
      const keys = {
        header: 'link{s}_header',
        link_href: 'link{s}_link_href',
        link_txt: 'link{s}_link_txt',
        txt: 'link{s}_txt'
      };

      const linkKeys = Object.keys(keys);
      const formatted = {};

      formatted.ad_href = data.ad_href;
      formatted.property_type = data.property_type;
      formatted.ad_img = data.ad_img;
      formatted.links = slots.map(s => {
        const l = {};
        linkKeys.forEach(k => {
          const field = keys[k].replace('{s}', s);
          l[k] = data[field];
        });

        return l;
      });

      formatted.error = null;

      return formatted;
    },

    getRow: function(data) {
      if (!data.length) return null;

      let row = data.find(d => {
        return d.property_type === this.link_type;
      });

      if (row) return this.format(row);

      row = data.find(d => {
        return d.property_type === 'default';
      });

      if (row) return this.format(row);

      return null;
    },

    url: function() {
      // TODO: set dynamically from config
      const table = 'links';
      const where = [
        `WHERE (property_type <> '') is true`,
        `property_type in ('${this.link_type}', 'default')`
      ].join(' AND ');

      const base = `https://cityenergy-seattle.carto.com/api/v2/sql?q=SELECT * FROM ${table}`;
      return base + ' ' + where;
    },

    load: function() {
      // Load link data
      d3.json(this.url(), payload => {
        if (!this.active) return;

        if (!payload) {
          console.error('There was an error loading link data for the scorecard');
          return;
        }

        let data = this.getRow(payload.rows || []);

        if (!data || !Array.isArray(data.links)) {
          data = {
            error: 'Could not load links at this time',
            links: []
          };
        }

        this.render(data);
      });
    },

    render: function(data) {
      this.el.html(this.template(data));
    }
  });

  return LinksView;
});