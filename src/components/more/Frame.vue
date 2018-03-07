<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ title }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<div class="embed-responsive embed-responsive-16by9">
					<iframe class="embed-responsive-item" :src="this.url"></iframe>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: [
			'title',
			'url'
		]
	};
</script>

<style scoped>

</style>
