import IS from "./typofany.module.js";
export default typeContractFactory;

const destructuredPresets = getParams4Destructuring();
const localFactoryCheckMethods = getFactoryChecks();

function typeContractFactory({logViolations = false, alwaysThrow = false} = {}) {
  const contracts = { addContract, addContracts };
  addFactoryContracts( contracts );
  
  return Object.freeze({ contracts, IS, tryJSON });
  
  function addContracts(contractLiterals) {
    if (!contracts.addContracts_Contract(contractLiterals)) { return; }
    
    const entries = Object.entries(contractLiterals);
    
    for (let [name, contract] of entries) {
      addContract( { ...contract, paramsChecked: true, name } );
    }
  }
  
  function addContract( params = destructuredPresets.addContract ) {
    let { name, method, expected, defaultValue, customReport, reportFn,
      shouldThrow, reportViolationsByDefault, paramsChecked } = params;
    name = name || method?.name;
    const addContract_Contract = contracts.addContract_Contract ||
      localFactoryCheckMethods.checkSingleContractParameters;
    
    if (!paramsChecked && !addContract_Contract({name, method, expected})) { return; }
    
    const embedded = createContractMethod( {
      name, method, expected, defaultValue,
      reportFn,  customReport, reportViolationsByDefault,
      logViolations, shouldThrow, alwaysThrow } );
    
    return Object.defineProperty( contracts, name, { value: embedded, enumerable: true } );
  }
}

function createContractMethod( params = destructuredPresets.createContract ) {
  let { name, method, expected, defaultValue, customReport, reportFn, logViolations, shouldThrow } = params;
  return function(value, ...args) {
    let resolved = method(value, ...args);
    const argsWithValue = IS(args[0], Object) && {...args[0], value} || {value};
    reportFn = reportFn ?? defaultViolationReporter;
    
    if (IS(customReport, Function)) { customReport(argsWithValue); }
    
    if (isNothing(resolved)) {
      const expectedValue = IS(expected, Function) ? expected(argsWithValue) : expected;
      resolved = !isNothing(argsWithValue.defaultValue) || defaultValue
        ? (defaultValue || argsWithValue.defaultValue) : resolved;
      const [doReport, throwIt] = [
        argsWithValue.reportViolation ?? reportViolationsByDefault,
        argsWithValue.shouldThrow ?? shouldThrow ];
      
      if ( doReport || throwIt || logViolations) {
        const aggregatedReport = getViolationReport( {
          inputValue: value,
          defaultValue: resolved,
          shouldBe: expectedValue,
          fnName: name || method.name,
        } );
        
        if (throwIt || alwaysThrow) {
          throw new TypeError(aggregatedReport);
        }
        
        reportFn(aggregatedReport);
      }
    }
    
    return resolved;
  };
}

function getParams4Destructuring() {
  const [ name, method, expected, defaultValue, customReport,
    reportFn, inputValue ] = [...Array(7)];
  return {
    get reportViolations() {
      return { inputValue, defaultValue, shouldBe: `unknown or n/a`, fnName: `unknown`, };
    },
    get createContract() {
      return { name, method, expected, defaultValue, customReport, reportFn,
        logViolations: false, shouldThrow: false, alwaysThrow: false,
        reportViolationsByDefault: false };
    },
    get addContract() {
      return { name, method, expected, defaultValue, customReport, reportFn,
        shouldThrow: false, reportViolationsByDefault: false, paramsChecked: false };
    },
  }
}

function getFactoryChecks() {
  const nameOk = name => IS(name, String) && name.trim().length;
  const expectedOk = expected => IS(expected, String) && expected.length || IS(expected, Function);
  const isMethod = method => IS(method, Function);
  const checkSingleContractParameters = ({name, method, expected} = {}) =>
    name && nameOk(name) &&
    method && isMethod(method) &&
    expected && expectedOk(expected);
  
  return { nameOk, expectedOk, isMethod, checkSingleContractParameters  };
}

function addFactoryContracts( contracts ) {
  const {nameOk, expectedOk, isMethod, checkSingleContractParameters} = localFactoryCheckMethods;
  contracts.addContract({
    method: nameOk,
    expected: `The contract to add needs a name (String)`,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    method: isMethod,
    expected: `The contract to add needs a method (Function)`,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    method: expectedOk,
    expected: `The contract to add needs an expected value method (String|Function)`,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    name: `addContracts_Contract`,
    method: literals => {
      const checked = IS(literals, Object) &&
        [...Object.entries(literals)].filter( ([, value]) =>
          (value.method && isMethod(value.method) &&
            value.expected && expectedOk(value.expected)))
          .length > 0;
      
      return checked ? literals : undefined;
    },
    expected: `the parameter for [addContracts] should be at least ` +
      `{ [contractName]: { method: Function, expected: String|Function } }`,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    name: `addContract_Contract`,
    method: checkSingleContractParameters,
    expected: `addContract parameters should at least be {name, method, expected}` +
      `\n   (when method is a named function, the name was derived from that)`,
    reportViolationsByDefault: true,
  });
}

function getViolationReport( params = destructuredPresets.reportViolations ) {
  const {inputValue, defaultValue, shouldBe, fnName } = params;
  const sorryDave = `✘ (contracts.${fnName}, input ${formatInput(inputValue)}) I'm sorry Dave, I can't do that.`;
  const noInput = isNothing(inputValue);
  const forValue =  noInput ? `${sorryDave}\n   Try providing an input value` : `${sorryDave}`;
  const itIsNot = noInput ? `` : `\n   ${shouldBe}.`;
  const defaultVal = !isNothing(defaultValue) ? `\n   Using the assigned default value (${
    tryJSON(defaultValue)}) instead.` : ``;
  
  return `${forValue}${itIsNot}${defaultVal}`;
}

function isNothing(val) {
  return IS(val, undefined, null, NaN);
}

function tryJSON(value) {
  const trialLambda = () => {
    const trial = JSON.stringify(value);
    return /Infinity|NaN/.test(trial) ? trial.replace(/"/g, ``) : trial;
  };
  
  return tryValue(trialLambda, value);
}

function formatInput(inputValue) {
  const arrayMapper = v =>
    IS(v, String) ? `"${v}"` :
      IS(v, Object) ? tryJSON(v) : String(v);
  return IS(inputValue, Object)
    ? tryJSON(inputValue)
    : /Array\(/.test(inputValue?.constructor.toString())
      ? `[${[...inputValue].map(arrayMapper)}]`
      : String(inputValue);
}

function defaultViolationReporter(violationInfo) {
  console.info(violationInfo);
}

function tryValue(lambda, valueRaw) {
  try { return lambda(); }
  catch(err) {
    console.error({ isOk: err.name === expected, message: err.message, type: err.name });
    return valueRaw;
  }
}