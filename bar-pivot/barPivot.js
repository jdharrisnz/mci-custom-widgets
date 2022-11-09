const barPivot = {
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
				barPivot._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Store the query result
		const data = await new utils.dataSet({
			'convertAllDates': true,
			'getFieldDetails': true
		});

		// Ensure the query meets the conditions
		if (data.dimensions().findIndex(dim => dim.systemName.startsWith('DATE_') && dim.systemName != 'DATE_YEAR') == -1 || // If a non-year date isn't selected
			data.dimensions().length == 1 || // Or if day is the only dimension
			data.metrics().length === 0 || // Or if no metrics are selected
			data.metrics().length > 4) { // Or if more than four metrics are selected
			const error = utils.errorMessageTemplate();

			if (data.isWidgetEmpty()) {
				error.title.text('Bar Pivot');
				error.svg
					.attr('viewBox', '-10 0 532 512')
					.selectAll('path')
					.remove();
				error.svg.append('path')
					.attr('d', 'M352 96q14 0 23 9v0q9 9 9 23t-9 23t-23 9h-192q-14 0 -23 -9t-9 -23t9 -23t23 -9h192v0zM288 192q14 0 23 9v0q9 9 9 23t-9 23t-23 9h-128q-14 0 -23 -9t-9 -23t9 -23t23 -9h128v0zM416 288q14 0 23 9v0q9 9 9 23t-9 23t-23 9h-256q-14 0 -23 -9t-9 -23t9 -23t23 -9h256 v0z');
				error.svg.append('path')
					.attr('opacity', 0.4)
					.attr('d', 'M32 32q14 0 23 9v0q9 9 9 23v336q1 15 16 16h400q14 0 23 9t9 23t-9 23t-23 9h-400q-34 -1 -57 -23q-22 -23 -23 -57v-336q0 -14 9 -23t23 -9v0z');
				error.heading.text('Widget Setup');
			}
			else {
				error.title.text('Bar Pivot');
				error.heading.text('Invalid Query Settings');
			}
			
			error.message.append('span').text('Make sure your widget\'s data query includes');
			const errorList = error.message.append('ul');
			errorList.append('li').text('day, week, bi-week, month, or quarter;');
			errorList.append('li').text('at least one other dimension; and');
			errorList.append('li').text('up to four measurements.');

			throw new Error('Invalid query settings. Choose a dimension, a date, and up to four measurements.');
		}
		data.errorNoData('Bar Pivot'); // No rows

		// Get metric colours, then set design options
		const options = [
			{ 'type': 'select',
			  'id': 'date',
			  'displayName': 'Date Dimension to Pivot',
			  'options': data.fields().filter(x => x.systemName.startsWith('DATE_') && x.systemName != 'DATE_YEAR').map(x => { return { 'id': x.systemName, 'label': x.name } }),
			  'defaultValue': data.fields().find(x => x.systemName.startsWith('DATE_') && x.systemName != 'DATE_YEAR').systemName },
			{ 'type': 'separator' },
			{ 'type': 'title',
			  'displayName': 'Y Axis Scaling Default Choices' },
			{ 'type': 'select',
			  'id': 'axesChoice',
			  'displayName': 'Axis Independence',
			  'options': [{ 'id': 'independent', 'label': 'Independent' }, { 'id': 'synchronised', 'label': 'Synchronised' }],
			  'defaultValue': 'independent' },
			{ 'type': 'select',
			  'id': 'barScalingChoice',
			  'displayName': 'Scaling Scope',
			  'options': [{ 'id': 'local', 'label': 'Local' }, { 'id': 'global', 'label': 'Global' }],
			  'defaultValue': 'local' },
			{ 'type': 'separator' },
			{ 'type': 'title',
			  'displayName': 'Metric Colours' }
		].concat(data.metrics().map(metric => { return {
			'type': 'colorPicker',
			'id': metric.systemName,
			'displayName': metric.name,
			'defaultValue': metric.fieldDetails.color
		}}));

		utils.setDesignOptions(options);

		// Get the design settings
		const designSettings = await utils.getDesignSettings();

		// Create an unbroken list of dates and set useful variables
		const dimFields = data.dimensions().filter(x => x.systemName != designSettings.date);
		const dateIndex = data.fields().findIndex(x => x.systemName == designSettings.date);
		const minDate = d3.min(data.rows(), x => x[dateIndex].value);
		const maxDate = d3.max(data.rows(), x => x[dateIndex].value);
		const dateSpan = utils.dayDiff(minDate, maxDate) - 1;
		const dateList = [];
		let summaryDates;

		switch(designSettings.date) {
			case 'DATE_DAY':
				for (i = 0; i < dateSpan + 1; i++) {
					dateList.push(new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i));
				}
				summaryDates = d3.group(dateList, d => d.toLocaleString('default', { 'month': 'short' }));
				break;
			case 'DATE_WEEK':
				for (i = 0; i < (dateSpan / 7) + 1; i++) {
					dateList.push(new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i * 7));
				}
				summaryDates = d3.group(dateList, d => d.toLocaleString('default', { 'month': 'short' }));
				break;
			case 'DATE_BI_WEEK':
				for (i = 0; i < (dateSpan / 14) + 1; i++) {
					dateList.push(new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i * 14));
				}
				summaryDates = d3.group(dateList, d => d.toLocaleString('default', { 'month': 'short' }));
				break;
			case 'DATE_MONTH':
				var approxMonths = [];
				for (i = 0; i < (dateSpan / 28) + 1; i++) {
					approxMonths.push(new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i * 28));
				}
				for (i = 0; i < new Set(approxMonths.map(x => x.getFullYear() + '-' + x.getMonth())).size; i++) {
					dateList.push(new Date(minDate.getFullYear(), minDate.getMonth() + i, minDate.getDate()));
				}
				summaryDates = d3.group(dateList, d => d.getFullYear());
				break;
			case 'DATE_QUARTER':
				var approxQuarters = [];
				for (i = 0; i < (dateSpan / 90) + 1; i++) {
					approxQuarters.push(new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i * 90));
				}
				for (i = 0; i < new Set(approxQuarters.map(x => x.getFullYear() + '-' + x.getMonth())).size; i++) {
					dateList.push(new Date(minDate.getFullYear(), minDate.getMonth() + i * 3, minDate.getDate()));
				}
				summaryDates = d3.group(dateList, d => d.getFullYear());
				break;
		}

		// Create hierarchical groups, forcing Date to the bottom leaf
		const dataNested = data.nest(
			0,
			dimFields.length,
			data.rows().map(row => {
				row.splice(data.dimensions().length, 0, row[dateIndex]);
				row.splice(dateIndex, 1);
				return row;
			}));

		// Create the document structure
		const viewBlocker = d3.select('#__da-app-content').append('div')
			.attr('id', 'viewblocker');
		const reference = d3.select('#__da-app-content').append('div')
			.attr('id', 'reference');
		const table = d3.select('#__da-app-content').append('div')
			.attr('id', 'table');
		const thead = table.append('div')
			.style('display', 'contents');
		const tbody = table.append('div')
			.style('display', 'contents');
		const tooltip = d3.select('#__da-app-content').append('div')
			.attr('id', 'tooltip')
			.style('opacity', 0);

		// Populate the legend
		reference.append('span')
			.attr('id', 'legend')
			.selectAll('span')
			.data(data.metrics())
		.join('span')
			.attr('class', (d, i) => 'metric' + i)
			.style('border-bottom-color', d => designSettings[d.systemName])
			.text(d => d.name);

		// Specify the table grid layout
		table
			.style('display', 'grid')
			.style('grid-template-columns', 'repeat(' + (dimFields.length + dateList.length) + ', auto)');

		// Populate the table header
		thead.append('div')
			.attr('class', 'colheader blank')
			.style('grid-column', 'auto / span ' + dimFields.length);

		thead.selectAll('div.colheader.summary-date')
			.data(summaryDates)
		.join('div')
			.attr('class', 'colheader summary-date')
			.style('grid-column', d => 'auto / span ' + d[1].length)
			.text(d => d[0]);

		thead.selectAll('div.colheader.label')
			.data(dimFields)
		.join('div')
			.attr('class', 'colheader label')
			.style('grid-column', 'auto / auto')
			.text(d => d.name);

		thead.selectAll('div.colheader.date')
			.data(dateList)
		.join('div')
			.attr('class', d => designSettings.date == 'DATE_DAY' && d.toLocaleString('default', { 'weekday': 'narrow' }) == 'S' ? 'colheader date weekend' : 'colheader date' )
			.style('grid-column', 'auto / auto')
			.text(d => {
				switch(designSettings.date) {
					case 'DATE_DAY':
						return d.toLocaleString('default', { 'weekday': 'narrow' }) == 'S' ? 'S' : d.getDate();
					case 'DATE_WEEK':
						return d.getWeek();
					case 'DATE_BI_WEEK':
						return d.getWeek() + ' - ' + new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getWeek();
					case 'DATE_MONTH':
						return d.toLocaleString('default', { 'month': 'short' });
					case 'DATE_QUARTER':
						return d.toLocaleString('default', { 'month': 'short' }) + ' - ' + new Date(d.getFullYear(), d.getMonth() + 3, d.getDate()).toLocaleString('default', { 'month': 'short' });
				}
			});

			// Create and execute a recursive function to populate the table body
			const interpolateShade = d3.interpolateRgb('rgba(255, 255, 255, 0.9)', 'rgba(200, 200, 200, 0.9)');

			function tbodyGenerator(container, children, generation, generations) {
				const cells = container.selectAll('div')
					.data(() => {
						const cells = [];
						cellClass = generation < generations - 1 ? 'bodyparent bodylevel' + generation : 'bodychild bodylevel' + generation;
						const rowShade = interpolateShade((generations - 1 - generation) / 9);
						
						for (const child of children) {
							if (generation > 0) {
								cells.push({
									'name': null,
									'class': cellClass,
									'rowShade': null,
									'grid-column': 'auto / span ' + generation
								});
							}
							if (generation < generations - 1) {
								cells.push({
									'name': child.name,
									'class': cellClass,
									'rowShade': rowShade,
									'grid-column': 'auto / span ' + (generations - generation + dateList.length),
									'children': child.values
								});
							}
							else {
								cells.push({
									'name': child.name,
									'class': cellClass,
									'rowShade': null,
									'grid-column': 'auto / auto'
								});
								cells.push({
									'name': null,
									'class': cellClass + ' svg',
									'rowShade': null,
									'grid-column': 'auto / span ' + dateList.length,
									'svgData': child.values
								});
							}
						}
						return cells;
					})
				.join('div')
					.style('grid-column', d => d['grid-column'])
					.style('background-color', d => d.rowShade)
					.attr('class', d => d.class)
					.attr('title', d => d.name);

				cells.each((d, i, nodes) => {
					if (d.name != null) {
						d3.select(nodes[i]).append('span')
							.text(d => d.name);
					}
				});
				
				if (generation + 1 <= generations - 1) {
					container.selectAll('div[title]').each(d => {
						tbodyGenerator(
							container.insert('div', 'div[title="' + d.name + '"] + div')
								.attr('class', 'container bodylevel' + generation)
								.style('display', 'contents'),
							d.children,
							generation + 1,
							generations
						);
					});
				}
			}

			tbodyGenerator(tbody, dataNested, 0, dimFields.length);

			// Define SVG constants
			const svgHeight = 58; // Pixels
			const svgHeightPadding = 0.9; // Percentage of regular height
			const barGap = 0.5; // Bar-units
			const barWidth = 1 / dateList.length / (data.metrics().length + barGap);
			const maxValue = d3.max(data.rows(), row => d3.max(row.filter(cell => cell.field.type == 'metric'), cell => cell.value));

			const lines = 4;
			const gridY = [...Array(lines)].map((x, i) => { return { 'class': 'gridLines line' + i, 'value': maxValue / lines * i }; });

			// Create the SVG containers
			const svgRoot = d3.selectAll('.svg').append('svg')
				.attr('transform', 'scale(1, -1)')
				.attr('width', '100%')
				.attr('height', svgHeight + 'px');

			const svg = svgRoot.append('g')
				.attr('transform', 'scale(1, 0)');

			// Add hover highlighters
			const focusRects = svgRoot.insert('rect', '*') // Add as the first element
				.attr('class', 'focus-rect')
				.attr('x', '0%')
				.attr('y', '0%')
				.attr('width', 1 / dateList.length * 100 + '%')
				.attr('height', svgHeightPadding * 100 + '%')
				.attr('fill', 'rgba(242, 242, 242, 0)');

			// Draw the grid lines
			const gridLines = svg.selectAll('line')
				.data(gridY)
			.join('line')
				.attr('class', d => d.class)
				.attr('x1', '0%')
				.attr('y1', d => d.value + 'px')
				.attr('x2', '100%')
				.attr('y2', d => d.value + 'px');

			// Create the bar groups and draw the bars
			const barGroups = svg.selectAll('g')
				.data(d => d.svgData)
			.join('g')
				.on('mouseenter', (event, d) => {
					tooltip.selectAll('div')
						.data(() => [{'name': d[0].value.toDateString(), 'class': 'date'}].concat(
							d.filter(x => x.field.type == 'metric').map((value, i) => {
								return [
									{ 'name': value.field.name + ': ',
									  'systemName': value.field.systemName,
									  'class': 'metric' },
									{ 'name': value.formattedValue,
									  'systemName': null,
									  'class': null }
								];
							})
						))
					.join('div')
						.selectAll('span')
						.data(d => d )
					.join('span')
						.attr('class', d => d.class)
						.style('border-left-color', d => designSettings[d.systemName])
						.text(d => d.name);
					
					const groupProperties = event.target.getBoundingClientRect();
					const tooltipProperties = tooltip.node().getBoundingClientRect();
					const dayPosition = dateList.findIndex(day => day.getTime() == d[0].value.getTime()) / dateList.length;
					const leftAdjust = dayPosition < 0.5 ? 0 : groupProperties.width + tooltipProperties.width;
					
					tooltip
						.style('left', groupProperties.right - leftAdjust + 'px')
						.style('top', groupProperties.bottom - tooltipProperties.height + 'px')
						.transition().style('opacity', 0.9);
					
					focusRects
						.attr('x', dayPosition * 100 + '%')
						.transition().attr('fill', 'rgba(242, 242, 242, 1)');
				})
				.on('mouseleave', () => {
					tooltip.transition().duration(400).style('opacity', 0);
					focusRects.transition().duration(400).attr('fill', 'rgba(242, 242, 242, 0)');
				});
			
			const bars = barGroups.selectAll('rect')
				.data(d => d.filter(x => x.field.type == 'metric'))
			.join('rect')
				.style('fill', d => designSettings[d.field.systemName])
				.attr('x', (d, i, nodes) => {
					const dayKey = d3.select(nodes[i].parentNode).datum()[0].value.getTime();
					const dayPosition = dateList.findIndex(day => day.getTime() == dayKey) / dateList.length;
					return (dayPosition + (i * barWidth) + (barWidth * barGap / 2)) * 100 + '%';
				})
				.attr('y', '0px')
				.attr('width', d => barWidth * 100 + '%')
				.attr('height', d => d.value + 'px');

			// Create the collapsible controls
			const collapseSpan = d3.selectAll('.bodyparent[title]')
			.insert('span', 'span')
				.attr('class', 'collapsible')
				.on('click', (event, d) => {
					const collapseIcon = d3.select(event.target).select('svg');
					const nextContainer = d3.select(event.target.parentNode.nextSibling);
					if (nextContainer.style('display') == 'contents') {
						collapseIcon.attr('transform', 'rotate(-90)');
						nextContainer.style('display', 'none');
					}
					else {
						collapseIcon.attr('transform', 'rotate(0)');
						nextContainer.style('display', 'contents');
					}
				});
			
			const collapseSVG = collapseSpan.append('svg')
				.style('pointer-events', 'none')
				.style('width', '12px')
				.attr('viewBox', '0 0 10 6')
				.attr('transform', 'rotate(0)')
				.attr('transform-origin', 'center');
			
			const collapsePath = collapseSVG.append('path')
				.style('fill', 'rgb(156, 160, 160)')
				.attr('d', 'M5.09 5.5a.5.5 0 0 1-.35-.15l-4-4a.5.5 0 0 1 .71-.7l3.64 3.64L8.74.65a.5.5 0 0 1 .71.71l-4 4a.5.5 0 0 1-.36.14z');

			// Create the axis scale control
			const axesControl = reference.append('span')
				.attr('id', 'axescontrol');

			axesControl.append('span')
				.html('Axes:&nbsp;&nbsp;');

			axesControl.append('input')
				.attr('type', 'radio')
				.attr('id', 'synchronised')
				.attr('name', 'axisscale')
				.attr('value', 'synchronised')
				.property('checked', designSettings.axesChoice == 'synchronised');

			axesControl.append('label')
				.attr('for', 'synchronised')
				.text('Synchronised');

			axesControl.append('span')
				.html('&nbsp;&nbsp;&nbsp;&nbsp;');

			axesControl.append('input')
				.attr('type', 'radio')
				.attr('id', 'independent')
				.attr('name', 'axisscale')
				.attr('value', 'independent')
				.property('checked', designSettings.axesChoice == 'independent');

			axesControl.append('label')
				.attr('for', 'independent')
				.text('Independent');

			// Create the axis scale transition
			const changeAxes = function(setting) {
				if (setting == 'synchronised') {
					bars.transition().duration(600).attr('transform', 'scale(1, 1)');
				}
				else if (setting == 'independent') {
					for (const [index, metric] of data.metrics().entries()) {
						svg.each((d, i, nodes) => {
							const maxThisLocalMetric = d3.max(d.svgData, row => row[index + 1].value);
							const maxAllLocalMetric = d3.max(d.svgData, row => d3.max(row.filter(cell => cell.field.type == 'metric'), cell => cell.value));
							const scaleAdjust = String(1 / (maxThisLocalMetric / maxAllLocalMetric)).replace('Infinity', '1');
							d3.select(nodes[i]).selectAll('rect').filter(d => d.field.systemName == metric.systemName)
								.transition().duration(600).attr('transform', 'scale(1, ' + scaleAdjust + ')');
						});
					}
				}
			}

			changeAxes(designSettings.axesChoice);

			axesControl.selectAll('input')
				.on('change', event => {
					changeAxes(event.target.value);
				});

			// Create the bar scale control
			const barScaleControl = reference.append('span')
				.attr('id', 'barscalecontrol');

			barScaleControl.append('span')
				.text('Bar scaling scope:  ');

			barScaleControl.append('input')
				.attr('type', 'range')
				.attr('id', 'barscale')
				.attr('min', '-1')
				.attr('max', dimFields.length - 1)
				.attr('value', designSettings.barScalingChoice == 'global' ? '-1' : dimFields.length - 1);

			const barScaleLabel = barScaleControl.append('span')
				.attr('id', 'barscalelabel')
				.text(designSettings.barScalingChoice == 'global' ? ' Global' : ' Local');

			// Create the bar scale transitions
			const scaleBarsLocalGlobal = function(setting) {
				svg.transition().duration(600).attr('transform', d => {
					if (setting == 'global') {
						return 'scale(1, ' + svgHeight * svgHeightPadding / maxValue + ')';
					}
					else if (setting == 'local') {
						return 'scale(1, ' + svgHeight * svgHeightPadding / d3.max(d.svgData, row => d3.max(row.filter(cell => cell.field.type == 'metric'), cell => cell.value)) + ')';
					}
				});
			}

			scaleBarsLocalGlobal(designSettings.barScalingChoice);

			const flattenGroup = function(data) {
				if (data[0].hasOwnProperty('subtotals')) {
					return data.map(datum => flattenGroup(datum.values)).flat();
				}
				else {
					return data.map(row => row.filter(cell => cell.field.type == 'metric').map(cell => cell.value)).flat();
				}
			}

			barScaleControl.select('input')
				.on('input', event => {
					const sliderValue = event.target.valueAsNumber;
					if (sliderValue == -1) {
						barScaleLabel.text(' Global');
						scaleBarsLocalGlobal('global');
					}
					else if (sliderValue == dimFields.length - 1) {
						barScaleLabel.text(' Local');
						scaleBarsLocalGlobal('local');
						d3.selectAll('.bodylevel' + sliderValue).selectAll('span')
							.style('color', 'rgb(59, 136, 253)')
							.transition().duration(600).style('color', 'rgb(0, 0, 0)');
					}
					else {
						barScaleLabel.text(' ' + dimFields[sliderValue].name);
						d3.selectAll('.container.bodylevel' + sliderValue).each((d, i, nodes) => {
							d3.select(nodes[i].previousSibling).select('span:nth-child(2)')
								.style('color', 'rgb(59, 136, 253)')
								.transition().duration(600).style('color', 'rgb(0, 0, 0)');
							const groupData = d3.select(nodes[i].previousSibling).data()[0].children;
							const maxScopeValue = d3.max(flattenGroup(groupData));
							d3.select(nodes[i]).selectAll('svg > g')
								.transition().duration(600).attr('transform', 'scale(1, ' + svgHeight * svgHeightPadding / maxScopeValue + ')');
						});
					}
				});
	}
};