CREATE LOGIN admin_banco 
WITH PASSWORD = 'admin',
     CHECK_POLICY = OFF;
GO
ALTER LOGIN admin_banco ENABLE;
GO
ALTER SERVER ROLE sysadmin ADD MEMBER admin_banco;
GO