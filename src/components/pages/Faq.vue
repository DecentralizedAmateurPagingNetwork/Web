<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="page-header">
					<h1>FAQ</h1>
				</div>

				<h2>I do not have an account. How do I get one?</h2>
				<p>Due to the reason that you can trigger amateur radio transmissions with your account, please apply for an account by emailing to <code>rwth-afu [at] online.de</code> and provide some prove that you are a licensed amateur radio operator. Also give your Pager ID (RIC) as you can see here: <br/><img src="~@/assets/img/pager.jpg" /></p>

				<h2>I emailed 10 minutes ago. No answer yet. How long does it take to get an account?</h2>
				<p>We review the applications in our free time. So please be patient for some days.</p>

				<h2>What is a callsign?</h2>
				<p>A callsign is logical connection between a name (the callsign) and one or multiple RIC numbers.</p>

				<h2>What is a transmitter?</h2>
				<p>A transmitter is a device that puts the POCSAG signal on the air. There are many hardware configurations, like C9000, RasPager. Have a look at <a href="https://www.afu.rwth-aachen.de/projekte/funkruf-pager-pocsag" target="_blank">https://www.afu.rwth-aachen.de/projekte/funkruf-pager-pocsag</a>.</p>
				
				<h2>What is a RIC?</h2>
				<p>A RIC is the identifiaction number in the POCSAG world. They can have special meaning like the clock-RIC to set the date and time on your pager. Mostly they identify personally your pager. The assignment between a personal RIC and you is the "Callsign".</p>

				<h2>I cannot add a callsign or a transmitter.</h2>
				<p>Due to abuse reasons, only admins can add callsigns or transmitters. Please contact <code>rwth-afu [at] online.de</code>. Once your callsign or transmitter is assigned to you, you can edit it by yourself.</p>

				<h2>I want to add a transmitter to the network.</h2>
				<p>Very nice. We like the network growing. Please send an email to <code>rwth-afu [at] online.de</code> and give the following information:</p>
				<ul>
					<li>Callsign of the transmitter</li>
					<li>Location Latitude and Longitude (Please in decimal form, e.g. 50.12345)</li>
					<li>Type of transmitter: Widerange (> 1 watt) oder Personal (<= 1 watt, e.g. RasPager)</li>
					<li>Transmitter output power in watt</li>
					<li>Antenna type (omni or directional)</li>
					<li>Height of the antenna above ground (!), not above sea level</li>
					<li>Gain of the antenna minus cable losses in dBi</li>
					<li>Desired time slots (Please have a look here <a href="http://www.hampager.de/#/transmitters/map" target="_blank">http://www.hampager.de/#/transmitters/map</a> and find out, which timeslots in your neighborhood are already used.) If you are unsure, just let us know and we will find a suitable solution.</li>
				</ul>

				<h2>I want to add a node to the network.</h2>
				<p>Please send an email to <code>rwth-afu [at] online.de</code> and give the following information:</p>
				<ul>
					<li>Amateur radio callsign.</li>
					<li>Location Latitude and Longitude (Please in decimal form, e.g. 50.12345)</li>
					<li>Some reason, why it makes sense to add your node.</li>
				</ul>
				<p>Keep in mind that you need a stable HAMNET connection (44.0.0.0/8) to join the cluster network.</p>

				<h2>I do not receive the rubrics on my skyper.</h2>
				<p>Please activate your skyper on <a href="http://www.hampager.de/#/rubrics" target="_blank">http://www.hampager.de/#/rubrics</a> using the "Activate Rubrics" function. You have to provide your pager ID (RIC).</p>

				<h2>I want to add a rubric to the network.</h2>
				<p>Please send an email to <code>rwth-afu [at] online.de</code> and give the following information:</p>
				<ul>
					<li>The desired name</li>
					<li>The content you want to provide</li>
					<li>The transmitter group on which you want to send out your data</li>
				</ul>

				<h2>I want to send automated messages from third party sources.</h2>
				<p>You can use the REST API to do so. Description here: <a href="https://github.com/DecentralizedAmateurPagingNetwork/Core/wiki/Beschreibung-der-REST-API" target="_blank">https://github.com/DecentralizedAmateurPagingNetwork/Core/wiki/Beschreibung-der-REST-API</a>. Please be aware that the traffic capability is limited on the air interface. So make fair use and use a transmitter group that fits to your needs. Nobody wants in transmitter group "all" the information that someone has phoned you or your washing machine is done.</p>

				<h2>What is a timeslot?</h2>
				<p>As all transmitters work on the same frequency (TDMA), only one transmitter can be active at a time to avoid interference. This is why there are 16 timeslots (0 to F) assigned to each transmitter. If you operate a transmitter it is mandatory to have your clock synced by NTP. Otherwise you will destroy the network.</p>

				<h2>How do I know which timeslots to use on a transmitter?</h2>
				<p>Please have a look here <a href="http://www.hampager.de/#/transmitters/map" target="_blank">http://www.hampager.de/#/transmitters/map</a> and find out, which timeslots in your neighborhood are already used.)</p>

				<h2>I want to get a plug-and-play hardware for a new transmitter site. Where can I get it from?</h2>
				<p>There is an easy solution with GM1200 and a RasPi. If you like to get a 19'' Rack, please send an email to <code>dh3wr [at] darc.de</code>. An example can be found here <a href="https://www.afu.rwth-aachen.de/projekte/funkruf-pager-pocsag/funkrufsender-19-zoll-mit-gm1200" target="_blank">https://www.afu.rwth-aachen.de/projekte/funkruf-pager-pocsag/funkrufsender-19-zoll-mit-gm1200</a>.</p>

				<h2>Where can I get a Skyper?</h2>
				<p>Please help yourself. There is a possiblity to buy at <a href="http://www.funkhandel.com/index.php?a=783" target="_blank">www.funkhandel.com</a>.</p>

				<h2>Why is the time displayed on my Skyper wrong?</h2>
				<p>It is not wrong, it's UTC. We know, there are pros and cons of using UTC, but this is the most common understanding.</p>
				
				<h2>Some rubics are not transmitted on my transmitter.</h2>
				<p>Please check, if your transmitter is in a member of all desired transmitter groups that are assigned to a rubric. Especially for the DX-Cluster messages, there were complains about heavy load on some transmitters. So we added another transmitter group of the DX-Cluster messages. If you want to transmit those messages, have your transmitter added to the group.</p>

				<h2>Sometimes my transmitter transmits longer than the assigned timeslots.</h2>
				<p>We are aware of this bug. It is tracked in this issue: <a href="https://github.com/rwth-afu/UniPager/issues/66" target="_blank">https://github.com/rwth-afu/UniPager/issues/66</a> and will be hopefully solved soon.</p>

				<h2>Is there an SMTP-Interface to DAPNET, so I can send calls with my email program?</h2>
				<p>Not yet. Feel free to contribute. Use the open documented REST-API and write a simple SMTP server generating REST calls to the API.</p>


			</div>
		</div>
	</div>
</template>

<script>

</script>

<style scoped>

</style>
