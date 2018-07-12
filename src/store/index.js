import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

let defaultUrls = require('./config/defaultUrls.json');
let defaultText = require('./config/defaultText.json');
let defaultMap = require('./config/defaultMap.json');

export default new Vuex.Store({
	state: {
		url: defaultUrls,
		user: {
			name: 'Guest',
			auth: '',
			admin: false
		},
		language: 'en',
		customText: defaultText,
		map: defaultMap,
		popups: {
			horkheimerpreis: false
		}
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
		language: state => {
			return state.language;
		},
		languageFlag: state => {
			if (state.language === 'en') return 'gb';
			return state.language;
		},
		customText: state => {
			return state.customText;
		},
		map: state => {
			return state.map;
		},
		popups: state => {
			return state.popups;
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
		},
		changeLanguage(state, payload) {
			state.language = payload.language;
		},
		popupShown(state, payload) {
			state.popups[payload] = true;
		}
	},
	plugins: [
		VuexPersistedState({
			key: 'dapnet-web',
			paths: [
				'user',
				'language',
				'popups'
			]
		})
	]
});
