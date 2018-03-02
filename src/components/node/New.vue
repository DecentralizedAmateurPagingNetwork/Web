<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.nodes') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">{{ $t('nodes.new.newnode') }}</legend>
						<legend v-if="this.$route.params.id">{{ $t('nodes.new.editnode') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('nodes.new.name.title') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" class="help-block"><p v-html="$t('nodes.new.name.help')"></p></span>
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
							<label class="col-lg-2 control-label">{{ $t('general.owner') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('nodes.new.status.title') }}</label>
							<div class="col-lg-10">
								<select class="form-control" v-model="form.status">
									<option value="ONLINE">{{ $t('nodes.new.status.online') }}</option>
									<option value="SUSPENDED">{{ $t('nodes.new.status.suspended') }}</option>
								</select>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/nodes"><button class="btn btn-default">{{ $t('general.abord') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('nodes.new.information.help') }}</p>
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
