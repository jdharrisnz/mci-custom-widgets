const emiCarousel = {
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
				emiCarousel._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Function for formatting dates
		const formatDate = function(date) {
			return new Date(date).toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' });
		};

		// Function for generating a spaced en dash
		const enDash = function() {
			return ' ' + String.fromCharCode(0x2013) + ' ';
		};

		// Function for sorting insight types
		const sortInsightTypes = function(name) {
			switch(name) {
				case 'KPI':
					return 0;
				case 'DAY_OVER_DAY':
					return 1;
				case 'WEEK_OVER_WEEK':
					return 2;
				case 'MONTH_OVER_MONTH':
					return 3;
				case 'QUARTER_OVER_QUARTER':
					return 4;
				default:
					return 5;
			}
		};

		// Function for sliding insights
		const slideToInsight = function(targetId) {
			const currentInsight = d3.select(".insight[position='0']");
			const targetInsight = d3.selectAll('.insight').filter(x => x.id == targetId);
			const currentDot = d3.select(".nav-dot circle[opacity='1']");
			const  targetDot = d3.selectAll('.nav-dot circle').filter(x => x.id == targetId);

			const  adjust = parseInt(targetInsight.attr('position')) * -1;
			const t = d3.transition();

			// Set click functions
			currentInsight.on('click', event => {
				slideToInsight(d3.select(event.target).datum().id);
			});
			targetInsight.on('click', null);
			currentDot.on('click', event => {
				slideToInsight(d3.select(event.target).datum().id);
			});
			targetDot.on('click', null);

			// Move to target
			d3.selectAll('.insight')
				.attr('position', (d, i, nodes) => parseInt(d3.select(nodes[i]).attr('position')) + adjust)
				.transition(t).style('left', (d, i, nodes) => d3.select(nodes[i]).attr('position') + '%');

			// Update classes
			currentInsight.attr('class', (d, i) => 'insight ' + d.analysisType.toLowerCase() + ' inactive');
			targetInsight.attr('class', (d, i) => 'insight ' + d.analysisType.toLowerCase() + ' active');

			// Update scale, blur, and cursor
			currentInsight.transition(t).styleTween('filter', () => t => 'blur(' + (t * 3) + 'px)');
			currentInsight.transition(t).style('transform', 'scale(0.9, 0.9)');
			currentInsight.style('cursor', 'pointer');
			targetInsight.transition(t).styleTween('filter', () => t => 'blur(' + (3 - t * 3) + 'px)');
			targetInsight.transition(t).style('transform', 'scale(1, 1)');
			targetInsight.style('cursor', null);

			// Update dot indicators
			currentDot.transition(t).attr('opacity', 0.4);
			targetDot.transition(t).attr('opacity', 1);
		};

		// Create the document structure
		const container = d3.select('#__da-app-content').append('div')
			.attr('id', 'container');
		const carousel = container.append('div')
			.attr('id', 'carousel');
		const loader = carousel.append('div')
			.attr('id', 'loader');
		const tooltip = d3.select('#__da-app-content').append('div')
			.attr('id', 'tooltip')
			.style('display', 'none');
		const navDots = container.append('div')
			.attr('id', 'nav-dots');

		// Get the bot list, then set options according to the data and create appearance options
		const botList = await utils.getBotList();
		botList.bots = botList.bots.filter(bot => bot.status != 'NO_DATA' && bot.analysisConfigs !== null);

			// Handle case of no valid bots
			if (botList.bots.length === 0) {
				const errorMessage = utils.errorMessageTemplate();

				errorMessage.title.text('Einstein Marketing Insights Carousel');
				errorMessage.heading.text('No Bots');
				errorMessage.message.text('To populate this widget with data, go to Analyze & Act and set up your first Einstein Marketing Insights bot.');

				throw new Error('No bots with which to create a visualisation.');
			}

		let options = [
			{ 'type': 'select',
			  'id': 'botSelect',
			  'displayName': 'Select Bot',
			  'description': 'These bots come from Einstein Marketing Insights in Analyze & Act. Bots with no data and legacy bots are removed.',
			  'options': botList.bots.map(x => { return { 'id': x.id, 'label': x.name + ' (ID ' + x.id + ')' }; }),
			  'defaultValue': botList.bots[0].id },
			{ 'type': 'input',
			  'id': 'maxInsights',
			  'displayName': 'Max Insights to Show',
			  'defaultValue': 15 },
			{ 'type': 'separator' },
			{ 'type': 'title',
			  'displayName': 'Appearance' },
			{ 'type': 'select',
			  'id': 'style',
			  'displayName': 'Widget Style',
			  'options': [{ 'id': 'none', 'label': 'None' }, { 'id': 'fade', 'label': 'Fade Out' }, { 'id': 'pane', 'label': 'Inset Pane'}],
			  'defaultValue': 'fade' },
			{ 'type': 'colorPicker',
			  'id': 'foregroundDimension',
			  'displayName': 'Foreground Dimension',
			  'defaultValue': '#2848c6' },
			{ 'type': 'colorPicker',
			  'id': 'backgroundDimension',
			  'displayName': 'Background Dimension',
			  'defaultValue': '#eff1ff' },
			{ 'type': 'colorPicker',
			  'id': 'foregroundText',
			  'displayName': 'Foregroud Text',
			  'defaultValue': '#2747c6' },
			{ 'type': 'colorPicker',
			  'id': 'backgroundText',
			  'displayName': 'Background Text',
			  'defaultValue': '#666fb7' },
			{ 'type': 'colorPicker',
			  'id': 'foregroundTextContrast',
			  'displayName': 'Foregroud Text (Contrast)',
			  'description': 'Changes the colour of foreground text when it\'s laid over a foreground dimension.',
			  'defaultValue': '#ffffff' }
		];
		
		utils.setDesignOptions(options);

		// Get the settings and apply widget style
		let designSettings = await utils.getDesignSettings();

		d3.select('head').append('style')
			.html(() => {
				if (designSettings.style == 'fade') {
					return "\
						#container {\
							padding-top: 3px;\
							-webkit-mask-image: linear-gradient(to left, transparent 0%, black 2.5%, black 97.5%, transparent 100%);\
						}";
				}
				else if (designSettings.style == 'pane') {
					return "\
						#container {\
							background-color: #e8e8e8;\
							border-radius: 9px;\
							padding-top: 10px;\
							padding-bottom: 5px;\
						}\
						#container:after {\
							content: '';\
							position: absolute;\
							pointer-events: none;\
							top: 0;\
							right: 0;\
							bottom: 0;\
							left: 0;\
							z-index: 1;\
							border-radius: 9px;\
							box-shadow: 0 0 9px 0 rgba(0,0,0, 0.3) inset;\
						}";
				}
			});

		// Get the selected bot results, and add some text replacement options
		const botResult = await utils.getBotResults(designSettings.botSelect);

			// Remove hidden insights
			botResult.insights = botResult.insights.filter(insight => {
				let choice = true;
				for (const criterion of botResult.hiddenInsightsCriteria) {
					if (insight.analysisType == criterion.type
						&& insight.analysisSubType == criterion.analysisSubType
						&& JSON.stringify(insight.dimensions) == JSON.stringify(criterion.dimensions)) {
						choice = false;
					}
				}
				return choice;
			});

			// Validate the insights limit and apply
			if (parseInt(designSettings.maxInsights) > 0) {
				botResult.insights = botResult.insights.slice(0, parseInt(designSettings.maxInsights));
			}

			const metricName = botResult.insightsBotResultConfig.metricName;
			const denomMetricName = botResult.insightsBotResultConfig.denominationMetricName;
			const numMetricName = botResult.insightsBotResultConfig.numeratorMetricName;
			const volumeMetricName = botResult.insightsBotResultConfig.magnitudeMetricName;

			options = options.concat(
				{ 'type': 'separator' },
				{ 'type': 'title',
					'displayName': 'Name replacement for bot ' + botResult.insightsBotResultConfig.name }
			).concat(
				botResult.insightsBotResultConfig.analysisConfigs.map(x => x.analysisType == 'KPI' ? x.analysisType : x.analysisSubType)
				.sort((a, b) => sortInsightTypes(a) - sortInsightTypes(b)).map(x => {
					return {
						'type': 'input',
						'id': x,
						'displayName': x,
						'defaultValue': x == 'KPI' ? 'Performance' : x.split('_').map(x => x[0].toUpperCase() + x.substr(1).toLowerCase()).join(' '),
						'description': 'Enter the value to replace ' + x + ' with.'
					};
				})
			);

		// Get default display names for all dimensions, then add options for name replacement and locale
		const dimensions = await Promise.all(
			[metricName, denomMetricName, numMetricName].concat(Array.from(new Set(
				botResult.insights.map(x => Object.keys(x.dimensions)).flat().sort()
			))).map(x => utils.getFieldDetails(x))
		);

		options = options.concat(
			dimensions.map(dimension => {
				return {
					'type': 'input',
					'id': dimension.systemName,
					'displayName': dimension.systemName,
					'defaultValue': dimension.name,
					'description': 'Enter the value to replace ' + dimension.systemName + ' with.'
				};
			})
		).concat(
			{ 'type': 'separator' },
			{ 'type': 'title',
				'displayName': 'Metric Formatting'},
			{ 'type': 'input',
				'id': 'localeDecimal',
				'displayName': 'Decimal point for your locale',
				'defaultValue': '.' },
			{ 'type': 'input',
				'id': 'localeThousands',
				'displayName': 'Thousands separator for your locale',
				'defaultValue': ',' },
			{ 'type': 'input',
				'id': 'localeCurrencyPrefix',
				'displayName': 'Currency prefix for your locale',
				'defaultValue': '$' },
			{ 'type': 'input',
				'id': 'localeCurrencySuffix',
				'displayName': 'Currency suffix for your locale',
				'defaultValue': '' }
		);

		utils.setDesignOptions(options);

		// Get the locale settings, the set measurement format options
		designSettings = await utils.getDesignSettings();

		d3.formatDefaultLocale({
			'decimal': designSettings.localeDecimal,
			'thousands': designSettings.localeThousands,
			'grouping': [3],
			'currency': [designSettings.localeCurrencyPrefix, designSettings.localeCurrencySuffix],
			'numerals': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
			'percent': '%',
			'minus': '-',
			'nan': 'NaN'
		});

		options = options.concat(
			{ 'type': 'select',
				'id': 'percent_format',
				'displayName': 'Percent format',
				'options': utils.metricFormatOptions(0.0941).slice(1), // Slice off the system default
				'defaultValue': ',.1%' }
		).concat(
			[metricName, denomMetricName, numMetricName].map((metric, i) => {
				return {
					'type': 'select',
					'id': metric + '_format',
					'displayName': designSettings[metric] + ' format',
					'options': utils.metricFormatOptions(d3.mean(
						botResult.insights.map(x => {
							return [x.data.value, x.data.numeratorValue, x.data.denominatorValue][i];
						})
					)),
					'defaultValue': 0
				};
			})
		);

		utils.setDesignOptions(options);

		// Finally, get design settings and create the insights
		designSettings = await utils.getDesignSettings();
		
		loader.remove();

		// Create the insight containers
		const insights = carousel.selectAll('div')
			.data(botResult.insights)
		.join('div')
			.attr('class', (d, i) => 'insight ' + d.analysisType.toLowerCase() + (i == 0 ? ' active' : ' inactive'))
			.style('transform', (d, i) => i === 0 ? 'scale(1, 1)' : 'scale(0.9, 0.9)')
			.style('left', (d, i) => i * 100 + '%')
			.style('filter', (d, i) => i === 0 ? 'blur(0px)' : 'blur(3px)')
			.style('cursor', (d, i) => i !== 0 ? 'pointer' : null)
			.attr('position', (d, i) => i * 100);

		insights.filter((d, i) => i !== 0)
			.on('click', event => {
				slideToInsight(d3.select(event.target).datum().id);
			});

		// Create the navigation dots
		navDots.selectAll('svg')
			.data(botResult.insights)
		.join('svg')
			.attr('class', 'nav-dot')
			.attr('viewBox', '-0.5 -0.5 1 1')
			.attr('preserveAspectRatio', 'xMidYMax meet')
		.append('circle')
			.attr('r', 0.5)
			.attr('opacity', (d, i) => i === 0 ? 1 : 0.4)
			.on('click', event => {
				slideToInsight(d3.select(event.target).datum().id);
			});

		// Function for creating insights with visuals
		const createFullInsights = function() {
			// Create the title
			insights.append('div')
				.attr('class', 'insight-title full-insight')
				.datum(d => Object.entries(d.dimensions))
				.on('mouseenter', (event, d) => {
					tooltip
					.style('display', null)
					.text(() => d.map(x => designSettings[x[0]] + ' ' + x[1]).join(' and '));
				})
				.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
				.on('mouseleave', () => { tooltip.style('display', 'none'); })
				.selectAll('span')
				.data(d => d)
			.join('span')
				.selectAll('span')
				.data(d => d)
			.join('span')
				.attr('class', (d, i) => ['insight-label', 'insight-name'][i])
				.text((d, i) => [designSettings[d], d][i]);

			// Create the insight text summary
			const insightSummaries = insights.append('div')
				.attr('class', 'insight-summary full-insight');

				// Create the thumb
				insightSummaries.append('svg')
					.attr('class', d => d.positive === true ? 'thumb positive' : 'thumb negative')
					.attr('viewBox', '0 0 32 32')
					.attr('preserveAspectRatio', 'xMidYMid meet')
					.attr('transform', d => d.positive === true ? 'scale(1 1)': 'scale(1 -1)')
					.attr('transform-origin', 'center center')
					.append('path')
						.attr('d', 'M2.463 32c-1.342 0-2.463-1.121-2.463-2.463v-17.23c0-1.342 1.121-2.461 2.463-2.461h3.696c.911 0 1.709.523 2.134 1.274.831-.509 1.647-.807 2.172-1.11 1.238-.715 1.867-2.727 2.16-4.823.147-1.048.225-2.055.353-2.896.064-.42.128-.793.3-1.199.086-.203.2-.426.437-.654s.654-.437 1.053-.437c1.825 0 3.321.713 4.278 1.807s1.403 2.464 1.644 3.826c.392 2.223.244 4.104.168 5.448h7.442c2.024 0 3.698 1.665 3.698 3.689 0 .718-.204 1.258-.464 2.098s-.613 1.851-1 2.934c-.774 2.167-1.695 4.624-2.297 6.431-.24.722-.553 1.479-1.117 2.134s-1.474 1.17-2.506 1.17h-14.77c-.431 0-.84-.089-1.226-.228v.228c0 1.342-1.119 2.463-2.461 2.463h-3.696zM2.463 29.537h3.696v-17.23h-3.696v17.23zM9.846 27.076h14.77c.33 0 .426-.065.644-.317s.456-.738.646-1.31c.628-1.884 1.55-4.335 2.314-6.474.382-1.07.724-2.061.964-2.836s.356-1.472.356-1.37c0-.703-.535-1.226-1.238-1.226h-8.719c-.683.003-1.238-.554-1.235-1.238 0-1.454.316-4.049-.072-6.248-.194-1.099-.558-2.026-1.081-2.624-.387-.443-.934-.792-1.759-.925-.124.702-.208 1.899-.366 3.023-.321 2.293-.925 5.194-3.379 6.611-.913.527-1.797.834-2.326 1.199s-.745.561-.745 1.427v11.071c0 .703.523 1.235 1.226 1.235h0z');

				// Create the text
				insightSummaries.append('span')
					.attr('class', d => { return 'explanation ' + { 'true': 'positive', 'false': 'negative' }[d.positive]; })
					.text(d => {
							switch(d.analysisType) {
								case 'KPI':
									return (d.positive === true ? 'Over-performing' : 'Under-performing') + ' segment';
								case 'WIA':
									return d.positive === true
										? 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'an increase' : 'a decrease') + ' of overall ' + designSettings[metricName]
										: 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'a decrease' : 'an increase') + ' of overall ' + designSettings[metricName];
							}
						});

				// Write the analysis sub type for change-driver insights
				insightSummaries.filter(x => x.analysisType == 'WIA').append('span')
					.attr('class', 'date-range')
					.on('mouseenter', (event, d) => {
						const config = botResult.insightsBotResultConfig.analysisConfigs.filter(x => x.analysisSubType == d.analysisSubType)[0];
						const compareStart = formatDate(config.comparisonDate.startDate);
						const compareEnd = formatDate(config.comparisonDate.endDate);
						const currentStart = formatDate(config.date.startDate);
						const currentEnd = formatDate(config.date.endDate);

						tooltip
						.style('display', null)
						.text(compareStart + enDash() + compareEnd + ' vs. ' + currentStart + enDash() + currentEnd);
					})
					.on('mousemove', event => tooltip.style('left', event.clientX + 'px').style('top', event.clientY + 'px'))
					.on('mouseleave', () => tooltip.style('display', 'none'))
					.text(d => designSettings[d.analysisSubType]);

				// Create the insight visualisation elements
				const insightsViz = insights.append('div')
					.attr('class', 'viz-container full-insight');

					// Create the visualisations, starting with performance insights
					const kpiViz = insightsViz.filter(x => x.analysisType == 'KPI').selectAll('div')
						.data(d => { return [
							{ 'metricName': metricName,
							  'summaryValue': (d.data.value - d.data.totals.value) / d.data.totals.value,
							  'thisValue': d.data.value,
							  'totalValue': d.data.totals.value },
							{ 'metricName': volumeMetricName,
							  'summaryValue': d.data.volume / d.data.totals.volume,
							  'thisValue': d.data.volume,
							   'totalValue': d.data.totals.volume }
						]; })
					.join('div')
						.attr('class', 'kpi-viz');

						// Create the judgment text
						const kpiVizDesc = kpiViz.append('div')
							.attr('class', 'kpi-viz-desc');

						kpiVizDesc.append('span')
							.attr('class', 'metric-name')
							.text(d => designSettings[d.metricName]);

						kpiVizDesc.append('span')
							.attr('class', 'metric-desc')
							.text((d, i) => {
									switch(i) {
										case 0:
											return ' is ' + d3.format(designSettings.percent_format)(d.summaryValue) + (d.thisValue > d.totalValue ? ' above' : ' below') + ' average.';
										case 1:
											return ' is ' + d3.format(designSettings.percent_format)(d.summaryValue) + ' of total.';
									}
								});

						// Create the bars visualisations
						const kpiVizBars = insightsViz.selectAll('.kpi-viz:first-child').append('svg')
							.attr('class', 'kpi-viz-bars')
							.datum(d => {
								const max = d3.max([d.thisValue, d.totalValue]);
								return [
									{ 'barColor': designSettings.foregroundDimension, 'textColor': designSettings.foregroundText, 'metricName': d.metricName, 'value': d.thisValue, 'max': max },
									{ 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'metricName': d.metricName, 'value': d.totalValue, 'max': max }
								];
							});

						kpiVizBars.selectAll('rect')
							.data(d => d)
						.join('rect')
							.attr('fill', d => d.barColor)
							.attr('x', (d, i) => ['0%', '55%'][i])
							.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 20 + '%')
							.attr('width', '45%')
							.attr('height', d => d.value / d.max * 100 * 0.8 + '%');

						kpiVizBars.selectAll('text')
							.data(d => d)
						.join('text')
							.attr('fill', d => d.textColor)
							.attr('text-anchor', 'middle')
							.attr('x', (d, i) => ['22.5%', '77.5%'][i])
							.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 17 + '%')
							.text(d => designSettings[d.metricName + '_format'] !== 0 ? d3.format(designSettings[d.metricName + '_format'])(d.value) : null)
							.each(async (d, i, nodes) => {
								if (designSettings[d.metricName + '_format'] === 0) {
									const formattedValue = await utils.getFormattedValue(d.metricName, d.value);
									d3.select(nodes[i]).text(formattedValue);
								}
							});

						// Create the pie visualisations
						const kpiVizPie = insightsViz.selectAll('.kpi-viz:nth-child(2)').append('svg')
							.attr('class', 'kpi-viz-pie')
							.attr('viewBox', '0 0 65 65')
							.attr('preserveAspectRatio', 'xMidYMid meet')
							.datum(d => [
								{ 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'metricName': d.metricName, 'value': d.totalValue },
								{ 'barColor': designSettings.foregroundDimension, 'textColor': designSettings.foregroundText, 'metricName': d.metricName, 'value': d.thisValue, 'clipId': Math.random().toString(36).substr(2, 9) }
							]);

						kpiVizPie.append('defs').append('clipPath')
							.attr('id', d => d[1].clipId)
						.append('path')
							.attr('d', d => {
								const angle = (d[1].value / d[0].value * 360 - 90) * Math.PI / 180;
								const largeArc = d[1].value / d[0].value > 0.5 ? 1 : 0;
								return [
									'M 32.5 32.5',
									'L 32.5 0',
									'A 32.5 32.5 0 ' + largeArc + ' 1 ' + (32.5 + 32.5 * Math.cos(angle)) + ' ' + (32.5 + 32.5 * Math.sin(angle)),
									'z'
								].join(' ');
							});

						kpiVizPie.selectAll('circle')
							.data(d => d)
						.join('circle')
							.attr('fill', 'none')
							.attr('stroke', d => d.barColor)
							.attr('clip-path', (d, i) => [null, 'url(#' + d.clipId + ')'][i])
							.attr('cx', '32.5')
							.attr('cy', '32.5')
							.attr('r', '26.5');

						kpiVizPie.selectAll('text')
							.data(d => d)
						.join('text')
							.attr('fill', d => d.textColor)
							.attr('font-size', '9.9')
							.attr('text-anchor', 'middle')
							.attr('x', '32.5')
							.attr('y', (d, i) => ['42.5', '30.5'][i])
							.text(d => designSettings[d.metricName + '_format'] !== 0 ? d3.format(designSettings[d.metricName + '_format'])(d.value) : null)
							.each(async (d, i, nodes) => {
								if (designSettings[d.metricName + '_format'] === 0) {
									const formattedValue = await utils.getFormattedValue(d.metricName, d.value);
									d3.select(nodes[i]).text(formattedValue);
								}
							});

					// Create the visualisations for change driver insights
						// Create the KPI section
						const wiaResult = insightsViz.filter(x => x.analysisType == 'WIA').append('div')
							.attr('class', 'wia-result');

							// Create the judgment text
							const wiaResultVizDesc = wiaResult.append('div')
								.attr('class', 'wia-viz-desc');

							const wiaResultNewSegments = wiaResultVizDesc.filter(x => x.comparedData.value === 0 || x.data.value === 0);

							wiaResultNewSegments.append('span')
								.attr('class', 'metric-desc')
								.text('Segment ');

							wiaResultNewSegments.append('span')
								.attr('class', 'metric-name')
								.text(d => d.comparedData.value === 0 ? 'is new' : 'stopped');

							wiaResultNewSegments.append('span')
								.attr('class', 'metric-desc')
								.text(d => ' and is performing ' + (d.positive ? 'well.' : 'badly.'));

							const wiaResultOtherSegments = wiaResultVizDesc.filter(x => x.comparedData.value !== 0 && x.data.value !== 0);

							wiaResultOtherSegments.append('span')
								.attr('class', 'metric-name')
								.text(d => designSettings[metricName]);

							wiaResultOtherSegments.append('span')
								.attr('class', 'metric-desc')
								.text(d => ((d.data.value > d.comparedData.value) ? ' increased': ' decreased') + ' by ' + d3.format(designSettings.percent_format)((d.data.value - d.comparedData.value) / d.comparedData.value) + '.');

							// Create the result visualisation
							const wiaResultViz = wiaResult.append('svg')
								.attr('class', 'wia-viz')
								.datum(d => {
									const max = d3.max([d.comparedData.value, d.comparedData.totals.value, d.data.value, d.data.totals.value]);
									return [
										{ 'barColor': designSettings.foregroundDimension, 'textColor': designSettings.foregroundText, 'value': d.comparedData.value, 'max': max },
										{ 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.comparedData.totals.value, 'max': max },
										{ 'barColor': designSettings.foregroundDimension, 'textColor': designSettings.foregroundText, 'value': d.data.value, 'max': max },
										{ 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.data.totals.value, 'max': max }
									];
								});

							wiaResultViz.selectAll('rect')
								.data(d => d)
							.join('rect')
								.attr('fill', d => d.barColor)
								.attr('x', (d, i) => ['0%', '25%', '55%', '80%'][i])
								.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 20 + '%')
								.attr('width', '20%')
								.attr('height', d => d.value / d.max * 100 * 0.8 + '%');

							wiaResultViz.selectAll('text')
								.data(d => d)
							.join('text')
								.attr('fill', d => d.textColor)
								.attr('text-anchor', 'middle')
								.attr('x', (d, i) => ['10%', '35%', '65%', '90%'][i])
								.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 17 + '%')
								.text(d => designSettings[metricName + '_format'] !== 0 ? d3.format(designSettings[metricName + '_format'])(d.value) : null)
								.each(async (d, i, nodes) => {
									if (designSettings[metricName + '_format'] === 0) {
										const formattedValue = await utils.getFormattedValue(metricName, d.value);
										d3.select(nodes[i]).text(formattedValue);
									}
								});

							wiaResultViz.append('text')
								.attr('class', 'arrow-text')
								.attr('text-anchor', 'middle')
								.attr('x', '50%')
								.attr('y', '60%')
								.text(String.fromCharCode(0x25ba));

						// Create the volume section
						const wiaVolume = insightsViz.filter(x => x.analysisType == 'WIA').append('div')
							.datum(d => { return {
								'name': volumeMetricName,
								'current': d.data.volume,
								'currentTotal': d.data.totals.volume,
								'compare': d.comparedData.volume,
								'compareTotal': d.comparedData.totals.volume 
								} })
							.attr('class', 'wia-volume');

						// Create the judgment text
						const wiaVolumeVizDesc = wiaVolume.append('div')
							.attr('class', 'wia-viz-desc');

						const wiaVolumeNewSegments = wiaVolumeVizDesc.filter(d => d.current === 0 || d.compare === 0);

						wiaVolumeNewSegments.append('span')
							.attr('class', 'metric-name')
							.text(d => designSettings[d.name]);

						wiaVolumeNewSegments.append('span')
							.attr('class', 'metric-desc')
							.text(d => (d.current === 0 ? ' stopped' : ' started') + ' delivering.');

						const wiaVolumeOtherSegments = wiaVolumeVizDesc.filter(x => x.current !== 0 && x.compare !== 0);

						wiaVolumeOtherSegments.append('span')
							.attr('class', 'metric-name')
							.text(d => designSettings[d.name]);

						wiaVolumeOtherSegments.append('span')
							.attr('class', 'metric-desc')
							.text(d => (d.current > d.compare ? ' increased' : ' decreased') + ' by ' + d3.format(designSettings.percent_format)((d.current - d.compare) / d.compare) + '.');

						// Create the change visualisations
						wiaVolumeViz = wiaVolume.append('svg')
							.attr('class', 'wia-viz')
							.datum(d => {
								const max = d3.max([d.compareTotal, d.currentTotal]);
								return [
									{ 'name': d.name, 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.compareTotal, 'max': max, 'textShift': 0 },
									{ 'name': d.name, 'barColor': designSettings.foregroundDimension, 'textColor': d.compareTotal / max - d.compare / max < 0.2 ? designSettings.foregroundTextContrast : designSettings.foregroundText, 'value': d.compare, 'max': max, 'textShift': d.compareTotal / max - d.compare / max < 0.2 ? 20 : 0 },
									{ 'name': d.name, 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.currentTotal, 'max': max, 'textShift': 0 },
									{ 'name': d.name, 'barColor': designSettings.foregroundDimension, 'textColor': d.currentTotal / max - d.current / max < 0.2 ? designSettings.foregroundTextContrast : designSettings.foregroundText, 'value': d.current, 'max': max, 'textShift': d.currentTotal / max - d.current / max < 0.2 ? 20 : 0 }
								];
							});

						wiaVolumeViz.selectAll('rect')
							.data(d => d)
						.join('rect')
							.attr('fill', d => d.barColor)
							.attr('x', (d, i) => ['0%', '0%', '60%', '60%'][i])
							.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 20 + '%')
							.attr('width', '40%')
							.attr('height', d => d.value / d.max * 100 * 0.8 + '%');

						wiaVolumeViz.selectAll('text')
							.data(d => d)
						.join('text')
							.attr('fill', d => d.textColor)
							.attr('text-anchor', 'middle')
							.attr('x', (d, i) => ['20%', '20%', '80%', '80%'][i])
							.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 17 + d.textShift + '%')
							.text(d => designSettings[d.name + '_format'] !== 0 ? d3.format(designSettings[d.name + '_format'])(d.value) : null)
							.each(async (d, i, nodes) => {
								if (designSettings[d.name + '_format'] === 0) {
									const formattedValue = await utils.getFormattedValue(d.name, d.value);
									d3.select(nodes[i]).text(result);
								}
							});

						wiaVolumeViz.append('text')
							.attr('class', 'arrow-text')
							.attr('text-anchor', 'middle')
							.attr('x', '50%')
							.attr('y', '60%')
							.text(String.fromCharCode(0x25ba));
		};

		// Function for creating small text-only insights
		const createTextInsights = function() {
			// Create the logo
			insights.append('svg')
				.attr('class', 'logo text-insight')
				.attr('viewBox', '0 -2 15 15')
				.attr('preserveAspectRatio', 'xMidYMid meet')
			.append('g')
				.attr('transform', 'translate(.5)')
				.selectAll('path')
				.data([
					'M9.83 5.3C10.48 5.3 11 4.76 11 4.11c0-.66-.53-1.19-1.18-1.19-.65 0-1.18.53-1.18 1.19S9.18 5.3 9.83 5.3L9.83 5.3zM9.83 3.56c.3 0 .54.24.54.54s-.24.54-.54.54c-.3 0-.54-.24-.54-.54C9.29 3.81 9.53 3.56 9.83 3.56z',
					'M5.14 12.86c-1.11 0-2.14-.64-2.64-1.64-.1.01-.19.02-.29.02-1.5 0-2.72-1.23-2.72-2.74 0-.74.26-1.51.73-2.1.12-.15.25-.3.39-.42-.07-.25-.1-.49-.1-.71 0-.87.31-1.66.86-2.22-.01-.05-.02-.1-.02-.16 0-.36.29-.65.64-.65.15 0 .29.05.4.14C2.7 2.25 3 2.18 3.32 2.15 3.4 2.14 3.48 2.14 3.55 2.14c1.01 0 1.8.62 2.21 1.04.55-.51 1.04-.7 1.83-.7.4 0 .77.07 1.1.21.13.05.19.2.14.33C8.8 3.12 8.71 3.18 8.61 3.18 8.23 3.05 7.92 3 7.6 3 6.93 3 6.57 3.13 6.11 3.57c.1.12.19.25.27.38C6.7 4.44 7.03 4.98 7.38 5.6c.29-.3.58-.56.89-.81C8.29 4.78 8.4 4.73 8.43 4.73c.08 0 .15.04.2.1.04.04.06.11.06.18-.01.07-.04.14-.1.18C8.27 5.45 7.96 5.73 7.64 6.06 8.2 7.1 8.56 7.89 8.6 7.98c.51 1.04 1.17 1.67 1.94 1.87.22-.34.33-.73.33-1.11.04-1.15-.31-2.19-.56-2.96-.07-.21.01-.36.14-.4.01 0 .03 0 .04 0 .16 0 .25.07.28.17.3.89.66 1.98.62 3.2 0 .4-.1.8-.29 1.17 1.59-.02 2.88-1.33 2.88-2.94 0-1.47-1.08-2.72-2.52-2.92-.14-.02-.24-.15-.22-.29.02-.13.13-.22.25-.22 1.72.23 3 1.7 3.01 3.43 0 1.91-1.54 3.46-3.42 3.46-.1 0-.2 0-.3-.01-.08.09-.16.18-.25.27-.53.51-1.25.8-1.97.8-.29 0-.57-.02-.86-.05C7.24 12.33 6.29 12.86 5.14 12.86zM3.02 11.11c.44.77 1.23 1.24 2.11 1.24.9 0 1.63-.36 2.03-1-.99-.19-1.94-.56-2.84-1.13-.2.22-.4.39-.59.54C3.5 10.92 3.26 11.03 3.02 11.11zM7.88 10.94c.22.02.44.03.66.03.6 0 1.19-.25 1.64-.69C9.37 9.99 8.68 9.29 8.14 8.2 8.13 8.18 7.81 7.47 7.27 6.46 7.1 6.65 6.93 6.84 6.78 7.04c.76.85 1.21 2.24 1.21 3.11C7.99 10.41 7.96 10.68 7.88 10.94zM4.66 9.83c.86.53 1.77.87 2.71 1.03.07-.23.11-.47.11-.72 0-.83-.45-2.01-1.02-2.69C6.26 7.7 6.07 7.95 5.89 8.2L5.87 8.23c.06.1.09.21.09.32 0 .36-.29.65-.64.65-.05 0-.1-.01-.15-.02C4.99 9.41 4.83 9.63 4.66 9.83zM.8 6.49C.74 6.56.68 6.63.62 6.71.22 7.21 0 7.86 0 8.49c0 1.23.99 2.23 2.2 2.23.03 0 .06 0 .1 0-.08-.28-.12-.56-.12-.84.01-.41.08-.84.21-1.3C1.96 8.21 1.54 7.7 1.17 7.17 1.1 7.07.94 6.82.8 6.49zM2.8 9.05c-.06.3-.1.57-.11.83 0 .25.04.51.12.75.21-.06.42-.16.62-.29.15-.11.3-.25.45-.4C3.51 9.68 3.15 9.38 2.8 9.05zM2.94 8.49C3.35 8.9 3.78 9.26 4.22 9.56c.18-.21.35-.44.53-.68C4.7 8.78 4.67 8.67 4.67 8.56c0-.36.29-.65.64-.65.05 0 .1.01.14.01.2-.27.41-.55.62-.83L6.06 7.07c-.04-.04-.72-.73-1.9-1.09C3.6 6.86 3.19 7.7 2.94 8.49zM1.21 6.15c.1.26.23.52.38.73.29.41.61.8.95 1.18.25-.7.62-1.44 1.1-2.21C3.36 5.8 3.06 5.78 2.75 5.78c-.18 0-.36.01-.54.03L2.19 5.7 2.2 5.81C1.85 5.83 1.52 5.95 1.21 6.15zM4.47 5.54C5.6 5.91 6.26 6.55 6.39 6.68c0 0 .01.01.01.01.19-.24.39-.47.6-.7C6.65 5.34 6.29 4.75 5.94 4.23c-.06-.1-.13-.2-.19-.29L5.58 4.13C5.14 4.63 4.8 5.08 4.47 5.54zM1.69 3.44C1.24 3.95 1.02 4.56 1.02 5.26c0 .11.01.24.04.38.34-.2.71-.31 1.1-.34.21-.02.41-.04.61-.04.39 0 .79.04 1.18.13C4.31 4.86 4.7 4.35 5.12 3.86L5.4 3.54C5.05 3.18 4.39 2.65 3.55 2.65c-.06 0-.13.01-.19.01-.25.02-.5.08-.73.16 0 .01 0 .03 0 .04 0 .36-.29.65-.64.65C1.89 3.51 1.78 3.49 1.69 3.44'
				])
			.join('path')
				.attr('d', d => { return d; });

			// Create the text container
			const textContainer = insights.append('div')
				.attr('class', 'text-container text-insight');

				// Create the segment text
				textContainer.append('div')
					.attr('class', 'insight-title')
					.datum(d => Object.entries(d.dimensions))
					.on('mouseenter', (event, d) => {
						tooltip
						.style('display', null)
						.text(() => d.map(x => designSettings[x[0]] + ' ' + x[1]).join(' and '));
					})
					.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
					.on('mouseleave', () => { tooltip.style('display', 'none'); })
					.selectAll('span')
					.data(d => d)
				.join('span')
					.selectAll('span')
					.data(d => d)
				.join('span')
					.attr('class', (d, i) => ['insight-label', 'insight-name'][i])
					.text((d, i) => [designSettings[d], d][i]);

				// Create the judgment text
				const textInsightSummaries = textContainer.append('div')
					.attr('class', 'insight-summary');

					// Create the thumb
						textInsightSummaries.append('svg')
							.attr('class', d => d.positive === true ? 'thumb positive' : 'thumb negative')
							.attr('viewBox', '0 0 32 32')
							.attr('preserveAspectRatio', 'xMidYMid meet')
							.attr('transform', d => d.positive === true ? 'scale(1 1)': 'scale(1 -1)')
							.attr('transform-origin', 'center center')
						.append('path')
							.attr('d', 'M2.463 32c-1.342 0-2.463-1.121-2.463-2.463v-17.23c0-1.342 1.121-2.461 2.463-2.461h3.696c.911 0 1.709.523 2.134 1.274.831-.509 1.647-.807 2.172-1.11 1.238-.715 1.867-2.727 2.16-4.823.147-1.048.225-2.055.353-2.896.064-.42.128-.793.3-1.199.086-.203.2-.426.437-.654s.654-.437 1.053-.437c1.825 0 3.321.713 4.278 1.807s1.403 2.464 1.644 3.826c.392 2.223.244 4.104.168 5.448h7.442c2.024 0 3.698 1.665 3.698 3.689 0 .718-.204 1.258-.464 2.098s-.613 1.851-1 2.934c-.774 2.167-1.695 4.624-2.297 6.431-.24.722-.553 1.479-1.117 2.134s-1.474 1.17-2.506 1.17h-14.77c-.431 0-.84-.089-1.226-.228v.228c0 1.342-1.119 2.463-2.461 2.463h-3.696zM2.463 29.537h3.696v-17.23h-3.696v17.23zM9.846 27.076h14.77c.33 0 .426-.065.644-.317s.456-.738.646-1.31c.628-1.884 1.55-4.335 2.314-6.474.382-1.07.724-2.061.964-2.836s.356-1.472.356-1.37c0-.703-.535-1.226-1.238-1.226h-8.719c-.683.003-1.238-.554-1.235-1.238 0-1.454.316-4.049-.072-6.248-.194-1.099-.558-2.026-1.081-2.624-.387-.443-.934-.792-1.759-.925-.124.702-.208 1.899-.366 3.023-.321 2.293-.925 5.194-3.379 6.611-.913.527-1.797.834-2.326 1.199s-.745.561-.745 1.427v11.071c0 .703.523 1.235 1.226 1.235h0z');

					// Create the cause text
					textInsightSummaries.append('span')
						.attr('class', d => { return 'explanation ' + { 'true': 'positive', 'false': 'negative' }[d.positive]; })
						.text(d => {
								switch(d.analysisType) {
									case 'KPI':
										return (d.positive === true ? 'Over-performing' : 'Under-performing') + ' segment';
									case 'WIA':
										return d.positive === true
											? 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'an increase' : 'a decrease') + ' of overall ' + designSettings[metricName]
											: 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'a decrease' : 'an increase') + ' of overall ' + designSettings[metricName];
								}
							});

					// Write the analysis sub type for change-driver insights
					textInsightSummaries.filter(x => x.analysisType == 'WIA').append('span')
						.attr('class', 'date-range')
						.on('mouseenter', (event, d) => {
							const config = botResult.insightsBotResultConfig.analysisConfigs.filter(x => x.analysisSubType == d.analysisSubType)[0];
							const compareStart = formatDate(config.comparisonDate.startDate);
							const compareEnd = formatDate(config.comparisonDate.endDate);
							const currentStart = formatDate(config.date.startDate);
							const currentEnd = formatDate(config.date.endDate);

							tooltip
								.style('display', null)
								.text(compareStart + enDash() + compareEnd + ' vs. ' + currentStart + enDash() + currentEnd);
						})
						.on('mousemove', event => tooltip.style('left', event.clientX + 'px').style('top', event.clientY + 'px'))
						.on('mouseleave', () => tooltip.style('display', 'none'))
						.text(d => designSettings[d.analysisSubType]);

					// Write the KPI change
					const textInsightKPIs = textContainer.append('div')
						.attr('class', 'text-insight-kpi');

					textInsightKPIs.append('span')
						.attr('class', 'metric-name')
						.text(designSettings[metricName]);

					textInsightKPIs.append('span')
						.attr('class', 'metric-desc')
						.text(d => {
							if (d.analysisType == 'KPI') {
								return ' is ' + d3.format(designSettings.percent_format)((d.data.value - d.data.totals.value) / d.data.totals.value) + (d.data.value > d.data.totals.value ? ' above' : ' below') + ' average.';
							}
							else if (d.analysisType == 'WIA') {
								return (d.data.value > d.comparedData.value ? ' increased ' : ' decreased ') + 'by ' + d3.format(designSettings.percent_format)((d.data.value - d.comparedData.value) / d.comparedData.value) + '.';
							}
						});

					textInsightKPIs.filter(d => d.analysisType == 'WIA')
					.on('mouseenter', (event, d) => {
						tooltip
							.style('display', null)
							.text('Meanwhile, overall ' + designSettings[metricName] + (d.data.totals.value > d.comparedData.totals.value ? ' increased ' : ' decreased ') + 'by ' + d3.format(designSettings.percent_format)((d.data.totals.value - d.comparedData.totals.value) / d.comparedData.totals.value) + '.');
					})
					.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
					.on('mouseleave', () => { tooltip.style('display', 'none'); });
		}

			// Create initial view based on size
			const size = d3.select('.insight').node().getBoundingClientRect();

			createFullInsights();
			createTextInsights();

			// Function to check size and apply change to style
			const myStyle = d3.select('head').append('style');
			const checkSizeAndUpdateStyle = function() {
				const size = d3.select('.insight').node().getBoundingClientRect();

				myStyle.html(() => {
					if (size.width < 280 || size.height < 212) {
						return "\
							.full-insight { display: none !important; }\
							.insight { flex-direction: row; }"
					}
					else {
						return "\
							.text-insight { display: none !important; }\
							.insight { flex-direction: column; }"
					}
				});
			};

			checkSizeAndUpdateStyle();
			window.addEventListener('resize', checkSizeAndUpdateStyle);
	}
};