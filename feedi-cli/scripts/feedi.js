function isLoggedIn(){
    if(localStorage.getItem("authData")){
        return true;
    }
    return false;
}

/*Other Scripts */
$(function () {
    $(".alert").fadeTo(5000, 500).slideUp(1500, function () {
        $(".alert").slideUp(1500);
    });
});