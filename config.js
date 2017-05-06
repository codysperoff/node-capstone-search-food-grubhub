//Google Places API Key: AIzaSyCKdEEzcZ3x2jH1pboBqelA4oTBodLo0Cs

//example request url
//format: https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters

//The following example is a search request for places of type 'restaurant' within a 500m
//radius of a point in Sydney, Australia, containing the word 'cruise':

//https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=restaurant&keyword=cruise&key=AIzaSyCKdEEzcZ3x2jH1pboBqelA4oTBodLo0Cs



exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://admin:admin@ds119081.mlab.com:19081/node-capstone-search-food-grubhub';
exports.PORT = process.env.PORT || 8088;
