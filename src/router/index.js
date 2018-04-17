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
import Frame from '@/components/more/Frame';
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
				titleTranslationKey: 'pagetitle.home',
				requireAuthentication: false
			}
		},
		{
			path: '/calls',
			name: 'Call Overview',
			component: CallOverview,
			meta: {
				titleTranslationKey: 'pagetitle.calls.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/calls/new',
			name: 'New Call',
			component: CallNew,
			meta: {
				titleTranslationKey: 'pagetitle.calls.new',
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers',
			name: 'Subscribers Overview',
			component: CallsignOverview,
			meta: {
				titleTranslationKey: 'pagetitle.subscribers.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers/new',
			name: 'New Subscriber',
			component: CallsignNew,
			meta: {
				titleTranslationKey: 'pagetitle.subscribers.new',
				requireAuthentication: true
			}
		},
		{
			path: '/subscribers/edit/:id',
			name: 'Edit Subscriber',
			component: CallsignNew,
			meta: {
				titleTranslationKey: 'pagetitle.subscribers.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics',
			name: 'Rubric Overview',
			component: RubricOverview,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/new',
			name: 'New Rubric',
			component: RubricNew,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.new',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/edit/:id',
			name: 'Edit Rubric',
			component: RubricNew,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/activate',
			name: 'Activate Rubrics',
			component: RubricActivation,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.activate',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/content',
			name: 'Rubric Content Overview',
			component: NewsOverview,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.content.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/rubrics/content/new',
			name: 'New Rubric Content',
			component: NewsNew,
			meta: {
				titleTranslationKey: 'pagetitle.rubric.content.new',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters',
			name: 'Transmitter Overview',
			component: TransmitterOverview,
			meta: {
				titleTranslationKey: 'pagetitle.transmitter.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/new',
			name: 'New Transmitter',
			component: TransmitterNew,
			meta: {
				titleTranslationKey: 'pagetitle.transmitter.new',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/edit/:id',
			name: 'Edit Transmitter',
			component: TransmitterNew,
			meta: {
				titleTranslationKey: 'pagetitle.transmitter.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/map',
			name: 'Transmitter Map',
			component: TransmitterMap,
			meta: {
				titleTranslationKey: 'pagetitle.transmitter.map.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/map/:id',
			name: 'Transmitter Map Details',
			component: TransmitterMap,
			meta: {
				titleTranslationKey: 'pagetitle.transmitter.map.detail',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups',
			name: 'Transmitter Group Overview',
			component: TransmitterGroupOverview,
			meta: {
				titleTranslationKey: 'pagetitle.transmittergroup.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups/new',
			name: 'New Transmitter Group',
			component: TransmitterGroupNew,
			meta: {
				titleTranslationKey: 'pagetitle.transmittergroup.new',
				requireAuthentication: true
			}
		},
		{
			path: '/transmitters/groups/edit/:id',
			name: 'Edit Transmitter Group',
			component: TransmitterGroupNew,
			meta: {
				titleTranslationKey: 'pagetitle.transmittergroup.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/nodes',
			name: 'Node Overview',
			component: NodeOverview,
			meta: {
				titleTranslationKey: 'pagetitle.node.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/nodes/new',
			name: 'New Node',
			component: NodeNew,
			meta: {
				titleTranslationKey: 'pagetitle.node.new',
				requireAuthentication: true
			}
		},
		{
			path: '/nodes/edit/:id',
			name: 'Edit Node',
			component: NodeNew,
			meta: {
				titleTranslationKey: 'pagetitle.node.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/users',
			name: 'User Overview',
			component: UserOverview,
			meta: {
				titleTranslationKey: 'pagetitle.user.overview',
				requireAuthentication: true
			}
		},
		{
			path: '/users/new',
			name: 'New User',
			component: UserNew,
			meta: {
				titleTranslationKey: 'pagetitle.user.new',
				requireAuthentication: true
			}
		},
		{
			path: '/users/edit/:id',
			name: 'Edit User',
			component: UserNew,
			meta: {
				titleTranslationKey: 'pagetitle.user.edit',
				requireAuthentication: true
			}
		},
		{
			path: '/more/wiki',
			name: 'Documentation',
			component: Frame,
			meta: {
				titleTranslationKey: 'pagetitle.more.wiki',
				requireAuthentication: false
			},
			props: {
				title: 'DAPNET DokuWiki',
				url: 'http://hampager.de/dokuwiki/doku.php'
			}
		},
		{
			path: '/more/support',
			name: 'Support',
			component: Frame,
			meta: {
				titleTranslationKey: 'pagetitle.more.support',
				requireAuthentication: false
			},
			props: {
				title: 'DAPNET Support Center',
				url: 'https://support.hampager.de'
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: {
				titleTranslationKey: 'pagetitle.login',
				requireAuthentication: false
			}
		},
		{
			path: '/logout',
			name: 'Logout',
			component: Logout,
			meta: {
				titleTranslationKey: 'pagetitle.logout',
				requireAuthentication: true
			}
		},
		{
			path: '/version',
			name: 'Version Check',
			component: VersionCheck,
			meta: {
				titleTranslationKey: 'pagetitle.versioncheck',
				requireAuthentication: false
			}
		},
		{
			path: '/impress',
			name: 'Impress',
			component: Impress,
			meta: {
				titleTranslationKey: 'pagetitle.impress',
				requireAuthentication: false
			}
		},
		{
			path: '/privacy',
			name: 'Privacy',
			component: Privacy,
			meta: {
				titleTranslationKey: 'pagetitle.privacy',
				requireAuthentication: false
			}
		},
		{
			path: '*',
			name: 'Not Found',
			component: NotFound,
			meta: {
				titleTranslationKey: 'pagetitle.notfound',
				requireAuthentication: false
			}
		}
	]
});
