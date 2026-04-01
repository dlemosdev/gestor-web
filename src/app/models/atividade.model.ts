import { ChecklistItem } from './checklist-item.model';
import { Comentario } from './comentario.model';
import { StatusAtividade } from './enums/status-atividade.enum';
import { Prioridade } from './enums/prioridade.enum';
import { EtiquetaAtividade } from './etiqueta-atividade.model';

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
  etiquetas: EtiquetaAtividade[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}
