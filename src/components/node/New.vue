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
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">New Node</legend>
						<legend v-if="this.$route.params.id">Edit Node</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Name</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" class="help-block">Changing this name will create a duplication and <i>not</i> change the element's name.</span>
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
							<label class="col-lg-2 control-label">Owner</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Status</label>
							<div class="col-lg-10">
								<select class="form-control" v-model="form.status">
									<option value="ONLINE">Online</option>
									<option value="SUSPENDED">Suspended</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">Submit</button>
								<router-link to="/nodes"><button class="btn btn-default">Abort</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>Information</h2>
				<p>This table shows the registered DAPNET Core nodes and is mostly for SysOp information.</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get('users').then(response => {
				response.body.forEach(user => {
					this.formData.users.push({name: user.name});
				});
			});

			// load data of given id
			if (this.$route.params.id) {
				this.$http.get('nodes/' + this.$route.params.id).then(response => {
					this.editing = true;

					let ownerNames = [];
					response.body.ownerNames.forEach(owner => {
						ownerNames.push({name: owner});
					});

					this.form.name = response.body.name;
					this.form.latitude.value = Math.abs(response.body.latitude);
					this.form.latitude.orientation = (response.body.latitude >= 0 ? 1 : -1);
					this.form.longitude.value = Math.abs(response.body.longitude);
					this.form.longitude.orientation = (response.body.longitude >= 0 ? 1 : -1);
					this.form.owners = ownerNames;
					this.form.status = response.body.status;
				}, response => {
					this.$router.push('/nodes');
				});
			}
		},
		data() {
			return {
				editing: false,
				form: {
					name: '',
					latitude: {
						value: 0,
						orientation: 1
					},
					longitude: {
						value: 0,
						orientation: 1
					},
					owners: [],
					status: 'ONLINE'
				},
				formData: {
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
					latitude: this.form.latitude.value * this.form.latitude.orientation,
					longitude: this.form.longitude.value * this.form.longitude.orientation,
					ownerNames: ownerNames,
					status: this.form.status
				};

				this.$http.put('nodes/' + this.form.name, body).then(response => {
					this.$router.push('/nodes');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
