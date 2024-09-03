define([
  'jquery',
  'underscore',
  'backbone',
  'collections/city_buildings',
  'models/building_color_bucket_calculator',
  'text!templates/map/building_info.html'
], function($, _, Backbone, CityBuildings,
        BuildingColorBucketCalculator, BuildingInfoTemplate){


  const baseCartoCSS = {
    dots: [
    '{marker-fill: #CCC;' +
    'marker-fill-opacity: 0.9;' +
    'marker-line-color: #FFF;' +
    'marker-line-width: 0.5;' +
    'marker-line-opacity: 1;' +
    'marker-placement: point;' +
    'marker-multi-policy: largest;' +
    'marker-type: ellipse;' +
    'marker-allow-overlap: true;' +
    'marker-clip: false;}'
    ],
    footprints: [
      '{polygon-fill: #CCC;' +
      'polygon-opacity: 0.9;' +
      'line-width: 1;' +
      'line-color: #FFF;' +
      'line-opacity: 0.5;' + 
      // we need to include these declarations, even if we're not using the pattern (e.g for Energy Star Score)
      // because CARTO balks if we include pattern-opacity in later declarations, without having first declared the pattern-file
      'polygon-pattern-file: url(https://seattle-buildings-polygon-hatch-images.s3.us-west-1.amazonaws.com/seamless_hatch_2x.png);' + 
      'polygon-pattern-opacity: 0;}'
    ],
    // A hatch polygon that only applies to buildings with null values for the given measure
    // we make the pattern transparent for all non-null values in building_color_bucket_calculator.js
    footprints_hatch: [
      '{polygon-fill: #CCC;' +
      'polygon-opacity: 0.9;' +
      'line-width: 1;' +
      'line-color: #FFF;' +
      'line-opacity: 0.5;' +
      'polygon-pattern-file: url(https://seattle-buildings-polygon-hatch-images.s3.us-west-1.amazonaws.com/seamless_hatch_2x.png);' + 
      'polygon-pattern-opacity: 1;}'
    ],
    // same, but with a different hatch pattern for high zoom levels, see #119
    footprints_hatch_highzoom: [
      '{polygon-fill: #CCC;' +
      'polygon-opacity: 0.9;' +
      'line-width: 1;' +
      'line-color: #FFF;' +
      'line-opacity: 0.5;' +
      'polygon-pattern-file: url(https://seattle-buildings-polygon-hatch-images.s3.us-west-1.amazonaws.com/seamless_hatch_hizoom.png);' + 
      'polygon-pattern-opacity: 1;}'
    ]

  };

  const CartoStyleSheet = function(tableName, hatchCss, bucketCalculator, mode) {
    this.tableName = tableName;
    this.hatchCss = hatchCss;
    this.bucketCalculator = bucketCalculator;
    this.mode = mode;
  };

  CartoStyleSheet.prototype.toCartoCSS = function(){
    const bucketCSS = this.bucketCalculator.toCartoCSS();
    const tableName = this.tableName;

    let mode = this.mode;
    let hatch = this.hatchCss;
    let styles;

    if (hatch && mode === 'footprints') { 
      // regular styles for footprints above "atZoom" level
      let style1 = [...baseCartoCSS['footprints_hatch']].concat(bucketCSS);
      style1 = _.reject(style1, function(s) { return !s; });
      style1 = _.map(style1, function(s) { return `#${tableName} ${s}`; });
      style1 = style1.join('\n');
      
      // second copy of styles for footprints above an arbitrary higher zoom level, currently 18
      let style2 = [...baseCartoCSS['footprints_hatch_highzoom']].concat(bucketCSS);
      style2 = _.reject(style2, function(s) { return !s; });
      style2 = _.map(style2, function(s) { return `#${tableName} ${s}`; });
      style2 = style2.join('\n');

      // zoom styling requires a separate wrap around the same set of styles, 
      // with a zoom condition and brackets
      styles = `${style1}\n[zoom > 18] {\n${style2}\n}`;
 
    } else {
      styles = [...baseCartoCSS[mode]].concat(bucketCSS);
      styles = _.reject(styles, function(s) { return !s; });
      styles = _.map(styles, function(s) { return `#${tableName} ${s}`; });
      styles = styles.join('\n');
    }
  
    return styles;
  };


  var BuildingInfoPresenter = function(city, allBuildings,
                    buildingId, idKey, controls, layerName, defaultColor) {
    this.city = city;
    this.allBuildings = allBuildings;
    this.buildingId = buildingId;
    this.idKey = idKey;
    this.controls = controls;
    this.layerName = layerName;
    this.defaultColor = defaultColor || 'blue';
  };

  BuildingInfoPresenter.prototype.toLatLng = function() {
    var building = this.toBuilding();
    if (typeof building === 'undefined') return null;

    return { lat: building.get('lat'), lng: building.get('lng') };
  };

  BuildingInfoPresenter.prototype.toBuilding = function() {
    return this.allBuildings.find(building => {
      return building.get(this.idKey) == this.buildingId;
    }, this);
  };

  BuildingInfoPresenter.prototype.toPopulatedLabels = function() {
    var building = this.toBuilding();
    var o = {};

    if (typeof building === 'undefined') return o;

    o.items = _.map(this.city.get('popup_fields'), function(field) {
      var value = building.get(field.field);

      value = (field.skipFormatter) ?
                (value || 'N/A') : (value || 'N/A').toLocaleString();

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

  BuildingInfoPresenter.prototype.getColor = function(field, value) {
    if (!this.controls || !this.controls._wrapped) return this.defaultColor;

    // TODO: fix hacky way to deal w/ quartiles
    var filter = this.controls._wrapped.find(item => {
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
  var BuildingLayerWatcher = function(config, map) {
    this.config = config;
    this.map = map;
    this.currentZoom = null;
    this.footprintsAllowed = this.config.allowable || false;
    this.mode = this.getMode();
  };

  BuildingLayerWatcher.prototype.getMode = function() {
    if (!this.footprintsAllowed) return 'dots'; // `dots` are going to be our default

    var zoom = this.map.getZoom();
    if (this.currentZoom === zoom) return this.mode;
    this.currentZoom = zoom;

    return (zoom >= this.config.atZoom) ? 'footprints' : 'dots';
  };

  // Determines whether to change the layer type
  BuildingLayerWatcher.prototype.check = function() {
    if (!this.footprintsAllowed) return false;

    var mode = this.getMode();

    if (mode === this.mode) return false;

    this.mode = mode;

    return true;
  };

  BuildingLayerWatcher.prototype.fillType = function() {
    return this.mode === 'dots' ? 'marker-fill' : 'polygon-fill';
  };

  /*
    To render building footprints we need to join on the footprint table.
    There is no need to wrap it in the building collection sql function, since
    it only impacts the map layer. It does borrow most of the logic for sql
    generation from the building collection sql function however.
   */
  var FootprintGenerateSql = function(footprintConfig, maplayers) {
    this.footprintConfig = footprintConfig;
    this.mapLayerFields = maplayers.map(function(lyr) {
      return 'b.' + lyr.field_name;
    });
    this.mapLayerFields.push('b.id');

    this.mapLayerFields = _.uniq(this.mapLayerFields);
    this.mapLayerFields = this.mapLayerFields.join(',');
  };

  FootprintGenerateSql.prototype.sql = function(components) {
    var tableFootprint = this.footprintConfig.table_name;
    var tableData = components.table;

    // Base query
    var query = 'SELECT a.*,' +
                this.mapLayerFields +
                ' FROM ' + tableFootprint +
                ' a,' + tableData +
                ' b WHERE a.buildingid = b.id AND ';

    var filterSql = components.year.concat(components.range)
                      .concat(components.category)
                      .filter(function(e) { return e.length > 0; });

    query += filterSql.join(' AND ');

    return query;
  };


  var LayerView = Backbone.View.extend({
    initialize: function(options){
      this.state = options.state;
      this.leafletMap = options.leafletMap;
      this.mapView = options.mapView;
      this.mapElm = $(this.leafletMap._container);

      this.allBuildings = new CityBuildings(null, {});

      this.footprints_cfg = this.state.get('city').get('building_footprints');
      this.buildingLayerWatcher = new BuildingLayerWatcher(this.footprints_cfg, this.leafletMap);

      this.footprintGenerateSql = new FootprintGenerateSql(
        this.footprints_cfg,
        this.state.get('city').get('map_layers')
      );

      // Listen for all changes but filter in the handler for these
      // attributes: layer, filters, categories, and tableName
      this.listenTo(this.state, 'change', this.changeStateChecker);

      // building has a different handler
      this.listenTo(this.state, 'change:building', this.onBuildingChange);
      this.listenTo(this.allBuildings, 'sync', this.render);

      this.listenTo(this.state, 'clearMapPopup', this.onClearMapPopupTrigger, this);


      var self = this;
      this.leafletMap.on('popupclose', function(e) {
        // When the map is closing the popup the id's will match,
        // so close.  Otherwise were probably closing an old popup
        // to open a new one for a new building
        if (e.popup._buildingid === self.state.get('building')) {
          e.popup._buildingid = null;
          self._popupid = undefined;
          self.state.set({ building: null });
        }

        self.removeBuildingOutline();
      });

      this.leafletMap.on('popupopen', function(e) {
        $('#view-report').on('click', self.onViewReportClick.bind(self));
        $('#compare-building').on('click', self.onCompareBuildingClick.bind(self));

        self.addBuildingOutline();
      });
    },

    // Add outline to highlight dot or footprint
    addBuildingOutline: async function() {
      var building_id = this.state.get('building');

      var propertyId = this.state.get('city').get('property_id');
      if (this.buildingLayerWatcher.mode !== 'dots') {
        propertyId = this.footprints_cfg.property_id;
      }

      var presenter = new BuildingInfoPresenter(
          this.state.get('city'),
          this.allBuildings,
          building_id,
          propertyId,
          this.mapView.getControls(),
          this.state.get('layer'));

      if (!presenter.toLatLng()) return;
      var latlng = presenter.toLatLng();

      this.leafletMap.highlightLayer.clearLayers();

      var layerMode = this.buildingLayerWatcher.mode;
      if (layerMode === 'dots') {
        // if this is dots, then add a circle
        const circle = L.circleMarker([latlng.lat, latlng.lng], { radius: 5, fill: false, color: '#000', weight: 3, opacity: 1 }).addTo(this.leafletMap.highlightLayer);        
        this.state.set({ 'dot_highlight': circle });
        this.state.set({ 'has_highlight': 'dots' });
      } else {
        // otherwise this is 'footprints': add a polygon from geojson
        const cartoDbUser = this.state.get('cartoDbUser');
        const url = `https://${cartoDbUser}.carto.com/api/v2/sql`;
        const tablename = this.footprints_cfg.table_name;
        const query = `SELECT cartodb_id,ST_AsGeoJSON(the_geom) as geojson FROM ${tablename} WHERE buildingid=${building_id}`;
        const response = await fetch(`${url}/?q=${query}`);
        const json = await response.json();

        // parse the incoming features. There can be one to many of them
        let features = [];
        json.rows.forEach(function(row) {
          const f = JSON.parse(row.geojson);
          features.push(f);
        });
        // create an output FeatureCollection
        let geojson = {
          type: 'FeatureCollection',
          features: features,
        };
        const poly = L.geoJson(geojson, {});
        poly.setStyle({ 
          fill: false, color: '#000', weight: 3, opacity: 1
        });
        poly.addTo(this.leafletMap.highlightLayer);
        this.state.set({ 'footprint_highlight': poly });
        this.state.set({ 'has_highlight': 'footprints' });
      }
    },

    // Remove building or dot highlight
    removeBuildingOutline: function() {
      this.leafletMap.highlightLayer.clearLayers();     
      this.state.set({ 'footprint_highlight': null });
      this.state.set({ 'dot_highlight': null });
      this.state.set({ 'has_highlight': false });
    },

    // Keep popup in map view after showing more details
    adjustPopup: function(layer) {
      var container = $(layer._container);
      var latlng = layer.getLatLng();

      var pt = this.leafletMap.latLngToContainerPoint(latlng);
      var height = container.height();
      var top = pt.y - height;

      if (top < 0) {
        this.leafletMap.panBy([0, top]);
      }
    },

    onClearMapPopupTrigger: function() {
      this.onClearPopups();
    },

    onClearPopups: function() {
      var map = this.leafletMap;

      map.eachLayer(function(lyr) {
        // the only reference to _tip, is this used? 
        if (lyr._tip) {
          map.removeLayer(lyr);
        }
      });
    },

    isSelectedBuilding: function(selected_buildings, id) {
      var hasBuilding = selected_buildings.find(function(b) {
        return b.id === id;
      });

      return hasBuilding;
    },

    makeSelectedBuildingsState: function(id) {
      var selected_buildings = this.state.get('selected_buildings') || [];
      if (this.isSelectedBuilding(selected_buildings, id)) return null;
      if (selected_buildings.length === 5) return null;

      var out = selected_buildings.map(function(b) {
        b.selected = false;
        return b;
      });

      out.push({
        id: id,
        insertedAt: Date.now(),
        selected: true
      });

      out.sort(function(a, b) {
        return a.insertedAt - b.insertedAt;
      });

      return out;
    },

    onCompareBuildingClick: function(evt) {
      if (evt.preventDefault) evt.preventDefault();
      var buildingId = this.state.get('building');
      if (!buildingId) return;

      this.onClearPopups();
      this.state.set({ building_compare_active: true });
      return false;
    },

    onViewReportClick: function(evt) {
      if (evt.preventDefault) evt.preventDefault();
      this.state.set({ report_active: true });
      return false;
    },

    onBuildingChange: function() {
      var building_id = this.state.get('building');
      var isShowing = (building_id === this._popupid);

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

      var presenter = new BuildingInfoPresenter(
          this.state.get('city'),
          this.allBuildings,
          building_id,
          propertyId,
          this.mapView.getControls(),
          this.state.get('layer'));

      if (!presenter.toLatLng()) return;

      var popup = L.popup({
        autoPan: false,
      })
       .setLatLng(presenter.toLatLng())
       .setContent(template({
          data: presenter.toPopulatedLabels(),
          compare_disabled: ''
        }));

      this.leafletMap.panTo(presenter.toLatLng());

      this._popupid = building_id;
      popup._buildingid = building_id;
      popup.openOn(this.leafletMap);
    },

    onFeatureClick: function(event, latlng, _unused, data){
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

    onFeatureOver: function(e, latlng, _unused, data) {
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
      var building = this.allBuildings.find(building => {
        return building.get(propertyId) == buildingId;
      }, this);

      // get the name and the id of the building
      var id = building.get('id');
      var name = building.get('property_name');

      // get the tooltip element with d3
      var tooltip = d3.select('div.cartodb-tooltip');
      // update the tooltip with the building name and id
      tooltip.html(`<strong>${name}</strong><br>Building ID: <strong>${id}</strong>`);

      // get the coordinates of the building that is being hovered,
      // and convert to container points
      var coords = this.leafletMap.latLngToContainerPoint(latlng)

      // show and position the tootlip
      tooltip
        .style('display', 'block')
        .style('top', coords.y - 15 + "px")
        .style('left', coords.x + 15 + "px");

    },

    onFeatureOut: function(){
      // change back to the default cursor
      this.mapElm.css('cursor', '');

      // hide the tooltip
      $('div.cartodb-tooltip').hide();
    },

    onStateChange: function(){
      // TODO: should not be mutating the buildings model.
      _.extend(this.allBuildings, this.state.pick('tableName', 'cartoDbUser'));
      this.allBuildings.fetch(this.state.get('year'));
    },

    changeStateChecker: function() {
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


    toCartoSublayer: function(){
      var layerMode = this.buildingLayerWatcher.mode;
      var cssFillType = this.buildingLayerWatcher.fillType();

      var buildings = this.allBuildings;
      var state = this.state;
      var city = state.get('city');
      var year = state.get('year');
      var layer = state.get('layer');

      var cityLayer = _.find(city.get('map_layers'), lyr => {
        if (lyr.id) return lyr.id === layer;
        return lyr.field_name === layer;
      });

      var fieldName = cityLayer.field_name;
      var hatchCss = cityLayer.hatch_null_css;

      var buckets = cityLayer.range_slice_count;
      var colorStops = cityLayer.color_range;

      var thresholds = cityLayer.thresholds ? state.get('layer_thresholds') : null;

      var calculator = new BuildingColorBucketCalculator(
                              buildings, fieldName, buckets,
                              colorStops, cssFillType, thresholds);

      var stylesheet = new CartoStyleSheet(buildings.tableName, hatchCss, calculator, layerMode);
      var cartocss = stylesheet.toCartoCSS();

      var sql = (layerMode === 'dots') ?
                  buildings.toSql(year, state.get('categories'), state.get('filters')) :
                  this.footprintGenerateSql.sql(
                    buildings.toSqlComponents(
                      year,
                      state.get('categories'),
                      state.get('filters'), 'b.')
                  );


      var interactivity = this.state.get('city').get('property_id');

      return {
        sql: sql,
        cartocss: cartocss,
        interactivity: (layerMode === 'dots' ) ? interactivity : interactivity += ',' + this.footprints_cfg.property_id
      };
    },

    render: function(){
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
      }, { https: true }).addTo(this.leafletMap).on('done', this.onCartoLoad, this);

      return this;
    },

    onCartoLoad: function(layer) {
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
