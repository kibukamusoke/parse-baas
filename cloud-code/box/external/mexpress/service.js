
let xmlescape = require('xml-escape');
let dealer = require('./init').dealer;
let functions = require('../../functions');


module.exports = {

    newShipment: function( details ){
        let xmlStr = functions.json_2_xml({ xml: {details}} );
        let args = {
            strAPIKey: '546e1cf4-d5b7-11e5-91f3-525400f23533',
            intQuotationID: 3588,
            strShipmentDetailsXML: xmlStr
        };

        return new Promise((resolve, reject) => {

            dealer('http://tempuri.org/NewShipmentWithCustomShipperAddress')
                .then(client => client.NewShipmentWithCustomShipperAddress(args, function(err, response, raw, soapHeader) {
                    if (err) { reject(error);return;}
                    let result = response.NewShipmentWithCustomShipperAddressResult;
                    if(result.intResponseCode !== 1){reject({message: result.strResponseMsg});return;}

                    functions.xml_2_json(result.strResponseData.replace('<?xml version="1.0" encoding="utf-8" ?>', '<xml>') + '</xml>')
                        .then((res) => {
                            resolve(
                                {
                                    consignment_number : res.xml.cnnumber,
                                    print_out : res.xml.url
                                }
                            );
                        })
                        .catch((error) => {reject(error);});

                        //console.log('last request: ', client.lastRequest);
                    })
                )
                .catch((err) => {reject(err);});
        });
    }
};





