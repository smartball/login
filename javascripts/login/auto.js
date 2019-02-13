var userAgent = navigator.userAgent;
var clientId = decodeURIComponent(window.location.pathname.replace('/',''));
var header = {};

function auto(){
	$(document).ready(function(){
		$('#myModalLoading').modal('show');
		$("#login-form").hide();
		
		if(setHeader && setHeader != "[object Object]") {
			try {
				header = JSON.parse(setHeader.replace(/&quot;/g, '"'))
			} catch (e) {
				header = {}
			}
		}
		$.ajax({
			type: 'POST',
		    url: '/genSrfpToken',
		    headers: header,
		    data: {"authCodeExpiry" : authCodeExpiry},
		    success: function(data, textStatus, request){				
				var responseJson = {};
				responseJson.ol4 = data;
				responseJson.xApp = header["X-App"]? header["X-App"] : '';
			    responseJson.privateId = privateId? privateId: '';
				responseJson.resultCode = '20000';
				responseJson.developerMessage = 'Success';
				responseJson.authCode = authCode? authCode : '';
			
			    var responseJsonParameters = JSON.stringify(responseJson);
					
				var json = JSON.parse(responseJsonParameters);
				console.log("ol4::", responseJson.ol4);
				var ol5 = genJsonWebToken(responseJson);
				var redirectUrl = getParameterByName('redirect_uri', window.location.href);
				if (redirectUrl) {
					window.location = redirectUrl + "?ol5=" + ol5;
				}								
		    	//if ( userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
				//	window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
				//} else if ( userAgent.toLowerCase().indexOf("android") != -1 ) {
				//	clientNative.loginCallback(responseJsonParameters);
				//} else {
				//	window.location = "http://www.ais.co.th/index.html";
				//}
		    }
		});	
	});

}
