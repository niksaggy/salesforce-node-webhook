const express = require('express');
const bodyParser = require('body-parser');
const jsforce = require('jsforce');

var actionClient = require('./googleActionsHandler/actionClient');
var options;
var port = process.env.PORT || 3000;

const expApp = express().use(bodyParser.json());

const oauth2 = new jsforce.OAuth2({
    clientId: process.env.SALESFORCE_CONSUMER_KEY,
    clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
    redirectUri: 'https://sfdcadminbot.herokuapp.com/getaccesstoken'
});

expApp.use(bodyParser.urlencoded());


expApp.get('/oauth2/auth', function(req, res) {
	console.log(req);
	res.redirect(oauth2.getAuthorizationUrl({}));
});

expApp.get('/getAccessToken', function(req,resp) {
	console.log('should be here ');
	

		const conn = new jsforce.Connection({ oauth2 : oauth2 });
		console.log('req query code: '+req);
		console.log('req query code: '+req.query);
		//or do we do the redirection here?
		conn.authorize(req.query.code, function(err, userInfo) {
			if (err) {
				console.log('Error happened at authorization-->',err);
				return resp.send(err.message);
			}
			console.log('access token',conn.accessToken);
			console.log('refresh token',conn.refreshToken);
			console.log(conn.instanceUrl);
			console.log("User ID: " + userInfo.id);
			console.log("Org ID: " + userInfo.organizationId);
			options = { Authorization: 'Bearer '+conn.accessToken};
		});
	});	
});


expApp.post('/fulfillment', actionClient);

expApp.get('/', function (req, res) {
	console.log('Request came for home page');
	res.send('Hello World!');
});
expApp.listen(port, function () {
	
	console.log('Example app listening on port 3000!');
});
