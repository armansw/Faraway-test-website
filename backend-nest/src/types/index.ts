export type CollectionCreated = {
  txhash: string;
  blockNumber: number;
  address: string;
  name: string;
  symbol: string;
};

export type TokenMinted = {
  txhash: string;
  blockNumber: number;
  collection: string;
  recipient: string;
  tokenId: string;
  tokenURI: string;
};
