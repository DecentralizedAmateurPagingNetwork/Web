<script>
	import {Doughnut, mixins} from 'vue-chartjs';

	export default {
		mixins: [Doughnut, mixins.reactiveProp],
		data() {
			return {
				chartOptions: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						position: 'bottom'
					}
				}
			};
		},
		mounted() {
			this.renderChart(this.chartData, this.chartOptions);
		}
	};
</script>
