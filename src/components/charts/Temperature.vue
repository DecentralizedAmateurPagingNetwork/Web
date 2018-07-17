<script>
	import {Bar, mixins} from 'vue-chartjs';

	export default {
		mixins: [Bar, mixins.reactiveProp],
		data() {
			return {
				chartOptions: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						display: false
					},
					scales: {
						yAxes: [{
							scaleLabel: {
								display: true,
								labelString: '° C'
							},
							ticks: {
								suggestedMin: -20,
								suggestedMax: 100
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
