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
        if(hero.length===0){
            return res.send( {hero:"hero not found"} );
        }else{
            return res.send( {hero} );
        }
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

        if(req.body.hasOwnProperty('cities')){
            /*$all->Busca herois que contem pelo menos o 
                    conjunto de cidades do array cities*/
            queryObj['cities'] = {'$all':req.body.cities};
        }
        if(req.body.hasOwnProperty('codename')){
            queryObj['codename'] = req.body.codename;
        }

        if(req.body.hasOwnProperty('disasters')){
            /*Eh usado $or para puxar todos os _ids 
              de disasters e depois relaciono com o heroi*/
            const disasters = await Disaster.find({"$or":req.body.disasters});

            /*$all->Busca herois que contem pelo menos o conjunto de 
                    Desastres listado em array disasters*/
            queryObj['disasters'] = {'$all':disasters};
        }

        const heros = await Hero.find(queryObj).populate('disasters');
        if(heros.length===0){
            return res.send({heros:"hero not found"});
        }else{
            return res.send( {heros} );
        }
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

        const disastersNamesFornecidos = disasters.map(item => item.name);
        //Pega todos desastres no banco a partir do array disasters
        //Fornecido. Por causa do $or pode vir menos desastre do banco
        const disastersDatabase = await Disaster.find({"$or":disasters});
        const disasterNamesInDB = disastersDatabase.map(item => item.name);
        disastersNamesFornecidos.forEach(disaster =>{
            //Verifica se o disaster em lowercase repassado esta no banco
            if(disasterNamesInDB.indexOf(disaster.toLowerCase())===-1){
                const msg = `disaster '${disaster}' is not registered`;
                const param = "disaster";
                const location = "body";
                throw new errorHero(msg, param, location, 'errorRegister');
            }
        });
        const hero = new Hero({realName, codename, cities, disasters:disastersDatabase});
        /*muda o valor default teamWork*/
        if(req.body.hasOwnProperty('teamWork')){
            hero.set('teamWork', req.body.teamWork.toLowerCase());
        }
        await hero.save();
        hero.realName = undefined;//Nao exibir nome apos cadastro
        return res.send({hero});
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
        }else if(err.name==="errorRegister"){
            const {msg, param, location} = err;
            return res.status(400).send({error:{
                msg:msg,
                param:param,
                location:location
            }});
        }else{
            return res.status(500).send({error: 'Error create new hero'});
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
            const msg = `codename '${valor}' was not found`;
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
        
        if(req.body.hasOwnProperty('disasters')){
            const disastersNamesFornecidos = disasters.map(item => item.name);
            
            //Pega todos desastres no banco a partir do array disasters
            //Fornecido. Por causa do $or pode vir menos desastre do banco
            const disastersDatabase = await Disaster.find({"$or":disasters});
            const disasterNamesInDB = disastersDatabase.map(item => item.name);

            disastersNamesFornecidos.forEach(disaster =>{
                //Verifica se o disaster em lowercase repassado esta no banco
                if(disasterNamesInDB.indexOf(disaster.toLowerCase())===-1){
                    const msg = `disaster '${disaster}' is not registered`;
                    const param = "disaster";
                    const location = "body";
                    throw new errorHero(msg, param, location, 'errorUpdate');
                }
            });
            heroInfoUpdate['disasters'] = disastersDatabase;
        }
        const heroUpdateDatabase = await Hero.findByIdAndUpdate(
            hero._id, 
            heroInfoUpdate,
            { new: true })//Retorna hero atualizado
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
            return res.status(500).send({error:'Error update hero'});
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