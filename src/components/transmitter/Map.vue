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
				<v-map :zoom="zoom" :center="center" style="height:40em">
					<v-tilelayer :url="url" :attribution="attribution"></v-tilelayer>
					<v-marker v-for="item in markers" :key="item.name" :lat-lng="item.position" :icon="item.icon">
						<v-popup :content="item.popup"></v-popup>
					</v-marker>
					<v-polyline v-for="item in lines" :key="item.name" :lat-lngs="item.position" :color="item.color"></v-polyline>
				</v-map>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<h2>Settings</h2>
				<div class="checkbox">
					<label><input type="checkbox" v-model="settings.widerangeOnly"> Show Widerange-transmitter only</label><br /><br />
					<label><input type="checkbox" v-model="settings.timeslot.active"> Show transmitters by timeslots </label>
						<input v-model="settings.timeslot.input" :disabled="!settings.timeslot.active"><br /><br />
					<label><input type="checkbox" v-model="settings.showNodes"> Show nodes</label><br />
					<label v-if="settings.showNodes"><input type="checkbox" v-model="settings.showLines"> Show line from transmitter to node</label>
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
				settings: {
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
				lines: []
			};
		},
		methods: {
			createMap() {
				// get node markers
				let markerNodes = [];
				this.data.nodes.forEach(node => {
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
					if (this.settings.showNodes) {
						markerNodes.push({
							name: node.name,
							position: {
								lat: node.latitude,
								lng: node.longitude
							},
							popup: '<b>' + node.name + '</b>' + popupIp,
							icon: selectedMarkerIcon
						});
					}
				});

				// get transmitter markers
				let markerTransmitters = [];
				let polylineTransmitters = [];

				this.data.transmitters.forEach(transmitter => {
					// check for widerange-setting
					if (this.settings.widerangeOnly && transmitter.usage !== 'WIDERANGE') {
						return true;
					}

					// check for timeslot-input
					if (this.settings.timeslot.active && !transmitter.timeSlot.includes(this.settings.timeslot.input)) {
						return true;
					}

					// find icon
					let selectedMarkerIcon = this.icons.iconTransmitterOnline;
					if (transmitter.status !== 'ONLINE') {
						selectedMarkerIcon = this.icons.iconTransmitterOffline;
					}

					// build marker
					markerTransmitters.push({
						name: transmitter.name,
						position: {
							lat: transmitter.latitude,
							lng: transmitter.longitude
						},
						popup: '<b>' + transmitter.name + '</b><br />Usage: ' + transmitter.usage + '<br />Transmission Power (W): ' + transmitter.power + '<br />Timeslot: ' + transmitter.timeSlot + '<br/>Owner: ' + transmitter.ownerNames.join(', '),
						icon: selectedMarkerIcon
					});

					// build line to node
					if (this.settings.showLines && this.settings.showNodes) {
						this.data.nodes.forEach(node => {
							if (node.name === transmitter.nodeName) {
								polylineTransmitters.push({
									name: transmitter.name,
									position: [[node.latitude, node.longitude], [transmitter.latitude, transmitter.longitude]],
									color: this.$helpers.stringToColor(node.name)
								});
							}
						});
					}
				});

				this.markers = markerNodes.concat(markerTransmitters);
				this.lines = polylineTransmitters;
			}
		},
		watch: {
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
