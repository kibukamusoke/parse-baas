/**
 * Created by trevor on 28/08/2017.
 */

let express = require('express');
let redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
let ParseServer = require('parse-server').ParseServer;
let ParseDashboard = require('parse-dashboard');
let FSFilesAdapter = require('parse-server-fs-adapter');
let path = require('path');
let fs = require('fs');

let mount = process.env.PARSE_MOUNT || '/parse';
let databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

let prodMode = (process.env.PRODUCTION || 'false') === 'true';
let liveQueryClasses = (process.env.LIVEQUERY_CLASSES || '').split(',');

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

let fsAdapter = new FSFilesAdapter({
    filesSubDirectory: './files/uploads'
});

let server = new ParseServer({
    databaseURI: databaseUri || 'mongodb://ezpoint:ez99point123@ezpoint:27018/ezdata',
    cloud: process.env.CLOUD_CODE_MAIN || './cloud/main.js', //'./cloud-code/box/main.js',
    appId: process.env.APP_ID || 'tvx',
    //restAPIKey: process.env.REST_API_KEY || 'tvx123!@#',
    masterKey: process.env.MASTER_KEY || 'tvx123!@#',
    serverURL: (process.env.SERVER_URL || 'http://localhost:1337') + mount,
    filesAdapter: fsAdapter,
    production: prodMode,
    liveQuery: {
        classNames: liveQueryClasses || [] // List of classes to support for query subscriptions
    },
    push: {
        android: {
            senderId: process.env.FIREBASE_SENDER_ID || 1234556,
            apiKey: process.env.FIREBASE_API_KEY || '12321414343543543543'
        },
        ios:{
            pfx: path.join(__dirname, '/files/ios/my-push-certificate.p12'),
            bundleId: process.env.IOS_BUNDLE_ID || 'com.cherrybusiness.cashback',
            production: true
        }
    },
});



let allowInsecureHTTP = true;

let parseDashboardSettings = {
    apps: [
        {
            serverURL: (process.env.SERVER_URL || 'http://localhost:1337') + mount,
            appId: process.env.APP_ID || 'tvx',
            masterKey: process.env.MASTER_KEY || 'tvx123!@#',
            appName: process.env.APP_NAME || "BOX",
            iconName: "icon.png",
        }
    ],
    users: [

        {
            user: process.env.ADMINUSERNAME || 'admin',
            pass: process.env.ADMINPASSWORD || 'admin',
            masterKey: process.env.MASTER_KEY || 'tvx123!@#',
            apps: [
                {
                    appId: process.env.APP_ID || 'tvx'
                }
            ]
        }
    ],
    iconsFolder: "files/icons"
};

let dashboard = new ParseDashboard(parseDashboardSettings, allowInsecureHTTP);

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

let app = express();

if(process.env.USE_SSL === 'true') {
    app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/])); // force https
}

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

let httpServer = null;

if(process.env.USE_SSL === 'true'){
    httpServer = require('https').createServer({
        key: fs.readFileSync(path.join(__dirname, '/files/ssl/' + (process.env.SSL_SERVER_KEY_FILE || 'server.key'))),
        cert: fs.readFileSync(path.join(__dirname, '/files/ssl/' + (process.env.SSL_SERVER_CERT_FILE ||'server.crt')))
    }, app);
} else {
    httpServer = require('http').createServer(app);
}



httpServer.listen(port, function() {
    console.log('tvx parse running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

