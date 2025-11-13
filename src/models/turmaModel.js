const { query } = require("../config/db");

async function listarTurmasComCurso() {
  const result = await query(`
    SELECT t.*, c.descricao as curso_nome
    FROM turma t
    JOIN curso c ON t.id_curso = c.id_curso
    ORDER BY c.descricao, t.periodo
  `);
  return result.recordset;
}

async function criarTurma({
  id_curso,
  semestre,
  limite_alunos,
  periodo,
  turno,
  sala,
  data_inicio,
  data_termino,
}) {
  const result = await query(
    `INSERT INTO turma (id_curso, semestre, limite_alunos, periodo, turno, sala, data_inicio, data_termino)
     OUTPUT INSERTED.*
     VALUES (@id_curso, @semestre, @limite_alunos, @periodo, @turno, @sala, @data_inicio, @data_termino)`,
    [
      { name: 'id_curso', type: 'Int', value: id_curso },
      { name: 'semestre', type: 'Int', value: semestre },
      { name: 'limite_alunos', type: 'Int', value: limite_alunos },
      { name: 'periodo', type: 'VarChar', value: periodo },
      { name: 'turno', type: 'VarChar', value: turno },
      { name: 'sala', type: 'VarChar', value: sala },
      { name: 'data_inicio', type: 'Date', value: data_inicio },
      { name: 'data_termino', type: 'Date', value: data_termino }
    ]
  );
  return result.recordset[0];
}

async function atualizarTurma(
  id,
  {
    id_curso,
    semestre,
    limite_alunos,
    periodo,
    turno,
    sala,
    data_inicio,
    data_termino,
  }
) {
  const result = await query(
    `UPDATE turma
     SET id_curso = @id_curso, semestre = @semestre, limite_alunos = @limite_alunos,
         periodo = @periodo, turno = @turno, sala = @sala,
         data_inicio = @data_inicio, data_termino = @data_termino
     OUTPUT INSERTED.*
     WHERE id_turma = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'id_curso', type: 'Int', value: id_curso },
      { name: 'semestre', type: 'Int', value: semestre },
      { name: 'limite_alunos', type: 'Int', value: limite_alunos },
      { name: 'periodo', type: 'VarChar', value: periodo },
      { name: 'turno', type: 'VarChar', value: turno },
      { name: 'sala', type: 'VarChar', value: sala },
      { name: 'data_inicio', type: 'Date', value: data_inicio },
      { name: 'data_termino', type: 'Date', value: data_termino }
    ]
  );
  return result.recordset[0];
}

async function removerTurma(id) {
  const result = await query(
    "DELETE FROM turma WHERE id_turma = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarTurmasComCurso,
  criarTurma,
  atualizarTurma,
  removerTurma,
};
