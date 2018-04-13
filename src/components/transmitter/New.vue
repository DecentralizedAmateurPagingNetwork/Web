<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.transmitters.title') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">{{ $t('transmitter.new.newtransmitter') }}</legend>
						<legend v-if="this.$route.params.id">{{ $t('transmitter.new.edittransmitter') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.callsign.title') }}</label>
							<div class="col-lg-5">
								<input type="text" v-model="form.name" class="form-control">
								<span class="help-block">{{ $t('transmitter.new.callsign.help') }}</span>
								<span v-if="editing" v-html="this.$i18n.t('general.duplication')" class="help-block"></span>
							</div>
							<div class="col-lg-5">
								<multiselect v-model="formData.hamnetDb.selected" :options="formData.hamnetDb.all" :multiple="false" :close-on-select="true" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">{{ $t('transmitter.new.import.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.password.title') }}</label>
							<div class="col-lg-10">
								<div class="input-group">
									<input :type="passwordVisible ? 'text' : 'password'" v-model="form.password" class="form-control">
									<span class="input-group-btn">
										<button type="button" @click="passwordVisible = !passwordVisible" title="Toggle password visibility" class="btn btn-info" data-toggle="tooltip" data-placement="bottom"><i class="fa" v-bind:class="{ 'fa-eye': passwordVisible, 'fa-eye-slash': !passwordVisible }"></i></button>
										<button type="button" v-clipboard:copy="form.password" v-clipboard:success="() => {this.$dialogs.success(this)}" title="Copy password to clipboard" class="btn btn-info" data-toggle="tooltip" data-placement="bottom"><i class="fa fa-clipboard"></i></button>
									</span>
								</div>
								<span class="help-block">{{ $t('transmitter.new.password.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.latlong.title') }}</label>
							<div class="col-lg-3">
								<input type="number" lang="en-150" v-model.number="form.latitude.value" min="0" max="90" placeholder="0 - 90" class="form-control">
							</div>
							<div class="col-lg-2">
								<select class="form-control" v-model.number="form.latitude.orientation">
									<option value="1">{{ $t('general.latlong.north') }}</option>
									<option value="-1">{{ $t('general.latlong.south') }}</option>
								</select>
							</div>
							<div class="col-lg-3">
								<input type="number" lang="en-150" v-model.number="form.longitude.value" min="0" max="180" placeholder="0 - 180" class="form-control">
							</div>
							<div class="col-lg-2">
								<select class="form-control" v-model.number="form.longitude.orientation">
									<option value="1">{{ $t('general.latlong.east') }}</option>
									<option value="-1">{{ $t('general.latlong.west') }}</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.usage.title') }}</label>
							<div class="col-lg-10">
								<select class="form-control" v-model="form.usage">
									<option value="PERSONAL">{{ $t('transmitter.new.usage.personal') }}</option>
									<option value="WIDERANGE">{{ $t('transmitter.new.usage.widerange') }}</option>
								</select>
								<span class="help-block">{{ $t('transmitter.new.usage.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.antennatype.title') }}</label>
							<div class="col-lg-5">
								<select class="form-control" v-model="form.antennatype">
									<option value="OMNI">{{ $t('transmitter.new.antennatype.omni') }}</option>
									<option value="DIRECTIONAL">{{ $t('transmitter.new.antennatype.directional') }}</option>
								</select>
								<span class="help-block">{{ $t('transmitter.new.antennatype.help') }}</span>
							</div>
							<div class="col-lg-5">
								<input type="number" v-model.number="form.antennadirection" :disabled="form.antennatype === 'OMNI'" min="0" max="359" placeholder="0 - 359" class="form-control">
								<span class="help-block"><p v-html="$t('transmitter.new.antennadirection.help')"></p></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.antennatype.other') }}</label>
							<div class="col-lg-5">
								<input type="number" v-model.number="form.power" min="0" max="200" placeholder="0 - 200" class="form-control">
								<span class="help-block"><p v-html="$t('transmitter.new.other.power.help')"></p></span>
							</div>
							<div class="col-lg-5">
								<input type="number" v-model.number="form.antennalevel" min="0" max="1000" placeholder="0 - 1000" class="form-control">
								<span class="help-block"><p v-html="$t('transmitter.new.other.antennalevel.help')"></p></span>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-5 col-lg-offset-2">
								<input type="number" v-model.number="form.antennagain" min="-50" max="80" placeholder="-50 - 80" class="form-control">
								<span class="help-block"><p v-html="$t('transmitter.new.other.antennagain.help')"></p></span>
							</div>
							<div class="col-lg-5">
								<input type="number" v-model.number="form.identificationAddress" min="0" max="2097151" placeholder="0 - 2097151" class="form-control">
								<span class="help-block"><p v-html="$t('transmitter.new.other.txidentric.help')"></p></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('transmitter.new.timeslots.title') }}</label>
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
								<span class="help-block">{{ $t('transmitter.new.timeslots.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.owner') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">{{ $t('transmitter.new.owner.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/transmitters">
									<button class="btn btn-default">{{ $t('general.abort') }}</button>
								</router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('general.information') }}</h2>
				<ul class="list-group">
					<li v-if="nodeInformation.device.type" class="list-group-item"><b>Device</b><span class="badge">{{ nodeInformation.device.type }}</span></li>
					<li v-if="nodeInformation.device.version" class="list-group-item"><b>Version</b><span class="badge">{{ nodeInformation.device.version }}</span></li>
					<li v-if="nodeInformation.nodeName" class="list-group-item"><b>Node</b><span class="badge">{{ nodeInformation.nodeName }}</span></li>
					<li v-if="nodeInformation.address.ip_addr" class="list-group-item"><b>IP-Address</b><span class="badge">{{ nodeInformation.address.ip_addr }}</span></li>
					<li v-if="nodeInformation.address.port" class="list-group-item"><b>Port</b><span class="badge">{{ nodeInformation.address.port }}</span></li>
					<li v-if="nodeInformation.connection.last || nodeInformation.connection.since" class="list-group-item"><b>Connection</b>
						<ul>
							<li v-if="nodeInformation.connection.last">Last: <span style="float: right">{{ nodeInformation.connection.last }}</span></li>
							<li v-if="nodeInformation.connection.since">Since: <span style="float: right">{{ nodeInformation.connection.since }}</span></li>
						</ul>
					</li>
				</ul>
				<p>{{ $t('transmitter.new.table.description') }}</p>
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
					this.form.identificationAddress = response.body.identificationAddress;
					this.form.timeslot = timeSlot;
					this.form.owners = ownerNames;

					this.nodeInformation.nodeName = response.body.nodeName;

					this.nodeInformation.device.type = response.body.deviceType;
					this.nodeInformation.device.version = response.body.deviceVersion;
					if (response.body.address !== null) {
						this.nodeInformation.address = response.body.address;
					}

					if (response.body.lastConnected !== null) {
						this.nodeInformation.connection.last = new Date(response.body.lastConnected).toLocaleString();
					}
					if (response.body.connectedSince !== null) {
						this.nodeInformation.connection.since = new Date(response.body.connectedSince).toLocaleString();
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
					identificationAddress: 1,
					timeslot: [],
					owners: []
				},
				passwordVisible: false,
				formData: {
					hamnetDb: {
						all: [],
						selected: {}
					},
					users: []
				},
				nodeInformation: {
					nodeName: '',
					device: {
						type: '',
						version: ''
					},
					address: {
						ip_addr: '',
						port: ''
					},
					connection: {
						last: '',
						since: ''
					}
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

				// check if location is valid
				if (this.form.latitude.value === '' || this.form.longitude.value === '') {
					this.$swal({
						title: 'Invalid location',
						html: 'Please check the given location and make sure to use your locale\'s decimal separator (e.g. <code>,</code> in German or <code>.</code> in US-English).',
						type: 'error'
					});
					return false;
				}

				let ownerNames = [];
				this.form.owners.forEach(owner => {
					ownerNames.push(owner.name);
				});

				let body = {
					authKey: this.form.password,
					latitude: this.form.latitude.value * this.form.latitude.orientation,
					longitude: this.form.longitude.value * this.form.longitude.orientation,
					power: this.form.power,
					usage: this.form.usage,
					antennaAboveGroundLevel: this.form.antennalevel,
					antennaType: this.form.antennatype,
					antennaDirection: this.form.antennadirection,
					antennaGainDbi: this.form.antennagain,
					identificationAddress: this.form.identificationAddress,
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
				this.form.latitude.value = Math.abs(val.latitude).toFixed(6);
				this.form.latitude.orientation = (val.latitude >= 0 ? 1 : -1);
				this.form.longitude.value = Math.abs(val.longitude).toFixed(6);
				this.form.longitude.orientation = (val.longitude >= 0 ? 1 : -1);
			}
		}
	};
</script>

<style scoped>

</style>
