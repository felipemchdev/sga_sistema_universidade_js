const { query } = require("../config/db");

async function listarAlunos() {
  const result = await query("SELECT * FROM aluno ORDER BY nome");
  return result.recordset;
}

async function criarAluno({ nome, cidade, estado, data_nascimento, status }) {
  const result = await query(
    `INSERT INTO aluno (nome, cidade, estado, data_nascimento, status)
     OUTPUT INSERTED.*
     VALUES (@nome, @cidade, @estado, @data_nascimento, @status)`,
    [
      { name: 'nome', type: 'VarChar', value: nome },
      { name: 'cidade', type: 'VarChar', value: cidade },
      { name: 'estado', type: 'VarChar', value: estado },
      { name: 'data_nascimento', type: 'Date', value: data_nascimento },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function atualizarAluno(id, { nome, cidade, estado, data_nascimento, status }) {
  const result = await query(
    `UPDATE aluno
     SET nome = @nome, cidade = @cidade, estado = @estado, 
         data_nascimento = @data_nascimento, status = @status
     OUTPUT INSERTED.*
     WHERE id_aluno = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'nome', type: 'VarChar', value: nome },
      { name: 'cidade', type: 'VarChar', value: cidade },
      { name: 'estado', type: 'VarChar', value: estado },
      { name: 'data_nascimento', type: 'Date', value: data_nascimento },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function removerAluno(id) {
  const result = await query(
    "DELETE FROM aluno WHERE id_aluno = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  removerAluno,
};
