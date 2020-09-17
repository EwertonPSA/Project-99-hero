//FALTA CRIAR MIDDLEWARE TBM
const express = require ('express');
//const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Hero = require('../models/hero');//Nome do arquivo
const Disaster = require('../models/disaster');
const mongoose = require('../../database');

/**
 * Defini novos erros associados ma formatacao de entrada repassada para controllerHero
 * @param {String} message - Mensagem do erro que deseja ser emitida pro erro 
 * @param {String} key - Chave associada ao erro da mensagem
 */
function HeroException(message, key) {
    this.message = message;
    this.key = key;
    this.name = "HeroException";
 }

//Listagem
router.get('/', async(req, res)=>{
    try{
        const hero = await Hero.find().populate('disasters');
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error load heros'});
    }
});



//Listar um heroi pelo id
router.get('/recuperate', async(req, res)=>{
    try{
        
        if(!req.body.hasOwnProperty('disasters')){
            
        }
        const queryObj = {};
        const keys = Object.keys(req.body);
        const keysAcceptable = ['codename', 'disasters', 'cities'];

        await Promise.all(keys.map( async key => {
            if(keysAcceptable.indexOf(key)===-1){//Verificando atributo nao necessario
                throw new HeroException(`Error, \'${key}\':\'${queryObj[key]}\' not allowed` , `${key}`);
            }else if(key === "disasters"){
                /*Para fazer a busca de herois baseado em disastres
                  Eh necessario buscar os desastres em Disaster. Eh usado
                  $or para puxar todos os _ids dos desastres e depois
                  relacionamento com o heroi*/
                const array_disaster = req.body[key];
                const disaster = await Disaster.find({"$or":array_disaster});
                queryObj[key] = disaster;
            }else{
                queryObj[key] = req.body[key];
            }
        }));
        console.log(queryObj);

        //Folta soh dizer que o desastre deve ser encontrado em pelo menos um
        //Pq da forma que ele ta, UM ARRAY, ele interpreta que eh um and
        //E ai soh pega os valores com aquela combinacao expecifica
        //Entao se puxar heroi de desastre de roubo, soh vem de roubo, 
        //Nao vem os de roubo com assalto por ex
        const heros = await Hero.find(queryObj).populate('disasters');
        //const heros = await Hero.find({codename, cities, disasters}).populate('disasters');

        return res.send( {heros} );
    }catch(err){
        if(err.name==="HeroException"){
            const error = {};
            error[err.key] = err.message;
            return res.status(400).send({error: error});
        }else{
            console.log(err);
            return res.status(400).send({error: 'Error, heros not found'});
        }
    }
});



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
            const disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});
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
            const error = {};
            const keys = Object.keys(err.errors);
            keys.forEach((key) => {
                error[key] = err.errors[key].message;
            });
            return res.status(400).send({error: error});
        }else if(err.name=="HeroException"){
            const error = {};
            error[err.key] = err.message;
            return res.status(400).send({error: error});
        }else if(err.name==="MongoError" && err.code===11000){
            /**Erro diferente do mongoose que reporta
               Chave unica repetida*/
            const value = err.keyValue.codename;
            return res.status(400).send({error: {'codename':`Error, \'${value}\' already exist`}});
        }
        else{
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