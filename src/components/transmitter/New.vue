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
				<form class="form-horizontal well">
					<fieldset>
						<legend>New Transmitter</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Callsign</label>
							<div class="col-lg-5">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" class="help-block">Changing this name will create a duplication and <i>not</i> change the element's name.</span>
							</div>
							<div class="col-lg-5">
								<multiselect v-model="formData.hamnetDb.selected" :options="formData.hamnetDb.all" :multiple="false" :close-on-select="true" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Node</label>
							<div class="col-lg-10">
								<multiselect v-model="form.node" :options="formData.nodes" :close-on-select="true" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Password</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.password" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Latitude / Longitude</label>
							<div class="col-lg-3">
								<input type="number" v-model.number="form.latitude.value" min="0" max="90" placeholder="0 - 90" class="form-control">
							</div>
							<div class="col-lg-2">
								<select class="form-control" v-model.number="form.latitude.orientation">
									<option value="1">North</option>
									<option value="-1">South</option>
								</select>
							</div>
							<div class="col-lg-3">
								<input type="number" v-model.number="form.longitude.value" min="0" max="180" placeholder="0 - 180" class="form-control">
							</div>
							<div class="col-lg-2">
								<select class="form-control" v-model.number="form.longitude.orientation">
									<option value="1">East</option>
									<option value="-1">West</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Transmission Power (W)</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.power" min="0" max="200" placeholder="0 - 200" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Usage</label>
							<div class="col-lg-10">
								<select class="form-control" v-model="form.usage">
									<option value="PERSONAL">Personal</option>
									<option value="WIDERANGE">Widerange</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Antennatype</label>
							<div class="col-lg-10">
								<select class="form-control" v-model="form.antennatype">
									<option value="OMNI">Omni</option>
									<option value="DIRECTIONAL">Directional</option>
								</select>
							</div>
						</div>
						<div v-if="form.antennatype === 'OMNI'" class="form-group">
							<label class="col-lg-2 control-label">Antennadirection</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.antennadirection" min="0" max="359" placeholder="0 - 359" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Antennalevel (m)</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.antennalevel" min="0" max="1000" placeholder="0 - 1000" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Antennagain (dBi)</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.antennagain" min="-50" max="80" placeholder="-50 - 80" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Timeslots</label>
							<div class="col-lg-10">
								<table style="width: 100%">
									<tbody style="text-align: center">
										<tr>
											<td>0</td>
											<td>1</td>
											<td>2</td>
											<td>3</td>
											<td>4</td>
											<td>5</td>
											<td>6</td>
											<td>7</td>
											<td>8</td>
											<td>9</td>
											<td>A</td>
											<td>B</td>
											<td>C</td>
											<td>D</td>
											<td>E</td>
											<td>F</td>
										</tr>
										<tr>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="0"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="1"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="2"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="3"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="4"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="5"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="6"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="7"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="8"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="9"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="A"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="B"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="C"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="D"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="E"></td>
											<td><input type="checkbox" v-model="form.timeslot" class="timeslotCheckBox" value="F"></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Owner</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">Submit</button>
								<router-link to="/transmitters">
									<button class="btn btn-default">Abort</button>
								</router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>Information</h2>
				<ul class="list-group">
					<li v-if="form.device.type" class="list-group-item"><b>Device</b><span class="badge">{{ form.device.type }}</span></li>
					<li v-if="form.device.version" class="list-group-item"><b>Version</b><span class="badge">{{ form.device.version }}</span></li>
					<li v-if="form.address.ip_addr" class="list-group-item"><b>IP-Address</b><span class="badge">{{ form.address.ip_addr }}</span></li>
					<li v-if="form.address.port" class="list-group-item"><b>Port</b><span class="badge">{{ form.address.port }}</span></li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get(this.$store.getters.url.hamnetDb, {
				before(request) {
					request.headers.delete('Authorization');
				}
			}).then(response => {
				response.body.data.forEach(entry => {
					this.formData.hamnetDb.all.push({
						name: entry.callsign + ' - ' + entry.name,
						callsign: entry.callsign,
						latitude: entry.latitude,
						longitude: entry.longitude
					});
				});
			});

			this.$http.get('nodes').then(response => {
				response.body.forEach(node => {
					this.formData.nodes.push({name: node.name});
				});
			});

			this.$http.get('users').then(response => {
				response.body.forEach(user => {
					this.formData.users.push({name: user.name});
				});
			});

			// load data of given id
			if (this.$route.params.id) {
				this.$http.get('transmitters/' + this.$route.params.id).then(response => {
					this.editing = true;

					let timeSlot = [];
					for (let i = 0; i < response.body.timeSlot.length; i++) {
						timeSlot.push(response.body.timeSlot.charAt(i));
					}

					let ownerNames = [];
					response.body.ownerNames.forEach(owner => {
						ownerNames.push({name: owner});
					});

					this.form.name = response.body.name;
					this.form.password = response.body.authKey;
					this.form.node = {name: response.body.nodeName};
					this.form.latitude.value = Math.abs(response.body.latitude);
					this.form.latitude.orientation = (response.body.latitude >= 0 ? 1 : -1);
					this.form.longitude.value = Math.abs(response.body.longitude);
					this.form.longitude.orientation = (response.body.longitude >= 0 ? 1 : -1);
					this.form.power = response.body.power;
					this.form.usage = response.body.usage;
					this.form.antennatype = response.body.antennaType;
					this.form.antennalevel = response.body.antennaAboveGroundLevel;
					this.form.antennadirection = response.body.antennaDirection;
					this.form.antennagain = response.body.antennaGainDbi;
					this.form.timeslot = timeSlot;
					this.form.owners = ownerNames;

					this.form.device.type = response.body.deviceType;
					this.form.device.version = response.body.deviceVersion;
					if (response.body.address !== null) {
						this.form.address = response.body.address;
					}
				}, response => {
					this.$router.push('/transmitters');
				});
			}
		},
		data() {
			return {
				editing: false,
				form: {
					name: '',
					password: '',
					node: '',
					latitude: {
						value: 0,
						orientation: 1
					},
					longitude: {
						value: 0,
						orientation: 1
					},
					power: 0,
					usage: 'PERSONAL',
					antennatype: 'OMNI',
					antennalevel: 0,
					antennadirection: 0,
					antennagain: 0,
					timeslot: [],
					owners: [],
					device: {
						type: '',
						version: ''
					},
					address: {
						ip_addr: '',
						port: ''
					}
				},
				formData: {
					hamnetDb: {
						all: [],
						selected: {}
					},
					nodes: [],
					users: []
				}
			};
		},
		methods: {
			submitForm(event) {
				event.preventDefault();

				// check for input in all fields
				if (!this.$helpers.checkForInput(this, this.form)) {
					return false;
				}

				let ownerNames = [];
				this.form.owners.forEach(owner => {
					ownerNames.push(owner.name);
				});

				let body = {
					authKey: this.form.password,
					nodeName: this.form.node.name,
					latitude: this.form.latitude.value * this.form.latitude.orientation,
					longitude: this.form.longitude.value * this.form.longitude.orientation,
					power: this.form.power,
					usage: this.form.usage,
					antennaAboveGroundLevel: this.form.antennalevel,
					antennaType: this.form.antennatype,
					antennaDirection: this.form.antennadirection,
					antennaGainDbi: this.form.antennagain,
					timeSlot: this.form.timeslot.sort().join(''),
					ownerNames: ownerNames
				};

				this.$http.put('transmitters/' + this.form.name, body).then(response => {
					this.$router.push('/transmitters');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		},
		watch: {
			'formData.hamnetDb.selected': function(val) {
				this.form.name = val.callsign;
				this.form.latitude.value = Math.abs(val.latitude);
				this.form.latitude.orientation = (val.latitude >= 0 ? 1 : -1);
				this.form.longitude.value = Math.abs(val.longitude);
				this.form.longitude.orientation = (val.longitude >= 0 ? 1 : -1);
			}
		}
	};
</script>

<style scoped>

</style>
