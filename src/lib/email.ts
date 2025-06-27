// src/lib/email.ts

import { Resend } from 'resend';

// Inicializamos o Resend usando a chave de API que está nos segredos do ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um email de confirmação de cadastro para monitoramento de processo.
 * @param to - O email do destinatário.
 * @param numeroProcesso - O número do processo que foi cadastrado.
 */
export async function sendConfirmationEmail(to: string, numeroProcesso: string) {
  const fromEmail = 'Notificações JusCheck <noreply@grupobritto.com.br>'; // IMPORTANTE: Use um email de um domínio verificado no Resend

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Confirmação de monitoramento do processo ${numeroProcesso}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Olá!</h2>
          <p>Este é um email para confirmar que você se cadastrou com sucesso para receber notificações sobre novas movimentações no processo:</p>
          <p style="font-size: 1.2em; font-weight: bold; color: #333;">${numeroProcesso}</p>
          <p>Você será notificado em seu e-mail assim que uma nova atualização for detectada.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe JusCheck</strong></p>
        </div>
      `,
    });

    if (error) {
      // Se houver um erro do Resend, logamos no console do servidor
      console.error(`Erro ao enviar email de confirmação para ${to}:`, error);
      return; // Não paramos a execução, apenas logamos o erro.
    }

    console.log(`Email de confirmação enviado com sucesso para ${to}. ID: ${data?.id}`);
  } catch (error) {
    // Se ocorrer um erro inesperado na chamada
    console.error('Erro inesperado ao tentar enviar email:', error);
  }
}
