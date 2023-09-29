import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('collections')
  async getCollections (){
    return this.appService.collectionEvents;
  }

  @Get('tokens')
  async getTokens (){
    return this.appService.tokenMintedEvents;
  }
}
