const VERSION = "1.2.4";

var config;
var currentLanguage;
var isAdmin = false;
var map, layer, markers;
var mapInited = false;

/*  ############################
 *  # INITIALIZATION-PROCEDURE #
 *  ############################ */
$(document).ready(function() {
	// show welcome-message on console
	console.log("%c DAPNET Web v" + VERSION + " ", "background: #112a2d; color: #bada55; font-size: large;");

	// Load Config-file
	$.getJSON("./config.json", function(data) {
		config = data;
	});

	// Language
	jQuery.i18n.properties({
		name: "Translation",
		path: "./assets/langs/",
		mode: "both",
		cache: true,
		checkAvailableLanguages: true,
		async: true,
		callback: function() {
			currentLanguage = $(this)[0].language;

			// Translate all DOM-elements with "data-i18n"-attribute
			$("[data-i18n]").each(function() {
				var prop = $(this).data("i18n");
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

	// Chosen
	$(".chosen-select").chosen({
		no_results_text: jQuery.i18n.prop("select_no_entries"),
		placeholder_text_multiple: " ",
		placeholder_text_single: " ",
		width: "100%"
	});

	// Login on Enter-Keypress
	$("#loginUsername").keypress(function(e) {
		if (e.which == 13) loginWithForm();
	});
	$("#loginPassword").keypress(function(e) {
		if (e.which == 13) loginWithForm();
	});

	// container6-detail Character-Count
	updateCharCount();
	$("#formEditCallText").on("input", function() {
		updateCharCount();
	});

	// validate latitude / longitude input while typing
	$("#formEditTransmitterLatitude").on("change input", function() {
		coordinatesInput(this, 0, 90);
	});
	$("#formEditTransmitterLongitude").on("change input", function() {
		coordinatesInput(this, 0, 180);
	});
	$("#formEditNodeLatitude").on("change input", function() {
		coordinatesInput(this, 0, 90);
	});
	$("#formEditNodeLongitude").on("change input", function() {
		coordinatesInput(this, 0, 180);
	});

	// validate number input while typing
	$("#formActivateRubricNumber").on("change input", function() {
		numberInput(this, 0, 2097151);
	});

	// add info-text to home-tab
	$("#homeInfoText").html(config.information);

	// add version-number
	$("#footer_version_number").text(VERSION);

	// show legend below charts
	Chart.defaults.global.legend.position = "bottom";

	// Remove Splash-Screen
	$("#splashscreen").fadeOut(500);
}

// Switch between languages
function changeLanguage(lang) {
	jQuery.i18n.properties({
		name: "Translation",
		path: "./assets/langs/",
		language: lang,
		mode: "both",
		cache: true,
		checkAvailableLanguages: false,
		async: true,
		callback: function() {
			currentLanguage = lang;

			// Translate all DOM-elements with "data-i18n"-attribute
			$("[data-i18n]").each(function() {
				var prop = $(this).data("i18n");
				$(this).text($.i18n.prop(prop));
			});

			// if logged in
			if (Cookies.get("auth") !== undefined) {
				// translate jumbotron-message
				$("#jumbotronText").text(jQuery.i18n.prop("home_jumbotron_text_loggedin", atob(Cookies.get("auth")).split(":")[0]));

				// reload data to update DataTables
				loadOpenTabsData();
			}

			// Adapt window-title
			document.title = $("#container" + currentlyOpenContainer + " h1:first").text() + " - " + "DAPNET";
		}
	});
}

/*  ###########################
 *  # MANAGE LOGIN AND LOGOUT #
 *  ########################### */

// Login using Cookie
function loginWithCookie() {
	var authData = Cookies.get("auth");
	if (authData !== undefined && authData.username !== "") {
		loginSuccess(atob(authData).split(":")[0]);
	}
}

// Login using Form
function loginWithForm() {
	var username = $("#loginUsername").val();
	var password = $("#loginPassword").val();
	if (username !== "" && password !== "") {
		// Test login-credentials
		$.ajax({
			url: config.apiUrl + "/users/" + username,
			type: "GET",
			contentType: "application/json",
			dataType: "json",
			beforeSend: function(req) {
				req.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
			},
			success: function() {
				Cookies.set("auth", btoa(username + ":" + password), {expires: 14});
				loginWithCookie();

				$("#modalLogin").modal("toggle");
				$("#loginUsername").val("");
				$("#loginPassword").val("");
			},
			error: function() {
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
		url: config.apiUrl + "/users/" + username,
		type: "GET",
		contentType: "application/json",
		dataType: "json",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			if (data.admin) {
				isAdmin = true;
			} else {
				$("ul.navbar-nav li a[href='#3']").parent().hide();
				$("#rubrics-add-rubric").hide();
				$("#nodes-add-node").hide();
			}

			$("#jumbotronText").text(jQuery.i18n.prop("home_jumbotron_text_loggedin", username));
			$("#navbar-main-nav").show();
			$("#homeStats").show();

			var loggedInButton = $("#loggedin");
			loggedInButton.text(username).css("display", "block");
			loggedInButton.click(function() {
				editUser(username);
			});
			$("#btnLogin").hide();
			$("#btnLogout").css("display", "block");

			loadAllData();
		}
	});
}

// Logout
function logout() {
	Cookies.remove("auth");
	showSuccessReloadAlert();
}


/*  #################
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

	loadOpenTabsData();
}

// load every tab's data
function loadAllData() {
	loadCalls();
	loadCallSigns();
	loadNews();
	loadRubrics();
	loadTransmitters();
	loadTransmitterGroups();
	loadNodes();
}

// load the data of the currently open tab
function loadOpenTabsData() {
	if (currentlyOpenContainer == 2) {
		loadCalls();
	} else if (currentlyOpenContainer == 3) {
		loadNews();
	} else if (currentlyOpenContainer == 4) {
		loadCallSigns();
	} else if (currentlyOpenContainer == 5) {
		loadRubrics();
	} else if (currentlyOpenContainer == 6) {
		loadTransmitters();
	} else if (currentlyOpenContainer == 7) {
		loadTransmitterGroups();
	} else if (currentlyOpenContainer == 8) {
		loadNodes();
	} else if (currentlyOpenContainer == 9) {
		// loadCallSigns calls loadUsers() to make sure that all users' callsigns have been loaded
		loadCallSigns();
	} else if (currentlyOpenContainer == 10) {
		loadUpdateData();
	} else if (currentlyOpenContainer == 13 && !mapInited) {
		prepareMap();
	}
}

// find an update-server (Hamnet or internet), create the update-iframe and display it
function loadUpdateData() {
	var hamnetUpdateServer = "http://db0sda.ampr.org/dapnet-update/update.php";
	var internetUpdateServer = "http://hampager.de/dapnet-update/update.php";

	var versionCore = "UNKNOWN";
	var versionApi = "UNKNOWN";

	// Query the Core Version
	$.ajax({
		url: config.apiUrl + "/core/core_version",
		type: "GET",
		success: function(data) {
			versionCore = data;

			// Query the API Version
			$.ajax({
				url: config.apiUrl + "/core/api_version",
				type: "GET",
				success: function(data) {
					versionApi = data;

					// Query the update-server
					$.ajax({
						url: hamnetUpdateServer,
						type: "GET",
						timeout: 1000,
						success: function() {
							$("#update_iframe").html("<iframe src=\"" + hamnetUpdateServer + "?core=" + versionCore + "&api=" + versionApi + "&web=" + VERSION + "\" width=\"600px\" height=\"310px\"></iframe>");
						},
						error: function(err) {
							if (err.status === 0) {
								$("#update_iframe").html("<iframe src=\"" + internetUpdateServer + "?core=" + versionCore + "&api=" + versionApi + "&web=" + VERSION + "\" width=\"600px\" height=\"310px\"></iframe>");
							} else {
								handleError(err);
							}
						}
					});
				},
				error: function(err) {
					handleError(err);
				}
			});
		},
		error: function(err) {
			handleError(err);
		}
	});
}


/*  ##################
 *  # MAP-MANAGEMENT #
 *  ################## */

// Look for a load-balancer inside the Hamnet and query all returned tile-servers for availability.
// If the user is not using the Hamnet, use the default tile-servers.
function prepareMap() {
	var hamnetLoadBalanceServer = "http://db0sda.ampr.org/osmloadbalservers/";
	var publicServers = ["a.tile.openstreetmap.org", "b.tile.openstreetmap.org", "c.tile.openstreetmap.org"];
	var selectedServers = [];

	// Query the Hamnet Load Balancing Server
	$.ajax({
		url: hamnetLoadBalanceServer,
		type: "GET",
		timeout: 1000,
		success: function(data) {
			var returnedServers = data.trim().split("\n");
			var count = 0;

			// Either use the tested server (if successful) or move on
			function selectWorkingMapServers(loadTime, checkedUrl) {
				if (loadTime != -1) {
					selectedServers.push(checkedUrl);
				}

				count++;
				if (count >= returnedServers.length) {
					// Tested every available server: initialize map
					initMap(selectedServers);
				}
			}

			// Check which servers are available
			for (var i in returnedServers) {
				getMapTileLoadTime(returnedServers[i], selectWorkingMapServers);
			}
		},
		error: function(err) {
			if (err.status === 0) {
				// Not reachable: use public tile-servers
				selectedServers = publicServers;
				initMap(selectedServers);
			} else {
				handleError(err);
			}
		}
	});
}

// Initialize Map with the given tile-servers
function initMap(tileServers) {
	if (mapInited) return;

	layer = L.tileLayer("http://{s}/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a>",
		subdomains: tileServers
	});
	map = L.map("map").setView([51, 10], 5).addLayer(layer);

	$("#mapLoading").hide();
	mapInited = true;

	if (markers !== undefined) {
		map.addLayer(markers);
	} else {
		loadTransmitters();
	}
}

// Calculate a map-tile"s loading time. Returns -1 on timeout (after ~1.5s).
function getMapTileLoadTime(url, fn) {
	var startTime = new Date().getTime();
	var img = new Image();

	img.onload = function() {
		var loadTime = new Date().getTime() - startTime;
		fn(loadTime, url);
	};

	img.onerror = function() {
		fn(-1, url);
	};

	img.src = "http://" + url + "/14/10/100.png";
	setTimeout(function() {
		if (!img.complete || !img.naturalWidth) {
			img.src = "";
			fn(-1, url);
		}
	}, 1500);
}


/*  ########################
 *  # CONTAINER-MANAGEMENT #
 *  ######################## */

// Add a new Call
function addCall() {
	$("#container2-overview").hide();
	$("#container2-detail").show();

	var username = atob(Cookies.get("auth")).split(":")[0].toUpperCase();
	$("#formEditCallText").val(username + ": ").focus()[0].setSelectionRange(username.length + 2, username.length + 2);
	updateCharCount();
}

// Close the Call-Details-Panel and reopen the Overview
function returnFromCallDetails() {
	$("#container2-detail").hide();
	$("#container2-overview").show();

	$("#formEditCallText").val("");
	updateCharCount();
	unselectEverything("#formEditCallCallsign");
	unselectEverything("#formEditCallTransmitterGroup");
	$("#formEditCallEmergency").prop("checked", false);
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

	$("#formEditNewsText").val("");
	$("#formEditNewsNumber").val("");
	unselectEverything("#formEditNewsRubric");
}

// Add a new CallSign
function addCallSign() {
	$("#container4-overview").hide();
	$("#container4-detail").show();
	$("#formEditCallSignName").prop("disabled", false);
}

// Edit a CallSign
var editCallSignName = "";
function editCallSign(name) {
	if (name === "" || name === null) return;
	editCallSignName = name;
	$("#formEditCallSignName").prop("disabled", true);

	$.ajax({
		url: config.apiUrl + "/callsigns/" + editCallSignName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditCallSignName").val(editCallSignName);
			$("#formEditCallSignDescription").val(data.description);
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
			$("#formEditCallSignsPagersNumber").val(pagerNumbers);
			$("#formEditCallSignsPagersName").val(pagerNames);

			var owners = $("#formEditCallSignOwners");
			owners.find("option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			owners.trigger("chosen:updated");

			$("#container4-overview").hide();
			$("#container4-detail").show();
		},
		error: handleError
	});
}

// Close the CallSign-Details-Panel and reopen the Overview
function returnFromCallSignDetails() {
	editCallSignName = "";

	$("#container4-detail").hide();
	$("#container4-overview").show();

	$("#formEditCallSignName").val("");
	$("#formEditCallSignDescription").val("");
	$("#formEditCallSignsPagersNumber").val("");
	$("#formEditCallSignsPagersName").val("");
	unselectEverything("#formEditCallSignOwners");
}

// Add a new Rubric
function addRubric() {
	$("#container5-overview").hide();
	$("#container5-detail").show();
	$("#formEditRubricName").prop("disabled", false);
}

// Edit a Rubric
var editRubricName = "";
function editRubric(name) {
	if (name === "" || name === null) return;
	editRubricName = name;
	$("#formEditRubricName").prop("disabled", true);

	$.ajax({
		url: config.apiUrl + "/rubrics/" + editRubricName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditRubricName").val(editRubricName);
			$("#formEditRubricLabel").val(data.label);
			$("#formEditRubricNumber").val(data.number);

			var groups = $("#formEditRubricTransmitterGroups");
			groups.find("option").each(function() {
				if ($.inArray($(this).text(), data.transmitterGroupNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			groups.trigger("chosen:updated");

			var owners = $("#formEditRubricOwners");
			owners.find("option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			owners.trigger("chosen:updated");

			$("#container5-overview").hide();
			$("#container5-detail").show();
		},
		error: handleError
	});
}

// Close the Rubric-Details-Panel and reopen the Overview
function returnFromRubricDetails() {
	editRubricName = "";

	$("#container5-detail").hide();
	$("#container5-overview").show();

	$("#formEditRubricName").val("");
	$("#formEditRubricLabel").val("");
	$("#formEditRubricNumber").val("");
	unselectEverything("#formEditRubricTransmitterGroups");
	unselectEverything("#formEditRubricOwners");
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

	$("#formActivateRubricNumber").val("");
	unselectEverything("#formActivateRubricTransmitterGroups");
}

// Add a new Transmitter
function addTransmitter() {
	$("#container6-overview").hide();
	$("#container6-detail").show();
	$("#formEditTransmitterName").prop("disabled", false);
	$(".timeslotCheckBox").prop("checked", true);
}

// Edit a TransmitterGroup
var editTransmitterName = "";
function editTransmitter(name) {
	if (name === "" || name === null) return;
	editTransmitterName = name;
	$("#formEditTransmitterName").prop("disabled", true);

	$.ajax({
		url: config.apiUrl + "/transmitters/" + editTransmitterName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditTransmitterName").val(editTransmitterName);

			var nodeName = $("#formEditTransmitterNodeName");
			nodeName.find("option").each(function() {
				if ($(this).text() === data.nodeName) {
					$(this).prop("selected", true);
				}
			});
			nodeName.trigger("chosen:updated");

			var latitude = $("#formEditTransmitterLatitude");
			latitude.val(data.latitude);
			if (data.latitude < 0) {
				latitude.val(data.latitude * -1);
				$("#formEditTransmitterLatitudeOrientation").val("-1");
			}

			var longitude = $("#formEditTransmitterLongitude");
			longitude.val(data.longitude);
			if (data.longitude < 0) {
				longitude.val(data.longitude * -1);
				$("#formEditTransmitterLongitudeOrientation").val("-1");
			}
			$("#formEditTransmitterPower").val(data.power);
			$("#formEditTransmitterIp").val(data.address.ip_addr);
			$("#formEditTransmitterPort").val(data.address.port);

			$(".timeslotCheckBox").prop("checked", false);
			for (i = 0; i < data.timeSlot.length; i++) {
				$("#formEditTransmitterTimeslot" + data.timeSlot.charAt(i)).prop("checked", true);
			}

			var owners = $("#formEditTransmitterOwners");
			owners.val(data.ownerNames.join("\n"));
			$("#formEditTransmitterDeviceType").val(data.deviceType);
			owners.find("option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			owners.trigger("chosen:updated");

			$("#container6-overview").hide();
			$("#container6-detail").show();
		},
		error: handleError
	});
}

// Close the Transmitter-Details-Panel and reopen the Overview
function returnFromTransmitterDetails() {
	editTransmitterName = "";

	$("#container6-detail").hide();
	$("#container6-overview").show();

	$("#formEditTransmitterName").val("");
	unselectEverything("#formEditTransmitterNodeName");
	$("#formEditTransmitterLatitude").val("");
	unselectEverything("#formEditTransmitterLatitudeOrientation");
	$("#formEditTransmitterLongitude").val("");
	unselectEverything("#formEditTransmitterLongitudeOrientation");
	$("#formEditTransmitterPower").val("");
	$("#formEditTransmitterIp").val("");
	$("#formEditTransmitterPort").val("");
	unselectEverything("#formEditTransmitterOwners");
}

// Add a new TransmitterGroup
function addTransmitterGroup() {
	$("#container7-overview").hide();
	$("#container7-detail").show();
	$("#formEditTransmitterGroupName").prop("disabled", false);
}

// Edit a TransmitterGroup
var editTransmitterGroupName = "";
function editTransmitterGroup(name) {
	if (name === "" || name === null) return;
	editTransmitterGroupName = name;

	$.ajax({
		url: config.apiUrl + "/transmitterGroups/" + editTransmitterGroupName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditTransmitterGroupName").val(editTransmitterGroupName).prop("disabled", true);
			$("#formEditTransmitterGroupDescription").val(data.description);

			var transmitters = $("#formEditTransmitterGroupTransmitters");
			transmitters.find("option").each(function() {
				if ($.inArray($(this).text(), data.transmitterNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			transmitters.trigger("chosen:updated");

			var owners = $("#formEditTransmitterGroupOwners");
			owners.find("option").each(function() {
				if ($.inArray($(this).text(), data.ownerNames) !== -1) {
					$(this).prop("selected", true);
				}
			});
			owners.trigger("chosen:updated");

			$("#container7-overview").hide();
			$("#container7-detail").show();
		},
		error: handleError
	});
}

// Close the TransmitterGroup-Details-Panel and reopen the Overview
function returnFromTransmitterGroupDetails() {
	editTransmitterGroupName = "";

	$("#container7-detail").hide();
	$("#container7-overview").show();

	$("#formEditTransmitterGroupName").val("");
	$("#formEditTransmitterGroupDescription").val("");
	unselectEverything("#formEditTransmitterGroupTransmitters");
	unselectEverything("#formEditTransmitterGroupOwners");
}

// Add a new Node
function addNode() {
	$("#container8-overview").hide();
	$("#container8-detail").show();
	$("#formEditNodeName").prop("disabled", false);
}

// Edit a Node
var editNodeName = "";
function editNode(name) {
	if (name === "" || name === null) return;
	editNodeName = name;

	$.ajax({
		url: config.apiUrl + "/nodes/" + editNodeName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditNodeName").val(data.name).prop("disabled", true);

			var latitude = $("#formEditNodeLatitude");
			latitude.val(data.latitude);
			if (data.latitude < 0) {
				latitude.val(data.latitude * -1);
				$("#formEditNodeLatitudeOrientation").val("-1");
			}

			var longitude = $("#formEditNodeLongitude");
			longitude.val(data.longitude);
			if (data.longitude < 0) {
				longitude.val(data.longitude * -1);
				$("#formEditNodeLongitudeOrientation").val("-1");
			}
			$("#formEditNodeStatus").val(data.status);
			$("#formEditNodeKey").val(data.key);

			$("#container8-overview").hide();
			$("#container8-detail").show();
		},
		error: handleError
	});
}

// Close the Node-Details-Panel and reopen the Overview
function returnFromNodeDetails() {
	editNodeName = "";

	$("#container8-detail").hide();
	$("#container8-overview").show();

	$("#formEditNodeName").val("");
	$("#formEditNodeLatitude").val("");
	unselectEverything("#formEditNodeLatitudeOrientation");
	$("#formEditNodeLongitude").val("");
	unselectEverything("#formEditNodeLongitudeOrientation");
	$("#formEditNodeKey").val("");
}

// Add a new User
function addUser() {
	$("#container9-overview").hide();
	$("#container9-detail").show();
	$("#formEditUserName").prop("disabled", false);
}

// Edit a User
var editUserName = "";
function editUser(name) {
	if (name === "" || name === null) return;
	editUserName = name;

	$.ajax({
		url: config.apiUrl + "/users/" + editUserName,
		type: "GET",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
		},
		success: function(data) {
			$("#formEditUserName").val(data.name).prop("disabled", true);
			$("#formEditUserMail").val(data.mail);
			$("#formEditUserAdmin").prop("checked", data.admin);

			openContainer(9);
			$("#container9-overview").hide();
			$("#container9-detail").show();
		},
		error: handleError
	});
}

// Close the User-Details-Panel and reopen the Overview
function returnFromUserDetails() {
	editUserName = "";

	$("#container9-detail").hide();
	$("#container9-overview").show();

	$("#formEditUserName").val("");
	$("#formEditUserPassword").val("");
	$("#formEditUserMail").val("");
	$("#formEditUserAdmin").prop("checked", false);
}

// Update the Character-Count on the Rufzeichen-Page
function updateCharCount() {
	var remaining = 80 - $("#formEditCallText").val().length;
	$("#formEditCallTextRemaining").text(jQuery.i18n.prop("calls_add_chars_remaining", remaining));
}


/*  ##########
 *  # CHARTS #
 *  ########## */

// render online/offline chart of the node-tab
function renderChartNode() {
	if (chartNodesData === undefined || currentlyOpenContainer != 8) {
		return;
	}

	if (chartNodes !== undefined) {
		chartNodes.destroy();
	}

	chartNodes = new Chart($("#chartNodes"), {
		type: "pie",
		data: {
			labels: ["Online", "Offline"],
			datasets: [{
				data: chartNodesData,
				backgroundColor: ["#469408", "#D9230F"],
				hoverBackgroundColor: ["#469408", "#D9230F"]
			}]
		}
	});
}

// render online/offline chart of the transmitter-tab
function renderChartTransmitter() {
	if (chartTransmitterData === undefined || currentlyOpenContainer != 6) {
		return;
	}

	if (chartTransmitter !== undefined) {
		chartTransmitter.destroy();
	}

	chartTransmitter = new Chart($("#chartTransmitter"), {
		type: "pie",
		data: {
			labels: ["Online", "Offline"],
			datasets: [{
				data: chartTransmitterData,
				backgroundColor: ["#469408", "#D9230F"],
				hoverBackgroundColor: ["#469408", "#D9230F"]
			}]
		}
	});
}

// render transmitter-type chart of the node-tab
function renderChartTransmitterTypes() {
	if (chartTransmitterTypesData === undefined || currentlyOpenContainer != 6) {
		return;
	}

	if (chartTransmitterTypes !== undefined) {
		chartTransmitterTypes.destroy();
	}

	chartTransmitterTypes = new Chart($("#chartTransmitterTypes"), {
		type: "pie",
		data: {
			labels: ["RASPPAGER1", "XOS", "SDRPAGER", "DV4mini"],
			datasets: [{
				data: chartTransmitterTypesData,
				backgroundColor: ["#3A01DF", "#DF7401", "#04B431", "#029ACF"],
				hoverBackgroundColor: ["#3A01DF", "#DF7401", "#04B431", "#029ACF"]
			}]
		}
	});
}


/*  ###########
 *  # HELPERS #
 *  ########### */

// Check for form-input
function checkForInput(formId) {
	var errorFound = false;
	var form = $("#" + formId);

	form.find(":input").each(function() {
		if ($(this)[0].id === "") return "non-false";
		if ($(this)[0].value === "") {
			$(this).parent().addClass("has-error");
			errorFound = true;
		} else {
			$(this).parent().removeClass("has-error");
		}
	});

	form.find("select").each(function() {
		if ($(this)[0].id === "") return "non-false";
		if ($("#" + $(this)[0].id + " :selected").length === 0) {
			$(this).parent().addClass("has-error");
			errorFound = true;
		} else {
			$(this).parent().removeClass("has-error");
		}
	});

	return errorFound;
}

// Manual input checking for latitude / longitude
function coordinatesInput(element, min, max) {
	// Replace comma with dot
	element.value = element.value.replace(",", ".");

	// check for other input than numbers and dots AND for values between min and max
	if (element.value === "" || (element.value.match(/([0-9.0-9])$/g) && element.value >= min && element.value <= max)) {
		$(element.parentElement).removeClass("has-error");
	} else {
		$(element.parentElement).addClass("has-error");
	}
}

function numberInput(element, min, max) {
	// check for other input than numbers AND for values between min and max
	if (element.value === "" || (element.value.match(/([0-9])$/g) && element.value >= min && element.value <= max)) {
		$(element.parentElement).removeClass("has-error");
	} else {
		$(element.parentElement).addClass("has-error");
	}
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

function apiTrueFalse(response) {
	return response ? jQuery.i18n.prop("yes") : jQuery.i18n.prop("no");
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
		title: jQuery.i18n.prop("alert_confirm"),
		text: jQuery.i18n.prop("alert_delete_notice"),
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: jQuery.i18n.prop("yes"),
		cancelButtonText: jQuery.i18n.prop("cancel")
	}).then(function() {
		deleteFunction();
	}).done();
}

// SweetAlert Success Message
function showSuccessAlert() {
	swal({
		title: jQuery.i18n.prop("alert_success_title"),
		text: jQuery.i18n.prop("alert_success_text"),
		type: "success",
		timer: 3000
	});
}

function showSuccessReloadAlert() {
	setTimeout(function() {
		location.reload();
	}, 3000);

	swal({
		title: jQuery.i18n.prop("alert_success_title"),
		text: jQuery.i18n.prop("alert_success_text"),
		type: "success",
		timer: 3000
	}).then(function() {
		location.reload();
	});
}

// Ajax Error Handler
function handleError(err) {
	if (err.status === 0) {
		swal({
			title: jQuery.i18n.prop("alert_error_api_title"),
			html: jQuery.i18n.prop("alert_error_api_text"),
			type: "error"
		});
		return;
	}

	var errorText = err.responseJSON.message;
	if (err.responseJSON.code == 4001) {
		var jsonErrors = "<ul style=\"text-align:left\">";
		for (var i = 0; i < err.responseJSON.violations.length; i++) {
			jsonErrors += "<li>" + err.responseJSON.violations[i].field + " " + err.responseJSON.violations[i].message + " (" + err.responseJSON.violations[i].code + " - " + err.responseJSON.violations[i].constraint + ")</li>";
		}
		errorText += "</ul><br />" + jsonErrors;
	}

	swal({
		title: err.responseJSON.name + " (" + err.responseJSON.code + ")",
		html: errorText,
		type: "error"
	});
}

// Missing-Input-Handler
function handleMissingInput() {
	swal({
		title: jQuery.i18n.prop("alert_missing_input_title"),
		text: jQuery.i18n.prop("alert_missing_input_text"),
		type: "error"
	});
}

// Missing-Input-Handler
function handleOverwriteError() {
	swal({
		title: jQuery.i18n.prop("alert_overwrite_title"),
		text: jQuery.i18n.prop("alert_overwrite_text"),
		type: "error"
	});
}

// Hide alert but do not remove it on close
$(function() {
	$("[data-hide]").on("click", function() {
		$(this).closest("." + $(this).attr("data-hide")).hide();
	});
});
