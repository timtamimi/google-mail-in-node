var fs = require('fs');

var readline = require('readline');
var {google} = require('googleapis');
var https = require('https');

//var googleAuth = require('google-auth-library');
const gal = require('google-auth-library');



var countOfUnreadMessagesFromGoogleMail;
var retrievedMessagesFromGoogleMail = [];

var gmail_client_secret = {
	"installed": {
		"client_id": process.env.GoogleAPI_Client_Id,
		"project_id": process.env.GoogleAPI_Project_Id,
		"auth_uri": process.env.GoogleAPI_Auth_Uri,
		"token_uri": process.env.GoogleAPI_Token_Uri,
		"auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
		"client_secret": process.env.GoogleAPI_Client_Secret,
		"redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost:8999"]
	}
};


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
var TOKEN_PATH = TOKEN_DIR + '\\' + 'pantheon_gmail_token.json';


function authorize(credentials, callback) {
	
	return new Promise(resolve => {
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[1];
		//var auth = new googleAuth();
		const auth = new gal.GoogleAuth();
		//var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
		const oauth2Client = new gal.OAuth2Client(clientId, clientSecret, redirectUrl);
		//console.log("poop3")
		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, function(err, token) {
			if (err) {
			//console.log("ERROR HERE"+ err)
				resolve(err);
				
				} else {
				oauth2Client.credentials = JSON.parse(token);
				//console.log("token  "+token);
				callback(oauth2Client);
				resolve();
			}
		});
	});
	
}




module.exports.getNumberOfUnreadMessagesFromGoogleMail = function getNumberOfUnreadMessagesFromGoogleMail () {
	
	return new Promise(resolve => {
		try{
			authorize(gmail_client_secret, function (auth){
				var gmail = google.gmail('v1');
				gmail.users.labels.get({
					auth: auth,
					userId: 'me',
					id: 'UNREAD'
					}, function(err, response) {
					//console.log("RESOPONSE " + err)
					countOfUnreadMessagesFromGoogleMail = response.data.messagesUnread;
					resolve(countOfUnreadMessagesFromGoogleMail);
					
				}); 
				
			});
		}
		catch(e){}
	});
}


module.exports.purge = function purge(){
	console.log("Unlinking token...");
	fs.unlink(TOKEN_PATH)
}

module.exports.storeToken = function storeToken(token) {
	try {
	
		//console.log(token)
		//console.log("\n DIR is "+JSON.stringify(TOKEN_DIR))
		fs.mkdirSync(TOKEN_DIR);
		//console.log("got here2");
		} catch (err) {
		if (err.code != 'EEXIST') {
		//	console.log("test error");
			throw err;
		}
	}
	
	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	//console.log('Token stored to ' + TOKEN_PATH);
}



module.exports.getMessagesFromGoogleMail = function getMessagesFromGoogleMail () {
	return new Promise(resolve => {
		authorize(gmail_client_secret, function (auth){
			var gmail = google.gmail('v1');
			gmail.users.messages.list({
				auth: auth,
				q: 'label:inbox',
				userId: 'me'
				},  function(err, topResponse) {
				var emailProcessingCounter = 1;
				
				retrievedMessagesFromGoogleMail = [] //clear down array
				for(i=0; i < topResponse.data.messages.length; i++){
					
					gmail.users.messages.get({
						id: topResponse.data.messages[i].id,
						auth: auth,
						userId: 'me'
						},  function(err, response) {
						retrievedMessagesFromGoogleMail.push(response.data);
						emailProcessingCounter++;
						if(emailProcessingCounter == topResponse.data.messages.length){
							resolve(retrievedMessagesFromGoogleMail);
							
						}
						
					});
					
					
				}
			});
			
		});
	});
}




//module.exports.getMessageFromGmail = 


module.exports.getMessageFromGmail = function getMessageFromGmail(messageId) {
	return new Promise(resolve => {
		
		authorize(gmail_client_secret, function (auth){
			var gmail = google.gmail('v1');
			gmail.users.messages.get({
				auth: auth,
				userId: 'me',
				id: messageId
				}, function(err, response) {
				for(i=0; i < response.data.payload.parts.length; i++){
				}
				
				resolve(response.data.payload.parts);
				
				
			});
			
			
			
		});
		
	});
}



module.exports.markGmailMessageAsRead =  function markGmailMessageAsRead(emailId) {
	return new Promise(resolve => {
		authorize(gmail_client_secret, function (auth){
			var gmail = google.gmail('v1');
			gmail.users.messages.modify({
				auth: auth,
				userId:'me',
				'id':emailId,
				'resource': {
					'addLabelIds':[],
					'removeLabelIds': ['UNREAD']
				}
				}, function(err) {
				if (err) {
					resolve('resolved');
				}
				
				resolve('resolved');
			});
		});
	});
}






module.exports.markGmailMessageAsUnread = function markGmailMessageAsUnread(emailId) {
	return new Promise(resolve => {
		authorize(gmail_client_secret, function (auth){
			var gmail = google.gmail('v1');
			gmail.users.messages.modify({
				auth: auth,
				userId:'me',
				'id':emailId,
				'resource': {
					'addLabelIds':['UNREAD'],
					'removeLabelIds': []
				}
				}, function(err) {
				if (err) {
					resolve('resolved');
				}
				resolve('resolved');
			});
		});
	});
}



module.exports.sendParsedEmail = function sendParsedEmail(base64EncodedEmail){
	
	authorize(gmail_client_secret, function (auth){
		var gmail = google.gmail('v1');
		gmail.users.messages.send({
			auth: auth,
			userId: 'me',
			resource: {raw: base64EncodedEmail}
			}, function(err, response) {
			return;
		}); 
		
	});
}



