"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
define(['underscore', 'backbone', 'd3'], function (_, Backbone, d3) {
  var Modals = Backbone.Model.extend({
    defaults: {
      selected: null,
      cache: {},
      viewdata: null
    },
    url: function url(props) {
      if (props.tablename) return this.cartoUrl(props.tablename);
      if (props.file) return "data/".concat(props.file);
      return null;
    },
    cartoUrl: function cartoUrl(tablename) {
      return "https://cityenergy-seattle.carto.com/api/v2/sql?q=select * from ".concat(tablename, " WHERE active=true&format=csv");
    },
    modalProps: function modalProps() {
      var available = this.get('available');
      var selected = this.get('selected');
      return available[selected] || {};
    },
    wrapBreaks: function wrapBreaks(txt) {
      return txt.split('<br>').map(function (d) {
        return "<p>".concat(d, "</p>");
      }).join('');
    },
    parse: function parse(rows, reflinks) {
      var _this = this;
      if (!reflinks) {
        return rows.map(function (row) {
          return [row.question.trim(), _this.wrapBreaks(row.answer.trim())];
        });
      }
      return rows.map(function (row) {
        if (row.ref_link && row.ref_link.length > 5) {
          var moreinfo = '<a class="link-ref" href="' + row.ref_link.trim() + '" target="_blank">Reference Link</a>';
          var definition = row.definition.trim() + moreinfo;
          return [row.term.trim(), definition];
        }
        return [row.term.trim(), row.definition.trim()];
      });
    },
    fetchViewData: function fetchViewData() {
      var _this2 = this;
      var selected = this.get('selected');
      var available = this.get('available');
      if (selected === null) {
        this.set({
          viewdata: null
        });
        return this;
      }
      var cache = this.get('cache');
      if (cache[selected]) {
        this.set({
          viewdata: cache[selected]
        });
        return this;
      }

      // Fail silently if not available
      if (!available.hasOwnProperty(selected)) return this;
      var props = available[selected];
      var url = this.url(props);
      if (url === null) {
        console.error("No valid url for ".concat(selected, " modal"));
        return this;
      }
      d3.text(url, function (payload) {
        if (!payload) {
          console.error("No modal data for (".concat(selected, ")"));
          return _this2;
        }
        var rows = _this2.parse(d3.csvParse(payload), props.reflinks);
        _this2.set({
          cache: _.extend(cache, _defineProperty({}, selected, rows)),
          viewdata: rows
        });
      });
    }
  });
  return Modals;
});