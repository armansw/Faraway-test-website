import { Get, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as Utils from './app.util';
import { CollectionCreated, TokenMinted } from './types';

require('dotenv').config();

@Injectable()
export class AppService {

  lastBlockNumberForCollection = 9768820;
  lastBlockNumberForTokenMint = 9768820;
  
  collectionEvents = new Array<CollectionCreated>(0);

  tokenMintedEvents = new Array<TokenMinted>(0);

  getHello(): string {
    return 'Hello World!';
  }

  insertCollectionEvent(event: CollectionCreated): undefined | CollectionCreated[]{

    const prevRecords = this.collectionEvents.filter(one=>one.txhash == event.txhash);

    if (prevRecords && prevRecords.length > 0) {
      return;
    }
    this.collectionEvents.push(event);
    return this.collectionEvents;
  }

  insertMintEvent(event: TokenMinted): undefined | TokenMinted[]{

    const prevRecords = this.tokenMintedEvents.filter(one=>one.txhash == event.txhash);

    if (prevRecords && prevRecords.length > 0) {
      return;
    }
    this.tokenMintedEvents.push(event);
    return this.tokenMintedEvents;
  }


  @Interval(5000)
  async cronJobs(){

    const logsCollection = await Utils.getCollectionCreatedLogs(this.lastBlockNumberForCollection);

    const logsTokenMinted = await Utils.getTokenMintedLogs(this.lastBlockNumberForTokenMint);
    
    if (logsCollection.length > 0) {
      let _lastBN = this.lastBlockNumberForCollection;
      for(let one of logsCollection) {
        _lastBN =  one.blockNumber > _lastBN ? one.blockNumber : _lastBN;
        this.insertCollectionEvent(one);
      }
      this.lastBlockNumberForCollection = _lastBN;
    }
    if (logsTokenMinted.length > 0) {
      let _lastBN = this.lastBlockNumberForTokenMint;
      for(let one of logsTokenMinted) {
        _lastBN =  one.blockNumber > _lastBN ? one.blockNumber : _lastBN;
        this.insertMintEvent(one);
      }
      this.lastBlockNumberForTokenMint = _lastBN;
    }

    
  }


}
