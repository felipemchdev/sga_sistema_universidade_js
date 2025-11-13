const sql = require("mssql");

const dbConfig = {
  server: "localhost",  // ou "DESK-MCH" se for o nome do seu servidor
  database: "ProjetoUniversidadeWeb",
  user: "admin_banco",
  password: "admin",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000, // 30 segundos
    requestTimeout: 30000     // 30 segundos
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;
let isConnecting = false;
let connectionPromise = null;

async function getConnection() {
  if (pool && pool.connected) return pool;
  
  if (isConnecting) {
    // Se já está conectando, aguarda a promessa de conexão existente
    return connectionPromise;
  }
  
  isConnecting = true;
  
  try {
    connectionPromise = (async () => {
      try {
        pool = await sql.connect(dbConfig);
        console.log("Conectado ao SQL Server com sucesso!");
        return pool;
      } catch (err) {
        console.error("Erro de conexão:", err.message);
        pool = null;
        throw err;
      } finally {
        isConnecting = false;
      }
    })();
    
    return await connectionPromise;
  } catch (error) {
    isConnecting = false;
    throw error;
  }
}

// Função para executar consultas
async function query(sqlQuery, params = []) {
  const pool = await getConnection();
  try {
    const request = pool.request();
    
    // Adicionar parâmetros se existirem
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    
    const result = await request.query(sqlQuery);
    return result;
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    throw error;
  }
}

// Testar a conexão ao iniciar
async function testConnection() {
  try {
    await getConnection();
    console.log('Conexão com o banco de dados testada com sucesso!');
    return true;
  } catch (error) {
    console.error('Falha ao conectar ao banco de dados:', error);
    return false;
  }
}

// Executar teste de conexão ao carregar o módulo
testConnection().catch(console.error);

module.exports = { 
  sql, 
  getConnection, 
  query,
  testConnection
};