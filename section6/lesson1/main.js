var app = angular.module('codecraft', [
	'ngResource',
	'infinite-scroll',
	'angularSpinner',
	'jcs-autoValidate',
	'angular-ladda',
	'mgcrea.ngStrap',
	'toaster',
	'ngAnimate'
]);

app.config(function ($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token a4a945e5de9a7ac28044337e25d3d2252fc0e6e4'
	$resourceProvider.defaults.stripTrailingSlashes = false
	laddaProvider.setOption({
		stlye: 'expand-right'
	})
	angular.extend($datepickerProvider.defaults, {
		dateFormat: 'd/M/yyyy',
		autoclose: true
	})
})

app.factory('Contact', function ($resource) {
	return $resource(
		'https://codecraftpro.com/api/samples/v1/contact/:id/',
		{id:'@id'},
		{
			update: {
				method: 'PUT'
			}
		})
})

app.controller('PersonDetailController', function ($scope, ContactService) {
	$scope.contacts = ContactService;

	$scope.save = function () {
		$scope.contacts.updateContact($scope.contacts.selectedPerson)
	}
	$scope.remove = function () {
		$scope.contacts.removeContact($scope.contacts.selectedPerson)
	}
});

app.controller('PersonListController', function ($scope, $modal, ContactService) {

	$scope.search = "";
	$scope.order = "email";
	$scope.contacts = ContactService;

	$scope.loadMore = function () {
		console.log('loading more')
		$scope.contacts.loadMore()
	}

	$scope.showCreateModal = function () {
		$scope.contacts.selectedPerson = {}
		$scope.createModal = $modal({
			scope : $scope,
			template : 'templates/modal.create.tpl.html',
			show : true
		})
	}

	$scope.createContact = function () {
		console.log('create contact')
		$scope.contacts.createContact($scope.contacts.selectedPerson)
		.then(function () {
			$scope.createModal.hide()
		})
	}

	$scope.$watch('search', function (newVal, oldVal) {
		if (angular.isDefined(newVal)) {
			$scope.contacts.doSearch(newVal)
		}
	})

	$scope.$watch('order', function (newVal, oldVal) {
		if (angular.isDefined(newVal)) {
			$scope.contacts.doOrder(newVal)
		}
	})

});

app.service('ContactService', function (Contact, $q, toaster) {


	var self = {
		'addPerson': function (person) {
			this.persons.push(person);
		},
		'page' : 1,
		'hasMore' : true,
		'isLoading' : false,
		'isSaving' : false,
		'isDeleting' : false,
		'selectedPerson': null,
		'persons': [],
		'search' : null,
		'doSearch' : function (search) {
			self.page = 1
			self.hasMore = true
			// self.isLoading = false,
			// self.selectedPerson = null
			self.persons = []
			self.search = search
			self.loadContacts()
		},
		'doOrder' : function (order) {
			self.page = 1
			self.hasMore = true
			// self.isLoading = false,
			// self.selectedPerson = null
			self.persons = []
			self.ordering = order
			self.loadContacts()
		},
		'loadContacts' : function () {
			if (self.hasMore && !self.isLoading) {
				self.isLoading = true
				var params = {
					'page' : self.page,
					'search' : self.search,
					'ordering' : self.ordering
				}

				Contact.get(params, function (data) {
					console.log(data)
					angular.forEach(data.results, function (person) {
						self.persons.push(new Contact(person))
					})
	
					if (!data.next) {
						self.hasMore = false
					}
					self.isLoading = false
				})
			}
		},
		'loadMore' : function () {
			if (self.hasMore && !self.isLoading) {
				self.page++
				self.loadContacts()
			}
		},
		'updateContact' : function (person) {
			console.log('update')
			self.isSaving = true
			person.$update().then(function () {
				self.isSaving = false
				toaster.pop('success', 'Updated ' + person.name)
			})
		},
		'removeContact' : function (person) {
			console.log('remove')
			self.isDeleting = true
			person.$remove().then(function () {
				self.isDeleting = false
				var index = self.persons.indexOf(person)
				self.persons.splice(index, 1)
				self.selectedPerson = null
				toaster.pop('success', 'Deleted ' + person.name)
			})
		},
		'createContact' : function (person) {
			console.log('creating')
			var d = $q.defer()
			self.isSaving = true
			Contact.save(person).$promise.then(function () {
				self.isSaving = false
				self.selectedPerson = null
				self.hasMore = true
				self.page = 1
				self.persons = []
				self.loadContacts()
				toaster.pop('success', 'Created ' + person.name)
				d.resolve()
			})
			return d.promise
		}

	};

	self.loadContacts()

	return self

});