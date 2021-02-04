/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var path = require("path");
var when = require("when");
var pgutil = require('./storage/pgutil');

process.env.NODE_RED_HOME = __dirname;

var settings = module.exports = {
    uiPort: process.env.PORT || 1880,
    mqttReconnectTime: 15000,
    serialReconnectTime: 15000,
    debugMaxLength: 10000000,

    // Add the nodes in
    nodesDir: path.join(__dirname,"nodes"),

    // Blacklist the non-bluemix friendly nodes
    nodesExcludes:[ '66-mongodb.js','75-exec.js','35-arduino.js','36-rpi-gpio.js','25-serial.js','28-tail.js','50-file.js','31-tcpin.js','32-udp.js','23-watch.js' ],

    paletteCategories: ['subflows', 'fincura', 'fincura_files', 'fincura_filters', 'fincura_generators', 'fincura_utils', 'output', 'salesforce', 'input', 'filter', 'function', 'weather', 'social', 'analysis'],

    // Enable module reinstalls on start-up; this ensures modules installed
    // post-deploy are restored after a restage
    autoInstallModules: true,

    // Enable audit logging to record changes to the app functionality
    logging: {
      console: {
          level: "info",
          metrics: false,
          audit: true
      }
    },
 
    // Move the admin UI
    httpAdminRoot: '/admin',

    // Serve up the welcome page
    httpStatic: path.join(__dirname,"public"),

    functionGlobalContext: { },

    storageModule: require("./storage/pgstorage.js"),

    httpNodeCors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE"
    },
    
    // Disbled Credential Secret
    credentialSecret: false,

    editorTheme: {
        page: {
            title: "Node-RED-Chameleon",
            css: path.join(__dirname, "./css/style.css"),
            //favicon: "/absolute/path/to/theme/icon",
            //scripts: [ "/absolute/path/to/custom/script/file", "/another/script/file"]
        },
        header: {
            title: "Node-RED-Chameleon",
            //image: "/absolute/path/to/header/image", // or null to remove image
            //url: "http://nodered.org" // optional url to make the header text/image a link to this url
        },
        deployButton: {
            type:"simple",
            label:"Deploy"
        },
        login: {
            image: "/images/fincura_square.png" 
        }
    }
};

// note:  if some error message about reading settings happens, it probably
// means there is a variable not correctly set here.  double check your environment variables
if (process.env.NODE_RED_USERNAME && process.env.NODE_RED_PASSWORD) {
    settings.adminAuth = {
        type: "credentials",
        users: function(username) {
            if (process.env.NODE_RED_USERNAME == username) {
                return when.resolve({username:username,permissions:"*"});
            } else {
                return when.resolve(null);
            }
        },
        authenticate: function(username, password) {
            if (process.env.NODE_RED_USERNAME == username &&
                process.env.NODE_RED_PASSWORD == password) {
                return when.resolve({username:username,permissions:"*"});
            } else {
                return when.resolve(null);
            }
        }
    }
// AWS Cognito OAuth2
} else if (process.env.NODE_RED_AUTH_ADMIN_COGNITO &&
        process.env.NODE_RED_AUTH_ADMIN_COGNITO_GROUP &&
        process.env.NODE_RED_COGNITO_LABEL &&
        process.env.NODE_RED_COGNITO_REGION &&
        process.env.NODE_RED_COGNITO_CALLBACK &&
        process.env.NODE_RED_COGNITO_CLIENT_DOMAIN &&
        process.env.NODE_RED_COGNITO_CLIENT_ID &&
        process.env.NODE_RED_COGNITO_CLIENT_SECRET) {
    settings.adminAuth = {
        type: "strategy",
        strategy: {
            name: "cognito-oauth2",
            label: process.env.NODE_RED_COGNITO_LABEL,
            icon: "fa-user",
            strategy: require('./authStrategy.js'),
            options: {
                adminGroups: process.env.NODE_RED_AUTH_ADMIN_COGNITO_GROUP,
                callbackURL: process.env.NODE_RED_COGNITO_CALLBACK,
                clientDomain: process.env.NODE_RED_COGNITO_CLIENT_DOMAIN,
                clientID: process.env.NODE_RED_COGNITO_CLIENT_ID,
                clientSecret: process.env.NODE_RED_COGNITO_CLIENT_SECRET,
                region: process.env.NODE_RED_COGNITO_REGION,
                scope: ['email', 'openid', 'profile'],
                verify: function(token, tokenSecret, profile, done) {
                    if (!profile.isAdmin) {
	                    throw Error("Access Denied");
                    }
                    done(null, profile);
                }
            }
        },
        users: function(user) {
	    console.log(user);
            return Promise.resolve({ username: user, permissions: "*" });
        }
    };
};

settings.pgAppname = 'nodered';
pgutil.initPG();
pgutil.createTable();
