const dataBarsTable = {
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
				dataBarsTable._initialize
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
		data.errorNoData('Data Bars Table');

		// Set the design options
		let options = [
			{ 'type': 'title',
				'displayName': 'Data Bars' },
			{ 'type': 'checkbox',
				'id': 'barRendering',
				'displayName': 'Show Data Bars',
				'options': data.metrics().map(x => { return { 'id': x.systemName, 'label': x.name, 'defaultValue': true }; }),
				'description': 'To turn off data bars for a measurement, uncheck the related box.' }
		];

		utils.setDesignOptions(options);

		// Get the design settings, then set conditional options
		let designSettings = await utils.getDesignSettings();
		
		options.splice(4, 0, 
			data.metrics().filter(x => designSettings['barRendering_' + x.systemName] === true).map(x => { return {
				'type': 'colorPicker',
				'id': 'color_' + x.systemName,
				'displayName': 'Bar Colour for ' + x.name,
				'defaultValue': '#a0cbe8'
			}})
		);

		options = options.flat();

		utils.setDesignOptions(options);

		// Get the design settings, then create the widget
		designSettings = await utils.getDesignSettings();
				
		// Create hierarchichal groups
		const dataNested = data.nest();
				
		// Create the document structure
		const table = d3.select('#__da-app-content').append('div').attr('id', 'table');
		const thead = table.append('div').style('display', 'contents');
		const tbody = table.append('div').style('display', 'contents');
		const ttotal = table.append('div').style('display', 'contents');
		
		// Specify the table layout
		table
			.style('display', 'grid')
			.style('grid-template-columns', 'repeat(' + data.fields().length + ', auto)');
				
		// Populate the table header
		thead.selectAll('div')
			.data(data.fields())
		.join('div')
			.style('grid-column', 'auto / auto')
			.attr('class', d => 'header ' + d.type)
		.append('span')
			.text(d => d.name);
				
		// Create and execute a recursive function to populate the table body
		const interpolateShade = d3.interpolateRgb('rgba(255, 255, 255, 0.9)', 'rgba(200, 200, 200, 0.9)');

		const tbodyGenerator = function(container, depth, values) {
			for (const [i, value] of values.entries()) {
				const cellClass = 'body ' + (depth + 1 < data.dimensions().length ? 'parent' : 'child');
				const rowShade = interpolateShade((data.dimensions().length - depth) / 10);

				if (value.colPosition > 0) { // Add cell for left-padding, if applicable
					container.append('div')
						.style('grid-column', 'auto / span ' + value.colPosition)
						.attr('class', cellClass);
				}
				if (depth + 1 < data.dimensions().length) { // Condition for parent rows + recursion
					container.append('div') // Dimension
						.datum(value)
						.style('grid-column', d => 'auto / span ' + d.colWidth)
						.style('background-color', rowShade)
						.attr('class', cellClass + ' dimension')
						.attr('title', d => d.name)
					.append('span')
						.text(d => d.name);
					for (const subtotal of value.subtotals) { // Subtotals
						container.append('div')
							.datum(subtotal)
							.style('grid-column', d => 'auto / auto')
							.style('background-color', rowShade)
							.attr('class', cellClass + ' subtotal metric')
							.attr('title', d => d.formattedValue)
						.append('span')
							.attr('class', 'dataText')
							.text(d => d.formattedValue);
					}

					tbodyGenerator(
						container.append('div')
							.attr('container-for', value.name)
							.style('display', 'contents'),
						depth + 1,
						value.values
					);
				}
				else { // Condition for child rows
					container.append('div') // Dimension
						.datum(value)
						.style('grid-column', 'auto / auto')
						.style('background-color', i % 2 == 1 ? rowShade : null)
						.attr('class', cellClass)
						.attr('title', d => d.name)
					.append('span')
						.text(d => d.name);
					for (const metric of value.values[0]) { // Metrics
						container.append('div')
							.datum(metric)
							.style('grid-column', 'auto / auto')
							.style('background-color', i % 2 == 1 ? rowShade : null)
							.attr('class', cellClass + ' body metric')
							.attr('title', d => d.formattedValue)
						.append('span')
							.attr('class', 'dataText')
							.text(d => d.formattedValue);
					}
				}
			}
		}
		
		tbodyGenerator(tbody, 0, dataNested);
				
		// Populate the table total
		ttotal.selectAll('div')
			.data([{'formattedValue': 'Total'}].concat(data.totals()))
		.join('div')
			.style('grid-column', d => 'auto / ' + (d.formattedValue == 'Total' ? 'span '  + data.dimensions().length : 'auto'))
			.attr('class', d => (d.formattedValue == 'Total' ? 'dimension ' : 'metric ') + 'total')
		.append('span')
			.text(d => d.formattedValue);
				
		// Create the data bars
		const svgSpan = d3.selectAll('div.metric.body.child')
			.filter(d => designSettings['barRendering_' + d.field.systemName] === true)
		.append('span')
			.attr('class', 'dataSVG');
			
		const svg = svgSpan.append('svg')
			.attr('width', '100%')
			.attr('height', '100%');
			
		const dataBars = svg.append('rect')
			.attr('class', d => 'metric' + (d.field.index - data.dimensions().length))
			.style('fill', d => designSettings['color_' + d.field.systemName])
			.attr('transform', 'scale(0, 0.8)')
			.attr('transform-origin', 'center left')
			.attr('width', d => d.value / d3.max(data.rows(), x => x[d.field.index].value) * 100 + '%')
			.attr('height', '100%');
			
		dataBars.transition().duration(600).attr('transform', 'scale(0.9, 0.8)');
				
		// Create the collapsible controls
		const collapseSpan = d3.selectAll('.body.parent.dimension').insert('span', 'span')
			.attr('class', 'collapsible')
			.on('click', function() {
				const groupName = this.parentNode.title;
				const container = d3.select(this.parentNode.parentNode).select('div[container-for="' + groupName + '"]');
				if (container.style('display') == 'contents') {
					d3.select(this).select('svg').attr('transform', 'rotate(-90)');
					container.style('display', 'none');
				}
				else {
					d3.select(this).select('svg').attr('transform', 'rotate(0)');
					container.style('display', 'contents');
				}
			})
			.on('mouseenter', function() {
				d3.select(this).select('svg').select('path').style('fill', 'rgb(10, 135, 198)');
			})
			.on('mouseleave', function() {
				d3.select(this).select('svg').select('path').style('fill', 'rgb(156, 160, 160)');
			});
		
		const collapseSVG = collapseSpan.append('svg')
			.attr('width', '12px')
			.attr('viewBox', '0 0 10 6')
			.attr('transform', 'rotate(0)')
			.attr('transform-origin', 'center');
		
		const collapsePath = collapseSVG.append('path')
			.style('fill', 'rgb(156, 160, 160)')
			.attr('d', 'M5.09 5.5a.5.5 0 0 1-.35-.15l-4-4a.5.5 0 0 1 .71-.7l3.64 3.64L8.74.65a.5.5 0 0 1 .71.71l-4 4a.5.5 0 0 1-.36.14z');
	}
};