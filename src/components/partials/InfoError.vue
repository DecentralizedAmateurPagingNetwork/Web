<template>
	<div v-if="message" class="alert alert-danger">
		<h4>{{ $t('rest.errors.title') }}</h4>
		{{ message }}
	</div>
</template>

<script>
	export default {
		props: {
			message: ''
		}
	};
</script>

<style scoped>

</style>
