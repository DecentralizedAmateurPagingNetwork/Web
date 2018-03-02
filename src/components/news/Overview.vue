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
				<h2>{{ $t('news.overview.allrubriccontent') }}
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<legend>{{ $t('general.actions') }}</legend>
					<ul>
						<li>
							<router-link to="/rubrics/content/new">{{ $t('news.overview.newrubriccontent') }}</router-link>
						</li>
					</ul>
					<br/>
					<template v-if="table.rows">
						<legend>{{ $t('general.statistics') }}</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>{{ $t('news.overview.totalrubriccontent') }}</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('news.overview.information.help') }}</p>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		created() {
			this.loadData();
		},
		data() {
			return {
				errorMessage: false,
				running: false,
				table: {
					columns: [
						{
							id: 'timestamp',
							title: this.$i18n.t('news.overview.table.timestamp')
						},
						{
							id: 'rubricName',
							title: this.$i18n.t('news.overview.table.rubric')
						},
						{
							id: 'number',
							title: this.$i18n.t('news.overview.table.number')
						},
						{
							id: 'text',
							title: this.$i18n.t('news.overview.table.message')
						},
						{
							id: 'ownerName',
							title: this.$i18n.t('general.owner')
						}
					],
					rows: false
				}
			};
		},
		computed: {
			statTotal() {
				return this.table.rows.length;
			}
		},
		methods: {
			loadData() {
				this.running = true;
				this.$http.get('news').then(response => {
					// success --> save new data

					// put every rubric's news into the news-array
					let data = [];
					for (let key of Object.keys(response.body)) {
						for (let news of response.body[key]) {
							if (news !== null) {
								data.push(news);
							}
						}
					}

					this.table.rows = data;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			}
		}
	};
</script>

<style scoped>

</style>
