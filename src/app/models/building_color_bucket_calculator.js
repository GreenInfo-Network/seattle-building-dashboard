define(['underscore', 'd3'], function (_, d3) {
  const BuildingColorBucketCalculator = function (
    buildings,
    fieldName,
    buckets,
    colorStops,
    cssFillType,
    thresholds
  ) {
    this.buildings = buildings;
    this.fieldName = fieldName;
    this.buckets = buckets;
    this.thresholds = thresholds;
    this.colorStops = colorStops;
    this.cssFillType = cssFillType || 'marker-fill';
    this.memoized = {};
    this.memoized.fieldValues = {};
    this.memoized.colorGradients = {};
    this.memoized.cartoCSS = {};
    this.memoized.histogram = {};
    this.memoized.bucketStops = this.calcBucketStops();
    this.memoized.gradientStops = this.calcGradientStops();
  };

  BuildingColorBucketCalculator.prototype.calcBucketStops = function () {
    const range = this.colorStops;
    const buckets = this.buckets;
    const rangeCount = _.max([range.length - 1, 1]);
    const domain = _.range(0, buckets, buckets / rangeCount).concat(buckets);

    return _.map(domain, function (bucket) {
      return _.max([0, bucket - 1]);
    });
  };

  BuildingColorBucketCalculator.prototype.calcGradientStops = function () {
    var range = this.colorStops;
    var buckets = this.buckets;
    var bucketStops = this.toBucketStops();
    var gradientScale = d3.scaleLinear().range(range).domain(bucketStops);

    return _.map(_.range(buckets), gradientScale);
  };

  BuildingColorBucketCalculator.prototype.cartoCSS = function () {
    if (this.memoized.cartoCSS.hasOwnProperty(this.fieldName)) {
      return this.memoized.cartoCSS[this.fieldName];
    }

    const stops = this.toGradientStops();
    const fieldName = this.fieldName;
    const gradient = this.colorGradient();
    const cssFillType = this.cssFillType;
    let css;

    // for polygons (only) we have to add a rule to "undo" the default polygon line:
    // some fields get a different outline in their base CSS, that only applies to NULL (defined by null_outline_css in seattle.json)
    // but all other non-null values, get a white outline
    // this will be very redundant, but it works
    let defaultPolygonLineStyle = 'line-color: #FFF';

    if (this.thresholds) {
      css = this.memoized.cartoCSS[this.fieldName] = _.map(stops, (stop, i) => {
        const min = _.min(gradient.invertExtent(stop));
        let cssText;
        if (i === 0) {
          cssText =
            cssFillType === 'polygon-fill'
              ? `[${fieldName}<${min}]{${cssFillType}:${stop}; ${defaultPolygonLineStyle}}`
              : `[${fieldName}<${min}]{${cssFillType}:${stop}}`;
          return cssText;
        }
        cssText =
          cssFillType === 'polygon-fill'
            ? `[${fieldName}>=${min}]{${cssFillType}:${stop}; ${defaultPolygonLineStyle}}`
            : `[${fieldName}>=${min}]{${cssFillType}:${stop}}`;
        return cssText;
      });
    } else {
      css = this.memoized.cartoCSS[this.fieldName] = _.map(stops, stop => {
        const min = _.min(gradient.invertExtent(stop));
        let cssText;
        cssText =
          cssFillType === 'polygon-fill'
            ? `[${fieldName}>=${min}]{${cssFillType}:${stop}; ${defaultPolygonLineStyle}}`
            : `[${fieldName}>=${min}]{${cssFillType}:${stop}}`;
        return cssText;
      });
    }
    return css;
  };

  BuildingColorBucketCalculator.prototype.getFieldValues = function () {
    if (this.memoized.fieldValues.hasOwnProperty(this.fieldName)) {
      return this.memoized.fieldValues[this.fieldName];
    }

    this.memoized.fieldValues[this.fieldName] = this.buildings.pluck(
      this.fieldName
    );

    this._minFieldValue = _.min(this.memoized.fieldValues[this.fieldName]);
    this._maxFieldValue = _.max(this.memoized.fieldValues[this.fieldName]);

    return this.memoized.fieldValues[this.fieldName];
  };

  BuildingColorBucketCalculator.prototype.colorGradient = function () {
    if (this.memoized.colorGradients.hasOwnProperty(this.fieldName)) {
      return this.memoized.colorGradients[this.fieldName];
    }

    // This is how we calculate the colors for the dots on the map.
    // But they don't line up with the colors in the histogram. Why not?

    // The domain is "fieldValues", which is an unordered list of all of the building value for this field.
    // But the domain for the histogram color ramp is just linear max and min for the given field.
    // And more importantly, it needs to be the max and min that's set according to the config file. That's how the colors get determined in the histogram,
    var stops = this.toGradientStops();
    var fieldValues = this.getFieldValues();

    let scale;
    if (this.thresholds) {
      scale = d3.scaleThreshold().domain(this.thresholds).range(stops);
    } else {
      // this quantile scale function brings in the entire sorted array of 3663 values
      scale = d3.scaleQuantile().domain(fieldValues).range(stops);
    }

    /*

    var r = [min, 24.8,29.1,36.0, max];
    var h = d3.layout.histogram().bins(r);
    console.log(h(fieldValues.filter(d => d !== null)));

    var c = ["#1f5dbe", "#c4b957", "#e9a646", "#c04f31"]
    var r =  [24.8,29.1,36.0];
    var s = d3.scaleThreshold().domain(r).range(c);

    */

    this.memoized.colorGradients[this.fieldName] = scale;
    return scale;
  };

  // Calculated in constructor
  BuildingColorBucketCalculator.prototype.toBucketStops = function () {
    return this.memoized.bucketStops;
  };

  // Calculated in constructor
  BuildingColorBucketCalculator.prototype.toGradientStops = function () {
    return this.memoized.gradientStops;
  };

  BuildingColorBucketCalculator.prototype.toCartoCSS = function () {
    return this.cartoCSS();
  };

  BuildingColorBucketCalculator.prototype.toColor = function (value) {
    var gradient = this.colorGradient();

    return gradient(value);
  };

  return BuildingColorBucketCalculator;
});
