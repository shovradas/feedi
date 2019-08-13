app
    .controller("signupController", function ($http, $state, $window) {
        if (isLoggedIn())
            $state.go("home");

        const vm = this;

        this.signup = function () {
            if (vm.email == "" || vm.password == "" || vm.confirmedPassword == "" || vm.securityPIN == "" || vm.confirmedSecurityPIN == "" ||
                vm.email == undefined || vm.password == undefined || vm.confirmedPassword == undefined || vm.securityPIN == undefined || vm.confirmedSecurityPIN == undefined) {
                $window.alert("All fields are required");
                return;
            }

            if (vm.password != vm.confirmedPassword) {
                $window.alert("Confirmed Password did not match");
                return;
            }

            if (vm.securityPIN != vm.confirmedSecurityPIN) {
                $window.alert("Confirmed PIN did not match");
                return;
            }     
            
            if (vm.securityPIN.toString().length != 4) {
                $window.alert("PIN should be 4 digit");
                return;
            }

            $http({
                method: "POST",
                url: window.API_ROOT + "/users/signup",
                data: { name: vm.name, email: vm.email, password: vm.password, securityPIN: vm.securityPIN }
            }).then(function (response) {
                if (response.data.status == "success") {
                    $window.alert("Congratulations! You are registered successfully");
                    $state.go("login");
                }
                console.log(response.data);
            }, function (response) {
                $window.alert(response.data.message);
                //console.log(response);
            });
        }
    })
    .controller("loginController", function ($http, $state, $rootScope, $window) {
        if (isLoggedIn())
            $state.go("home");

        const vm = this;
        this.login = function () {
            $http({
                method: "POST",
                url: window.API_ROOT + "/users/login",
                data: { email: vm.email, password: vm.password }
            }).then(function (response) {
                const token = response.data.token;
                const user = response.data.user;
                const name = response.data.name;
                localStorage.setItem("authData", JSON.stringify({ user: user, token: token, name: name }));
                $rootScope.authData = { user: user, token: token, name: name };

                $state.go("home");
                console.log(response);
            }, function (response) {
                $window.alert("Unsuccessful");
                console.log(response);
            });
        }
    })
    .controller("logoutController", function ($state, $rootScope) {
        localStorage.removeItem("authData");
        $rootScope.authData = undefined;

        $state.go("login");
    })
    .controller("profileController", function ($http, $state, $rootScope) {
        if (!isLoggedIn())
            $state.go("login");

        const vm = this;

        $http.get(window.API_ROOT + '/users/' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
            .then(function (response) {
                vm.user = response.data.user;
            });

    })
    .controller("changePasswordController", function ($state, $http, $rootScope, $sce) {
        if (!isLoggedIn())
            $state.go("login");

        console.log("HEREE");

        const vm = this;
        this.changePassword = function () {          
            $http({
                method: "PATCH",
                url: window.API_ROOT + "/users/change-password",
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                },
                data: { id: $rootScope.authData.user, password: vm.oldPassword, newPassword: vm.newPassword }
            }).then(function (response) {
                console.log(response);
                vm.message = $sce.trustAsHtml('<div class="mt-3 alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Success! </strong>' +
                    response.statusText +
                    '</div>');
            }, function (response) {
                console.log(response);
                vm.message = $sce.trustAsHtml('<div class="mt-3 alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Error! </strong>' +
                    response.statusText +
                    '</div>');
            });
        }
    })
    .controller("homeController", function ($http, $state, $rootScope) {
        if (!isLoggedIn())
            $state.go("login");
        //console.log(entries);

        this.message = "all";
        const vm = this;

        this.sortByDate = true;
        this.sort = function () {
            //console.log(vm.sortByDate);

            vm.sortByDate = !vm.sortByDate;
        }

        $http.get(window.API_ROOT + '/feeds/?user=' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
            .then(function (response) {
                vm.feeds = response.data.feeds;
            });

        $http.get(window.API_ROOT + '/entries/?user=' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
            .then(function (response) {
                vm.entries = response.data.entries;
                vm.totalEntries = response.data.count;
                console.log("Here", vm.totalEntries);

            });

        $http.get(window.API_ROOT + '/users/' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
            .then(function (response) {
                vm.user = response.data.user;
            });


        this.loadAllEntries = function () {
            vm.message = "all";
            $state.reload();
        }

        this.getStarredEntries = function (isRead) {
            vm.message = "starred";
            vm.filterByRead = undefined;
            $http.get(window.API_ROOT + '/entries/?starred=true&user=' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
                .then(function (response) {
                    vm.entries = response.data.entries;
                    vm.totalStaredEntries = response.data.count;
                });
        }

        vm.filterByRead = undefined;
        this.filterReadOrUnread = function (isRead) {
            vm.filterByRead = isRead
        }

        this.toggleFavourite = function (entry) {
            //console.log(entry);            
            $http({
                method: "PATCH",
                url: window.API_ROOT + "/entries/" + entry._id,
                data: JSON.stringify([
                    { propName: "isFavourite", value: !entry.isFavourite }
                ]),
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                }
            }).then(function (response) {
                console.log(response.data);
                if (response.data.status == 'error') {
                    //console.log(response.data);                    
                    $window.alert(response.data.message);
                } else {
                    $state.reload();
                }
            }, function (response) {
                $window.alert("Something wrong has happened");
                //console.log(response.data);                
            });
        }

        this.toggleRead = function (entry) {
            //console.log(entry);            
            $http({
                method: "PATCH",
                url: window.API_ROOT + "/entries/" + entry._id,
                data: JSON.stringify([
                    { propName: "isRead", value: !entry.isRead }
                ]),
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                }
            }).then(function (response) {
                //console.log(response.data); 
                if (response.data.status == 'error') {
                    //console.log(response.data);                    
                    $window.alert(response.data.message);
                } else {
                    $state.reload();
                }
            }, function (response) {
                $window.alert("Something wrong has happened");
                //console.log(response.data);                
            });
        }

        this.readArticle = function (entry) {
            $http({
                method: "PATCH",
                url: window.API_ROOT + "/entries/" + entry._id,
                data: JSON.stringify([
                    { propName: "isRead", value: true }
                ]),
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                }
            }).then(function (response) {
                //console.log(response.data); 
                if (response.data.status == 'error') {
                    //console.log(response.data);                    
                    //$window.alert(response.data.message);
                } else {
                    $state.reload();
                }
            }, function (response) {
            });

            window.open(entry.link, '_blank');
        }

        this.getEntriesByFeed = function (feed) {
            vm.message = feed.name;
            vm.filterByRead = undefined;
            $http.get(window.API_ROOT + '/entries/' + feed._id, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
                .then(function (response) {
                    vm.entries = response.data.entries;
                });
        };
    })
    .controller("settingsController", function ($http, $sce, $state, $window, $rootScope) {
        if (!isLoggedIn())
            $state.go("login");

        const vm = this;

        $http.get(window.API_ROOT + '/feeds/?user=' + $rootScope.authData.user, { headers: { 'Authorization': 'Basic ' + $rootScope.authData.token } })
            .then(function (response) {
                vm.feeds = response.data.feeds;
            });


        this.remove = function (id) {
            if (confirm("Are you sure?")) {

                $http({
                    method: "DELETE",
                    url: window.API_ROOT + "/feeds/" + id,
                    headers: {
                        Authorization: 'Basic ' + $rootScope.authData.token
                    }
                }).then(function (response) {
                    //$window.alert(response.data.message);
                    $state.reload();
                }, function (response) {
                    console.log(response);
                    vm.message = $sce.trustAsHtml('<div class="mt-3 alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Error! </strong>' +
                        response.statusText +
                        '</div>');
                });
            }
        }

        this.update = function (id) {
            $http({
                method: "PATCH",
                url: window.API_ROOT + "/feeds/" + id,
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                }
            }).then(function (response) {
                //$window.alert(response.data.message);
                $state.reload();
            }, function (response) {
                console.log(response);
                vm.message = $sce.trustAsHtml('<div class="mt-3 alert alert-info alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Some feeds may not be updated! </strong>' +
                    response.data.message +
                    '</div>');
            });
        }

        this.updateAll = function () {
            for (i in vm.feeds) {
                console.log(vm.feeds[i]._id);
                this.update(vm.feeds[i]._id);
            }
        }
    })
    .controller("addFeedController", function ($http, $state, $sce, $window, $rootScope) {
        if (!isLoggedIn())
            $state.go("login");

        const vm = this;

        this.addFeed = function () {
            $http({
                method: "POST",
                url: window.API_ROOT + "/feeds/?user=" + $rootScope.authData.user,
                data: JSON.stringify({ name: vm.name, link: vm.link }),
                headers: {
                    Authorization: 'Basic ' + $rootScope.authData.token
                }
            }).then(function (response) {
                if (response.data.status == 'error') {
                    //console.log(response.data);                    
                    $window.alert(response.data.message);
                } else {
                    $state.go("settings");
                }
            }, function (response) {
                $window.alert("Something is wrong with your feed");
                //console.log(response.data);                
            });
        }
    })