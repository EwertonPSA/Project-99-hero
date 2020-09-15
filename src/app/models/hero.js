const mongoose = require('../../database');
//const bcrypt = require('bcryptjs');//VER SE VA PRECISAR DE SENHA
/**
 * Esquema do heroi no banco de dados
 * {
 *      "realName":""   //Obg -> Testar, nao eh pra ser mostrar
 *      "codename":""   //Obg 
 *      "disasters":""  //Obg <id>
 *      "city":""       //Obg TESTAR Verificar validacao desses atributos(tóquio, Toquio)
 *      "teamWork":""   //Testar indiferente e o til nas palavras
 * }
 */
const HeroSchema = new mongoose.Schema({
	realName:{
		type: String,
        required: true,
        select: false, //Impedir que o nome seja listado
        lowercase: true,
    },
    codename:{
        type: String,
        required: true,
        lowercase: true,
    },
    disasters:[{//Referenciando os desastres que se encontram na base de dados
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disaster',
        required: true,
    }],//************* Vai criar os desastres a empresa, soh que na hora de incluir vai verificar se o desastre existe na base de dados o desastre , se nao tiver nao permite o cadastro
    city:[{//--------------------APRESENTAR ,Incluido como atributo, diminuindo tempo de acesso ao banco
        type: String,
        required: true,
        lowercase: true, 
        enum: ['new york', 'rio de janeiro', 'toquio'],
    }],
    teamWork: {
        type: String,
        enum: ['sim', 'não', 'indiferente'],
        default: 'indiferente',
        lowercase: true,
    }
});

//"compilando" o modelo
 const Hero = mongoose.model('Hero'/*Nome do model*/, HeroSchema/*Passa o nome do esquema*/);
 /*Exporta o usuario*/
 module.exports = Hero;