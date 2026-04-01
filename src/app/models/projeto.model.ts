import { StatusProjeto } from './enums/status-projeto.enum';

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  cor?: string;
  criadoEm: string;
  atualizadoEm: string;
  status: StatusProjeto;
}

