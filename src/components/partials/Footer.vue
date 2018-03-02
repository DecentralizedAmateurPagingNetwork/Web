<template>
	<div class="container">
		<footer>
			<div class="row">
				<div class="col-lg-12">
					<p><b>{{ $t('footer.language.title') }}:</b></p>
					<ul class="list-unstyled">
						<li><p v-on:click="changeLanguage('en')" class="linklike">{{ $t('footer.language.english') }}</p></li>
						<li><p v-on:click="changeLanguage('de')" class="linklike">{{ $t('footer.language.german') }}</p></li>
						<li><p v-on:click="changeLanguage('es')" class="linklike">{{ $t('footer.language.spanish') }}</p></li>
					</ul>
					<p><b>{{ $t('footer.more.title') }}:</b></p>
					<ul class="list-unstyled">
						<li><a href="http://hampager.de/dokuwiki/doku.php?id=faq" target="_blank">{{ $t('footer.more.faq') }}</a></li>
					</ul>
					<p><b>{{ $t('footer.support.title') }}:</b></p>
					<ul class="list-unstyled">
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork" target="_blank">{{ $t('footer.support.github') }}</a></li>
						<li><a href="https://www.afu.rwth-aachen.de" target="_blank">{{ $t('footer.support.rwth-amateur-radio') }}</a></li>
					</ul>
					<p><b>{{ $t('footer.contact.title') }}:</b></p>
					<ul class="list-unstyled">
						<li><a href="https://twitter.com/RWTHAmateurfunk" target="_blank">{{ $t('footer.contact.twitter') }}</a></li>
						<li><a href="https://www.facebook.com/DL0UA" target="_blank">{{ $t('footer.contact.facebook') }}</a></li>
						<li><a href="https://www.afu.rwth-aachen.de/ueber-uns/kontakt">{{ $t('footer.contact.contact') }}</a></li>
						<li>
							<router-link to="/impress">{{ $t('footer.contact.impress') }}</router-link>
						</li>
						<li>
							<router-link to="/privacy">{{ $t('footer.contact.privacy') }}</router-link>
						</li>
					</ul>
					<p><b>{{ $t('footer.versions.title') }}:</b> Core: {{ version.core }} / Web: {{ version.web }} ({{ version.webCommit }}) / <router-link to="/version">{{ $t('footer.versions.check') }}</router-link></p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
	export default {
		created() {
			// get core version
			this.$http.get('core/version').then(response => {
				this.version.core = response.body.core;
			});

			// get web version
			let pkg = require('../../../package.json');
			this.version.web = pkg.version;

			console.log();
		},
		data() {
			return {
				version: {
					core: 'Unknown',
					web: 'Unknown',
					webCommit: process.env.GITCOMMITHASH.substring(0, 7)
				}
			};
		},
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
	@media (min-width: 768px) {
		footer {
			margin: 2em 0;
		}

		footer li {
			float: left;
			margin: 0 1.5em 1.5em 0;
		}

		footer p {
			clear: left;
			margin-bottom: 0;
		}
	}
</style>
