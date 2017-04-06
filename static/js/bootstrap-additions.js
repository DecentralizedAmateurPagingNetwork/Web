$().ready(function() {
	$('.nav a').click(function() {
		if ($(this).closest("li").children("ul").length === 0) {
			$('.navbar-collapse').collapse('hide');
		}
	});
});
