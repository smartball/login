var googleUser = {};
var startApi = function() {
	gapi.load('auth2', function(){
		auth2 = gapi.auth2.init({
			client_id: '382097345262-684llv9s62em836k3nhhoc5sa2uc1m5u.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		});
		
		if(document.getElementById('googleLogin')) {
			attachSignin(document.getElementById('googleLogin'));
		}
    });
};

function attachSignin(element) {
	auth2.attachClickHandler(element, {}, function(googleUser) {
		var profile = googleUser.getBasicProfile();
        gapi.client.load('plus', 'v1', function () {
            var request = gapi.client.plus.people.get({
                'userId': 'me'
            });
            
            request.execute(function (resp) {
               console.log(resp)
               //todo
            });
        });
	}, function(error) {
		$("#myModalAlertMessage").html("ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175");
		$("#myModalAlert").modal('show');
	});
}

startApi()
