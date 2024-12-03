define([], function () {
  function validateBuildingData(data, typings) {
    const nextData = {};
    let valid = true;

    for (const entry of Object.entries(typings)) {
      const [key, type] = entry;

      const value = data[key];

      const actualType = typeof value;

      if (actualType === 'undefined') {
        valid = false;
        console.warn(`${key} is undefined`);
      }

      switch (type) {
        // String
        case 'string': {
          nextData[key] = `${value}`;
          break;
        }
        // Number
        case 'number': {
          if (isNaN(value)) {
            valid = false;
            console.warn(`${key} should be a number but is ${actualType}`);
          } else {
            nextData[key] = Number(value);
          }
          break;
        }
        // Boolean
        case 'boolean': {
          let isValid = true;

          if (actualType === 'string') {
            isValid = value === 'true' || value === 'false';
            if (isValid) {
              nextData[key] = value === 'true' ? true : false;
            }
          } else {
            isValid = actualType === 'boolean';
            nextData[key] = value;
          }

          if (!isValid) {
            valid = false;
            console.warn(`${key} should be a number but is ${actualType}`);
          }
          break;
        }
        // Default
        default: {
          nextData[key] = value;
        }
      }
    }

    return { typedData: nextData, valid };
  }

  return validateBuildingData;
});
