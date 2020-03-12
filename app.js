const express = require('express');
const bodyParser = require('body-parser');
const jsforce = require('jsforce');

var actoinClient=require('./googleActionsHandler/actionClient');
var options;
var port = process.env.PORT || 3000;

const expApp = express().use(bodyParser.json());
expApp.use(bodyParser.urlencoded());


expApp.get('/oauth2/auth', function(req, res) {
	// const oauth2 = new jsforce.OAuth2({
	// 	clientId: process.env.SALESFORCE_CONSUMER_KEY,
	// 	clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
	// 	redirectUri: 'https://sfdcadminbot.herokuapp.com/getAccessToken'
	// });
	console.log(req);
	//res.redirect(oauth2.getAuthorizationUrl({}));
	res.send('success');
});

//
// Pass received authorization code and get access token
//
expApp.get('/getAccessToken', function(req,resp) {
	console.log('should be here ');
	const oauth2 = new jsforce.OAuth2({
		clientId: process.env.SALESFORCE_CONSUMER_KEY,
		clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
		redirectUri: 'https://sfdcadminbot.herokuapp.com/getAccessToken'
	});

	const conn = new jsforce.Connection({ oauth2 : oauth2 });
		console.log('req query code '+req.query.code);
		conn.authorize(req.query.code, function(err, userInfo) {
		if (err) {
            console.log('Error happened at authorization-->',err);
			return resp.send(err.message);
		}
		const conn2 = new jsforce.Connection({
			instanceUrl : conn.instanceUrl,
			accessToken : conn.accessToken
		});
		conn2.identity(function(err, res) {
		if (err) { 
            console.log('Error happened at identity-->',err);
            return resp.send(err.message); 
        }
		  console.log("user ID: " + res.user_id);
		  console.log("organization ID: " + res.organization_id);
		  console.log("username: " + res.username);
		  console.log("display name: " + res.display_name);
		  options = { Authorization: 'Bearer '+conn.accessToken};
		  resp.redirect(`https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID?code=${req.query.code}&state=true`);
		});
	});
	
});


var oppInfo = function(oppName,fieldNames){
	return new Promise((resolve,reject)=>{
		console.log('**options** ' +options);
		conn.apex.get("/getOpptyInfo?oppName="+oppName+"&fieldNames="+fieldNames,options,function(err, res){
			if (err) {
				reject(err);
			}
			else{
				resolve(res);
			}
		});
	});
};


// var createTask = function(oppName,taskSubject,taskPriority,conFName){
// 	return new Promise((resolve,reject)=>{
		
// 		conn.apex.get("/createTask?oppName="+oppName+"&taskSubject="+taskSubject+"&taskPriority="+taskPriority+"&contactFirstName="+conFName,options,function(err, res){
// 			if (err) {
// 				reject(err);
// 			}
// 			else{
// 				resolve(res);
// 			}
// 		});
// 	});
// };

// var logMeeting = function(meetingNotes,oppName,conFName){
// 	return new Promise((resolve,reject)=>{
		
// 		conn.apex.get("/logMeeting?oppName="+oppName+"&meetingNotes="+meetingNotes+"&contactFirstName="+conFName,options,function(err, res){
// 			if (err) {
// 				reject(err);
// 			}
// 			else{
// 				resolve(res);
// 			}
// 		});
// 	});
// };

// var logMeetingToday = function(meetingNotes,oppName,conFName){
// 	return new Promise((resolve,reject)=>{
// 		var followUpLtrTdy = 'Yes';
// 		conn.apex.get("/logMeeting?oppName="+oppName+"&meetingNotes="+meetingNotes+"&contactFirstName="+conFName+"&followUpLater="+followUpLtrTdy,options,function(err, res){
// 			if (err) {
// 				reject(err);
// 			}
// 			else{
// 				resolve(res);
// 			}
// 		});
// 	});
// };


// var updateOppty = function(fieldNames,fieldValues,oppName){
// 	return new Promise((resolve,reject)=>{
		
// 		conn.apex.get("/updateOpptyInfo?oppName="+oppName+"&fieldNames="+fieldNames+"&fieldValues="+fieldValues,options,function(err, res){
// 			if (err) {
// 				reject(err);
// 			}
// 			else{
// 				resolve(res);
// 			}cls

// 		});
// 	});
// };



expApp.post('/fulfillment', actoinClient);

expApp.get('/', function (req, res) {
	console.log('Request came for home page');
	res.send('Hello World!');
});
expApp.listen(port, function () {
	
	console.log(`Example app listening on port ! ${port}`);
});
