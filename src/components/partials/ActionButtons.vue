<template>
	<div>
		<button v-if="editAction" @click="editAction(element)" class="btn btn-info btn-xs" :title="$t('table.actionbuttons.edit')"><i class="fa fa-pencil"></i></button>
		<button v-if="deleteAction" @click="deleteAction(element)" class="btn btn-primary btn-xs" :title="$t('table.actionbuttons.delete')"><i class="fa fa-trash"></i></button>
		<button v-if="monitoringAction" @click="monitoringAction(element)" class="btn btn-default btn-xs" :title="$t('table.actionbuttons.monitoring')"><i class="fa fa-line-chart"></i></button>
		<button v-if="mailAction" @click="mailAction(element)" class="btn btn-default btn-xs" :title="$t('table.actionbuttons.email')"><i class="fa fa-envelope"></i></button>
		<button v-if="sendRubricsAction" @click="sendRubricsAction(element)" class="btn btn-default btn-xs" :title="$t('table.actionbuttons.rubrics')"><i class="fa fa-book"></i></button>
	</div>
</template>

<script>
	export default {
		props: {
			element: Object,
			editAction: Function,
			deleteAction: Function,
			monitoringAction: Function,
			mailAction: Function,
			sendRubricsAction: Function
		}
	};
</script>

<style scoped>

</style>
