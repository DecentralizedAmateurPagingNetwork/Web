// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';

// import i18n, router and store (including their configuration)
import i18n from './i18n';
import router from './router';
import store from './store';

// import css files
import '@/assets/css/fonts.css';
import 'font-awesome/css/font-awesome.min.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import '@/assets/css/custom.css';

// import libraries and components
import VueResource from 'vue-resource';
import VueCarousel from 'vue-carousel';
import Multiselect from 'vue-multiselect';
import swal from 'sweetalert2';
import globalMethods from './global';
import KonamiCode from 'vue-konami-code';

// import partials for rendering
import AppNavigation from '@/components/partials/Navigation';
import TableGrid from '@/components/partials/TableGrid';
import ActionButtons from '@/components/partials/ActionButtons';
import InfoError from '@/components/partials/InfoError';
import AppFooter from '@/components/partials/Footer';

// add libraries and components
Vue.use(VueResource);
Vue.use(VueCarousel);
Vue.component('multiselect', Multiselect);
const swalPlugin = {};
swalPlugin.install = function(Vue) {
	Vue.prototype.$swal = swal;
};
Vue.use(swalPlugin);
Vue.use(globalMethods);
Vue.use(KonamiCode, {callback: () => {
	swal({
		title: 'DAPNET Web',
		html: '<i class="fa fa-code" aria-hidden="true" style="color: #607D8B"></i> with ' +
		'<i class="fa fa-heart" aria-hidden="true" style="color: #F44336"></i> &amp; ' +
		'<i class="fa fa-coffee" aria-hidden="true" style="color: #795548"></i> in Aachen'
	});
}});

// add partials for rendering
Vue.component('app-navigation', AppNavigation);
Vue.component('tablegrid', TableGrid);
Vue.component('action-buttons', ActionButtons);
Vue.component('info-error', InfoError);
Vue.component('app-footer', AppFooter);

// remove tip from console
Vue.config.productionTip = false;

// set initial locale
i18n.locale = store.getters.language;

// router config
router.beforeEach((to, from, next) => {
	// check for authentication and redirect to home
	if (!store.getters.isUserLoggedIn && to.meta.requireAuthentication) {
		next('/');
		return true;
	}

	// go to requested page
	next();
});

router.afterEach((to, from) => {
	// use current view as title-source
	document.title = to.name + ' | DAPNET';
});

// resource config
Vue.http.options.root = store.getters.url.api;
Vue.http.options.timeout = 30000;
Vue.http.headers.common['Authorization'] = 'Basic ' + store.getters.user.auth;
delete Vue.http.headers.common['Content-Type'];

Vue.http.interceptors.push((request) => {
	if (request.body !== null) {
		// remove whitespace from url
		request.url = request.url.replace(/ /g, '');

		// trim strings in body
		for (const key of Object.keys(request.body)) {
			if (typeof request.body[key] === 'string') request.body[key] = request.body[key].trim();
		}
	}
});

// output version and links onto console
const pkg = require('../package.json');
console.log('%c DAPNET Web v' + pkg.version + ' ', 'background: #112a2d; color: #bada55; font-size: large;');
console.log('Latest commit:    https://github.com/DecentralizedAmateurPagingNetwork/Web/commit/' + process.env.GITCOMMITHASH);
console.log('More information: https://github.com/DecentralizedAmateurPagingNetwork/Web');

// init Vue-instance
/* eslint-disable no-new */
new Vue({
	el: '#app',
	i18n,
	router,
	store,
	components: {App},
	template: '<App/>'
});
