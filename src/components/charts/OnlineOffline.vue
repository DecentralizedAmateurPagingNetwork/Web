<script>
	import {Pie, mixins} from 'vue-chartjs';

	export default Pie.extend({
		mixins: [mixins.reactiveProp],
		data() {
			return {
				chartOptions: {
					responsive: true,
					legend: {
						position: 'bottom'
					}
				}
			};
		},
		mounted() {
			this.renderChart(this.chartData, this.chartOptions);
		}
	});
</script>
