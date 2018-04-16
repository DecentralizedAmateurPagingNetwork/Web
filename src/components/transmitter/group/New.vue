<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.transmitters.groups') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">{{ $t('group.new.newtxgroup') }}</legend>
						<legend v-if="this.$route.params.id">{{ $t('group.new.edittxgroup') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.name') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" v-html="this.$i18n.t('general.duplication')" class="help-block"></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.description') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.description" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('navigation.transmitters.title') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.transmitters" :options="formData.transmitters" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.owner') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/transmitters/groups"><button class="btn btn-default">{{ $t('general.abort') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('general.information') }}</h2>
				<p v-html="$t('group.new.information.help')"></p>
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

				this.$helpers.checkForOverwritingAndSend(this, this.$route.params.id, 'transmitterGroups/' + this.form.name, body, '/transmitters/groups');
			}
		}
	};
</script>

<style scoped>

</style>
