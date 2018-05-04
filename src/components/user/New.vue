<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.users') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<form class="form-horizontal well">
					<fieldset>
						<legend v-if="!this.$route.params.id">{{ $t('users.general.newuser') }}</legend>
						<legend v-if="this.$route.params.id">{{ $t('users.new.edituser') }}</legend>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.name') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.name" class="form-control">
								<span v-if="editing" v-html="this.$i18n.t('general.duplication')" class="help-block"></span>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('general.password') }}</label>
							<div class="col-lg-10">
								<div class="input-group">
									<input :type="passwordVisible ? 'text' : 'password'" v-model="form.password" class="form-control" :class="passwordVisible ? 'password-readable' : ''">
									<span class="input-group-btn">
										<button type="button" @click="passwordVisible = !passwordVisible" title="Toggle password visibility" class="btn btn-info" data-toggle="tooltip" data-placement="bottom"><i class="fa" v-bind:class="{ 'fa-eye': passwordVisible, 'fa-eye-slash': !passwordVisible }"></i></button>
										<button type="button" v-clipboard:copy="form.password" v-clipboard:success="() => {this.$dialogs.success(this)}" title="Copy password to clipboard" class="btn btn-info" data-toggle="tooltip" data-placement="bottom"><i class="fa fa-clipboard"></i></button>
										<button type="button" @click="generatePassword" title="Generate random password" class="btn btn-info" data-toggle="tooltip" data-placement="bottom"><i class="fa fa-repeat"></i></button>
									</span>
								</div>
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">{{ $t('users.general.email') }}</label>
							<div class="col-lg-10">
								<input type="text" v-model="form.email" class="form-control">
							</div>
						</div>
						<div class="form-group" v-if="this.$store.getters.user.admin">
							<label class="col-lg-2 control-label">{{ $t('users.general.admin') }}</label>
							<div class="col-lg-10 checkbox">
								<label>
									<input type="checkbox" v-model="form.admin">
								</label>
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">{{ $t('general.submit') }}</button>
								<router-link to="/users"><button class="btn btn-default">{{ $t('general.abort') }}</button></router-link>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
			<div class="col-lg-3">
				<h2>{{ $t('general.information') }}</h2>
				<p v-html="$t('users.new.information.help')"></p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			// load data of given id
			if (this.$route.params.id) {
				this.$http.get('users/' + this.$route.params.id).then(response => {
					this.editing = true;

					this.form.name = response.body.name;
					this.form.email = response.body.mail;
					this.form.admin = response.body.admin;
				}, response => {
					this.$router.push('/users');
				});
			}
		},
		data() {
			return {
				editing: false,
				form: {
					name: '',
					password: '',
					email: '',
					admin: false
				},
				passwordVisible: false
			};
		},
		methods: {
			submitForm(event) {
				event.preventDefault();

				// workaround to prevent broken authentication when using a colon in password
				if (this.form.password.includes(':')) {
					this.$swal({
						title: 'Forbidden character',
						html: 'Your password must not contain a colon (<code>:</code>), otherwise it may brake your login.',
						type: 'error'
					});
					return false;
				}

				// workaround to allow empty password to not change it
				if (this.$route.params.id && this.form.password === '') {
					this.form.password = '~~~DO_NOT_CHANGE_PASSWORD~~~';
				}

				// check for input in all fields
				if (!this.$helpers.checkForInput(this, this.form)) {
					return false;
				}

				// second part of the workaround
				if (this.$route.params.id && this.form.password === '~~~DO_NOT_CHANGE_PASSWORD~~~') {
					this.form.password = '';
				}

				let body = {
					hash: this.form.password,
					mail: this.form.email,
					admin: this.form.admin
				};

				// changed own password --> change auth-data
				if (this.form.name === this.$store.getters.user.name && this.form.password !== '') {
					this.$store.commit('login', {
						name: this.form.name,
						auth: btoa(this.form.name + ':' + this.form.password),
						admin: this.form.admin
					});
				}

				this.$helpers.checkForOverwritingAndSend(this, this.$route.params.id, 'users/' + this.form.name, body, '/users');
			},
			generatePassword() {
				// generate password
				const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
				let password = '';
				for (let i = 0; i < 20; ++i) {
					password += chars.charAt(Math.floor(Math.random() * chars.length));
				}

				// display the new password
				this.form.password = password;
				this.passwordVisible = true;
			}
		}
	};
</script>

<style scoped>
	.password-readable {
		font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
	}
</style>
