-- ==============================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - PROJETO UNIVERSIDADE WEB
-- ==============================================================

-- Verificar se o banco de dados já existe
IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'ProjetoUniversidadeWeb')
BEGIN
    -- Criar o banco de dados apenas se não existir
    CREATE DATABASE ProjetoUniversidadeWeb;
    PRINT 'Banco de dados ProjetoUniversidadeWeb criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'O banco de dados ProjetoUniversidadeWeb já existe.';
END
GO

-- Usar o banco de dados criado
USE ProjetoUniversidadeWeb;
GO

-- =====================================================
-- CRIAÇÃO DAS TABELAS
-- =====================================================

-- Tabela DEPARTAMENTO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'departamento')
BEGIN
    CREATE TABLE departamento (
        id_departamento INT IDENTITY(1,1) PRIMARY KEY,
        descricao VARCHAR(100) NOT NULL UNIQUE
    );
    PRINT 'Tabela departamento criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela departamento já existe.';
END
GO

-- Tabela CURSO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'curso')
BEGIN
    CREATE TABLE curso (
        id_curso INT IDENTITY(1,1) PRIMARY KEY,
        id_departamento INT NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        sigla VARCHAR(4) NOT NULL,
        valor_mensalidade DECIMAL(10,2) NOT NULL CHECK (valor_mensalidade > 0),
        duracao_semestres INT NOT NULL DEFAULT 8 CHECK (duracao_semestres > 0),
        FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento)
    );
    PRINT 'Tabela curso criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela curso já existe.';
END
GO

-- Tabela TURMA
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'turma')
BEGIN
    CREATE TABLE turma (
        id_turma INT IDENTITY(1,1) PRIMARY KEY,
        id_curso INT NOT NULL,
        semestre INT NOT NULL,  -- 1, 2, etc.
        limite_alunos INT NOT NULL DEFAULT 50 CHECK (limite_alunos > 0 AND limite_alunos <= 100),
        periodo VARCHAR(7) NOT NULL, -- 2024.1, 2024.2, etc.
        turno VARCHAR(20) NOT NULL CHECK (turno IN ('matutino', 'vespertino', 'noturno')),
        sala VARCHAR(20),
        data_inicio DATE,
        data_termino DATE,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
        CONSTRAINT CK_DataTurma CHECK (data_inicio < data_termino)
    );
    PRINT 'Tabela turma criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela turma já existe.';
END
GO

-- Tabela ALUNO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'aluno')
BEGIN
    CREATE TABLE aluno (
        id_aluno INT IDENTITY(1,1) PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        estado VARCHAR(2) DEFAULT 'SP' CHECK (estado IN ('SP', 'RJ', 'MG', 'ES', 'PR', 'MS', 'BA', 'RS', 'SC', 'GO', 'MT', 'MS')),
        data_nascimento DATE,
        data_cadastro DATETIME DEFAULT GETDATE(),
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'trancado'))
    );
    PRINT 'Tabela aluno criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela aluno já existe.';
END
GO

-- Tabela MATRICULA
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'matricula')
BEGIN
    CREATE TABLE matricula (
        id_matricula INT IDENTITY(1,1) PRIMARY KEY,
        id_aluno INT NOT NULL,
        id_turma INT NOT NULL,
        data_matricula DATETIME DEFAULT GETDATE(),
        status_matricula VARCHAR(20) DEFAULT 'ativa' CHECK (status_matricula IN ('ativa', 'trancada', 'cancelada')),
        observacoes TEXT,
        FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
        FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
        -- Constraint para evitar matrícula duplicada
        CONSTRAINT UK_AlunoTurma UNIQUE (id_aluno, id_turma)
    );
    PRINT 'Tabela matricula criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela matricula já existe.';
END
GO

-- Tabela PAGAMENTO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'pagamento')
BEGIN
    CREATE TABLE pagamento (
        id_pagamento INT IDENTITY(1,1) PRIMARY KEY,
        id_matricula INT NOT NULL,
        valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
        data_pagamento DATETIME DEFAULT GETDATE(),
        tipo_pagamento VARCHAR(50) DEFAULT 'mensalidade' CHECK (tipo_pagamento IN ('mensalidade', 'taxa', 'multa', 'outros')),
        periodo_referencia VARCHAR(10) NOT NULL, -- 2024.1, 2024.2, etc.
        status VARCHAR(20) DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'atrasado')),
        FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula)
    );
    PRINT 'Tabela pagamento criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela pagamento já existe.';
END
GO

-- =====================================================
-- CRIAÇÃO DE ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para a tabela ALUNO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Aluno_Status')
BEGIN
    CREATE INDEX IX_Aluno_Status ON aluno(status);
    PRINT 'Índice IX_Aluno_Status criado com sucesso!';
END

-- Índices para a tabela TURMA
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Turma_Periodo')
    CREATE INDEX IX_Turma_Periodo ON turma(periodo);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Turma_Curso')
    CREATE INDEX IX_Turma_Curso ON turma(id_curso);

-- Índices para a tabela MATRICULA
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Matricula_Aluno')
    CREATE INDEX IX_Matricula_Aluno ON matricula(id_aluno);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Matricula_Turma')
    CREATE INDEX IX_Matricula_Turma ON matricula(id_turma);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Matricula_Status')
    CREATE INDEX IX_Matricula_Status ON matricula(status_matricula);

-- Índices para a tabela PAGAMENTO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pagamento_Matricula')
    CREATE INDEX IX_Pagamento_Matricula ON pagamento(id_matricula);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pagamento_Status')
    CREATE INDEX IX_Pagamento_Status ON pagamento(status);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pagamento_Periodo')
    CREATE INDEX IX_Pagamento_Periodo ON pagamento(periodo_referencia);

-- =====================================================
-- INSERÇÃO DOS DADOS INICIAIS (APENAS SE NÃO EXISTIREM)
-- =====================================================

-- Inserir departamentos
IF NOT EXISTS (SELECT 1 FROM departamento)
BEGIN
    INSERT INTO departamento (descricao) VALUES 
    ('Exatas'),
    ('Humanas'),
    ('Biologicas');
    PRINT 'Dados iniciais inseridos na tabela departamento.';
END

-- Inserir cursos
IF NOT EXISTS (SELECT 1 FROM curso)
BEGIN
    INSERT INTO curso (id_departamento, descricao, sigla, valor_mensalidade, duracao_semestres) VALUES 
    -- Exatas
    (1, 'Sistemas de Informação', 'SI', 1800.00, 8),
    (1, 'Engenharia da Computação', 'EC', 2200.00, 10),
    (1, 'Engenharia Elétrica', 'EE', 2100.00, 10),
    -- Humanas
    (2, 'Administração', 'ADM',1600.00, 8),
    (2, 'Economia','ECN', 1700.00, 8),
    (2, 'Direito', 'DIR', 1900.00, 10),
    -- Biologicas
    (3, 'Medicina', 'MED', 10500.00, 12),
    (3, 'Odontologia','ODO',5800.00, 10),
    (3, 'Nutrição', 'NUT',3650.00, 8);
    PRINT 'Dados iniciais inseridos na tabela curso.';
END

-- Inserir turmas
IF NOT EXISTS (SELECT 1 FROM turma)
BEGIN
    INSERT INTO turma (id_curso, semestre, limite_alunos, periodo, turno, sala, data_inicio, data_termino) VALUES 
    -- Sistemas de Informação
    (1, 1, 40, '2024.1', 'Diurno', 'Lab 101', '2024-02-01', '2024-07-15'),
    (1, 1, 35, '2024.1', 'Integral', 'Lab 102', '2024-02-01', '2024-07-15'),
    (1, 2, 45, '2024.2', 'Noturno', 'Lab 101', '2024-08-01', '2024-12-15'),
    -- Engenharia da Computação
    (2, 1, 30, '2024.1', 'Diurno', 'Lab 201', '2024-02-01', '2024-07-15'),
    (2, 1, 25, '2024.1', 'Noturno', 'Lab 202', '2024-02-01', '2024-07-15'),
    -- Administração
    (4, 1, 50, '2024.1', 'Diurno', 'Sala 301', '2024-02-01', '2024-07-15'),
    (4, 2, 55, '2024.2', 'Noturno', 'Sala 301', '2024-08-01', '2024-12-15'),
    -- Medicina
    (7, 1, 60, '2024.1', 'Integral', 'Anfiteatro A', '2024-02-01', '2024-07-15');
    PRINT 'Dados iniciais inseridos na tabela turma.';
END

-- Inserir alunos
IF NOT EXISTS (SELECT 1 FROM aluno)
BEGIN
    INSERT INTO aluno (nome, cidade, estado, data_nascimento, status)
    VALUES
    ('Ana Clara Souza', 'São Paulo', 'SP', '2001-04-15', 'ativo'),
    ('Bruno Lima Ferreira', 'Campinas', 'SP', '2000-11-02', 'ativo'),
    ('Carlos Eduardo Ramos', 'Belo Horizonte', 'MG', '1999-07-21', 'inativo'),
    ('Daniela Rocha', 'Vitória', 'ES', '2002-03-12', 'ativo'),
    ('Eduarda Martins', 'Rio de Janeiro', 'RJ', '2003-08-25', 'trancado');
    PRINT 'Dados iniciais inseridos na tabela aluno.';
END

-- Inserir matrículas
IF NOT EXISTS (SELECT 1 FROM matricula)
BEGIN
    INSERT INTO matricula (id_aluno, id_turma, status_matricula, observacoes)
    VALUES
    (1, 1, 'ativa', 'Matriculado no início de 2024.1'),
    (2, 2, 'ativa', 'Transf. de outra instituição'),
    (3, 3, 'trancada', 'Trancado por motivos de saúde'),
    (4, 4, 'ativa', NULL),
    (5, 5, 'ativa', 'Retorno após trancamento');
    PRINT 'Dados iniciais inseridos na tabela matricula.';
END

-- Inserir pagamentos
IF NOT EXISTS (SELECT 1 FROM pagamento)
BEGIN
    INSERT INTO pagamento (id_matricula, valor, tipo_pagamento, periodo_referencia, status)
    VALUES
    (1, 1800.00, 'mensalidade', '2024.1', 'pago'),
    (1, 1800.00, 'mensalidade', '2024.2', 'pendente'),
    (2, 1800.00, 'mensalidade', '2024.2', 'pago'),
    (3, 1800.00, 'mensalidade', '2024.1', 'atrasado'),
    (4, 2200.00, 'mensalidade', '2024.1', 'pendente'),
    (5, 2200.00, 'mensalidade', '2024.2', 'atrasado'),
    (5, 2200.00, 'taxa', '2024.1', 'pago');
    PRINT 'Dados iniciais inseridos na tabela pagamento.';
END

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

PRINT '=====================================================';
PRINT 'VERIFICAÇÃO DAS TABELAS E DADOS:';
PRINT '=====================================================';

-- Verificar contagem de registros
DECLARE @dept_count INT, @curso_count INT, @turma_count INT, @aluno_count INT, @matricula_count INT, @pagamento_count INT;

SELECT @dept_count = COUNT(*) FROM departamento;
SELECT @curso_count = COUNT(*) FROM curso;
SELECT @turma_count = COUNT(*) FROM turma;
SELECT @aluno_count = COUNT(*) FROM aluno;
SELECT @matricula_count = COUNT(*) FROM matricula;
SELECT @pagamento_count = COUNT(*) FROM pagamento;

PRINT 'Total de departamentos: ' + CAST(@dept_count AS VARCHAR(10));
PRINT 'Total de cursos: ' + CAST(@curso_count AS VARCHAR(10));
PRINT 'Total de turmas: ' + CAST(@turma_count AS VARCHAR(10));
PRINT 'Total de alunos: ' + CAST(@aluno_count AS VARCHAR(10));
PRINT 'Total de matrículas: ' + CAST(@matricula_count AS VARCHAR(10));
PRINT 'Total de pagamentos: ' + CAST(@pagamento_count AS VARCHAR(10));

PRINT '=====================================================';
PRINT 'BANCO DE DADOS PROJETO UNIVERSIDADE CRIADO E CONFIGURADO COM SUCESSO!';
PRINT 'Próximo passo: Executar script de geração de dados fake com Faker.js';
PRINT '====================================================='; 