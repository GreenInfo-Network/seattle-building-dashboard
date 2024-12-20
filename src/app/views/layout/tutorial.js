define(['jquery', 'underscore', 'backbone', 'driver'], function (
  $,
  _,
  Backbone,
  Driver
) {
  var Tutorial = Backbone.View.extend({
    initialize: function (options) {
      // initialize the tutorial, and save the driver object in this scope
      // initTutorial will only be called once, when initialized through router.js
      this.state = options.state;
      if (!this.state.get('mapview')) {
        this.state.set({
          mapview: options.mapView
        });
      }

      const mapview = this.state.get('mapview');
      this.driverObj = this.initTutorial(mapview);
    },

    initTutorial: _.once(function (mapview) {
      const driver = window.driver.js.driver;
      const state = this.state;

      const userlat = state.get('lat');
      const userlng = state.get('lng');
      const userzoom = state.get('zoom');

      // A sequence of steps to run after the tutorial ends, to reset the app state
      function endTurorial() {
        // END: zoom back out to the default view and deselect the building
        $('#back-to-map-link').click();
        mapview.leafletMap.setView([userlat, userlng], userzoom);
        mapview.leafletMap.closePopup();
        mapview.leafletMap.highlightLayer.clearLayers();
        setTimeout(function () {
          state.set({ selected_buildings: [] });
        }, 300);
      }

      // This is the main config for the tutorial
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        onDestroyed: endTurorial,
        showButtons: ['next', 'close'],
        steps: [
          // STEP 1
          {
            element: '#search',
            onHighlighted: () => {
              // make sure we have focus
              document.querySelector('.driver-popover').focus();

              // START: make sure we use the default view and deselect everything

              // open the first accordion panel, if closed, and close all the rest
              $('div.category').each(function () {
                const $div = $(this);
                const $button = $div.find('input');
                const $panel = $div.children('.category-control-container');

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
              let citycenter = state.get('city').get('center'); // map center
              let cityzoom = state.get('city').get('zoom'); // map zoom
              mapview.leafletMap.setView(citycenter, cityzoom); // set map xyz
              mapview.leafletMap.closePopup(); // close any popups
              mapview.leafletMap.highlightLayer.clearLayers(); // clear any bldg highlights
              $('#back-to-map-link').click(); // close report if open
              state.set({ selected_buildings: [] }); // deselect any selected bldgs
            },
            popover: {
              title: 'Search',
              description:
                'Use the Search bar to find a building based on its name, address, or Seattle OSE building ID.'
            }
          },
          {
            element: '#map-category-controls',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            popover: {
              // STEP 2
              title: 'Filter buildings',
              description:
                'Filter buildings based on criteria like neighborhood, council district or reporting year.',
              onNextClick: () => {
                // Add an image of the menu - this is overall easier to control than selectize
                // and we don't have any focus conflicts (see next step)
                $('<img>', {
                  src: './images/menu.png',
                  id: 'proptype-menu-image',
                  css: {
                    'z-index': 999999,
                    position: 'fixed',
                    width: 255,
                    height: 231
                  }
                }).insertAfter('#building-proptype-selector select');

                driverObj.moveNext();
              }
            }
          },
          {
            element: '#proptype-menu-image',
            onHighlighted: () => {
              // This steals focus from the select,
              // which is why we had to add an image of the menu in the previous step
              document.querySelector('.driver-popover').focus();
            },
            // STEP 3
            popover: {
              title: 'Filter buildings',
              description: 'Users can also filter buildings by building type.'
            },
            onDeselected: () => {
              // delete the menu image
              $('img#proptype-menu-image').remove();
            }
          },
          {
            element: '#total_ghg_emissions',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 4
            popover: {
              title: 'Map display',
              description:
                'The map defaults to displaying greenhouse gas (GHG) emissions; users can toggle between absolute GHG emissions and GHG intensity (GHG emissions per square foot of building floor area). Move the sliders to filter for the highest or lowest emitting buildings.',
              onNextClick: () => {
                // open the next panel
                $('#total_ghg_emissions_intensity').click();
                driverObj.moveNext();
              }
            }
          },
          {
            element: '#total_ghg_emissions_intensity',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 5
            popover: {
              title: 'Map display',
              description:
                'Users can visualize buildings by GHG intensity in kilograms of carbon dioxide equivalent (CO2e) per square foot.',
              onNextClick: () => {
                // Collapse the accordion
                $('input#category-greenhouse-gas-emissions-expanded').click();
                // Artificially decrease the height of the accordion panel
                $('#map-controls-content--inner').height(150);
                // .. and then call
                driverObj.moveNext();
              }
            }
          },
          {
            element: '#map-controls-content--inner',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            popover: {
              // STEP 6
              title: 'Map display',
              description:
                'Users can choose to display greenhouse gas emissions, energy performance metrics, and property information like square footage. Click on these headers to minimize or maximize these data options. Click “More Info” to read about each display metric.',
              onNextClick: () => {
                // Zoom in so that building footprints are shown
                mapview.leafletMap.setView([47.6050418, -122.3299205], 16);
                driverObj.moveNext();
              }
            },
            onDeselected: () => {
              // reopen the accordion, select the first panel
              $('input#category-greenhouse-gas-emissions-expanded').click();
              $('#total_ghg_emissions').click();
              // restore the height of the panels
              $('#map-controls-content--inner').height('100%');
            }
          },
          {
            element: '#map',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            popover: {
              // STEP 7
              title: 'Map display',
              description:
                'Zooming in will display additional detail about the building location and footprints.',
              onNextClick: () => {
                // pretend to click this building (id 359 is specific to City Hall)
                mapview.currentLayerView.onFeatureClick(null, null, null, {
                  id: '359'
                });
                driverObj.moveNext();
              }
            }
          },
          {
            element: '#map',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 8
            popover: {
              title: 'Map display',
              description:
                'Clicking on a building shape or dot will display an information pop-up. To view a more detailed, building-specific performance report, click on “View Performance Report”.'
            }
          },
          {
            element: 'table.comparables',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            popover: {
              // STEP 9
              title: 'Compare buildings',
              description:
                'Buildings that are selected in succession will populate the Building Comparison tab. If you click on Building Comparison, a side-by-side comparison will expand from the bottom of the screen. Select different display metrics via the left pane.',
              onNextClick: () => {
                // Click "Show Report"
                $('button#view-report').click();
                // hack: tempoarily hide the highlight and popover
                // to make the long delay (waiting for the report to be present) less jarring
                // $('div#driver-popover-content').hide();
                // $('.driver-overlay path').css('opacity', 0);

                // without this delay, seems that Driver cannot find the element in the report
                setTimeout(function () {
                  driverObj.moveNext();
                }, 750);
              }
            }
          },
          {
            element: 'div[data-tutorial="building-details"]',
            onHighlighted: () => {
              // hack: restore the highlight and popover
              // $('div#driver-popover-content').show();
              // $('.driver-overlay path').css('opacity', 0.75);
              document.querySelector('.driver-popover').focus();
            },
            popover: {
              // STEP 10
              title: 'Building performance details',
              description:
                'This customized Performance Report displays the building’s Site EUI and GHG Intensity for the selected reporting year, as well as other useful benchmarking information.',
            }
          },
          {
            element: 'div[data-tutorial="energy-emissions"]',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 11
            popover: {
              title: 'Energy and Emissions',
              description:
                'The report displays how property energy consumption translates to Greenhouse Gas emissions.',
              onNextClick: () => {
                // Click the tab named "Emissions Targets"
                $('#emissions_targets').click();

                setTimeout(function () {
                  driverObj.moveNext();
                }, 100);
              }
            }
          },
          {
            element: 'div[data-tutorial="emissions-targets"]',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 12
            popover: {
              title: 'Emissions Targets',
              description:
                'The report displays a building’s estimated emissions targets under the Seattle Building Emissions Performance Standard (BEPS) law.',
            }
          },
          {
            element: 'div[data-tutorial="emissions-targets-ghg"]',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 13
            popover: {
              title: 'GHG Intensity',
              description:
                'The report also displays whether or not a building is currently on track to meet their first GHG intensity target.',
              onNextClick: () => {
                // Click the tab named "Energy Targets"
                $('#energy_targets').click();
                setTimeout(function () {
                  driverObj.moveNext();
                }, 100);
              }
            }
          },

          {
            element: 'div[data-tutorial="energy-targets"]',
            onHighlighted: () => {
              document.querySelector('.driver-popover').focus();
            },
            // STEP 14
            popover: {
              title: 'Energy Targets',
              description:
                'If applicable, the report also displays a building’s estimated EUI target under the Washington state Clean Building Performance Standard law.'
            }
          }
        ]
      });

      return driverObj;
    }),

    render: function (timeout) {
      let self = this;
      setTimeout(function () {
        self.driverObj.drive();
      }, timeout);

      return this;
    }
  });

  return Tutorial;
});
