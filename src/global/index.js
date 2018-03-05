const GlobalMethodsPlugin = {
	install(Vue) {
		Vue.prototype.$dialogs = {};

		Vue.prototype.$dialogs.success = function(context) {
			context.$swal({
				title: context.$i18n.t('alerts.success.title'),
				text: context.$i18n.t('alerts.success.text'),
				type: 'success',
				toast: true,
				position: 'bottom-end',
				timer: 3000,
				showConfirmButton: false
			});
		};

		Vue.prototype.$dialogs.deleteElement = function(context, workFunction) {
			context.$swal({
				title: context.$i18n.t('alerts.delete.title'),
				text: context.$i18n.t('alerts.delete.text'),
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: context.$i18n.t('general.yes'),
				cancelButtonText: context.$i18n.t('general.abort')
			}).then(result => {
				if (result.value) workFunction();
			});
		};

		Vue.prototype.$dialogs.ajaxError = function(context, err) {
			if (err.status === 0) {
				// no connection
				context.$swal({
					title: context.$i18n.t('rest.errors.no-connection'),
					html: context.$i18n.t('rest.errors.api-unreachable'),
					type: 'error'
				});
			} else if (err.status === 400) {
				// constraint violation
				let errorText = err.body.message + ':<br/>';
				if (err.body.code === 4001) {
					let jsonErrors = '<ul style="text-align:left">';
					err.body.violations.forEach(violation => {
						jsonErrors += '<li>' + violation.field + ' ' + violation.message + ' (' + violation.code + ' - ' + violation.constraint + ')</li>';
					});
					errorText += '</ul><br />' + jsonErrors;
				}

				context.$swal({
					title: err.body.name + ' (' + err.body.code + ')',
					html: errorText,
					type: 'error'
				});
			} else if (err.status === 403) {
				// forbidden
				context.$swal({
					title: context.$i18n.t('rest.errors.403.title'),
					html: context.$i18n.t('rest.errors.403.text'),
					type: 'error'
				});
			} else if (err.status === 404) {
				// not found
				context.$swal({
					title: context.$i18n.t('rest.errors.404.title'),
					html: context.$i18n.t('rest.errors.404.text'),
					type: 'error'
				});
			} else {
				// general error
				context.$swal({
					title: context.$i18n.t('rest.errors.title'),
					html: context.$i18n.t('rest.errors.http-error', { status: err.status }),
					type: 'error'
				});
			}
		};

		Vue.prototype.$helpers = {};

		Vue.prototype.$helpers.getAjaxErrorMessage = function(context, response) {
			if (response.status === 0) {
				return context.$i18n.t('rest.errors.api-unreachable');
			} else if (response.status === 401 || response.status === 403) {
				return context.$i18n.t('rest.errors.permissions');
			} else {
				return context.$i18n.t('rest.errors.http-error', { status: response.status });
			}
		};

		Vue.prototype.$helpers.checkForInput = function(context, form) {
			for (let key in form) {
				if (form.hasOwnProperty(key)) {
					if (form[key].length === 0 || form[key] === '') {
						context.$swal({
							title: context.$i18n.t('alerts.input.title'),
							html: context.$i18n.t('alerts.input.text'),
							type: 'error'
						});
						return false;
					}
				}
			}
			return true;
		};

		Vue.prototype.$helpers.zeroPad = function(number, size) {
			let s = String(number);
			while (s.length < (size || 2)) {
				s = '0' + s;
			}
			return s;
		};

		Vue.prototype.$helpers.stringToColor = function(string) {
			let hash = 0;
			for (let i = 0; i < string.length; i++) {
				hash = string.charCodeAt(i) + ((hash << 5) - hash);
				hash = hash & hash;
			}

			return 'hsl(' + hash % 360 + ', 100%, 30%)';
		};

		Vue.prototype.$helpers.getDistributedColors = function(amount) {
			let ret = [];
			let steps = Math.floor(360 / amount);
			for (let i = 1; i <= amount; i++) {
				ret.push('hsl(' + (i * steps) + ', 100%, 30%)');
			}

			return ret;
		};
	}
};

export default GlobalMethodsPlugin;
