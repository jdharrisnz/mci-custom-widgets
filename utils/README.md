# Custom Widget Utilities
Utils provides many functions for interacting with the Marketing Cloud Intelligence Custom Widget API and for transforming and analysing data in the custom widget data response. It's integrated closely with [d3.js](https://d3js.org/), so it's a good idea to learn that if you want to use this library.

It's hosted publicly here for loading as an external source:
`https://solutions.datorama-res.com/public_storage_solutions/utils/v1/utils.js`

## Documentation

### utils.getFieldDetails(systemName)
This is a wrapper function for `DA.query.getFieldDetails()`, returning a Promise for the result. Input is the field's system name.

### utils.getFormattedValue(systemName, value)
This is a wrapper function for `DA.query.getFormattedValue()`, returning a Promise for the result. Input is the field's system name and the value to be formatted. It can be very slow if calling it dozens of times to load a widget.

### utils.metricFormatOptions(value)
Returns an array of `{ 'id': x, 'label': y }` objects for use in the design settings `select` option type. The first option, default, points you to use system default formatting via `.getFormattedValue()`. Other options' labels show the result of a [d3-format](https://github.com/d3/d3-format) function called with the input value, alongside a static example. The `id` of the option is the format string for creating the function, so if the selected option is not `0`, you can jump straight to creating the formatter.

### utils.setDesignOptions(options)
This is a wrapper function for `DA.widget.customDesignSettings.set()`. It doesn't do anything special, it's just nicer to use.

### utils.getDesignSettings()
This is a wrapper function for `DA.widget.customDesignSettings.get()`, returning a Promise for the result.

### utils.getBotList()
This is a wrapper function for `DA.api.EMI.getBotsSummary()`, returning a Promise for the result.

### utils.getBotResults(botId)
This is a wrapper function for `DA.api.EMI.getInsightsByBotId()`, returning a Promise for the result. The input is the bot id.

### utils.dayDiff(startDate, endDate)
`startDate` and `endDate` are both JavaScript `Date` objects. It sets hours to zero, calculates the difference in days, adds one, then rounds to remove daylight savings differences between start and end.

### utils.hexToRgb(hex)
Converts hex colours to RGB. Supports 3-length hex shorthands. Returns an array of 255-base RGB colours, length 3 for RGB and length 4 for RGBA.

### utils.errorMessageTemplate()
Clears all HTML content of `#__da-app-content` and creates an error message in the style of native MC Intelligence widgets, plus a title so the user knows what they're looking at.

Returns an object containing references to the elements to be filled in. Usage:
```javascript
if (invalidInput) {
	// Clear the HTML and fill it with the template
	const myError = utils.errorMessageTemplate();

	// Enter the text
	myError.title.text('Widget Name');
	myError.heading.text('Name of Error');
	myError.message
		.style('text-align', 'center')
		.html('Here\'s a multiline centered error message<br/>\
			explaining what went wrong and how to fix it.');

	// Optional: Update the SVG error icon
	// Accessed in myError.svg

	throw new Error('Error message.');
}
```

### class utils.dataSet(options)
Usage: `const data = await new utils.dataSet()`. The `await` keyword is essential, since the class constructor is asynchronous. This class is very useful for data analysis and transformation.

#### Options
The options passed to the constructor takes the following form:
```javascript
{
	'metricFormatDiscovery': true,
	'metricSummableDiscovery': true,
	'groupOthers': true,
	'foldTimeComparisons': true,
	'convertAllDates': true,
	'getFieldDetails': true
}
```
You may include only the keys you need and remove the others, or pass nothing at all.

##### metricFormatDiscovery
Each metric an every row is analysed to discover the locale's thousands, decimals, currency, and friendly formatting. Adds a `format(value)` function to the metric's corresponding field.

Limitations:
* Doesn't work for time comparison change indicator fields
* May not detect the right format if non-automatic friendly formatting is used, but all rows fall within the same format group (will assume Automatic in this case)
* Obviously can't do anything for fields with no data showing up in the rows

##### metricSummableDiscovery
Relies on `'metricFormatDiscovery': true`, does nothing otherwise.

This sums all data, formats it, and checks the result against the total (which only comes as a formatted string). Results that match are summable. This adds `'summable': true` to the metric's corresponding field.

After finding summable fields, non-summable fields are tested for calculability by dividing other summable fields in all combinations of numerators and denominators, including 'per mille' variations for metrics like CPM. This adds `'calculable': true`, `numerator`, `numeratorIndex`, `denominator`, and `denominatorIndex` to the metric's corresponding field.

##### groupOthers
This is not yet implemented. It will keep only the top X rows, and group the rest as 'Other' with the aggregated metrics. Relies on `'metricFormatDiscovery': true` and `'metricSummableDiscovery': true`.

##### foldTimeComparisons
This folds time comparison fields into attributes of the fields they are based on. This way, they're much easier to use in context with the original fields.

##### convertAllDates
This attempts to convert all dimension data in the `value` attribute of all rows to JavaScript `Date` objects, and keeps the value if it worked.

##### getFieldDetails
This runs the `getFieldDetails` function on every field in the query, and saves the result in an attribute of the field.

#### Data Enhancement
The class will always apply the following data enhancements, which are intended to make it easier to work with the data.

1. Restructures the `queryResult.totals` data similarly to that found in `queryResult.rows`: `{ 'value': x, 'formattedValue': y }`. The `value` attribute is filled if `metricSummableDiscovery` is enabled and the field is summable.
2. Every field is labelled with its index. Note this happens *after* the `foldTimeComparisons` operation, so they remain accurate if any changes were made as a result of that.
3. All row cells have their corresponding fields loaded in their `field` attribute.

#### Basic Functions
All functions that return data do so by returning copies of the underlying data, so it can't be modified by any operations happening in your widget.

`data.fields(), data.headers()`: Returns the query fields.

`data.dimensions()`: Returns fields filtered to dimensions.

`data.metrics()`: Returns fields filtered to metrics.

`data.rows()`: Returns data rows.

`data.totals()`: Returns data totals.

`data.errorNoData(title)`: A complete implementation of `utils.errorMessageTemplate()`. Checks if there are no rows, and if so, displays an error mimicking the one used on native widgets and stops the widget processing.

#### Data Transformation Functions
The following data transformation functions are intended to help with getting data into the right shape for creating widgets with `d3.js`.

`data.transpose()`: Returns an object with attributes `headers`, `rows`, and `totals`. The data inside is a transposed table.

`data.pivot()`: This is not yet implemented. It will return pivoted data, where certain row dimensions are turned into column dimensions.

`data.nest(depth=0, maxDepth=self.dimensions().length, data=self.rows())`: This will recursively loop through the supplied `data`, grouping rows under the `formattedValue` values of the data in the first column, then removing the first column and running it again, until all dimensions are exhausted. By default, if run with no input, it will be run on the entire class data set. However, it can also be used with any input.

`data.subtotals(dimIndex)`: Rearranges the class data set so that the requested `dimIndex` is in the first column, then runs `self.nest(0, 1, data)`, grouping together only the first column.

### Date Class Extensions
Utils also extends the `Date` class with useful text format functions for using in labels.

#### Date.getWeek(dowOffset)
Returns "w01", "w15", etc., [according to the week number definition of ISO 8601](https://en.wikipedia.org/wiki/ISO_week_date). Optionally accepts a `dowOffset` input to indicate the first day of the week. Sunday = 0, Monday = 1, etc. Defaults to Monday.

#### Date.getQuarter(quarterOffset)
Returns "Q1 2022", for example, with the year from the year in which Q4 ends. Optionally accepts a `quarterOffset` input to shift the year boundary by x months, from 0 to 11.