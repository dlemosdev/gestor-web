import { Prioridade } from './enums/prioridade.enum';
import { StatusAtividade } from './enums/status-atividade.enum';
import { ChecklistItem } from './checklist-item.model';
import { Comentario } from './comentario.model';

export interface Atividade {
  id: string;
  projetoId: string;
  raiaId: string;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  status: StatusAtividade;
  responsavel: string;
  prazo: string;
  etiquetas: string[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

