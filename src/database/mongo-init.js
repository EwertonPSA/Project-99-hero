/**
 * Cria usuario e senha no banco de dados
 * Esse script eh inicializado logo que o container
 * Da base de dados inicializa
 */
db.createUser(
    {
      user: "userE",
      pwd: "12345",
      roles: [
         { role: "readWrite", db: "noderest" }
      ]
    }
)