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
						<legend>Activate Rubric</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Pager-Number (your RIC)</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.number" min="0" max="2097151" placeholder="0 - 2097151" class="form-control">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Transmitter Groups</label>
							<div class="col-lg-10">
								<multiselect v-model="form.transmittergroups" :options="formData.transmittergroups" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
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
				<p>Use the function to send an activation call to your Skyper. After successful reception, you can select the rubrics on "Skyper Setup" in the skyper menu.</p>
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
		},
		data() {
			return {
				form: {
					number: 1,
					transmittergroups: []
				},
				formData: {
					transmittergroups: []
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

				let body = {
					number: this.form.number,
					transmitterGroupNames: transmitterGroupNames
				};

				this.$http.post('activation/', body).then(response => {
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
