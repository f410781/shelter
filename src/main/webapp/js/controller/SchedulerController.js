
function SchedulerCtrl($scope, $location, $window, $filter, CampService, SchedulerService) {


    var enterSchedulerCalendar = function(){
       $scope.events =  null;
       SchedulerService.allEvent({'month': $scope.currentMonth},function (data) {
          $scope.events = buildEvents(data);
         },function (err) {
              console.log(err);
         });
    }

    $scope.forwardMonth = function(){
            $scope.currentMonth++;
            if($scope.currentMonth == 13){
                $scope.currentMonth = $filter('date')(new Date(), 'MM');
            }
            enterSchedulerCalendar();
    }

    $scope.backMonth = function(){
            $scope.currentMonth--;
            if($scope.currentMonth == 0){
                $scope.currentMonth = $filter('date')(new Date(), 'MM');
            }
            enterSchedulerCalendar();
    }


    $scope.selectItem = function(event){
        if (event.eventType == 'Visited'){
            event.selected = false;
        }
        else {
            event.selected = !event.selected;
        }
        return event.selected;
    }

    $scope.cancel = function() {
        $window.history.back();
    }


    function buildEvents(data) {
         var monthlyEvents = buildMonthlyEvent(data);
         var eventsByDay = buildDayEvent(monthlyEvents);
         var events = allEvent(eventsByDay);
         return events;
    }

    function allEvent(data) {
         var events = [];
         angular.forEach(data, function(value, key) {
                  var eventListForDay  = buildCampEvent(value.listOfEventsForDay);
                  var eventStrFinal = {'day': value.day, 'dayEvents' : eventListForDay};
                  this.push(eventStrFinal);
         }, events);
         return events;
    }

    function buildMonthlyEvent(data) {
        var monthlyEvents = [];
        angular.forEach(data, function(value, key){
            var listOfEventsForMonth =   value.eventList;
            var month = value.month;
            $scope.month = month;
            var eventForAnMonth = {'month': month, 'listOfEventsForMonth' : listOfEventsForMonth};
            this.push(eventForAnMonth);
        }, monthlyEvents);
        return monthlyEvents;
    }

    function buildCampEvent(data) {
        var campEvent = [];
        angular.forEach(data, function(value, key){
           var eventWithCampId = {'campEvent': value.campEvent, 'campId' : value.campId, 'checkIn': false, 'eventType' : value.eventType};
           this.push(eventWithCampId);
        }, campEvent);
        return campEvent;

    }

    function buildDayEvent(data) {
      var eventsByDay = [];
               angular.forEach(data[0].listOfEventsForMonth, function(value, key){
               var day =   value.day;
               var listOfEventsForDay = value.events;
               var eventForAnDay = {'day': day, 'listOfEventsForDay' : listOfEventsForDay};
               this.push(eventForAnDay);
      }, eventsByDay);
      return eventsByDay;
    }


    var init = function(){
          $scope.currentMonth = $filter('date')(new Date(), 'MM');
          enterSchedulerCalendar();
          enterSchedulerCamps();
    };

    //TODO move to utility module
    var endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    var isActive = function (tabName) {
        return endsWith($location.path(), tabName);
    }

    var enterSchedulerCamps = function () {

        SchedulerService.getCampSchedule(function (data) {
                $scope.schedules = data;
            },
            function (err) {
                console.log(err);
            });
    }

    $scope.scheduleVisitEntry = function () {

                addCampsToScope();
    }
    $scope.scheduleVisit = function (scheduleVisitForm) {
                 SchedulerService.scheduleVisit({'campName': scheduleVisitForm.campName, 'scheduleDate':scheduleVisitForm.scheduleDate, 'checkIn': false},function (data) {
                           enterSchedulerCalendar();
                           scheduleVisitForm.campName = null;
                           scheduleVisitForm.scheduleDate = null;

                         },function (err) {
                              console.log(err);
                         });

    }
   function addCampsToScope() {
              CampService.getAllCamps(function (data) {
                              $scope.camps = data;
                              buildCamps();
                          },
                          function (err) {
                              console.log(err);
                          });

    }

    function buildCamps(){
          var values = $scope.camps;
          $scope.campsNamesList = [];
          angular.forEach(values, function(value, key){
            var campName =   value.name;
            this.push(campName);
          }, $scope.campsNamesList);
    }

    $scope.checkInCamp = function(campId) {
       SchedulerService.campCheckIn({'checkIn': true, 'campId':campId },function (data) {
                     console.log(data);
                     enterSchedulerCalendar();

                    },function (err) {
                         console.log(err);
                    });
                    $scope.selected = false;
    }

    if (isActive('scheduler/camps')) {
        enterSchedulerCamps();
    }

    $scope.isActive = isActive;


    $scope.enterSchedulerCamps = enterSchedulerCamps;
    $scope.enterSchedulerCalendar = enterSchedulerCalendar;

    $scope.addCampDetailsToScope = function () {
        $scope.camp = this.camp;
    }
    init();
}