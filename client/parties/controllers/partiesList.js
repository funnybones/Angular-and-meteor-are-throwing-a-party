 angular.module('campusParty')
     .controller('PartiesListCtrl', ['$scope', '$meteor', '$rootScope',
        function ($scope, $meteor, $rootScope) {

             /* meteor find options */
             $scope.page = 1
             $scope.perPage = 3
             $scope.sort = {
                 name: 1
             }

             /* subscribe with options */

             $meteor.autorun($scope, function () {
                 $meteor.subscribe('parties', {
                     limit: parseInt($scope.getReactively('perPage')),
                     skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
                     sort: $scope.getReactively('sort')
                 }, $scope.getReactively('search')).then(function () {
                     $scope.partiesCount = $meteor.object(Counts, 'numberOfParties', false)

                     $scope.parties.forEach(function (party) {
                         party.onClicked = function () {
                             $state.go('partyDetails', {
                                 partyId: party._id
                             })
                         }
                     })

                     $scope.map = {
                         center: {
                             latitude: 45,
                             longitude: -73
                         },
                         zoom: 8
                     }

                 })
             })

             $scope.users = $meteor.collection(Meteor.users, false).subscribe('users')

             /* save options on minimongo */

             $scope.parties = $meteor.collection(function () {
                 return Parties.find({}, {
                     sort: $scope.getReactively('sort')
                 })
             })

             /* add party*/
             $scope.addParty = function () {
                 if ($rootScope.currentUser) {
                     $scope.newParty.owner = $rootScope.currentUser._id
                     $scope.parties.push($scope.newParty)

                     /* reset model*/
                     $scope.newParty = {}

                 } else {
                     /* TODO: Show allert / notify user */
                 }

             }

             /* removes one party */
             $scope.remove = function (party) {
                 $scope.parties.splice($scope.parties.indexOf(party), 1)
             }

             /* removes all parties */
             $scope.removeAll = function () {
                 $scope.parties.remove()
             }

             /* UI - change page */
             $scope.pageChanged = function (newPage) {
                 $scope.page = newPage
             }

             $scope.$watch('orderProperty', function () {
                 if ($scope.orderProperty)
                     $scope.sort = {
                         name: parseInt($scope.orderProperty)
                     }
             })

             /* creator function (display owners name) */

             $scope.creator = function (party) {
                 if (!party)
                     return

                 var owner = $scope.getUserById(party.owner)
                 if (!owner)
                     return 'nobody'

                 if ($rootScope.currentUser)
                     if ($rootScope.currentUser._id)
                         if (owner._id === $rootScope.currentUser._id)
                             return 'me'

                 return owner
             }

             /* helper function for returning current user */

             $scope.getUserById = function (userId) {
                 return Meteor.users.findOne(userId)
             }

             /* rsvp method call */
             $scope.rsvp = function (partyId, rsvp) {
                 $meteor.call('rsvp', partyId, rsvp).then(
                     function (data) {
                         console.log('success responding', data)
                     },
                     function (err) {
                         console.log('failed', err)
                     }
                 )
             }

             /* list of people who did not responded to invitation */
             $scope.outstandingInvitations = function (party) {
                 return _.filter($scope.users, function (user) {
                     return (_.contains(party.invited, user._id) &&
                         !_.findWhere(party.rsvps, {
                             user: user._id
                         }))
                 })
             }

      }])
