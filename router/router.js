app.config(function ($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home',{
            url:'/',
            templateUrl:'template/begin.html',
            controller:'dataCtrl'
        })
        .state('individual',{
            url:'/individual',
            templateUrl:'template/individual.html',
            controller:'individual_Ctrl as vm'
            //controller:'dataCtrl'
        })
})
