var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var countOfUnreadMessagesFromGoogleMail;
var request = require('request');
var gmail = require('./gmail.js');

app.use(bodyParser.json());


//Allow access to the public directory
app.use(express.static('public'));


module.exports = function (app) {
	let spacesArray = [];
	/////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////
	//ROOT
	
	
	app.get('/', function (req, res, next) {
		
		res.render('index', {messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
			
		
		
	}); 
	
	
	app.get('/oAuthCallBack', async function (req, res, next) {
		try{
			
			if(gmail.isAuthenticatedToGoogle){
				res.redirect('/');
			}
			else{
				
				
				var getAccessToken = 'https://www.googleapis.com/oauth2/v4/token?' + 
				'code=' + req.query.code +
				'&client_id=' + process.env.GoogleAPI_Client_Id +
				'&client_secret='  + process.env.GoogleAPI_Client_Secret +
				'&redirect_uri=' + "http://localhost:8999/oAuthCallBack" +
				'&grant_type=' + "authorization_code";
				request.post(getAccessToken, async function(error,response, body){
					try{
						var data = JSON.parse(response.body);
						console.log(data);
						await gmail.storeToken(data);
						res.redirect('/');
					}
					catch(e){}
				});
				
			}
			
		}
		catch(e){}
	});
	
	
	app.get('/getEmailsFromGoogle', async function(req, res, next){
		try {
			
			var countOfUnreadMessagesFromGoogleMail = await gmail.getNumberOfUnreadMessagesFromGoogleMail();
			var retrievedMessagesFromGoogleMail = await gmail.getMessagesFromGoogleMail();
			res.send({'countOfUnreadMessagesFromGoogleMail': countOfUnreadMessagesFromGoogleMail, 'retrievedMessagesFromGoogleMail':retrievedMessagesFromGoogleMail});
			
			
		}
		catch(e){
			throw(e);
		}
		
	});
	
	
	app.get('/getMessageFromGmail', async function(req, res, next){
		try {
			//TODO ADD SUPPORT FOR MULTIPART
			var emailChain = await gmail.getMessageFromGmail(req.query.emailId);
			var emailChainToSendToFrontEnd = [];
			for(part=0; part <emailChain.length; part++){
				emailChainToSendToFrontEnd.push({"metaData": emailChain[part].headers, "body": Base64.decode(emailChain[part].body.data)});
			}
			
			
			
			//console.log(emailChainToSendToFrontEnd);
			res.send({message: emailChainToSendToFrontEnd});
			
		}
		catch(e){
			
			throw(e);
		}
		
	});
	
	
	app.post('/sendEmailViaGoogle', function(req, res){
		
			var rawEmail = [];
			rawEmail.push("From: <testapp@testapp.com>");
			rawEmail.push("To: <" + req.body.toField + ">");
			rawEmail.push("Content-type: text/html;charset=iso-8859-1");
			rawEmail.push("MIME-Version: 1.0");
			rawEmail.push("Subject: " + req.body.subjectField);
			rawEmail.push('');
			rawEmail.push(req.body.bodyField);
			
			var email = rawEmail.join('\r\n').trim();
			
			var base64EncodedEmail = new Buffer(email).toString('base64');
			
			
			
			
			base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');
			gmail.sendParsedEmail(base64EncodedEmail);
			
			
	});
	
	
	
	
	app.post('/markGmailMessageAsUnread', async function(req, res){
		try {
			await gmail.markGmailMessageAsUnread(req.body.emailId);
			res.send({message: "Successfully marked email as unread"});
		}
		catch(e){
			res.send({message: "Failed to mark email as unread! Error: "+err});
		}
		
	});
	
	app.post('/markGmailMessageAsRead', async function(req, res){
		try {
			await gmail.markGmailMessageAsRead(req.body.emailId);
			res.send({message: "Successfully marked email as read"});
		}
		catch(e){
			res.send({message: "Failed to mark email as read! Error: "+err});
		}
		
	});
	
}
