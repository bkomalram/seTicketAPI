CREATE DEFINER=`root`@`localhost` PROCEDURE `rLimpiaGanadores`(
    IN _SORTEO INT)
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    
    /*Buscar números*/    
	UPDATE tsorteotiquetes TIQ
	LEFT JOIN tSorteoTiquetesRegistros REG on TIQ.ID = REG.TIQUETE_ID        
    SET TIQ.GANADOR = 'NO', REG.GANADOR = 'NO', PRIMER_PREMIO = NULL, SEGUNDO_PREMIO = NULL, TERCER_PREMIO = NULL
	WHERE TIQ.SORTEO_ID = _SORTEO;
	END