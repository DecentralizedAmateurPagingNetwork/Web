<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.subscribers') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">{{ $t('subscribers.new.newsubscriber') }}</legend>
						<legend v-if="this.$route.params.id">{{ $t('subscribers.new.editsubscriber') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('navigation.subscribers') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.callsign" class="form-control">
								<span class="help-block">{{ $t('subscribers.new.subscriber.help') }}</span>
								<span v-if="editing" v-html="this.$i18n.t('general.duplication')" class="help-block"></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.description') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.description" class="form-control">
								<span class="help-block">{{ $t('subscribers.new.description.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('subscribers.new.pager.title') }}</label>
							<div class="col-lg-5">
								<textarea v-model="form.pager.numbers" class="form-control" rows="5"></textarea>
								<span class="help-block">{{ $t('subscribers.new.pager.helprics') }} <img src="~@/assets/img/pager.jpg" alt="Help" /></span>
							</div>
							<div class="col-lg-5">
								<textarea v-model="form.pager.names" class="form-control" rows="5"></textarea>
								<span class="help-block">{{ $t('subscribers.new.pager.helpnames') }}</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('subscribers.new.owner.title') }}</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">{{ $t('subscribers.new.owner.help') }}</span>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/subscribers"><button class="btn btn-default">{{ $t('general.abort') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('subscribers.new.information.help') }}</p>
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
				this.$http.get('callsigns/' + this.$route.params.id).then(response => {
					this.editing = true;

					let pagerNumbers = '';
					let pagerNames = '';
					response.body.pagers.forEach(pager => {
						pagerNumbers += this.$helpers.zeroPad(pager.number, 7) + '\n';
						pagerNames += pager.name + '\n';
					});

					let ownerNames = [];
					response.body.ownerNames.forEach(owner => {
						ownerNames.push({name: owner});
					});

					this.form.callsign = response.body.name;
					this.form.description = response.body.description;
					this.form.pager.numbers = pagerNumbers.trim();
					this.form.pager.names = pagerNames.trim();
					this.form.owners = ownerNames;
				}, response => {
					this.$router.push('/subscribers');
				});
			}

			this.$http.get('callsigns').then(response => {
				response.body.forEach(callsign => {
					callsign.pagers.forEach(pager => {
						this.formData.pagerRics.push(parseInt(pager.number));
					});
				});
			});
		},
		data() {
			return {
				editing: false,
				form: {
					callsign: '',
					description: '',
					pager: {
						numbers: '',
						names: ''
					},
					owners: []
				},
				formData: {
					pagerRics: [],
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

				let pagerNumbers = this.form.pager.numbers.split('\n');
				let pagerNames = this.form.pager.names.split('\n');
				let pagers = [];
				for (let i = 0; i < pagerNumbers.length; i++) {
					let item = {};
					item.number = pagerNumbers[i];
					item.name = pagerNames[i];

					pagers.push(item);
				}

				let ownerNames = [];
				this.form.owners.forEach(owner => {
					ownerNames.push(owner.name);
				});

				let body = {
					description: this.form.description,
					pagers: pagers,
					ownerNames: ownerNames
				};

				// check for already known pager ric
				let noWarning = true;
				pagerNumbers.forEach(formNumber => {
					if (this.formData.pagerRics.includes(parseInt(formNumber))) {
						noWarning = false;
						this.$swal({
							title: 'Duplicate pager RIC',
							html: 'The given pager RIC (' + formNumber + ') is already known.',
							type: 'warning',
							showCancelButton: true,
							confirmButtonText: 'I know what I\'m doing'
						}).then(() => {
							// send
							this.$http.put('callsigns/' + this.form.callsign, body).then(response => {
								this.$router.push('/subscribers');
							}, response => {
								this.$dialogs.ajaxError(this, response);
							});
						}, () => {
							// abort aka do nothing
						});
					}
				});

				if (noWarning) {
					this.$http.put('callsigns/' + this.form.callsign, body).then(response => {
						this.$router.push('/subscribers');
					}, response => {
						this.$dialogs.ajaxError(this, response);
					});
				}
			}
		}
	};
</script>

<style scoped>

</style>
