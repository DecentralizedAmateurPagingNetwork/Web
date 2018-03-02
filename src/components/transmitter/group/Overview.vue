<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>{{ $t('navigation.transmitters.groups') }}</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>{{ $t('group.overview.alltxgroups') }}
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows" :edit-action="editElement" :delete-action="deleteElement"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<template v-if="this.$store.getters.user.admin">
						<legend>{{ $t('general.actions') }}</legend>
						<ul>
							<li><router-link to="/transmitters/groups/new">{{ $t('group.overview.newtxgroup') }}</router-link></li>
						</ul>
						<br/>
					</template>
					<template v-if="table.rows">
						<legend>{{ $t('general.statistics') }}</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>{{ $t('group.overview.totaltxgroups') }}</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>{{ $t('general.information') }}</h2>
				<p>{{ $t('group.overview.information.help') }}/p>
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
							id: 'name',
							title: this.$i18n.t('general.name')
						},
						{
							id: 'description',
							title: this.$i18n.t('general.description')
						},
						{
							id: 'transmitterNames',
							title: this.$i18n.t('navigation.transmitters.title')
						},
						{
							id: 'ownerNames',
							title: this.$i18n.t('general.owner')
						},
						{
							id: 'actions',
							title: this.$i18n.t('general.actions')
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
				this.$http.get('transmitterGroups').then(response => {
					// success --> save new data

					response.body.forEach(transmittergroup => {
						// add actions (if admin or owner)
						transmittergroup.actions = false;
						if (this.$store.getters.user.admin || transmittergroup.ownerNames.includes(this.$store.getters.user.name)) {
							transmittergroup.actions = true;
						}
					});

					this.table.rows = response.body;

					this.running = false;
					this.errorMessage = false;
				}, response => {
					// error --> show error message
					this.running = false;
					this.errorMessage = this.$helpers.getAjaxErrorMessage(response);
				});
			},
			editElement(element) {
				this.$router.push({name: 'Edit Transmitter Group', params: {id: element.name}});
			},
			deleteElement(element) {
				this.$dialogs.deleteElement(this, () => {
					this.$http.delete('transmitterGroups/' + element.name, {
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
