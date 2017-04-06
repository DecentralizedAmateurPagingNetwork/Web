<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>News</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend>New News</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Message</label>
							<div class="col-lg-10">
								<textarea v-model="form.message" rows="2" maxlength="80" class="form-control"></textarea>
								<span class="help-block">{{ messageCharsRemaining }} / 80 characters remaining.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Rubric</label>
							<div class="col-lg-10">
								<multiselect v-model="form.rubric" :options="formData.rubrics" :close-on-select="true" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Number</label>
							<div class="col-lg-10">
								<input type="number" v-model.number="form.number" min="1" max="10" class="form-control" placeholder="1 - 10">
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">Submit</button>
								<router-link to="/news"><button class="btn btn-default">Abort</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>Information</h2>
				<p>News are the contents of rubrics. They are up to now only available on Skyper paging receivers.</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.$http.get('rubrics').then(response => {
				response.body.forEach(rubric => {
					this.formData.rubrics.push({name: rubric.name});
				});
			});
		},
		data() {
			return {
				form: {
					message: '',
					rubric: '',
					number: 1
				},
				formData: {
					rubrics: []
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

				let body = {
					text: this.form.message,
					rubricName: this.form.rubric.name,
					number: this.form.number
				};

				this.$http.post('news/', body).then(response => {
					this.$router.push('/news');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
