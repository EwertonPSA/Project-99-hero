//FALTA CRIAR MIDDLEWARE TBM
const express = require ('express');
//const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Hero = require('../models/hero');//Nome do arquivo
const Disaster = require('../models/disaster');
const mongoose = require('../../database');
const validation = require('../middlewares/heroMiddlewares');



//Listagem
router.get('/', async(req, res)=>{
    try{
        const hero = await Hero.find().populate('disasters');
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error load heros'});
    }
});




/**
 * Busca herois no banco de dados
 * @param  {String} [codename] Opcional - codenome do heroi
 * @param { [{"name":String}] } [disasters] Opcional - array de desastres coberto pelos heroi
 * @param { [ String ] } [cities] Opcional - array de cidades cobertas pelos heroi
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
 * Definindo formatacao uma formatacao de erro
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
 * @param {String} [realName] nome verdadeiro do heroi
 * @param {String} [codename] codenome do heroi
 * @param { [{"name":String}] } [disasters] array de desastres coberto pelos heroi
 * @param { [ String ] } [cities] array de cidades cobertas pelos heroi
 * @param {String} [teamWork] Opcional - se o heroi trabalha em equipe
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
         * Eh passado por cada desastre e se um desastre nao
         * for encontrado no database entao o heroi nao eh cadastrado*/
        await Promise.all(disasters.map( async disaster => {
            const disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});

            if(disasterInDatabase===null){
                /**O erro ValidationError gerado por hero.save()  
                 * Ao tentar armazenar null em Disaster nao armazena 
                 * Informacoes como nome quando eh feito Disaster.find()
                 * Foi necessario gerar um novo erro*/
                const msg = `disaster \'${disaster.name}\' not registered`;
                const param = "disaster";
                const location = "body";
                throw new errorHero(msg, param, location, 'errorDisaster');
            }
            //Cadastra no array os dados com o ID pra referenciar
            hero.disasters.push(disasterInDatabase);
        })).then(async function(){
            /*Salva o heroi no banco*/
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

//Atualizar dados heroi
router.put('/:heroId',  async(req, res)=>{
    try{
        const {codename, description, tasks_arr} = req.body;
        const project = await Project.findByIdAndUpdate(req.params.heroId, {//projectId eh informado no link
            title, 
            description
        },{ new: true }); //Por padrao findByIdAndUpdate retorna o valo antigo, alterei pra retornar o novo
        
        project.tasks = [];//Retira do project os arrays atuais
        
        Task.remove({ project: project._id });//Remove os taks associados ao projeto a partir do id(contido em project)

        await Promise.all(tasks_arr.map( async task => {
            const projectTask = new Task({ ...task, project: project._id});//Nao salva no banco, soh cria

            await projectTask.save();//Salva no banco primeiro uma task
            project.tasks.push(projectTask);//Inlcui essa tasks no array de project
        }));
        
        await project.save();
        return res.send(project);
    }catch(err){
        return res.status(400).send({error: 'Error create new project'});
    }
});

//Deletar um projeto
router.delete('/:projectId', async(req, res)=>{
    try{
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send();
    }catch(err){
        return res.status(400).send({error: 'Error deleting project'});
    }
});
module.exports = app => app.use('/hero', router);