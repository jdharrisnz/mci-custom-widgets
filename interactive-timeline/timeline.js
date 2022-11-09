const timeline = {
	'initialize': function() {
		// Load dependencies
		const loadScript = function(url, onload) {
			const head = document.getElementsByTagName('head')[0];
			const script = document.createElement('script');
			script.src = url;
			script.onload = onload;
			head.appendChild(script);
		};

		loadScript(
			'https://d3js.org/d3.v7.min.js',
			() => { loadScript(
				'https://solutions.datorama-res.com/public_storage_solutions/utils/v1/utils.js',
				timeline._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Store the query result
		const data = await new utils.dataSet({
			'metricFormatDiscovery': true,
			'metricSummableDiscovery': true
		});
		const query = DA.query.getQuery();

		// Ensure the query meets the conditions
		if (data.dimensions().length < 3) { // If query has fewer than three dimensions (main, start, end)
			const myError = utils.errorMessageTemplate();

			if (data.isWidgetEmpty()) {
				myError.title.text('Interactive Timeline');
				myError.svg
					.attr('viewBox', '-10 0 522 512')
					.selectAll('path')
					.remove();
				myError.svg.append('path')
					.attr('d', 'M416 128h-384q-14 0 -23 -9t-9 -23t9 -23t23 -9h384q14 0 23 9t9 23t-9 23t-23 9v0zM416 448h-384q-14 0 -23 -9t-9 -23t9 -23t23 -9h384q14 0 23 9t9 23t-9 23t-23 9v0z');
				myError.svg.append('path')
					.attr('opacity', 0.4)
					.attr('d', 'M64 256q0 -14 9 -23v0q9 -9 23 -9h384q14 0 23 9t9 23t-9 23t-23 9h-384q-14 0 -23 -9t-9 -23v0z');
				myError.heading.text('Widget Setup');
			}
			else {
				myError.title.text('Interactive Timeline');
				myError.heading.text('Invalid Query Settings');
			}
			
			myError.message.append('span').text('To populate this widget, add to the Data tab');
			const errorList = myError.message.append('ul');
			errorList.append('li').text('a main label dimension;');
			errorList.append('li').text('a start date dimension;');
			errorList.append('li').text('an end date dimension; and, optionally');
			errorList.append('li').html('a group dimension, a colour dimension,<br/>and summable measurement(s).')
			myError.message.append('span').text('Then fill out the widget\'s Design tab.');

			throw new Error('Invalid query settings. Add main label, start date, and end date dimensions.');
		}
		data.errorNoData('Interactive Timeline'); // Zero rows

		// Set the design options
		let generalOptions = [
			{
				'type': 'title',
				'displayName': 'General Settings'
			},
			{
				'type': 'select',
				'id': 'granularity',
				'displayName': 'Timeline Granularity',
				'options': [
					{ 'id': 'auto', 'label': 'Auto' },
					{ 'id': 'day', 'label': 'Day'},
					{ 'id': 'week', 'label': 'Week' },
					{ 'id': 'bi-week', 'label': 'Bi-Week' },
					{ 'id': 'month', 'label': 'Month' },
					{ 'id': 'quarter', 'label': 'Quarter' }
				],
				'defaultValue': 'auto',
				'description': 'Choose a granularity for the timeline date label row. This has no effect on the precision of the timeline bars, which is always daily.'
			},
			{
				'type': 'select',
				'id': 'weekStart',
				'displayName': 'Start of Week',
				'options': [
					{ 'id': 0, 'label': 'Sunday' },
					{ 'id': 1, 'label': 'Monday' },
					{ 'id': 2, 'label': 'Tuesday' },
					{ 'id': 3, 'label': 'Wednesday' },
					{ 'id': 4, 'label': 'Thursday' },
					{ 'id': 5, 'label': 'Friday' },
					{ 'id': 6, 'label': 'Saturday' }
				],
				'defaultValue': 1,
				'description': 'Only has an effect when selected Timeline Granularity is Week, Bi-Week, or Auto.'
			},
			{
				'type': 'select',
				'id': 'yearStart',
				'displayName': 'Start of Year',
				'options': [
					{ 'id': 0, 'label': 'January' },
					{ 'id': 1, 'label': 'February' },
					{ 'id': 2, 'label': 'March' },
					{ 'id': 3, 'label': 'April' },
					{ 'id': 4, 'label': 'May' },
					{ 'id': 5, 'label': 'June' },
					{ 'id': 6, 'label': 'July' },
					{ 'id': 7, 'label': 'August' },
					{ 'id': 8, 'label': 'September' },
					{ 'id': 9, 'label': 'October' },
					{ 'id': 10, 'label': 'November' },
					{ 'id': 11, 'label': 'December' }
				],
				'defaultValue': 0,
				'description': 'Only has an effect when selected Timeline Granularity is Month, Quarter, or Auto.'
			}
		];

		let colorOptions = [
			{
				'type': 'separator'
			},
			{
				'type': 'title',
				'displayName': 'Colour Coding Settings'
			},
			{
				'type': 'select',
				'id': 'colourCodingType',
				'displayName': 'Colour Coding Type',
				'options': [
					{ 'id': 'solid', 'label': 'Single Colour' },
					{ 'id': 'dimension', 'label': 'Based on Dimension' },
					{ 'id': 'pacing', 'label': 'Based on Pacing' }
				],
				'defaultValue': 'solid'
			}
		];
		
		let restOfOptions = [
			{
				'type': 'separator'
			},
			{
				'type': 'title',
				'displayName': 'Dimension Roles'
			},
			{
				'type': 'select',
				'id': 'mainDim',
				'displayName': 'Main Dimension',
				'options': data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name }; }),
				'defaultValue': data.dimensions()[0]?.systemName,
				'description': 'Select the field by which to group timeline bars. This will also be used as the label.'
			},
			{
				'type': 'select',
				'id': 'startDate',
				'displayName': 'Start Date',
				'options': data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name }; }),
				'defaultValue': data.dimensions()[1]?.systemName,
				'description': 'Select the start date related to the main dimension. The widget may fail if it\'s not of type "date".'
			},
			{
				'type': 'select',
				'id': 'endDate',
				'displayName': 'End Date',
				'options': data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name }; }),
				'defaultValue': data.dimensions()[2]?.systemName,
				'description': 'Select the end date related to the main dimension. The widget may fail if it\'s not of type "date".'
			},
			{
				'type': 'select',
				'id': 'groupDim',
				'displayName': 'Timeline Groups',
				'options': [{ 'id': 'None', 'label': 'None' }].concat(data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name }; })),
				'defaultValue': 'None',
				'description': 'Select the dimension by which to segment the timeline. If "None" is selected, a single group will be created with the name of the main dimension.'
			},
			{
				'type': 'separator'
			},
			{
				'type': 'title',
				'displayName': 'Measurement Roles'
			},
			{
				'type': 'select',
				'id': 'numerator',
				'displayName': 'Progress Bar Numerator',
				'options': [{ 'id': 'None', 'label': 'None (no progress bars)' }].concat(data.metrics().map(x => { return { 'id': x.systemName, 'label': x.name }; })),
				'defaultValue': data.metrics()[0]?.systemName ?? 'None',
				'description': 'Select the metric that measures progress against a target (e.g., Media Cost). If this is set but the denominator (below) is not, it will just be used as a label.'
			},
			{
				'type': 'select',
				'id': 'denominator',
				'displayName': 'Progress Bar Denominator',
				'options': [{ 'id': 'None', 'label': 'None (no progress bars)' }].concat(data.metrics().map(x => { return { 'id': x.systemName, 'label': x.name }; })),
				'defaultValue': data.metrics()[1]?.systemName ?? 'None',
				'description': 'Select the metric that provides the target against which progress is measured (e.g., Budget).'
			},
			{
				'type': 'separator'
			},
			{
				'type': 'title',
				'displayName': 'Mouseover Tooltip Inclusion'
			},
			{
				'type': 'checkbox',
				'id': 'tooltip',
				'displayName': 'Include In Tooltip',
				'options': data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name, 'defaultValue': true }; }),
				'description': 'If unchecked, the field and value won\'t appear in the mouseover tooltips.'
			}
		];

		utils.setDesignOptions(generalOptions.concat(colorOptions).concat(restOfOptions));

		// Get the design settings, then set dependent options
		let designSettings = await utils.getDesignSettings();

		if (designSettings.colourCodingType == 'solid') {
			colorOptions = colorOptions.concat([
				{
					'type': 'colorPicker',
					'id': 'barColour',
					'displayName': 'Timeline Bar Colour',
					'defaultValue': '#4879AB',
					'description': 'A 100% opacity version of this will be used for the progress bar, and 20% opacity for the timeline bar background.'
				}
			]);
		}
		else if (designSettings.colourCodingType == 'dimension') {
			colorOptions = colorOptions.concat([
				{
					'type': 'select',
					'id': 'colourDim',
					'displayName': 'Colour Coding Dimension',
					'options': data.dimensions().map(x => { return { 'id': x.systemName, 'label': x.name }; }),
					'defaultValue': data.dimensions()[0].systemName,
					'description': 'Select the dimension by which to colour code the bars.'
				},
				{
					'type': 'select',
					'id': 'colourSet',
					'displayName': 'Colour Coding Style',
					'options': ['Turbo', 'Viridis', 'Inferno', 'Magma', 'Plasma', 'Cividis', 'Warm', 'Cool'].map(x => { return { 'id': x, 'label': x }; }),
					'defaultValue': 'Turbo',
					'description': 'Colours will be picked from the selected style.'
				}
			]);
		}
		else if (designSettings.colourCodingType == 'pacing') {
			colorOptions = colorOptions.concat([
				{
					'type': 'input',
					'id': 'minRed',
					'displayName': 'Minimum Red Boundary',
					'defaultValue': '0.5',
					'description': 'At this pace (default 50%), the bar will be coloured reddest, up to green at 100%. Enter as 0.5, 0.75, 1, 1.25, 1.5, etc..'
				},
				{
					'type': 'input',
					'id': 'maxYellow',
					'displayName': 'Maximum Yellow Boundary',
					'defaultValue': '1.5',
					'description': 'At this pace (default 150%), the bar will be coloured yellowest, up from green at 100%. Enter as 0.5, 0.75, 1, 1.25, 1.5, etc..'
				}
			]);
		}

		utils.setDesignOptions(generalOptions.concat(colorOptions).concat(restOfOptions));

		// Get the design settings again, then create the widget
		designSettings = await utils.getDesignSettings();

			// Ensure no leftover invalid settings selections
			for (const option of ['mainDim', 'startDate', 'endDate', 'groupDim', 'numerator', 'denominator']) {
				if (designSettings[option] != 'None' && data.fields().findIndex(field => field.systemName == designSettings[option]) == -1) {
					const myError = utils.errorMessageTemplate();

					myError.title.text('Interactive Timeline');
					myError.heading.text('Invalid Design Settings');
					myError.message
						.style('text-align', 'center')
						.html('A field selected in the widget\'s Design tab was removed<br/>from the data query. Choose a replacement, or pick None.');

					throw new Error('Invalid design settings. A field selected in the widget\'s Design tab was removed from the data query.');
				}
			}

			// If labels are enabled, ensure they're summable
			if ((designSettings.numerator != 'None'
					&& (data.metrics().find(d => d.systemName == designSettings.numerator).summable === false
					|| data.metrics().find(d => d.systemName == designSettings.numerator)?.calculable === false))
				|| (designSettings.denominator != 'None'
					&& (data.metrics().find(d => d.systemName == designSettings.denominator).summable == false
					|| data.metrics().find(d => d.systemName == designSettings.denominator)?.calculable === false))) {
				const myError = utils.errorMessageTemplate();

				myError.title.text('Interactive Timeline');
				myError.heading.text('Label Metrics Not Summable');
				myError.message
					.style('text-align', 'center')
					.html('Metrics used in this widget must be summable or able<br/>\
						to be calculated by dividing other summable inputs, e.g.<br/>\
						to display CTR, add CTR, Impressions, and Clicks to the widget.<br/><br/>\
						"Summable" means <i>simply summable</i>,<br/>\
						i.e. each row adds up to the total.<br/><br/>\
						Unfortunately that means lifetime accumulative<br/>\
						metrics are not supported, since they don\'t work<br/>\
						with the widget\'s key feature of date aggregation.');

				throw new Error('Label metrics are not summable or calculable.');
			}

		// Function to get bar colours
		const getBarColour = function(d, elementType) {
			const opacity = elementType == 'bar' ? 0.2 : 1;
			if (designSettings.colourCodingType == 'solid') {
				const resultColour = utils.hexToRgb(designSettings.barColour);
				return 'rgba(' + resultColour.slice(0, 3).join(', ') + ', ' + opacity + ')';
			}
			else if (designSettings.colourCodingType == 'dimension') {
				const colourDim = data.fields().find(field => field.systemName == designSettings.colourDim);
				if (designSettings.mainDim == designSettings.colourDim) {
					var resultColour = dimColourScale((colourGroups.indexOf(d.name) + 1) / colourGroups.length);
				}
				else {
					var resultColour = dimColourScale((colourGroups.indexOf(d.values[0][indexAdj(colourDim)].formattedValue) + 1) / colourGroups.length);
				}
				resultColour = resultColour.includes('#') ? 'rgb(' + hexToRgb(resultColour).join(',') + ')' : resultColour;
				return 'rgba' + resultColour.slice(3, resultColour.length - 1) + ', ' + opacity + ')';
			}
			else if (designSettings.colourCodingType == 'pacing'
					&& designSettings.numerator != 'None'
					&& designSettings.denominator != 'None') {
				const underPacingScale = d3.interpolate('#e15759', '#59a14f');
				const overPacingScale = d3.interpolate('#59a14f', '#edc958');
				const timeProgress = new Date() < d.startDate
					? 0.01 // If it hasn't started, minimum nonzero progress
					: d.endDate < new Date()
					? 1 // If it's ended, maximum progress
					: (new Date() - d.startDate) / (d.endDate - d.startDate); // Else calculate progress
				const normalisedDenom = d.subtotals[denomIndex - (data.dimensions().length - 1)].value * timeProgress;
				const pacing = d.subtotals[numerIndex - (data.dimensions().length - 1)].value / normalisedDenom;
				const minRed = designSettings.minRed < 1 ? designSettings.minRed : 0.5;
				const maxYellow = designSettings.maxYellow > 1 ? designSettings.maxYellow : 1.5;
				let resultColour = pacing < 1 ? underPacingScale(pacing) : overPacingScale(pacing);
				resultColour = resultColour.includes('#') ? 'rgb(' + utils.hexToRgb(resultColour).join(',') + ')' : resultColour;
				return 'rgba' + resultColour.slice(3, resultColour.length - 1) + ', ' + opacity + ')';
			}
			else { // Will happen when set to pacing but numerator or denominator are not set
				const resultColour = utils.hexToRgb('#4879AB');
				return 'rgba(' + resultColour.slice(0, 3).join(', ') + ', ' + opacity + ')';
			}
		}

		// Set some useful variables
		const queryStart = new Date(query.filter['Start Date'].value[0].value[0]);
		const queryEnd = new Date(query.filter['End Date'].value[0].value[0]);
		const daySpan = utils.dayDiff(queryStart, queryEnd);

		// Create the document structure and set the grid size
		const container = d3.select('#__da-app-content').append('div')
			.attr('id', 'container');
		const header = container.append('div')
			.attr('id', 'header')
			.style('grid-template-columns', 'repeat(' + daySpan + ', minmax(0, 1fr))');
		const body = container.append('div')
			.attr('id', 'body');
		const tooltip = d3.select('#__da-app-content').append('div')
			.attr('id', 'tooltip')
			.style('display', 'none');

		// Summarise the data according to the main dimension
		const mainDimIndex = data.fields().findIndex(field => field.systemName == designSettings.mainDim);

		const indexAdj = function(field) {
			return field.index - (field.index < mainDimIndex ? 0 : 1);
		};

		const startIndex = indexAdj(data.fields().find(field => field.systemName == designSettings.startDate));
		const endIndex = indexAdj(data.fields().find(field => field.systemName == designSettings.endDate));
		const numerIndex = indexAdj(data.fields().find(field => field.systemName == designSettings.numerator));
		const denomIndex = indexAdj(data.fields().find(field => field.systemName == designSettings.denominator));

		const summaryRows = data.subtotals(mainDimIndex).map(subtotal => {
			subtotal.startDate = new Date(d3.min(subtotal.values, x => x[startIndex].value));
			subtotal.endDate = new Date(d3.min(subtotal.values, x => x[endIndex].value));
			return subtotal;
		});

			// Ensure all dates can be converted
			if (!summaryRows.every(row => row.startDate != 'Invalid Date' && row.endDate != 'Invalid Date')) {
				const myError = utils.errorMessageTemplate();

				myError.title.text('Interactive Timeline');
				myError.heading.text('Invalid Date Dimension(s)');
				myError.message
					.style('text-align', 'center')
					.html('At least one row of your selected date dimensions have<br/>\
						failed to convert to a date. To best ensure compatibility,<br/>\
						only use date-type dimensions in the date field roles.');

				throw new Error('Invalid date dimensions. At least one row of the selected date dimensions failed to convert to a date.');
			}

		// If dimension colour coding is set, create a legend
		if (designSettings.colourCodingType == 'dimension') {
			var colourDim = data.fields().find(field => field.systemName == designSettings.colourDim);
			if (colourDim.systemName == designSettings.mainDim) {
				var colourGroups = summaryRows.map(x => x.name);
			}
			else {
				var colourGroups = Array.from(new Set(summaryRows.map(row => row.values[0][indexAdj(colourDim)].formattedValue)));
			}
			var dimColourScale = eval('d3.interpolate' + designSettings.colourSet);

			var legend = d3.select('#__da-app-content').insert('div', '*')
				.attr('id', 'legend');

			var legendItems = legend.selectAll('div.legend-item')
				.data(colourGroups)
			.join('div')
				.attr('class', 'legend-item')
				.style('border-bottom-color', (d, i) => dimColourScale((i + 1) / colourGroups.length))
				.attr('title', d => d == '' ? 'null' : d)
				.text(d => d == '' ? 'null' : d);
		}

		// Create the header rows
			// Functions for generating header data
			const getLoopStart = function(granularity) {
				switch(granularity) {
					case 'week':
						var loopStart = new Date(
							queryStart.getFullYear(),
							queryStart.getMonth(),
							queryStart.getDate() - (queryStart.getDay() - designSettings.weekStart)
						);
						if (loopStart > queryStart) {
							loopStart.setDate(loopStart.getDate() - 7);
						}
						return loopStart;
					case 'bi-week':
						var loopStart = new Date(
							queryStart.getFullYear(),
							queryStart.getMonth(),
							queryStart.getDate() - (queryStart.getDay() - designSettings.weekStart)
						);
						if (parseInt(loopStart.getWeek(designSettings.weekStart).slice(-1)) % 2 === 0) {
							loopStart.setDate(loopStart.getDate() - 7);
						}
						if (loopStart > queryStart) {
							loopStart.setDate(loopStart.getDate() - 14);
						}
						return loopStart;
					case 'quarter':
						var loopStart = new Date(
							queryStart.getFullYear(),
							queryStart.getMonth() - (queryStart.getMonth() % 3) + (designSettings.yearStart % 3),
							1
						);
						if (loopStart > queryStart) {
							loopStart.setMonth(loopStart.getMonth() - 3);
						}
						return loopStart;
					case 'year':
						var loopStart = new Date(
							queryStart.getFullYear(),
							0,
							1
						);
						if (loopStart > queryStart) {
							loopStart.setFullYear(loopStart.getFullYear() - 1);
						}
						return loopStart;
				}
			};

			const timesToLoop = function(granularity) {
				switch(granularity) {
					case 'day':
						return daySpan;
					case 'week':
						return utils.dayDiff(getLoopStart('week'), queryEnd) / 7;
					case 'bi-week':
						return utils.dayDiff(getLoopStart('bi-week'), queryEnd) / 14;
					case 'month':
						return ((queryEnd.getYear() - queryStart.getYear()) * 12) + queryEnd.getMonth() - queryStart.getMonth() + 1;
					case 'quarter':
						const loopStart = getLoopStart('quarter');
						return (((queryEnd.getYear() - loopStart.getYear()) * 12) + queryEnd.getMonth() - loopStart.getMonth() + 1) / 3;
					case 'year':
						return queryEnd.getYear() - queryStart.getYear() + 1
				}
			};

			const getHeaderRow = function(granularity, rowNum) {
				const result = [];
				switch(granularity) {
					case 'day':
						for (let i = 0; i < timesToLoop('day'); i++) {
							const thisDay = new Date(
								queryStart.getFullYear(),
								queryStart.getMonth(),
								queryStart.getDate() + i
							);
							const position = utils.dayDiff(queryStart, thisDay);
							result.push({
								'label': thisDay.getDate(),
								'class': 'header row' + rowNum,
								'start': position,
								'span': 1
							});
						}
						return result;
					case 'week':
						var loopStart = getLoopStart('week');
						for (let i = 0; i < timesToLoop('week'); i++) {
							const thisWeek = new Date(
								loopStart.getFullYear(),
								loopStart.getMonth(),
								loopStart.getDate() + i * 7
							);
							const startDate = new Date(Math.max(queryStart, thisWeek));
							const endDate = new Date(Math.min(
								queryEnd,
								new Date(
									thisWeek.getFullYear(),
									thisWeek.getMonth(),
									thisWeek.getDate() + 7
								)
							));
							result.push({
								'label': thisWeek.getWeek(designSettings.weekStart),
								'class': 'header row' + rowNum,
								'start': utils.dayDiff(queryStart, startDate),
								'span': Math.max(1, utils.dayDiff(startDate, endDate) - 1)
							});
						}
						return result;
					case 'bi-week':
						var loopStart = getLoopStart('bi-week');
						for (let i = 0; i < timesToLoop('bi-week'); i++) {
							const thisWeek = new Date(
								loopStart.getFullYear(),
								loopStart.getMonth(),
								loopStart.getDate() + i * 14
							);
							const startDate = new Date(Math.max(queryStart, thisWeek));
							const endDate = new Date(Math.min(
								queryEnd,
								new Date(
									thisWeek.getFullYear(),
									thisWeek.getMonth(),
									thisWeek.getDate() + 14
								)
							));
							result.push({
								'label': thisWeek.getWeek(designSettings.weekStart) + '-' + new Date(
										thisWeek.getFullYear(),
										thisWeek.getMonth(),
										thisWeek.getDate() + 7
									).getWeek(designSettings.weekStart),
								'class': 'header row' + rowNum,
								'start': utils.dayDiff(queryStart, startDate),
								'span': Math.max(1, utils.dayDiff(startDate, endDate) - 1)
							});
						}
						return result;
					case 'month':
						for (let i = 0; i < timesToLoop('month'); i++) {
							const thisMonth = new Date(
								queryStart.getFullYear(),
								queryStart.getMonth() + i,
								1
							);
							const startDate = new Date(Math.max(queryStart, thisMonth));
							const endDate = new Date(Math.min(
								queryEnd,
								new Date(
									thisMonth.getFullYear(),
									thisMonth.getMonth() + 1,
									0
								)
							));
							result.push({
								'label': thisMonth.toLocaleString('default', { 'month': 'short' }),
								'class': 'header row' + rowNum,
								'start': utils.dayDiff(queryStart, startDate),
								'span': utils.dayDiff(startDate, endDate)
							});
						}
						return result;
					case 'quarter':
						var loopStart = getLoopStart('quarter');
						for (let i = 0; i < timesToLoop('quarter'); i++) {
							const thisQuarter = new Date(
								loopStart.getFullYear(),
								loopStart.getMonth() + i * 3,
								1
							);
							const startDate = new Date(Math.max(queryStart, thisQuarter));
							const endDate = new Date(Math.min(
								queryEnd,
								new Date(
									thisQuarter.getFullYear(),
									thisQuarter.getMonth() + 3,
									0
								)
							));
							result.push({
								'label': thisQuarter.getQuarter(designSettings.yearStart),
								'class': 'header row' + rowNum,
								'start': utils.dayDiff(queryStart, startDate),
								'span': utils.dayDiff(startDate, endDate)
							});
						}
						return result;
					case 'year':
						var loopStart = getLoopStart('year');
						for (let i = 0; i < timesToLoop('year'); i++) {
							const thisYear = new Date(
								loopStart.getFullYear() + i,
								0,
								1
							);
							const startDate = new Date(Math.max(queryStart, thisYear));
							const endDate = new Date(Math.min(
								queryEnd,
								new Date(
									thisYear.getFullYear() + 1,
									0,
									0
								)
							));
							result.push({
								'label': thisYear.getFullYear(),
								'class': 'header row' + rowNum,
								'start': utils.dayDiff(queryStart, startDate),
								'span': utils.dayDiff(startDate, endDate)
							});
						}
						return result;
				}
			};

		const headers = header.selectAll('div')
			.data(() => {
				let granularity = designSettings.granularity;

				if (granularity == 'auto') {
					const headerBox = header.node().getBoundingClientRect();
					const targetLabels = 7;
					const daysPerLabel = daySpan / targetLabels;
					if (daysPerLabel < 2) { // 14 maximum day labels
						const pixelsPerLabel = headerBox.width / daySpan;
						granularity = pixelsPerLabel > 25 ? 'day' : 'week';
					}
					else if (daysPerLabel / 7 < 1.3) { // 9 maximum week labels
						const pixelsPerLabel = headerBox.width / (daySpan / 7);
						granularity = pixelsPerLabel > 30 ? 'week' : 'bi-week';
					}
					else if (daysPerLabel / 14 < 1) { // 7 maximum bi-week labels
						const pixelsPerLabel = headerBox.width / (daySpan / 14);
						granularity = pixelsPerLabel > 50 ? 'bi-week' : 'month';
					}
					else if (daysPerLabel / 30 < 1.8) { // 12 maximum month labels
						const pixelsPerLabel = headerBox.width / (daySpan / 30);
						granularity = pixelsPerLabel > 40 ? 'month' : 'quarter';
					}
					else {
						granularity = 'quarter';
					}
				}

				switch(granularity) {
					case 'day':
						return getHeaderRow('month', 1).concat(getHeaderRow(granularity, 2));
					case 'week':
						return getHeaderRow('month', 1).concat(getHeaderRow(granularity, 2));
					case 'bi-week':
						return getHeaderRow('month', 1).concat(getHeaderRow(granularity, 2));
					case 'month':
						return getHeaderRow('quarter', 1).concat(getHeaderRow(granularity, 2));
					case 'quarter':
						return getHeaderRow('year', 1).concat(getHeaderRow(granularity, 2));
				}
			})
			.join('div')
				.attr('class', d => d.class)
				.style('grid-column', d => d.start + ' / span ' + d.span)
				.attr('title', d => d.label)
				.text(d => d.label);

		// Create the category groups
		const groups = body.selectAll('div')
			.data(() => {
				if (designSettings.groupDim != 'None') {
					if (designSettings.mainDim == designSettings.groupDim) {
						return summaryRows.map(x => [x.name, [x]]);
					}
					else {
						const groupDim = data.fields().find(field => field.systemName == designSettings.groupDim);
						const groupData = new Map();
						for (const subtotal of summaryRows) {
							const group = subtotal.values[0][indexAdj(groupDim)].formattedValue;
							groupData.set(
								group,
								[subtotal, groupData.get(group) ?? []].flat()
							);
						}
						return groupData;
					}
				}
				else {
					return [[data.fields()[mainDimIndex].name, summaryRows]];
				}
			})
		.join('div')
			.attr('class', 'group')
			.style('grid-template-columns', 'repeat(' + daySpan + ', minmax(0, 1fr))');

		const groupNames = groups.append('div')
			.attr('class', 'group-name')
			.style('grid-column', '1 / span ' + daySpan)
			.text(d => d[0]);

		// Create the bars
		const bars = groups.selectAll('div.bar')
			.data(d => d[1])
		.join('div')
			.attr('class', 'bar')
			.style('background-color', d => getBarColour(d, 'bar'))
			.style('grid-column', d => {
				const startDate = new Date(Math.max(queryStart, d.startDate));
				const startCol = utils.dayDiff(queryStart, startDate);

				const endDate = new Date(Math.min(queryEnd, d.endDate));
				const span = utils.dayDiff(startDate, endDate);

				return startCol + ' / span ' + span;
			})
			.on('mouseenter', (event, rowData) => {
				tooltip.style('display', 'table');

				const tooltipRows = tooltip.selectAll('div.tooltip-row')
					.data(d => {
						return data.fields().filter(field => designSettings['tooltip_' + field.systemName] === true);
					})
				.join('div')
					.attr('class', 'tooltip-row');

				tooltipRows.append('div')
					.attr('class', 'tooltip-category')
					.text(d => d.name);

				tooltipRows.append('div')
					.attr('class', 'tooltip-value')
					.text(d => {
						if (d.systemName == designSettings.mainDim) {
							return rowData.name;
						}
						else if (d.systemName == designSettings.startDate) {
							return rowData.startDate.toLocaleDateString('default', {'dateStyle': 'medium'});
						}
						else if (d.systemName == designSettings.endDate) {
							return rowData.endDate.toLocaleDateString('default', {'dateStyle': 'medium'});
						}
						else if (d.systemName == designSettings.numerator) {
							return rowData.subtotals[numerIndex - (data.dimensions().length - 1)].formattedValue;
						}
						else if (d.systemName == designSettings.denominator) {
							return rowData.subtotals[denomIndex - (data.dimensions().length - 1)].formattedValue;
						}
						else {
							return rowData.values[0][indexAdj(d)].formattedValue;
						}
					});

				if (designSettings.numerator != 'None' && designSettings.denominator == 'None') {
					const tooltipProgress = tooltip.append('div')
						.attr('class', 'tooltip-row');

					tooltipProgress.append('div')
						.attr('class', 'tooltip-category')
						.text(data.fields()[numerIndex].name);

					tooltipProgress.append('div')
						.attr('class', 'tooltip-value')
						.text(rowData.subtotals[numerIndex - (data.dimensions().length - 1)].formattedValue);
				}
				else if (designSettings.numerator != 'None' && designSettings.denominator != 'None') {
					const tooltipProgress = tooltip.append('div')
						.attr('class', 'tooltip-row');

					tooltipProgress.append('div')
						.attr('class', 'tooltip-category')
						.text('Progress');
					
					tooltipProgress.append('div')
						.attr('class', 'tooltip-value')
						.text(() => {
							const numerVal = rowData.subtotals[numerIndex - (data.dimensions().length - 1)].value;
							const denomVal = rowData.subtotals[denomIndex - (data.dimensions().length - 1)].value;
							const denomText = rowData.subtotals[denomIndex - (data.dimensions().length - 1)].formattedValue;
							return d3.format('.0%')(numerVal / denomVal) + ' of ' + denomText;
						});
				}
			})
			.on('mousemove', (event) => {
				const widgetBox = d3.select('#__da-app-content').node().getBoundingClientRect();
				tooltip
					.style('left', event.x + (event.x > widgetBox.width / 2 ? -10 : 10) + 'px')
					.style('top', event.y + (event.y > widgetBox.height / 2 ? -10 : 10) + 'px')
					.style('transform', () => {
						const rightHalf = event.x > widgetBox.width / 2;
						const bottomHalf = event.y > widgetBox.height / 2;
						return 'translate(' + (rightHalf ? '-100%,' : '0,') + (bottomHalf ? '-100%)' : '0)');
					});
			})
			.on('mouseleave', () => {
				tooltip
					.style('display', 'none')
					.html(null);
			});

			// Write the name text
			const barName = bars.append('div')
				.attr('class', 'name')
				.style('padding-bottom', designSettings.numerator != 'None' && designSettings.denominator != 'None' ? '3px' : null)
				.text(d => d.name);

			// Generate the progress indicators or measurement label
			if (designSettings.numerator != 'None' && designSettings.denominator == 'None') {
				const barProgressText = bars.append('div')
					.attr('class', 'metric-text')
					.text(d => d.subtotals[numerIndex - (data.dimensions().length - 1)].formattedValue);
			}
			else if (designSettings.numerator != 'None' && designSettings.denominator != 'None') {
				const barProgressText = bars.append('div')
					.attr('class', 'progress-text')
					.style('padding-bottom', '3px')
					.text(d => {
						const numerVal = d.subtotals[numerIndex - (data.dimensions().length - 1)].value;
						const denomVal = d.subtotals[denomIndex - (data.dimensions().length - 1)].value;
						const denomText = d.subtotals[denomIndex - (data.dimensions().length - 1)].formattedValue;
						return d3.format('.0%')(numerVal / denomVal) + ' of ' + denomText;
					});
				const progressLine = bars.append('div')
					.attr('class', 'progress-line')
					.style('border-bottom-color', d => getBarColour(d, 'line'))
					.style('width', d => {
						return d.subtotals[numerIndex - (data.dimensions().length - 1)].value / d.subtotals[denomIndex - (data.dimensions().length - 1)].value * 100 + '%';
					});
			}

			// Create the today line
			const today = new Date();
			if (queryStart < today && today < queryEnd) {
				const todayLine = groups.append('div')
					.attr('id', 'today-line')
					.style('left', utils.dayDiff(queryStart, today) / daySpan * 100 + '%');
			}
	}
};