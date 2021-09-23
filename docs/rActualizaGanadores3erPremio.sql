CREATE DEFINER=`root`@`localhost` PROCEDURE `rActualizaGanadores3erPremio`(
    IN _SORTEO INT,
    IN _PREMIO INT ,    
    IN _BILLETE VARCHAR(400),
    IN _INICIO INT,
    IN _LONGITUD INT)
BEGIN	
    SET SQL_SAFE_UPDATES = 0;    		
    
    /*Buscar números*/    
    UPDATE tsorteotiquetes TIQ
	LEFT JOIN tSorteoTiquetesRegistros REG on TIQ.ID = REG.TIQUETE_ID    
    SET TIQ.GANADOR = 'SI', REG.TERCER_PREMIO = _PREMIO, REG.GANADOR = 'SI'
	WHERE TIQ.TIPO = 'BILLETE'
    AND TIQ.SORTEO_ID = _SORTEO
	AND  SUBSTR(REG.NUMERO,_INICIO,_LONGITUD) = _BILLETE;    
    
	END