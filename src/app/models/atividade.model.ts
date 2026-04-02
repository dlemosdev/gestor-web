import { ChecklistItem } from './checklist-item.model';
import { Comentario } from './comentario.model';
import { Prioridade } from './enums/prioridade.enum';
import { StatusAtividade } from './enums/status-atividade.enum';
import { TipoAtividade } from './enums/tipo-atividade.enum';
import { EtiquetaAtividade } from './etiqueta-atividade.model';

export interface Atividade {
  id: string;
  projetoId: string;
  raiaId: string;
  codigoReferencia: string;
  tipo: TipoAtividade;
  atividadePaiId: string | null;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  status: StatusAtividade;
  responsavel: string;
  prazo: string;
  dataConclusao: string | null;
  etiquetas: EtiquetaAtividade[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}
