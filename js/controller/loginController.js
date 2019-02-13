
var listString;
var status;
var userAgent = navigator.userAgent;
var clientId = decodeURIComponent(window.location.pathname.replace('/', ''));
var xSessionId;
var xApp;
var xPrivate;
var loginByB2CReturn;
var textAlert = "The system can not be accessed at this time. Please contact 1175.";
textAlert = "ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175";

$(document).ready(
    function () {
        $('#mobileNo').focus();
        $('.loginError').hide();
        $('.loginSuccess').hide();
        $("#confirmOtp").css({ "display": "none" });
        $("#requestOtp").css({ "display": "" });
        $("#reqOpt").click(function () {
            var mobileNo = $("#mobileNo").val();
            var mobileContactNo = $("#mobileNoContact").val();
            if (checkFBBID(mobileNo)) {
                $('.loginError').hide('fast', function () { });
                sendOTP();
            } else if ((mobileNo.startsWith("88") || mobileNo.startsWith("89")) && mobileNo.length < 10) {
                $('.msg-error').html('กรุณากรอกข้อมูลหมายเลขอินเทอร์เน็ตให้ถูกต้อง');
                $('.loginError').show('slow', function () { });
            } else if ((mobileNo.startsWith("88") || mobileNo.startsWith("89")) && (mobileContactNo.length != 10 || !mobileContactNo.startsWith("0"))) {
                $('.msg-error').html('เบอร์ติดต่อของท่านไม่ใช่เบอร์มือถือ');
                $('.loginError').show('slow', function () { });
            } else if ($("#mobileNo").val().length < 10 && $("#mobileNo").val().startsWith("0")) {
                $('.msg-error').html('กรุณากรอกข้อมูลหมายเลขโทรศัพท์ให้ถูกต้อง');
                $('.loginError').show('slow', function () { });
            } else {
                $('.loginError').hide('fast', function () { });
                $("#requestOtp").css({ "display": "none" });
                $("#confirmOtp").css({ "display": "" });
                sendOTP();
            }
        });
        $("#reqOptAgain").on("click", function () {
            var mobileNo = $("#mobileNo").val();
            if (checkFBBID(mobileNo)) {
                $('.loginError').hide('fast', function () { });
                sendOTP();
            } else if ((mobileNo.startsWith("88") || mobileNo.startsWith("89")) && mobileNo.length < 10) {
                $('.msg-error').html('กรุณากรอกข้อมูลหมายเลขอินเทอร์เน็ตให้ถูกต้อง');
                $('.loginError').show('slow', function () { });
            } else if ((mobileNo.startsWith("88") || mobileNo.startsWith("89")) && (mobileContactNo.length != 10 || !mobileContactNo.startsWith("0"))) {
                $('.msg-error').html('เบอร์ติดต่อของท่านไม่ใช่เบอร์มือถือ');
                $('.loginError').show('slow', function () { });
            } else if ($("#mobileNo").val().length < 10 && $("#mobileNo").val().startsWith("0")) {
                $('.msg-error').html('กรุณากรอกข้อมูลหมายเลขโทรศัพท์ให้ถูกต้อง');
                $('.loginError').show('slow', function () { });
            } else {
                $('.loginError').hide('fast', function () { });
                sendOTP();
            }
        });

        $("#mobileNo").keyup(function (e) {
            var v = e.target.value
            e.target.value = ''
            for (var i = 0; i < v.length; i++) {
                if (!isNaN(v[i]) && v[i] !== ' ') {
                    e.target.value += v[i]
                }
            }
            var numLength = e.target.value.length;
            if (numLength == 10 && checkFBBID(e.target.value)) {
                getContactNumber();
            } else if (numLength == 10 && !checkFBBID(e.target.value)) {
                $("#reqOpt").show('slow', function () { });
                $('#contactNumber').hide('slow', function () { });
            }
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
            if ((e.keyCode >= 48 && e.keyCode <= 57 && isNaN(e.key)) || e.key === undefined) {
                e.preventDefault();
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
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
            if (e.keyCode >= 48 && e.keyCode <= 57 && isNaN(e.key) || e.key === undefined) {
                e.preventDefault();
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
        $("#otp").keyup(function (e) {
            var v = e.target.value
            e.target.value = ''
            for (var i = 0; i < v.length; i++) {
                if (!isNaN(v[i]) && v[i] !== ' ') {
                    e.target.value += v[i]
                }
            }
            if ($("#otp").val().length < 4) {
                $('#loginbyOTP').attr('disabled', 'disabled');
            } else {
                $('#loginbyOTP').removeAttr('disabled');
            }
        });
        $("#loginbyOTP").click(function () {
            $('#loginbyOTP').attr('disabled', 'disabled');
            confirmOTP();
        });
        $(document).ajaxStart(function () {
            $('#myModalLoading').modal('show');
        });

        $(document).ajaxComplete(function () {
            $('#myModalLoading').modal('hide');
        });

        $('#confirmRegister').click(function () {
            confirmRegister();
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

        $('#myModalAlertRedo').click(function () {
            $("#mobileNo").val('');
            $("#otp").val('');
            $("#confirmOtp").css({ "display": "none" });
            $("#requestOtp").css({ "display": "" });
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

        $('#cancel').click(function () {
            var url = "http://www.ais.co.th/thankyou_ais/";
            $(location).attr('href', url);
        });

        //$("#myModalRegister").modal("show").on('shown.bs.modal', function () {
        //    $(".modal").css({ 'display': 'block', 'opacity': 1});
        //})
        $(document).ajaxStart(function () {
            $('#myModalLoading').modal('show');
        });

        $(document).ajaxComplete(function () {
            $('#myModalLoading').modal('hide');
        });
    }
);

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
        } else if (json.code == '2012') {
            $("#reqOpt").show();
            json.msg = "บริการนี้สำหรับลูกค้าเอไอเอสเท่านั้น กรุณาระบุหมายเลขเอไอเอสใหม่อีกครั้ง";
            $('.msg-error').html(json.msg);
            $('.loginError').show('slow', function () { });
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
                data.publicId = mobileNumber;
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
                                    digitalData.user = {
                                        loginStatus: "logged-in",
                                        loginType: "authenticated",
                                        loginID: ol2
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

function checkFBBID(publicId) {

    if (/(^88|89)(\d{8})$/.test(publicId)) {
        return true;
    } else if (/(^88|89)(\d{8})*@playbox\.co.th$/.test(publicId)) {
        return true;
    }
    return false;
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

function getContactNumber() {
    $("#reqOpt").hide();
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

                    if (mobileNumber.length != 10 || !mobileNumber.startsWith("0")) {
                        $('#myModalRegister').modal('hide');
                        loginByB2CReturn = jsonData;
                        textAlert = "เบอร์ติดต่อของท่านไม่ใช่เบอร์มือถือ กรุณาติดต่อ 1175";
                        $("#myModalAlertMessage").html(textAlert);
                        $("#myModalAlert").modal('show');
                    }

                    $('#mobileNoContact').val(mobileNumber);

                    $("#contactNumber").show("fast", function () {
                        $("#reqOpt").show("fast", function () {
                            $('#reqOpt').focus();
                        });
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

function confirmRegister() {
    var moreInfo = $("#moreInfo").val();
    var mobileNumber = $("#mobileNo").val();
    var msisdn = "66" + mobileNumber.substring(1);
    var tid = $("#tid").val();
    var publicId = $("#publicId").val();
    var setLoginType = $("#setLoginType").val();
    var data = {
        "commandId": tid.toString(),
        "publicId": publicId != '' ? publicId : msisdn,
        "loginType": setLoginType != '' ? setLoginType : "msisdn",
        "clientId": clientId
    }

    if (checkFBBID(mobileNumber)) {
        data.loginType = "fbbOtp";
        data.publicId = mobileNumber;
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
                    }
                });
            } else {
                $('#myModalRegister').modal('hide');
                loginByB2CReturn = jsonData;
                $("#myModalAlertMessage").html("ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาติดต่อ 1175");
                $("#myModalAlert").modal('show');
            }
        }
    });
}
