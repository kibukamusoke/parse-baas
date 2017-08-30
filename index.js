/**
 * Created by trevor on 28/08/2017.
 */


let express = require('express');
let ParseServer = require('parse-server').ParseServer;
let ParseDashboard = require('parse-dashboard');
let path = require('path');


let mount = process.env.PARSE_MOUNT || '/parse';
let databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

let server = new ParseServer({
    databaseURI: databaseUri || 'mongodb://admin:password@localhost:27017/db',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'tvx',
    masterKey: process.env.MASTER_KEY || 'txv123!@#',
    serverURL: (process.env.SERVER_URL || 'http://localhost:1337') + mount,
    liveQuery: {
        classNames: process.env.LIVEQUERY_CLASSES.split(',') ||
            [

            ] // List of classes to support for query subscriptions
    }
});



let allowInsecureHTTP = true;

let parseDashboardSettings = {
    apps: [
        {
            serverURL: (process.env.SERVER_URL || 'http://localhost:1337') + mount,
            appId: process.env.APP_ID || 'tvx',
            masterKey: process.env.MASTER_KEY || 'tvx123!@#',
            appName: process.env.APP_NAME || "TVX",
            //iconName: "cherryLogo.png",
        }
    ],
    users: [

        {
            user: process.env.ADMINUSERNAME,
            pass: process.env.ADMINPASSWORD,
            masterKey: process.env.MASTER_KEY || 'tvx123!@#',
            apps: [
                {
                    appId: process.env.APP_ID || 'tvx'
                }
            ]
        }
    ],
    iconsFolder: "icons"
};

let dashboard = new ParseDashboard(parseDashboardSettings, allowInsecureHTTP);

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

let app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
    res.status(200).send('Internal resource. For authorised persons only!');
});


// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);


// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/test.html'));
});


// make the Parse Server available
app.use(mount, server, function(req, res, next){
    //res.setHeader("Access-Control-Allow-Origin", "*");

    return next();
});


let port = process.env.PORT || 1337;
let httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('tvx parse running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
