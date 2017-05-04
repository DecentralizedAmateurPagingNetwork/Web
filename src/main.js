// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';

// import router and store (including their configuration)
import router from './router';
import store from './store';

// import css files
import '@/assets/css/fonts.css';
import 'font-awesome/css/font-awesome.min.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'sweetalert2/dist/sweetalert2.css';
import '@/assets/css/custom.css';

// import ajax component
import VueResource from 'vue-resource';
Vue.use(VueResource);

// import multiselect
import Multiselect from 'vue-multiselect';
Vue.component('multiselect', Multiselect);

// import sweetAlert2
import swal from 'sweetalert2';
const swalPlugin = {};
swalPlugin.install = function(Vue) {
	Vue.prototype.$swal = swal;
};
Vue.use(swalPlugin);

// import global methods
import globalMethods from './global';
Vue.use(globalMethods);

// import some totally unsuspicious non-easteregg-like code
import KonamiCode from 'vue-konami-code';
Vue.use(KonamiCode, {callback: () => {
	swal({
		title: 'DAPNET Web',
		html: '<i class="fa fa-code" aria-hidden="true" style="color: #607D8B"></i> with ' +
		'<i class="fa fa-heart" aria-hidden="true" style="color: #F44336"></i> &amp; ' +
		'<i class="fa fa-coffee" aria-hidden="true" style="color: #795548"></i> in Aachen'
	});
}});

// import partials for rendering
import AppNavigation from '@/components/partials/Navigation';
Vue.component('app-navigation', AppNavigation);

import TableGrid from '@/components/partials/TableGrid';
Vue.component('tablegrid', TableGrid);

import ActionButtons from '@/components/partials/ActionButtons';
Vue.component('action-buttons', ActionButtons);

import InfoError from '@/components/partials/InfoError';
Vue.component('info-error', InfoError);

import AppFooter from '@/components/partials/Footer';
Vue.component('app-footer', AppFooter);

// remove tip from console
Vue.config.productionTip = false;

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
Vue.http.options.timeout = 3000;
Vue.http.headers.common['Authorization'] = 'Basic ' + store.getters.user.auth;
delete Vue.http.headers.common['Content-Type'];

// init Vue-instance
/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<App/>',
	components: {App}
});
