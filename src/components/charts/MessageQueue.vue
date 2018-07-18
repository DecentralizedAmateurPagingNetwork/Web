<script>
	import {HorizontalBar, mixins} from 'vue-chartjs';

	export default {
		mixins: [HorizontalBar, mixins.reactiveProp],
		data() {
			return {
				chartOptions: {
					responsive: true,
					legend: {
						display: false
					}
				}
			};
		},
		mounted() {
			this.renderChart(this.chartData, this.chartOptions);
		}
	};
</script>
