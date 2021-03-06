var listString;
var status;
var userAgent = navigator.userAgent;
var clientId = decodeURIComponent(window.location.pathname.replace('/', ''));
var xSessionId;
var xApp;
var xPrivate;
var loginByB2CReturn;
var textAlert = "The system can not be accessed at this time. Please contact 1175.";
//var textAlert = "ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175";

function sendOTP() {
	var form = $(this).parents("form:first");
	var mobileNumber = $("#mobileNo").val();
	var msisdn = "66" + mobileNumber.substring(1);

	if (checkFBBID(mobileNumber)) {
		msisdn = "66" + ($("#mobileNoContact").val()).substring(1);
	}

	var serviceId = $("#serviceId").val();
	var accountType = $("#accountType").val();
	var otpChannel = $("#otpChannel").val();
	$.post("/login/sendOneTimePW", {
		msisdn: msisdn,
		serviceId: serviceId,
		accountType: accountType,
		otpChannel: otpChannel
	}, function (json) {
		if (json.isSuccess) {
			$("#transactionID").val(json.transactionID);
			$(".otp-content").show("fast", function () {
				$('#otp').focus();
			});
		} else {
			$("#reqOpt").show();
			$('.msg-error').html(json.msg);
			$('.loginError').show('slow', function () { });
		}
	});
}

function confirmOTP() {
	var form = $(this).parents("form:first");
	var otp = $("#otp").val();
	var mobileNumber = $("#mobileNo").val();
	var msisdn = "66" + mobileNumber.substring(1);
	if (checkFBBID(mobileNumber)) {
		msisdn = "66" + ($("#mobileNoContact").val()).substring(1);
	}
	var transactionID = $("#transactionID").val();
	var tid = $("#tid").val();
	var publicId = $("#publicId").val();
	var urlBack = $("#urlBack").val();
	$.post("/login/loginbyOTP", {
		msisdn: msisdn,
		otp: otp,
		transactionID: transactionID,
		commandId: tid.toString()
	}, function (json) {
		if (!json.isSuccess) {
			$('.msg-error').html(json.msg);
			$('.loginError').show('slow', function () { });
			$('#loginbyOTP').removeAttr('disabled');
		} else {
			var fbbId = mobileNumber;
			var data = { "commandId": tid.toString(), "clientId": clientId, "publicId": msisdn, "loginType": "msisdn" };
			//ถ้า mobileNumber คือ FBBID Format (ขึ้นต้นด้วย 88|89 ตามด้วยตัวเลขอีก 8 ตัว)จะเปลี่ยน loginType เป็น fbbOtp
			if (checkFBBID(mobileNumber)) {
				data.loginType = "fbbOtp";
				data.publicId = fbbId;

			}
			$.ajax({
				type: 'POST',
				url: '/loginByB2C',
				data: data,
				success: function (jsonData, textStatus, request) {
					$('#loginbyOTP').removeAttr('disabled');
					if (jsonData.resultCode == "20000") {
						xSessionId = request.getResponseHeader('x-session-id');
						xApp = request.getResponseHeader('x-app');
						xPrivate = request.getResponseHeader('x-partner-specific-private-id');
						if (jsonData.registerFlag == true) {
							$("#moreInfo").val(jsonData.moreInfo);
							$("#myModalRegister").modal('show');
						} else {
							$.ajax({
								type: 'POST',
								url: '/genSrfpToken',
								data: jsonData,
								headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
								success: function (data, textStatus, request) {
									var responseJson = {};
									responseJson.ol4 = data;
									responseJson.xApp = xApp ? xApp : "";
									responseJson.privateId = jsonData.privateId ? jsonData.privateId : "";
									responseJson.resultCode = jsonData.resultCode;
									responseJson.developerMessage = jsonData.developerMessage ? jsonData.developerMessage : "";
									responseJson.authCode = jsonData.authCode ? jsonData.authCode : "";

									var responseJsonParameters = JSON.stringify(responseJson);

									var json = JSON.parse(responseJsonParameters);

									console.log("ol4::", responseJson.ol4);
		                        var ol5 = genJsonWebToken(responseJson);
                                        var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                                        if (redirectUrl) {
                                            window.location = redirectUrl + "?ol5=" + ol5;
                                        }
                                        //if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
                                        //    window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
                                        //} else if (userAgent.toLowerCase().indexOf("android") != -1) {
                                        //    clientNative.loginCallback(responseJsonParameters);
                                        //} else {
                                        //    var ol5 = genJsonWebToken(responseJson);
                                        //    var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                                        //    if (redirectUrl) {
                                        //        window.location = redirectUrl + "?ol5=" + ol5;
                                        //    }
                                        //    //loginCallback(responseJsonParameters);
                                        //    //										window.location = "http://www.ais.co.th/index.html";
										//}
									const ol2 = jsonData.privateId ? jsonData.privateId : "";
									digitalData = {
										user:{
											loginStatus: "logged-in",
											loginType: "authenticated",
											loginID: ol2
										}
									}
									_satellite.track("successful-login");
								}
							});
						}
					} else {
						loginByB2CReturn = jsonData;
						$("#myModalAlertMessage").html(textAlert);
						$("#myModalAlert").modal('show');
					}
				}
			});
		}
	});
}

function confirmUserPassLdap() {
	var form = $(this).parents("form:first");
	var username = $("#usernameLdap").val();//+ '@ais.co.th';
	var password = $("#passwordLdap").val();
	var tid = $("#tid").val();
	//	$.post("/login/loginLDAP", {
	//		username : username,
	//		password : password
	//	}, function(json) {
	//		if (json.isSuccess == false) {
	//			$('.msg-error').html(json.msg);
	//			$('.loginError').show('slow', function(){});
	//		} else {
	var data = {
		"commandId": tid.toString(),
		"clientId": clientId,
		"publicId": username,
		"credential": password,
		"loginType": "userpwd"
	};
	$("#publicId").val(data.publicId);
	$("#setLoginType").val(data.loginType);

	$.ajax({
		type: 'POST',
		url: '/acr',
		data: data,
		success: function (jsonData, textStatus, request) {
			if (jsonData.resultCode == "20000") {
				xSessionId = request.getResponseHeader('x-session-id');
				xApp = request.getResponseHeader('x-app');
				xPrivate = request.getResponseHeader('x-partner-specific-private-id');

				if (jsonData.registerFlag == true) {
					$("#moreInfo").val(jsonData.moreInfo);
					$("#myModalRegister").modal('show');
				} else {
					$.ajax({
						type: 'POST',
						url: '/genSrfpToken',
						data: jsonData,
						headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
						success: function (data, textStatus, request) {
							var responseJson = {};
							responseJson.ol4 = data;
							responseJson.xApp = xApp ? xApp : '';
							responseJson.privateId = jsonData.privateId ? jsonData.privateId : '';
							responseJson.resultCode = jsonData.resultCode;
							responseJson.developerMessage = jsonData.developerMessage ? jsonData.developerMessage : '';
							responseJson.authCode = jsonData.authCode ? jsonData.authCode : '';

							var responseJsonParameters = JSON.stringify(responseJson);

							var json = JSON.parse(responseJsonParameters);
							console.log("ol4::", responseJson.ol4);
                                var ol5 = genJsonWebToken(responseJson);
                                var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                                if (redirectUrl) {
                                    window.location = redirectUrl + "?ol5=" + ol5;
                                }
                                //if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
                                //    window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
                                //} else if (userAgent.toLowerCase().indexOf("android") != -1) {
                                //    clientNative.loginCallback(responseJsonParameters);
                                //} else {
                                //    var ol5 = genJsonWebToken(responseJson);
                                //    var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                                //    if (redirectUrl) {
                                //        window.location = redirectUrl + "?ol5=" + ol5;
                                //    }
                                //    //loginCallback(responseJsonParameters);
                                //    //		 								window.location = "http://www.ais.co.th/index.html";
                                //}
						}
					});
				}
			} else if (jsonData.resultCode == "40401" || jsonData.resultCode == "40101") {
				$('.msg-error').html(jsonData.developerMessage);
				$('.loginError').show('slow', function () { });
			} else {
				loginByB2CReturn = jsonData;
				$("#myModalAlertMessage").html(textAlert);
				$("#myModalAlert").modal('show');
			}
		}
	});
	//		}
	//	});
}

function confirmUserPassDs3() {
	var form = $(this).parents("form:first");
	var username = $("#username").val();//+ '@ais.co.th';
	var password = $("#password").val();
	var tid = $("#tid").val();
	var data = {
		publicId: username,
		credential: password,
		loginType: "userpwd3rd",
		clientId: clientId,
		commandId: tid.toString()
	}
	$("#publicId").val(data.publicId);
	$("#setLoginType").val(data.loginType);

	$.ajax({
		type: 'POST',
		url: '/acr',
		data: data,
		success: function (jsonData, textStatus, request) {
			if (jsonData.resultCode == "20000") {
				xSessionId = request.getResponseHeader('x-session-id');
				xApp = request.getResponseHeader('x-app');
				xPrivate = request.getResponseHeader('x-partner-specific-private-id');
				$.ajax({
					type: 'POST',
					url: '/genSrfpToken',
					data: jsonData,
					headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
					success: function (data, textStatus, request) {
						var responseJson = {};
						responseJson.ol4 = data;
						responseJson.xApp = xApp ? xApp : '';
						responseJson.privateId = jsonData.privateId ? jsonData.privateId : '';
						responseJson.resultCode = jsonData.resultCode;
						responseJson.developerMessage = jsonData.developerMessage ? jsonData.developerMessage : '';
						responseJson.authCode = jsonData.authCode ? jsonData.authCode : '';

						var responseJsonParameters = JSON.stringify(responseJson);

						var json = JSON.parse(responseJsonParameters);
						console.log("ol4::", responseJson.ol4);
                            var ol5 = genJsonWebToken(responseJson);
                            var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                            if (redirectUrl) {
                                window.location = redirectUrl + "?ol5=" + ol5;
                            }
                            //if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
                            //    window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
                            //} else if (userAgent.toLowerCase().indexOf("android") != -1) {
                            //    clientNative.loginCallback(responseJsonParameters);
                            //} else {
                            //    var ol5 = genJsonWebToken(responseJson);
                            //    var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                            //    if (redirectUrl) {
                            //        window.location = redirectUrl + "?ol5=" + ol5;
                            //    }
                            //    //loginCallback(responseJsonParameters);
                            //    //							window.location = "http://www.ais.co.th/index.html";
                            //}
					}
				});
			} else if (jsonData.resultCode == "40401" || jsonData.resultCode == "40101") {
				$('.msg-error').html(jsonData.developerMessage);
				$('.loginError').show('slow', function () { });
			} else {
				loginByB2CReturn = jsonData;
				$("#myModalAlertMessage").html(textAlert);
				$("#myModalAlert").modal('show');
			}
		}
	});
}

function confirmEmail() {
	var form = $(this).parents("form:first");
	var email = $("#email").val();
	var password = $("#passwordEmail").val();
	var tid = $("#tid").val();
	var data = {
		publicId: email,
		credential: password,
		loginType: "email",
		clientId: clientId,
		commandId: tid.toString()
	}
	$("#publicId").val(data.publicId);
	$("#setLoginType").val(data.loginType);
	//	$.ajax({
	//	 	type: 'POST',
	//	 	url:'/verifyEmail',
	//	 	data: {email : email, password : password},
	//	 	success: function(jsonData, textStatus, request){
	//	 		if(jsonData.success){
	$.ajax({
		type: 'POST',
		url: '/acr',
		data: data,
		success: function (jsonData, textStatus, request) {
			if (jsonData.resultCode == "20000") {
				xSessionId = request.getResponseHeader('x-session-id');
				xApp = request.getResponseHeader('x-app');
				xPrivate = request.getResponseHeader('x-partner-specific-private-id');
				$.ajax({
					type: 'POST',
					url: '/genSrfpToken',
					data: jsonData,
					headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
					success: function (data, textStatus, request) {
						var responseJson = {};
						responseJson.ol4 = data;
						responseJson.xApp = xApp ? xApp : '';
						responseJson.privateId = jsonData.privateId ? jsonData.privateId : '';
						responseJson.resultCode = jsonData.resultCode;
						responseJson.developerMessage = jsonData.developerMessage ? jsonData.developerMessage : '';
						responseJson.authCode = jsonData.authCode ? jsonData.authCode : '';

						var responseJsonParameters = JSON.stringify(responseJson);

						var json = JSON.parse(responseJsonParameters);
						console.log("ol4::", responseJson.ol4);
                            //loginCallback(responseJsonParameters);
                            var ol5 = genJsonWebToken(responseJson);
                            var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                            if (redirectUrl) {
                                window.location = redirectUrl + "?ol5=" + ol5;
                            }

                            //if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
                            //    window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
                            //} else if (userAgent.toLowerCase().indexOf("android") != -1) {
                            //    clientNative.loginCallback(responseJsonParameters);
                            //} else {
                            //    //loginCallback(responseJsonParameters);
                            //    var ol5 = genJsonWebToken(responseJson);
                            //    var redirectUrl = getParameterByName('redirect_uri', window.location.href);
                            //    if (redirectUrl) {
                            //        window.location = redirectUrl + "?ol5=" + ol5;
                            //    }
                            //}
					}
				});
			} else if (jsonData.resultCode == "40401" || jsonData.resultCode == "40101") {
				$('.msg-error').html(jsonData.developerMessage);
				$('.loginError').show('slow', function () { });
			} else {
				loginByB2CReturn = jsonData;
				$("#myModalAlertMessage").html(textAlert);
				$("#myModalAlert").modal('show');
			}
		}
	});
	//	 		} else {
	//	 			$('.msg-error').html("Invalid Email");
	//				$('.loginError').show('slow', function(){});
	//	 		}
	//	 	}
	//	 });
}

function confirmRegister() {
	var moreInfo = $("#moreInfo").val();
	var mobileNumber = $("#mobileNo").val();
	var msisdn = "66" + mobileNumber.substring(1);
	var tid = $("#tid").val();
	var publicId = $("#publicId").val();

	if (checkFBBID(mobileNumber)) {
		data.loginType = "fbbOtp";
		data.publicId = fbbId;

	}

	var setLoginType = $("#setLoginType").val();
	var data = {
		"commandId": tid.toString(),
		"publicId": publicId != '' ? publicId : msisdn,
		"loginType": setLoginType != '' ? setLoginType : "msisdn",
		"clientId": clientId
	}
	$.ajax({
		type: 'POST',
		url: '/continueRegister',
		headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
		data: data,
		success: function (jsonData, textStatus, request) {
			if (jsonData.resultCode == "20000") {
				$.ajax({
					type: 'POST',
					url: '/genSrfpToken',
					data: jsonData,
					headers: { 'X-Session-Id': xSessionId, 'X-App': xApp, 'X-Partner-Specific-Private-Id': xPrivate },
					success: function (data, textStatus, request) {
						var responseJson = {};
						responseJson.ol4 = data;
						responseJson.xApp = xApp ? xApp : '';
						responseJson.privateId = jsonData.privateId ? jsonData.privateId : '';
						responseJson.resultCode = jsonData.resultCode;
						responseJson.developerMessage = jsonData.developerMessage ? jsonData.developerMessage : '';
						responseJson.authCode = jsonData.authCode ? jsonData.authCode : '';

						var responseJsonParameters = JSON.stringify(responseJson);

						var json = JSON.parse(responseJsonParameters);
						console.log("ol4::", responseJson.ol4);
						if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
							window.location = 'appname://loginCallback' + "#" + responseJsonParameters;
						} else if (userAgent.toLowerCase().indexOf("android") != -1) {
							clientNative.loginCallback(responseJsonParameters);
						} else {
							loginCallback(responseJsonParameters);
							//							window.location = "http://www.ais.co.th/index.html";
						}
					}
				});
			} else {
				$('#myModalRegister').modal('hide');
				loginByB2CReturn = jsonData;
				$("#myModalAlertMessage").html(textAlert);
				$("#myModalAlert").modal('show');
			}
		}
	});
}

function getContactNumber() {
	var fbbId = $("#mobileNo").val();
	var tid = $("#tid").val();
	var data = {
		"idType": 'fbbid',
		"idValue": fbbId,
		"commandId": tid.toString()
	};

	$.ajax({
		type: 'POST',
		url: '/login/contactNumber',
		data: data,
		success: function (jsonData, textStatus, request) {
			if (jsonData.resultCode == "20000") {
				if (jsonData.contactNumber) {
					var mobileNumber = jsonData.contactNumber;
					if ((mobileNumber).startsWith("66") && mobileNumber.length == 11) {
						mobileNumber = "0" + jsonData.contactNumber.substring(2);
					} else if ((mobileNumber).startsWith("0") && mobileNumber.length == 10) {
						mobileNumber = mobileNumber;
					}

					$('#mobileNoContact').val(mobileNumber);

					$("#contactNumber").show("fast", function () {
						$('#reqOpt').focus();
					});
				}
			} else {
				$('#myModalRegister').modal('hide');
				loginByB2CReturn = jsonData;
				$("#myModalAlertMessage").html(textAlert);
				$("#myModalAlert").modal('show');
			}
		}
	});
}

function checkFBBID(publicId) {

	if (/(^88|89)(\d{8})$/.test(publicId)) {
		return true;
	} else if (/(^88|89)(\d{8})*@playbox\.co.th$/.test(publicId)) {
		return true;
	}
	return false;
}

function convertStringToJson(listString) {
	if (listString) {
		var decodedData = Base64.decode(listString);
		var listObj = '';
		try {
			listObj = JSON.parse(decodedData.replace(/&quot;/g, '"'));
			return listObj
		} catch (ex) {
			$('#myModalError').modal("show");
			$('.modal-body').html("Please contact customer services.");
		}
		return false;
	}
	return false;
}

function isEmptyObject(obj) {
	return (Object.getOwnPropertyNames(obj).length === 1);
}

function genHtmlListOfSubscribedPublicId(listString) {
	var html = '';
	var listObj = convertStringToJson(listString);
	if (listObj && !isEmptyObject(listObj)) {
		for (var index in listObj) {
			html += "<div class=\"row\">";
			html += "<div class=\"col-md-12 login-public-id\" index=\"" + index + "\">" + listObj[index].publicId + "</div>";
			html += "</div>";
		}
	} else {
		html = 'No Data Found.'
	}
	$('#listOfSubscribedPublicId').html(html);
}

function addClassSuccess(id) {
	$('#' + id + '-feedback').show();
	$('#' + id + '-feedback').removeClass('glyphicon-remove');
	$('#div-' + id).removeClass('has-error');
	$('#' + id + '-feedback').addClass('glyphicon-ok');
	$('#div-' + id).addClass('has-success');
	$('#' + id + '-feedback').removeClass('form-control-feedback-right');
}
function addClassError(id) {
	$('#' + id + '-feedback').show();
	$('#' + id + '-feedback').removeClass('glyphicon-ok');
	$('#div-' + id).removeClass('has-success');
	$('#' + id + '-feedback').addClass('glyphicon-remove');
	$('#div-' + id).addClass('has-error');
	$('#' + id + '-feedback').removeClass('form-control-feedback-right');
}
function removeAllClass(id) {
	$('#' + id + '-feedback').hide();
	$('#' + id + '-feedback').removeClass('glyphicon-remove');
	$('#div-' + id).removeClass('has-error');
	$('#' + id + '-feedback').removeClass('glyphicon-ok');
	$('#div-' + id).removeClass('has-success');
}
function isValidEmail(email) {
	var regExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return regExp.test(email);
}

function validateFbb() {
	var fbbid = $("#mobileNo").val() + "@playbox.co.th";
	var password = $("#password-login").val();
	var authenType = $("#authenType").val();
	$.post(contextPath + "/login/validateFbb", {
		fbbid: fbbid,
		password: password,
		authenType: authenType,
		uri: uri
	}, function (json) {
		if (typeof json == "object") {
			json.authenType = 'fbb';
			$('#json-string').val(JSON.stringify(json));
			if (json.status) {
				$('#myModalAlert').modal("show");
				$('.modal-body').html("login สำเร็จ");
			} else {
				$('#myModalAlert').modal("show");
				var text = "FBBID or password is incorrect, Please check and login again.";
				//var text = "FBBID หรือ Password ไม่ถูกต้อง กรุณาตรวจสอบและ Login ใหม่อีกครั้ง.";
				$('.modal-body').html(text);
			}
		} else {
			json.authenType = 'confirmotp';
			$('#json-string').val(JSON.stringify(json));
			$('#myModalAlert').modal("show");
			$('.modal-body').html("Please contact customer services.");
		}
	});
}

function genJsonWebToken(obj) {
    // Header
    var oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    var oPayload = {};
    var tNow = KJUR.jws.IntDate.get('now');
    var tEnd = KJUR.jws.IntDate.get('now + 1day');
    oPayload = obj;
    // Sign JWT, password=616161
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "SRFPTOKENKEY");
    return sJWT;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(
	function () {
		$("#email").keypress(function (e) {
			removeAllClass($(this).attr('id'))
		});
		$("#email").focusout(function (e) {
			if (isValidEmail($("#email").val())) {
				addClassSuccess($("#email").attr('id'));
				$('#loginbyEmail').removeAttr('disabled');
			} else {
				addClassError($("#email").attr('id'));
			}
		});

		$('#mobileNoContact').attr('disabled', 'disabled');
		$('.loginError').hide();
		$('.loginSuccess').hide();
		$('#contactNumber').hide();
		$('#mobileNo').focus();

		$("#reqOpt").click(function () {
			var mobileNo = $("#mobileNo").val();

			if (checkFBBID(mobileNo)) {
				$('.loginError').hide('fast', function () { });
				sendOTP();
			} else if ((mobileNo.length < 10 || mobileNo.charAt(0).indexOf('0') == -1)) {
				var textValidNumber = "Please enter the correct phone number.";
				//var textValidNumber = "กรุณากรอกข้อมูลหมายเลขโทรศัพท์ให้ถูกต้อง.";
				$('.msg-error').html(textValidNumber);
				$('.loginError').show('slow', function () { });
			} else {
				$('.loginError').hide('fast', function () { });
				sendOTP();
			}
		});

		$("#loginbyOTP").click(function () {
			$('#loginbyOTP').attr('disabled', 'disabled');
			confirmOTP();
		});

		$("#loginbyUserPassLdap").click(function () {
			if ($("#usernameLdap").val() === '' || $("#passwordLdap").val() === '') {
				var textValidComplete = "Please complete the information.";
				//var textValidComplete = 'กรุณากรอกข้อมูลให้ครบถ้วน';
				$('.msg-error').html(textValidComplete);
				$('.loginError').show('slow', function () { });
			} else {
				confirmUserPassLdap();
			}
		});

		$("#loginbyUserPassDs3").click(function () {
			if ($("#username").val() === '' || $("#password").val() === '') {
				var textValidComplete = "Please complete the information.";
				//var textValidComplete = 'กรุณากรอกข้อมูลให้ครบถ้วน';
				$('.msg-error').html(textValidComplete);
				$('.loginError').show('slow', function () { });
			} else {
				confirmUserPassDs3();
			}
		});

		$("#loginbyEmail").click(function () {
			if ($("#email").val() === '' || $("#passwordEmail").val() === '') {
				var textValidComplete = "Please complete the information.";
				//var textValidComplete = 'กรุณากรอกข้อมูลให้ครบถ้วน';
				$('.msg-error').html(textValidComplete);
				$('.loginError').show('slow', function () { });
			} else {
				confirmEmail();
			}
		});

		$('#confirmRegister').click(function () {
			confirmRegister();
		});

		$('#cancel').click(function () {
			var url = "http://www.ais.co.th/thankyou_ais/";
			$(location).attr('href', url);
		});

		$("#mobileNo").keydown(function (e) {
			// Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
				// Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) ||
				// Allow: home, end, left, right, down, up
				(e.keyCode >= 35 && e.keyCode <= 40)) {
				// let it happen, don't do anything
				return;
			}
			// Ensure that it is a number and stop the keypress
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});

		$("#mobileNo").keyup(function (e) {
			var numLength = e.target.value.length;
			if (numLength == 10 && checkFBBID(e.target.value)) {
				getContactNumber();
			}
		});

		$("#otp").keyup(function (e) {
			if ($("#otp").val().length < 4) {
				$('#loginbyOTP').attr('disabled', 'disabled');
			} else {
				$('#loginbyOTP').removeAttr('disabled');
			}
		});

		$("#otp").keydown(function (e) {
			// Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
				// Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) ||
				// Allow: home, end, left, right, down, up
				(e.keyCode >= 35 && e.keyCode <= 40)) {
				// let it happen, don't do anything
				return;
			}
			// Ensure that it is a number and stop the keypress

			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});

		$("#username").keydown(function (e) {
			if (e.keyCode == 50) {
				e.preventDefault();
			}
		});
		$("#usernameLdap").keydown(function (e) {
			if (e.keyCode == 50) {
				e.preventDefault();
			}
		});

		/* Old Device Handling*/
		genHtmlListOfSubscribedPublicId(listString);
		$('.login-public-id').click(function () {
			var index = $(this).attr('index');
			var listObj = convertStringToJson(listString);
			if (listObj && !isEmptyObject(listObj)) {
				var params = "?uri=" + uriLoginPublicId + "&privateId=" + privateId + "&publicId=" + listObj[index].publicId + "&authenType=userpassword";
				var url = contextPath + "/register/loginPublicId" + params;
				$(location).attr('href', url);
			} else {
				$('#myModalError').modal("show");
				$('.modal-body').html("Please contact customer services.");
			}
		});
		/* Old Device Handling*/

		/* Login Public Id*/
		if (status) {
			if (status == "Success") {
				$('#back').hide();
			} else {
				$('#back').show();
			}
		}

		$('#myModalAlertRedo').click(function () {
			$("#mobileNo").val('');
			$("#otp").val('');
			$(".otp-content").hide();
			$('.loginError').hide();
			$("#myModalAlert").modal('hide');
		});

		$('#myModalAlertCancel').click(function () {
			var responseJsonParameters = JSON.stringify(loginByB2CReturn);
			if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
				window.location = 'appname://errorCallback' + "#" + responseJsonParameters;
			} else if (userAgent.toLowerCase().indexOf("android") != -1) {
				clientNative.errorCallback(responseJsonParameters);
			} else {
				errorCallback(responseJsonParameters);
				//				window.location = "http://www.ais.co.th/index.html";
			}
		});

		$('#cancelRegister').click(function () {
			$("#myModalRegister").modal('hide');
			var jsonData = { "resultCode": "1", "developerMessage": "cancel", "registerFlag": true }
			var responseJsonParameters = JSON.stringify(jsonData);
			var json = JSON.parse(responseJsonParameters);
			if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
				window.location = 'appname://errorCallback' + "#" + responseJsonParameters;
			} else if (userAgent.toLowerCase().indexOf("android") != -1) {
				clientNative.errorCallback(responseJsonParameters);
			} else {
				errorCallback(responseJsonParameters);
				//				window.location = "http://www.ais.co.th/index.html";
			}
		});

		$('#myModalSessionOk').click(function () {
			$('#myModalSessionAlert').modal('hide');
			$("#myModalAlert").modal('hide');
			var jsonData = { "resultCode": "1", "developerMessage": "cancel", "registerFlag": true };
			var responseJsonParameters = JSON.stringify(jsonData);
			if (userAgent.toLowerCase().indexOf("iphone") != -1 || userAgent.toLowerCase().indexOf("ipad") != -1) {
				window.location = 'appname://errorCallback' + "#" + responseJsonParameters;
			} else if (userAgent.toLowerCase().indexOf("android") != -1) {
				clientNative.errorCallback(responseJsonParameters);
			} else {
				errorCallback(responseJsonParameters);
				//				window.location = "http://www.ais.co.th/index.html";
			}
		});

		setTimeout(function () {
			$('#myModalSessionAlert').modal('show');
			$("#myModalRegister").modal('hide');
		}, 300000);

		$(document).ajaxStart(function () {
			$('#myModalLoading').modal('show');
		});

		$(document).ajaxComplete(function () {
			$('#myModalLoading').modal('hide');
		});
	}
);
