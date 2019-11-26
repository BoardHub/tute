var spreadSheetUrl = 'https://docs.google.com/spreadsheets/d/1Zh3P1Fwk8HpyLPxrmDkC-AdeT90GLB3f2fA3jCm8IIA/edit#gid=0';

function fetchData() {
	getSheetData(spreadSheetUrl, 1, function(result) {
		sections = convertRowsToObj(result.data);

		getSheetData(spreadSheetUrl, 2, function(result) {
			charts = widgets = convertRowsToObj(result.data);

			onDataLoaded();
		});
	});
}

fetchData();
