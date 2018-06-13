$(document).ready(function(){

	
	getMailFromGoogle()
	
	
});



function markGmailMessageAsRead(emailId){
	$.ajax({
		type: 'POST',
		url: '/markGmailMessageAsRead',
		data: {'emailId': emailId},
		dataType: 'json',
		success: function(message) {
			//$('#inboxList').append("<div class='alert alert-warning alert-dismissable'><a data-dismiss='alert' aria-label='close' class='close'>&times;</a>"+message+"</div>");
			getMailFromGoogle();
		}
	});	
}


function getAttachment(emailId, attachmentId){
	$.ajax({
		type: 'GET',
		url: '/getAttachmentFromGmail',
		data: {'emailId': emailId, 'attachmentId': attachmentId},
		dataType: 'json',
		success: function(message) {
			console.log(message);
		}
	});	
}

function viewMessage(emailId){
	$.ajax({
		type: 'GET',
		url: '/getMessageFromGmail',
		data: {'emailId': emailId},
		dataType: 'json',
		success: function(message) {
			$('#inboxOverlay').append(`
			<div class="modal" id="emailModal`
			+emailId+
			`" tabindex="-1" role="dialog">
			<div class="modal-dialog" role="document">
			<div class="modal-content">
			<div class="modal-header">
			<h5 class="modal-title">Modal title</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
			</button>
			</div>
			<div class="modal-body">
			
			
			
			<ul class="nav nav-tabs" id="emailTabs`
			+emailId+
			`" role="tablist">
			<li class="nav-item">
			<a class="nav-link active" id="messagePartsHTML`
			+emailId+
			`-tab" data-toggle="tab" href="#messagePartsHTML`
			+emailId+
			`" role="tab" aria-controls="messagePartsHTML`
			+emailId+
			`" aria-selected="true">HTML</a>
			</li>
			<li class="nav-item">
			<a class="nav-link" id="messagePartsPlain`
			+emailId+
			`-tab" data-toggle="tab" href="#messagePartsPlain`
			+emailId+
			`" role="tab" aria-controls="messagePartsPlain`
			+emailId+
			`" aria-selected="false">Plain text</a>
			</li>
			</ul>
			<div class="tab-content" id="emailTabsContent">
			<div class="tab-pane fade show active" id="messagePartsHTML`
			+emailId+
			`" role="tabpanel" aria-labelledby="messagePartsHTML`
			+emailId+
			`-tab">
			</div>
			<div class="tab-pane fade" id="messagePartsPlain`
			+emailId+
			`" role="tabpanel" aria-labelledby="messagePartsPlain`
			+emailId+
			`-tab">
			</div>
			
			
			
			</div>
			</div>
			<div class="modal-footer">
			<button type="button" class="btn btn-primary">Save changes</button>
			<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
			</div>
			</div>
			</div>
			</div>`);
			
			for(i=0; i <message.message.length; i++){
				//console.log(message.message[i]);
				if(filterValue(message.message[i].metaData[0], "name", "Content-Type")){
					var contentTypeIsHTML = (filterValue(message.message[i].metaData[0], "name", "Content-Type").value).includes("html");
					var contentTypeIsPlain = (filterValue(message.message[i].metaData[0], "name", "Content-Type").value).includes("plain");
					var contentTypeIsMultiPart = (filterValue(message.message[i].metaData[0], "name", "Content-Type").value).includes("multipart");
					
					if(message.message[i].body){
						
						if(contentTypeIsHTML || contentTypeIsMultiPart){
							$('#messagePartsHTML'+emailId).append(message.message[i].body);
						}
						if(contentTypeIsPlain){
							$('#messagePartsPlain'+emailId).append(message.message[i].body);
						}
						
						console.log("check A");
					}
					
					else{
						
						console.log("check C");
						$('#messageParts'+emailId).append("An error occured.");
						
					}
					
					
					
				}
			}
			markGmailMessageAsRead(emailId);
			
			
			
			$('#emailModal'+emailId).modal('show');
			
		}
	});	
}

function filterValue(obj, key, value) {
	return [obj].find(function(v){ return v[key] === value});
}

function b64DecodeUnicode(str) {
	return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
	}).join(''))
}


function markGmailMessageAsUnread(emailId){
	console.log(emailId);
	$.ajax({
		type: 'POST',
		url: '/markGmailMessageAsUnread',
		data: {'emailId': emailId},
		dataType: 'json',
		success: function(message) {
			console.log(message);
			$('#inboxList').append("<div class='alert alert-warning alert-dismissable'><a data-dismiss='alert' aria-label='close' class='close'>&times;</a>"+message.message+"</div>");
			getMailFromGoogle();
		}
	});	
}

function getMailFromGoogle(){
	
	
	
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: 'http://localhost:8999/getEmailsFromGoogle',
		success: function(emails) {
		$('#inboxList').empty();
		console.log(emails);
		
			$('#emailCount').empty();
			$('#inboxList').empty();
			emails.retrievedMessagesFromGoogleMail.sort(function(a, b) {
				return b.internalDate - a.internalDate;
			});
			
			
			$('#emailCount').append(emails.countOfUnreadMessagesFromGoogleMail);
			for(i = 0; i < emails.retrievedMessagesFromGoogleMail.length; i++){
				if(emails.retrievedMessagesFromGoogleMail[i].labelIds.includes("UNREAD")){
					
					if(emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject')){
						x = emails.retrievedMessagesFromGoogleMail[i].payload.headers;
						
						if(emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject').value.length > 0){
							$('#inboxList').append("<a href='#' onclick='viewMessage(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'><div class='emailSubject unread'><p>"+ emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject').value +"</p></div></a>");
						}
						
						else{
							$('#inboxList').append("<a href='#' onclick='viewMessage(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'><div class='emailSubject unread'><p>No subject</p></div></a>");
						}
						
						
						$('#inboxList').append("<div class='emailSnippet unread'><p>"+ emails.retrievedMessagesFromGoogleMail[i].snippet +"</p></div>");
						$('#inboxList').append("<a href='#' onclick='markGmailMessageAsRead(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'>Mark as read</a>");
					}
				}
				else{
					if(emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject')){
						x = emails.retrievedMessagesFromGoogleMail[i].payload.headers;
						if(emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject').value.length > 0){
							$('#inboxList').append("<a href='#' onclick='viewMessage(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'><div class='emailSubject'><p>"+ emails.retrievedMessagesFromGoogleMail[i].payload.headers.find(x => x.name == 'Subject').value +"</p></div></a>");
						}
						else{
							$('#inboxList').append("<a href='#' onclick='viewMessage(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'><div class='emailSubject'><p>No subject</p></div></a>");
						}
						
						
						$('#inboxList').append("<div class='emailSnippet'><p>"+ emails.retrievedMessagesFromGoogleMail[i].snippet +"</p></div>");
						$('#inboxList').append("<a href='#' onclick='markGmailMessageAsUnread(\""+emails.retrievedMessagesFromGoogleMail[i].id+"\")'>Mark as unread</a>");
					}
				}
			}
			
			emails.retrievedMessagesFromGoogleMail = []
		
		}
		
	});
}

function emailForm_sendMail(){
	toField = $('#email_toField').val();
	subjectField = $('#email_subjectField').val();
	bodyField = $('#email_bodyField').val();
	
	$.ajax({
		type: 'POST',
		url: '/sendEmailViaGoogle',
		data: {toField, subjectField, bodyField, 'timestamp': moment.utc().locale("en").format("ddd, DD MMM YYYY HH:mm:ss ZZ")},
		dataType: 'json',
		success: function(){
			$('#inboxList').append("<div class='alert alert-warning alert-dismissable'><a data-dismiss='alert' aria-label='close' class='close'>&times;</a>Your email has been sent!</div>");
		}
	});
	
}			