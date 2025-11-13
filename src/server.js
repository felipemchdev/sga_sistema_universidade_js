const express = require("express");
const path = require("path");
const { query, testConnection, getConnection } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware
app.use(express.json());

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "../public")));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

// Configuração do view engine para EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

// =====================================================
// ROTAS DA API
// =====================================================
app.use("/api/departamentos", require("./routes/departamentos"));
app.use("/api/cursos", require("./routes/cursos"));
app.use("/api/turmas", require("./routes/turmas"));
app.use("/api/alunos", require("./routes/alunos"));
app.use("/api/matriculas", require("./routes/matriculas"));
app.use("/api/pagamentos", require("./routes/pagamentos"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Rota para a página inicial (dashboard)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'), (err) => {
        if (err) {
            console.error('Erro ao carregar o dashboard:', err);
            res.status(500).send('Erro ao carregar o dashboard');
        }
    });
});

// Rota para o painel de controle
app.get('/painel', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/painel.html'), (err) => {
        if (err) {
            console.error('Erro ao carregar o painel:', err);
            res.status(500).send('Erro ao carregar o painel de controle');
        }
    });
});

// Redirecionamentos para garantir compatibilidade
app.get('/dashboard.html', (req, res) => res.redirect('/'));
app.get('/index.html', (req, res) => res.redirect('/painel'));

// Rota de teste de conexão com o banco de dados
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await query('SELECT 1 as test');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erro ao testar conexão com o banco de dados:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicialização do servidor
function startServer() {
  // Conectar ao banco de dados
  testConnection()
    .then(() => {
      // Iniciar o servidor
      app.listen(PORT, () => {
        console.log('🚀  Servidor rodando!');
        console.log('📱  Acesse: http://localhost:3000');
      });
    })
    .catch((error) => {
      console.error('❌  Falha ao iniciar o servidor:', error);
      process.exit(1);
    });
}

// Iniciar o servidor
startServer();
