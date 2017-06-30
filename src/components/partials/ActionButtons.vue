<template>
	<div>
		<button v-if="editAction" @click="editAction(element)" class="btn btn-info btn-xs" title="Edit"><i class="fa fa-pencil"></i></button>
		<button v-if="deleteAction" @click="deleteAction(element)" class="btn btn-primary btn-xs" title="Delete"><i class="fa fa-trash"></i></button>
		<button v-if="mailAction" @click="mailAction(element)" class="btn btn-default btn-xs" title="Send Email"><i class="fa fa-envelope"></i></button>
	</div>
</template>

<script>
	export default {
		props: {
			element: Object,
			mailAction: Function,
			editAction: Function,
			deleteAction: Function
		}
	};
</script>

<style scoped>

</style>
