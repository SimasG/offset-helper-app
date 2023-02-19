// Address BCT/NCT retirements in Polygon
export function FETCH_ADDRESS_RETIREMENTS_POLYGON(address: string) {
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

// Address MCO2 retirements in Ethereum
export function FETCH_ADDRESS_RETIREMENTS_ETHEREUM(address: string) {
  return `query {
    retires(where:{retiree: "${address}"}) {
      id
      retiree
      timestamp
      value
      beneficiary
      offset {
        id
        name
        tokenAddress
        bridge
        registry
        totalBridged
        totalRetired
        currentSupply
        vintage
        projectID
        standard
        methodology
        country
        region
        storageMethod
        method
        emissionType
        category
        isCorsiaCompliant
        coBenefits
        correspAdjustment
        additionalCertification
        klimaRanking
      }
    }
  }`;
}
