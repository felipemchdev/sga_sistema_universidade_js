# 🎓 Sistema de Gestão Acadêmica

## 🔧 Pré-requisitos

1. **SQL Server**

   - Baixe e instale o [SQL Server](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads)

2. **Configuração do SQL Server**

   - Abra o **SQL Server Configuration Manager**
   - Habilite os protocolos:
     1. Clique em **Protocolos para MSSQLSERVER**
     2. Habilite **TCP/IP**
     3. Clique com o botão direito em **TCP/IP** → **Propriedades**
     4. Na aba **Endereços IP**, habilite todos os IP , até o final.
     5. Habilite **Pipes Nomeados**
   - Reinicie o serviço do SQL Server

3. **Banco de Dados**

   Execute os scripts na ordem, dentro do SQL Server Management Studio (LEMBRE DE SELECIONAR A TABELA ProjetoUniversidadeWeb):

   ```
   src/database/cria_usuario_bd.sql
   src/database/projeto_universidade_web.sql
   src/database/criar_tabela_estagio.sql
   ```

## 🚀 Instalação Rápida

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o banco de dados em ` /src/config/db.js (se não alterar nada o login é "admin_banco" e a senha " admin") `
3. Popule o banco de dados:
   ```bash
   npm run seed:alunos
   npm run seed:pagamentos
   npm run seed:estagios
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Acesse: http://localhost:3000

## 📌 Dados de Teste

- **Alunos**: Alunos distribuídos nas turmas
- **Matrículas**: Automáticas para cada aluno
- **Pagamentos**: Gerados automaticamente
- **Estágios**: Empresas e estágios de teste

## 🔗 Links Úteis

- [Download SQL Server](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads)
- [Download SSMS](https://docs.microsoft.com/pt-br/sql/ssms/download-sql-server-management-studio-ssms)
