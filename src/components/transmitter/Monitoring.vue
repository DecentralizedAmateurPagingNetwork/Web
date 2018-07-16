<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('pagetitle.transmitter.monitoring') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<div v-if="ws.readyState === 0" class="progress progress-striped active">
					<div class="progress-bar" style="width: 0%"></div>
				</div>
				<div v-if="ws.readyState === 1" class="progress progress-striped active">
					<div class="progress-bar progress-bar-success" style="width: 100%"></div>
				</div>
				<div v-if="ws.readyState === 2 || ws.readyState === 3" class="progress progress-striped active">
					<div class="progress-bar" style="width: 100%"></div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<pre><code>{{ messages }}<br></code></pre>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			if (!this.$route.params.id) return;

			this.ws = new WebSocket('ws://dapnetdc1.db0sda.ampr.org:9001');
			this.ws.addEventListener('message', e => {
				// this.messages.push(JSON.parse(e.data));
				this.messages = JSON.parse(e.data);
			});
		},
		data() {
			return {
				ws: false,
				messages: []
			};
		}
	};
</script>

<style scoped>

</style>
