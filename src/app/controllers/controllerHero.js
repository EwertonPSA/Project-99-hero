const express = require ('express');
const router = express.Router();
const Hero = require('../models/hero');
const Disaster = require('../models/disaster');
const mongoose = require('../../database');
const validation = require('../middlewares/heroMiddlewares');

/**
 * Lista todos os herois
 */
router.get('/', async(req, res)=>{
    try{
        const hero = await Hero.find().populate('disasters');
        return res.send( {hero} );
    }catch(err){
        return res.status(500).send({error: 'Error load heros'});
    }
});

/**
 * Busca herois no banco de dados
 * @param  {String} req.body.codename Opcional - codenome do heroi
 * @param { [{"name":String}] } req.body.disasters Opcional - array de desastres coberto pelos heroi
 * @param { [ String ] } req.body.cities Opcional - array de cidades cobertas pelos heroi
 */
router.get('/recuperate', validation.recuperate, async(req, res)=>{
    try{
        const queryObj = {};
        const keys = Object.keys(req.body);

        /**
         * Como as entradas sao opcionais,
         * Foi feito o tratamento delas aqui dentro
         */
        await Promise.all(keys.map( async key => {
            if(key === "disasters"){
                const array_disaster = req.body[key];
                /*Eh usado $or para puxar todos os _ids 
                  dos desastres e depois relaciono com o heroi*/
                const disaster = await Disaster.find({"$or":array_disaster});

                /*$all->Busca herois que contem pelo menos o conjunto de 
                        Desastres listado em array disaster*/
                queryObj[key] = {'$all':disaster};
            }else if(key == "cities"){
                const array_cities = req.body[key];
                /*$all->Busca herois que contem pelo menos o 
                        conjunto de cidades do array cities*/
                queryObj[key] = {'$all':array_cities};
            }else{
                queryObj[key] = req.body[key];
            }
        }));
        const heros = await Hero.find(queryObj).populate('disasters');
        return res.send( {heros} );
    }catch(err){
        return res.status(500).send({error: 'Hero search error'});
    }
});

/**
 * Definindo uma formatacao de erro no controller hero a ser enviada como resposta
 * @param {String} msg mensagem a ser reportada pro erro
 * @param {String} param o parametro em que se encontra o erro
 * @param {String} location onde esta a variavel do erro
 * @param {String} error nome do erro
 */
function errorHero(msg, param, location, error){
    this.msg = msg;
    this.param = param;
    this.location = location;
    this.name = error;
}

/**
 * Cria um heroi
 * @param {String} req.body.realName nome verdadeiro do heroi
 * @param {String} req.body.codename codenome do heroi
 * @param { [{"name":String}] } req.body.disasters array de desastres coberto pelos heroi
 * @param { [ String ] } req.body.cities array de cidades cobertas pelos heroi
 * @param {String} req.body.teamWork Opcional - se o heroi trabalha em equipe
 */
router.post('/', validation.register, async(req,res)=>{
    try{
        const {realName, codename, cities, disasters} = req.body;
        const hero = new Hero({realName, codename, cities});

        /*muda o valor default*/
        if(req.body.hasOwnProperty('teamWork')){
            hero.set('teamWork', req.body.teamWork.toLowerCase());
        }
       
        /**Incluindo os desastres no esquema do heroi
         * Percorre os desastres e se um desastre nao
         * for encontrado no database entao o heroi nao eh cadastrado
         * E levanta um erro como resposta*/


        await Promise.all(disasters.map( async disaster => {
            const disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});
            if(disasterInDatabase===null){
                /**O erro ValidationError gerado por hero.save() do mongoose
                 * Ao tentar armazenar null em Disaster nao armazena 
                 * O nome do desastre buscado (Disaster.find())
                 * Foi necessario gerar um novo erro pra detalhar o erro como resposta*/
                const msg = `disaster \'${disaster.name}\' is not registered`;
                const param = "disaster";
                const location = "body";
                throw new errorHero(msg, param, location, 'errorDisaster');
            }
            //Cadastra no array os dados com o ID pra referenciar
            hero.disasters.push(disasterInDatabase);
        })).then(async function(){/*Salva o heroi no banco*/
            await hero.save();
            hero.realName = undefined;//Nao exibir nome apos cadastro
            return res.send({hero});
        }).catch(err => {
            throw err;//Tratado pelo try catch de fora
        });
    }catch(err){
        if(err.name === "ValidationError"){
            //Erro de validacoes do enum no modelo hero
            const error = {};
            const keys = Object.keys(err.errors);
            return res.status(400).send({error: {
                //Reporta soh o primeiro erro encontrado
                msg:err.errors[keys[0]].message,
                param:keys[0],
                location: 'body'
            }});
        }else if(err.name==="MongoError" && err.code===11000){
            /**Erro diferente do mongoose que reporta
               Chave unica repetida*/
            const value = err.keyValue.codename;
            return res.status(400).send({error: {
                msg:`codename \'${value}\' already exist`,
                param: 'codename',
                location: 'body'
            }});
        }else if(err.name==="errorDisaster"){
            //Disastre nao cadastrado
            const {msg, param, location} = err;
            return res.status(400).send({error:{
                msg:msg,
                param:param,
                location:location
            }});
        }else{
            return res.status(500).send({error: 'Error, create new hero'});
        }
    }
});

/**
 * Atualizar o cadastro do heroi
 * Eh o alterado apenas os parametro
 * Repassado na requisicao, sendo o codename obrigatorio
 * @param {String} req.body.realName Opcional - nome verdadeiro do heroi
 * @param {String} req.body.codename codenome do heroi
 * @param { [{"name":String}] } req.body.disasters Opcional - array de desastres, precisa ir "name" como chave do desastre
 * @param { [ String ] } req.body.cities Opcional - array de cidades cobertas pelos heroi
 * @param {String} req.body.teamWork Opcional - se o heroi trabalha em equipe
 */
router.put('/update', validation.update, async(req, res)=>{
    try{
        const {realName, cities, codename, disasters, teamWork} = req.body;
        const hero = await Hero.findOne({codename}).populate('disasters');
        if(hero === null){//Caso o heroi nao exista
            const valor = codename;
            const msg = `codiname '${valor}' was not found`;
            const param = "codename";
            const location = "body";
            throw new errorHero(msg, param, location, 'errorUpdate');
        }

        const heroInfoUpdate = {};
        if(req.body.hasOwnProperty('realName')){
            heroInfoUpdate['realName'] = realName.toLowerCase;
        }
        if(req.body.hasOwnProperty('teamWork')){
            //validando entrada teamWork em lowercase
            const permited = ['não', 'sim', 'indiferente'];
            if(permited.indexOf(teamWork.toLowerCase())===-1){
                const msg = `teamWork '${teamWork}' is not allowed`;
                const param = "teamWork";
                const location = "body";
                throw new errorHero(msg, param, location, 'errorUpdate');
            }
            heroInfoUpdate['teamWork'] = teamWork;
        }
        if(req.body.hasOwnProperty('cities')){
            //Feito o tratamando da entrada de cities
            //Para pegar os dados em lowercase
            const permited = ['new york', 'rio de janeiro', 'tókio'];
            const value = cities;
            value.forEach(item => {
                if(permited.indexOf(item.toLowerCase())===-1){
                    const msg = `disaster '${item}' is not registered`;
                    const param = "cities";
                    const location = "body";
                    throw new errorHero(msg, param, location, 'errorUpdate');
                }
            });
            heroInfoUpdate['cities'] = cities;
        }
        
        var disasterInsert = [];
        /*Percorre os desastres e verifica se estao cadastrados no banco
          Depois armazenando ele em disasterInsert com id*/
        if(req.body.hasOwnProperty('disasters')){
            await Promise.all(disasters.map( async disaster => {
                const disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});
                if(disasterInDatabase===null){//Caso nao exista, eh gerado um erro
                    const msg = `disaster '${disaster.name}' is not registered`;
                    const param = "disaster";
                    const location = "body";
                    throw new errorHero(msg, param, location, 'errorUpdate');
                }
                disasterInsert.push(disasterInDatabase);
            })).then(async function(){
                heroInfoUpdate['disasters'] = disasterInsert;
            });
        }
        const heroUpdateDatabase = await Hero.findByIdAndUpdate(
            hero._id, 
            heroInfoUpdate,
            { new: true })
        .populate('disasters');
        return res.send({hero:heroUpdateDatabase});
    }catch(err){
        if(err.name==="errorUpdate"){
            const {msg, param, location} = err;
            return res.status(400).send({error:{
                msg:msg,
                param:param,
                location:location
            }});
        }else{
            return res.status(500).send({error:'Error create new project'});
        }
    }
});

/**
 * Deletar um heroi
 * @param {String} req.body.codename codenome do heroi
 */
router.delete('/delete', validation.delete, async(req, res)=>{
    try{
        const {codename} = req.body;
        const result = await Hero.findOneAndDelete({codename});
        if(result === null){//Heroi nao encontrado
            const msg = `hero '${codename}' was not found`;
            const param = "codename";
            const location = "body";
            throw new errorHero(msg, param, location, 'errorDelete');
        }
        const msg = `Hero '${codename}' has been deleted`;
        return res.send({succes:msg});
    }catch(err){
        if(err.name === "errorDelete"){
            const {msg, param, location} = err;
            return res.status(400).send({error:{
                msg:msg,
                param:param,
                location:location
            }});
        }else{
            return res.status(500).send({error: 'Error deleting project'});
        }
    }
});
module.exports = app => app.use('/hero', router);