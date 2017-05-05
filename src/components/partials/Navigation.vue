<template>
	<div class="navbar navbar-default navbar-fixed-top">
		<div class="container">
			<div class="navbar-header">
				<router-link to="/" class="navbar-brand"><img src="~@/assets/img/dapnet-logo.png" alt="DAPNET Logo"/></router-link>

				<button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
			</div>
			<div class="navbar-collapse collapse" id="navbar-main">
				<ul v-if="this.$store.getters.isUserLoggedIn" class="nav navbar-nav">
					<li class="divider-vertical"></li>
					<li><router-link to="/calls">Calls</router-link></li>
					<li><router-link to="/callsigns">Callsigns</router-link></li>
					<li class="divider-vertical"></li>
					<li><router-link to="/news">News</router-link></li>
					<li><router-link to="/rubrics">Rubrics</router-link></li>
					<li class="divider-vertical"></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Transmitters <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><router-link to="/transmitters">All Transmitters</router-link></li>
							<li><router-link to="/transmitters/map">Map</router-link></li>
							<div class="divider"></div>
							<li><router-link to="/transmitters/groups">Transmitter Groups</router-link></li>
						</ul>
					</li>
					<li class="divider-vertical"></li>
					<li><router-link to="/nodes">Nodes</router-link></li>
					<li class="divider-vertical"></li>
					<li><router-link to="/users">Users</router-link></li>
					<li class="divider-vertical"></li>
				</ul>

				<ul class="nav navbar-nav navbar-right">
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ this.$store.getters.user.name }} <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li v-if="this.$store.getters.isUserLoggedIn"><router-link :to="{ name: 'Edit User', params: { id: this.$store.getters.user.name }}">Settings</router-link></li>
							<div v-if="this.$store.getters.isUserLoggedIn" class="divider"></div>
							<li v-if="!this.$store.getters.isUserLoggedIn"><router-link to="/login">Login</router-link></li>
							<li v-if="this.$store.getters.isUserLoggedIn"><router-link to="/logout">Logout</router-link></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>

</script>

<style scoped>
	.navbar, .dropdown-menu {
		background-color: #f4f4f4;
	}

	.navbar-brand img {
		width: 6em;
	}

	@media (min-width: 768px) {
		.divider-vertical {
			border-left: 1px solid #eeeeee;
			height: 40px;
			margin: 0 5px;
		}
	}
</style>
