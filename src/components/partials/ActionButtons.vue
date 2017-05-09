<template>
	<div>
		<button v-if="editAction" @click="editAction(element)" class="btn btn-info btn-xs"><i class="fa fa-pencil" title="Edit"></i></button>
		<button v-if="deleteAction" @click="deleteAction(element)" class="btn btn-primary btn-xs"><i class="fa fa-trash" title="Delete"></i></button>
		<button v-if="mailAction" @click="mailAction(element)" class="btn btn-default btn-xs"><i class="fa fa-envelope" title="Send Email"></i></button>
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
