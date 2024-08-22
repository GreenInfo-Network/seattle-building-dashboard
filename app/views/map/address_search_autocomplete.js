"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
define(['jquery', 'underscore', 'backbone', 'toastr', 'fusejs', 'autocomplete', 'text!templates/map/address_search.html', 'text!templates/map/address_search_results.html'], function ($, _, Backbone, toastr, Fuse, AutoComplete, AddressSearchTemplate, AddressSearchResultTemplate) {
  var AddressSearchACView = Backbone.View.extend({
    $container: $('#search'),
    SEARCH_KEY_FOR_SELECTED: 'reported_address',
    SEARCH_EXTERNAL_SEARCH_HEADER: 'Nearby buildings...',
    SYNC_WITH_STATE: true,
    ERRORS: {
      noimage: 'Address not found! Try adding the relevant zip code.'
    },
    initialize: function initialize(options) {
      this.mapView = options.mapView;
      this.state = options.state;
      this.fuse = null;
      this.autocomplete = null;
      this.listenTo(this.state, 'change:city', this.onCityChange);
      this.listenTo(this.state, 'change:allbuildings', this.onBuildingsChange);
      this.listenTo(this.state, 'change:building', this.onBuildingChange);
      if (!String.prototype.trim) {
        String.prototype.trim = function () {
          return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
      }
    },
    configure: function configure() {
      var config = this.config = this.state.get('city').get('search');
      this.SEARCH_URL = config.url;
      this.SEARCH_BOUNDS = config.bounds;
      this.SEARCH_API_KEY = config.api_key;
      this.SEARCH_KEYS = config.terms;
    },
    onCityChange: function onCityChange() {
      this.listenTo(this.state.get('city'), 'sync', this.onCitySync);
    },
    onCitySync: function onCitySync() {
      this.configure();
      this.render();
    },
    onBuildingChange: function onBuildingChange() {
      if (!this.SYNC_WITH_STATE) return;
      var buildings = this.state.get('allbuildings');
      var property_id = this.state.get('building');
      var city = this.state.get('city');
      if (_.isUndefined(buildings) || _.isUndefined(city)) return;
      var building = buildings.find(function (building) {
        return building.get(city.get('property_id')) == property_id;
      });
      if (building) {
        $('#address-search').val(building.get(this.SEARCH_KEY_FOR_SELECTED));
      } else {
        $('#address-search').val('');
        this.clearMarker();
      }
    },
    getLatLng: function getLatLng(building) {
      return [parseFloat(building.get('lat')), parseFloat(building.get('lng'))];
    },
    render: function render() {
      this.$container.html(_.template(AddressSearchTemplate));
      return this;
    },
    getBuildingDataForSearch: function getBuildingDataForSearch(building) {
      var _this$getLatLng = this.getLatLng(building),
        _this$getLatLng2 = _slicedToArray(_this$getLatLng, 2),
        lat = _this$getLatLng2[0],
        lng = _this$getLatLng2[1];
      var rsp = {
        id: building.cid,
        latlng: L.latLng(lat, lng)
      };
      var valid = true;
      this.SEARCH_KEYS.forEach(function (obj) {
        var value = building.get(obj.key) + '';
        rsp[obj.name] = value.trim();
        if (!rsp[obj.name].length) valid = false;
      });
      return valid ? rsp : null;
    },
    onBuildingsChange: function onBuildingsChange() {
      var _this = this;
      var buildings = this.state.get('allbuildings');
      var things = this.things = [];
      var skipRender = this.SEARCH_KEYS.filter(function (d) {
        return d.hide;
      }).map(function (d) {
        return d.name;
      });
      buildings.forEach(function (building, i) {
        var buildingData = _this.getBuildingDataForSearch(building);
        if (buildingData) things.push(buildingData);
      });
      var options = _objectSpread({}, this.config.fuse_options);
      options.keys = this.SEARCH_KEYS.map(function (d) {
        return d.name;
      });

      // fuzzy search engine
      this.fuse = new Fuse(things, options);
      if (this.autocomplete) {
        this.autocomplete.destroy();
        this.autocomplete = null;
      }

      // autocomplete setup
      this.autocomplete = new autoComplete({
        // eslint-disable-line no-undef
        selector: '#address-search',
        menuClass: 'address-search-results',
        minChars: 1,
        delay: 200,
        offsetTop: 10,
        cache: false,
        source: function source(term, suggest, doExternalSearch) {
          var wrapper = _this.wrapper(term, suggest, new Date().getTime(), _this);
          if (_this.$autocompleteHeader) _this.$autocompleteHeader.removeClass('show');
          if (doExternalSearch) {
            _this.search(term, wrapper);
          } else {
            var val = term.toLowerCase();
            var results = _this.fuse.search(val);
            var matches = results.map(function (d) {
              var m = [];
              _this.SEARCH_KEYS.forEach(function (opt) {
                var name = opt.name;
                if (!d.item[name] || !d.item[name].length) return;
                var matched = false;
                d.matches.forEach(function (mat) {
                  if (mat.key === name) matched = true;
                });
                m.push({
                  key: name,
                  value: d.item[name],
                  matched: matched
                });
              });
              return {
                building_id: d.item.id,
                items: m
              };
            });
            wrapper(term, matches);
          }
        },
        renderItem: function renderItem(result, search) {
          search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          var re = new RegExp('(' + search.split(' ').join('|') + ')', 'gi');
          var template = _.template(AddressSearchResultTemplate);
          result.items.filter(function (d) {
            return skipRender.indexOf(d.key) === -1;
          }).forEach(function (item) {
            item.formatted_value = item.matched ? item.value.replace(re, '<b>$1</b>') : item.value;
            if (item.key === 'property_id') {
              item.formatted_value = 'Building ID: ' + item.formatted_value;
            }
          });
          return template(result);
        },
        onSelect: function onSelect(e, term, item) {
          if (item) {
            var id = item.getAttribute('data-building');
            var building = buildings.get(id);
            var _this$getLatLng3 = _this.getLatLng(building),
              _this$getLatLng4 = _slicedToArray(_this$getLatLng3, 2),
              lat = _this$getLatLng4[0],
              lng = _this$getLatLng4[1];
            var propertyId = _this.state.get('city').get('property_id');
            _this.centerMapOn([lat, lng]);
            if (_this.SYNC_WITH_STATE) {
              var buildingId = building.get(propertyId);
              var state = {
                building: buildingId
              };
              var selectedBuildings = _this.makeSelectedBuildingsState(buildingId);
              if (selectedBuildings) {
                state.selected_buildings = selectedBuildings;
              }
              _this.state.set(state);
            }
          }
        }
      });
      if (this.SYNC_WITH_STATE) this.onBuildingChange();
      this.$autocompleteHeader = $('.autocomplete-suggestions-header');
      this.$autocompleteHeader.text(this.SEARCH_EXTERNAL_SEARCH_HEADER);
    },
    wrapper: function wrapper(term, suggest, started_at, ctx) {
      return function (from_term, items, err) {
        if (from_term == term && ctx.maxReqTimestampRendered > started_at) return;
        ctx.maxReqTimestampRendered = started_at;
        if (err) {
          ctx.errorReporter(err);
        }
        suggest(items);
      };
    },
    maxReqTimestampRendered: new Date().getTime(),
    search: function search(term, callback) {
      var _this2 = this;
      if (!term) return callback(term, [], null);
      var url = this.SEARCH_URL;
      var bounds = this.SEARCH_BOUNDS;
      try {
        this.xhr.abort();
      } catch (e) {
        //
      }
      this.xhr = $.ajax({
        url: url,
        data: {
          'q': term + ',' + this.state.get('city').get('address_search_regional_context'),
          'countrycodes': 'US',
          'limit': 10,
          'addressdetails': 1,
          'viewbox': [bounds[0], bounds[1], bounds[2], bounds[3]].join(','),
          'format': 'geojson'
        },
        error: function error(xhr, status, err) {
          var errMsg = _this2.onAjaxAddressError(xhr);
          _this2.errorReporter(errMsg);
          callback(term, [], null);
        },
        success: function success(data, status) {
          var results = _this2.onAjaxAddressSuccess(data, term);
          if (!results.buildings.length) _this2.errorReporter(_this2.ERRORS.noimage);
          if (results.match) {
            _this2.centerMapOn(results.match);
            callback(term, [], null);
          } else {
            if (_this2.$autocompleteHeader) _this2.$autocompleteHeader.addClass('show');
            callback(term, results.buildings, null);
          }
        }
      });
    },
    getDistances: function getDistances(loc) {
      var limit = 400;
      var distances = [];
      this.things.forEach(function (thing) {
        var d = loc.distanceTo(thing.latlng);
        if (d < limit) distances.push({
          id: thing.id,
          d: d
        });
      });
      return distances;
    },
    onAjaxAddressError: function onAjaxAddressError(err) {
      // If more specificity is desired, see:
      // https://mapzen.com/documentation/search/http-status-codes/
      return 'The search service is having problems :-(';
    },
    onAjaxAddressSuccess: function onAjaxAddressSuccess(data, term) {
      var _this3 = this;
      var regional_context = this.state.get('city').get('address_search_regional_context');
      var features = (data.features || []).filter(function (feat) {
        // NOTE: mapzen search returned a property called "region"
        // there is no equivalent in Nominatim, but there is "address.city"
        // I'm not sure this will always match "regional_context" but it does here ("Seattle")
        // in any case, we already restrict results to bounds that should largely countain Seattle
        return feat.properties.address.city && feat.properties.address.city === regional_context;
      });
      if (!features.length) return {
        match: false,
        buildings: []
      };
      var buildings = this.state.get('allbuildings');
      var keys = this.SEARCH_KEYS.map(function (d) {
        return d.name;
      });
      var closestBuildings = [];
      var match = null;
      features.forEach(function (feature) {
        var distances = _this3.getDistances(L.latLng(feature.geometry.coordinates.reverse()));
        closestBuildings = closestBuildings.concat(distances);
      });
      closestBuildings = _.uniq(closestBuildings, false, function (item) {
        return item.id;
      });
      closestBuildings = _.sortBy(closestBuildings, 'd');
      closestBuildings = closestBuildings.slice(0, 10);
      closestBuildings = closestBuildings.map(function (item) {
        var building = buildings.get(item.id);
        var buildingData = _this3.getBuildingDataForSearch(building);
        var m = {};
        m.building_id = buildingData.id;
        m.items = [];
        keys.forEach(function (k) {
          var value = buildingData[k] || null;
          if (!value) return;
          if (k in buildingData && buildingData[k] === term) {
            match = [buildingData.latlng.lat, buildingData.latlng.lng];
          }
          m.items.push({
            key: k,
            value: value,
            matched: false
          });
        });
        return m;
      });
      return {
        match: match,
        buildings: closestBuildings
      };
    },
    errorReporter: function errorReporter(msg) {
      toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: false,
        progressBar: false,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        onclick: null,
        showDuration: '300',
        hideDuration: '1000',
        timeOut: '5000',
        extendedTimeOut: '1000',
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut'
      };
      toastr.error(msg);
    },
    centerMapOn: function centerMapOn(coordinates) {
      this.placeMarker(coordinates);
      this.mapView.leafletMap.setView(coordinates);
    },
    makeSelectedBuildingsState: function makeSelectedBuildingsState(id) {
      var selected_buildings = this.state.get('selected_buildings') || [];
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
    placeMarker: function placeMarker(coordinates) {
      var map = this.mapView.leafletMap;
      if (!map) return;
      this.clearMarker();
      var icon = new L.Icon({
        iconUrl: 'images/marker.svg',
        iconRetinaUrl: 'images/marker.svg',
        iconSize: [16, 28],
        iconAnchor: [8, 28],
        popupAnchor: [-3, -76],
        shadowUrl: '',
        shadowRetinaUrl: '',
        shadowSize: [0, 0],
        shadowAnchor: [22, 94]
      });
      this.marker = L.marker(coordinates, {
        icon: icon
      }).addTo(map);
    },
    clearMarker: function clearMarker() {
      var map = this.mapView.leafletMap;
      if (!map) return;
      if (this.marker) {
        map.removeLayer(this.marker);
      }
    }
  });
  return AddressSearchACView;
});