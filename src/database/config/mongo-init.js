/**
 * Cria usuario no banco de dados
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