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
      var userlat = state.get('lat');
      var userlng = state.get('lng');
      var userzoom = state.get('zoom');

      // A sequence of steps to run after the tutorial ends, to reset the app state
      function endTurorial() {
        // END: zoom back out to the default view and deselect the building
        $('#back-to-map-link').click();
        mapview.leafletMap.setView([userlat, userlng], userzoom);
        mapview.leafletMap.closePopup();
        mapview.leafletMap.highlightLayer.clearLayers();
        setTimeout(function () {
          state.set({
            selected_buildings: []
          });
        }, 300);
      }

      // This is the main config for the tutorial
      var driverObj = driver({
        showProgress: true,
        allowClose: true,
        onDestroyed: endTurorial,
        showButtons: ['next', 'close'],
        steps: [
        // STEP 1
        {
          element: '#search',
          onHighlighted: function onHighlighted() {
            // make sure we have focus
            document.querySelector('.driver-popover').focus();

            // START: make sure we use the default view and deselect everything

            // open the first accordion panel, if closed, and close all the rest
            $('div.category').each(function () {
              var $div = $(this);
              var $button = $div.find('input');
              var $panel = $div.children('.category-control-container');
              if ($div.attr('id') === 'greenhouse-gas-emissions') {
                // open this one
                if (!$panel.is(':visible')) $button.click();
              } else {
                // close all the rest
                if ($panel.is(':visible')) $button.click();
              }
            });
            $('#total_ghg_emissions').click(); // select default layer
            // $('input#year-2021').click();                    // select 2021 which we know works
            var citycenter = state.get('city').get('center'); // map center
            var cityzoom = state.get('city').get('zoom'); // map zoom
            mapview.leafletMap.setView(citycenter, cityzoom); // set map xyz
            mapview.leafletMap.closePopup(); // close any popups
            mapview.leafletMap.highlightLayer.clearLayers(); // clear any bldg highlights
            $('#back-to-map-link').click(); // close report if open
            state.set({
              selected_buildings: []
            }); // deselect any selected bldgs
          },

          popover: {
            title: 'Search',
            description: 'Use the Search bar to find a building based on its name, address, or Seattle OSE building ID.'
          }
        }, {
          element: '#map-category-controls',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            // STEP 2
            title: 'Filter buildings',
            description: 'Filter buildings based on criteria like neighborhood, council district or reporting year',
            onNextClick: function onNextClick() {
              // Add an image of the menu - this is overall easier to control than selectize
              // and we don't have any focus conflicts (see next step)
              $('<img>', {
                src: './images/menu.jpg',
                id: 'proptype-menu-image',
                css: {
                  'z-index': 999999,
                  'position': 'fixed',
                  'width': 234,
                  'height': 234
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
          // STEP 3
          popover: {
            title: 'Filter buildings',
            description: 'Users can also filter buildings by property type'
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
          // STEP 4
          popover: {
            title: 'Map display',
            description: 'The map defaults to displaying greenhouse gas (GHG) emissions; users can toggle between absolute GHG emissions and GHG intensity (GHG emissions per square foot of building floor area). Move the sliders to filter for the highest or lowest emitting buildings.',
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
            description: 'YUsers can visualize buildings by GHG intensity in kilograms of carbon dioxide equivalent (CO2e) per square foot.',
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
            // STEP 6
            title: 'Map display',
            description: 'Users can choose to display greenhouse gas emissions, energy performance metrics, and property information like square footage. Click on these headers to minimize or maximize these data options. Click “More Info” to read about each display metric.',
            onNextClick: function onNextClick() {
              // Zoom in so that building footprints are shown
              mapview.leafletMap.setView([47.6050418, -122.3299205], 16);
              driverObj.moveNext();
            }
          },
          onDeselected: function onDeselected() {
            // reopen the accordion, select the first panel
            $('input#category-greenhouse-gas-emissions-expanded').click();
            $('#total_ghg_emissions').click();
            // restore the height of the panels
            $('#map-controls-content--inner').height('100%');
          }
        }, {
          element: '#map',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            // STEP 7
            title: 'Map display',
            description: 'Zooming in will display additional detail about the building location and footprints.',
            onNextClick: function onNextClick() {
              // pretend to click this building (id 357 is specific to Seattle Municipal Tower)
              mapview.currentLayerView.onFeatureClick(null, null, null, {
                'id': '357'
              });
              driverObj.moveNext();
            }
          }
        }, {
          element: '#map',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          // STEP 8
          popover: {
            title: 'Map display',
            description: 'Clicking on a building shape or dot will display an information pop-up. To view a more detailed, building-specific performance profile, click on “View Building Report”.'
          }
        }, {
          element: 'table.comparables',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            // STEP 9
            title: 'Compare buildings',
            description: 'Buildings that are selected in succession will populate the Building Comparison tab. If you click on Building Comparison, a side-by-side comparison will expand from the bottom of the screen. Select different display metrics via the left pane',
            onNextClick: function onNextClick() {
              // Click "Show Report"
              $('button#view-report').click();
              // without this delay, seems that Driver cannot find the element 
              setTimeout(function () {
                driverObj.moveNext();
              }, 750);
            }
          }
        }, {
          element: '#building-details-cards-wrapper',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          popover: {
            // STEP 10
            title: 'Building performance details',
            description: 'The customized Building Report displays the building’s Site EUI and GHG Intensity for the selected reporting year and frames them in the context of their peers. The report also displays the energy consumption and GHG emission breakdown by fuel type (e.g. electricity, natural gas, district steam).'
          }
        }, {
          element: '#change-chart',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          // STEP 11
          popover: {
            title: 'Building performance trends',
            description: 'The report displays performance trends of the same building over time against a typical building of the same property type.'
          }
        }, {
          element: '#compare-shift-chart',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          // STEP 12 (new)
          popover: {
            title: 'Building performance standard',
            description: 'For commercial buildings 50,000 SF and larger, the report displays current energy performance versus an approximate Washington Clean Buildings Performance Standard EUI target.'
          }
        }, {
          element: '#performance-standard-chart',
          onHighlighted: function onHighlighted() {
            document.querySelector('.driver-popover').focus();
          },
          // STEP 13
          popover: {
            title: 'Building performance standard',
            description: 'Users can also find utility incentive opportunities at the bottom of the report.'
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