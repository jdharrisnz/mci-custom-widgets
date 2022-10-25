const emiExplorer = {
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
				emiExplorer._initialize
			)}
		);
	},
	'_initialize': async function() {
		// Function to sort insight types
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

		// Function to filter insight list
		const filterInsightsList = function() {
			const type = d3.select('#selectType').node().selectedOptions[0].value;
			const dimension = d3.select('#selectDimensions').node().selectedOptions[0].value;
			const positive = d3.select('#selectPos').node().selectedOptions[0].value;
			const factor = d3.select('#selectFactor').node().selectedOptions[0].value;

			d3.selectAll('.insight')
				.style('display', null)
				.filter(x => {
					let typeCheck = true;
					if (type == 'KPI' && type != 'All') {
						typeCheck = x.analysisType == type;
					}
					else if (type != 'All') {
						typeCheck = x.analysisSubType == type;
					}

					let dimCheck = true;
					if (dimension != 'All') {
						dimCheck = x.dimensions.hasOwnProperty(dimension);
					}

					let posCheck = true;
					if (positive != 'All' && positive == 'Positive') {
						posCheck = x.positive === true;
					}
					else if (positive != 'All' && positive == 'Negative') {
						posCheck = x.positive === false;
					}

					let factorCheck = true;
					if (factor != 'All' && factor == 'Single') {
						factorCheck = Object.keys(x.dimensions).length === 1;
					}
					else if (factor != 'All' && factor == 'Combo') {
						factorCheck = Object.keys(x.dimensions).length > 1;
					}

					if (typeCheck && dimCheck && posCheck && factorCheck) {
						return false;
					}
					else {
						return true;
					}
				})
				.style('display', 'none');
		};

		// Function to remove hidden insights
		const filterBotResult = function(botResult) {
			botResult.insights = botResult.insights.filter(insight => {
				let choice = true;
				for (const criterion of botResult.hiddenInsightsCriteria) {
					if (insight.analysisType == criterion.type &&
						insight.analysisSubType == criterion.subType &&
						JSON.stringify(insight.dimensions) == JSON.stringify(criterion.dimensions)) {
						choice = false;
					}
				}
				return choice;
			});

			return botResult;
		};

		// Function to return formatted date
		const formatDate = function(date) {
			return date.toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' });
		};

		// Function to return spaced en-dash character
		const enDash = function() {
			return ' ' + String.fromCharCode(0x2013) + ' ';
		};

		// Function for bot creation
		let loaded;
		let searchContainer;
		let bots;
		const createBots = function(botList, botResults) {
			loaded = true;
			// Create search box
			searchContainer = mainContent.append('div')
				.attr('id', 'search-container')
				.style('opacity', 0);

			const searchBox = searchContainer.append('div')
				.attr('id', 'search-box');

			searchBox.append('svg')
				.attr('id', 'search-icon')
				.attr('viewBox', '0 0 512 512')
				.attr('preserveAspectRatio', 'xMidYMid meet')
			.append('path')
				.attr('d', 'M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z');

			searchBox.append('input')
				.attr('id', 'search-input')
				.attr('type', 'text')
				.attr('autocomplete', 'off')
				.attr('placeholder', 'Bot name...')
				.on('input', () => {
					const value = d3.select('#search-input').node().value;
					bots.filter(x => !x.name.toLowerCase().includes(value)).style('display', 'none');
					bots.filter(x => x.name.toLowerCase().includes(value)).style('display', null);
				});

			// Join the bot list with results
			for (const [i, bot] of botList.bots.entries()) {
				const newName = designSettings['botName_' + bot.id];
				bot.name = newName;
				botResults[i].name = newName;
				botResults[i].insightsBotResultConfig.name = newName;
				bot.botResult = botResults[i];
			}

			// Create bot divs
			bots = mainContent.selectAll('div.bot')
				.data(botList.bots.filter(x => x.status == 'DONE' && x.hasInsights))
			.join('div')
				.attr('id', d => 'bot-' + d.id)
				.attr('class', 'bot')
				.on('click', async (event, d) => {
					await Promise.all([
						searchContainer.transition().style('opacity', 0).end(),
						bots.transition().style('opacity', 0).end()
					]);

					searchContainer.style('display', 'none');
					bots.style('display', 'none');
					createInsights(d.botResult);
				})
				.style('opacity', 0);

				// Create names and separation lines
				const botName = bots.append('div')
					.attr('class', 'botName');

				botName.append('span')
					.on('mouseenter', (event, d) => { tooltip.style('display', null).text(d.name); })
					.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
					.on('mouseleave', () => { tooltip.style('display', 'none'); })
					.text(d => d.name);

				botName.append('hr');

				// Create metric name labels and trend arrows
				const botMetric = bots.append('div')
					.attr('class', 'metricName');

				botMetric.append('span')
					.attr('class', 'botLabel')
					.text('KPI: ');

				botMetric.append('span')
					.attr('class', 'botDesc')
					.on('mouseenter', (event, d, i, nodes) => { tooltip.style('display', null).text(d3.select(nodes[i]).text()); })
					.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
					.on('mouseleave', () => { tooltip.style('display', 'none'); })
					.text(d => designSettings[d.metricName]);

				botMetric.append('svg')
					.attr('class', 'trendArrow')
					.attr('viewBox', '-0.5 -0.5 11 11')
					.attr('preserveAspectRatio', 'xMidYMid meet')
				.append('path')
					.attr('d', d => {
							switch(d.expectedIncreasingTrend) {
								case true:
									return 'M 0 10 L 10 0 M 5 0 L 10 0 L 10 5';
								case false:
									return 'M 0 0 L 10 10 M 10 5 L 10 10 L 5 10';
							}
						});

				// Create type labels
				const botType = bots.append('div')
					.attr('class', 'botType');

				botType.append('span')
					.attr('class', 'botLabel')
					.text('Types: ');

				botType.append('span')
					.attr('class', 'botDesc')
					.on('mouseenter', (event, d, i, nodes) => { tooltip.style('display', null).text(d3.select(nodes[i]).text()); })
					.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
					.on('mouseleave', () => { tooltip.style('display', 'none'); })
					.text(d => {
						return Array.from(new Set(d.botResult.insights.map(x => {
							return x.analysisType == 'KPI' ? x.analysisType : x.analysisSubType;
						}))).sort((a, b) => sortInsightTypes(a) - sortInsightTypes(b)).map(x => designSettings[x]).join(', ');
					});

				// Create date labels
				const botDates = bots.append('div')
					.attr('class', 'botDates');

				botDates.append('span')
					.attr('class', 'botLabel')
					.text('Dates: ');

				botDates.append('span')
					.attr('class', 'botText')
					.text(d => {
						const startDate = d3.min(d.analysisConfigs, x => new Date(x.date.startDate));
						const endDate = d3.max(d.analysisConfigs, x => new Date(x.date.endDate));
						return formatDate(startDate) + enDash() + formatDate(endDate);
					});

				// Create the notification containers
				bots.append('div')
					.attr('class', 'notifContainer')
				.append('div')
					.attr('class', 'insightNotif')
					.text(d => d.botResult.insights.length + ' Insights');

				// Transition to visible
				loader.transition().style('opacity', 0).end().then(() => loader.remove());
				searchContainer.transition().style('opacity', 1);
				bots.transition().style('opacity', 1);
		};

		// Function for insight creation
		const createInsights = function(botResult) {
			const metricName = botResult.insightsBotResultConfig.metricName;
			const denomMetricName = botResult.insightsBotResultConfig.denominationMetricName;
			const volumeMetricName = botResult.insightsBotResultConfig.magnitudeMetricName;
			const numMetricName = botResult.insightsBotResultConfig.numeratorMetricName;

			if (d3.select('.loader').empty()) {
				loader = mainContent.append('div')
					.attr('class', 'loader')
					.style('opacity', 0);
				loader.transition().style('opacity', 1);
			}

			botResult.insights = botResult.insights.filter(x => {
				if (x.analysisType == 'KPI') {
					return true;
				}
				else if (x.analysisType == 'WIA') {
					if (x.data.numeratorValue === 0
						&& x.comparedData.numeratorValue === 0
						&& x.data.denominatorValue === 0
						&& x.comparedData.denominatorValue === 0) {
						return false;
					}
					else {
						return true;
					}
				}
				else {
					return false;
				}
			});

			botResult.insightsBotResultConfig.analysisConfigs = botResult.insightsBotResultConfig.analysisConfigs.filter(x => {
				return botResult.insights.find(y => y.analysisType == x.analysisType)
					&& botResult.insights.find(y => y.analysisSubType == x.analysisSubType)
			});

			// Function for populating the insights list
				// Create the header
				const insightsHeader = mainView.insert('div', '*')
					.datum(botResult.insightsBotResultConfig)
					.attr('id', 'insightsHeader')
					.style('opacity', 0);

					// Create the exit button
					if (designSettings.botLocked_0 !== true) {
						insightsHeader.append('svg')
							.attr('id', 'headerExit')
							.attr('viewBox', '-3 -3 11 16')
							.attr('preserveAspectRatio', 'xMidYMin meet')
							.on('click', async () => {
								await Promise.all([
									insightsHeader.transition().style('opacity', 0).end(),
									insightsNote.transition().style('opacity', 0).end(),
									insights.transition().style('opacity', 0).end()
								]);

								insightsHeader.remove();
								insightsNote.remove();
								insights.remove();

								document.body.scrollTop = 0;

								if (loaded === true) {
									searchContainer.style('display', null)
										.transition().style('opacity', 1);
									searchContainer.select('input').node().value = null;
									bots.style('display', null)
										.transition().style('opacity', 1);
								}
								else {
									loader = mainView.append('div')
										.attr('class', 'loader')
										.style('opacity', 0);
									loader.transition().style('opacity', 1);
									botResults = await Promise.all(botList.bots.map(x => utils.getBotResults(x.id)));
									loader.transition().style('opacity', 0).end().then(() => loader.remove());
									createBots(botList, botResults);
								}
							})
							.append('path')
								.attr('d', 'M 5 0 L 0 5 L 5 10');
					}

					// Create the containers for the rest of the header
					const headerRows = insightsHeader.append('div')
						.attr('id', 'headerRowsContainer');

					const headerRow1 = headerRows.append('div')
						.attr('id', 'headerRow1');

					const headerRow2 = headerRows.append('div')
						.attr('id', 'headerRow2');

					// Create the header name
					const headerName = headerRow1.append('div')
						.attr('id', 'headerName');

					headerName.append('span')
						.text(d => d.name);

					headerName.append('svg')
						.attr('class', 'trendArrow')
						.attr('viewBox', '-0.5 -0.5 11 11')
						.attr('preserveAspectRatio', 'xMidYMid meet')
					.append('path')
						.attr('d', d => {
							switch(d.expectIncreasingTrend) {
								case true:
									return 'M 0 10 L 10 0 M 5 0 L 10 0 L 10 5';
								case false:
									return 'M 0 0 L 10 10 M 10 5 L 10 10 L 5 10';
							}
						});

					// Create the header type filter
					const headerTypeFilter = headerRow1.append('div')
						.attr('class', 'headerFilter');

					headerTypeFilter.append('label')
						.attr('for', 'selectType')
						.text('Insight Type: ');

					headerTypeFilter.append('select')
						.attr('id', 'selectType')
						.on('change', filterInsightsList)
						.selectAll('option')
						.data(d => ['All'].concat(d.analysisConfigs.map(x => {
							return x.analysisType == 'KPI' ? x.analysisType : x.analysisSubType
						}).sort((a, b) => sortInsightTypes(a) - sortInsightTypes(b))))
					.join('option')
						.attr('value', d => d)
						.text(d => d == 'All' ? d : designSettings[d]);

					// Create the header dimension filter
					const headerDimFilter = headerRow1.append('div')
						.attr('class', 'headerFilter');

					headerDimFilter.append('label')
						.attr('for', 'selectDimensions')
						.text('Dimensions: ');

					headerDimFilter.append('select')
						.attr('id', 'selectDimensions')
						.on('change', filterInsightsList)
						.selectAll('option')
						.data(() => ['All'].concat(Array.from(new Set(botResult.insights.map(x => Object.keys(x.dimensions)).flat())).sort()))
					.join('option')
						.attr('value', d => d)
						.text(d => d == 'All' ? d : designSettings[d]);

					// Create the header positive/negative filter
					const headerPosFilter = headerRow1.append('div')
						.attr('class', 'headerFilter');

					headerPosFilter.append('label')
						.attr('for', 'selectPos')
						.text('Positive/Negative: ');

					headerPosFilter.append('select')
						.attr('id', 'selectPos')
						.on('change', filterInsightsList)
						.selectAll('option')
						.data(['All', 'Positive', 'Negative'])
					.join('option')
						.attr('value', d => d)
						.text(d => d);

					// Create the header factor filter
					const headerFactorFilter = headerRow1.append('div')
						.attr('class', 'headerFilter');

					headerFactorFilter.append('label')
						.attr('for', 'selectFactor')
						.text('Factor: ');

					headerFactorFilter.append('select')
						.attr('id', 'selectFactor')
						.on('change', filterInsightsList)
						.selectAll('option')
						.data(['All', 'Single', 'Combo'])
					.join('option')
						.attr('value', d => d)
						.text(d => d);

					// Create the header insight types overview
					const typeOverview = headerRow2.selectAll('div')
						.data(d => {
							return d.analysisConfigs.map(x => {
								if (x.analysisType == 'KPI') {
									return {
										'name': x.analysisType,
										'total': botResult.insights.find(y => y.analysisType == x.analysisType).data.totals.value,
										'startDate': new Date(x.date.startDate),
										'endDate': new Date(x.date.endDate)
									}
								}
								else if (x.analysisType == 'WIA') {
									return {
										'name': x.analysisSubType,
										'currentTotal': botResult.insights.find(y => y.analysisSubType == x.analysisSubType).data.totals.value,
										'comparedTotal': botResult.insights.find(y => y.analysisSubType == x.analysisSubType).comparedData.totals.value,
										'currentStartDate': new Date(x.date.startDate),
										'currentEndDate': new Date(x.date.endDate),
										'comparedStartDate': new Date(x.comparisonDate.startDate),
										'comparedEndDate': new Date(x.comparisonDate.endDate)
									}
								}
							}).sort((a, b) => sortInsightTypes(a.name) - sortInsightTypes(b.name));
						})
					.join('div')
						.attr('class', 'typeOverview');

					typeOverview.append('div')
						.attr('class', 'typeTitle')
						.text(d => designSettings[d.name] + ' Insights');

					const typeOverviewDetail_1 = typeOverview.append('div')
						.attr('class', 'typeDetail');

					typeOverviewDetail_1.append('span')
						.attr('class', 'typeText')
						.text(d => {
							if (d.name == 'KPI') {
								return formatDate(d.startDate) + enDash() + formatDate(d.endDate);
							}
							else {
								return formatDate(d.comparedStartDate) + enDash() + formatDate(d.comparedEndDate);
							}
						});

					typeOverviewDetail_1.filter(x => x.name != 'KPI').append('div')
						.attr('class', 'headerBar')
						.style('background-color', designSettings.backgroundDimension)
						.style('color', designSettings.backgroundText)
						.style('width', d => d.comparedTotal / d3.max([d.currentTotal, d.comparedTotal]) * 100 + 'px')
						.text(d => designSettings[metricName + '_format'] !== 0 ? d3.format(designSettings[metricName + '_format'])(d.comparedTotal) : null)
						.each(async (d, i, nodes) => {
							if (designSettings[metricName + '_format'] === 0) {
								const formattedValue = await utils.getFormattedValue(metricName, d.comparedTotal);
								d3.select(nodes[i]).text(formattedValue);
							}
						});

					const typeOverviewDetail_2 = typeOverview.append('div')
						.attr('class', 'typeDetail');

					typeOverviewDetail_2.append('span')
						.attr('class', 'typeText')
						.text(d => {
							if (d.name == 'KPI' && designSettings[metricName + '_format'] !== 0) {
								return 'Overall ' + designSettings[metricName] + ' is ' + d3.format(designSettings[metricName + '_format'])(d.total);
							}
							else if (d.name != 'KPI') {
								return formatDate(d.currentStartDate) + enDash() + formatDate(d.currentEndDate);
							}
						})
						.each(async (d, i, nodes) => {
							if (d.name == 'KPI' && designSettings[metricName + '_format'] === 0) {
								const formattedValue = await utils.getFormattedValue(metricName, d.total);
								d3.select(nodes[i]).text('Overall ' + designSettings[metricName] + ' is ' + formattedValue);
							}
						});

					typeOverviewDetail_2.filter(x => x.name != 'KPI').append('div')
						.attr('class', 'headerBar')
						.style('background-color', designSettings.foregroundDimension)
						.style('color', designSettings.foregroundTextContrast)
						.style('width', d => d.currentTotal / d3.max([d.currentTotal, d.comparedTotal]) * 100 + 'px')
						.text(d => designSettings[metricName + '_format'] !== 0 ? d3.format(designSettings[metricName + '_format'])(d.currentTotal) : null)
						.each(async (d, i, nodes) => {
							if (designSettings[metricName + '_format'] === 0) {
								const formattedValue = await utils.getFormattedValue(metricName, d.currentTotal);
								d3.select(nodes[i]).text(formattedValue);
							}
						});

				// Header creation done - make it visible!
				if (designSettings[metricName + '_format'] !== 0) {
					insightsHeader.transition().style('opacity', 0.975);
				}
				else {
					setTimeout(() => {
						insightsHeader.transition().style('opacity', 0.975);
					}, 1500);
				}

				// Create the insights
				const insightsNote = mainContent.append('span')
					.attr('id', 'insightsNote')
					.style('opacity', 0)
					.text('Insights are numbered by significance.');

				const insights = mainContent.selectAll('div.insight')
					.data(botResult.insights)
				.join('div')
					.attr('class', d => 'insight ' + d.analysisType.toLowerCase())
					.style('opacity', 0);

					// Create the title
					insights.append('div')
						.attr('class', 'insightTitle')
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
						.attr('class', (d, i) => ['insightLabel', 'insightName'][i])
						.text(d => designSettings[d] ?? d);

					// Create the insight number label
					insights.append('div')
						.attr('class', 'insightNum')
						.text((d, i) => i + 1);

					// Create the insight text summaruy
					const insightSummary = insights.append('div')
						.attr('class', 'insightSummary');

						// Create the thumb
						insightSummary.append('svg')
							.attr('class', d => 'thumb ' + (d.positive === true ? 'positive' : 'negative') )
							.attr('viewBox', '0 0 32 32')
							.attr('preserveAspectRatio', 'xMidYMid meet')
							.attr('transform', d => d.positive === true ? 'scale(1, 1)' : 'scale(1, -1)')
							.attr('transform-origin', 'center center')
						.append('path')
							.attr('d', 'M2.463 32c-1.342 0-2.463-1.121-2.463-2.463v-17.23c0-1.342 1.121-2.461 2.463-2.461h3.696c.911 0 1.709.523 2.134 1.274.831-.509 1.647-.807 2.172-1.11 1.238-.715 1.867-2.727 2.16-4.823.147-1.048.225-2.055.353-2.896.064-.42.128-.793.3-1.199.086-.203.2-.426.437-.654s.654-.437 1.053-.437c1.825 0 3.321.713 4.278 1.807s1.403 2.464 1.644 3.826c.392 2.223.244 4.104.168 5.448h7.442c2.024 0 3.698 1.665 3.698 3.689 0 .718-.204 1.258-.464 2.098s-.613 1.851-1 2.934c-.774 2.167-1.695 4.624-2.297 6.431-.24.722-.553 1.479-1.117 2.134s-1.474 1.17-2.506 1.17h-14.77c-.431 0-.84-.089-1.226-.228v.228c0 1.342-1.119 2.463-2.461 2.463h-3.696zM2.463 29.537h3.696v-17.23h-3.696v17.23zM9.846 27.076h14.77c.33 0 .426-.065.644-.317s.456-.738.646-1.31c.628-1.884 1.55-4.335 2.314-6.474.382-1.07.724-2.061.964-2.836s.356-1.472.356-1.37c0-.703-.535-1.226-1.238-1.226h-8.719c-.683.003-1.238-.554-1.235-1.238 0-1.454.316-4.049-.072-6.248-.194-1.099-.558-2.026-1.081-2.624-.387-.443-.934-.792-1.759-.925-.124.702-.208 1.899-.366 3.023-.321 2.293-.925 5.194-3.379 6.611-.913.527-1.797.834-2.326 1.199s-.745.561-.745 1.427v11.071c0 .703.523 1.235 1.226 1.235h0z');

						// Create the text
						insightSummary.append('span')
							.attr('class', d => { return 'explanation ' + { 'true': 'positive', 'false': 'negative' }[d.positive]; })
							.text(d => {
								switch(d.analysisType) {
									case 'KPI':
										return (d.positive === true ? 'Over-performing' : 'Under-performing') + ' segment';
									case 'WIA':
										return d.positive === true
											? 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'higher' : 'lower') + ' overall ' + designSettings[metricName]
											: 'Contributed to ' + (botResult.insightsBotResultConfig.expectIncreasingTrend === true ? 'lower' : 'higher') + ' overall ' + designSettings[metricName];
								}
							});

						// Create the analysis sub type text for change-driver insights
						insightSummary.filter(x => x.analysisType == 'WIA').append('span')
							.attr('class', 'dateRange')
							.on('mouseenter', (event, d) => {
								const config = botResult.insightsBotResultConfig.analysisConfigs.find(x => x.analysisSubType == d.analysisSubType);
								const compareStart = formatDate(new Date(config.comparisonDate.startDate));
								const compareEnd = formatDate(new Date(config.comparisonDate.endDate));
								const thisStart = formatDate(new Date(config.date.startDate));
								const thisEnd = formatDate(new Date(config.date.endDate));
								
								tooltip.style('display', null)
									.text(compareStart + enDash() + compareEnd + ' vs. ' + thisStart + enDash() + thisEnd);
							})
							.on('mousemove', event => { tooltip.style('top', event.clientY + 'px').style('left', event.clientX + 'px'); })
							.on('mouseleave', () => { tooltip.style('display', 'none'); })
							.text(d => designSettings[d.analysisSubType]);

					// Create the insight visualisation elements
					const insightViz = insights.append('div')
						.attr('class', 'vizContainer');

						// Create the visualisations, starting with performance insights
						const kpiViz = insightViz.filter(x => x.analysisType == 'KPI').selectAll('div')
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
							.attr('class', 'kpiViz');

							// Create the judgment text
							const kpiVizDesc = kpiViz.append('div')
								.attr('class', 'kpiVizDesc');

							kpiVizDesc.append('span')
								.attr('class', 'metricName')
								.text(d => designSettings[d.metricName]);
							
							kpiVizDesc.append('span')
								.attr('class', 'metricDesc')
								.text((d, i) => {
									switch(i) {
										case 0:
											return ' is ' + d3.format(designSettings.percent_format)(d.summaryValue) + (d.thisValue > d.totalValue ? ' above' : ' below') + ' average.';
										case 1:
											return ' is ' + d3.format(designSettings.percent_format)(d.summaryValue) + ' of total.';
									}
								});

							// Create the bars visualisations
							const kpiVizBars = insightViz.selectAll('.kpiViz:first-child').append('svg')
								.attr('class', 'kpiVizBars')
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
							const kpiVizPie = insightViz.selectAll('.kpiViz:nth-child(2)').append('svg')
								.attr('class', 'kpiVizPie')
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

						// Create the visualisations for change-driver insights
							// Create the division sections
								const wiaDivisions = insightViz.filter(x => x.analysisType == 'WIA').selectAll('div')
									.data(d => { return [
										{ 'name': numMetricName,
											'current': d.data.numeratorValue,
											'currentTotal': d.data.totals.numeratorValue,
											'compare': d.comparedData.numeratorValue,
											'compareTotal': d.comparedData.totals.numeratorValue },
										{ 'name': denomMetricName,
											'current': d.data.denominatorValue,
											'currentTotal': d.data.totals.denominatorValue,
											'compare': d.comparedData.denominatorValue,
											'compareTotal': d.comparedData.totals.denominatorValue }
									]; })
								.join('div')
									.attr('class', 'wiaDivisions');

								// Create the judgment text
								const wiaDivisionsVizDesc = wiaDivisions.append('div')
									.attr('class', 'wiaVizDesc');

								const wiaDivisionsNewSegments = wiaDivisionsVizDesc.filter(d => d.current === 0 || d.compare === 0);

								wiaDivisionsNewSegments.append('span')
									.attr('class', 'metricName')
									.text(d => designSettings[d.name]);

								wiaDivisionsNewSegments.append('span')
									.attr('class', 'metricDesc')
									.text(d => (d.current === 0 ? ' stopped' : ' started') + ' delivering.');

								const wiaDivisionsOtherSegments = wiaDivisionsVizDesc.filter(x => x.current !== 0 && x.compare !== 0);

								wiaDivisionsOtherSegments.append('span')
									.attr('class', 'metricName')
									.text(d => designSettings[d.name]);

								wiaDivisionsOtherSegments.append('span')
									.attr('class', 'metricDesc')
									.text(d => (d.current > d.compare ? ' increased' : ' decreased') + ' by ' + d3.format(designSettings.percent_format)((d.current - d.compare) / d.compare) + '.');

								// Create the change visualisations
								wiaDivisionsViz = wiaDivisions.append('svg')
									.attr('class', 'wiaViz')
									.datum(d => {
										var max = d3.max([d.compareTotal, d.currentTotal]);
										return [
											{ 'name': d.name, 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.compareTotal, 'max': max, 'textShift': 0 },
											{ 'name': d.name, 'barColor': designSettings.foregroundDimension, 'textColor': d.compareTotal / max - d.compare / max < 0.2 ? designSettings.foregroundTextContrast : designSettings.foregroundText, 'value': d.compare, 'max': max, 'textShift': d.compareTotal / max - d.compare / max < 0.2 ? 20 : 0 },
											{ 'name': d.name, 'barColor': designSettings.backgroundDimension, 'textColor': designSettings.backgroundText, 'value': d.currentTotal, 'max': max, 'textShift': 0 },
											{ 'name': d.name, 'barColor': designSettings.foregroundDimension, 'textColor': d.currentTotal / max - d.current / max < 0.2 ? designSettings.foregroundTextContrast : designSettings.foregroundText, 'value': d.current, 'max': max, 'textShift': d.currentTotal / max - d.current / max < 0.2 ? 20 : 0 }
										];
									});

								wiaDivisionsViz.selectAll('rect')
									.data(d => d)
								.join('rect')
									.attr('fill', d => d.barColor)
									.attr('x', (d, i) => ['0%', '0%', '60%', '60%'][i])
									.attr('y', d => (1 - d.value / d.max) * 100 * 0.8 + 20 + '%')
									.attr('width', '40%')
									.attr('height', d => d.value / d.max * 100 * 0.8 + '%');

								wiaDivisionsViz.selectAll('text')
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
											d3.select(nodes[i]).text(formattedValue);
										}
									});

								wiaDivisionsViz.append('text')
									.attr('class', 'arrowText')
									.attr('text-anchor', 'middle')
									.attr('x', '50%')
									.attr('y', '60%')
									.text(String.fromCharCode(0x25ba));

							// Create the result section
							const wiaResult = insightViz.filter(x => x.analysisType == 'WIA').append('div')
								.attr('class', 'wiaResult');

								// Create the judgment text
								const wiaResultVizDesc = wiaResult.append('div')
									.attr('class', 'wiaVizDesc');

								const wiaResultNewSegments = wiaResultVizDesc.filter(x => x.comparedData.value === 0 || x.data.value === 0);

								wiaResultNewSegments.append('span')
									.attr('class', 'metricDesc')
									.text('Segment ');

								wiaResultNewSegments.append('span')
									.attr('class', 'metricName')
									.text(d => d.comparedData.value === 0 ? 'is new' : 'stopped');

								wiaResultNewSegments.append('span')
									.attr('class', 'metricDesc')
									.text(d => ' and is performing ' + (d.positive ? 'well.' : 'badly.'));

								const wiaResultOtherSegments = wiaResultVizDesc.filter(x => x.comparedData.value !== 0 && x.data.value !== 0);

								wiaResultOtherSegments.append('span')
									.attr('class', 'metricName')
									.text(d => designSettings[metricName]);

								wiaResultOtherSegments.append('span')
									.attr('class', 'metricDesc')
									.text(d => ((d.data.value > d.comparedData.value) ? ' increased': ' decreased') + ' by ' + d3.format(designSettings.percent_format)((d.data.value - d.comparedData.value) / d.comparedData.value) + '.');

								// Create the result visualisation
								const wiaResultViz = wiaResult.append('svg')
									.attr('class', 'wiaViz')
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
									.attr('class', 'arrowText')
									.attr('text-anchor', 'middle')
									.attr('x', '50%')
									.attr('y', '60%')
									.text(String.fromCharCode(0x25ba));

				// Insights creation done - make them visible!
				if (designSettings[metricName + '_format'] !== 0
					&& designSettings[denomMetricName + '_format'] !== 0
					&&  designSettings[numMetricName + '_format'] !== 0) {
					loader.transition().style('opacity', 0)
						.end().then(() => loader.remove());
					insightsNote.transition().style('opacity', 1);
					insights.transition().style('opacity', 1);
				}
				else {
					setTimeout(() => {
						loader.transition().style('opacity', 0)
							.end().then(() => loader.remove());
						insightsNote.transition().style('opacity', 1);
						insights.transition().style('opacity', 1);
					}, 1500);
				}
		};

		// Create the document structure
		const emiTitle = d3.select('#__da-app-content').append('div')
			.attr('id', 'emiTitle');

		emiTitle.append('svg')
			.attr('id', 'logo')
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

		const emiTitleName = emiTitle.append('span')
			.style('opacity', 0);

		const mainView = d3.select('#__da-app-content').append('div')
			.attr('id', 'mainView');

		const mainContent = mainView.append('div')
			.attr('id', 'mainContent');

		let loader = mainContent.append('div')
			.attr('class', 'loader')
			.style('opacity', 1);

		const tooltip = d3.select('#__da-app-content').append('div')
			.attr('id', 'tooltip')
			.style('position', 'absolute')
			.style('display', 'none');

		// Get the bot list, then set options according to the data
		const botList = await utils.getBotList();
		botList.bots = botList.bots.filter(bot => bot.status != 'NO_DATA' && bot.analysisConfigs !== null);
		
			// Handle possible errors
			if (botList.bots.length === 0) {
				const errorMessage = utils.errorMessageTemplate();

				errorMessage.title.text('Einstein Marketing Insights Explorer');
				errorMessage.heading.text('No Bots');
				errorMessage.message.text('To populate this widget with data, go to Analyze & Act and set up your first Einstein Marketing Insights bot.');

				throw new Error('No bots with which to create a visualisation.');
			}

		botList.bots.sort((a, b) => a.name.localeCompare(b.name));

		let options = [
			{ 'type': 'title',
				'displayName': 'Explorer Configuration' },
			{ 'type': 'input',
				'id': 'titleName',
				'displayName': 'Explorer Title',
				'defaultValue': 'Einstein Marketing Insights',
				'description': 'Replaces the name after the EMI logo.' },
			{ 'type': 'select',
				'id': 'initialView',
				'displayName': 'Initial View',
				'options': [{ 'id': 'botSelect', 'label': 'Bot Selection'}].concat(botList.bots.map(x => { return { 'id': x.id, 'label': 'Insights for ' + x.name + ' (ID ' + x.id + ')' }; })),
				'defaultValue': 'botSelect' },
			{ 'type': 'checkbox',
			  'id': 'botLocked',
			  'displayName': 'Lock to this Bot',
			  'description': 'If checked, there will be no back button in the insights list, which would allow users to return to bot selection.',
			  'options': [{ 'id': 0, 'label': 'Locked', 'defaultValue': false }] },
			{ 'type': 'checkbox',
			  'id': 'botRestriction',
			  'displayName': 'Bots to Display',
			  'options': botList.bots.map(x => { return { 'id': x.id, 'label': x.name + ' (ID ' + x.id + ')', 'defaultValue': true }; }),
			  'description': 'In the bot selection menu, show only bots that are checked in this list. Use this to hide bots that are irrelevant to this use case.' },
			{ 'type': 'separator' },
			{ 'type': 'input',
				'id': 'insightsLimit',
				'displayName': 'Maximum Insights to Show',
				'defaultValue': '',
				'description': 'Limits the number of insights shown in the list.' },
			{ 'type': 'title',
			  'displayName': 'Visualisation Colours' },
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

		// Get the settings and apply them
		let designSettings = await utils.getDesignSettings();

			// Replace title with settings
			emiTitleName.text(designSettings.titleName)
				.transition().style('opacity', 1);

			// Filter botList to only those shown, and edit initialView accordingly (as long as not all have been removed)
			if (Object.entries(designSettings).filter(x => x[0].startsWith('botRestriction') && x[1] === true).length > 0) {
				botList.bots = botList.bots.filter(x => designSettings['botRestriction_' + x.id]);
				const initialViewIndex = options.map(x => x.id).indexOf('initialView');
				options[initialViewIndex].options = [{ 'id': 'botSelect', 'label': 'Bot Selection'}].concat(botList.bots.map(x => { return { 'id': x.id, 'label': 'Insights for ' + x.name + ' (ID ' + x.id + ')' }; }));
			}

			// Delete 'botLocked' if initial view is set to 'Bot Selection'
			if (designSettings.initialView == 'botSelect') {
				const botLockedIndex = options.findIndex(x => x.id == 'botLocked');
				options.splice(botLockedIndex, 1);
			}

		// Get bot results
		let botResults;
		if (designSettings.botLocked_0 !== true || designSettings.initialView == 'botSelect') {
			botResults = await Promise.all(botList.bots.map(x => utils.getBotResults(x.id)));
		}
		else {
			botResults = await Promise.all([utils.getBotResults(designSettings.initialView)]);
		}

		for (let botResult of botResults) {
			botResult = filterBotResult(botResult); // Remove hidden insights
			if (parseInt(designSettings.insightsLimit) > 0) { // Validate input
				botResult.insights = botResult.insights.slice(0, parseInt(designSettings.insightsLimit));
			}
		}

		// Get the details for all fields
		const fields = await Promise.all(
			Array.from(new Set(
				botResults.map(x => [x.insightsBotResultConfig.metricName, x.insightsBotResultConfig.numeratorMetricName, x.insightsBotResultConfig.denominationMetricName]).flat()
			)).sort().concat(
			Array.from(new Set(
				botResults.map(x => x.insights.map(x => Object.keys(x.dimensions)).flat()).flat()
			)).sort()).map(x => {
				return utils.getFieldDetails(x);
			})
		);

		// Set the display name and locale options
		options = options.concat([
			{ 'type': 'separator' },
			{ 'type': 'title',
			  'displayName': 'Text Replacement' }
		]).concat(
			botList.bots.map(x => {
				return {
					'type': 'input',
					'id': 'botName_' + x.id,
					'displayName': 'Bot name ' + x.name,
					'defaultValue': x.name,
					'description': 'Enter the value with which to replace bot name ' + x.name + '.'
				}
			})
		).concat(
			Array.from(new Set(
				botResults.map(x => {
					return x.insightsBotResultConfig.analysisConfigs.map(x => {
						return x.analysisType == 'KPI' ? x.analysisType : x.analysisSubType
					})
				}).flat()
			)).sort((a, b) => sortInsightTypes(a) - sortInsightTypes(b)).map(x => {
				return {
					'type': 'input',
					'id': x,
					'displayName': x,
					'defaultValue': x == 'KPI' ? 'Performance' : x.split('_').map(x => x[0].toUpperCase() + x.substr(1).toLowerCase()).join(' '),
					'description': 'Enter the value with which to replace ' + x + '.'
				}
			})
		).concat(
			fields.map(x => {
				return {
					'type': 'input',
					'id': x.systemName,
					'displayName': x.systemName,
					'defaultValue': x.name,
					'description': 'Enter the value with which to replace ' + x.systemName + '. Default name: ' + x.name + '.'
				}
			})
		).concat(
			{ 'type': 'separator' },
			{ 'type': 'title',
				'displayName': 'Metric Formatting' },
			{ 'type': 'input',
				'id': 'localeDecimal',
				'displayName': 'Decimal point for your locale',
				'defaultValue': d3.format(',.1f')(0.1).substr(1, 1) }, // Handles legacy prefs
			{ 'type': 'input',
				'id': 'localeThousands',
				'displayName': 'Thousands separator for your locale',
				'defaultValue': d3.format(',.0f')(1000).substr(1, 1) }, // Handles legacy prefs
			{ 'type': 'input',
				'id': 'localeCurrencyPrefix',
				'displayName': 'Currency prefix for your locale',
				'defaultValue': d3.format('$,.0f')(1).substr(0, 1) }, // Handles legacy prefs
			{ 'type': 'input',
				'id': 'localeCurrencySuffix',
				'displayName': 'Currency suffix for your locale',
				'defaultValue': '' }
		);

		utils.setDesignOptions(options);

		// Get the locale settings, then set finally set measurement format options
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
			Array.from(new Set(
				botResults.map(x => [x.insightsBotResultConfig.metricName, x.insightsBotResultConfig.numeratorMetricName, x.insightsBotResultConfig.denominationMetricName]).flat()
			)).sort().map(metric => {
				return {
					'type': 'select',
					'id': metric + '_format',
					'displayName': designSettings[metric] + ' format',
					'options': utils.metricFormatOptions(d3.mean(
						botResults.map(x => {
							if (metric == x.insightsBotResultConfig.metricName) {
								return x.insights.map(x => x.data.value);
							}
							else if (metric == x.insightsBotResultConfig.numeratorMetricName) {
								return x.insights.map(x => x.data.numeratorValue);
							}
							else if (metric == x.insightsBotResultConfig.denominationMetricName) {
								return x.insights.map(x => x.data.denominatorValue);
							}
						}).flat()
					)),
					'defaultValue': 0
				}
			})
		);

		utils.setDesignOptions(options);

		// Get the final settings, then load
		designSettings = await utils.getDesignSettings();

		if (designSettings.initialView == 'botSelect') {
			createBots(botList, botResults);
		}
		else {
			selectedBotIndex = botList.bots.map(x => x.id).indexOf(designSettings.initialView);
			createInsights(botResults[selectedBotIndex]);
		}
	}
};