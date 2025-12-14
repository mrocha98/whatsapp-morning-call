import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'phone number to send message',
    example: '5511940028922',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'text to send',
    example: 'Lorem ipsum',
    default: 'Lorem ipsum',
  })
  text: string;
}
