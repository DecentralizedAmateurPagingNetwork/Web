<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="jumbotron">
					<h1>Welcome!</h1>
					<p v-if="!this.$store.getters.isUserLoggedIn">In order to use this service, please <router-link to="/login">login</router-link> first.</p>
					<p v-if="this.$store.getters.isUserLoggedIn">You are logged in, {{ this.$store.getters.user.name }}.</p>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-4">
				<h2>The DAPNET</h2>
				<div class="well">
					<img src="~@/assets/img/afu-dapnet-logo.png" alt="DAPNET Logo"/>
					<h3>Projects</h3>
					<ul>
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork/Core" target="_blank">DAPNET Core</a></li>
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork/Web" target="_blank">DAPNET Web</a></li>
						<li>
							<a href="https://github.com/DecentralizedAmateurPagingNetwork/DAPNETApp" target="_blank">DAPNET App</a><br />
							<a href="https://play.google.com/store/apps/details?id=de.hampager.dapnetmobile" target="_blank"><img src="~@/assets/img/google-play.png" style="width: 50%" alt="Google Play" /></a>
						</li>
						<li><a href="https://github.com/rwth-afu/raspager-proxy" target="_blank">DAPNET Proxy</a></li>
						<li><a href="https://github.com/rwth-afu/UniPager" target="_blank">UniPager</a></li>
					</ul>
				</div>
			</div>

			<div class="col-lg-4">
				<h2>Information</h2>
				<p v-html="this.$store.getters.customText"></p>
			</div>

			<div class="col-lg-4">
				<h2>Statistics
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': stats.running }" @click="loadData"></i>
				</h2>

				<info-error :message="stats.errorMessage"></info-error>

				<ul v-if="stats.data" class="list-group">
					<li class="list-group-item"><b>Calls</b><span class="badge">{{ stats.data.calls }}</span></li>
					<li class="list-group-item"><b>Callsigns</b><span class="badge">{{ stats.data.callSigns }}</span></li>
					<li class="list-group-item"><b>News</b><span class="badge">{{ stats.data.news }}</span></li>
					<li class="list-group-item"><b>Rubrics</b><span class="badge">{{ stats.data.rubrics }}</span></li>
					<li class="list-group-item"><b>Transmitters</b><span class="badge">{{ statTransmitter }}</span></li>
					<li class="list-group-item"><b>Nodes</b><span class="badge">{{ statNodes }}</span></li>
					<li class="list-group-item"><b>Users</b><span class="badge">{{ stats.data.users }}</span></li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.loadData();
		},
		data() {
			return {
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
						this.stats.errorMessage = 'Unable to reach API server. Please try again later.';
					} else {
						this.stats.errorMessage = 'Unhandled HTTP error (' + response.status + '). Please try again later.';
					}
				});
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
</style>
