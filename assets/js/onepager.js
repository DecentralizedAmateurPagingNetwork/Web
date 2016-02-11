var config;
var isAdmin = false;
var map, layer, markers;
var mapInited = false;

/* ############################
*  # INITIALIZATION-PROCEDURE #
*  ############################ */
$(document).ready(function() {
	// Load Config-file
	$.getJSON('./config.json', function(data) {
		config = data;
	});

	// Language
	jQuery.i18n.properties({
		name: 'Translation',
		path: './assets/langs/',
		mode: 'both',
		cache: true,
		checkAvailableLanguages: true,
		async: true,
		callback: function() {
			// Translate all DOM-elements with "data-i18n"-attribute
			$("[data-i18n]").each(function () {
				var prop = $(this).data('i18n');
				$(this).text($.i18n.prop(prop));
			});

			initPage();
		}
	});
});

// Init necessary features and prepare functions
function initPage() {
	// Login and open Container
	loginWithCookie();
	openContainer(window.location.hash.substring(1));

	// DataTable and Chosen
	$('.dataTable').DataTable();
	$(".chosen-select").chosen({
		no_results_text: jQuery.i18n.prop('select_no_entries'),
		placeholder_text_multiple: " ",
		placeholder_text_single: " ",
		width: "100%"
	});

	// Login on Enter-Keypress
	$('#loginUsername').keypress(function (e) { if (e.which == 13) loginWithForm(); });
	$('#loginPassword').keypress(function (e) { if (e.which == 13) loginWithForm(); });

	// container6-detail Character-Count
	updateCharCount();
	$('#formEditCallText').on('input', function() { updateCharCount(); });

	// Remove Splash-Screen
	$('#splashscreen').fadeOut(500);
}

// Switch between languages
function changeLanguage(lang) {
	jQuery.i18n.properties({
		name: 'Translation',
		path: './assets/langs/',
		language: lang,
		mode: 'both',
		cache: true,
		checkAvailableLanguages: false,
		async: true,
		callback: function() {
			// Translate all DOM-elements with "data-i18n"-attribute
			$("[data-i18n]").each(function () {
				var prop = $(this).data('i18n');
				$(this).text($.i18n.prop(prop));
			});

			// Adapt window-title
			document.title = $("#container" + currentlyOpenContainer + " h1:first").text() + " - " + "DAPNET";
		}
	});
}

/* ###########################
*  # MANAGE LOGIN AND LOGOUT #
*  ########################### */

// Login using Cookie
function loginWithCookie() {
	var authData = Cookies.get("auth");
	if (authData !== undefined && authData.username !== "") {
		loginSuccess(b64_to_utf8(authData).split(":")[0]);
	}
}

// Login using Form
function loginWithForm() {
	var username = $("#loginUsername").val();
	var password = $("#loginPassword").val();
	if (username !== "" && password !== "") {
		// Test login-credentials
		$.ajax({
			url: config.apiUrl + '/users/' + username,
			type: 'GET',
			contentType: 'application/json',
			dataType: "json",
			beforeSend: function(req) {
				req.setRequestHeader('Authorization', 'Basic ' + utf8_to_b64(username + ":" + password));
			},
			success: function(data) {
				Cookies.set("auth", utf8_to_b64(username + ":" + password), { expires: 14 });
				loginWithCookie();

				$("#modalLogin").modal("toggle");
				$("#loginUsername").val("");
				$("#loginPassword").val("");
			},
			error: function(err) {
				$("#modalLoginAlert").show();
			}
		});
	} else {
		$("#modalLoginAlert").show();
	}
}

// Login was successfull
function loginSuccess(username) {
	// check privileges
	$.ajax({
		url: config.apiUrl + '/users/' + username,
		type: 'GET',
		contentType: 'application/json',
		dataType: "json",
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			if (data.admin) {
				isAdmin = true;
			} else {
				$('ul.navbar-nav li a[href="#3"]').parent().hide();
				$('#rubrics-add-rubric').hide();
				$('#nodes-add-node').hide();
			}

			$("#navbar-main-nav").show();
			$("#homeStats").show();
			$("#loggedin").text(username).css("display", "block");
			$("#loggedin").click(function() { editUser(username); });
			$("#btnLogin").hide();
			$("#btnLogout").css("display", "block");

			loadData();
		},
		error: function(err) {
			return;
		}
	});
}

// Logout
function logout() {
	Cookies.remove("auth");
	showSuccessReloadAlert();
}


/* #################
*  # UI-MANAGEMENT #
*  ################# */

// Switch between Containers
var currentlyOpenContainer = 1;
function openContainer(id) {
	if (id === "" || id < 1 || id > 13) {
		openContainer(1);
		return;
	}

	$("#container" + currentlyOpenContainer).hide();
	$("#container" + id).show();
	document.title = $("#container" + id + " h1:first").text() + " - " + "DAPNET";
	currentlyOpenContainer = id;

	$("table").css("width", "100%");

	// Init Map on map-tab-open
	if (id == 13 && !mapInited) {
		layer = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
		});
		map = L.map('map').setView([50.776, 6.070], 16).addLayer(layer);
		mapInited = true;

		if (markers !== undefined) map.addLayer(markers);
	}
}

// Add a new Call
function addCall() {
	$("#container2-overview").hide();
	$("#container2-detail").show();
}

// Close the Call-Details-Panel and reopen the Overview
function returnFromCallDetails() {
	$("#container2-detail").hide();
	$("#container2-overview").show();

	$('#formEditCallText').val("");
	unselectEverything('#formEditCallCallsign');
	unselectEverything('#formEditCallTransmitterGroup');
	$('#formEditCallEmergency').prop('checked', false);
}

// Add a new News
function addNews() {
	$("#container3-overview").hide();
	$("#container3-detail").show();
}

// Close the News-Details-Panel and reopen the Overview
function returnFromNewsDetails() {
	$("#container3-detail").hide();
	$("#container3-overview").show();

	$('#formEditNewsText').val("");
	$('#formEditNewsNumber').val("");
	unselectEverything('#formEditNewsRubric');
}

// Add a new CallSign
function addCallSign() {
	$("#container4-overview").hide();
	$("#container4-detail").show();
	$('#formEditCallSignName').prop('disabled', false);
}

// Edit a CallSign
var editCallSignName = "";
function editCallSign(name) {
	if (name === "" || name === null) return;
	editCallSignName = name;
	$('#formEditCallSignName').prop('disabled', true);

	$.ajax({
		url: config.apiUrl + '/callsigns/' + editCallSignName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditCallSignName').val(editCallSignName);
			$('#formEditCallSignDescription').val(data.description);
			var pagerNumbers = "";
			var pagerNames = "";
			$.each(data.pagers, function(index, value) {
				pagerNumbers += value.number;
				pagerNames += value.name;

				if (index < data.pagers.length - 1) {
					pagerNumbers += "\n";
					pagerNames += "\n";
				}
			});
			$('#formEditCallSignsPagersNumber').val(pagerNumbers);
			$('#formEditCallSignsPagersName').val(pagerNames);
			$("#formEditCallSignOwners option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditCallSignOwners").trigger("chosen:updated");

			$("#container4-overview").hide();
			$("#container4-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the CallSign-Details-Panel and reopen the Overview
function returnFromCallSignDetails() {
	editCallSignName = "";

	$("#container4-detail").hide();
	$("#container4-overview").show();

	$('#formEditCallSignName').val("");
	$('#formEditCallSignDescription').val("");
	$('#formEditCallSignsPagersNumber').val("");
	$('#formEditCallSignsPagersName').val("");
	unselectEverything('#formEditCallSignOwners');
}

// Add a new Rubric
function addRubric() {
	$("#container5-overview").hide();
	$("#container5-detail").show();
	$('#formEditRubricName').prop('disabled', false);
}

// Edit a Rubric
var editRubricName = "";
function editRubric(name) {
	if (name === "" || name === null) return;
	editRubricName = name;
	$('#formEditRubricName').prop('disabled', true);

	$.ajax({
		url: config.apiUrl + '/rubrics/' + editRubricName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditRubricName').val(editRubricName);
			$('#formEditRubricLabel').val(data.label);
			$('#formEditRubricNumber').val(data.number);
			$("#formEditRubricTransmitterGroups option").each(function() {
				if ($.inArray($(this).text(), data.transmitterGroupNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditRubricTransmitterGroups").trigger("chosen:updated");
			$("#formEditRubricOwners option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditRubricOwners").trigger("chosen:updated");

			$("#container5-overview").hide();
			$("#container5-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the Rubric-Details-Panel and reopen the Overview
function returnFromRubricDetails() {
	editRubricName = "";

	$("#container5-detail").hide();
	$("#container5-overview").show();

	$('#formEditRubricName').val("");
	$('#formEditRubricLabel').val("");
	$('#formEditRubricNumber').val("");
	unselectEverything('#formEditRubricTransmitterGroups');
	unselectEverything('#formEditRubricOwners');
}

// Activate Rubrics on a Pager
function activateRubrics() {
	$("#container5-overview").hide();
	$("#container5-detail2").show();
}

// Close the Rubric-Details2-Panel and reopen the Overview
function returnFromRubricDetails2() {
	$("#container5-detail2").hide();
	$("#container5-overview").show();

	$('#formActivateRubricNumber').val("");
	unselectEverything('#formActivateRubricTransmitterGroups');
}

// Add a new Transmitter
function addTransmitter() {
	$("#container6-overview").hide();
	$("#container6-detail").show();
	$('#formEditTransmitterName').prop('disabled', false);
	$('.timeslotCheckBox').prop('checked', true);
}

// Edit a TransmitterGroup
var editTransmitterName = "";
function editTransmitter(name) {
	if (name === "" || name === null) return;
	editTransmitterName = name;
	$('#formEditTransmitterName').prop('disabled', true);

	$.ajax({
		url: config.apiUrl + '/transmitters/' + editTransmitterName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditTransmitterName').val(editTransmitterName);
			$("#formEditTransmitterNodeName option").each(function() {
				if ($(this).text() === data.nodeName) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditTransmitterNodeName").trigger("chosen:updated");
			$('#formEditTransmitterLatitude').val(data.latitude);
			if (data.latitude < 0) {
				$('#formEditTransmitterLatitude').val(data.latitude * -1);
				$('#formEditTransmitterLatitudeOrientation').val("-1");
			}
			$('#formEditTransmitterLongitude').val(data.longitude);
			if (data.longitude < 0) {
				$('#formEditTransmitterLongitude').val(data.longitude * -1);
				$('#formEditTransmitterLongitudeOrientation').val("-1");
			}
			$('#formEditTransmitterPower').val(data.power);
			$('#formEditTransmitterIp').val(data.address.ip_addr);
			$('#formEditTransmitterPort').val(data.address.port);

			$('.timeslotCheckBox').prop('checked', false);
			for (i = 0; i < data.timeSlot.length; i++) {
				$('#formEditTransmitterTimeslot' + data.timeSlot.charAt(i)).prop('checked', true);
			}

			$('#formEditTransmitterOwners').val(data.ownerNames.join("\n"));
			$('#formEditTransmitterDeviceType').val(data.deviceType);
			$("#formEditTransmitterOwners option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditTransmitterOwners").trigger("chosen:updated");

			$("#container6-overview").hide();
			$("#container6-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the Transmitter-Details-Panel and reopen the Overview
function returnFromTransmitterDetails() {
	editTransmitterName = "";

	$("#container6-detail").hide();
	$("#container6-overview").show();

	$('#formEditTransmitterName').val("");
	unselectEverything('#formEditTransmitterNodeName');
	$('#formEditTransmitterLatitude').val("");
	unselectEverything('#formEditTransmitterLatitudeOrientation');
	$('#formEditTransmitterLongitude').val("");
	unselectEverything('#formEditTransmitterLongitudeOrientation');
	$('#formEditTransmitterPower').val("");
	$('#formEditTransmitterIp').val("");
	$('#formEditTransmitterPort').val("");
	unselectEverything('#formEditTransmitterOwners');
}

// Add a new TransmitterGroup
function addTransmitterGroup() {
	$("#container7-overview").hide();
	$("#container7-detail").show();
	$('#formEditTransmitterGroupName').prop('disabled', false);
}

// Edit a TransmitterGroup
var editTransmitterGroupName = "";
function editTransmitterGroup(name) {
	if (name === "" || name === null) return;
	editTransmitterGroupName = name;

	$.ajax({
		url: config.apiUrl + '/transmitterGroups/' + editTransmitterGroupName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditTransmitterGroupName').val(editTransmitterGroupName);
			$('#formEditTransmitterGroupName').prop('disabled', true);
			$('#formEditTransmitterGroupDescription').val(data.description);
			$("#formEditTransmitterGroupTransmitters option").each(function() {
				if ($.inArray($(this).text(), data.transmitterNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditTransmitterGroupTransmitters").trigger("chosen:updated");
			$("#formEditTransmitterGroupOwners option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			$("#formEditTransmitterGroupOwners").trigger("chosen:updated");

			$("#container7-overview").hide();
			$("#container7-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the TransmitterGroup-Details-Panel and reopen the Overview
function returnFromTransmitterGroupDetails() {
	editTransmitterGroupName = "";

	$("#container7-detail").hide();
	$("#container7-overview").show();

	$('#formEditTransmitterGroupName').val("");
	$('#formEditTransmitterGroupDescription').val("");
	unselectEverything('#formEditTransmitterGroupTransmitters');
	unselectEverything('#formEditTransmitterGroupOwners');
}

// Add a new Node
function addNode() {
	$("#container8-overview").hide();
	$("#container8-detail").show();
	$('#formEditNodeName').prop('disabled', false);
}

// Edit a Node
var editNodeName = "";
function editNode(name) {
	if (name === "" || name === null) return;
	editNodeName = name;

	$.ajax({
		url: config.apiUrl + '/nodes/' + editNodeName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditNodeName').val(data.name);
			$('#formEditNodeLatitude').val(data.latitude);
			if (data.latitude < 0) {
				$('#formEditNodeLatitude').val(data.latitude * -1);
				$('#formEditNodeLatitudeOrientation').val("-1");
			}
			$('#formEditNodeLongitude').val(data.longitude);
			if (data.longitude < 0) {
				$('#formEditNodeLongitude').val(data.longitude * -1);
				$('#formEditNodeLongitudeOrientation').val("-1");
			}
			$('#formEditNodeIp').val(data.address.ip_addr);
			$('#formEditNodePort').val(data.address.port);
			$('#formEditNodeStatus').val(data.status);
			$('#formEditNodeKey').val(data.key);
			$('#formEditNodeName').prop('disabled', true);

			$("#container8-overview").hide();
			$("#container8-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the Node-Details-Panel and reopen the Overview
function returnFromNodeDetails() {
	editNodeName = "";

	$("#container8-detail").hide();
	$("#container8-overview").show();

	$('#formEditNodeName').val("");
	$('#formEditNodeLatitude').val("");
	unselectEverything('#formEditNodeLatitudeOrientation');
	$('#formEditNodeLongitude').val("");
	unselectEverything('#formEditNodeLongitudeOrientation');
	$('#formEditNodeIp').val("");
	$('#formEditNodePort').val("7800");
	$('#formEditNodeKey').val("");
}

// Add a new User
function addUser() {
	$("#container9-overview").hide();
	$("#container9-detail").show();
	$('#formEditUserName').prop('disabled', false);
}

// Edit a User
var editUserName = "";
function editUser(name) {
	if (name === "" || name === null) return;
	editUserName = name;

	$.ajax({
		url: config.apiUrl + '/users/' + editUserName,
		type: 'GET',
		beforeSend: function(req) {
			req.setRequestHeader('Authorization', 'Basic ' + Cookies.get("auth"));
		},
		success: function(data) {
			$('#formEditUserName').val(data.name);
			$('#formEditUserName').prop('disabled', true);
			$('#formEditUserMail').val(data.mail);
			$('#formEditUserAdmin').prop('checked', data.admin);

			openContainer(9);
			$("#container9-overview").hide();
			$("#container9-detail").show();
		},
		error: function(err) {
			handleError(err);
		}
	});
}

// Close the User-Details-Panel and reopen the Overview
function returnFromUserDetails() {
	editUserName = "";

	$("#container9-detail").hide();
	$("#container9-overview").show();

	$('#formEditUserName').val("");
	$('#formEditUserPassword').val("");
	$('#formEditUserMail').val("");
	$('#formEditUserAdmin').prop('checked', false);
}

// Update the Character-Count on the Rufzeichen-Page
function updateCharCount() {
	var remaining = 80 - $('#formEditCallText').val().length;
	$('#formEditCallTextRemaining').text(jQuery.i18n.prop('calls_add_chars_remaining', remaining));
}


/* ###########
*  # HELPERS #
*  ########### */

// Check for form-input
function checkForInput(formId) {
	var errorFound = false;

	$("#" + formId).find(":input").each(function() {
		if ($(this)[0].id === "") return 'non-false';
		if ($(this)[0].value === "") {
			$(this).parent().addClass("has-error");
			errorFound = true;
		} else {
			$(this).parent().removeClass("has-error");
		}
	});

	$("#" + formId).find("select").each(function() {
		if ($(this)[0].id === "") return 'non-false';
		if ($("#" + $(this)[0].id + " :selected").length === 0) {
			$(this).parent().addClass("has-error");
			errorFound = true;
		} else {
			$(this).parent().removeClass("has-error");
		}
	});

	return errorFound;
}

// Check for possible overwriting of existing data
function checkForOverwriting(dataArray, searchString) {
	var ret = false;
	$.each(dataArray, function(i, item) {
		if (item.name === searchString) {
			ret = true;
		}
	});
	return ret;
}

// Unselects every option-item
function unselectEverything(selector) {
	$(selector + " option").each(function() {
		$(this).prop("selected", false);
	});
	$(selector).trigger("chosen:updated");
}

// SweetAlert Deletion Confirm Dialog
function showDeleteAlert(deleteFunction) {
	swal({
		title: jQuery.i18n.prop('alert_confirm'),
		text: jQuery.i18n.prop('alert_delete_notice'),
		type: "warning",
		timer: 3000,
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: jQuery.i18n.prop('yes'),
		cancelButtonText: jQuery.i18n.prop('cancel'),
		closeOnConfirm: false
	}, function() {
		deleteFunction();
	});
}

// SweetAlert Success Message
function showSuccessAlert() {
	swal({
		title: jQuery.i18n.prop('alert_success_title'),
		text: jQuery.i18n.prop('alert_success_text'),
		type: "success",
		timer: 3000
	});
}

function showSuccessReloadAlert() {
	setTimeout(function() {
		location.reload();
	}, 3000);

	swal({
		title: jQuery.i18n.prop('alert_success_title'),
		text: jQuery.i18n.prop('alert_success_text'),
		type: "success",
		timer: 3000,
	}, function() {
		location.reload();
	});
}

// Ajax Error Handler
function handleError(err) {
	var errorText = err.responseJSON.message;
	if (err.responseJSON.code == 4001) {
		var jsonErrors = "<ul style=\"text-align:left\">";
		for (i = 0; i < err.responseJSON.violations.length; i++) {
			jsonErrors += "<li>" + err.responseJSON.violations[i].field + " " + err.responseJSON.violations[i].message + " (" + err.responseJSON.violations[i].code + " - " + err.responseJSON.violations[i].constraint + ")</li>";
		}
		errorText += "</ul><br />" + jsonErrors;
	}

	swal({
		title: err.responseJSON.name + " (" + err.responseJSON.code + ")",
		text: errorText,
		type: "error",
		html: true
	});
}

// Missing-Input-Handler
function handleMissingInput() {
	swal({
		title: jQuery.i18n.prop('alert_missing_input_title'),
		text: jQuery.i18n.prop('alert_missing_input_text'),
		type: "error"
	});
}

// Missing-Input-Handler
function handleOverwriteError() {
	swal({
		title: jQuery.i18n.prop('alert_overwrite_title'),
		text: jQuery.i18n.prop('alert_overwrite_text'),
		type: "error"
	});
}

// Base64: UTF-8 to Base64
function utf8_to_b64(str) {
	return window.btoa(unescape(encodeURIComponent(str)));
}

// Base64: Base64 to UTF-8
function b64_to_utf8(str) {
	return decodeURIComponent(escape(window.atob(str)));
}

// Hide alert but do not remove it on close
$(function() {
	$("[data-hide]").on("click", function() {
		$(this).closest("." + $(this).attr("data-hide")).hide();
	});
});
