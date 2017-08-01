<template>
	<div class="container">
		<footer>
			<div class="row">
				<div class="col-lg-12">
					<p><b>More:</b></p>
					<ul class="list-unstyled">
						<li>
							<router-link to="/faq">FAQ</router-link>
						</li>
					</ul>
					<p><b>Support us:</b></p>
					<ul class="list-unstyled">
						<li><a href="https://github.com/DecentralizedAmateurPagingNetwork" target="_blank">GitHub</a></li>
						<li><a href="https://www.afu.rwth-aachen.de" target="_blank">RWTH Amateur Radio</a></li>
					</ul>
					<p><b>Contact us:</b></p>
					<ul class="list-unstyled">
						<li><a href="https://twitter.com/RWTHAmateurfunk" target="_blank">Twitter</a></li>
						<li><a href="https://www.facebook.com/DL0UA" target="_blank">Facebook</a></li>
						<li><a href="https://www.afu.rwth-aachen.de/ueber-uns/kontakt">Contact</a></li>
						<li>
							<router-link to="/impress">Impress</router-link>
						</li>
						<li>
							<router-link to="/privacy">Privacy</router-link>
						</li>
					</ul>
					<p><b>Versions:</b> Core: {{ version.core }} / Web: {{ version.web }} ({{ version.webCommit }}) / <router-link to="/version">Check</router-link></p>
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
					webCommit: process.env.GIT.COMMITHASH.substring(0, 7)
				}
			};
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
