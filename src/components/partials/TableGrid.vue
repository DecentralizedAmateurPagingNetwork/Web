<template>
	<div>
		<div class="row">
			<div class="col-lg-4">
				<div class="input-group">
					<input class="form-control input-sm" v-model="searchQuery" placeholder="Search">
					<span class="input-group-btn">
						<button class="btn btn-default btn-sm" @click="searchQuery = ''"><i class="fa fa-times"></i></button>
					</span>
				</div>
			</div>

			<div class="col-lg-3 col-lg-push-5">
				<div id="paginationHolder">
					<button class="btn btn-default btn-xs" @click="movePages(-1)"><i class="fa fa-arrow-left"></i></button>
					&nbsp;{{ $t('table.pagination.page') }} <input v-model.number="gotoPage" type="number" min="1" :max="totalPages"> {{ $t('table.pagination.of') }} {{ totalPages }}&nbsp;
					<button class="btn btn-default btn-xs" @click="movePages(1)"><i class="fa fa-arrow-right"></i></button>
				</div>
			</div>
		</div>

		<div class="table-scrollable">
			<table class="table table-striped table-hover">
				<thead>
					<tr>
						<th v-for="key in columns" :key="key.id" @click="sortBy(key.id)" :class="{ active: sortKey === key.id }">
							{{ $t(key.title) }} <span class="arrow" :class="sortOrders[key.id] > 0 ? 'asc' : 'dsc'"></span>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="entry in paginatedData" :key="entry.id">
						<td v-for="key in columns" :key="key.id">
							<template v-if="key.id === 'actions'">
								<template v-if="entry[key.id] === true">
									<action-buttons :element="entry" :mail-action="mailAction" :edit-action="editAction"
										:delete-action="deleteAction" :send-rubrics-action="sendRubricsAction"></action-buttons>
								</template>
								<template v-else>
									---
								</template>
							</template>
							<template v-else-if="key.id === 'status' || key.id === 'deviceType'">
								<span v-html="entry[key.id]"></span>
							</template>
							<template v-else-if="key.id === 'timestamp' || key.id === 'connectedSince'">
								<template v-if="entry[key.id] === null">
									---
								</template>
								<template v-else>
									{{ entry[key.id] | timestampToLocaleString }}
								</template>
							</template>
							<template v-else>
								{{ booleanToString(arrayToString(entry[key.id])) }}
							</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			data: Array,
			columns: Array,
			editAction: Function,
			deleteAction: Function,
			mailAction: Function,
			sendRubricsAction: Function
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
							if (a[sortKey] === null) return 1;
							if (b[sortKey] === null) return -1;

							a = new Date(a[sortKey]);
							b = new Date(b[sortKey]);

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
			timestampToLocaleString(v) {
				return new Date(v).toLocaleString('de-DE', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				});
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
			},
			// next two methods are not filters anymore to allow usage of this
			arrayToString(v) {
				if (v instanceof Array) {
					return v.join(', ');
				} else {
					return v;
				}
			},
			booleanToString(v) {
				if (v === true) {
					return this.$i18n.t('general.yes');
				} else if (v === false) {
					return this.$i18n.t('general.no');
				} else {
					return v;
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

	@media (min-width: 1200px) {
		#paginationHolder {
			float: right;
		}
	}

	@media (max-width: 1200px) {
		#paginationHolder {
			margin: .5em 0 0 0;
		}
	}
</style>
