# Project-99-hero
## Descrição do projeto
Armazenar informações dos herois, pra que a empresa possa fornecer o herói mais adequado para o tipo de desastre ou pela cobertura de cidade. O projeto atual envolve apenas alguns recursos do backend com requisições e acesso ao banco, gerando respostas. 

Foi utilizado banco de dado MongoDB, docker-compose para levantar os containers e alguns dados já são inicializados toda vez que o banco estiver vazio (ou seja, quando o container do mongo for inicializado). Material de apoio: [link](https://www.youtube.com/watch?v=BN_8bCfVp88&list=PL85ITvJ7FLoiXVwHXeOsOuVppGbBzo2dp) .



## Como rodar
Vá até a pasta /src e execute o comando
```
npm install
```

Vá até a pasta raiz e execute
```
docker-compose up -d
```

Tendo o node instalado na sua maquina, vá até a pasta raiz e execute 
```
node src/index.js
```

As requisições já podem ser enviadas e testadas. Usei a ferramenta insominia para testar as requisições.

Pra parar o banco de dados do docker execute
```
docker-compose down
``` 
