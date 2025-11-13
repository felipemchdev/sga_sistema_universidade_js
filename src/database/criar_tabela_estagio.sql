-- ============================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO DE ESTÁGIOS
-- ============================================

-- Tabela EMPRESA_ESTAGIO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'empresa_estagio')
BEGIN
    CREATE TABLE empresa_estagio (
        id_empresa INT IDENTITY(1,1) PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        cnpj VARCHAR(18) UNIQUE,
        endereco VARCHAR(200),
        telefone VARCHAR(20),
        email VARCHAR(100),
        responsavel VARCHAR(100),
        data_cadastro DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabela empresa_estagio criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela empresa_estagio já existe.';
END
GO

-- Tabela ESTAGIO
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'estagio')
BEGIN
    CREATE TABLE estagio (
        id_estagio INT IDENTITY(1,1) PRIMARY KEY,
        id_aluno INT NOT NULL,
        id_empresa INT NOT NULL,
        data_inicio DATE NOT NULL,
        data_termino DATE,
        carga_horaria_total INT NOT NULL DEFAULT 0,
        carga_horaria_cumprida INT DEFAULT 0,
        status VARCHAR(20) NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
        valor_bolsa DECIMAL(10,2),
        observacoes TEXT,
        data_cadastro DATETIME DEFAULT GETDATE(),
        data_atualizacao DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno) ON DELETE CASCADE,
        FOREIGN KEY (id_empresa) REFERENCES empresa_estagio(id_empresa)
    );
    
    -- Índices para melhorar performance
    CREATE INDEX idx_estagio_aluno ON estagio(id_aluno);
    CREATE INDEX idx_estagio_empresa ON estagio(id_empresa);
    CREATE INDEX idx_estagio_status ON estagio(status);
    
    PRINT 'Tabela estagio criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'A tabela estagio já existe.';
END
GO