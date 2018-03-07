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
					<li><router-link to="/calls">{{ $t('navigation.calls') }}</router-link></li>
					<li><router-link to="/subscribers">{{ $t('navigation.subscribers') }}</router-link></li>
					<li class="divider-vertical"></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ $t('navigation.rubrics.title') }} <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><router-link to="/rubrics">{{ $t('navigation.rubrics.all') }}</router-link></li>
							<li><router-link to="/rubrics/activate">{{ $t('navigation.rubrics.activate') }}</router-link></li>
							<div class="divider"></div>
							<li><router-link to="/rubrics/content">{{ $t('navigation.rubrics.content') }}</router-link></li>
						</ul>
					</li>
					<li class="divider-vertical"></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ $t('navigation.transmitters.title') }} <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><router-link to="/transmitters">{{ $t('navigation.transmitters.all') }}</router-link></li>
							<li><router-link to="/transmitters/map">{{ $t('navigation.transmitters.map') }}</router-link></li>
							<div class="divider"></div>
							<li><router-link to="/transmitters/groups">{{ $t('navigation.transmitters.groups') }}</router-link></li>
						</ul>
					</li>
					<li class="divider-vertical"></li>
					<li><router-link to="/nodes">{{ $t('navigation.nodes') }}</router-link></li>
					<li class="divider-vertical"></li>
					<li><router-link to="/users">{{ $t('navigation.users') }}</router-link></li>
					<li class="divider-vertical"></li>
				</ul>

				<ul class="nav navbar-nav navbar-right">
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="flag-icon" :class="'flag-icon-' + this.$store.getters.languageFlag"></span> {{ $t('footer.language.' + this.$store.getters.language) }} <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li class="clickable"><a v-on:click="changeLanguage('en')"><span class="flag-icon flag-icon-gb"></span> {{ $t('footer.language.en') }}</a></li>
							<li class="clickable"><a v-on:click="changeLanguage('de')"><span class="flag-icon flag-icon-de"></span> {{ $t('footer.language.de') }}</a></li>
							<li class="clickable"><a v-on:click="changeLanguage('es')"><span class="flag-icon flag-icon-es"></span> {{ $t('footer.language.es') }}</a></li>
							<li class="clickable disabled"><a><span class="flag-icon flag-icon-fr"></span> {{ $t('footer.language.fr') }}</a></li>
							<li class="clickable disabled"><a><span class="flag-icon flag-icon-pl"></span> {{ $t('footer.language.pl') }}</a></li>
						</ul>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ this.$store.getters.user.name }} <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li v-if="this.$store.getters.isUserLoggedIn"><router-link :to="{ name: 'Edit User', params: { id: this.$store.getters.user.name }}">{{ $t('navigation.settings') }}</router-link></li>
							<div v-if="this.$store.getters.isUserLoggedIn" class="divider"></div>
							<li v-if="!this.$store.getters.isUserLoggedIn"><router-link to="/login">{{ $t('navigation.login') }}</router-link></li>
							<li v-if="this.$store.getters.isUserLoggedIn"><router-link to="/logout">{{ $t('navigation.logout') }}</router-link></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import 'flag-icon-css/css/flag-icon.min.css';

	export default {
		methods: {
			changeLanguage(lang) {
				this.$root.$i18n.locale = lang;
				this.$store.commit('changeLanguage', {
					language: lang
				});
			}
		}
	};
</script>

<style scoped>
	.navbar, .dropdown-menu {
		background-color: #f4f4f4;
	}

	.navbar-brand img {
		width: 6em;
	}

	.clickable {
		cursor: pointer;
	}

	@media (min-width: 768px) {
		.divider-vertical {
			border-left: 1px solid #eeeeee;
			height: 40px;
			margin: 0 5px;
		}
	}
</style>
