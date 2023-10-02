"use strict";

define(['jquery', 'underscore', 'backbone', 'driver'], function ($, _, Backbone, Driver) {
  var Tutorial = Backbone.View.extend({
    initialize: function initialize(options) {
      // initialize the tutorial, and save the driver object in this scope
      // initTutorial will only be called once, when initialized through router.js
      this.state = options.state;
      if (!this.state.get('mapview')) {
        this.state.set({
          mapview: options.mapView
        });
      }
      var mapview = this.state.get('mapview');
      this.driverObj = this.initTutorial(mapview);
    },
    initTutorial: _.once(function (mapview) {
      var driver = window.driver.js.driver;
      var state = this.state;
      var startlat = state.get('lat');
      var startlng = state.get('lng');
      var startzoom = state.get('zoom');
      console.log(startlat);
      console.log(startlng);
      console.log(startzoom);
      console.log(mapview);
      var driverObj = driver({
        showProgress: true,
        allowClose: true,
        steps: [{
          element: '#search',
          onHighlighted: function onHighlighted() {
            // make sure we have focus
            document.querySelector('.driver-popover').focus();
            // it is possible to load on a building report, so go ahead and click the close button
            $('a#back-to-map-link').click();
            // it is also possible to have a map popup open, close them
            mapview.leafletMap.closePopup();
          },
          popover: {
            title: 'Search',
            description: 'Use the Search bar to find a building based on its name, address, or building ID'
          }
        }, {
          element: '#map-category-controls',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Filter buildings',
            description: 'Filter buildings based on criteria like neighborhood, council district and reporting year',
            onNextClick: function onNextClick() {
              // Add an image of the menu - this is overall easier to control than selectize
              // and we don't have any focus conflicts (see next step)
              $('<img>', {
                src: './images/menu.jpg',
                id: 'proptype-menu-image',
                css: {
                  'z-index': 999999,
                  'position': 'fixed'
                }
              }).insertAfter('#building-proptype-selector select');
              driverObj.moveNext();
            }
          }
        }, {
          element: '#proptype-menu-image',
          onHighlighted: function onHighlighted() {
            // This steals focus from the select, 
            // which is why we had to add an image of the menu in the previous step
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Filter buildings',
            description: 'You can also filter buildings by property type'
          },
          onDeselected: function onDeselected() {
            // delete the menu image
            $('img#proptype-menu-image').remove();
          }
        }, {
          element: '#total_ghg_emissions',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Map display',
            description: 'The visualization defaults to displaying greenhouse gas emissions; you can toggle between absolute GHG emissions and GHG intensity, as shown next.',
            onNextClick: function onNextClick() {
              // open the next panel
              $('#total_ghg_emissions_intensity').click();
              driverObj.moveNext();
            }
          }
        }, {
          element: '#total_ghg_emissions_intensity',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Map display',
            description: 'You can also visualize buildings by GHG intensity (i.e. per square foot)',
            onNextClick: function onNextClick() {
              // Collapse the accordion
              $('input#category-greenhouse-gas-emissions-expanded').click();
              // Artificially decrease the height of the accordion panel
              $('#map-controls-content--inner').height(150);
              // .. and then call
              driverObj.moveNext();
            }
          }
        }, {
          element: '#map-controls-content--inner',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Map display',
            description: 'In addition to greenhouse gas emissions data, you can also choose to display energy performance metrics and property information like square footage. Click on these tabs to minimize or maximize these data types.'
          },
          onDeselected: function onDeselected() {
            // reopen the accordion, select the first panel
            $('input#category-greenhouse-gas-emissions-expanded').click();
            $('#total_ghg_emissions').click();
            // restore the height of the panels
            $('#map-controls-content--inner').height('100%');
          }
        }, {
          element: 'table.comparables',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Compare buildings',
            description: 'Buildings that are viewed in succession will populate the Building Comparison tab. If you click on Building Comparison, a side by side comparison will expand from the bottom of the screen.',
            onNextClick: function onNextClick() {
              // Zoom in so that building footprints are shown
              mapview.leafletMap.setView([47.6050418, -122.3299205], 16);
              driverObj.moveNext();
            }
          }
        }, {
          element: '#map',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Map display',
            description: 'Zooming in will display building shapes.',
            onNextClick: function onNextClick() {
              // Select a building
              state.set({
                building: '357'
              });
              driverObj.moveNext();
            }
          }
        }, {
          element: '#map',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            title: 'Map display',
            description: 'Clicking on a building will show an information snapshot. Clicking on “View Building Report” will take you to a building-specific report that provides more detailed building information.'
          },
          onDeselected: function onDeselected() {
            // zoom back out to the default view and deselect the building
            mapview.leafletMap.setView([startlat, startlng], startzoom);
            state.set({
              building: null
            });
            mapview.leafletMap.closePopup();
            mapview.leafletMap.highlightLayer.clearLayers();
          }
        }]
      });
      return driverObj;
    }),
    render: function render(timeout) {
      var self = this;
      setTimeout(function () {
        self.driverObj.drive();
      }, timeout);
      return this;
    }
  });
  return Tutorial;
});