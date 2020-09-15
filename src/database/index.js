/**
 * Faz a conexao com o banco de dados com suas configuracoes
 * E exporta a conexao
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI; //uri com as configuracoes do banco
mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true , 
    useFindAndModify: false ,//Para usar o mongoose.findOneAndUpdate()
    useCreateIndex: true
});  
mongoose.Promise = global.Promise;
module.exports = mongoose;