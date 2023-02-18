import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";

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

export type txResponse = {
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

export type BlockchainCalculatorProps = {
  setOpenBlockchainCalculator: Dispatch<SetStateAction<boolean>>;
  openBlockchainCalculator: boolean;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

// Klima `Polygon Bridged Carbon` subgraph types
export type klimaRetirements = {
  klimaRetires: klimaRetiresProps;
};

export type klimaRetiresProps = {
  id: string;
  transaction: retireTx;
  retiringAddress: string;
  beneficiaryAddress: string;
  beneficiary: string;
  retirementMessage: string;
  pool: string;
  amount: string;
  offset: offsetProps;
}[];

export type retireTx = {
  id: string;
};

export type offsetProps = {
  id: string;
  vintage: string;
  projectID: string;
  name: string;
  bridge: string;
};
