<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Version Check</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<info-error :message="errorMessage"></info-error>
			</div>
		</div>

		<div class="row">
			<div v-if="displayData" v-html="displayData"></div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			// get web version
			let pkg = require('../../package.json');
			this.version.web = pkg.version;

			// get core version
			this.$http.get('core/version').then(response => {
				this.version.core = response.body.core;
				this.version.api = response.body.api;

				// build query string
				let queryString = '?core=' + this.version.core + '&api=' + this.version.api + '&web=' + this.version.web;

				// query update server
				this.$http.get(this.$store.getters.url.update + queryString, {
					before(request) {
						request.headers.delete('Authorization');
					}
				}).then(response => {
					this.displayData = response.body;
					this.running = false;
				}, response => {
					if (response.status === 0) {
						this.errorMessage = 'Unable to find update-server. Please try again later.';
					} else {
						this.errorMessage = 'Unable to find update-information. Please try again later.';
					}
					this.running = false;
				});
			}, response => {
				// unable to get core version
				if (response.status === 0) {
					this.errorMessage = 'Unable to reach API server. Please try again later.';
				}
			});
		},
		data() {
			return {
				version: {
					core: 'UNKNOWN',
					api: 'UNKNOWN',
					web: 'UNKNOWN'
				},
				displayData: '',
				errorMessage: ''
			};
		}
	};
</script>

<style scoped>

</style>
