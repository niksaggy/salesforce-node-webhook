const express = require('express');
const bodyParser = require('body-parser');
const jsforce = require('jsforce');

var actionClient = require('./googleActionsHandler/actionClient');
var options;
var port = process.env.PORT || 3000;

const expApp = express().use(bodyParser.json());
expApp.use(bodyParser.urlencoded());


expApp.get('/oauth2/auth', function(req, res) {
	console.log(req);
	res.redirect(oauth2.getAuthorizationUrl({}));
	res.send('success');
});


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
		console.log("user ID: " + res.user_id);
		console.log("organization ID: " + res.organization_id);
		console.log("username: " + res.username);
		console.log("display name: " + res.display_name);
		options = { Authorization: 'Bearer '+conn.accessToken};
		console.log('authorization bearer: '+options);
		//resp.redirect(`https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID?code=${req.query.code}&state=true`);
		});
});


expApp.post('/fulfillment', actionClient);

expApp.get('/', function (req, res) {
	console.log('Request came for home page');
	res.send('Hello World!');
});
expApp.listen(port, function () {
	
	console.log('Example app listening on port ! ${port}');
});
