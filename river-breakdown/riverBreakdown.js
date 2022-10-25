const riverBreakdown = {
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
				riverBreakdown._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Process the data
		const data = await new utils.dataSet({
			'metricFormatDiscovery': true,
			'metricSummableDiscovery': true
		});

		// Don't do anything if the query is invalid
		data.errorNoData('River Breakdown');
		if (data.dimensions().length === 0 || data.metrics().length === 0) {
			const myError = utils.errorMessageTemplate();

			myError.title.text('River Breakdown');
			myError.heading.text('Invalid Data Settings');
			myError.message
				.style('text-align', 'center')
				.text('Add one metric and at least one dimension.');
			
			throw new Error('This widget requires one metric and at least one dimension.');
		}
		else if (data.metrics()[0].summable === false || data.metrics()[0]?.calculable === false) {
			const myError = utils.errorMessageTemplate();

			myError.title.text('River Breakdown');
			myError.heading.text('Metric Not Summable');
			myError.message
				.style('text-align', 'center')
				.text('Metrics used in this widget must be summable or able<br/>\
					to be calculated by dividing other summable inputs, e.g.<br/>\
					to display CTR, add CTR, Impressions, and Clicks to the widget.<br/><br/>\
					“Summable” means <i>simply summable</i>,<br/>\
					i.e. each row adds up to the total.');

			throw new Error('Metric is not summable.');
		}

		// Set and get design settings
		utils.setDesignOptions([
			{ 'type': 'colorPicker',
			  'id': 'gradStart',
			  'displayName': 'Gradient Start Colour',
			  'defaultValue': '#86bcb6' },
			{ 'type': 'colorPicker',
			  'id': 'gradEnd',
			  'displayName': 'Gradient End and Block Colour',
			  'defaultValue': '#75a1c7' }
		]);

		const designSettings = await utils.getDesignSettings();

		// Nest the data and add the first group
		const dataNested = [{
			'name': data.metrics()[0].name,
			'subtotals': data.totals(),
			'values': data.nest()
		}];
		
		// Functions for recursive digging to populate hierarchy metadata, some position metadata, and flatten
		const blockXGapPct = 0.75; // Percentage of the visual the x-gaps should take up
		const blockWidth = function(level) {
			const zerothBlockSize = 20; // Multiplier over later block sizes
			return (1 - blockXGapPct) / (data.dimensions().length + zerothBlockSize) * (level === 0 ? zerothBlockSize : 1);
		}
		const blockX = function(level) {
			if (level === 0) {
				return 0;
			}
			else {
				const zerothBlock = blockWidth(0);
				const previousNormalBlocks = blockWidth(level) * (level - 1);
				const gaps = blockXGapPct / data.dimensions().length * level;
				return zerothBlock + previousNormalBlocks + gaps;
			}
		}
		
		let rowCounter = 0;
		const analyseHierarchy = function(splits, level, parentRowID) {
			return splits.map(split => {
				split.rowId = rowCounter; rowCounter += 1;
				split.parentRowId = parentRowID;
				split.level = level;
				split.x = blockX(level);
				split.width = blockWidth(level);
				split.subtotals[0].percentage = split.subtotals[0].value / d3.sum(data.rows(), row => row[data.dimensions().length].value);
				split.subtotals[0].formattedPercentage = d3.format('.2%')(split.subtotals[0].percentage);

				if (split.values[0].hasOwnProperty('values')) {
					return [split, analyseHierarchy(split.values, level + 1, split.rowId)].flat();
				}
				else {
					return [split];
				}
			}).flat();
		}

		// Flatten the data and populate the rest of the position metadata
		const yGapPct = 0.05;
		const yOrigin = yGapPct * (data.rows().filter(x => x[data.dimensions().length].value > 0).length + 1) / 2;

		let dataNestedFlat = analyseHierarchy(dataNested, 0, null);
		dataNestedFlat = dataNestedFlat.map(datum => {
			if (datum.parentRowId === null) {
				datum.y = yOrigin;
				datum.parentJoinX = null;
				datum.parentJoinTopY = null;
				datum.parentJoinBottomY = null;
			}
			else {
				const fullLevel = dataNestedFlat.filter(x => x.level == datum.level);
				const yGapShiftUp = (fullLevel.length + 1) * yGapPct / 2;
				const earlierItems = fullLevel.filter(x => x.rowId < datum.rowId);
				const yGapShiftDown = (earlierItems.length + 1) * yGapPct;
				const yItemShiftDown = d3.sum(earlierItems, x => x.subtotals[0].percentage);
				datum.y = yOrigin - yGapShiftUp + yGapShiftDown + yItemShiftDown;
				const parentRow = dataNestedFlat.find(x => x.rowId == datum.parentRowId);
				datum.parentJoinX = parentRow.x + parentRow.width;
				const earlierSiblings = earlierItems.filter(x => x.parentRowId == datum.parentRowId);
				datum.parentJoinTopY = parentRow.y + (d3.sum(earlierSiblings, x => x.subtotals[0].percentage) ?? 0);
				datum.parentJoinBottomY = datum.parentJoinTopY + datum.subtotals[0].percentage;
			}

			return datum;
		});

		// Create mouseover and mouseout functions
		const familySearch = function(rowId, searchMethod) {
			const siblings = dataNestedFlat.filter(x => x.parentRowId == dataNestedFlat[rowId].parentRowId);
			const lookUp = [];
			const lookDown = [];
			
			// Recursively look upward
			if (searchMethod == 'full') {
				let lookUpSearch = dataNestedFlat[rowId].parentRowId;
				while (lookUpSearch !== null) {
					lookUp.push(dataNestedFlat[lookUpSearch]);
					lookUpSearch = dataNestedFlat[lookUpSearch].parentRowId;
				}
			}
			
			// Recursively look downward
			let lookDownSearch = dataNestedFlat.filter(x => x.parentRowId == rowId);
			while (lookDownSearch.length > 0) {
				let nextLookDownSearch = [];
				for (const item of lookDownSearch) {
					lookDown.push(item);
					let itemChildren = dataNestedFlat.filter(x => x.parentRowId == item.rowId);
					if (itemChildren.length > 0) {
						nextLookDownSearch = nextLookDownSearch.concat(itemChildren);
					}
				}
				lookDownSearch = nextLookDownSearch;
			}
			
			let result;
			if (searchMethod == 'full') {
				result = siblings.concat(lookUp).concat(lookDown);
			}
			else if (searchMethod == 'nonParentItems') {
				result = siblings.concat(lookDown);
			}
			
			return result;
		}

		const focusItems = function(rowId) {
			// Reduce opacity of items not in the family
			const fullItems = familySearch(rowId, 'full');
			d3.selectAll('div.labelcontainer, rect, path').filter(x => fullItems.findIndex(item => item.rowId == x.rowId) == -1)
				.transition().style('opacity', 0.3);
			
			// Adjust the percentage text of the siblings and children to be calculated locally
			const nonParentItems = familySearch(rowId, 'nonParentItems');
			d3.selectAll('div.labelcontainer').filter(x => nonParentItems.findIndex(item => item.rowId == x.rowId) != -1).selectAll('span.percentage')
				.transition().textTween(d => {
					const newValue = d.subtotals[0].value / d3.sum(dataNestedFlat.filter(x => x.parentRowId == d.parentRowId), x => x.subtotals[0].value);
					const currentValue = d.subtotals[0].currentValue ?? d.subtotals[0].percentage;
					d.subtotals[0].currentValue = newValue;
					const i = d3.interpolate(currentValue, newValue);
					return t => { return d3.format('.2%')(i(t)) };
				});
		}

		const unfocusItems = function() {
			d3.selectAll('div.labelcontainer, rect, path')
				.transition().style('opacity', 1);

			d3.selectAll('span.percentage')
				.transition().textTween(d => {
					const newValue = d.subtotals[0].percentage;
					const currentValue = d.subtotals[0].currentValue ?? d.subtotals[0].percentage;
					d.subtotals[0].currentValue = newValue;
					const i = d3.interpolate(currentValue, newValue);
					return t => { return d3.format('.2%')(i(t)) };
				});
		}
		
		// Build the visual
		const svg = d3.select('#__da-app-content').append('svg')
			.datum(dataNestedFlat)
		.join('svg')
			.attr('viewBox', (d, i) => { return '0 0 1 ' + (1 + yOrigin * 2); })
			.attr('preserveAspectRatio', 'none');

		// Set the gradient
		const linearGradient = svg.append('defs').append('linearGradient')
			.attr('id', 'level0-gradient');

		linearGradient.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', designSettings.gradStart);

		linearGradient.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', designSettings.gradEnd);
		
		// Draw the nodes
		const rects = svg.selectAll('rect').filter(x => x.rowId !== 0)
			.data(d => d, d => d.rowId)
		.join('rect')
			.attr('x', d => d.x)
			.attr('y', d => d.y)
			.attr('width', d => d.width)
			.attr('height', d => d.subtotals[0].percentage)
			.attr('fill', d => d.rowId === 0 ? 'url(#level0-gradient)' : designSettings.gradEnd)
			.style('opacity', 1)
			.attr('class', d => 'level' + d.level + ' item' + d.rowId)
			.on('mouseenter', (event, d) => d.rowId !== 0 ? focusItems(d.rowId) : null)
			.on('mouseleave', (event, d) => d.rowId !== 0 ? unfocusItems() : null);

		// Draw the links
		const xCurveAdjust = blockXGapPct / data.dimensions().length * (1 / 2);

		const paths = svg.selectAll('path').filter(x => x.parentRowId !== null)
			.data(d => d, d => d.rowId)
		.join('path')
			.attr('class', d => 'level' + d.level + ' item' + d.rowId)
			.style('opacity', 1)
			.on('mouseenter', (event, d) => d.rowId !== 0 ? focusItems(d.rowId) : null)
			.on('mouseleave', (event, d) => d.rowId !== 0 ? unfocusItems() : null)
			.attr('d', d => {
				const path = [];
				path.push(['M', d.x, d.y].join(' '));
				path.push(['C', d.x - xCurveAdjust, d.y, d.parentJoinX + xCurveAdjust, d.parentJoinTopY, d.parentJoinX, d.parentJoinTopY].join(' '));
				path.push(['V', d.parentJoinBottomY].join(' '))
				path.push(['C', d.parentJoinX + xCurveAdjust, d.parentJoinBottomY, d.x - xCurveAdjust, d.y + d.subtotals[0].percentage, d.x, d.y + d.subtotals[0].percentage].join(' '));
				return path.join(' ') + 'Z';
			});

		// Write the text
		const divs = d3.select('#__da-app-content').selectAll('div')
			.data(dataNestedFlat, d => d.rowId)
		.join('div')
			.attr('class', d => 'labelcontainer level' + d.level + ' item' + d.rowId)
			.style('opacity', 1)
			.style('left', d => {
				if (d.level === 0) {
					return d.x * 100 + '%';
				}
				else {
					return (d.x - (blockXGapPct / data.dimensions().length)) * 100 + '%';
				}
			})
			.style('top', d => d.y / (1 + yOrigin * 2) * 100 + '%')
			.style('width', d => {
				if (d.level === 0) {
					return d.width * 100 + '%';
				}
				else {
					return blockXGapPct / data.dimensions().length * 100 + '%';
				}
			})
			.style('height', d => d.subtotals[0].percentage / (1 + yOrigin * 2) * 100 + '%');
			
		divs.append('span')
			.attr('class', d => 'labelcontent category level' + d.level + ' item' + d.rowId)
			.attr('title', d => d.name)
			.text(d => d.name);

		divs.filter(x => x.subtotals[0].formattedValue != '').append('span')
			.attr('class', d => 'labelcontent value level' + d.level + ' item' + d.rowId)
			.attr('title', d => d.subtotals[0].formattedValue)
			.text(d => d.subtotals[0].formattedValue);

		divs.filter(x => x.level !== 0).append('span')
			.attr('class', d => 'labelcontent percentage level' + d.level + ' item' + d.rowId)
			.attr('title', d => d.subtotals[0].formattedPercentage)
			.text(d => d.subtotals[0].formattedPercentage);

		// Write the top-left breadcrumbs
		d3.select('#__da-app-content').append('div')
			.attr('id', 'breadcrumbs')
			.text(['Total'].concat(data.dimensions().map(x => x.name)).join(' ' + String.fromCharCode(8594) + ' '));
	}
};