import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// 🔑 Reemplazá con tu API Key de Resend (ponela en .env.local)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, nombreCliente, nombreNegocio, fecha, token } = await req.json();

    // 🔗 El link que el cliente verá en su mail
    // Cambiá el localhost por tu dominio real cuando lo subas
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const linkCancelacion = `${baseUrl}/cancelar-turno?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'TurnixApp <onboarding@resend.dev>', // ⚠️ Cambiá esto cuando verifiques tu dominio
      to: [email],
      subject: `Confirmación de turno - ${nombreNegocio}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00FF9F;">¡Reserva Exitosa!</h2>
          <p>Hola <strong>${nombreCliente}</strong>,</p>
          <p>Confirmamos tu turno en <strong>${nombreNegocio}</strong>.</p>
          <p>📅 <strong>Fecha y Hora:</strong> ${fecha}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">¿No podés asistir?</p>
          <a href="${linkCancelacion}" style="color: #ff4444; font-weight: bold;">Cancelar este turno</a>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Error enviando el mail' }, { status: 500 });
  }
}