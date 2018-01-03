<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Nodes</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Nodes
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows" :mail-action="mailToOwner" :edit-action="editElement" :delete-action="deleteElement"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<template v-if="this.$store.getters.user.admin">
						<legend>Actions</legend>
						<ul>
							<li><router-link to="/nodes/new">New Node</router-link></li>
							<li><p class="linklike" @click="mailToAll">Send a mail to all owners</p></li>
						</ul>
						<br/>
					</template>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Total Nodes</b><span class="badge">{{ statTotal }}</span></li>
							<li class="list-group-item"><chart-online-offline :chartData="chartData"></chart-online-offline></li>
						</ul>
					</template>
				</div>
				<h2>Information</h2>
				<p>Nodes are the instances of the DAPNET cluster. This list shows the status of them. Due to the "not so good" long range connectivity of the HAMNET, cluster nodes come and go from time to time. This is very unsatisfying, we are working on a solution.</p>
			</div>
		</div>
	</div>
</template>

<script>
	import ChartOnlineOffline from '@/components/charts/OnlineOffline';

	export default {
		components: {
			ChartOnlineOffline
		},
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
							id: 'version',
							title: 'Version'
						},
						{
							id: 'address',
							title: 'IP-Address'
						},
						{
							id: 'ownerNames',
							title: 'Owner'
						},
						{
							id: 'status',
							title: 'Status'
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
			chartData() {
				let online = this.table.rows.filter(value => value.status.includes('ONLINE')).length;

				return {
					labels: ['Online', 'Offline'],
					datasets: [{
						data: [online, this.statTotal - online],
						backgroundColor: ['#469408', '#D9230F'],
						hoverBackgroundColor: ['#469408', '#D9230F']
					}]
				};
			},
			statTotal() {
				return this.table.rows.length;
			}
		},
		methods: {
			loadData() {
				this.running = true;
				this.$http.get('nodes').then(response => {
					// success --> save new data

					response.body.forEach(node => {
						// add ip (if available)
						if (node.address !== undefined && node.address !== null) {
							node.address = node.address.ip_addr;
						} else {
							node.address = '---';
						}

						// make status more colorful
						if (node.status === 'ONLINE') {
							node.status = '<span class="label label-success">ONLINE</span>';
						} else if (node.status === 'SUSPENDED') {
							node.status = '<span class="label label-primary">SUSPENDED</span>';
						} else {
							node.status = '<span class="label label-warning">' + node.status + '</span>';
						}

						// add actions (if admin or owner)
						node.actions = false;
						if (this.$store.getters.user.admin || node.ownerNames.includes(this.$store.getters.user.name)) {
							node.actions = true;
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
			mailToOwner(element) {
				let mailTo = [];
				this.$http.get('users').then(response => {
					response.body.forEach(user => {
						if (element.ownerNames.includes(user.name)) {
							mailTo.push(user.mail);
						}
					});
					window.location.href = 'mailto:' + mailTo.join(',') + '?subject=DAPNET%20Node%3A%20' + element.name;
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			},
			editElement(element) {
				this.$router.push({name: 'Edit Node', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('nodes/' + element.name, {
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
			},
			mailToAll() {
				let mailTo = [];
				this.$http.get('users').then(response => {
					response.body.forEach(user => {
						// check if user owns a node
						this.table.rows.forEach(row => {
							if (row.ownerNames.includes(user.name) && !mailTo.includes(user.mail)) {
								// add user's mail-address if it is not already in the list
								mailTo.push(user.mail);
							}
						});
					});
					window.location.href = 'mailto:' + mailTo.join(',') + '?subject=DAPNET%20Node';
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
