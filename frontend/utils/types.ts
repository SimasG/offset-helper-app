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
