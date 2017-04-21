<template>
	<div>
		<button @click="editAction(element)" class="btn btn-info btn-xs"><i class="fa fa-pencil" title="Edit"></i></button>
		<button @click="deleteAction(element)" class="btn btn-primary btn-xs"><i class="fa fa-trash" title="Delete"></i></button>
	</div>
</template>

<script>
	export default {
		props: {
			element: Object,
			editAction: Function,
			deleteAction: Function
		}
	};
</script>

<style scoped>

</style>
