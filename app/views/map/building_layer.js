"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
define(['jquery', 'underscore', 'backbone', 'collections/city_buildings', 'models/building_color_bucket_calculator', 'text!templates/map/building_info.html'], function ($, _, Backbone, CityBuildings, BuildingColorBucketCalculator, BuildingInfoTemplate) {
  var baseCartoCSS = {
    dots: ['{marker-fill: #CCC;' + 'marker-fill-opacity: 0.9;' + 'marker-line-color: #FFF;' + 'marker-line-width: 0.5;' + 'marker-line-opacity: 1;' + 'marker-placement: point;' + 'marker-multi-policy: largest;' + 'marker-type: ellipse;' + 'marker-allow-overlap: true;' + 'marker-clip: false;}'],
    footprints: ['{polygon-fill: #CCC;' + 'polygon-opacity: 0.9;' + 'line-width: 1;' + 'line-color: #FFF;' + 'line-opacity: 0.5;' +
    // we need to include these declarations, even if we're not using the pattern (e.g for Energy Star Score)
    // because CARTO balks if we include pattern-opacity in later declarations, without having first declared the pattern-file
    'polygon-pattern-file: url(https://seattle-buildings-polygon-hatch-images.s3.us-west-1.amazonaws.com/hatch_double_cross_grey_45_narrow_thin_transparent.png);' + 'polygon-pattern-opacity: 0;}'],
    // A hatch polygon that only applies to buildings with null values for the given measure
    // we make the pattern transparent for all non-null values in building_color_bucket_calculator.js
    footprints_hatch: ['{polygon-fill: #CCC;' + 'polygon-opacity: 0.9;' + 'line-width: 1;' + 'line-color: #FFF;' + 'line-opacity: 0.5;' + 'polygon-pattern-file: url(https://seattle-buildings-polygon-hatch-images.s3.us-west-1.amazonaws.com/hatch_double_cross_grey_45_narrow_thin_transparent.png);' + 'polygon-pattern-opacity: 1;}']
  };
  var CartoStyleSheet = function CartoStyleSheet(tableName, hatchCss, bucketCalculator, mode) {
    this.tableName = tableName;
    this.hatchCss = hatchCss;
    this.bucketCalculator = bucketCalculator;
    this.mode = mode;
  };
  CartoStyleSheet.prototype.toCartoCSS = function () {
    var bucketCSS = this.bucketCalculator.toCartoCSS();
    var tableName = this.tableName;
    var mode = this.mode;
    var hatch = this.hatchCss;
    if (hatch && mode === 'footprints') mode = "".concat(mode, "_hatch");
    var styles = _toConsumableArray(baseCartoCSS[mode]).concat(bucketCSS);
    styles = _.reject(styles, function (s) {
      return !s;
    });
    styles = _.map(styles, function (s) {
      return "#".concat(tableName, " ").concat(s);
    });
    return styles.join('\n');
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

    // console.log(o.chart.lead);

    if (!_.isNumber(o.chart.lead.value) || _.isNaN(o.chart.lead.value)) {
      o.chart.lead.nodata = chartData.lead.nodata;
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
      var _addBuildingOutline = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var building_id, propertyId, presenter, latlng, layerMode, circle, cartoDbUser, url, tablename, query, response, json, features, geojson, poly;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
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
      console.log('-----------------');
      console.log('hitting onBuildingChagne');
      console.log('(!building_id || isShowing) is true? ', (!building_id || isShowing) === true);
      // debugger;
      if (!this.allBuildings.length) return;
      if (!building_id || isShowing) return;
      if (!this.mapView.getControls()) return;
      console.log('... and made it past early exits');
      console.log('building ID: ', building_id);
      console.log('popup ID: ', this._popupid);
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

      // update the tooltip
      var tooltip = $('div.cartodb-tooltip');
      tooltip.html("<strong>".concat(name, "</strong><br>Building ID: <strong>").concat(id, "</strong>"));
      var winwidth = $(window).width();
      var top = 60;
      var left = 335;
      if (winwidth < 1200) {
        top = 50;
        left = 290;
      }
      if (winwidth < 850) {
        top = 50;
        left = 250;
      }
      tooltip.css({
        top: e.pageY - top,
        left: e.pageX - left,
        display: 'block'
      });
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
      var hatchCss = cityLayer.hatch_null_css;
      var buckets = cityLayer.range_slice_count;
      var colorStops = cityLayer.color_range;
      var thresholds = cityLayer.thresholds ? state.get('layer_thresholds') : null;
      var calculator = new BuildingColorBucketCalculator(buildings, fieldName, buckets, colorStops, cssFillType, thresholds);
      var stylesheet = new CartoStyleSheet(buildings.tableName, hatchCss, calculator, layerMode);
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