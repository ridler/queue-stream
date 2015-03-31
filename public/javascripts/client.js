(function() {

	var app = angular.module('queue-me', []);

	app.controller('StreamControl', ['$scope', '$http', function($scope, $http) {

		$scope.q = [];
		$scope.addition = '';
		$scope.dupes = false;

		$scope.socket = io.connect();

		$scope.socket.on('init', function(data) {
			$scope.$apply($scope.q = data.queue);
		});

		$scope.socket.on('dupe', function() {
			$scope.$apply($scope.dupes = true)
		});

		$scope.socket.on('addname', function(name) {
			$scope.$apply($scope.q.push(name));
		});

		$scope.socket.on('delname', function() {
			$scope.$apply($scope.q.shift());
		});

		$scope.socket.on('reset', function() {
			$scope.$apply($scope.q = []);
		});

		$scope.submitName = function() {
			$scope.socket.emit('push', { name: $scope.addition });
			$scope.addition = '';
			$scope.dupes = false;
		}

		$scope.pop = function() { $scope.socket.emit('pop'); }

		$scope.reset = function() { $http.get('/reset'); }

	}]);

})();
