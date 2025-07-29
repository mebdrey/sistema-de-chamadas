import express from "express";
import { criarChamadoController, criarPrioridadeController } from "../controllers/ChamadoController";

const router = express.Router();

router.post('/criarChamado', criarChamadoController);
router.post ('/chamados', criarPrioridadeController);

export default router;