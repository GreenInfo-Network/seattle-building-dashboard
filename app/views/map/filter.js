"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
define(['jquery', 'underscore', 'backbone', 'd3', 'ionrangeslider', 'models/building_bucket_calculator', 'models/building_color_bucket_calculator', 'views/charts/histogram', 'utils/formatters', 'utils/threshold', 'text!templates/map_controls/filter_section_header.html', 'text!templates/map_controls/filter.html', 'text!templates/map_controls/filter_quartile.html', 'text!templates/map_controls/filter_container.html', 'text!templates/map_controls/filter_building_details.html', 'text!templates/map_controls/filter_property_type.html'], function ($, _, Backbone, d3, Ion, BuildingBucketCalculator, BuildingColorBucketCalculator, HistogramView, Formatters, ThresholdUtils, FilterSectionHeader, FilterTemplate, FilterQuartileTemplate, FilterContainer, FilterBuildingDetailsTemplate, FilterPropertyTypeTemplate) {
  var MapControlView = Backbone.View.extend({
    className: 'map-control',
    $container: $('#map-controls-content--inner'),
    viewType: 'filter',
    initialize: function initialize(options) {
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
      this.listenTo(this.state, 'change:layer', this.onLayerChange);
      this.listenTo(this.state, 'change:selected_buildings', this.updateBuildingDetails);
      this.listenTo(this.state, 'change:categories', this.onCategoryChange);
      this._valueFormatter = this.layer.formatter === 'threshold' ? Formatters.get(this.layer.formatter, this.layer.threshold_labels) : Formatters.get(this.layer.formatter);

      // set key for property_type
      this.propertyTypeKey = 'property_type';

      // Hack to keep track of property_type changes
      this._lastPropertyType = null;
      this.isThreshold = this.layer.thresholds ? true : false;
      this.initRender = true;
      this.memorize();
    },
    onLayerChange: function onLayerChange() {
      var layerID = this.layer.id ? this.layer.id : this.layer.field_name;
      var currentLayer = this.state.get('layer');
      var isCurrent = currentLayer == layerID;
      this.$el.toggleClass('current', isCurrent);
      this.$section().toggleClass('current', this.$section().find('.current').length > 0);
    },
    onCategoryChange: function onCategoryChange() {
      var propertyCategory = this.getPropertyCategory();
      var value = propertyCategory ? propertyCategory.values[0] : null;

      // Check for change in property_type category
      if (value !== this._lastPropertyType) {
        // if change, re-calculate the heavy bits
        // and re-render
        this.memorize();
        this.render(false, true);
      }
    },
    close: function close() {
      this.undelegateEvents();
      this.remove();
    },
    updateBuildingDetails: function updateBuildingDetails() {
      if (!this.$el || this.$el.length === 0) return;
      var tableTemplate = _.template(FilterBuildingDetailsTemplate);
      var tableData = this.getTableData();
      this.$el.find('.building-details').html(tableTemplate({
        table: tableData.data
      }));
      if (this.histogram) {
        this.histogram.updateHighlight(tableData.selected_value);
      }
    },
    getCompareBuildings: function getCompareBuildings() {
      var buildings = this.allBuildings;
      var o = Array.apply(null, Array(5)).map(function () {});
      var selected_buildings = this.state.get('selected_buildings') || [];
      selected_buildings.forEach(function (building, i) {
        var model = buildings.get(building.id);
        if (!model) return;
        o.splice(i, 1, {
          selected: building.selected,
          data: model.toJSON()
        });
      });
      return o;
    },
    getTableData: function getTableData() {
      var _this = this;
      var buildings = this.getCompareBuildings();
      var fieldName = this.layer.field_name;
      var formatter = this._valueFormatter;
      var propertyCategory = this.getPropertyCategory();
      var propertyType = propertyCategory ? propertyCategory.values[0] : null;
      var unit = this.layer.unit || '';
      var o = {
        selected_value: null
      };
      o.data = buildings.map(function (b) {
        if (!b) return b;
        var klasses = [];
        if (b.selected) {
          o.selected_value = b.data[fieldName];
          klasses.push('col-selected');
        }
        if (propertyType && b.data[_this.propertyTypeKey] !== propertyType) {
          klasses.push('disable');
        }
        var attr_value = b.data[fieldName];
        var value;
        if (attr_value === null) {
          value = 'n/a';
          unit = '';
        } else if (_this.layer.thresholds && _this.valueToIndex) {
          value = formatter(_this.valueToIndex(b.data[fieldName]));
        } else {
          value = formatter(b.data[fieldName]);
        }
        return {
          value: value,
          unit: unit,
          cell_klass: klasses.join(' ')
        };
      });
      return o;
    },
    getPropertyCategory: function getPropertyCategory() {
      var _this2 = this;
      var cats = this.state.get('categories');
      return cats.find(function (cat) {
        return cat.field === _this2.propertyTypeKey;
      });
    },
    getPropertyType: function getPropertyType() {
      var propertyCategory = this.getPropertyCategory();
      return propertyCategory ? propertyCategory.values[0] : null;
    },
    getPropertyTypeProps: function getPropertyTypeProps(category) {
      var _this3 = this;
      var propertyType = category ? category.values[0] : null;
      var buildings = this.allBuildings;
      var formatter = this._valueFormatter;
      var median;
      if (propertyType) {
        var subset = buildings.where(_defineProperty({}, this.propertyTypeKey, category.values[0]));

        // d3 median can handle null, but not if they are _all_ null, then it returns undefined
        // we handle this in the integer formatter, to set undefined to 'n/a'
        // this takes care of Laboratory data, which is all nulls, not sure how resilient this will be for other cases
        median = d3.median(subset, function (d) {
          return d.get(_this3.layer.field_name);
        });
      } else {
        median = d3.median(buildings.pluck(this.layer.field_name));
      }
      var value = this.layer.thresholds && this.valueToIndex ? formatter(this.valueToIndex(median)) : formatter(median);
      return [propertyType, value];
    },
    memorize: function memorize() {
      var _this4 = this;
      var propertyCategory = this.getPropertyCategory();
      var propertyType = propertyCategory ? propertyCategory.values[0] : null;
      var buildings = this.allBuildings;
      var fieldName = this.layer.field_name;
      var rangeSliceCount = this.layer.range_slice_count;
      var filterRange = this.layer.filter_range;
      var colorStops = this.layer.color_range;
      if (propertyType) {
        buildings = new Backbone.Collection(this.allBuildings.filter(function (model) {
          return model.get(_this4.propertyTypeKey) === propertyType;
        }));
      }
      this.threshold_values = null;
      this.valueToIndex = null;
      this.threshold_labels = null;
      this.threshold_values = this.isThreshold ? this.state.get('layer_thresholds') : null;
      if (this.threshold_values) {
        this.valueToIndex = ThresholdUtils.thresholdIndexScale(this.threshold_values);
        this.threshold_labels = ThresholdUtils.makeLabels(this.threshold_values);
      }
      this.activeBuildings = buildings;
      this.bucketCalculator = new BuildingBucketCalculator(buildings, fieldName, rangeSliceCount, filterRange, this.threshold_values);
      this.gradientCalculator = new BuildingColorBucketCalculator(this.allBuildings, fieldName, rangeSliceCount, colorStops, null, this.threshold_values);
      this.gradientStops = this.gradientCalculator.toGradientStops();
      this.buckets = this.bucketCalculator.toBuckets();
      this.bucketGradients = _.map(this.gradientStops, function (stop, bucketIndex) {
        return {
          color: stop,
          count: _this4.buckets[bucketIndex] || 0
        };
      });
    },
    getColorForValue: function getColorForValue(val) {
      if (!this.gradientCalculator) return 'blue';
      var scale = this.gradientCalculator.colorGradient().copy();
      return scale(val);
    },
    render: function render(isUpdate, isDirty) {
      var _this5 = this;
      isUpdate = isUpdate || false;
      var propertyCategory = this.getPropertyCategory();
      var propTypeTemplate = _.template(FilterPropertyTypeTemplate);
      var template = _.template(FilterContainer);
      var quartileTemplate = _.template(FilterQuartileTemplate);
      var fieldName = this.layer.field_name;
      var idField = this.layer.id || fieldName.toLowerCase().replace(/\s/g, '-');
      var $el = $('#' + idField);
      var layerID = this.layer.id ? this.layer.id : fieldName;
      var currentLayer = this.state.get('layer');
      var isCurrent = currentLayer == layerID;
      var $section = this.$section();
      var filterRange = this.layer.filter_range;
      var rangeSliceCount = this.layer.range_slice_count;
      var extent = this.bucketCalculator.toExtent();
      var gradientCalculator = this.gradientCalculator;
      var filterTemplate = _.template(FilterTemplate);
      var stateFilters = this.state.get('filters');
      var filterState = _.findWhere(stateFilters, {
        field: idField
      }) || {
        min: extent[0],
        max: extent[1]
      };
      var filterRangeMin = filterRange && _.isNaN(filterRange.min) ? filterRange.min : extent[0];
      var filterRangeMax = filterRange && _.isNaN(filterRange.max) ? filterRange.max : extent[1];
      var bucketGradients = this.bucketGradients;
      var tableTemplate = _.template(FilterBuildingDetailsTemplate);
      var tableData = this.getTableData();
      var _this$getPropertyType = this.getPropertyTypeProps(propertyCategory),
        _this$getPropertyType2 = _slicedToArray(_this$getPropertyType, 2),
        proptype = _this$getPropertyType2[0],
        proptype_val = _this$getPropertyType2[1];
      this._lastPropertyType = proptype;
      var containerKlass = [];
      if (this.isThreshold) containerKlass.push('is-threshold');
      if (this.isThreshold && !this.threshold_values) containerKlass.push('no-thresholds');
      containerKlass = containerKlass.join(' ');
      if ($el.length === 0) {
        this.$el.html(template(_.extend({
          containerKlass: containerKlass
        }, _.defaults(this.layer, {
          description: null
        }))));
        this.$el.find('.filter-wrapper').html(filterTemplate({
          id: layerID
        }));
        this.$el.find('.building-details').html(tableTemplate({
          table: tableData.data
        }));
        this.$el.find('.proptype-median-wrapper').html(propTypeTemplate({
          proptype: proptype,
          proptype_val: proptype_val
        }));
        this.$el.attr('id', idField);
      } else {
        this.$el = $el;
      }
      if (isDirty) {
        this.$el.find('.control-cell--inner')[0].className = "control-cell--inner ".concat(containerKlass);
        this.$el.find('.building-details').html(tableTemplate({
          table: tableData.data
        }));
        this.$el.find('.proptype-median-wrapper').html(propTypeTemplate({
          proptype: proptype,
          proptype_val: proptype_val
        }));
      }
      this.domit($section, this.$el, isCurrent, isUpdate, idField);
      var chartElm = this.$el.find('.chart');
      if (!this.histogram) {
        var histogram_options = {
          gradients: bucketGradients,
          slices: rangeSliceCount,
          filterRange: [filterRangeMin, filterRangeMax],
          colorScale: gradientCalculator.colorGradient().copy(),
          selected_value: tableData.selected_value,
          outerwidth: chartElm.width(),
          outerheight: chartElm.height(),
          fieldName: fieldName
        };
        this.histogram = new HistogramView(histogram_options);
        chartElm.html(this.histogram.render());
      }

      // isDirty:
      // 1. First render after initialize
      // 2. Property type change
      // 3. Layer change while this is the current layer
      if (isDirty) {
        var histogram_options = {
          gradients: bucketGradients,
          slices: rangeSliceCount,
          filterRange: [filterRangeMin, filterRangeMax],
          colorScale: gradientCalculator.colorGradient().copy(),
          outerwidth: chartElm.width(),
          outerheight: chartElm.height()
        };
        this.histogram.update(histogram_options);
        chartElm.html(this.histogram.render());
      }
      if (this.threshold_labels && (isDirty || this.initRender)) {
        // unfortunately, this doesn't always work.
        // const svg = this.histogram.$el.find('svg')[0];
        // const svgScaleFactor = svg ? svg.getCTM().a : 1;
        // when the SVG is not active, getCTM().a returns 1
        // when it is active, it returns the correct scale factor
        // instead of getting $(this) histogram's svg, just get the current active svg
        var currentSvg = $('div.map-control.current svg')[0];
        // not sure it's possible to _not_ have a current svg, but just in case
        var svgScaleFactor = currentSvg ? currentSvg.getCTM().a : 1;

        // get label positions from the xScale
        var positions = this.threshold_labels.map(function (label, i) {
          return _this5.histogram.xScale(i) * svgScaleFactor;
        });
        var qlabels = {
          width: this.histogram.xScale.bandwidth() * svgScaleFactor,
          labels: this.threshold_labels,
          // this only provides positions for two labels! we need one per bar
          // positions: this.histogram.xScale.range().map(d => d * svgScaleFactor)
          positions: positions
        };
        this.$el.find('.quartiles').html(quartileTemplate(qlabels));
      }
      if (!this.$filter || isDirty) {
        if (this.$filter) {
          this.$filter.destroy();
        }
        var slideOptions = {
          type: 'double',
          hide_from_to: false,
          force_edges: true,
          grid: false,
          hide_min_max: true,
          step: filterRangeMax < 1 ? 0.0001 : 1,
          prettify_enabled: !this.layer.disable_prettify,
          prettify: this.onPrettifyHandler(filterRangeMin, filterRangeMax, this.histogram),
          onFinish: _.bind(this.onFilterFinish, this)
        };
        if (this.isThreshold) {
          slideOptions.values = d3.range(0, rangeSliceCount);
        }
        var slider = this.$el.find('.range.filter').ionRangeSlider(slideOptions);
        this.$filter = slider.data('ionRangeSlider');
      }

      // if this is a slider update, skip
      // otherwise when user clicks on slider bar
      // will cause a stack overflow
      if (!isUpdate) {
        this.$filter.update({
          from: filterState.min,
          to: filterState.max,
          min: filterRangeMin,
          max: filterRangeMax
        });
      }
      this.initRender = false;
      return this;
    },
    domit: function domit(section, elm, isCurrent, isUpdate, idField) {
      elm.toggleClass('current', isCurrent);
      if (isCurrent || section.find('.current').length > 0) {
        section.find('input').prop('checked', true);
      }
      var sectionClass = isCurrent || section.find('.current').length > 0;
      section.toggleClass('current', sectionClass);
      if (!isUpdate) {
        section.find('.category-control-container').append(elm);
      } else {
        var positionInCategory;
        section.find('.category-control-container > .map-control').each(function (index, el) {
          if ($(el).attr('id') === idField) {
            positionInCategory = index;
          }
        });
        switch (positionInCategory) {
          case 0:
            section.find('.category-control-container').prepend(elm);
            break;
          default:
            section.find('.category-control-container > div:nth-child(' + positionInCategory + ')').after(elm);
        }
      }
    },
    onFilterFinish: function onFilterFinish(rangeSlider) {
      var fieldName = this.layer.field_name;
      var filters = _.reject(this.state.get('filters'), function (obj) {
        return obj.field == fieldName;
      });
      var values = {
        from: rangeSlider.from,
        to: rangeSlider.to,
        min: rangeSlider.min,
        max: rangeSlider.max
      };
      var thresholds = this.threshold_values;
      if (values.from !== values.min || values.to !== values.max) {
        var newFilter = {
          field: fieldName
        };
        if (this.isThreshold) newFilter.threshold = true;

        // Only include min or max in the filter if it is different from the rangeSlider extent.
        // This is important to the rangeSlider can clip the extreme values off, but we don't
        // want to use the rangeSlider extents to filter the data on the map.
        if (!thresholds) {
          if (values.from !== values.min) newFilter.min = values.from;
          if (values.to !== values.max) newFilter.max = values.to;
        } else {
          if (values.from !== values.min && values.from !== 0) newFilter.min = thresholds[values.from - 1];
          if (values.to !== values.max && values.to !== 3) newFilter.max = thresholds[values.to];
        }
        filters.push(newFilter);
      }

      // fire event for other non Filter.js listeners
      this.state.set({
        filters: filters
      });
      this.render(true);
    },
    onPrettifyHandler: function onPrettifyHandler(min, max, histogram) {
      if (this.isThreshold) {
        var labels = this.layer.slider_labels;
        return function (num) {
          return labels[num] || '';
        };
      }
      return function (num) {
        switch (num) {
          case min:
            return num.toLocaleString();
          case max:
            return num.toLocaleString() + '+';
          default:
            return num.toLocaleString();
        }
      };
    },
    events: {
      click: 'showLayer',
      'click .more-info': 'toggleMoreInfo',
      'click .compare-closer': 'closeCompare'
    },
    closeCompare: function closeCompare(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      this.state.set({
        building_compare_active: false
      });
    },
    showLayer: function showLayer() {
      var layerID = this.layer.id ? this.layer.id : this.layer.field_name;
      this.state.set({
        layer: layerID,
        sort: this.layer.field_name,
        order: 'desc'
      });
    },
    toggleMoreInfo: function toggleMoreInfo() {
      this.$el.toggleClass('show-more-info');
      return this;
    },
    $section: function $section() {
      var sectionName = this.layer.section;
      var safeSectionName = sectionName.toLowerCase().replace(/\s/g, '-');
      var $sectionEl = $('#' + safeSectionName);

      // if section exists return it, because every filter calls this fn
      if ($sectionEl.length > 0) {
        return $sectionEl;
      }
      var template = _.template(FilterSectionHeader);
      $sectionEl = $(template({
        category: sectionName
      })).appendTo(this.$container);
      return $sectionEl;
    }
  });
  return MapControlView;
});