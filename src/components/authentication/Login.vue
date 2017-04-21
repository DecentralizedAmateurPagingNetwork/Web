<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Login</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-8">
				<form class="form-horizontal well">
					<fieldset>
						<legend>Login</legend>

						<info-error :message="errorMessage"></info-error>

						<div class="form-group">
							<label class="col-lg-2 control-label">Username</label>
							<div class="col-lg-10">
								<input type="text" v-model="username" class="form-control" placeholder="Username">
							</div>
						</div>
						<div class="form-group">
							<label class="col-lg-2 control-label">Password</label>
							<div class="col-lg-10">
								<input type="password" v-model="password" class="form-control" placeholder="Password">
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" @click="submitForm" class="btn btn-primary">Submit</button>
							</div>
						</div>
					</fieldset>
				</form>
			</div>

			<div class="col-lg-4">
				<h2>Information</h2>
				<p>...</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			// check if already logged in
			if (this.$store.getters.isUserLoggedIn) {
				this.$router.push('/');
			}
		},
		data() {
			return {
				errorMessage: '',
				username: '',
				password: ''
			};
		},
		methods: {
			submitForm(event) {
				event.preventDefault();

				// request given users data to validate credentials
				this.$http.get('users/' + this.username, {
					headers: {
						// use a customized header because the credentials are not yet saved in the store
						Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
					}
				}).then(response => {
					// success --> save credentials and go to home
					this.$store.commit('login', {
						name: response.body.name,
						auth: btoa(this.username + ':' + this.password),
						admin: response.body.admin
					});

					this.$router.push('/');
				}, response => {
					// error --> show error message
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
