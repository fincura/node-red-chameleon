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

    // Move the admin UI
    httpAdminRoot: '/red',

    // You can protect the user interface with a userid and password by using the following property
    // the password must be an md5 hash  eg.. 5f4dcc3b5aa765d61d8327deb882cf99 ('password')
    //httpAdminAuth: {user:"user",pass:"5f4dcc3b5aa765d61d8327deb882cf99"},

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
            //icon: "/absolute/path/to/deploy/button/image" // or null to remove image
        }//,
        // menu: { // Hide unwanted menu items by id. see packages/node_modules/@node-red/editor-client/src/js/red.js:loadEditor for complete list
        //     "menu-item-import-library": false,
        //     "menu-item-export-library": false,
        //     "menu-item-keyboard-shortcuts": false,
        //     "menu-item-help": {
        //         label: "Alternative Help Link Text",
        //         url: "http://example.com"
        //     }
        // },
        // userMenu: false, // Hide the user-menu even if adminAuth is enabled
        // login: {
        //     image: "/absolute/path/to/login/page/big/image" // a 256x256 image
        // },
        // logout: {
        //     redirect: "http://example.com"
        // },
        // palette: {
        //     editable: true, // Enable/disable the Palette Manager
        //     catalogues: [   // Alternative palette manager catalogues
        //         //'https://catalogue.nodered.org/catalogue.json'
        //     ],
        //     theme: [ // Override node colours - rules test against category/type by RegExp.
        //         //{ category: ".*", type: ".*", color: "#f0f" }
        //     ]
        // },
        // projects: {
        //     enabled: false // Enable the projects feature
        // }
    },
}

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
}

settings.pgAppname = 'nodered';
pgutil.initPG();
pgutil.createTable();
