
let functions = require('./functions');
let mexpress = require('./external/mexpress/service');

Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});





Parse.Cloud.define('mexpressNewShipment' , function(request, response) {

    // request sample::

    if(!(request.params.data
            && request.params.data.ShipperContactPerson
            && request.params.data.OriginStateID
            && request.params.data.OriginAddress
            && request.params.data.RecpContactPerson
            && request.params.data.DestStateID
            && request.params.data.DestAddress
        )) { response.error('Some Fields Missing'); return;}

        // we only cater for malaysia

    let jsonReq = {
        ServiceTypeID: 1,
        ShipperContactPerson: request.params.data.ShipperContactPerson,
        ShipperCompanyName: request.params.data.ShipperCompanyName || '',
        ShipperPhoneNumber: request.params.data.ShipperPhoneNumber || '',
        OriginCountryID: 1,
        OriginStateID: request.params.data.OriginStateID,
        OriginPostcode: request.params.data.OriginPostcode || '',
        OriginCity: request.params.data.OriginCity || '',
        OriginAddress: request.params.data.OriginAddress,
        RecpContactPerson: request.params.data.RecpContactPerson,
        RecpCompanyName: request.params.data.RecpCompanyName || '',
        RecpPhoneNumber: request.params.data.RecpPhoneNumber || '',
        DestCountryID: 1,
        DestStateID: request.params.data.DestStateID,
        DestPostcode: request.params.data.DestPostcode || '',
        DestCity: request.params.data.DestCity || '',
        DestAddress: request.params.data.DestAddress,
        Description: request.params.data.Description || '',
        Remarks: request.params.data.Remarks || 'Please handle with care',
        Pieces: request.params.data.Pieces || 0,
        Weight: request.params.data.Weight || 0,
        Length: request.params.data.Length || 0,
        Width: request.params.data.Width || 0,
        Height: request.params.data.Height || 0
    };

    mexpress.newShipment(jsonReq)
        .then((result) => {
            response.success(result);
        }) .catch((error) => {
        response.error(error);
    })


});

