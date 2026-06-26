// Resposta da "Samba IA" para frequência: mock determinístico, sem chamada a
// nenhuma API de IA (não há chave configurada). Mesma decisão tomada para a
// IA do Samba Interactions — pode ser troca por uma chamada real depois.
import { calcFreqBimestre, FREQ_MINIMA, FREQ_EXCELENCIA } from '@/lib/utils';

export type AttendanceStatus = 'reprovado' | 'risco' | 'ok' | 'excelente';

export interface AttendanceMessage {
  frequencia: number;
  status: AttendanceStatus;
  margemMinima: number;
  margemExcelencia: number;
  mensagem: string;
}

export function getAttendanceMessage(diasFaltados: number, diasPrevistos: number): AttendanceMessage {
  const frequencia = calcFreqBimestre(diasFaltados, diasPrevistos);
  const limiteMinimo = Math.floor(diasPrevistos * (1 - FREQ_MINIMA / 100));
  const limiteExcelencia = Math.floor(diasPrevistos * (1 - FREQ_EXCELENCIA / 100));
  const margemMinima = limiteMinimo - diasFaltados;
  const margemExcelencia = limiteExcelencia - diasFaltados;

  if (frequencia < FREQ_MINIMA) {
    return {
      frequencia,
      status: 'reprovado',
      margemMinima,
      margemExcelencia,
      mensagem: `⚠️ Você está com ${frequencia}% de presença neste bimestre, abaixo do mínimo de ${FREQ_MINIMA}% — hoje você reprovaria por falta. Não pode faltar mais nenhum dia até o fim do bimestre.`,
    };
  }

  if (margemMinima <= 0) {
    return {
      frequencia,
      status: 'risco',
      margemMinima,
      margemExcelencia,
      mensagem: `Você está com ${frequencia}% de presença. Está no limite do mínimo de ${FREQ_MINIMA}% — não pode faltar mais nenhum dia neste bimestre ou você reprova por frequência.`,
    };
  }

  if (frequencia < FREQ_EXCELENCIA) {
    const dias = margemMinima === 1 ? '1 dia' : `${margemMinima} dias`;
    return {
      frequencia,
      status: 'risco',
      margemMinima,
      margemExcelencia,
      mensagem: `Você está com ${frequencia}% de presença. Para garantir o mínimo de ${FREQ_MINIMA}%, você ainda pode faltar até ${dias} neste bimestre — depois disso, venha todos os dias.`,
    };
  }

  if (margemExcelencia <= 0) {
    return {
      frequencia,
      status: 'ok',
      margemMinima,
      margemExcelencia,
      mensagem: `Você está com ${frequencia}% de presença, dentro do mínimo exigido (${FREQ_MINIMA}%), mas já perdeu a faixa de excelência (${FREQ_EXCELENCIA}%) neste bimestre.`,
    };
  }

  const dias = margemExcelencia === 1 ? '1 dia' : `${margemExcelencia} dias`;
  return {
    frequencia,
    status: 'excelente',
    margemMinima,
    margemExcelencia,
    mensagem: `🎉 Você está com ${frequencia}% de presença — dentro da excelência (${FREQ_EXCELENCIA}%)! Você ainda pode faltar até ${dias} neste bimestre sem perder essa faixa. Continue assim!`,
  };
}
