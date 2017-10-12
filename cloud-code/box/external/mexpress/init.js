
let fs = require('fs');
let soap = require('soap');
let Promise = require('bluebird');
let wsdl = 'http://gold.sure-reach.net/gold/API.asmx?WSDL';
let url = 'http://gold.sure-reach.net/gold/API.asmx';
process.setMaxListeners(0);

let wsdl_options = {
    forceSoap12Headers: true
};

module.exports = {

    dealer: (actionUrl) => {

        return new Promise((resolve, reject) => {

            soap.createClient(wsdl, wsdl_options , function(err, client) {
                let soapHeader = {
                    'wsa:To': url,
                    'wsa:Action': actionUrl
                };

                client.addSoapHeader(soapHeader, '', 'wsa', 'http://www.w3.org/2005/08/addressing');

                if(client){
                    resolve(client);
                } else {
                    reject();
                }
            })

        });
    }

};