import { StatusProjeto } from './enums/status-projeto.enum';

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  principal: boolean;
  dataInicial: string | null;
  dataFinal: string | null;
  criadoEm: string;
  atualizadoEm: string;
  status: StatusProjeto;
  inativadoEm: string | null;
  concluidoEm: string | null;
  reativadoEm: string | null;
}

