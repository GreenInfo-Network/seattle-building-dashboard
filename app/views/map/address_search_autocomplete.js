"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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