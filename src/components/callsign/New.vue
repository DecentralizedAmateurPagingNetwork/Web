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
						<legend v-if="!this.$route.params.id">New Callsign</legend>
						<legend v-if="this.$route.params.id">Edit Callsign</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">Callsign</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.callsign" class="form-control">
								<span class="help-block">Please enter a valid amateur radio callsign of a human or a classifying name of an organization.</span>
								<span v-if="editing" class="help-block">Changing this name will create a duplication and <i>not</i> change the element's name.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Description</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.description" class="form-control">
								<span class="help-block">Provide your name or any other useful description of this entry.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Pager</label>
							<div class="col-lg-5">
								<textarea v-model="form.pager.numbers" class="form-control" rows="5"></textarea>
								<span class="help-block">Add one or more lines of pager RIC numbers. <img src="~@/assets/img/pager.jpg" alt="Help" /></span>
							</div>
							<div class="col-lg-5">
								<textarea v-model="form.pager.names" class="form-control" rows="5"></textarea>
								<span class="help-block">Add a corresponding number for lines as a description for the RIC numbers given in the first box.</span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Owner</label>
							<div class="col-lg-10">
								<multiselect v-model="form.owners" :options="formData.users" :multiple="true" :close-on-select="false" :hide-selected="true" :clear-on-select="true" placeholder="Type to search" label="name" track-by="name"></multiselect>
								<span class="help-block">An owner of a callsign association can edit the parameters of this callsign.</span>
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
				<p>Callsigns are an allocation between a name (usually your amateur radio callsign) and one or multiple pager IDs.</p>
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
								this.$router.push('/callsigns');
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
						this.$router.push('/callsigns');
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
