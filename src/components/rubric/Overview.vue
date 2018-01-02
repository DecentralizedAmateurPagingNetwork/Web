<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Rubrics</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Rubrics
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows" :edit-action="editElement" :delete-action="deleteElement"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<legend>Actions</legend>
					<ul>
						<li v-if="this.$store.getters.user.admin"><router-link to="/rubrics/new">New Rubric</router-link></li>
						<li><router-link to="/rubrics/activate">Activate Rubrics</router-link></li>
					</ul>
					<br/>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Total Rubrics</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>Information</h2>
				<p>This is a list of all rubrics on the DAPNET. A rubric number can by assigned to several transmitter groups. Keep in mind that the transmitter groups are disjunct for the same rubric number in order to avoid overlapping number assigments.<br />Use the Activate Rubrics button to enable the reception of rubrics on your Skyper.</p>
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
				errorMessage: false,
				running: false,
				table: {
					columns: [
						{
							id: 'number',
							title: 'Number'
						},
						{
							id: 'name',
							title: 'Name'
						},
						{
							id: 'label',
							title: 'Label'
						},
						{
							id: 'transmitterGroupNames',
							title: 'Transmitter Groups'
						},
						{
							id: 'ownerNames',
							title: 'Owner'
						},
						{
							id: 'actions',
							title: 'Actions'
						}
					],
					rows: false
				}
			};
		},
		computed: {
			statTotal() {
				return this.table.rows.length;
			}
		},
		methods: {
			loadData() {
				this.running = true;
				this.$http.get('rubrics').then(response => {
					// success --> save new data

					response.body.forEach(rubric => {
						// add actions (if admin or owner)
						rubric.actions = false;
						if (this.$store.getters.user.admin || rubric.ownerNames.includes(this.$store.getters.user.name)) {
							rubric.actions = true;
						}
					});

					this.table.rows = response.body;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			},
			editElement(element) {
				this.$router.push({name: 'Edit Rubric', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('rubrics/' + element.name, {
						before(request) {
							request.headers.delete('Content-Type');
						}
					}).then(response => {
						// success --> reload data
						this.loadData();
					}, response => {
						// error --> show error message
						this.$dialogs.ajaxError(this, response);
					});
				});
			}
		}
	};
</script>

<style scoped>

</style>
