const sankey = {
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
				sankey._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Store the query result
		data = await new utils.dataSet({
			'metricFormatDiscovery': true,
			'metricSummableDiscovery': true
		});
		
		// Don't do anything if the query is invalid
		if (data.fields().length === 0 ||
			data.dimensions().length === 0 ||
			data.metrics().length !== 1) { // If query hasn't been added or if it's invalid
			const error = utils.errorMessageTemplate();

			error.title.text('Sankey Flow Diagram');
			error.heading.text('Invalid Query Settings');
			error.message
				.style('text-align', 'center')
				.html('To use this widget, add one summable measurement<br/>and any number of dimensions to the query.');

			throw new Error('Invalid query settings. Add data to the widget.');
		}
		data.errorNoData('Sankey Flow Diagram'); // Zero rows

		// Set the design options
		let options = [
			{ 'type': 'title',
			  'displayName': 'General Settings' },
			{ 'type': 'colorPicker',
			  'id': 'gradientStart',
			  'displayName': 'Gradient start',
			  'defaultValue': '#86bcb6' },
			{ 'type': 'colorPicker',
			  'id': 'gradientEnd',
			  'displayName': 'Gradient end and nodes',
			  'defaultValue': '#75a1c7' },
			{ 'type': 'select',
			  'id': 'labelLayout',
			  'displayName': 'Label layout',
			  'options': [{ 'id': 'vertical', 'label': 'Vertical' }, { 'id': 'horizontal', 'label': 'Horizontal' }],
			  'defaultValue': 'vertical' },
			{ 'type': 'separator' },
			{ 'type': 'title',
			  'displayName': 'Node and Link removal',
			  'description': 'Removes nodes and their links for dimension values that equal the entries below. For example, "(none)". To remove blanks, enter "removeBlank".' },
			{ 'type': 'input',
			  'id': 'removal1',
			  'displayName': 'Removal 1',
			  'defaultValue': '' },
			{ 'type': 'input',
			  'id': 'removal2',
			  'displayName': 'Removal 2',
			  'defaultValue': '' },
			{ 'type': 'input',
			  'id': 'removal3',
			  'displayName': 'Removal 3',
			  'defaultValue': '' },
		];

		utils.setDesignOptions(options);

		// Get design settings
		const designSettings = await utils.getDesignSettings();

		// Create the widget
			// Set styles
			d3.select('head').append('style')
				.html('body { --gradient-start: ' + designSettings.gradientStart + '; --gradient-end: ' + designSettings.gradientEnd + '; }');

			// Create a list of links
			const links = data.dimensions().map(dimension => {
				const linkedData = data.rows().map(row => {
					const priorField = dimension.index > 0 ? row[dimension.index - 1].formattedValue : data.metrics()[0].name;
					row[dimension.index].formattedValue = priorField + '\t' + row[dimension.index].formattedValue;
					row.unshift(row[dimension.index]);
					row.splice(dimension.index + 1, 1);
					return row;
				});

				return data.nest(0, 1, linkedData).map(subtotal => {
					return {
						'source': dimension.index - 1 + '\t' + subtotal.name.split('\t')[0],
						'target': dimension.index + '\t' + subtotal.name.split('\t')[1],
						'value': subtotal.subtotals[0].value,
					};
				});
			}).flat();
				
			// Create a list of nodes
			const nodes = {};
			const firstNodeWidth = 0.2;
			const nodeWidth = firstNodeWidth / 20;
			const nodePadding = 0.05;
			let maxNodes = 0;
			for (const dimension of data.dimensions()) {
				const setLength = new Set(data.rows().map(row => row[dimension.index].value)).size;
				if (setLength > maxNodes) {
					maxNodes = setLength;
				}
			}
			const origin = nodePadding * (maxNodes - 1) / 2;
			const normaliseHeight = function(height) {
				return height / (1 + nodePadding * (maxNodes - 1));
			};
			
			nodes['-1\t' + data.metrics()[0].name] = {
				'name': data.metrics()[0].name,
				'value': data.totals()[0].value,
				'formattedValue': data.totals()[0].formattedValue,
				'height': normaliseHeight(1),
				'x0': 0,
				'x1': firstNodeWidth,
				'y0': normaliseHeight(origin),
				'y1': normaliseHeight(origin + 1)
			};
			
			for (const dimension of data.dimensions()) {
				const subtotals = data.subtotals(dimension.index);
				for (const [subIndex, subtotal] of subtotals.entries()) {
					const height = subtotal.subtotals[0].value / data.totals()[0].value;
					const x1 = ((dimension.index + 1) / data.dimensions().length) * (1 - firstNodeWidth) + firstNodeWidth;
					let y0 = origin - nodePadding * (subtotals.length - 1) / 2;
					if (subIndex > 0) {
						y0 = y0 + d3.sum(Object.values(nodes).filter(x => x.x1 == x1), x => x.height) + nodePadding * subIndex;
					}

					nodes[dimension.index + '\t' + subtotal.name] = {
						'name': subtotal.name,
						'value': subtotal.subtotals[0].value,
						'formattedValue': subtotal.subtotals[0].formattedValue,
						'height': height,
						'x0': x1 - nodeWidth,
						'x1': x1,
						'y0': normaliseHeight(y0),
						'y1': normaliseHeight(y0 + height)
					};
				}
			}

			// Draw the nodes and links
			const viewContainer = d3.select('#__da-app-content').append('div')
				.attr('id', 'viewContainer');
			
			const tooltip = viewContainer.append('div')
				.attr('id', 'tooltip')
				.style('opacity', 0);
			
			const svg = viewContainer.append('svg')
				.attr('viewBox', '0 0 1 1')
				.attr('preserveAspectRatio', 'none');
			
			const linearGradient = svg.append('defs')
			.append('linearGradient')
				.attr('id', 'gradient');

			linearGradient.append('stop')
				.attr('offset', '0%')
				.attr('stop-color', 'var(--grad-start)');

			linearGradient.append('stop')
				.attr('offset', '100%')
				.attr('stop-color', 'var(--grad-end)');
						
			const nodePaths = svg.selectAll('path.node')
				.data(Object.values(nodes))
			.join('path')
				.attr('id', (d, i) => 'node-' + i)
				.attr('class', 'node')
				.attr('d', d => ['M', d.x0, d.y0, 'L', d.x1, d.y0, 'L', d.x1, d.y1, 'L', d.x0, d.y1, 'z'].join(' '));
			
			const xCurve = (1 - firstNodeWidth - (nodeWidth * data.dimensions().length)) / data.dimensions().length * (1 / 2);
			
			const linkPaths = svg.selectAll('path.link')
				.data(links)
			.join('path')
				.attr('class', 'link')
				.attr('d', d => {
					const sourceNode = nodes[d.source];
					const targetNode = nodes[d.target];
					
					const sameSource = links.filter(x => x.source == d.source);
					const y0Adj = normaliseHeight(d3.sum(sameSource.slice(0, sameSource.indexOf(d)), x => x.value) / data.totals()[0].value);
					
					const sameTarget = links.filter(x => x.target == d.target);
					const y1Adj = normaliseHeight(d3.sum(sameTarget.slice(0, sameTarget.indexOf(d)), x => x.value) / data.totals()[0].value);
					
					const thisHeight = normaliseHeight(d.value / data.totals()[0].value);
					
					const path = [];
					path.push(['M', sourceNode.x1, sourceNode.y0 + y0Adj].join(' '));
					path.push(['C', sourceNode.x1 + xCurve, sourceNode.y0 + y0Adj, targetNode.x0 - xCurve, targetNode.y0 + y1Adj, targetNode.x0, targetNode.y0 + y1Adj].join(' '));
					path.push(['V', targetNode.y0 + y1Adj + thisHeight].join(' '));
					path.push(['C', targetNode.x0 - xCurve, targetNode.y0 + y1Adj + thisHeight, sourceNode.x1 + xCurve, sourceNode.y0 + y0Adj + thisHeight, sourceNode.x1, sourceNode.y0 + y0Adj + thisHeight].join(' '));
					
					return path.join(' ') + 'z';
				})
				.on('mouseover', (event, d) => {
					tooltip.transition()
						.style('opacity', 0.9);
					
					tooltip.selectAll('span')
						.data([
							{ 'class': null, 'text': d3.format('.1%')(d.value / nodes[d.target].value) + ' of ' },
							{ 'class': 'name', 'text': nodes[d.target].name },
							{ 'class': null, 'text': ' came from ' },
							{ 'class': 'name', 'text': nodes[d.source].name }
						])
					.join('span')
						.attr('class', d => d.class)
						.text(d => d.text);
				})
				.on('mousemove', (event, d) => {
					tooltip
						.style('top', event.y + 'px')
						.style('left', () => {
							if (d.target.split('\t')[0] == data.dimensions().length - 1) {
								return event.x - 224 + 'px';
							}
							else {
								return event.x + 12 + 'px';
							}
						})
				})
				.on('mouseout', () => {
					tooltip.transition()
						.style('opacity', 0);
				});
				
			// Create the labels
			const pctStr = function(value) {
				return value * 100 + '%';
			};
			
			const xShift = (1 - firstNodeWidth - (nodeWidth * data.dimensions().length)) / data.dimensions().length;
			
			const labelContainers = viewContainer.selectAll('div.labelContainer')
				.data(Object.values(nodes))
			.join('div')
				.attr('id', (d, i) => 'labelContainer-' + i)
				.attr('class', 'labelContainer')
				.style('top', d => pctStr(d.y0))
				.style('left', (d, i) => {
					if (i === 0) {
						return pctStr(d.x0);
					}
					else {
						return pctStr(d.x0 - xShift);
					}
				})
				.style('width', (d, i) => {
					if (i === 0) {
						return pctStr(d.x1 - d.x0);
					}
					else {
						return pctStr(xShift);
					}
				})
				.style('height', d => pctStr(d.y1 - d.y0));

			if (designSettings.labelLayout == 'vertical') {
				labelContainers.filter((x, i) => i > 0)
					.style('flex-direction', 'column')
					.style('align-items', 'flex-end')
					.style('justify-content', 'center');
			}
			else if (designSettings.labelLayout == 'horizontal') {
				labelContainers.filter((x, i) => i > 0)
					.style('flex-direction', 'row')
					.style('align-items', 'center')
					.style('justify-content', 'flex-end')
					.style('gap', '1em');
			}
			
			labelContainers.append('div')
				.attr('class', 'label name')
				.text(d => d.name);
			
			labelContainers.append('div')
				.attr('class', 'label values')
				.text(d => d.formattedValue);
				
			// Remove nulled elements
			let toRemove = [designSettings.removal1, designSettings.removal2, designSettings.removal3];
			toRemove = toRemove.filter(x => x !== null && x !== '').map(x => x.replace('removeBlank', ''));

			nodePaths.filter(x => toRemove.includes(x.name)).remove();
			linkPaths.filter(x => toRemove.includes(x.target.split('\t')[1])).remove();
			labelContainers.filter(x => toRemove.includes(x.name)).remove();

			// Write the breadcrumbs
			d3.select('#__da-app-content').append('div')
				.attr('id', 'breadcrumbs')
				.text(['Total'].concat(data.dimensions().map(x => x.name)).join(' ' + String.fromCharCode(8594) + ' '));
	}
};