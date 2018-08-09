<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('pagetitle.node.monitoring') }}: {{ $route.params.id }}</h1>
				</div>
			</div>
		</div>

		<div class="row" v-if="ws.readyState === 1">
			<div class="col-lg-3">
				<h2>General Status</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>Healthy</b>
						<span class="badge" :class="[monitoringData.good_health ? 'badge-success' : 'badge-danger']">{{ monitoringData.good_health | trueFalse }}</span>
					</li>
				</ul>
			</div>
			<div class="col-lg-3">
				<h2>Connections</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>Transmitters</b><span class="badge">{{ monitoringData.connections.transmitters }}</span></li>
					<li class="list-group-item"><b>Third Party</b><span class="badge">{{ monitoringData.connections.third_party }}</span></li>
					<li class="list-group-item"><b>Websocket</b><span class="badge">{{ monitoringData.connections.websocket }}</span></li>
				</ul>
			</div>
			<div class="col-lg-6">
				<h2>System</h2>
				<ul class="list-group">
					<li class="list-group-item"><b>Free Disk Space</b><span class="badge">{{ monitoringData.system.free_disk_space_mb }} MB</span></li>
					<li class="list-group-item"><b>CPU Utilization</b><span class="badge">{{ monitoringData.system.cpu_utilization }} %</span></li>
					<li class="list-group-item"><b>Hamcloud?</b><span class="badge">{{ monitoringData.system.is_hamcloud | trueFalse }}</span></li>
				</ul>
			</div>
		</div>

		<div class="row" v-if="ws.readyState === 1">
			<div class="col-lg-12">
				<h2>Services</h2>
				<div class="row">
					<div class="col-lg-2" v-for="(sData, sName) in monitoringData.microservices" :key="sName">
						<h3><code>{{ sName }}</code></h3>
						<ul class="list-group">
							<li class="list-group-item"><b>Healthy</b>
								<span class="badge" :class="[sData.ok ? 'badge-success' : 'badge-danger']">{{ sData.ok | trueFalse }}</span>
							</li>
							<li class="list-group-item"><b>Version</b><span class="badge">{{ sData.version }}</span></li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<h2>Raw Data</h2>
				<pre><code>{{ monitoringData }}</code></pre>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			if (!this.$route.params.id) return;

			this.ws = new WebSocket(this.$store.getters.url.telemetry + '/nodes/' + this.$route.params.id);
			this.ws.addEventListener('message', e => {
				let data = JSON.parse(e.data);

				// return if response is empty
				if (Object.keys(data).length === 0) {
					this.$router.push('/nodes');
				}

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
				monitoringData: false
			};
		},
		filters: {
			trueFalse: function(value) {
				if (value) return 'yes';
				return 'no';
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
