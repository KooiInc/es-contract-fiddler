export default function(IS, tryJSON) {
  return {
    EN: {
      unknownOrNa: `unknown or n/a`,
        unknown: `unknown`,
        nameOkExpected: `The contract to add needs a name (String)`,
        isMethodExpected: `The contract to add needs a method (Function)`,
        expectedOkExpected: `The contract to add needs an expected value method (String|Function)`,
        addContracts_Contract_Expected: `the parameter for [addContracts] should be at least ` +
      `{ [contractName]: { method: Function, expected: String|Function } }`,
        addContract_Contract_Expected: `addContract parameters should at least be {name, method, expected}` +
      `\n(when method is a named function, the name was derived from that)`,
        report_sorry: (fnName, inputValue) => `✘ Contract violation for contract [${fnName}], input ${inputValue}`,
        report_forValue: sorryDave => `${sorryDave}`,
        report_Expected: shouldBe => `\n${shouldBe}`,
        report_defaultValue: (hasValue, defaultValue) => !hasValue
        ? `\nUsing the assigned default value (${getDefaultValue4Reporting(defaultValue)}) instead` : ``,
    },
    NL: {
      unknownOrNa: `onbekend of nvt`,
        unknown: `onbekend`,
        nameOkExpected: `Het contract moet een naam hebben (eigenschap name: String)`,
        isMethodExpected: `Het contract moet kunnen worden uitgevoerd (eigenschap method: Function)`,
        expectedOkExpected: `Het contract moet aangeven wat er wordt verwacht (eigenschap expected: String|Function)`,
        addContracts_Contract_Expected: `De parameter for [addContracts] moet tenminste ` +
      `{ [contractName]: { method: Function, expected: String|Function } } zijn`,
        addContract_Contract_Expected: `De invoer vooor [addContract] moet tenminste {name, method, expected} zijn` +
      `\n(wanneer de eigenschap [method] een functie met naam was wordt [name] daarvan afgeleid)`,
        report_sorry: (fnName, inputValue) => `✘ Contractbreuk voor contract [${fnName}], input ${inputValue}`,
        report_forValue: sorryDave => `${sorryDave}`,
        report_Expected: shouldBe => `\n${shouldBe}`,
        report_defaultValue: (hasValue, defaultValue) => !hasValue
        ? `\nIn plaats daarvan wordt de voor dit contract toegekende standaardwaarde (${
          getDefaultValue4Reporting(defaultValue)}) gebruikt` : ``,
    }
  };
  
  function getDefaultValue4Reporting(value) {
    return IS(value, String) ? `"${value}"` : IS(value, Number) ? value : tryJSON(value);
  }
}