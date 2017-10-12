

let Promise = require('bluebird');
let xml_json = require('xmljson'); // using promises..
let json2xml = require('json2xml');

module.exports = {

    xml_2_json: function( xml ) {
        return new Promise(( resolve, reject) => {
            xml_json.to_json(xml , ( error , json ) => {
                if(json) {
                    resolve(json)
                } else {
                    reject(error);
                }
            });
        })
    },

    json_2_xml: function( json ) {
        return json2xml(json);
    }

};
