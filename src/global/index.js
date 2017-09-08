const GlobalMethodsPlugin = {
	install(Vue) {
		Vue.prototype.$dialogs = {};

		Vue.prototype.$dialogs.success = function(context) {
			context.$swal({
				title: 'Success',
				text: 'Operation successfully executed.',
				type: 'success'
			}).catch(context.$swal.noop);
		};

		Vue.prototype.$dialogs.deleteElement = function(context, workFunction) {
			context.$swal({
				title: 'Are you sure?',
				text: 'You will not be able to recover this data once it is deleted.',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: 'Yes',
				cancelButtonText: 'Cancel'
			}).then(workFunction).catch(context.$swal.noop);
		};

		Vue.prototype.$dialogs.ajaxError = function(context, err) {
			if (err.status === 0) {
				// no connection
				context.$swal({
					title: 'No Connection',
					html: 'Unable to reach API server. Please try again later.',
					type: 'error'
				}).catch(context.$swal.noop);
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
				}).catch(context.$swal.noop);
			} else if (err.status === 403) {
				// forbidden
				context.$swal({
					title: 'Forbidden',
					html: 'No permission for this request',
					type: 'error'
				}).catch(context.$swal.noop);
			} else if (err.status === 404) {
				// not found
				context.$swal({
					title: 'Not Found',
					html: 'Unable to find the requested resource.',
					type: 'error'
				}).catch(context.$swal.noop);
			} else {
				// general error
				context.$swal({
					title: 'General Error',
					html: 'Encountered HTTP error code ' + err.status + '.',
					type: 'error'
				}).catch(context.$swal.noop);
			}
		};

		Vue.prototype.$helpers = {};

		Vue.prototype.$helpers.getAjaxErrorMessage = function(response) {
			if (response.status === 0) {
				return 'Unable to reach API server. Please try again later.';
			} else if (response.status === 401 || response.status === 403) {
				return 'Invalid login credentials or no permission for this request. Please check username and password.';
			} else {
				return 'Unhandled HTTP error (' + response.status + '). Please try again later.';
			}
		};

		Vue.prototype.$helpers.checkForInput = function(context, form) {
			for (let key in form) {
				if (form.hasOwnProperty(key)) {
					if (form[key].length === 0 || form[key] === '') {
						context.$swal({
							title: 'Missing input',
							html: 'Please fill in every field to continue.',
							type: 'error'
						}).catch(context.$swal.noop);
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
