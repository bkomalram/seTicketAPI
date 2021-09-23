CREATE DATABASE IF NOT EXISTS LoteriaDB;

use LoteriaDB;

CREATE TABLE tConfiguracion (
ID INT NOT NULL auto_increment,
PROPIEDAD VARCHAR(400) NOT NULL,
VALOR VARCHAR(400) NOT NULL,
primary key(ID));

DESCRIBE tConfiguracion;

INSERT INTO tConfiguracion VALUES 
(1,'NOMBRE','USUARIO MYSQL LOTERIA'),
(2,'PRECIO_CHANCE','0.25'),
(3,'PRECIO_BILLETE','1.00'),
(4,'SORTEO_VENTA','DUMMY'),
(5,'IMPRESION_TAMANO','80MM*200MM');

SELECT * FROM tConfiguration

-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'