import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

let defaultUrls = require('./defaultUrls.json');
let defaultText = require('./defaultText.json');
let defaultMap = require('./defaultMap.json');

export default new Vuex.Store({
	state: {
		url: defaultUrls,
		user: {
			name: 'Guest',
			auth: '',
			admin: false
		},
		customText: defaultText,
		map: defaultMap
	},
	getters: {
		url: state => {
			return state.url;
		},
		user: state => {
			return state.user;
		},
		isUserLoggedIn: state => {
			return (state.user.name !== 'Guest' && state.user.auth !== '');
		},
		customText: state => {
			return state.customText;
		},
		map: state => {
			return state.map;
		}
	},
	mutations: {
		login(state, payload) {
			state.user.name = payload.name;
			state.user.auth = payload.auth;
			state.user.admin = payload.admin;

			Vue.http.headers.common['Authorization'] = 'Basic ' + payload.auth;
		},
		logout(state) {
			state.user.name = 'Guest';
			state.user.auth = '';
			state.user.admin = false;

			Vue.http.headers.common['Authorization'] = '';
		}
	},
	plugins: [
		VuexPersistedState({
			key: 'dapnet-web',
			paths: [
				'user'
			]
		})
	]
});
