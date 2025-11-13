const { query } = require("../config/db");

async function listarMatriculasDetalhadas() {
  const result = await query(`
    SELECT m.*, 
           a.nome as aluno_nome, 
           c.descricao as curso_nome,
           t.periodo as turma_periodo
    FROM matricula m
    JOIN aluno a ON m.id_aluno = a.id_aluno
    JOIN turma t ON m.id_turma = t.id_turma
    JOIN curso c ON t.id_curso = c.id_curso
    ORDER BY m.data_matricula DESC
  `);
  return result.recordset;
}

async function criarMatricula({ id_aluno, id_turma, data_matricula, status }) {
  const result = await query(
    `INSERT INTO matricula (id_aluno, id_turma, data_matricula, status)
     OUTPUT INSERTED.*
     VALUES (@id_aluno, @id_turma, @data_matricula, @status)`,
    [
      { name: 'id_aluno', type: 'Int', value: id_aluno },
      { name: 'id_turma', type: 'Int', value: id_turma },
      { name: 'data_matricula', type: 'Date', value: data_matricula },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function atualizarMatricula(id, { id_aluno, id_turma, data_matricula, status }) {
  const result = await query(
    `UPDATE matricula
     SET id_aluno = @id_aluno, id_turma = @id_turma, 
         data_matricula = @data_matricula, status = @status
     OUTPUT INSERTED.*
     WHERE id_matricula = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'id_aluno', type: 'Int', value: id_aluno },
      { name: 'id_turma', type: 'Int', value: id_turma },
      { name: 'data_matricula', type: 'Date', value: data_matricula },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function removerMatricula(id) {
  const result = await query(
    "DELETE FROM matricula WHERE id_matricula = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarMatriculasDetalhadas,
  criarMatricula,
  atualizarMatricula,
  removerMatricula,
};
