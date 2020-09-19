const { body, validationResult } = require('express-validator');

/**
 * Funcao que verifica se existe algum erro
 * Nas entradas enviando uma resposta com detalhes do 
 * Primeiro erro encontrado, caso contrario prossegue
 */
validationParams = function(req, res, next){
    const errorValidation = validationResult(req);
    if (! errorValidation.isEmpty() ) {
        return res.status(400).send({
            //Emiti apenas o primeiro erro encontrado
            error: errorValidation.errors[0]
        });
    }
    next();
}

/**
 * Se disasters for repassado como parametro
 * Eh verificado se foi incluido na chave correta
 * Que seria o "name" */
validationDisastersKey = function(req, res, next){
    if(!req.body.hasOwnProperty('disasters')){ next() }
    else{
        const keys = req.body.disasters.map(item=>Object.keys(item));
        const error = [];
        keys.forEach(key => {
            if(key != 'name'){
                const msg = `Disaster format in array is not accepted. Format correct {'name':'value_disaster'}`;
                const param = `disasters`;
                const location = "body";
                error.push({msg:msg, param:param, location:location});
            }
        });
        if(error.length != 0){
            return res.status(400).send({error:error[0]});
        }
        next();    
    }
}

/**
 * Validacoes das entradas para a rota 
 * '/hero/recuperate' do controllerHero
 * Que mostra os herois  
 */
exports.recuperate =  [
    body('codename')
        .optional()
        .not()
        .isEmpty().withMessage("Error, the field cannot be empty"),
    body('disasters')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    body('cities')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    validationDisastersKey
];

/**
 * Validacoes das entradas para a rota 
 * '/hero/' do controllerHero  
 * Que registra herois
 */
exports.register = [
    body('realName')
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    body('codename')
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    body('disasters')//array
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    body('cities')//array
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    body('teamWork')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    validationParams,
    validationDisastersKey
]

/**
 * Validacoes das entradas para a rota 
 * '/hero/update' do controllerHero  
 */
exports.update = [
    body('realName')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    body('codename')
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    body('disasters')//array
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    body('cities')//array
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    body('teamWork')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    validationParams,
    validationDisastersKey
]

exports.delete = [
    body('codename')
    .not()
    .isEmpty().withMessage('Error, the field cannot be empty'),   
    validationParams,
]