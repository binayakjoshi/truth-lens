import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

import { otpEmailTemplate } from '../templates/otp-email-template';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  private readonly logger = new Logger(EmailService.name);
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendOtpEmail(
    toEmail: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${process.env.GMAIL_USER}`,

        to: toEmail,
        subject: `${otp} is your TruthLens verification code`,
        html: otpEmailTemplate(otp, firstName),
      });

      this.logger.log(`OTP email sent to ${toEmail}`);
    } catch (err) {
      this.logger.error(
        `Unexpected error sending OTP to ${toEmail}`,
        err instanceof Error ? err.stack : String(err),
      );

      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
