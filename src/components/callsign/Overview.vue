<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Subscribers</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Subscribers
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows" :edit-action="editElement" :delete-action="deleteElement"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<template v-if="this.$store.getters.user.admin">
						<legend>Actions</legend>
						<ul>
							<li>
								<router-link to="/subscribers/new">New Subscriber</router-link>
							</li>
						</ul>
						<br/>
					</template>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Total Subscribers</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>Information</h2>
				<p>A subscriber is the logical connection between a name (the callsign) and one or multiple RIC numbers, for example a Skyper address.</p>
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
							id: 'name',
							title: 'Subscriber'
						},
						{
							id: 'description',
							title: 'Description'
						},
						{
							id: 'pagers',
							title: 'Pager'
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
				this.$http.get('callsigns').then(response => {
					// success --> save new data

					response.body.forEach(callsign => {
						// add pager list
						if (this.$store.getters.user.admin) {
							let pagerText = [];
							callsign.pagers.forEach(pager => pagerText.push(pager.name + ' (' + this.$helpers.zeroPad(pager.number, 7) + ')'));
							callsign.pagers = pagerText.join(', ');
						} else {
							callsign.pagers = '---';
						}

						// add actions (if admin or owner)
						callsign.actions = false;
						if (this.$store.getters.user.admin || callsign.ownerNames.includes(this.$store.getters.user.name)) {
							callsign.actions = true;
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
				this.$router.push({name: 'Edit Callsign', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('callsigns/' + element.name, {
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
