<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.rubrics.title') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>{{ $t('navigation.rubrics.all') }}
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows" :edit-action="editElement" :delete-action="deleteElement"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<legend>{{ $t('general.actions') }}</legend>
					<ul>
						<li v-if="this.$store.getters.user.admin"><router-link to="/rubrics/new">{{ $t('rubric.new.newrubric') }}</router-link></li>
					</ul>
					<br>
					<template v-if="table.rows">
						<legend>{{ $t('general.statistics') }}</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>{{ $t('rubric.overview.totalrubrics') }}</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('rubric.overview.information.help') }}</p>
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
							id: 'number',
							title: 'rubric.overview.table.number'
						},
						{
							id: 'name',
							title: 'rubric.overview.table.name'
						},
						{
							id: 'label',
							title: 'rubric.overview.table.label'
						},
						{
							id: 'transmitterGroupNames',
							title: 'rubric.overview.table.transmittergroup'
						},
						{
							id: 'ownerNames',
							title: 'general.owner'
						},
						{
							id: 'actions',
							title: 'general.actions'
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
				this.$http.get('rubrics').then(response => {
					// success --> save new data

					response.body.forEach(rubric => {
						// add actions (if admin or owner)
						rubric.actions = false;
						if (this.$store.getters.user.admin || rubric.ownerNames.includes(this.$store.getters.user.name)) {
							rubric.actions = true;
						}
					});

					this.table.rows = response.body;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(this, response);
				});
			},
			editElement(element) {
				this.$router.push({name: 'Edit Rubric', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('rubrics/' + element.name, {
						before(request) {
							request.headers.delete('Content-Type');
						}
					}).then(response => {
						// success --> reload data
						this.loadData();
					}, response => {
						// error --> show error message
						this.$dialogs.ajaxError(this, response);
					});
				});
			}
		}
	};
</script>

<style scoped>

</style>
