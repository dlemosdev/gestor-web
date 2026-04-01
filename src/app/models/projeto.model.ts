import { StatusProjeto } from './enums/status-projeto.enum';

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  cor?: string;
  principal: boolean;
  criadoEm: string;
  atualizadoEm: string;
  status: StatusProjeto;
}

