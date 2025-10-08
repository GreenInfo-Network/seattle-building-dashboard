"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
define(['jquery', 'underscore', 'backbone', 'd3', 'collections/city_buildings', 'models/building_color_bucket_calculator', 'text!templates/map/building_info.html'], function ($, _, Backbone, d3, CityBuildings, BuildingColorBucketCalculator, BuildingInfoTemplate) {
  var baseCartoCSS = {
    dots: ['{marker-fill: #CCC;' + 'marker-fill-opacity: 0.9;' + 'marker-line-color: #FFF;' + 'marker-line-width: 0.5;' + 'marker-line-opacity: 1;' + 'marker-placement: point;' + 'marker-multi-policy: largest;' + 'marker-type: ellipse;' + 'marker-allow-overlap: true;' + 'marker-clip: false;}'],
    footprints: ['{polygon-fill: #CCC;' + 'polygon-opacity: 0.9;' + 'line-width: 1;' + 'line-color: #FFF;' + 'line-opacity: 0.5;}'],
    footprints_null_outline: ['{polygon-fill: #CCC;' + 'polygon-opacity: 0.9;' + 'line-width: 2;' + 'line-color: #636363;' + 'line-opacity: 0.5;}']
  };
  var CartoStyleSheet = function CartoStyleSheet(tableName, nullOutlineCss, bucketCalculator, mode, fieldName) {
    this.tableName = tableName;
    this.nullOutlineCss = nullOutlineCss;
    this.bucketCalculator = bucketCalculator;
    this.mode = mode;
    this.fieldName = fieldName;

    // hack: these field names get a null style IF iscompliantflag = false (i.e. site_eui_wn is null)
    this.fieldNamesToNull = ['total_ghg_emissions', 'total_ghg_emissions_intensity', 'energy_star_score'];
  };
  CartoStyleSheet.prototype.toCartoCSS = function () {
    var bucketCSS = this.bucketCalculator.toCartoCSS();
    var tableName = this.tableName;
    var mode = this.mode;
    var outline = this.nullOutlineCss;
    if (outline && mode === 'footprints') mode = 'footprints_null_outline';

    // a CartoCSS hack we have to employ in order to symbolize some fields as null, when iscompliantflag is null
    // to do this we inject a new rule, in the form of 
    // "#benchmarking_production [total_ghg_emissions>=0][iscompliantflag=false]{polygon-fill:#CCC; line-color: #636363}"
    // if the incoming field is not in that list of fields, then we don't do that (startingCSS is an empty array)
    var startingCSS = [];
    if (this.fieldNamesToNull.indexOf(this.fieldName) > -1) {
      var fillType = mode === 'dots' ? 'marker-fill' : 'polygon-fill';
      // another map style hack: Energy Star does not get an outline for null, but the others do
      var lineColor = this.fieldName === 'energy_star_score' ? '' : ' line-color: #636363';
      startingCSS = ["[".concat(this.fieldName, ">=0][iscompliantflag=false]{").concat(fillType, ":#CCC;").concat(lineColor, "}")];
    }
    startingCSS = _toConsumableArray(baseCartoCSS[mode]).concat(startingCSS);
    var styles = _toConsumableArray(startingCSS).concat(bucketCSS);
    styles = _.reject(styles, function (s) {
      return !s;
    });
    styles = _.map(styles, function (s) {
      return "#".concat(tableName, " ").concat(s);
    });
    styles = styles.join('\n');
    return styles;
  };
  var BuildingInfoPresenter = function BuildingInfoPresenter(city, allBuildings, buildingId, idKey, controls, layerName, defaultColor) {
    this.city = city;
    this.allBuildings = allBuildings;
    this.buildingId = buildingId;
    this.idKey = idKey;
    this.controls = controls;
    this.layerName = layerName;
    this.defaultColor = defaultColor || 'blue';
  };
  BuildingInfoPresenter.prototype.toLatLng = function () {
    var building = this.toBuilding();
    if (typeof building === 'undefined') return null;
    return {
      lat: building.get('lat'),
      lng: building.get('lng')
    };
  };
  BuildingInfoPresenter.prototype.toBuilding = function () {
    var _this = this;
    return this.allBuildings.find(function (building) {
      return building.get(_this.idKey) == _this.buildingId;
    }, this);
  };
  BuildingInfoPresenter.prototype.toPopulatedLabels = function () {
    var building = this.toBuilding();
    var o = {};
    if (typeof building === 'undefined') return o;
    o.items = _.map(this.city.get('popup_fields'), function (field) {
      var value = building.get(field.field);
      value = field.skipFormatter ? value || 'N/A' : (value || 'N/A').toLocaleString();
      var label = field.label;
      var template = null;
      if (field.template) {
        var key = '{' + field.field + '}';
        template = field.template.replace(key, value);
        label = null;
      }
      return {
        value: value,
        label: label,
        template: template,
        klass: field.field
      };
    }, this);

    // chart

    var chartData = this.city.get('popup_chart');
    if (!chartData) return o;
    o.chart = {};
    o.chart.year = this.city.get('year');
    o.chart.lead = {
      value: building.get(chartData.lead.field),
      color: this.getColor(chartData.lead.field, building.get(chartData.lead.field)),
      label: chartData.lead.label
    };

    // this will show in the popup if there is a value, and the lead value is not nodata
    // see the template for details (building_info.html)
    o.chart.secondary = {
      value: building.get(chartData.secondary.field),
      color: this.getColor(chartData.secondary.field, building.get(chartData.secondary.field)),
      label: chartData.secondary.label
    };

    // lead field in "popup_chart" from seattle.json is site_eui_wn

    if (!_.isNumber(o.chart.lead.value) || _.isNaN(o.chart.lead.value)) {
      o.chart.lead.nodata = chartData.lead.nodata;
      // if state building, then flag that also
      if (building.get('state_bldg')) o.chart.lead.state_bldg = true;
    }
    o.chart.barchart = {
      value: building.get(chartData.barchart.field),
      color: this.getColor(chartData.barchart.field, building.get(chartData.barchart.field)),
      desc: chartData.barchart.desc,
      min: chartData.barchart.min,
      max: chartData.barchart.max
    };
    if (!_.isNumber(o.chart.barchart.value) || _.isNaN(o.chart.barchart.value)) {
      o.chart.barchart.nodata = chartData.barchart.nodata;
    }
    return o;
  };
  BuildingInfoPresenter.prototype.getColor = function (field, value) {
    if (!this.controls || !this.controls._wrapped) return this.defaultColor;

    // TODO: fix hacky way to deal w/ quartiles
    var filter = this.controls._wrapped.find(function (item) {
      if (item.viewType !== 'filter') return false;
      if (item.layer.id === 'site_eui_quartiles') {
        return false;
        // return field === 'site_eui' && this.layerName  === 'site_eui_quartiles';
      }
      return item.layer.field_name === field;
    });
    if (!filter) return this.defaultColor;
    return filter.getColorForValue(value);
  };

  /*
    Determines which map layer should be showing on the map
    Currently hardwired to show 'dots' or 'footprints'
   */
  var BuildingLayerWatcher = function BuildingLayerWatcher(config, map) {
    this.config = config;
    this.map = map;
    this.currentZoom = null;
    this.footprintsAllowed = this.config.allowable || false;
    this.mode = this.getMode();
  };
  BuildingLayerWatcher.prototype.getMode = function () {
    if (!this.footprintsAllowed) return 'dots'; // `dots` are going to be our default

    var zoom = this.map.getZoom();
    if (this.currentZoom === zoom) return this.mode;
    this.currentZoom = zoom;
    return zoom >= this.config.atZoom ? 'footprints' : 'dots';
  };

  // Determines whether to change the layer type
  BuildingLayerWatcher.prototype.check = function () {
    if (!this.footprintsAllowed) return false;
    var mode = this.getMode();
    if (mode === this.mode) return false;
    this.mode = mode;
    return true;
  };
  BuildingLayerWatcher.prototype.fillType = function () {
    return this.mode === 'dots' ? 'marker-fill' : 'polygon-fill';
  };

  /*
    To render building footprints we need to join on the footprint table.
    There is no need to wrap it in the building collection sql function, since
    it only impacts the map layer. It does borrow most of the logic for sql
    generation from the building collection sql function however.
   */
  var FootprintGenerateSql = function FootprintGenerateSql(footprintConfig, maplayers) {
    this.footprintConfig = footprintConfig;
    this.mapLayerFields = maplayers.map(function (lyr) {
      return 'b.' + lyr.field_name;
    });
    this.mapLayerFields.push('b.id');
    // hack: Make CartoCSS work with isCompliantFlag
    this.mapLayerFields.push('b.iscompliantflag');
    this.mapLayerFields = _.uniq(this.mapLayerFields);
    this.mapLayerFields = this.mapLayerFields.join(',');
  };
  FootprintGenerateSql.prototype.sql = function (components) {
    var tableFootprint = this.footprintConfig.table_name;
    var tableData = components.table;

    // Base query
    var query = 'SELECT a.*,' + this.mapLayerFields + ' FROM ' + tableFootprint + ' a,' + tableData + ' b WHERE a.buildingid = b.id AND ';
    var filterSql = components.year.concat(components.range).concat(components.category).filter(function (e) {
      return e.length > 0;
    });
    query += filterSql.join(' AND ');
    return query;
  };
  var LayerView = Backbone.View.extend({
    initialize: function initialize(options) {
      this.state = options.state;
      this.leafletMap = options.leafletMap;
      this.mapView = options.mapView;
      this.mapElm = $(this.leafletMap._container);
      this.allBuildings = new CityBuildings(null, {});
      this.footprints_cfg = this.state.get('city').get('building_footprints');
      this.buildingLayerWatcher = new BuildingLayerWatcher(this.footprints_cfg, this.leafletMap);
      this.footprintGenerateSql = new FootprintGenerateSql(this.footprints_cfg, this.state.get('city').get('map_layers'));

      // Listen for all changes but filter in the handler for these
      // attributes: layer, filters, categories, and tableName
      this.listenTo(this.state, 'change', this.changeStateChecker);

      // building has a different handler
      this.listenTo(this.state, 'change:building', this.onBuildingChange);
      this.listenTo(this.allBuildings, 'sync', this.render);
      this.listenTo(this.state, 'clearMapPopup', this.onClearMapPopupTrigger, this);
      var self = this;
      this.leafletMap.on('popupclose', function (e) {
        // When the map is closing the popup the id's will match,
        // so close.  Otherwise were probably closing an old popup
        // to open a new one for a new building
        if (e.popup._buildingid === self.state.get('building')) {
          e.popup._buildingid = null;
          self._popupid = undefined;
          self.state.set({
            building: null
          });
        }
        self.removeBuildingOutline();
      });
      this.leafletMap.on('popupopen', function (e) {
        $('#view-report').on('click', self.onViewReportClick.bind(self));
        $('#compare-building').on('click', self.onCompareBuildingClick.bind(self));
        self.addBuildingOutline();
      });
    },
    // Add outline to highlight dot or footprint
    addBuildingOutline: function () {
      var _addBuildingOutline = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var building_id, propertyId, presenter, latlng, layerMode, circle, cartoDbUser, url, tablename, query, response, json, features, geojson, poly;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              building_id = this.state.get('building');
              propertyId = this.state.get('city').get('property_id');
              if (this.buildingLayerWatcher.mode !== 'dots') {
                propertyId = this.footprints_cfg.property_id;
              }
              presenter = new BuildingInfoPresenter(this.state.get('city'), this.allBuildings, building_id, propertyId, this.mapView.getControls(), this.state.get('layer'));
              if (presenter.toLatLng()) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return");
            case 6:
              latlng = presenter.toLatLng();
              this.leafletMap.highlightLayer.clearLayers();
              layerMode = this.buildingLayerWatcher.mode;
              if (!(layerMode === 'dots')) {
                _context.next = 15;
                break;
              }
              // if this is dots, then add a circle
              circle = L.circleMarker([latlng.lat, latlng.lng], {
                radius: 5,
                fill: false,
                color: '#000',
                weight: 3,
                opacity: 1
              }).addTo(this.leafletMap.highlightLayer);
              this.state.set({
                'dot_highlight': circle
              });
              this.state.set({
                'has_highlight': 'dots'
              });
              _context.next = 33;
              break;
            case 15:
              // otherwise this is 'footprints': add a polygon from geojson
              cartoDbUser = this.state.get('cartoDbUser');
              url = "https://".concat(cartoDbUser, ".carto.com/api/v2/sql");
              tablename = this.footprints_cfg.table_name;
              query = "SELECT cartodb_id,ST_AsGeoJSON(the_geom) as geojson FROM ".concat(tablename, " WHERE buildingid=").concat(building_id);
              _context.next = 21;
              return fetch("".concat(url, "/?q=").concat(query));
            case 21:
              response = _context.sent;
              _context.next = 24;
              return response.json();
            case 24:
              json = _context.sent;
              // parse the incoming features. There can be one to many of them
              features = [];
              json.rows.forEach(function (row) {
                var f = JSON.parse(row.geojson);
                features.push(f);
              });
              // create an output FeatureCollection
              geojson = {
                type: 'FeatureCollection',
                features: features
              };
              poly = L.geoJson(geojson, {});
              poly.setStyle({
                fill: false,
                color: '#000',
                weight: 3,
                opacity: 1
              });
              poly.addTo(this.leafletMap.highlightLayer);
              this.state.set({
                'footprint_highlight': poly
              });
              this.state.set({
                'has_highlight': 'footprints'
              });
            case 33:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function addBuildingOutline() {
        return _addBuildingOutline.apply(this, arguments);
      }
      return addBuildingOutline;
    }(),
    // Remove building or dot highlight
    removeBuildingOutline: function removeBuildingOutline() {
      this.leafletMap.highlightLayer.clearLayers();
      this.state.set({
        'footprint_highlight': null
      });
      this.state.set({
        'dot_highlight': null
      });
      this.state.set({
        'has_highlight': false
      });
    },
    // Keep popup in map view after showing more details
    adjustPopup: function adjustPopup(layer) {
      var container = $(layer._container);
      var latlng = layer.getLatLng();
      var pt = this.leafletMap.latLngToContainerPoint(latlng);
      var height = container.height();
      var top = pt.y - height;
      if (top < 0) {
        this.leafletMap.panBy([0, top]);
      }
    },
    onClearMapPopupTrigger: function onClearMapPopupTrigger() {
      this.onClearPopups();
    },
    onClearPopups: function onClearPopups() {
      var map = this.leafletMap;
      map.eachLayer(function (lyr) {
        // the only reference to _tip, is this used? 
        if (lyr._tip) {
          map.removeLayer(lyr);
        }
      });
    },
    isSelectedBuilding: function isSelectedBuilding(selected_buildings, id) {
      var hasBuilding = selected_buildings.find(function (b) {
        return b.id === id;
      });
      return hasBuilding;
    },
    makeSelectedBuildingsState: function makeSelectedBuildingsState(id) {
      var selected_buildings = this.state.get('selected_buildings') || [];
      if (this.isSelectedBuilding(selected_buildings, id)) return null;
      if (selected_buildings.length === 5) return null;
      var out = selected_buildings.map(function (b) {
        b.selected = false;
        return b;
      });
      out.push({
        id: id,
        insertedAt: Date.now(),
        selected: true
      });
      out.sort(function (a, b) {
        return a.insertedAt - b.insertedAt;
      });
      return out;
    },
    onCompareBuildingClick: function onCompareBuildingClick(evt) {
      if (evt.preventDefault) evt.preventDefault();
      var buildingId = this.state.get('building');
      if (!buildingId) return;
      this.onClearPopups();
      this.state.set({
        building_compare_active: true
      });
      return false;
    },
    onViewReportClick: function onViewReportClick(evt) {
      if (evt.preventDefault) evt.preventDefault();
      this.state.set({
        report_active: true
      });
      return false;
    },
    onBuildingChange: function onBuildingChange() {
      var building_id = this.state.get('building');
      var isShowing = building_id === this._popupid;
      if (!this.allBuildings.length) return;
      if (!building_id || isShowing) return;
      if (!this.mapView.getControls()) return;

      // The only reference to popup_dirty, is this used? 
      this.popup_dirty = false;
      var propertyId = this.state.get('city').get('property_id');
      if (this.buildingLayerWatcher.mode !== 'dots') {
        propertyId = this.footprints_cfg.property_id;
      }
      var template = _.template(BuildingInfoTemplate);
      var presenter = new BuildingInfoPresenter(this.state.get('city'), this.allBuildings, building_id, propertyId, this.mapView.getControls(), this.state.get('layer'));
      if (!presenter.toLatLng()) return;
      var popup = L.popup({
        autoPan: false
      }).setLatLng(presenter.toLatLng()).setContent(template({
        data: presenter.toPopulatedLabels(),
        compare_disabled: ''
      }));
      this.leafletMap.panTo(presenter.toLatLng());
      this._popupid = building_id;
      popup._buildingid = building_id;
      popup.openOn(this.leafletMap);
    },
    onFeatureClick: function onFeatureClick(event, latlng, _unused, data) {
      var propertyId = this.state.get('city').get('property_id');
      if (this.buildingLayerWatcher.mode !== 'dots') {
        propertyId = this.footprints_cfg.property_id;
      }
      var buildingId = data[propertyId];
      var state = {
        building: buildingId
      };
      var selectedBuildings = this.makeSelectedBuildingsState(buildingId);
      if (selectedBuildings) {
        state.selected_buildings = selectedBuildings;
      }
      this.state.set(state);
    },
    onFeatureOver: function onFeatureOver(e, latlng, _unused, data) {
      // change the cursor to pointer, indicating that we can click a given building
      this.mapElm.css('cursor', 'pointer');

      // get the name of the id field to lookup, which is different for footprints and dots
      var propertyId = this.state.get('city').get('property_id');
      if (this.buildingLayerWatcher.mode !== 'dots') {
        propertyId = this.footprints_cfg.property_id;
      }
      // get the id of the hovered building
      var buildingId = data[propertyId];

      // find the building in the building data
      var building = this.allBuildings.find(function (building) {
        return building.get(propertyId) == buildingId;
      }, this);

      // get the name and the id of the building
      var id = building.get('id');
      var name = building.get('property_name');

      // get the tooltip element with d3
      var tooltip = d3.select('div.cartodb-tooltip');
      // update the tooltip with the building name and id
      tooltip.html("<strong>".concat(name, "</strong><br>Building ID: <strong>").concat(id, "</strong>"));

      // get the coordinates of the building that is being hovered,
      // and convert to container points
      var coords = this.leafletMap.latLngToContainerPoint(latlng);

      // show and position the tootlip
      tooltip.style('display', 'block').style('top', coords.y - 15 + "px").style('left', coords.x + 15 + "px");
    },
    onFeatureOut: function onFeatureOut() {
      // change back to the default cursor
      this.mapElm.css('cursor', '');

      // hide the tooltip
      $('div.cartodb-tooltip').hide();
    },
    onStateChange: function onStateChange() {
      // TODO: should not be mutating the buildings model.
      _.extend(this.allBuildings, this.state.pick('tableName', 'cartoDbUser'));
      this.allBuildings.fetch(this.state.get('year'));
    },
    changeStateChecker: function changeStateChecker() {
      // filters change
      if (this.state._previousAttributes.filters !== this.state.attributes.filters) {
        return this.onStateChange();
      }
      // layer change
      if (this.state._previousAttributes.layer !== this.state.attributes.layer) {
        return this.onStateChange();
      }
      // catergory change
      if (this.state._previousAttributes.categories !== this.state.attributes.categories) {
        return this.onStateChange();
      }
      // tableName change
      if (this.state._previousAttributes.tableName !== this.state.attributes.tableName) {
        return this.onStateChange();
      }

      // mapzoom change we need to re-render the map
      // to show either 'dots' or 'footprints'
      if (this.state._previousAttributes.zoom !== this.state.attributes.zoom) {
        if (this.buildingLayerWatcher.check()) {
          this.render();
          // also re-render the building highlights, which will swap out dots for footprints as needed
          if (this.state.get('has_highlight')) this.addBuildingOutline();
        }
      }
    },
    toCartoSublayer: function toCartoSublayer() {
      var layerMode = this.buildingLayerWatcher.mode;
      var cssFillType = this.buildingLayerWatcher.fillType();
      var buildings = this.allBuildings;
      var state = this.state;
      var city = state.get('city');
      var year = state.get('year');
      var layer = state.get('layer');
      var cityLayer = _.find(city.get('map_layers'), function (lyr) {
        if (lyr.id) return lyr.id === layer;
        return lyr.field_name === layer;
      });
      var fieldName = cityLayer.field_name;
      var nullOutlineCss = cityLayer.null_outline_css;
      var buckets = cityLayer.range_slice_count;
      var colorStops = cityLayer.color_range;
      var thresholds = cityLayer.thresholds ? state.get('layer_thresholds') : null;
      var calculator = new BuildingColorBucketCalculator(buildings, fieldName, buckets, colorStops, cssFillType, thresholds);
      var stylesheet = new CartoStyleSheet(buildings.tableName, nullOutlineCss, calculator, layerMode, fieldName);
      var cartocss = stylesheet.toCartoCSS();
      var sql = layerMode === 'dots' ? buildings.toSql(year, state.get('categories'), state.get('filters')) : this.footprintGenerateSql.sql(buildings.toSqlComponents(year, state.get('categories'), state.get('filters'), 'b.'));
      var interactivity = this.state.get('city').get('property_id');
      return {
        sql: sql,
        cartocss: cartocss,
        interactivity: layerMode === 'dots' ? interactivity : interactivity += ',' + this.footprints_cfg.property_id
      };
    },
    render: function render() {
      if (this.cartoLayer) {
        this.cartoLayer.getSubLayer(0).set(this.toCartoSublayer()).show();
        return this;
      }

      // skip if we are loading `cartoLayer`
      if (this.cartoLoading) return;
      this.cartoLoading = true;
      cartodb.createLayer(this.leafletMap, {
        user_name: this.allBuildings.cartoDbUser,
        type: 'cartodb',
        sublayers: [this.toCartoSublayer()]
      }, {
        https: true
      }).addTo(this.leafletMap).on('done', this.onCartoLoad, this);
      return this;
    },
    onCartoLoad: function onCartoLoad(layer) {
      this.cartoLoading = false;
      var sub = layer.getSubLayer(0);
      this.cartoLayer = layer;
      sub.setInteraction(true);
      sub.on('featureClick', this.onFeatureClick, this);
      sub.on('featureOver', this.onFeatureOver, this);
      sub.on('featureOut', this.onFeatureOut, this);
      this.onBuildingChange();
    }
  });
  return LayerView;
});