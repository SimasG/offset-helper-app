export const OHMumbaiAddress = "0xDC54484c13d9956199cc14A49d07D58be4794D2A";
export const OHPolygonAddress = "0x9e0ACA6ABd7498d6EFcDcb5E3e736DbB6487458c";

type IfcAddresses = {
  myAddress: string;
  bct: string;
  nct: string;
  usdc: string;
  weth: string;
  wmatic: string;
};

const addresses: Record<string, IfcAddresses> = {
  // @ts-ignore
  myAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  // @ts-ignore
  bct: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
  // @ts-ignore
  nct: "0xD838290e877E0188a4A44700463419ED96c16107",
  // @ts-ignore
  usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  // @ts-ignore
  weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  // @ts-ignore
  wmatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
};

export const mumbaiAddresses: IfcAddresses = {
  // @ts-ignore
  myAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  // @ts-ignore
  bct: "0xf2438A14f668b1bbA53408346288f3d7C71c10a1",
  // @ts-ignore
  nct: "0x7beCBA11618Ca63Ead5605DE235f6dD3b25c530E",
  // @ts-ignore
  usdc: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
  // @ts-ignore
  weth: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
  // @ts-ignore
  wmatic: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
};

export default addresses;
