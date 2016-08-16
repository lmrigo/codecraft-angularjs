var app = angular.module('minmax', [])

app.controller('MinMaxCtrl', function($scope) {
  $scope.formModle = {}

  $scope.onSubmit = function () {
    console.log($scope.formData)
  }
})