const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const BOOKING_PROCESSING_STAGES = [
  'Iniciando pago...',
  'Validando información...',
  'Procesando pago seguro...',
  'Confirmando reserva...',
];

export const MARKETPLACE_PROCESSING_STAGES = [
  'Iniciando pago...',
  'Validando información...',
  'Procesando pago seguro...',
  'Confirmando compra...',
];

export async function runCheckoutProcessing(
  onConfirm: () => Promise<{ error?: string | null } | void>,
  setStage: (stage: number) => void,
  stages: string[] = BOOKING_PROCESSING_STAGES
): Promise<{ error: string | null }> {
  setStage(0);
  await delay(500);
  setStage(1);
  await delay(700);
  setStage(2);
  await delay(800);
  setStage(3);
  await delay(800);

  try {
    const result = await onConfirm();
    return { error: result?.error ?? null };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : 'No se pudo confirmar el pago. Intenta de nuevo.',
    };
  }
}
