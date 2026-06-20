CREATE PROCEDURE sp_actualiza_ganadores(
    IN p_game_id INT,
    IN p_numero1er CHAR(4),
    IN p_numero2do CHAR(4),
    IN p_numero3er CHAR(4),
    OUT p_ok TINYINT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ok = 0;
        SET p_message = CONCAT('Error de SQL durante el proceso');
    END;

    START TRANSACTION;

    -- Primer Premio
    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'ULTIMO_NUMERO',
        gTR.valorganador1er = gTR.cantidad * 0
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO, 4, 1) = SUBSTR(p_numero1er, 4, 1);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'DOS_ULTIMOS',
        gTR.valorganador1er = gTR.cantidad * 3
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO, 3, 2) = SUBSTR(p_numero1er, 3, 2);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'DOS_PRIMEROS',
        gTR.valorganador1er = gTR.cantidad * 3
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO, 1, 2) = SUBSTR(p_numero1er, 1, 2);

    /*UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'DOS_PRIMEROS_ULTIMO_NUMERO',
        gTR.valorganador1er = gTR.cantidad * 4
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO,1,2) = SUBSTR(p_numero1er,1,2)
      AND SUBSTR(gTR.NUMERO,4,1) = SUBSTR(p_numero1er,4,1);*/

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'TRES_ULTIMOS',
        gTR.valorganador1er = gTR.cantidad * 50
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO,2,3) = SUBSTR(p_numero1er,2,3);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'TRES_PRIMEROS',
        gTR.valorganador1er = gTR.cantidad * 50
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO,1,3) = SUBSTR(p_numero1er,1,3);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'CUATRO_NUMEROS',
        gTR.valorganador1er = gTR.cantidad * 2500
    WHERE gTR.tipo = 'BILLETE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND SUBSTR(gTR.NUMERO,1,4) = p_numero1er;

    -- Segundo Premio sólo si no empieza "XX"
    IF LEFT(p_numero2do,2) <> 'XX' THEN
        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.segundo_premio = 'DOS_ULTIMOS',
            gTR.valorganador2do = gTR.cantidad * 2
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,3,2) = SUBSTR(p_numero2do,3,2);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.segundo_premio = 'TRES_ULTIMOS',
            gTR.valorganador2do = gTR.cantidad * 20
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,2,3) = SUBSTR(p_numero2do,2,3);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.segundo_premio = 'TRES_PRIMEROS',
            gTR.valorganador2do = gTR.cantidad * 20
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,1,3) = SUBSTR(p_numero2do,1,3);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.segundo_premio = 'CUATRO_NUMEROS',
            gTR.valorganador2do = gTR.cantidad * 700
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,1,4) = p_numero2do;
    END IF;

    -- Tercer Premio sólo si no empieza "XX"
    IF LEFT(p_numero3er,2) <> 'XX' THEN
        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.tercer_premio = 'DOS_ULTIMOS',
            gTR.valorganador3ro = gTR.cantidad * 1
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,3,2) = SUBSTR(p_numero3er,3,2);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.tercer_premio = 'TRES_ULTIMOS',
            gTR.valorganador3ro = gTR.cantidad * 10
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,2,3) = SUBSTR(p_numero3er,2,3);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.tercer_premio = 'TRES_PRIMEROS',
            gTR.valorganador3ro = gTR.cantidad * 10
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,1,3) = SUBSTR(p_numero3er,1,3);

        UPDATE GameTickets gT
        JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
        SET gT.ganador = 'SI',
            gT.valorganador = 0,
            gTR.ganador = 'SI',
            gTR.tercer_premio = 'CUATRO_NUMEROS',
            gTR.valorganador3ro = gTR.cantidad * 300
        WHERE gTR.tipo = 'BILLETE'
          AND gT.esValido = 'SI'
          AND gT.game_Id = p_game_id
          AND SUBSTR(gTR.NUMERO,1,4) = p_numero3er;
    END IF;

    -- Chances
    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.primer_premio = 'CHANCE_GANADOR',
        gTR.valorganador1er = gTR.cantidad * 14
    WHERE gTR.tipo = 'CHANCE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND gTR.NUMERO = SUBSTR(p_numero1er,3,2);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.segundo_premio = 'CHANCE_GANADOR',
        gTR.valorganador2do = gTR.cantidad * 3
    WHERE gTR.tipo = 'CHANCE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND gTR.NUMERO = SUBSTR(p_numero2do,3,2);

    UPDATE GameTickets gT
    JOIN GameTicketRecords gTR ON gT.Id = gTR.gameTicketId
    SET gT.ganador = 'SI',
        gT.valorganador = 0,
        gTR.ganador = 'SI',
        gTR.tercer_premio = 'CHANCE_GANADOR',
        gTR.valorganador3ro = gTR.cantidad * 2
    WHERE gTR.tipo = 'CHANCE'
      AND gT.esValido = 'SI'
      AND gT.game_Id = p_game_id
      AND gTR.NUMERO = SUBSTR(p_numero3er,3,2);

    COMMIT;
    SET p_ok = 1;
    SET p_message = 'OK';
END$$

DELIMITER ;