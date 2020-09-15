/**
 * Gera bytes aleatorios em hexadecimal fortemente criptografados
 * Utilizado para geracoes dos tokens na aplicacao
 */
const crypto = require('crypto');

module.exports.secret = crypto.randomBytes(50).toString('hex');