const app = angular
    .module("app", ["ui.router", "ngSanitize"])
    .config(function ($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider, $locationProvider) {
        $urlMatcherFactoryProvider.caseInsensitive(true);
        $urlRouterProvider.otherwise("/home");

        $stateProvider
            .state("signup", {
                url: "/signup",
                templateUrl: "templates/signup.html",
                controller: "signupController",
                controllerAs: "signupCtrl",
            })
            .state("login", {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: "loginController",
                controllerAs: "loginCtrl",
            })
            .state("logout", {
                url: "/logout",
                controller: "logoutController"
            })
            .state("profile", {
                url: "/profile",
                templateUrl: "templates/profile.html",
                controller: "profileController",
                controllerAs: "profileCtrl"                
            })
            .state("changePassword", {
                url: "/change-password",
                templateUrl: "templates/changePassword.html",
                controller: "changePasswordController",
                controllerAs: "changePasswordCtrl"
            })
            .state("home", {
                url: "/home",
                templateUrl: "templates/home.html",
                controller: "homeController",
                controllerAs: "homeCtrl"
            })
            .state("settings", {
                url: "/settings",
                templateUrl: "templates/settings.html",
                controller: "settingsController",
                controllerAs: "settingsCtrl"
            })
            .state("addFeed", {
                url: "/add-feed",
                templateUrl: "templates/addFeed.html",
                controller: "addFeedController",
                controllerAs: "addFeedCtrl"
            })       

        $locationProvider.html5Mode(true);
    })
    .run(function ($rootScope) {
        if (localStorage['authData']) {
            $rootScope.authData = JSON.parse(localStorage.getItem('authData'));
        }
    });


/*Other Scripts */
$(function () {
    $(".alert").fadeTo(5000, 500).slideUp(1500, function () {
        $(".alert").slideUp(1500);
    });
});