<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.calls') }}</h1>
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
					<legend>{{ $t('calls.overview.actions') }}</legend>
					<ul>
						<li><router-link to="/calls/new">{{ $t('calls.overview.newcall') }}</router-link></li>
					</ul>
					<br/>
					<template v-if="table.rows">
						<legend>{{ $t('calls.overview.statistics') }}</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>{{ $t('calls.overview.emergencies') }}</b><span class="badge">{{ statEmergencies }}</span></li>
							<li class="list-group-item"><b>{{ $t('calls.overview.totalcalls') }}</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('calls.overview.information.help') }}</p>
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
							title: this.$i18n.t('calls.overview.table.timestamp')
						},
						{
							id: 'callSignNames',
							title: this.$i18n.t('calls.overview.table.subscribers')
						},
						{
							id: 'transmitterGroupNames',
							title: this.$i18n.t('calls.overview.table.txgroups')
						},
						{
							id: 'text',
							title: this.$i18n.t('calls.overview.table.message')
						},
						{
							id: 'emergency',
							title: this.$i18n.t('calls.overview.table.emergency')
						},
						{
							id: 'ownerName',
							title: this.$i18n.t('calls.overview.table.owner')
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
