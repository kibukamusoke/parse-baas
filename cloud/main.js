
let functions = require('./functions');
Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});