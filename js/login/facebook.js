window.fbAsyncInit = function() {
	FB.init({
		appId      : '743144839205257',
		cookie     : true,  // enable cookies to allow the server to access 
		// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.8' // use graph api version 2.8
	});

};
var permissions = [
   'email',
   'public_profile',
].join(',');
var fields = [
	'id',
	'name',
	'first_name',
	'middle_name',
	'last_name',
	'gender',
	'languages',
	'email',
].join(',');

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function runAPI() {
	FB.api('/me',{fields: fields}, function(response) {
		var tid = $("#tid").val();
		var clientId = decodeURIComponent(window.location.pathname.replace('/',''));
		var data = {
		 	"commandId": tid.toString(), 
		 	"clientId": clientId, 
		 	"publicId": response.email,
		 	"loginType": "social"
		 };
		$("#publicId").val(data.publicId);
		$("#setLoginType").val(data.loginType);
		
		if(!response.email){
			$("#myModalAlertMessage").html("คุณยังไม่ได้ ยืนยัน email กับทาง facebook กรุณายืนยันemail<br>( <a class='link' href='https://th-th.facebook.com/help/376335499080938'>https://th-th.facebook.com/help/376335499080938</a> )<br>แล้วทำรายการอีกครั้ง");
			$("#myModalAlert").modal('show');
			return;
		}
		
		$.ajax({
			type: 'POST',
			url:'/loginByB2C',
			data: data,
			success: function(jsonData, textStatus, request){
				$('#loginbyOTP').removeAttr('disabled');
				if(jsonData.resultCode == "20000"){
					xSessionId = request.getResponseHeader('x-session-id');
					xApp = request.getResponseHeader('x-app');
					xPrivate = request.getResponseHeader('x-partner-specific-private-id');
					if(jsonData.registerFlag == true){
						$("#moreInfo").val(jsonData.moreInfo);
						$("#myModalRegister").modal('show');
					} else {
						$.ajax({
							type: 'POST',
						    url: '/genSrfpToken',
						    data: jsonData,
						    headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate},
						    success: function(data, textStatus, request){
								var responseJson = {};
								responseJson.ol4 = data;
								responseJson.xApp = xApp? xApp: "";
							    responseJson.privateId = jsonData.privateId? jsonData.privateId:"";
								responseJson.resultCode = jsonData.resultCode;
								responseJson.developerMessage = jsonData.developerMessage? jsonData.developerMessage:"";
								responseJson.authCode = jsonData.authCode? jsonData.authCode: "";
							
							    var responseJsonParameters = JSON.stringify(responseJson);
							    
								var json = JSON.parse(responseJsonParameters);
								
						console.log("ol4::", responseJson.ol4);
						    	if ( userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
									window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
								} else if ( userAgent.toLowerCase().indexOf("android") != -1 ) {
									clientNative.loginCallback(responseJsonParameters);
								} else {
									window.location = "http://www.ais.co.th/index.html";
								}
						    }
						});	
					}
				} else {
					loginByB2CReturn = jsonData;
					$("#myModalAlertMessage").html("ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175");
					$("#myModalAlert").modal('show');
				}
			}
		});
	});
}

function FacebookLogin() {
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			runAPI();
		} else {
			FB.login(function(response) {
				if (response.authResponse) {
					runAPI();
				} else {
					$("#myModalAlertMessage").html("ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175");
					$("#myModalAlert").modal('show');
				}
			}, {scope: permissions});
		}
	});
}
