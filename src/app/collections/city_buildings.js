define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var urlTemplate = _.template(
    'https://<%= cartoDbUser %>.carto.com/api/v2/sql'
  );

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function normalizeCityBuildingCategories(categories) {
    return _.map(categories, function(category) {
      return {
        field: category.field,
        other: category.other,
        values: _.map(category.values, function(value) {
            if (isNumeric(value)) return +value;
            return value;
        })
      };
    });
  }

  function normalizeCityBuildingRanges(ranges) {
    return _.map(ranges, function(range) {
      return {
        field: range.field,
        max: +range.max,
        min: +range.min
      };
    });
  }

  function isValidCategoryValue(value, category) {
    var _value = isNumeric(value) ? +value : value;
    var idx = category.values.indexOf(_value);

    if ( (category.other === 'false' || category.other === false)) { // IN
      if (idx < 0) return false;
    } else { // NOT IN
      if (idx > -1) return false;
    }

    return true;
  }

  function isValidRangeValue(value, range) {
    var _value = parseFloat(value);

    if (!_.isNumber(_value)) {
      return false;
    }
    // Handle situations where there's only a min or only a max
    if (range.min && range.max) {
      return (_value >= range.min && _value <= range.max);
    } else if (range.min) {
      return (_value >= range.min);
    } else if (range.max) {
      return (_value <= range.max);
    }
  }

  function cityBuildingsFilterizer(buildings, categories, ranges) {
    var normalizedCategories = normalizeCityBuildingCategories(categories);
    var normalizedRanges = normalizeCityBuildingRanges(ranges);

    return buildings.filter(function(building, i){
      var valid = true;

      var atts = building.attributes;

      // categories
      normalizedCategories.forEach(function(category){
        if (!valid) return;
        if (!isValidCategoryValue(atts[category.field], category)) valid = false;
      });


      // ranges
      normalizedRanges.forEach(function(range) {
        if (!valid) return;
        if (!isValidRangeValue(atts[range.field], range)) valid = false;
      });

      return valid;
    });
  }

  var CityBuildingQuery = function(table_name, year, categories, ranges) {
    this.tableName = table_name;
    this.categories = categories;
    this.ranges = ranges;
    this.year = year;
  };

  CityBuildingQuery.prototype.toRangeSql = function(prefix) {
    prefix = prefix || '';
    return _.map(this.ranges, function(range) {
      // Handle situations where there's only a min or only a max
      if (range.min && range.max) {
        return prefix + range.field + ' BETWEEN ' + range.min + ' AND ' + range.max;
      } else if (range.min) {
        return prefix + range.field + ' >= ' + range.min;
      } else if (range.max) {
        return prefix + range.field + ' <= ' + range.max;
      }
    });
  };

  CityBuildingQuery.prototype.toWrappedValue = function(value) {
    return `'${value}'`;
  };

  CityBuildingQuery.prototype.toCategorySql = function(prefix) {
    prefix = prefix || '';
    var self = this;
    return _.map(this.categories, function(category){
      var operation = (category.other === 'false' || category.other === false) ? 'IN' : 'NOT IN';
      var values = _.map(category.values, self.toWrappedValue);
      if (values.length === 0) return '';
      return prefix + category.field + ' ' + operation + ' (' + values.join(', ') + ')';
    });
  };

  CityBuildingQuery.prototype.toYearSql = function(prefix) {
    prefix = prefix || '';
    return [prefix + 'year=' + this.year];
  };

  CityBuildingQuery.prototype.toSql = function() {
    var table = this.tableName;
    var rangeSql = this.toRangeSql();
    var categorySql = this.toCategorySql();
    var yearSql = this.toYearSql();
    var filterSql = yearSql.concat(rangeSql).concat(categorySql).join(' AND ');
    var output = ['SELECT ST_X(the_geom) AS lng, ST_Y(the_geom) AS lat,* FROM ' + table].concat(filterSql).filter(function(e) { return e.length > 0; });
    return output.join(' WHERE ');
  };

  CityBuildingQuery.prototype.toSqlComponents = function(prefix) {
    return {
      table: this.tableName,
      range: this.toRangeSql(prefix),
      category: this.toCategorySql(prefix),
      year: this.toYearSql(prefix)
    };
  };


  var CityBuildings = Backbone.Collection.extend({
    initialize: function(models, options){
      this.tableName = options.tableName;
      this.cartoDbUser = options.cartoDbUser;
    },
    url: function() {
      return urlTemplate(this);
    },
    fetch: function(year, categories, range) {
      var query = this.toSql(year, categories, range);
      var result = Backbone.Collection.prototype.fetch.apply(this, [{ data: { q: query } }]);
      return result;
    },
    parse: function(data){
      // Housecleaning: If iscompliantflag is false (meaning site_eui_wn is null), then the following should also be set:
      // TODO: This should really be done upstream in R before the data goes to CARTO, but...
      // * total_ghg_emissions => null
      // * total_ghg_emissions_intesity => null
      // * energy_star_score => null
      data.rows.forEach(function(row) {
        if (row.iscompliantflag != true) {
          // do the updates
          // tbh, I'm not sure where this would matter or be displayed in the application
          // the CartoCSS we send is used with the data on CARTO to make tiles, not local values... 
          // see also building_layer.js where the CartoCSS is generated
          row.total_ghg_emissions = null;
          row.total_ghg_emissions_intensity = null;
          row.energy_star_score = null;
        }
      })

      return data.rows;
    },
    toSql: function(year, categories, range){
      return new CityBuildingQuery(this.tableName, year, categories, range).toSql();
    },
    toSqlComponents: function(year, categories, range, prefix){
      return new CityBuildingQuery(this.tableName, year, categories, range).toSqlComponents(prefix);
    },
    toFilter: function(buildings, categories, ranges) {
      return cityBuildingsFilterizer(buildings, categories, ranges);
    }
  });

  return CityBuildings;
});


