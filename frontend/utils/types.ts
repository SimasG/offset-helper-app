import { BigNumber } from "ethers";

export type offsetMethodsProps = {
  label: string;
  value: string;
}[];

export type carbonTokensProps = {
  label: string;
  value: string;
  image: string;
};

export type transactionProps = {
  hash: string;
  type: number;
  accessList: string[];
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  confirmations: number;
  from: string;
  gasPrice: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
  gasLimit: BigNumber;
  to: string;
  value: BigNumber;
  nonce: number;
  data: string;
  r: string;
  s: string;
  v: string;
  creates: any;
  chainId: number;
  wait: () => {};
};

export type Item = {
  timestamp: string;
  value: string;
};

export type gasUsedItem = {
  "Date(UTC)": string;
  UnixTimeStamp: string;
  Value: string;
};

export type hashrateItem = {
  "Date(UTC)": string;
  UnixTimeStamp: string;
  Value: string;
};

export type emissionsFactorItem = {
  "Date(UTC)": string;
  UnixTimeStamp: string;
  emissionsFactor: string;
};

export type tx = {
  status: string;
  message: string;
  result: txResult[];
};

export type txResult = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
};
