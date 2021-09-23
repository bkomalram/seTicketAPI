CREATE DEFINER=`root`@`localhost` PROCEDURE `rActualizaGanadores3erPremioChance`(
    IN _SORTEO INT,	
    IN _CHANCE VARCHAR(400))
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    
    /*Buscar números*/    
    UPDATE tsorteotiquetes TIQ
	LEFT JOIN tSorteoTiquetesRegistros REG on TIQ.ID = REG.TIQUETE_ID
    SET TIQ.GANADOR = 'SI', REG.TERCER_PREMIO = 1, REG.GANADOR = 'SI'
	WHERE TIQ.TIPO = 'CHANCE'
    AND TIQ.SORTEO_ID = _SORTEO
	AND  REG.NUMERO = _CHANCE;
	END