export default {
  EN: {
    unknownOrNa: `unknown or n/a`,
    unknown: `unknown`,
    nameOkExpected: `The contract to add needs a name (String)`,
    isMethodExpected: `The contract to add needs a method (Function)`,
    expectedOkExpected: `The contract to add needs an expected value method (String|Function)`,
    addContracts_Contract_Expected: `the parameter for [addContracts] should be at least ` +
      `{ [contractName]: { method: Function, expected: String|Function } }`,
    addContract_Contract_Expected: `addContract parameters should at least be {name, method, expected}` +
      `\n   (when method is a named function, the name was derived from that)`,
    addContracts_Contract_Name: `addContracts_Contract`,
    addContract_Contract_Name: `addContract_Contract`,
    report_sorry: (fnName, inputValue) => `✘ (contracts.${fnName}, input ${inputValue}) I'm sorry Dave, I can't do that.`,
    report_forValue: (noInput, sorryDave) => noInput ? `${sorryDave}\n   Try providing an input value` : `${sorryDave}`,
    report_IsNot: (noInput, shouldBe) => noInput ? `` : `\n   ${shouldBe}.`,
    report_defaultValue: (hasValue, defaultValue) => !hasValue ? `\n   Using the assigned default value (${
      defaultValue}) instead.` : ``,
  },
  NL: {
    unknownOrNa: `onbekend of nvt`,
    unknown: `onbekend`,
    nameOkExpected: `Het contract moet een naam hebben (eigenschap name: String)`,
    isMethodExpected: `Het contract moet kunnen worden uitgevoerd (eigenschap method: Function)`,
    expectedOkExpected: `Het contract moet aangeven wat er wordt verwacht (eigenschap expected: String|Function)`,
    addContracts_Contract_Name: `addContracts_Contract`,
    addContract_Contract_Name: `addContract_Contract`,
    addContracts_Contract_Expected: `De parameter for [addContracts] moet tenminste ` +
      `{ [contractName]: { method: Function, expected: String|Function } } zijn`,
    addContract_Contract_Expected: `De [addContract] moet tenminste {name, method, expected} zijn` +
      `\n   (wanneer de eigenschap [method] een functie met naam was wordt [name] daarvan afgeleid)`,
    report_sorry: (fnName, inputValue) => `✘ (contracts.${fnName}, input ${inputValue}) Sorry man, dat doen we niet.`,
    report_forValue: (noInput, sorryDave) => noInput ? `${sorryDave}\n   Probeer een (input-)waarde te geven` : `${sorryDave}`,
    report_IsNot: (noInput, shouldBe) => noInput ? `` : `\n   ${shouldBe}.`,
    report_defaultValue: (hasValue, defaultValue) => !hasValue ? `\n   In plaats daarvan wordt de toegekende standaardwaarde (${
      defaultValue}) gebruikt.` : ``,
  }
}