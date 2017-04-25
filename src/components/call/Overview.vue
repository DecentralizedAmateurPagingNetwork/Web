<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Calls</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Calls
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<legend>Actions</legend>
					<ul>
						<li><router-link to="/calls/new">New Call</router-link></li>
					</ul>
					<br/>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Emergencies</b><span class="badge">{{ statEmergencies }}</span></li>
							<li class="list-group-item"><b>Total Calls</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
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
							id: 'timestamp',
							title: 'Timestamp'
						},
						{
							id: 'callSignNames',
							title: 'Callsigns'
						},
						{
							id: 'transmitterGroupNames',
							title: 'Transmitter Groups'
						},
						{
							id: 'text',
							title: 'Message'
						},
						{
							id: 'emergency',
							title: 'Emergency?'
						},
						{
							id: 'ownerName',
							title: 'Owner'
						}
					],
					rows: false
				}
			};
		},
		computed: {
			statEmergencies() {
				return this.table.rows.filter(value => value.emergency).length;
			},
			statTotal() {
				return this.table.rows.length;
			}
		},
		methods: {
			loadData() {
				// load user's calls if user is not an admin
				let apiEndpoint = 'calls';
				if (!this.$store.getters.user.admin) {
					apiEndpoint = 'calls?ownerName=' + this.$store.getters.user.name;
				}

				this.running = true;
				this.$http.get(apiEndpoint).then(response => {
					// success --> save new data
					this.table.rows = response.body;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
