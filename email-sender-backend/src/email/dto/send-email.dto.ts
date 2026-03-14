import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { each: true })
  @IsArray()
  to: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsEmail({}, { each: true })
  @IsArray()
  @IsOptional()
  cc?: string[];

  @IsEmail({}, { each: true })
  @IsArray()
  @IsOptional()
  bcc?: string[];
}
