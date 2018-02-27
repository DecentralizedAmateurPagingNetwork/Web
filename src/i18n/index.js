import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
	locale: 'en',
	fallbackLocale: 'en',
	messages: {
		'en': require('./en.json'),
		'de': require('./de.json'),
		'es': require('./es.json')
	}
});

if (module.hot) {
	module.hot.accept(['./en.json', './de.json'], () => {
		i18n.setLocaleMessage('en', require('./en.json'));
		i18n.setLocaleMessage('ja', require('./de.json'));
	});
}

export default i18n;
