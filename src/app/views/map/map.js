define([
  'jquery',
  'underscore',
  'backbone',
  'views/map/building_layer',
  'views/map/filter',
  'views/map/category',
], function($, _, Backbone, BuildingLayer, Filter, Category) {
  var MapView = Backbone.View.extend({
    el: $('#map'),

    initialize: function(options){
      this.state = options.state;
      this.listenTo(this.state, 'change:city', this.onCityChange);
      this.listenTo(this.state, 'change:allbuildings', this.onBuildings, this);
      this.listenTo(this.state, 'change:lat', this.onMapChange);
      this.listenTo(this.state, 'change:lng', this.onMapChange);
      this.listenTo(this.state, 'change:zoom', this.onMapChange);
    },

    onCityChange: function(){
      this.render();
    },

    render: function(){
      var city = this.state.get('city');
      var lat = this.state.get('lat');
      var lng = this.state.get('lng');
      var zoom = this.state.get('zoom');

      if (!this.leafletMap){
        this.leafletMap = new L.Map(
                                this.el, {
                                  center: [lat, lng],
                                  zoom: zoom,
                                  scrollWheelZoom: false,
                              });

        this.leafletMap.attributionControl.setPrefix('');

        var background = city.get('backgroundTileSource');

        if (window.devicePixelRatio > 1) {
          // replace the last '.' with '@2x.'
          background = background.replace(/\.(?!.*\.)/, '@2x.');
        }

        L.tileLayer(background, {
          zIndex: 0,
        }).addTo(this.leafletMap);

        this.leafletMap.zoomControl.setPosition('topright');
        this.leafletMap.on('moveend', this.onMapMove, this);

        // TODO: Possibly remove the need for this
        // layer to make seperate Carto calls
        this.currentLayerView = new BuildingLayer({
                                      leafletMap: this.leafletMap,
                                      state: this.state,
                                      mapView: this});
      }
    },

    onMapMove: function(event) {
      var target = event.target;
      var zoom = target.getZoom();
      var center = target.getCenter();
      this.state.set({
          lat: center.lat.toFixed(5),
          lng: center.lng.toFixed(5),
          zoom: zoom});
    },

    onMapChange: function() {
      var lat = this.state.get('lat');
      var lng = this.state.get('lng');
      var zoom = this.state.get('zoom');

      if (!this.leafletMap) return;

      this.leafletMap.panTo(new L.LatLng(lat, lng));
      this.leafletMap.setZoom(zoom);
    },

    getControls: function() {
      return this.controls;
    },

    onBuildings: function(){
      var state = this.state;
      var city = state.get('city');
      var layers = city.get('map_layers');
      var allBuildings = state.get('allbuildings');

      // close/remove any existing MapControlView(s)
      this.controls && this.controls.each(function(view){
        view.close();
      });

      $('#map-category-controls').empty();
      $('#map-controls-content--inner').empty();

      // recreate MapControlView(s)
      this.controls = _.chain(layers).map(function(layer){
        var ViewClass = {
          range: Filter,
          category: Category,
        }[layer.display_type];

        return new ViewClass({
          layer: layer,
          allBuildings: allBuildings,
          state: state,
        });
      }).each(function(view){
        view.render();
      });

      if (this.currentLayerView) this.currentLayerView.onBuildingChange();
      return this;
    },
  });

  return MapView;
});