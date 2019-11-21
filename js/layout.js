layouts['preview'] = 'getPreviewLayout';

function getPreviewLayout(id, preview, size) {
	var previewLayout = '';
	previewLayout += '<div class="col-lg-'+size+'">';
	previewLayout += '	<div class="row">';
	previewLayout += '		<div class="col-lg-3">';
	previewLayout += '			<img class="" src="' + preview.cover + '">';
	previewLayout += '		</div>';
	previewLayout += '		<div class="col-lg-9 card">';
	previewLayout += '			<div class="card-body">';
	name =           '			<h4 class="card-title mb-3">' + preview.name + '</h4>';
	if(preview.detail) {
	previewLayout += '			<a href="../' + app + '/' + referer + '?wd=' + preview.detail + '">' + name + '</a>';
	} else {
	previewLayout += name;
	}
	previewLayout += '				<p class="card-text">' + preview.desc + '</p>';
	previewLayout += '			</div>';
	previewLayout += '		</div>';
	previewLayout += '	</div>';
	previewLayout += '</div>';
	return previewLayout;	
}