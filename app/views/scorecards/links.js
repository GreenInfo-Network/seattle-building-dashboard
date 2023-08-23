"use strict";

define(['jquery', 'underscore', 'backbone', 'd3', 'text!templates/scorecards/links.html'], function ($, _, Backbone, d3, LinksTemplate) {
  var LinksView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.template = _.template(LinksTemplate);
      this.el = options.el;
      this.link_type = options.link_type;
      this.links_table = options.links_table;
      this.building = _.isFinite(options.building) ? +options.building : -1;
      this.active = true;
      this.load();
    },
    close: function close() {
      this.active = false;
      this.el.html('');
      this.el = null;
    },
    active: function active(x) {
      this.active = x;
    },
    format: function format(data) {
      var slots = [1, 2, 3];
      // building_type', 'ad_href', 'ad_img',
      var keys = {
        header: 'link{s}_header',
        link_href: 'link{s}_link_href',
        link_txt: 'link{s}_link_txt',
        txt: 'link{s}_txt'
      };
      var linkKeys = Object.keys(keys);
      var formatted = {};
      formatted.ad_href = data.ad_href;
      formatted.property_type = data.property_type;
      formatted.ad_img = data.ad_img;
      formatted.links = slots.map(function (s) {
        var l = {};
        var valid = false;
        linkKeys.forEach(function (k) {
          var field = keys[k].replace('{s}', s);
          if (!data.hasOwnProperty(field)) return;
          l[k] = data[field];

          // Validity check only on header
          if (k === 'header') {
            valid = _.isString(l[k]) && l[k].length > 3;
          }
        });
        if (!valid) return null;
        return l;
      }).filter(function (d) {
        return d !== null;
      });
      formatted.error = null;
      return formatted;
    },
    getRow: function getRow(data) {
      var _this = this;
      if (!data.length) return null;
      var row;

      // Look for a match on "building id" first
      row = data.find(function (d) {
        return d.building_id === _this.building;
      });
      if (row) return this.format(row);

      // Try "property type" next
      row = data.find(function (d) {
        return d.property_type === _this.link_type;
      });
      if (row) return this.format(row);

      // Lastly use the default
      row = data.find(function (d) {
        return d.property_type === 'default';
      });
      if (row) return this.format(row);
      return null;
    },
    load: function load() {
      var _this2 = this;
      // Load link data
      d3.csv('data/links.csv', function (payload) {
        if (!_this2.active) return;
        if (!payload) {
          console.error('There was an error loading link data for the scorecard');
          return;
        }
        var data = _this2.getRow(payload || []);
        if (!data || !Array.isArray(data.links)) {
          data = {
            error: 'Could not load links at this time',
            links: []
          };
        }
        _this2.render(data);
      });
    },
    render: function render(data) {
      this.el.html(this.template(data));
    }
  });
  return LinksView;
});