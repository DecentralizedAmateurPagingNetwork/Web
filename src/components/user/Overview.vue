<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Users</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Users
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
							<li><router-link to="/users/new">New User</router-link></li>
						</ul>
						<br/>
					</template>
					<legend>Statistics</legend>
					<ul v-if="table.rows" class="list-group">
						<li class="list-group-item"><b>Total Administrators</b><span class="badge">{{ statAdministrators }}</span></li>
						<li class="list-group-item"><b>Total Users</b><span class="badge">{{ statTotal }}</span></li>
					</ul>
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
							id: 'name',
							title: 'Name'
						},
						{
							id: 'mail',
							title: 'Email'
						},
						{
							id: 'admin',
							title: 'Admin?'
						},
						{
							id: 'callsigns',
							title: 'Callsigns'
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
			statAdministrators() {
				return this.table.rows.filter(value => value.admin).length;
			},
			statTotal() {
				return this.table.rows.length;
			}
		},
		methods: {
			loadData() {
				this.running = true;
				this.$http.get('users').then(response => {
					// success --> save new data
					response.body.forEach(user => {
						// add actions (if admin or owner)
						user.actions = false;
						if (this.$store.getters.user.admin || user.name === this.$store.getters.user.name) {
							user.actions = true;
						}
					});

					this.matchCallsigns(response.body);
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			},
			matchCallsigns(data) {
				this.running = true;
				this.$http.get('callsigns').then(response => {
					data.forEach(user => {
						user.callsigns = [];
						response.body.forEach(callsign => {
							if (callsign.ownerNames.indexOf(user.name) !== -1) {
								user.callsigns.push(callsign.name);
							}
						});
					});

					this.table.rows = data;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> fail silently
					this.running = false;
					this.table.rows = data;
				});
			},
			editElement(element) {
				this.$router.push({name: 'Edit User', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('users/' + element.name, {
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