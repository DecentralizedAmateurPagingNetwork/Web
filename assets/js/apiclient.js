var callSignData, rubricData, transmitterData, transmitterGroupData, nodeData, userData;
var chartNodes, chartTransmitter, chartTransmitterTypes;
var chartNodesData, chartTransmitterData, chartTransmitterTypesData;

/* #########################
 *  # INTERACT WITH THE API #
 *  ######################### */

// Load all Calls
function loadCalls() {
	if (!isAdmin) return;

	$.ajax({
		url: config.apiUrl + "/calls",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			var table = $("#tableCalls");
			table.DataTable().destroy();
			table.DataTable({
				data: data,
				language: {
					url: "./assets/langs/DataTables_" + currentLanguage + ".json"
				},
				columns: [
					{data: "timestamp"},
					{data: "callSignNames[, ]"},
					{data: "transmitterGroupNames[, ]"},
					{data: "text"},
					{
						data: function(obj) {
							return apiTrueFalse(obj.emergency);
						}
					},
					{data: "ownerName"}
				],
				"order": [[0, "desc"]],
				"responsive": true
			});

			var statEmergency = 0;
			$.each(data, function(index, value) {
				if (value.emergency) statEmergency++;
			});
			$("#statsCallsEmergency").text(statEmergency);
			$("#statsCallsTotal, #statsStartCalls").text(data.length);
		},
		error: handleError
	});
}

// Add a Call
function postCall() {
	if (checkForInput("container2-detail")) {
		handleMissingInput();
		return;
	}

	var callSignNames = [];
	$("#formEditCallCallsign").find("option").each(function() {
		if (this.selected) callSignNames.push(this.value);
	});
	var transmitterGroupNames = [];
	$("#formEditCallTransmitterGroup").find("option").each(function() {
		if (this.selected) transmitterGroupNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/calls",
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			text: $("#formEditCallText").val(),
			callSignNames: callSignNames,
			transmitterGroupNames: transmitterGroupNames,
			emergency: $("#formEditCallEmergency").prop("checked")
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromCallDetails();
			loadCalls();
		},
		error: handleError
	});
}

// Load all News
function loadNews() {
	if (!isAdmin) return;

	$.ajax({
		url: config.apiUrl + "/news",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			var table = $("#tableNews");
			table.DataTable().destroy();
			table.DataTable({
				data: data,
				language: {
					url: "./assets/langs/DataTables_" + currentLanguage + ".json"
				},
				columns: [
					{data: "timestamp"},
					{data: "rubricName"},
					{data: "number"},
					{data: "text"},
					{data: "ownerName"}
				],
				"responsive": true
			});

			$("#statsNewsTotal, #statsStartNews").text(data.length);
		},
		error: handleError
	});
}

// Add a News
function postNews() {
	if (checkForInput("container3-detail")) {
		handleMissingInput();
		return;
	}

	$.ajax({
		url: config.apiUrl + "/news",
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			text: $("#formEditNewsText").val(),
			rubricName: $("#formEditNewsRubric").val(),
			number: $("#formEditNewsNumber").val()
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromNewsDetails();
			loadNews();
		},
		error: handleError
	});
}

// Load all CallSigns
function loadCallSigns() {
	$.ajax({
		url: config.apiUrl + "/callsigns",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			callSignData = data;

			var table = $("#tableCallSigns");
			table.DataTable().destroy();

			if (!isAdmin) {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{data: "description"},
						{data: noDataEntry},
						{data: noDataEntry},
						{data: "ownerNames[, ]"},
						{data: noDataEntry}
					],
					"responsive": true
				});
			} else {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{data: "description"},
						{
							data: function(obj) {
								var numbers = [];
								obj.pagers.forEach(function(item) {
									numbers.push(item.number.pad(7));
								});

								return numbers.join(", ");
							}
						},
						{
							data: function(obj) {
								var names = [];
								obj.pagers.forEach(function(item) {
									names.push(item.name);
								});

								return names.join(", ");
							}
						},
						{data: "ownerNames[, ]"},
						{
							data: function(obj) {
								return "<a href=\"#4\" onclick=\"editCallSign('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop('container_table_actions_edit') + "\"></i></a> " +
									"<a href=\"#4\" onclick=\"deleteCallSign('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop('container_table_actions_delete') + "\"></i></a>";
							}
						}
					],
					"responsive": true
				});
			}

			$("#statsCallSignsTotal").text(data.length);

			var usages = $("#formEditCallCallsign");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");

			// load users after all calls signs have been loaded
			loadUsers();
		},
		error: handleError
	});
}

// Add / Edit a CallSign
function putCallSign() {
	if (checkForInput("container4-detail")) {
		handleMissingInput();
		return;
	}

	var callSignName = $("#formEditCallSignName");
	var urlName = editCallSignName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = callSignName.val();
	}

	if (checkForOverwriting(callSignData, urlName) && !callSignName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	var pagerNumbers = $("#formEditCallSignsPagersNumber").val().split("\n");
	var pagerNames = $("#formEditCallSignsPagersName").val().split("\n");
	var pagers = [];
	for (var i = 0; i < pagerNumbers.length; i++) {
		var item = {};
		item.number = pagerNumbers[i];
		item.name = pagerNames[i];

		pagers.push(item);
	}
	var ownerNames = [];
	$("#formEditCallSignOwners").find("option").each(function() {
		if (this.selected) ownerNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/callsigns/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			description: $("#formEditCallSignDescription").val(),
			pagers: pagers,
			ownerNames: ownerNames
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromCallSignDetails();
			loadCallSigns();
		},
		error: handleError
	});
}

// Delete a CallSign
function deleteCallSign(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/callsigns/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadCallSigns();
			},
			error: handleError
		});
	});
}

// Load all Rubrics
function loadRubrics() {
	$.ajax({
		url: config.apiUrl + "/rubrics",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			rubricData = data;

			var table = $("#tableRubrics");
			table.DataTable().destroy();
			table.DataTable({
				data: data,
				language: {
					url: "./assets/langs/DataTables_" + currentLanguage + ".json"
				},
				columns: [
					{data: "number"},
					{data: "name"},
					{data: "label"},
					{data: "transmitterGroupNames[, ]"},
					{data: "ownerNames[, ]"},
					{
						data: function(obj) {
							if (!isAdmin) {
								return "---";
							} else {
								return "<a href=\"#5\" onclick=\"editRubric('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop("container_table_actions_edit") + "\"></i></a> " +
									"<a href=\"#5\" onclick=\"deleteRubric('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop("container_table_actions_delete") + "\"></i></a>";
							}
						}
					}
				],
				"responsive": true
			});

			$("#statsRubricsTotal").text(data.length);

			var usages = $("#formEditNewsRubric");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");
		},
		error: handleError
	});
}

// Add / Edit a Rubric
function putRubric() {
	if (checkForInput("container5-detail")) {
		handleMissingInput();
		return;
	}

	var rubricName = $("#formEditRubricName");
	var urlName = editRubricName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = rubricName.val();
	}

	if (checkForOverwriting(rubricData, urlName) && !rubricName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	var transmitterGroupNames = [];
	$("#formEditRubricTransmitterGroups").find("option").each(function() {
		if (this.selected) transmitterGroupNames.push(this.value);
	});
	var ownerNames = [];
	$("#formEditRubricOwners").find("option").each(function() {
		if (this.selected) ownerNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/rubrics/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			name: urlName,
			number: $("#formEditRubricNumber").val(),
			transmitterGroupNames: transmitterGroupNames,
			label: $("#formEditRubricLabel").val(),
			ownerNames: ownerNames
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromRubricDetails();
			loadRubrics();
		},
		error: handleError
	});
}

// Delete a Rubric
function deleteRubric(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/rubrics/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadRubrics();
			},
			error: handleError
		});
	});
}

// Send an Activation
function sendRubricsActivation() {
	if (checkForInput("container5-detail2")) {
		handleMissingInput();
		return;
	}

	var transmitterGroupNames = [];
	$("#formActivateRubricTransmitterGroups").find("option").each(function() {
		if (this.selected) transmitterGroupNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/activation",
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			number: $("#formActivateRubricNumber").val(),
			transmitterGroupNames: transmitterGroupNames
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromRubricDetails2();
		},
		error: handleError
	});
}

// Load all Transmitters
function loadTransmitters() {
	loadHamnetDbData();
	$.ajax({
		url: config.apiUrl + "/transmitters",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			transmitterData = data;

			var table = $("#tableTransmitters");
			table.DataTable().destroy();
			if (!isAdmin) {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{data: "nodeName"},
						{data: noDataEntry},
						{data: "ownerNames[, ]"},
						{data: transmitterDeviceType},
						{data: statusFormatter},
						{data: noDataEntry}
					],
					"responsive": true
				});
			} else {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{data: "nodeName"},
						{
							data: function(obj) {
								if (!obj.address) return "---";
								return obj.address.ip_addr + ":" + obj.address.port;
							}
						},
						{data: "ownerNames[, ]"},
						{data: transmitterDeviceType},
						{data: statusFormatter},
						{
							data: function(obj) {
								return "<a href=\"#6\" onclick=\"editTransmitter('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop("container_table_actions_edit") + "\"></i></a> " +
									"<a href=\"#6\" onclick=\"deleteTransmitter('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop("container_table_actions_delete") + "\"></i></a>";
							}
						}
					],
					"responsive": true
				});
			}

			var statCountOnline = 0;
			var statCountOffline = 0;
			$.each(data, function(index, value) {
				if ($("#transmittersWiderangeOnly").prop("checked") && value.usage !== "WIDERANGE") return true;
				if (value.status === "ONLINE") {
					statCountOnline++;
				} else {
					statCountOffline++;
				}
			});
			$("#statsTransmitterTotal").text(statCountOnline + statCountOffline);
			$("#statsStartTransmitter").text(statCountOnline + " / " + data.length);

			chartTransmitterData = [statCountOnline, statCountOffline];
			renderChartTransmitter();

			chartTransmitterTypesData = [];
			$.each(data, function(index, value) {
				if ($("#transmittersWiderangeOnly").prop("checked") && value.usage !== "WIDERANGE") return true;

				var deviceType = value.deviceType;
				if (!deviceType) {
					deviceType = jQuery.i18n.prop("unknown");
				}

				if (chartTransmitterTypesData[deviceType] !== undefined) {
					chartTransmitterTypesData[deviceType]++;
				} else {
					chartTransmitterTypesData[deviceType] = 1;
				}
			});
			renderChartTransmitterTypes();

			var usages = $("#formEditTransmitterGroupTransmitters");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");

			// Set Markers on map
			var markerOnline = L.icon({
				iconUrl: "./assets/img/marker-wifi-online.png",
				iconSize: [28, 30],
				iconAnchor: [15, 30],
				popupAnchor: [0, -25]
			});
			var markerOffline = L.icon({
				iconUrl: "./assets/img/marker-wifi-offline.png",
				iconSize: [28, 30],
				iconAnchor: [15, 30],
				popupAnchor: [0, -25]
			});

			if (markers !== undefined && mapInited) map.removeLayer(markers);
			markers = new L.FeatureGroup();
			$.each(data, function(i, item) {
				if ($("#mapWiderangeOnly").prop("checked") && item.usage !== "WIDERANGE") return true;

				var markerIcon = markerOnline;
				if (item.status !== "ONLINE") markerIcon = markerOffline;

				var marker = L.marker([item.latitude, item.longitude], {icon: markerIcon}).bindPopup("<b>" + item.name + "</b><br />" + jQuery.i18n.prop("transmitters_add_power") + ": " + item.power + "<br />" + jQuery.i18n.prop("transmitters_add_timeslot") + ": " + item.timeSlot);
				markers.addLayer(marker);
			});
			if (mapInited) map.addLayer(markers);
		},
		error: handleError
	});
}

// Add / Edit a Transmitter
function putTransmitter() {
	if (checkForInput("container6-detail", ["formEditTransmitterIp", "formEditTransmitterPort", "formEditTransmitterDeviceType", "formEditTransmitterDeviceVersion"])) {
		handleMissingInput();
		return;
	}

	var transmitterName = $("#formEditTransmitterName");
	var urlName = editTransmitterName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = transmitterName.val();
	}

	if (checkForOverwriting(transmitterData, urlName) && !transmitterName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	var timeSlot = "";
	$(".timeslotCheckBox").each(function() {
		if (this.checked) timeSlot += this.id.substring(27);
	});
	var ownerNames = [];
	$("#formEditTransmitterOwners").find("option").each(function() {
		if (this.selected) ownerNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/transmitters/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			nodeName: $("#formEditTransmitterNodeName").val(),
			authKey: $("#formEditTransmitterAuthKey").val(),
			latitude: $("#formEditTransmitterLatitude").val() * $("#formEditTransmitterLatitudeOrientation").val(),
			longitude: $("#formEditTransmitterLongitude").val() * $("#formEditTransmitterLongitudeOrientation").val(),
			power: $("#formEditTransmitterPower").val(),
			usage: $("#formEditTransmitterUsage").val(),
			antennaType: $("#formEditTransmitterAntennaType").val(),
			antennaAboveGroundLevel: $("#formEditTransmitterAntennaLevel").val(),
			antennaDirection: $("#formEditTransmitterAntennaDirection").val(),
			antennaGainDbi: $("#formEditTransmitterAntennaGain").val(),
			timeSlot: timeSlot,
			ownerNames: ownerNames
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromTransmitterDetails();
			loadTransmitters();
		},
		error: handleError
	});
}

// Delete a Transmitter
function deleteTransmitter(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/transmitters/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadTransmitters();
				loadTransmitterGroups();
			},
			error: handleError
		});
	});
}

// Load all TransmitterGroups
function loadTransmitterGroups() {
	$.ajax({
		url: config.apiUrl + "/transmitterGroups",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			transmitterGroupData = data;

			var table = $("#tableTransmitterGroups");
			table.DataTable().destroy();
			table.DataTable({
				data: data,
				language: {
					url: "./assets/langs/DataTables_" + currentLanguage + ".json"
				},
				columns: [
					{data: "name"},
					{data: "description"},
					{data: "transmitterNames[, ]"},
					{data: "ownerNames[, ]"},
					{
						data: function(obj) {
							if (obj.ownerNames.indexOf(currentUsername) !== -1 || isAdmin) {
								return "<a href=\"#7\" onclick=\"editTransmitterGroup('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop("container_table_actions_edit") + "\"></i></a> " +
									"<a href=\"#7\" onclick=\"deleteTransmitterGroup('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop("container_table_actions_delete") + "\"></i></a>";
							} else {
								return "---";
							}
						}
					}
				],
				"responsive": true
			});

			$("#statsTransmitterGroupsTotal").text(data.length);

			var usages = $("#formEditCallTransmitterGroup, #formEditRubricTransmitterGroups, #formActivateRubricTransmitterGroups");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");
		},
		error: handleError
	});
}

// Add / Edit a TransmitterGroup
function putTransmitterGroup() {
	if (checkForInput("container7-detail")) {
		handleMissingInput();
		return;
	}

	var transmitterGroupName = $("#formEditTransmitterGroupName");
	var urlName = editTransmitterGroupName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = transmitterGroupName.val();
	}

	if (checkForOverwriting(transmitterGroupData, urlName) && !transmitterGroupName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	var transmitters = [];
	$("#formEditTransmitterGroupTransmitters").find("option").each(function() {
		if (this.selected) transmitters.push(this.value);
	});
	var ownerNames = [];
	$("#formEditTransmitterGroupOwners").find("option").each(function() {
		if (this.selected) ownerNames.push(this.value);
	});

	$.ajax({
		url: config.apiUrl + "/transmitterGroups/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			description: $("#formEditTransmitterGroupDescription").val(),
			transmitterNames: transmitters,
			ownerNames: ownerNames
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromTransmitterGroupDetails();
			loadTransmitterGroups();
		},
		error: handleError
	});
}

// Delete a TransmitterGroup
function deleteTransmitterGroup(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/transmitterGroups/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadTransmitterGroups();
			},
			error: handleError
		});
	});
}

// Load all Nodes
function loadNodes() {
	$.ajax({
		url: config.apiUrl + "/nodes",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			nodeData = data;

			var table = $("#tableNodes");
			table.DataTable().destroy();
			if (!isAdmin) {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{data: noDataEntry},
						{data: noDataEntry},
						{data: statusFormatter},
						{data: noDataEntry}
					],
					"responsive": true
				});
			} else {
				table.DataTable({
					data: data,
					language: {
						url: "./assets/langs/DataTables_" + currentLanguage + ".json"
					},
					columns: [
						{data: "name"},
						{
							data: function(obj) {
								if (obj.status !== "ONLINE") {
									return "---";
								} else {
									return obj.address.ip_addr;
								}
							}
						},
						{
							data: function(obj) {
								if (obj.status !== "ONLINE") {
									return "---";
								} else {
									return obj.address.port;
								}
							}
						},
						{data: statusFormatter},
						{
							data: function(obj) {
								return "<a href=\"#8\" onclick=\"editNode('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop("container_table_actions_edit") + "\"></i></a> " +
									"<a href=\"#8\" onclick=\"deleteNode('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop("container_table_actions_delete") + "\"></i></a>";
							}
						}
					],
					"responsive": true
				});
			}

			var statCountOnline = 0;
			var statCountOffline = 0;
			$.each(data, function(index, value) {
				if (value.status === "ONLINE") {
					statCountOnline++;
				} else {
					statCountOffline++;
				}
			});
			$("#statsNodesTotal").text(data.length);
			$("#statsStartNodes").text(statCountOnline + " / " + data.length);

			chartNodesData = [statCountOnline, statCountOffline];
			renderChartNode();

			var usages = $("#formEditTransmitterNodeName");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");
		},
		error: handleError
	});
}

// Add / Edit a Node
function putNode() {
	if (checkForInput("container8-detail")) {
		handleMissingInput();
		return;
	}

	var nodeName = $("#formEditNodeName");
	var urlName = editNodeName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = nodeName.val();
	}

	if (checkForOverwriting(nodeData, urlName) && !nodeName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	$.ajax({
		url: config.apiUrl + "/nodes/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			latitude: $("#formEditNodeLatitude").val() * $("#formEditNodeLatitudeOrientation").val(),
			longitude: $("#formEditNodeLongitude").val() * $("#formEditNodeLongitudeOrientation").val(),
			status: $("#formEditNodeStatus").val(),
			key: $("#formEditNodeKey").val()
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromNodeDetails();
			loadNodes();
		},
		error: handleError
	});
}

// Delete a Node
function deleteNode(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/nodes/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadNodes();
			},
			error: handleError
		});
	});
}

// Load all Users
function loadUsers() {
	$.ajax({
		url: config.apiUrl + "/users",
		type: "GET",
		beforeSend: setCookieHeader,
		success: function(data) {
			userData = data;

			var table = $("#tableUsers");
			table.DataTable().destroy();
			table.DataTable({
				data: data,
				language: {
					url: "./assets/langs/DataTables_" + currentLanguage + ".json"
				},
				columns: [
					{data: "name"},
					{data: "mail"},
					{
						data: function(obj) {
							return apiTrueFalse(obj.admin);
						}
					},
					{
						data: function(obj) {
							var usersCallSigns = "";
							$.each(callSignData, function(i, item) {
								if ($.inArray(obj.name, item.ownerNames) != -1) {
									usersCallSigns += item.name + ", ";
								}
							});
							return usersCallSigns.substring(0, usersCallSigns.length - 2);
						}
					},
					{
						data: function(obj) {
							if (obj.name === currentUsername || isAdmin) {
								return "<a href=\"#9\" onclick=\"editUser('" + obj.name + "')\"><i class=\"fa fa-pencil\" title=\"" + jQuery.i18n.prop("container_table_actions_edit") + "\"></i></a> " +
									"<a href=\"#9\" onclick=\"deleteUser('" + obj.name + "')\"><i class=\"fa fa-trash\" title=\"" + jQuery.i18n.prop("container_table_actions_delete") + "\"></i></a>";
							} else {
								return "---";
							}
						}
					}
				],
				"responsive": true
			});

			var statAdmin = 0;
			$.each(data, function(index, value) {
				if (value.admin) statAdmin++;
			});
			$("#statsUsersAdmins").text(statAdmin);
			$("#statsUsersTotal, #statsStartUsers").text(data.length);

			var usages = $("#formEditCallSignOwners, #formEditRubricOwners, #formEditTransmitterOwners, #formEditTransmitterGroupOwners");
			usages.empty();
			$.each(data, function(i, item) {
				usages.append($("<option>", {
					value: item.name,
					text: item.name
				}));
			});
			usages.trigger("chosen:updated");
		},
		error: handleError
	});
}

// Add / Edit a User
function putUser() {
	var userName = $("#formEditUserName");

	// ignore missing password if we're editing an existing user
	if (userName.prop("disabled")) {
		if (checkForInput("container9-detail", ["formEditUserPassword"])) {
			handleMissingInput();
			return;
		}
	} else {
		if (checkForInput("container9-detail")) {
			handleMissingInput();
			return;
		}
	}

	var urlName = editUserName;
	if (urlName === "" || urlName === undefined || urlName === null) {
		urlName = userName.val();
	}

	if (checkForOverwriting(userData, urlName) && !userName.prop("disabled")) {
		handleOverwriteError();
		return;
	}

	$.ajax({
		url: config.apiUrl + "/users/" + urlName,
		type: "PUT",
		contentType: "application/json",
		dataType: "json",
		data: JSON.stringify({
			hash: $("#formEditUserPassword").val(),
			mail: $("#formEditUserMail").val(),
			admin: $("#formEditUserAdmin").prop("checked")
		}),
		beforeSend: setCookieHeader,
		success: function() {
			showSuccessAlert();
			returnFromUserDetails();
			loadUsers();
		},
		error: handleError
	});
}

// Delete a User
function deleteUser(name) {
	if (name === "" || name === null) return;

	showDeleteAlert(function() {
		$.ajax({
			url: config.apiUrl + "/users/" + name,
			type: "DELETE",
			beforeSend: setCookieHeader,
			success: function() {
				showSuccessAlert();
				loadUsers();
			},
			error: handleError
		});
	});
}

function transmitterDeviceType(obj) {
	var imgType = "";
	if (obj.usage === "WIDERANGE") {
		imgType = "<img src=\"./assets/img/transmitter_widerange.png\" title=\"Widerange\" />";
	} else {
		imgType = "<img src=\"./assets/img/transmitter_personal.png\" title=\"Personal\" />";
	}

	if (obj.deviceType === null) obj.deviceType = "";
	return imgType + " " + obj.deviceType;
}

function statusFormatter(obj) {
	if (obj.status === "ONLINE") {
		return "<span class=\"label label-success\">ONLINE</span>";
	} else if (obj.status === "OFFLINE") {
		return "<span class=\"label label-primary\">OFFLINE</span>";
	} else {
		return "<span class=\"label label-warning\">" + obj.status + "</span>";
	}
}

function noDataEntry() {
	return "---";
}

function setCookieHeader(req) {
	req.setRequestHeader("Authorization", "Basic " + Cookies.get("auth"));
}
