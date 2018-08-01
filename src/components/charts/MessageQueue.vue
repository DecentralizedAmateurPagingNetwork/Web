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
					},
					scales: {
						xAxes: [{
							ticks: {
								suggestedMin: 0,
								suggestedMax: 10
							}
						}]
					}
				}
			};
		},
		mounted() {
			this.renderChart(this.chartData, this.chartOptions);
		}
	};
</script>
