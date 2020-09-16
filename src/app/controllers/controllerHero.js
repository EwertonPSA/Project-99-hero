//FALTA CRIAR MIDDLEWARE TBM
const express = require ('express');
//const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Hero = require('../models/hero');//Nome do arquivo
const Disaster = require('../models/disaster');
const mongoose = require('../../database');

//Listagem
router.get('/', async(req, res)=>{
    try{
        const hero = await Hero.find().populate(['disaster']);
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error load heros'});
    }
});

//Listar um heroi pelo id
router.get('/:heroId', async(req, res)=>{
    try{
        const hero = await Hero.findById(req.params.heroId).populate('disaster');
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error, hero not found'});
    }
});

/**
 * Defini o um tipo de erro e atrelha a ele uma mensagem
 * @param {String} message - Mensagem do erro que deseja ser emitida pro erro 
 * @param {String} key - Chave associada a mensagem de erro
 */
function HeroException(message, key) {
    this.message = message;
    this.key = key;
    this.name = "HeroException";
 }

//Rota para criar um heroi
router.post('/', async(req,res)=>{
    try{
        const {realName, codename, cities, disasters} = req.body;
        const hero = new Hero({realName, codename, cities});
        const valueNecessary = ['realName', 'codename', 'cities', 'disaster'];

        /*Se a key teamwork foi repassado entao muda o valor default*/
        if(req.body.hasOwnProperty('teamWork')){
            hero.set('teamWork', req.body.teamWork.toLowerCase());
        }

        /**Verifica se o disaster foi informado na requisicao
         * Pois no map a frente ele eh usado*/
        if(!req.body.hasOwnProperty('disasters')){
            throw new HeroException('Error, it is necessary to include disaster', 'disasters');
        }
       
        /**
         * Incluindo os desastres no esquema do heroi
         * Eh passado por cada desastre e se um desastre nao
         * for encontrado no database entao o heroi nao eh cadastrado,
         * Disaster.name esta em lowercase entao eh feito 
         * O tratamento da entrada antes de busca-lo no banco
         */
        await Promise.all(disasters.map( async disaster => {
            var disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});
            //Cadastra dados com o ID pois eh referenciado
            hero.disasters.push(disasterInDatabase);
        })).then(async function(){
            /*Caso todos dessastres estejam na base de dados
              entao ele eh incluido no heroi*/
            await hero.save();
            hero.realName = undefined;//Nao exibir o nome usado apos o cadastro
            return res.send({hero});
        }).catch(err => {
            //Emite erro que deve ser tratado no try catch por fora
            //Que inclui todas validacoes de atributos no banco
            throw err;
        });
    }catch(err){//Problema keys json
        if(err.name === "ValidationError"){
            /**
             * Percorre todos os erros de validacoes
             * Guardando as keys e os seus valores 
             * Para reportar os erros na resposta
             */
            var error = {};
            const keys = Object.keys(err.errors);
            keys.forEach((key) => {
                error[key] = err.errors[key].message;
            });
            return res.status(400).send({error: error}); // or return next(error);
        }else if(err.name=="HeroException"){
            var error = {};
            error[err.key] = err.message;
            return res.status(400).send({error: error});
        }else if(err.name==="MongoError" && err.code===11000){
            /**Erro diferente do mongoose que reporta
               Chave unica repetida*/
            const value = err.keyValue.codename;
            return res.status(400).send({error: `Error, codename \'${value}\' already exist`});
        }
        else{
            return res.status(400).send({error: 'Error, create new hero'});
        }
    }
});



//Atualizar um projeto
router.put('/:projectId',  async(req, res)=>{
    try{
        const {title, description, tasks_arr} = req.body;
        const project = await Project.findByIdAndUpdate(req.params.projectId, {//projectId eh informado no link
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