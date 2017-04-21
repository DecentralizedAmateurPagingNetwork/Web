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
				</v-map>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<h2>Settings</h2>
				<div class="row">
					<div class="col-lg-1"><input type="checkbox" v-model="settings.widerangeOnly"></div>
					<div class="col-lg-11"><label>Show Widerange-transmitter only</label></div>
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

	export default {
		created() {
			this.createMap();
		},
		data() {
			return {
				settings: {
					widerangeOnly: true
				},
				zoom: this.$store.getters.map.zoom,
				center: this.$store.getters.map.center,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
				url: this.$store.getters.url.map,
				markers: []
			};
		},
		methods: {
			createMap() {
				let iconOnline = L.icon({
					iconUrl: './assets/img/marker-wifi-online.png',
					iconSize: [28, 30],
					iconAnchor: [15, 30],
					popupAnchor: [0, -25]
				});

				let iconOffline = L.icon({
					iconUrl: './assets/img/marker-wifi-offline.png',
					iconSize: [28, 30],
					iconAnchor: [15, 30],
					popupAnchor: [0, -25]
				});

				this.$http.get('transmitters').then(response => {
					let myMarkers = [];
					response.body.forEach(transmitter => {
						// check for widerange-setting
						if (this.settings.widerangeOnly && transmitter.usage !== 'WIDERANGE') {
							return true;
						}

						// find icon
						let selectedMarkerIcon = iconOnline;
						if (transmitter.status !== 'ONLINE') {
							selectedMarkerIcon = iconOffline;
						}

						// build marker
						myMarkers.push({
							name: transmitter.name,
							position: {
								lat: transmitter.latitude,
								lng: transmitter.longitude
							},
							popup: '<b>' + transmitter.name + '</b><br />Transmission Power (W): ' + transmitter.power + '<br />Timeslot: ' + transmitter.timeSlot,
							icon: selectedMarkerIcon
						});
					});
					this.markers = myMarkers;
				});
			}
		},
		watch: {
			'settings.widerangeOnly'() {
				this.createMap();
			}
		}
	};
</script>

<style scoped>

</style>
