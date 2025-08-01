export default function({ IS, tryJSON, contractsPrefix} = {}) {
  contractsPrefix = contractsPrefix ? `${contractsPrefix}\n` : ``;
  return {
    EN: {
      contractCreationError: `✘ (one or more of) the contract(s) could not be created. `+
        `A contract should at least contain a [method], its value must be a function.`,
      unknownOrNa: `unknown or n/a`,
      unknown: `unknown`,
      nameOkExpected: `The contract to add needs a name (String)`,
      isMethodExpected: `The contract to add needs a method (Function)`,
      expectedOkExpected: `The contract to add needs an expected value method (String|Function)`,
      addContracts_Contract_Expected: `the parameter for [addContracts] should be at least ` +
        `{ [contractName]: { method: Function, expected: String|Function } }`,
      addContract_Contract_Expected: `addContract parameters should at least be {name, method, expected}` +
        `\n(when method is a named function, the name was derived from that)`,
      report_sorry: (fnName, inputValue) => `✘ ${contractsPrefix}Contract violation for contract [${
        fnName}], input ${inputValue}`,
      report_forValue: sorryDave => `${sorryDave}`,
      report_Expected: shouldBe => `\nExpected (according to contract 'expected' value):\n"${shouldBe}"`,
      report_defaultValue: defaultValue => `\nUsing the contract default value (${
          IS(defaultValue, Function)
            ? defaultValue.toString() : IS(defaultValue, String)
              ? `"${defaultValue}"` : tryJSON(defaultValue)}) instead`,
    },
    NL: {
      contractCreationError: `✘ (één of meer) contract(en) konden niet worden gecreëerd. `+
        `Een contract moet tenminste de eigenschap [method] met een functie als waarde hebben.`,
      unknownOrNa: `onbekend of nvt`,
      unknown: `onbekend`,
      nameOkExpected: `Het contract moet een naam hebben (eigenschap name: String)`,
      isMethodExpected: `Het contract moet kunnen worden uitgevoerd (eigenschap method: Function)`,
      expectedOkExpected: `Het contract moet aangeven wat er wordt verwacht (eigenschap expected: String|Function)`,
      addContracts_Contract_Expected: `De parameter for [addContracts] moet tenminste ` +
        `{ [contractName]: { method: Function, expected: String|Function } } zijn`,
      addContract_Contract_Expected: `De invoer vooor [addContract] moet tenminste {name, method, expected} zijn` +
        `\n(wanneer de eigenschap [method] een functie met naam was wordt [name] daarvan afgeleid)`,
      report_sorry: (fnName, inputValue) => `✘ ${contractsPrefix} Contractbreuk voor contract [${
        fnName}], input ${inputValue}`,
      report_forValue: sorryDave => `${sorryDave}`,
      report_Expected: shouldBe => `\nVerwacht werd (volgens contract 'expected'):\n"${shouldBe.trim()}"`,
      report_defaultValue: defaultValue =>
        `\nIn plaats daarvan wordt de voor dit contract toegekende standaardwaarde (${
          IS(defaultValue, Function)
            ? defaultValue.toString() : IS(defaultValue, String)
              ? `"${defaultValue}"` : tryJSON(defaultValue)}) gebruikt`,
    }
  }
}
