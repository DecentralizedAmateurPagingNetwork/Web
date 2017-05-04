<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Transmitters</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Transmitters
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
							<li><router-link to="/transmitters/new">New Transmitter</router-link></li>
						</ul>
						<br/>
					</template>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Total Transmitters</b><span class="badge">{{ statTotal }}</span></li>
							<li class="list-group-item"><chart-online-offline :chartData="chartData"></chart-online-offline></li>
							<li class="list-group-item"><chart-transmitter-types :chartData="chartDataDeviceTypes"></chart-transmitter-types></li>
						</ul>
						<div class="checkbox">
							<label><input type="checkbox" v-model="settings.widerangeOnly"> Show Widerange-transmitter only</label>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import ChartOnlineOffline from '@/components/charts/OnlineOffline';
	import ChartTransmitterTypes from '@/components/charts/TransmitterTypes';

	export default {
		components: {
			ChartOnlineOffline, ChartTransmitterTypes
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
							title: 'Callsign'
						},
						{
							id: 'nodeName',
							title: 'Node'
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
							id: 'deviceType',
							title: 'Device'
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
				},
				settings: {
					widerangeOnly: true
				}
			};
		},
		computed: {
			statTotal() {
				if (this.settings.widerangeOnly) {
					return this.table.rows.filter(value => value.usage === 'WIDERANGE').length;
				} else {
					return this.table.rows.length;
				}
			},
			statOnline() {
				if (this.settings.widerangeOnly) {
					return this.table.rows.filter(value => value.status.includes('ONLINE') && value.usage === 'WIDERANGE').length;
				} else {
					return this.table.rows.filter(value => value.status.includes('ONLINE')).length;
				}
			},
			chartData() {
				return {
					labels: ['Online', 'Offline'],
					datasets: [{
						data: [this.statOnline, this.statTotal - this.statOnline],
						backgroundColor: ['#469408', '#D9230F'],
						hoverBackgroundColor: ['#469408', '#D9230F']
					}]
				};
			},
			chartDataDeviceTypes() {
				let chartData = {
					labels: [],
					datasets: [{
						data: [],
						backgroundColor: [],
						hoverBackgroundColor: []
					}]
				};

				if (!this.table.rows || this.table.rows.length === 0) return chartData;

				let returnData = {};
				this.table.rows.forEach(transmitter => {
					// use only transmitters which are currently online
					if (!transmitter.status.includes('ONLINE')) {
						return true;
					}

					// hide non-widerange transmitters if checkbox is set
					if (this.settings.widerangeOnly && transmitter.usage !== 'WIDERANGE') {
						return true;
					}

					let deviceTypeSplitted = transmitter.deviceType.split(' ');
					let deviceType = deviceTypeSplitted[deviceTypeSplitted.length - 1];

					if (!deviceType || deviceType === '---') {
						deviceType = 'Unknown';
					}

					if (returnData[deviceType] !== undefined) {
						returnData[deviceType].amount++;
					} else {
						returnData[deviceType] = {};
						returnData[deviceType].name = deviceType;
						returnData[deviceType].amount = 1;
					}
				});

				let orderedReturnData = {};
				Object.keys(returnData).sort().forEach(key => {
					orderedReturnData[key] = returnData[key];
				});

				for (let key in orderedReturnData) {
					if (!orderedReturnData.hasOwnProperty(key)) {
						return true;
					}

					chartData.labels.push(orderedReturnData[key].name);
					chartData.datasets[0].data.push(orderedReturnData[key].amount);

					let color = this.getRandomColor();
					chartData.datasets[0].backgroundColor.push(color);
					chartData.datasets[0].hoverBackgroundColor.push(color);
				}

				return chartData;
			}
		},
		methods: {
			loadData() {
				this.running = true;
				this.$http.get('transmitters').then(response => {
					// success --> save new data

					response.body.forEach(transmitter => {
						// add ip and port into address-slot (if admin)
						if (this.$store.getters.user.admin && transmitter.address !== null) {
							transmitter.address = transmitter.address.ip_addr + ':' + transmitter.address.port;
						} else {
							transmitter.address = '---';
						}

						// add icon to device
						if (transmitter.deviceType === null) transmitter.deviceType = '---';
						if (transmitter.usage === 'WIDERANGE') {
							transmitter.deviceType = '<img src="./assets/img/transmitter_widerange.png" title="Widerange"> ' + transmitter.deviceType;
						} else if (transmitter.usage === 'PERSONAL') {
							transmitter.deviceType = '<img src="./assets/img/transmitter_personal.png" title="Personal"> ' + transmitter.deviceType;
						}

						// make status more colorful
						if (transmitter.status === 'ONLINE') {
							transmitter.status = '<span class="label label-success">ONLINE</span>';
						} else if (transmitter.status === 'OFFLINE') {
							transmitter.status = '<span class="label label-primary">OFFLINE</span>';
						} else {
							transmitter.status = '<span class="label label-warning">' + transmitter.status + '</span>';
						}

						// add actions (if admin or owner)
						transmitter.actions = false;
						if (this.$store.getters.user.admin || transmitter.ownerNames.includes(this.$store.getters.user.name)) {
							transmitter.actions = true;
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
				this.$router.push({name: 'Edit Transmitter', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('transmitters/' + element.name, {
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
			getRandomColor() {
				let r = Math.floor(Math.random() * 255);
				let g = Math.floor(Math.random() * 255);
				let b = Math.floor(Math.random() * 255);
				return 'rgb(' + r + ',' + g + ',' + b + ')';
			}
		}
	};
</script>

<style scoped>

</style>
