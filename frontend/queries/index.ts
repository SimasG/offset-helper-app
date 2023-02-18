export function FETCH_ADDRESS_RETIREMENTS(address: string) {
  // Creating a GraqhQL query
  return `query {
    klimaRetires(orderBy: timestamp, orderDirection: desc, where:{
        beneficiaryAddress: "${address}"
      }) {
        id
        transaction {
          id
        }
        retiringAddress
        beneficiaryAddress
        beneficiary
        retirementMessage
        pool
        amount
        offset {
          id
          vintage
          projectID
          name
          bridge
        }
      }
    }`;
}
