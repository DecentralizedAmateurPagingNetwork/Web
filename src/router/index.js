import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import CallOverview from '@/components/call/Overview';
import CallNew from '@/components/call/New';
import CallsignOverview from '@/components/callsign/Overview';
import CallsignNew from '@/components/callsign/New';
import NewsOverview from '@/components/news/Overview';
import NewsNew from '@/components/news/New';
import RubricOverview from '@/components/rubric/Overview';
import RubricNew from '@/components/rubric/New';
import RubricActivation from '@/components/rubric/Activation';
import TransmitterOverview from '@/components/transmitter/Overview';
import TransmitterNew from '@/components/transmitter/New';
import TransmitterMap from '@/components/transmitter/Map';
import TransmitterGroupOverview from '@/components/transmitter/group/Overview';
import TransmitterGroupNew from '@/components/transmitter/group/New';
import NodeOverview from '@/components/node/Overview';
import NodeNew from '@/components/node/New';
import UserOverview from '@/components/user/Overview';
import UserNew from '@/components/user/New';
import Login from '@/components/authentication/Login';
import Logout from '@/components/authentication/Logout';
import VersionCheck from '@/components/VersionCheck';
import Impress from '@/components/pages/Impress';
import Privacy from '@/components/pages/Privacy';
import NotFound from '@/components/pages/NotFound';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home,
			meta: {
				requireAuthentication: false
			}
		},
		{
			path: '/calls',
			name: 'Call Overview',
			component: CallOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/calls/new',
			name: 'New Call',
			component: CallNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers',
			name: 'Subscribers Overview',
			component: CallsignOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers/new',
			name: 'New Subscriber',
			component: CallsignNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers/edit/:id',
			name: 'Edit Subscriber',
			component: CallsignNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics',
			name: 'Rubric Overview',
			component: RubricOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/new',
			name: 'New Rubric',
			component: RubricNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/edit/:id',
			name: 'Edit Rubric',
			component: RubricNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/activate',
			name: 'Activate Rubrics',
			component: RubricActivation,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/content',
			name: 'Rubric Content Overview',
			component: NewsOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/content/new',
			name: 'New Rubric Content',
			component: NewsNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters',
			name: 'Transmitter Overview',
			component: TransmitterOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/new',
			name: 'New Transmitter',
			component: TransmitterNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/edit/:id',
			name: 'Edit Transmitter',
			component: TransmitterNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/map',
			name: 'Transmitter Map',
			component: TransmitterMap,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/map/:id',
			name: 'Transmitter Map Details',
			component: TransmitterMap,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups',
			name: 'Transmitter Group Overview',
			component: TransmitterGroupOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups/new',
			name: 'New Transmitter Group',
			component: TransmitterGroupNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups/edit/:id',
			name: 'Edit Transmitter Group',
			component: TransmitterGroupNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/nodes',
			name: 'Node Overview',
			component: NodeOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/nodes/new',
			name: 'New Node',
			component: NodeNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/nodes/edit/:id',
			name: 'Edit Node',
			component: NodeNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/users',
			name: 'User Overview',
			component: UserOverview,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/users/new',
			name: 'New User',
			component: UserNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/users/edit/:id',
			name: 'Edit User',
			component: UserNew,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: {
				requireAuthentication: false
			}
		},
		{
			path: '/logout',
			name: 'Logout',
			component: Logout,
			meta: {
				requireAuthentication: true
			}
		},
		{
			path: '/version',
			name: 'Version Check',
			component: VersionCheck,
			meta: {
				requireAuthentication: false
			}
		},
		{
			path: '/impress',
			name: 'Impress',
			component: Impress,
			meta: {
				requireAuthentication: false
			}
		},
		{
			path: '/privacy',
			name: 'Privacy',
			component: Privacy,
			meta: {
				requireAuthentication: false
			}
		},
		{
			path: '*',
			name: 'Not Found',
			component: NotFound,
			meta: {
				requireAuthentication: false
			}
		}
	]
});
