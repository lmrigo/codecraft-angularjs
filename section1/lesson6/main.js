var app = angular.module('minmax', [
	'jcs-autoValidate'
]);

app.run(function (defaultErrorMessageResolver) {
	defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
		errorMessages['tooYoung'] = 'You must be at least {0} years old to enter this site';
		errorMessages['tooOld'] = 'You must be at most {0} years old to enter this site';
		errorMessages['badUsername'] = 'Usernames should have only letters, numbers or underscores';
	})
})


app.controller('MinMaxCtrl', function ($scope, $http) {
	$scope.formModel = {};

	$scope.onSubmit = function () {

			$http.post('https://minmax-server.herokuapp.com/register/', $scope.formModel).
				success(function (data) {
					console.log(":)")
				}).error(function(data) {
					console.log(":(")
				});

	};
});