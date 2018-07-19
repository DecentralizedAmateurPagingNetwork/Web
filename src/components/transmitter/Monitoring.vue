<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('pagetitle.transmitter.monitoring') }}: {{ $route.params.id }}</h1>
				</div>
			</div>
		</div>

		<div class="row" v-if="ws.readyState === 1">
			<div class="col-lg-3">
				<h2>General Status</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>Connected</b>
						<span class="badge" :class="[monitoringData.node.connected ? 'badge-success' : 'badge-danger']">{{ monitoringData.node.connected | trueFalse }}</span>
					</li>
					<li class="list-group-item"><b>On-Air</b>
						<span class="badge" :class="[monitoringData.onair ? 'badge-success' : 'badge-danger']">{{ monitoringData.onair | trueFalse }}</span>
					</li>
					<li class="list-group-item"><b>Node</b><span class="badge">{{ monitoringData.node.name }}</span></li>
					<li class="list-group-item"><b>Connected Since</b><span class="badge">{{ monitoringData.node.connected_since | parseDate }}</span></li>
					<li class="list-group-item"><b>IP</b><span class="badge">{{ monitoringData.node.ip }}:{{ monitoringData.node.port }}</span></li>
					<li class="list-group-item"><b>Software</b><span class="badge">{{ monitoringData.config.software.name }} v{{ monitoringData.config.software.version }}</span></li>
					<li class="list-group-item"><b>Hardware</b><span class="badge">{{ monitoringData.hardware.platform }}</span></li>
				</ul>
			</div>
			<div class="col-lg-3">
				<h2>RF Hardware</h2>
				<ul class="list-group">
					<li class="list-group-item" v-for="(iData, iName) in monitoringData.rf_hardware[Object.keys(monitoringData.rf_hardware)[0]]" :key="iName">
						<b><code>{{ iName }}</code></b><span class="badge">{{ iData }}</span>
					</li>
				</ul>
			</div>
			<div class="col-lg-6">
				<h2>Temperatures</h2>
				<chart-temperature :chartData="chartDataTemperature"></chart-temperature>
			</div>
		</div>
		<div class="row" v-if="ws.readyState === 1">
			<div class="col-lg-6">
				<h2>Message Queue and Scheduling</h2>
				<div class="row">
					<div class="col-lg-8">
						<div class="row">
							<div class="col-lg-12">
								<h3>Queue</h3>
								<table class="table table-striped">
									<thead>
										<tr>
											<th>High</th>
											<th>High-Medium</th>
											<th>Medium</th>
											<th>Medium-Low</th>
											<th>Low</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{{ monitoringData.messages.queued[0] }}</td>
											<td>{{ monitoringData.messages.queued[1] }}</td>
											<td>{{ monitoringData.messages.queued[2] }}</td>
											<td>{{ monitoringData.messages.queued[3] }}</td>
											<td>{{ monitoringData.messages.queued[4] }}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-12">
								<h3>Timeslots</h3>
								<span class="label label-timeslot" v-for="s in timeslotData" :key="s.name" :class="[s.active ? 'label-info' : 'label-default']">{{ s.name }}</span>
							</div>
						</div>
					</div>
					<div class="col-lg-4">
						<h3>Graph</h3>
						<chart-message-queue :chartData="chartDataMessageQueue"></chart-message-queue>
					</div>
				</div>
			</div>
			<div class="col-lg-3">
				<h2>NTP Sync</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>Synced</b>
						<span class="badge" :class="[monitoringData.ntp.synced ? 'badge-success' : 'badge-danger']">{{ monitoringData.ntp.synced | trueFalse }}</span>
					</li>
					<li class="list-group-item" v-if="monitoringData.ntp.offset"><b>Offset</b><span class="badge">{{ monitoringData.ntp.offset }}</span></li>
					<li class="list-group-item" v-for="s in monitoringData.ntp.servers" :key="s"><b>Server</b><span class="badge">{{ s }}</span></li>
				</ul>
			</div>
			<div class="col-lg-3">
				<h2>Power Supply</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>On Battery</b>
						<span class="badge" :class="[monitoringData.power_supply.on_battery ? 'badge-danger' : 'badge-success']">{{ monitoringData.power_supply.on_battery | trueFalse }}</span>
					</li>
					<li class="list-group-item"><b>On Emergency Power</b>
						<span class="badge" :class="[monitoringData.power_supply.on_emergency_power ? 'badge-danger' : 'badge-success']">{{ monitoringData.power_supply.on_emergency_power | trueFalse }}</span>
					</li>
					<li class="list-group-item"><b>DC Input Voltage</b><span class="badge">{{ monitoringData.power_supply.dc_input_voltage }} V</span></li>
					<li class="list-group-item"><b>DC Input Current</b><span class="badge">{{ monitoringData.power_supply.dc_input_current }} A</span></li>
				</ul>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<h2 v-on:click="showRawData = !showRawData">Raw Data</h2>
				<pre v-if="showRawData"><code>{{ monitoringData }}</code></pre>
			</div>
		</div>
	</div>
</template>

<script>
	import ChartMessageQueue from '@/components/charts/MessageQueue';
	import ChartTemperature from '@/components/charts/Temperature';

	export default {
		components: {
			ChartMessageQueue,
			ChartTemperature
		},
		created() {
			if (!this.$route.params.id) return;

			this.ws = new WebSocket(this.$store.getters.url.telemetry + '/transmitters');
			this.ws.addEventListener('message', e => {
				let data = JSON.parse(e.data);

				// this transmitter only
				if (data.name !== this.$route.params.id) return;

				if (!this.monitoringData) {
					// save initial copy of data
					this.monitoringData = data;
				} else {
					// overwrite with new chunk of data
					this.monitoringData = Object.assign(this.monitoringData, data);
				}
			});
		},
		data() {
			return {
				ws: false,
				monitoringData: false,
				showRawData: true
			};
		},
		computed: {
			chartDataMessageQueue() {
				return {
					labels: ['High', 'High-Medium', 'Medium', 'Medium-Low', 'Low'],
					datasets: [{
						backgroundColor: ['#d9230f', '#e04530', '#e08b27', '#e0d32b', '#469408'],
						data: this.monitoringData.messages.queued
					}]
				};
			},
			chartDataTemperature() {
				let labels = ['Air Inlet', 'Air Outlet', 'Transmitter', 'Power Amplifier', 'CPU', 'Power Supply'];
				let data = [
					this.monitoringData.temperatures.air_inlet,
					this.monitoringData.temperatures.air_outlet,
					this.monitoringData.temperatures.transmitter,
					this.monitoringData.temperatures.power_amplifier,
					this.monitoringData.temperatures.cpu,
					this.monitoringData.temperatures.power_supply
				];
				let backgroundColor = [];

				// add custom values
				if (this.monitoringData.temperatures.custom !== undefined) {
					// eslint-disable-next-line
					this.monitoringData.temperatures.custom.forEach(tempSet => {
						labels.push(tempSet.description);
						data.push(tempSet.value);
					});
				}

				// set background color according to value
				data.forEach(temp => {
					if (temp <= 10) {
						backgroundColor.push('#107c94');
					} else if (temp > 10 && temp < 25) {
						backgroundColor.push('#469408');
					} else if (temp > 25 && temp < 50) {
						backgroundColor.push('#e0d32b');
					} else if (temp > 50 && temp < 75) {
						backgroundColor.push('#e08b27');
					} else if (temp >= 75) {
						backgroundColor.push('#d9230f');
					}
				});

				return {
					labels: labels,
					datasets: [{
						backgroundColor: backgroundColor,
						data: data
					}]
				};
			},
			timeslotData() {
				let ret = [];

				// numbers
				for (let i = 0; i <= 9; i++) {
					ret.push({
						name: i,
						active: this.monitoringData.config.timeslots[i]
					});
				}

				// letters
				let n = 0;
				for (let i = 65; i <= 70; i++) {
					ret.push({
						name: String.fromCharCode(i),
						active: this.monitoringData.config.timeslots[10 + n]
					});
					n++;
				}

				return ret;
			}
		},
		filters: {
			trueFalse: function(value) {
				if (value) return 'yes';
				return 'no';
			},
			parseDate: function(value) {
				return new Date(value).toLocaleString();
			}
		}
	};
</script>

<style scoped>
	h3 > code {
		font-size: 80%;
	}

	.badge {
		background-color: #013c51;
	}

	.badge-success {
		background-color: #469408;
	}

	.badge-danger {
		background-color: #d9230f;
	}

	.label-timeslot {
		font-size: small;
		margin-right: 2px;
	}
</style>
