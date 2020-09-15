const mongoose = require('../../database');
const bcrypt = require('bcryptjs');
const CompanyAccountSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        required: true,
        lowercase: true,//vai ser convertido nesse formato
    },
    password:{
        type: String,
        required: true,
        select: false,//Deixar a senha nao acessivel por padrao
    },
});

//Encriptando a senha antes de salvar os dados no banco
CompanyAccountSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
})

//"compilando" o modelo
 const CompanyAccount = mongoose.model('CompanyAccount', CompanyAccountSchema);
 /*Exporta o usuario*/
 module.exports = CompanyAccount;