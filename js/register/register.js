function confirmRegister(){
	var moreInfo = $("#moreInfo").val();
	$.ajax({
		type: 'POST',
		url: '/continueRegister',
		data: {"moreInfo": moreInfo},
		success: function(data, textStatus, request){
			console.log(">>>>", data);
		}
	});	
}

$(document).ready( function(){
	$('#confirmRegister').click(function() {
		confirmRegister();
	});
});