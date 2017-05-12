var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    }
});

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
