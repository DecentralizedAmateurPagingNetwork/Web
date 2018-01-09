<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Map</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<div>Search: <input v-model="searchQuery"></div>
				<v-map ref="leafletMap" :zoom="zoom" :center="center" style="height: 40em; margin-top: 1em">
					<v-group v-for="item in coverageLayers" :key="item.name">
						<v-image-overlay :url="item.url" :bounds="item.bounds" :opacity="0.8"></v-image-overlay>
					</v-group>
					<v-tilelayer :url="url" :attribution="attribution"></v-tilelayer>
					<v-marker v-for="item in markers" :key="item.name" :lat-lng="item.position" :icon="item.icon" v-on:l-click="showCoverage(item.name)">
						<v-popup :content="item.popup"></v-popup>
					</v-marker>
					<v-polyline v-for="item in lines" :key="item.name" :lat-lngs="item.position" :color="item.color"></v-polyline>
				</v-map>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-8">
				<h2>Settings</h2>
				<div class="checkbox">
					<label><input type="checkbox" v-model="settings.onlineOnly"> Show online transmitters only</label><br />
					<label><input type="checkbox" v-model="settings.widerangeOnly"> Show Widerange-transmitter only</label><br /><br />
					<label><input type="checkbox" v-model="settings.timeslot.active"> Show transmitters by timeslots </label>
						<input type="text" placeholder="timeslots" v-model="settings.timeslot.input" :disabled="!settings.timeslot.active"><br /><br />
					<label><input type="checkbox" v-model="settings.showNodes"> Show nodes</label><br />
					<label><input type="checkbox" v-model="settings.showLines" :disabled="!settings.showNodes"> Show line from transmitter to node</label>
				</div>
			</div>
			<div class="col-lg-4">
				<h2>Actions</h2>
				<div class="checkbox">
					<ul>
						<li><p class="linklike" @click="showAllCoverage">Show all coverage-overlays</p></li>
						<li><p class="linklike" @click="removeAllCoverage">Remove all coverage-overlays</p></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import Vue2Leaflet from 'vue2-leaflet';
	import L from 'leaflet';
	import '../../../node_modules/leaflet/dist/leaflet.css';
	Vue.component('v-map', Vue2Leaflet.Map);
	Vue.component('v-group', Vue2Leaflet.LayerGroup);
	Vue.component('v-image-overlay', Vue2Leaflet.ImageOverlay);
	Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
	Vue.component('v-marker', Vue2Leaflet.Marker);
	Vue.component('v-popup', Vue2Leaflet.Popup);
	Vue.component('v-polyline', Vue2Leaflet.Polyline);

	export default {
		created() {
			// create icons
			this.icons.iconNodeOnline = L.icon({
				iconUrl: './assets/img/marker-node-online.png',
				iconSize: [30, 30],
				iconAnchor: [15, 15],
				popupAnchor: [0, 0]
			});

			this.icons.iconNodeSuspended = L.icon({
				iconUrl: './assets/img/marker-node-suspended.png',
				iconSize: [30, 30],
				iconAnchor: [15, 15],
				popupAnchor: [0, 0]
			});

			this.icons.iconNodeUnknown = L.icon({
				iconUrl: './assets/img/marker-node-unknown.png',
				iconSize: [30, 30],
				iconAnchor: [15, 15],
				popupAnchor: [0, 0]
			});

			this.icons.iconTransmitterOnline = L.icon({
				iconUrl: './assets/img/marker-transmitter-online.png',
				iconSize: [28, 30],
				iconAnchor: [15, 30],
				popupAnchor: [0, -25]
			});

			this.icons.iconTransmitterOffline = L.icon({
				iconUrl: './assets/img/marker-transmitter-offline.png',
				iconSize: [28, 30],
				iconAnchor: [15, 30],
				popupAnchor: [0, -25]
			});

			// load transmitters and nodes
			this.$http.get('nodes').then(response => {
				this.data.nodes = response.body;

				this.$http.get('transmitters').then(response => {
					this.data.transmitters = response.body;

					// add scale to map
					L.control.scale({ imperial: false }).addTo(this.$refs.leafletMap.mapObject);

					// create map out of loaded data
					this.createMap();
				});
			});
		},
		data() {
			return {
				data: {
					nodes: [],
					transmitters: []
				},
				searchQuery: '',
				settings: {
					onlineOnly: true,
					widerangeOnly: true,
					timeslot: {
						active: false,
						input: ''
					},
					showNodes: false,
					showLines: false
				},
				zoom: this.$store.getters.map.zoom,
				center: this.$store.getters.map.center,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
				url: this.$store.getters.url.map,
				icons: {},
				markers: [],
				lines: [],
				coverageLayers: []
			};
		},
		methods: {
			createMap() {
				// get node markers
				let markerNodes = [];
				this.data.nodes.forEach(node => {
					// check for search-input
					if (!node.name.includes(this.searchQuery.toLowerCase())) {
						return true;
					}

					// find icon
					let selectedMarkerIcon = this.icons.iconNodeOnline;
					if (node.status === 'SUSPENDED') {
						selectedMarkerIcon = this.icons.iconNodeSuspended;
					} else if (node.status !== 'ONLINE') {
						selectedMarkerIcon = this.icons.iconNodeUnknown;
					}

					// set ip-address (if applicable)
					let popupIp = '';
					if (node.address !== undefined && node.address !== null) {
						popupIp = '<br />IP: ' + node.address.ip_addr + ':' + node.address.port;
					}

					// build marker
					let nameLink = '<a href="/#/nodes/edit/' + node.name + '">' + node.name + '</a>';
					if (!this.$store.getters.user.admin) {
						nameLink = node.name;
					}
					if (this.settings.showNodes) {
						markerNodes.push({
							name: 'n_' + node.name,
							position: {
								lat: node.latitude,
								lng: node.longitude
							},
							popup: '<b>' + nameLink + '</b>' + popupIp,
							icon: selectedMarkerIcon
						});
					}
				});

				// get transmitter markers
				let markerTransmitters = [];
				let polylineTransmitters = [];

				this.data.transmitters.forEach(transmitter => {
					if (this.skipThisTransmitter(transmitter)) return true;

					// find icon
					let selectedMarkerIcon = this.icons.iconTransmitterOnline;
					if (transmitter.status !== 'ONLINE') {
						selectedMarkerIcon = this.icons.iconTransmitterOffline;
					}

					// build marker
					let nameLink = '<a href="/#/transmitters/edit/' + transmitter.name + '">' + transmitter.name + '</a>';
					if (!this.$store.getters.user.admin) {
						nameLink = transmitter.name;
					}
					markerTransmitters.push({
						name: 't_' + transmitter.name,
						position: {
							lat: transmitter.latitude,
							lng: transmitter.longitude
						},
						popup: '<b>' + nameLink + '</a></b><br />' +
							'Usage: ' + transmitter.usage + '<br />' +
							'Transmission Power (W): ' + transmitter.power + '<br />' +
							'Height (m): ' + transmitter.antennaAboveGroundLevel + '<br />' +
							'Timeslot: ' + transmitter.timeSlot + '<br/>' +
							'Owner: ' + transmitter.ownerNames.join(', '),
						icon: selectedMarkerIcon
					});

					// build line to node
					if (this.settings.showLines && this.settings.showNodes) {
						this.data.nodes.forEach(node => {
							if (node.name === transmitter.nodeName) {
								// check if markerNodes includes the current node
								let drawLine = false;
								markerNodes.forEach(markerNode => {
									if (markerNode.name === 'n_' + node.name) drawLine = true;
								});

								if (drawLine) {
									polylineTransmitters.push({
										name: 'l_' + transmitter.name,
										position: [[node.latitude, node.longitude], [transmitter.latitude, transmitter.longitude]],
										color: this.$helpers.stringToColor(node.name)
									});
								}
							}
						});
					}
				});

				this.markers = markerNodes.concat(markerTransmitters);
				this.lines = polylineTransmitters;
			},
			showCoverage(name) {
				// check if the user clicked on a transmitter and fix name
				if (name.substring(0, 2) !== 't_') {
					return false;
				} else {
					name = name.substring(2);
				}

				// remove clicked transmitter's overlay (if shown) and stop
				let stop = false;
				this.coverageLayers.forEach(layer => {
					let layerName = layer.name.substring(2);
					if (layerName === name) {
						this.coverageLayers = this.coverageLayers.filter(item => item !== layer);
						stop = true;
					}
				});
				if (stop) return false;

				// load transmitter-coverage-information (if available)
				this.$http.get('/assets/coverage/' + name + '.txt').then(response => {
					let lines = response.body.split('\n');

					this.coverageLayers.push({
						name: 'c_' + name,
						url: '/assets/coverage/' + name + '.png',
						bounds: [[lines[1], lines[3]], [lines[2], lines[4]]]
					});
				}, () => {
					// 404 if no data found
				});
			},
			showAllCoverage() {
				this.$swal({
					title: 'Load coverage-overlays?',
					text: 'Press "Continue" to load all coverage-overlays for the currently visible transmitters. This may take some time and put your device under heavy load.',
					type: 'question',
					showCancelButton: true,
					confirmButtonText: 'Continue',
					cancelButtonText: 'Cancel'
				}).then(() => {
					// check if transmitter is in current map bounds and visible
					let showCoverageOf = [];
					const mapBounds = this.$refs.leafletMap.mapObject.getBounds();
					this.data.transmitters.forEach(transmitter => {
						if (this.skipThisTransmitter(transmitter)) return true;

						const transmitterPos = L.latLng(transmitter.latitude, transmitter.longitude);
						if (mapBounds.contains(transmitterPos)) {
							showCoverageOf.push(transmitter);
						}
					});

					// check if the number of overlays exceeds a threshold of 20
					if (showCoverageOf.length >= 20) {
						this.$swal({
							title: 'Are you really sure?',
							html: 'You are going to load and display the coverage of <b>' + showCoverageOf.length + ' transmitters</b>. This will take some time and put your device under heavy load.',
							type: 'warning',
							showCancelButton: true,
							confirmButtonText: 'Yes, I am sure and I won\'t blame the developer if my browser crashes',
							cancelButtonText: 'Cancel'
						}).then(() => {
							helper(showCoverageOf);
						});
					} else {
						helper(showCoverageOf);
					}
				});

				const helper = transmitterList => {
					this.removeAllCoverage();
					transmitterList.forEach(transmitter => {
						this.showCoverage('t_' + transmitter.name);
					});
				};
			},
			removeAllCoverage() {
				this.coverageLayers = [];
			},
			skipThisTransmitter(transmitter) {
				// check for hideOffline-setting
				if (this.settings.onlineOnly && transmitter.status !== 'ONLINE') {
					return true;
				}

				// check for search-input
				if (!transmitter.name.includes(this.searchQuery.toLowerCase())) {
					return true;
				}

				// check for widerange-setting
				if (this.settings.widerangeOnly && transmitter.usage !== 'WIDERANGE') {
					return true;
				}

				// check for timeslot-input
				if (this.settings.timeslot.active && !transmitter.timeSlot.includes(this.settings.timeslot.input.toUpperCase())) {
					return true;
				}

				return false;
			}
		},
		watch: {
			'searchQuery'() {
				this.createMap();
			},
			'settings.onlineOnly'() {
				this.createMap();
			},
			'settings.widerangeOnly'() {
				this.createMap();
			},
			'settings.timeslot.active'() {
				this.createMap();
			},
			'settings.timeslot.input'() {
				this.createMap();
			},
			'settings.showNodes'() {
				if (!this.settings.showNodes) {
					this.settings.showLines = false;
				}
				this.createMap();
			},
			'settings.showLines'() {
				this.createMap();
			}
		}
	};
</script>

<style scoped>

</style>
