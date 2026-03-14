import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '44c35d928e7c28',
        pass: '50325c6ced0b93',
      },
    });
  }

  async sendEmail(dto: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { to, subject, body, html, cc, bcc } = dto;

    const mailOptions = {
      from: '"Email Sender App" <test@test.com>',
      to: to.join(', '),
      subject,
      text: body,
      html: html || `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      ...(cc?.length && { cc: cc.join(', ') }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(bcc?.length && { bcc: bcc.join(', ') }),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to send email: ${error.message}`);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { connected: true, message: 'SMTP connection verified' };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { connected: false, message: error.message };
    }
  }
}
