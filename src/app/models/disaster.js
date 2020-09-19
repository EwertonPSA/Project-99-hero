const mongoose = require('../../database');
/**
 * Modelo dos disastres no banco
 */
const DisasterSchema = new mongoose.Schema({
	name:{
		type: String,
        required: true,
        unique: true,   //Impedir desastres com o mesmo nome no banco
        lowercase: true,
    }
});

 const Disaster = mongoose.model('Disaster', DisasterSchema);
 module.exports = Disaster;