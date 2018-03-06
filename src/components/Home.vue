<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="jumbotron">
					<carousel :autoplay="true" :autoplay-hover-pause="true" :autoplay-timeout="5000" :loop="true" :navigation-enabled="true" :per-page="1" pagination-color="#d0d0d0" pagination-active-color="#a0a0a0">
						<template v-for="index in 10">
							<slide :key="index">
								<div class="row">
									<div class="col-lg-8">
										<h2>{{ $t('home.carousel.' + index + '.title') }}</h2>
										<p v-html="$t('home.carousel.' + index + '.text')"></p>
									</div>
									<div class="col-lg-4">
										<template v-if="getLink(index)">
											<a :href="getLink(index)" target="_blank"><img :src="'./assets/img/carousel/img' + index + '.png'" alt="Carousel Item" /></a>
										</template>
										<template v-else>
											<img :src="'./assets/img/carousel/img' + index + '.png'" alt="Carousel Item" />
										</template>
									</div>
								</div>
							</slide>
						</template>
					</carousel>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-4">
				<h2>{{ $t('home.information.dapnet.title') }}</h2>
				<div class="well">
					<img src="~@/assets/img/afu-dapnet-logo.png" alt="DAPNET Logo"/>
					<h3>{{ $t('home.information.dapnet.projects') }}</h3>
					<ul>
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork/Core" target="_blank">DAPNET Core</a></li>
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork/Web" target="_blank">DAPNET Web</a></li>
						<li>
							<a href="https://github.com/DecentralizedAmateurPagingNetwork/DAPNETApp" target="_blank">DAPNET App</a><br>
							<a href="https://play.google.com/store/apps/details?id=de.hampager.dapnetmobile" target="_blank"><img src="~@/assets/img/google-play.png" style="width: 50%" alt="Google Play" /></a>
						</li>
						<li><a href="https://github.com/rwth-afu/raspager-proxy" target="_blank">DAPNET Proxy</a></li>
						<li><a href="https://github.com/rwth-afu/UniPager" target="_blank">UniPager</a></li>
					</ul>
				</div>
			</div>

			<div class="col-lg-4">
				<h2>{{ $t('general.information') }}</h2>
				<p v-html="this.$store.getters.customText"></p>
				<v-map :zoom="map.zoom" :center="map.center" style="height: 30em; margin-top: 1em">
					<v-group v-for="item in map.coverageLayers" :key="item.name">
						<v-image-overlay :url="item.url" :bounds="item.bounds" :opacity="0.8"></v-image-overlay>
					</v-group>
					<v-tilelayer :url="map.url" :attribution="map.attribution"></v-tilelayer>
					<v-marker v-for="item in map.markers" :key="item.name" :lat-lng="item.position" :icon="item.icon" v-on:l-click="showCoverage(item.name)">
						<v-popup :content="item.popup"></v-popup>
					</v-marker>
				</v-map>
				<p v-if="this.$store.getters.isUserLoggedIn"><router-link to="/transmitters/map">{{ $t('home.information.map') }}</router-link></p>
			</div>

			<div class="col-lg-4">
				<h2>{{ $t('general.statistics') }}
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': stats.running }" @click="loadData"></i>
				</h2>

				<info-error :message="stats.errorMessage"></info-error>

				<ul v-if="stats.data" class="list-group">
					<li class="list-group-item"><b>{{ $t('home.information.statistics.calls') }}</b><span class="badge">{{ stats.data.calls }}</span></li>
					<li class="list-group-item"><b>{{ $t('navigation.subscribers') }}</b><span class="badge">{{ stats.data.callSigns }}</span></li>
					<li class="list-group-item"><b>{{ $t('home.information.statistics.rubric-content') }}</b><span class="badge">{{ stats.data.news }}</span></li>
					<li class="list-group-item"><b>{{ $t('home.information.statistics.rubrics') }}</b><span class="badge">{{ stats.data.rubrics }}</span></li>
					<li class="list-group-item"><b>{{ $t('home.information.statistics.transmitters') }}</b><span class="badge">{{ statTransmitter }}</span></li>
					<li class="list-group-item"><b>{{ $t('home.information.statistics.nodes') }}</b><span class="badge">{{ statNodes }}</span></li>
					<li class="list-group-item"><b>{{ $t('home.information.statistics.users') }}</b><span class="badge">{{ stats.data.users }}</span></li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import Vue2Leaflet from 'vue2-leaflet';
	import L from 'leaflet';
	import '../../node_modules/leaflet/dist/leaflet.css';
	Vue.component('v-map', Vue2Leaflet.Map);
	Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
	Vue.component('v-marker', Vue2Leaflet.Marker);
	Vue.component('v-popup', Vue2Leaflet.Popup);

	export default {
		created() {
			this.loadData();
			this.loadMap();
		},
		data() {
			return {
				map: {
					zoom: this.$store.getters.map.zoom,
					center: this.$store.getters.map.center,
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
					url: this.$store.getters.url.map,
					markers: [],
					coverageLayers: []
				},
				stats: {
					errorMessage: false,
					running: false,
					data: false
				}
			};
		},
		computed: {
			statTransmitter() {
				return this.stats.data.transmittersOnline + ' / ' + this.stats.data.transmittersTotal;
			},
			statNodes() {
				return this.stats.data.nodesOnline + ' / ' + this.stats.data.nodesTotal;
			}
		},
		methods: {
			loadData() {
				this.stats.running = true;
				this.$http.get('stats').then(response => {
					// success --> save new statistics
					this.stats.data = response.body;
					this.stats.running = false;
					this.stats.errorMessage = false;
				}, response => {
					// error --> show error message
					this.stats.running = false;

					if (response.status === 0) {
						this.stats.errorMessage = this.$i18n.t('rest.errors.api-unreachable');
					} else {
						this.stats.errorMessage = this.$i18n.t('rest.errors.http-error', { status: response.status });
					}
				});
			},
			loadMap() {
				const icon = L.icon({
					iconUrl: './assets/img/marker-transmitter-online.png',
					iconSize: [28, 30],
					iconAnchor: [15, 30],
					popupAnchor: [0, -25]
				});

				this.$http.get('transmitters').then(response => {
					const transmitters = response.body;

					transmitters.forEach(transmitter => {
						if (transmitter.status !== 'ONLINE') return true;

						// build marker
						this.map.markers.push({
							name: 't_' + transmitter.name,
							position: {
								lat: transmitter.latitude,
								lng: transmitter.longitude
							},
							popup: '<b>' + transmitter.name + '</a></b><br>' +
							'Usage: ' + transmitter.usage + '<br>' +
							'Transmission Power (W): ' + transmitter.power + '<br>' +
							'Height (m): ' + transmitter.antennaAboveGroundLevel + '<br>' +
							'Timeslot: ' + transmitter.timeSlot + '<br>' +
							'Owner: ' + transmitter.ownerNames.join(', '),
							icon: icon
						});
					});
				});
			},
			showCoverage(name) {
				name = name.substring(2);

				// remove clicked transmitter's overlay (if shown) and stop
				let stop = false;
				this.map.coverageLayers.forEach(layer => {
					if (layer.name.substring(2) === name) {
						this.map.coverageLayers = this.map.coverageLayers.filter(item => item !== layer);
						stop = true;
					}
				});
				if (stop) return false;

				// load transmitter-coverage-information (if available)
				this.$http.get('/assets/coverage/' + name + '.txt').then(response => {
					let lines = response.body.split('\n');

					this.map.coverageLayers.push({
						name: 'c_' + name,
						url: '/assets/coverage/' + name + '.png',
						bounds: [[lines[1], lines[3]], [lines[2], lines[4]]]
					});
				}, () => {
					// 404 if no data found
				});
			},
			getLink(index) {
				return this.$i18n.t('home.carousel.' + index + '.link');
			}
		}
	};
</script>

<style scoped>
	img {
		width: 100%;
	}

	.jumbotron {
		margin-top: 50px;
	}

	.jumbotron > p {
		font-size: 1.2em;
	}
</style>
