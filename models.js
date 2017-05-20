var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    }
});

var Product = mongoose.model('Product', productSchema);

module.exports = Product;
