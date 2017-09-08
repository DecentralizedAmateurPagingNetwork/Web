<template>
	<div>
		<div>Search: <input v-model="searchQuery"></div>

		<div class="table-scrollable">
			<table class="table table-striped table-hover">
				<thead>
					<tr>
						<th v-for="key in columns" @click="sortBy(key.id)" :class="{ active: sortKey == key.id }">
							{{ key.title }} <span class="arrow" :class="sortOrders[key.id] > 0 ? 'asc' : 'dsc'"></span>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="entry in paginatedData">
						<td v-for="key in columns">
							<template v-if="key.id === 'actions'">
								<template v-if="entry[key.id] === true">
									<action-buttons :element="entry" :mail-action="mailAction" :edit-action="editAction" :delete-action="deleteAction"></action-buttons>
								</template>
								<template v-else>
									---
								</template>
							</template>
							<template v-else-if="key.id === 'status' || key.id === 'deviceType'">
								<span v-html="entry[key.id]"></span>
							</template>
							<template v-else>
								{{ entry[key.id] | arrayToString | booleanToString }}
							</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div>
			<button class="btn btn-default btn-xs" @click="movePages(-1)"><i class="fa fa-arrow-left"></i></button>
			&nbsp;Page <input v-model.number="gotoPage" type="number" min="1" :max="totalPages"> of {{ totalPages }}&nbsp;
			<button class="btn btn-default btn-xs" @click="movePages(1)"><i class="fa fa-arrow-right"></i></button>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			data: Array,
			columns: Array,
			mailAction: Function,
			editAction: Function,
			deleteAction: Function
		},
		data() {
			let sortOrders = {};
			this.columns.forEach(key => {
				sortOrders[key.id] = 1;
			});
			return {
				sortKey: '',
				sortOrders: sortOrders,
				searchQuery: '',
				gotoPage: 1,
				startRow: 0,
				rowsPerPage: 10
			};
		},
		computed: {
			filteredData() {
				let sortKey = this.sortKey;
				let filterKey = this.searchQuery && this.searchQuery.toLowerCase();
				let order = this.sortOrders[sortKey] || 1;
				let data = this.data;
				if (filterKey) {
					data = data.filter(row => Object.keys(row).some(key => String(row[key]).toLowerCase().includes(filterKey)));
				}
				if (sortKey) {
					data = data.slice().sort((a, b) => {
						if (sortKey === 'timestamp' || sortKey === 'connectedSince') {
							if (a[sortKey] !== '---') {
								a = new Date(a[sortKey]);
							} else {
								return 1;
							}

							if (b[sortKey] !== '---') {
								b = new Date(b[sortKey]);
							} else {
								return -1;
							}

							return (a === b ? 0 : a > b ? -1 : 1) * order;
						} else {
							a = a[sortKey];
							b = b[sortKey];

							return (a === b ? 0 : a > b ? 1 : -1) * order;
						}
					});
				}
				return data;
			},
			paginatedData() {
				return this.filteredData.slice(this.startRow, this.startRow + this.rowsPerPage);
			},
			currentPage() {
				if (this.filteredData.length === 0) {
					return 0;
				} else {
					return (this.startRow / this.rowsPerPage) + 1;
				}
			},
			totalPages() {
				let total = Math.ceil(this.filteredData.length / this.rowsPerPage);
				if (total === 0) {
					total = 1;
				}
				return total;
			}
		},
		filters: {
			arrayToString(v) {
				if (v instanceof Array) {
					return v.join(', ');
				} else {
					return v;
				}
			},
			booleanToString(v) {
				if (v === true) {
					return 'Yes';
				} else if (v === false) {
					return 'No';
				} else {
					return v;
				}
			}
		},
		methods: {
			sortBy(key) {
				this.sortKey = key;
				this.sortOrders[key] = this.sortOrders[key] * -1;

				this.startRow = 0;
			},
			movePages(v) {
				let newStartRow = this.startRow + (v * this.rowsPerPage);
				if (newStartRow >= 0 && newStartRow < this.filteredData.length) {
					this.startRow = newStartRow;
				}
			}
		},
		watch: {
			currentPage() {
				this.gotoPage = this.currentPage;
			},
			gotoPage() {
				if (this.gotoPage >= 1 && this.gotoPage <= this.totalPages) {
					this.startRow = (this.gotoPage - 1) * this.rowsPerPage;
				}
			},
			searchQuery() {
				this.startRow = 0;
			}
		},
		mounted() {
			// calling it two times to make sure the sorting is applied and it is descending
			this.sortBy(this.columns[0].id);
			this.sortBy(this.columns[0].id);
		}
	};
</script>

<style scoped>
	table > tbody > tr > td {
		word-break: break-all;
	}

	table > thead > tr > th {
		width: auto !important;
	}

	th {
		cursor: pointer;
		white-space: nowrap;
	}

	th.active {
		color: #000;
	}

	th.active .arrow {
		opacity: 1;
	}

	.table-scrollable {
		margin: 1em 0;
		overflow-x: auto;
	}

	.arrow {
		display: inline-block;
		vertical-align: middle;
		width: 0;
		height: 0;
		margin-left: 5px;
		opacity: 0.66;
	}

	.arrow.asc {
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-bottom: 4px solid #000;
	}

	.arrow.dsc {
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 4px solid #000;
	}
</style>
