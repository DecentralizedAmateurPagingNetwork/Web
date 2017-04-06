<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Transmitter Groups</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend>New Transmitter Group</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Name</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" class="help-block">Changing this name will create a duplication and <i>not</i> change the element's name.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Description</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.description" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Transmitters</label>
							<div class="col-lg-10">
								<multiselect v-model="form.transmitters" :options="formData.transmitters" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
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
								<router-link to="/transmitters/groups"><button class="btn btn-default">Abort</button></router-link>							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>Information</h2>
				<p>...</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get('transmitters').then(response => {
				response.body.forEach(transmitter => {
					this.formData.transmitters.push({name: transmitter.name});
				});
			});

			this.$http.get('users').then(response => {
				response.body.forEach(user => {
					this.formData.users.push({name: user.name});
				});
			});

			// load data of given id
			if (this.$route.params.id) {
				this.$http.get('transmitterGroups/' + this.$route.params.id).then(response => {
					this.editing = true;

					let transmitterNames = [];
					response.body.transmitterNames.forEach(transmitter => {
						transmitterNames.push({name: transmitter});
					});

					let ownerNames = [];
					response.body.ownerNames.forEach(owner => {
						ownerNames.push({name: owner});
					});

					this.form.name = response.body.name;
					this.form.description = response.body.description;
					this.form.transmitters = transmitterNames;
					this.form.owners = ownerNames;
				}, response => {
					this.$router.push('/transmitters/groups');
				});
			}
		},
		data() {
			return {
				editing: false,
				form: {
					name: '',
					description: '',
					transmitters: [],
					owners: []
				},
				formData: {
					transmitters: [],
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

				let transmitterNames = [];
				this.form.transmitters.forEach(transmitter => {
					transmitterNames.push(transmitter.name);
				});

				let ownerNames = [];
				this.form.owners.forEach(owner => {
					ownerNames.push(owner.name);
				});

				let body = {
					description: this.form.description,
					transmitterNames: transmitterNames,
					ownerNames: ownerNames
				};

				this.$http.put('transmitterGroups/' + this.form.name, body).then(response => {
					this.$router.push('/transmitters/groups');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
