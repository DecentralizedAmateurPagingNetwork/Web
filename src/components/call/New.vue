<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.calls') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend>{{ $t('calls.new.newcall') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('calls.new.message.title') }}</label>
							<div class="col-lg-10">
								<textarea class="form-control" rows="2" maxlength="80" v-model="form.message"></textarea>
								<span class="help-block">{{ messageCharsRemaining }} / <p v-html="$t('calls.new.message.charactersremaining')"></p></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('calls.new.subscribers.title') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.callsigns" :options="formData.callsigns" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">{{ $t('calls.new.subscribers.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('calls.new.subscribers.title') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.transmittergroups" :options="formData.transmittergroups" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">{{ $t('calls.new.subscribers.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('calls.new.emergency.title') }}</label>
							<div class="col-lg-10 checkbox">
								<label>
									<input type="checkbox" v-model="form.emergency">
								</label>
								<span class="help-block">{{ $t('calls.new.emergency.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/calls"><button class="btn btn-default">{{ $t('general.abort') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('calls.new.information.title') }}</h2>
				<p>{{ $t('calls.new.information.help') }}</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get('callsigns').then(response => {
				response.body.forEach(callsign => {
					this.formData.callsigns.push({name: callsign.name});
				});
			});

			this.$http.get('transmitterGroups').then(response => {
				response.body.forEach(transmittergroup => {
					this.formData.transmittergroups.push({name: transmittergroup.name});

					// add 'all'-group (if present)
					if (transmittergroup.name === 'all') {
						this.form.transmittergroups.push({name: 'all'});
					}
				});
			});
		},
		data() {
			return {
				form: {
					message: this.$store.getters.user.name.toUpperCase() + ': ',
					callsigns: [],
					transmittergroups: [],
					emergency: false
				},
				formData: {
					callsigns: [],
					transmittergroups: []
				}
			};
		},
		computed: {
			messageCharsRemaining() {
				return 80 - this.form.message.length;
			}
		},
		methods: {
			submitForm(event) {
				event.preventDefault();

				// check for input in all fields
				if (!this.$helpers.checkForInput(this, this.form)) {
					return false;
				}

				let callSignNames = [];
				this.form.callsigns.forEach(callsign => {
					callSignNames.push(callsign.name);
				});

				let transmitterGroupNames = [];
				this.form.transmittergroups.forEach(transmittergroup => {
					transmitterGroupNames.push(transmittergroup.name);
				});

				let body = {
					text: this.form.message,
					callSignNames: callSignNames,
					transmitterGroupNames: transmitterGroupNames,
					emergency: this.form.emergency
				};

				this.$http.post('calls', body).then(response => {
					this.$router.push('/calls');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
