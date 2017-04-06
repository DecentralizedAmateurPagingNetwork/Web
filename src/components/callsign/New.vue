<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Callsigns</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend>New Callsign</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Callsign</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.callsign" class="form-control">
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
							<label class="col-lg-2 control-label">Pager</label>
							<div class="col-lg-5">
								<textarea v-model="form.pager.numbers" class="form-control" rows="5"></textarea>
								<span class="help-block">One Pager-number per line. <i class="fa fa-question-circle" @click="showPagerNumberHelp"></i></span>
							</div>
							<div class="col-lg-5">
								<textarea v-model="form.pager.names" class="form-control" rows="5"></textarea>
								<span class="help-block">One Pager-name per line.</span>
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
								<router-link to="/callsigns"><button class="btn btn-default">Abort</button></router-link>
							</div>
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
					this.$router.push('/callsigns');
				});
			}
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

				this.$http.put('callsigns/' + this.form.callsign, body).then(response => {
					this.$router.push('/callsigns');
				}, response => {
					this.$dialogs.ajaxError(this, response);
				});
			},
			showPagerNumberHelp() {
				this.$swal({
					title: 'Pager-number?',
					html: 'Please use the following digits as Pager-number:<br /><img src="./assets/img/pager.jpg" alt="Help" />',
					type: 'info'
				});
			}
		}
	};
</script>

<style scoped>

</style>
