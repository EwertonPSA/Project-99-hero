const { body, validationResult } = require('express-validator');

/**
 * Funcao que verifica se foi emitido algum erro
 * Nas entradas, enviando uma resposta de erro
 * com mais detalhes caso seja encontrado um erro
 */
validationParams = function(req, res, next){
    const errorValidation = validationResult(req);
    if (! errorValidation.isEmpty() ) {

        return res.status(400).send({
            //Emiti o primeiro erro encontrado
            error: errorValidation.errors[0]
        });
    }
    next()
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
        .isEmpty()
        .withMessage("Error, the field cannot be empty"),
    validationParams,
    body('disasters')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('cities')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
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
    validationParams,
    body('codename')
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),   
    validationParams,
    body('disasters')//array
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('cities')//array
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('teamWork')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    validationParams
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
    validationParams,
    body('codename')
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),   
    validationParams,
    body('disasters')//array
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('cities')//array
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('teamWork')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty'),
    validationParams
]

exports.delete = [
    body('codename')
    .not()
    .isEmpty().withMessage('Error, the field cannot be empty'),   
    validationParams,
]