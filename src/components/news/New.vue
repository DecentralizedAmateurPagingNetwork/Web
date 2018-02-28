<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.rubrics.content') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend>{{ $t('news.new.newrubriccontent') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('news.new.message') }}</label>
							<div class="col-lg-10">
								<textarea v-model="form.message" rows="2" maxlength="80" class="form-control"></textarea>
								<span class="help-block">{{ messageCharsRemaining }} / 80 {{ $t('news.new.charactersremaining') }}.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('news.new.rubrics') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.rubric" :options="formData.rubrics" :close-on-select="true" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('news.new.number') }}</label>
							<div class="col-lg-5 checkbox">
								<label><input type="checkbox" v-model="form.numberNext"> {{ $t('news.new.chooseautomatically') }}</label>
							</div>
							<div class="col-lg-5">
								<input type="number" v-model.number="form.number" :disabled="form.numberNext == 1" min="1" max="10" class="form-control" placeholder="1 - 10">
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/rubrics/content"><button class="btn btn-default">{{ $t('general.abort') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('news.new.information.title') }}/h2>
				<p>{{ $t('news.new.information.help') }}</p>
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
					numberNext: true,
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

				// set number to 0 to let the core handle the numbering
				if (this.form.numberNext) {
					body.number = 0;
				}

				this.$http.post('news/', body).then(response => {
					this.$router.push('/rubrics/content');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
