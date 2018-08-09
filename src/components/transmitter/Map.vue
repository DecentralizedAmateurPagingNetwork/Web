<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('transmitter.map.title') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<div>{{ $t('general.search') }}: <input v-model="searchQuery"></div>
				<l-map ref="leafletMap" :zoom="zoom" :center="center" style="height: 40em; margin-top: 1em">
					<l-group v-for="item in coverageLayers" :key="item.name">
						<l-image-overlay :url="item.url" :bounds="item.bounds" :opacity="0.8"></l-image-overlay>
					</l-group>
					<l-tilelayer :url="url" :attribution="attribution"></l-tilelayer>
					<v-marker-cluster>
						<l-marker v-for="item in markerTransmitter" :key="item.name" :lat-lng="item.position" :icon="item.icon" v-on:click="showCoverage(item.name)">
							<l-popup :content="item.popup"></l-popup>
						</l-marker>
					</v-marker-cluster>
					<l-marker v-for="item in markerNodes" :key="item.name" :lat-lng="item.position" :icon="item.icon">
						<l-popup :content="item.popup"></l-popup>
					</l-marker>
					<l-polyline v-for="item in lines" :key="item.name" :lat-lngs="item.position" :color="item.color"></l-polyline>
				</l-map>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-8">
				<h2>{{ $t('transmitter.map.settings.title') }}</h2>
				<div class="checkbox">
					<label><input type="checkbox" v-model="settings.onlineOnly"> {{ $t('transmitter.map.checkbox.showonlineonly') }}</label><br>
					<label><input type="checkbox" v-model="settings.widerangeOnly"> {{ $t('transmitter.map.checkbox.showwiderangeonly') }}</label><br><br>
					<label><input type="checkbox" v-model="settings.timeslot.active"> {{ $t('transmitter.map.checkbox.showbytimeslot') }}</label>
						<input type="text" placeholder="timeslots" v-model="settings.timeslot.input" :disabled="!settings.timeslot.active"><br><br>
					<label><input type="checkbox" v-model="settings.showNodes"> {{ $t('transmitter.map.checkbox.shownodes') }}</label><br>
					<label><input type="checkbox" v-model="settings.showLines" :disabled="!settings.showNodes"> {{ $t('transmitter.map.checkbox.shownodeline') }}</label>
				</div>
			</div>
			<div class="col-lg-4">
				<h2>{{ $t('general.actions') }}</h2>
				<div class="checkbox">
					<ul>
						<li><p class="linklike" @click="showAllCoverage">{{ $t('transmitter.map.actions.showallcoverage') }}</p></li>
						<li><p class="linklike" @click="removeAllCoverage">{{ $t('transmitter.map.actions.removeallcoverage') }}</p></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import Vue2Leaflet from 'vue2-leaflet';
	import Vue2LeafletMarkercluster from 'vue2-leaflet-markercluster';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.fullscreen/Control.FullScreen.js';
	import 'leaflet.fullscreen/Control.FullScreen.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	Vue.component('l-map', Vue2Leaflet.LMap);
	Vue.component('l-group', Vue2Leaflet.LLayerGroup);
	Vue.component('l-image-overlay', Vue2Leaflet.LImageOverlay);
	Vue.component('l-tilelayer', Vue2Leaflet.LTileLayer);
	Vue.component('l-marker', Vue2Leaflet.LMarker);
	Vue.component('l-popup', Vue2Leaflet.LPopup);
	Vue.component('l-polyline', Vue2Leaflet.LPolyline);
	Vue.component('v-marker-cluster', Vue2LeafletMarkercluster);

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

			this.icons.iconTransmitterWiderangeOnline = L.icon({
				iconUrl: './assets/img/marker-transmitter-widerange-online.png',
				iconSize: [32, 32],
				iconAnchor: [0, 16],
				popupAnchor: [16, -12]
			});

			this.icons.iconTransmitterWiderangeOffline = L.icon({
				iconUrl: './assets/img/marker-transmitter-widerange-offline.png',
				iconSize: [32, 32],
				iconAnchor: [0, 16],
				popupAnchor: [16, -12]
			});

			this.icons.iconTransmitterPersonalOnline = L.icon({
				iconUrl: './assets/img/marker-transmitter-personal-online.png',
				iconSize: [32, 32],
				iconAnchor: [0, 16],
				popupAnchor: [22, -12]
			});

			this.icons.iconTransmitterPersonalOffline = L.icon({
				iconUrl: './assets/img/marker-transmitter-personal-offline.png',
				iconSize: [32, 32],
				iconAnchor: [0, 16],
				popupAnchor: [22, -12]
			});

			// load transmitters and nodes
			this.$http.get('nodes').then(response => {
				this.data.nodes = response.body;

				this.$http.get('transmitters').then(response => {
					this.data.transmitters = response.body;

					// create map out of loaded data
					this.createMap();
				});
			});
		},
		mounted() {
			this.$nextTick(() => {
				// add scale to map
				L.control.scale({ imperial: false }).addTo(this.$refs.leafletMap.mapObject);

				// add fullscreen button to map
				L.control.fullscreen().addTo(this.$refs.leafletMap.mapObject);
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
				markerTransmitter: [],
				markerNodes: [],
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
						popupIp = '<br>IP: ' + node.address.ip_addr + ':' + node.address.port;
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
					let selectedMarkerIcon;
					if (transmitter.usage === 'WIDERANGE') {
						selectedMarkerIcon = this.icons.iconTransmitterWiderangeOnline;
						if (transmitter.status !== 'ONLINE') {
							selectedMarkerIcon = this.icons.iconTransmitterWiderangeOffline;
						}
					} else if (transmitter.usage === 'PERSONAL') {
						selectedMarkerIcon = this.icons.iconTransmitterPersonalOnline;
						if (transmitter.status !== 'ONLINE') {
							selectedMarkerIcon = this.icons.iconTransmitterPersonalOffline;
						}
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
						popup: '<b>' + nameLink + '</a></b><br>' +
							'Transmission Power (W): ' + transmitter.power + '<br>' +
							'Height (m): ' + transmitter.antennaAboveGroundLevel + '<br>' +
							'Timeslot: ' + transmitter.timeSlot + '<br>' +
							'Owner: ' + transmitter.ownerNames.join(', ') + '<br><br>' +
							'<a href="/#/transmitters/map/' + transmitter.name + '">' + this.$i18n.t('general.permalink') + '</a>',
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

					// center given transmitter (if required)
					if (this.$route.params.id && this.$route.params.id === transmitter.name) {
						this.center = [transmitter.latitude, transmitter.longitude];

						// very ugly workaround to allow zooming into the given transmitter
						// needed, because otherwise the map will zoom into the old center
						setTimeout(() => {
							this.zoom = 10;
						}, 500);
					}
				});

				this.markerTransmitter = markerTransmitters;
				this.markerNodes = markerNodes;
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
					title: this.$i18n.t('transmitter.map.alerts.load.title'),
					text: this.$i18n.t('transmitter.map.alerts.load.text'),
					type: 'question',
					showCancelButton: true,
					confirmButtonText: this.$i18n.t('general.continue'),
					cancelButtonText: this.$i18n.t('general.abort')
				}).then(result => {
					if (!result.value) return false;

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
							title: this.$i18n.t('transmitter.map.alerts.confirm.title'),
							html: this.$i18n.t('transmitter.map.alerts.confirm.text', { amount: String(showCoverageOf.length) }),
							type: 'warning',
							showCancelButton: true,
							confirmButtonText: this.$i18n.t('transmitter.map.alerts.confirm.continue'),
							cancelButtonText: this.$i18n.t('general.abort')
						}).then(result => {
							if (result.value) helper(showCoverageOf);
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
			removeOrphanedCoverageLayers() {
				this.coverageLayers.forEach(layer => {
					let layerName = layer.name.substring(2);
					if (!layerName.includes(this.searchQuery.toLowerCase())) {
						this.coverageLayers = this.coverageLayers.filter(item => item !== layer);
					}
				});
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
				this.removeOrphanedCoverageLayers();
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
