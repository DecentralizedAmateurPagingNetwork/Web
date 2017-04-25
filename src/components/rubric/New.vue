<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Rubrics</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">New Rubric</legend>
						<legend v-if="this.$route.params.id">Edit Rubric</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Name</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" class="help-block">Changing this name will create a duplication and <i>not</i> change the element's name.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Label</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.label" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Number</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.number" min="1" max="99" placeholder="1 - 99" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Transmitter Groups</label>
							<div class="col-lg-10">
								<multiselect v-model="form.transmittergroups" :options="formData.transmittergroups" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
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
								<router-link to="/rubrics"><button class="btn btn-default">Abort</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>Information</h2>
				<p>Rubrics are a Skyper based invention allowing to send news sorted into chategories (the rubrics). Assign the number with care and contact <code>rwth-afu [at] online.de</code> in case of doubt. Be aware that the number of rubrics is limited netwide to 99.</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get('transmitterGroups').then(response => {
				response.body.forEach(transmittergroup => {
					this.formData.transmittergroups.push({name: transmittergroup.name});
				});
			});

			this.$http.get('users').then(response => {
				response.body.forEach(user => {
					this.formData.users.push({name: user.name});
				});
			});

			// load data of given id
			if (this.$route.params.id) {
				this.$http.get('rubrics/' + this.$route.params.id).then(response => {
					this.editing = true;

					let transmitterGroupNames = [];
					response.body.transmitterGroupNames.forEach(transmittergroup => {
						transmitterGroupNames.push({name: transmittergroup});
					});

					let ownerNames = [];
					response.body.ownerNames.forEach(owner => {
						ownerNames.push({name: owner});
					});

					this.form.name = response.body.name;
					this.form.label = response.body.label;
					this.form.number = response.body.number;
					this.form.transmittergroups = transmitterGroupNames;
					this.form.owners = ownerNames;
				}, response => {
					this.$router.push('/rubrics');
				});
			}
		},
		data() {
			return {
				editing: false,
				form: {
					name: '',
					label: '',
					number: 1,
					transmittergroups: [],
					owners: []
				},
				formData: {
					transmittergroups: [],
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

				let transmitterGroupNames = [];
				this.form.transmittergroups.forEach(transmittergroup => {
					transmitterGroupNames.push(transmittergroup.name);
				});

				let ownerNames = [];
				this.form.owners.forEach(owner => {
					ownerNames.push(owner.name);
				});

				let body = {
					label: this.form.label,
					number: this.form.number,
					transmitterGroupNames: transmitterGroupNames,
					ownerNames: ownerNames
				};

				this.$http.put('rubrics/' + this.form.name, body).then(response => {
					this.$router.push('/rubrics');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
