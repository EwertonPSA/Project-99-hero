const mongoose = require('../../database');
/**
 * Esquema dos disastres para incluir no banco
 * {
 *      "name":""   //Obg -> Testar, nao eh pra ter mais de um com o mesmo nome
 * }
 */
const DisasterSchema = new mongoose.Schema({
	name:{
		type: String,
        required: true,
        unique: true,   //Impedir desastres com o mesmo nome no banco
        lowercase: true,//vai ser convertido nesse formato
    }
});

 const Disaster = mongoose.model('Disaster', DisasterSchema);
 module.exports = Disaster;