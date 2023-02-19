import axios from "axios";

export async function klimaSubgraphQuery(url: string, query: string) {
  try {
    const SUBGRAPH_URL = url;
    const response = await axios.post(SUBGRAPH_URL, {
      query,
    });
    if (response.data.errors) {
      console.error(response.data.errors);
      throw new Error(`Error making subgraph query ${response.data.errors}`);
    }
    return response.data.data;
  } catch (error) {
    console.error(error);
    // @ts-ignore
    throw new Error(`Could not query the subgraph ${error.message}`);
  }
}
