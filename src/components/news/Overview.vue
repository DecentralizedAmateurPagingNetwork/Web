<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>Rubric Content</h1>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-9">
				<h2>All Rubric Content
					<i class="fa fa-refresh fa-fw" :class="{ 'fa-spin': running }" @click="loadData"></i>
				</h2>

				<info-error :message="errorMessage"></info-error>

				<tablegrid v-if="table.rows" :columns="table.columns" :data="table.rows"></tablegrid>
			</div>
			<div class="col-lg-3">
				<div class="actions well">
					<legend>Actions</legend>
					<ul>
						<li>
							<router-link to="/news/new">New Rubric Content</router-link>
						</li>
					</ul>
					<br/>
					<template v-if="table.rows">
						<legend>Statistics</legend>
						<ul class="list-group">
							<li class="list-group-item"><b>Total Rubric Content</b><span class="badge">{{ statTotal }}</span></li>
						</ul>
					</template>
				</div>
				<h2>Information</h2>
				<p>The content displayed here are NOT general news about DAPNET, but the recently sent content to rubrics. Every time a user updates the 10 available rubric messages slots, this change will be displayed here.</p>
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
							title: 'Timestamp'
						},
						{
							id: 'rubricName',
							title: 'Rubric'
						},
						{
							id: 'number',
							title: '#'
						},
						{
							id: 'text',
							title: 'Message'
						},
						{
							id: 'ownerName',
							title: 'Owner'
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
