export function FETCH_ADDRESS_RETIREMENTS() {
  // Creating a GraqhQL query
  return `query {
    klimaRetires(orderBy: timestamp, orderDirection: desc, where:{
        beneficiaryAddress: "0x619353127678b95c023530df08bcb638870cfdda"
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
