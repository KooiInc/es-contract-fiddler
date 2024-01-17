import IS from "./typofany.module.js";

export default typeContractFactory;

function typeContractFactory({logViolations = false, alwaysThrow = false} = {}) {
  const contracts = { addContract, };
  
  return { contracts, IS, tryJSON };
  
  function addContract( {
                          name, method, expected, defaultValue, customReport,
                          reportFn, shouldThrow, reportViolationsByDefault } = {}
  ) {
    name = name || method.name;
    const expectedOk = IS(expected, String) && expected.length || IS(expected, Function);
    const isMethod = IS(method, Function);
    
    if (!name && !isMethod && !expectedOk) {
      throw new TypeError(`TypeContractFactory::addContract: parameters invalid`);
    }
    
    const embedded = createEmbedded( {
      name, method, expected, defaultValue,
      reportFn,  customReport, reportViolationsByDefault,
      logViolations, shouldThrow, alwaysThrow } );
    
    Object.defineProperty( contracts, name, { value: embedded, } );
  }
}

function createEmbedded( {
                           name, method, expected,
                           defaultValue, customReport, reportFn,
                           logViolations, shouldThrow, alwaysThrow,
                           reportViolationsByDefault } = {}
) {
  return function(value, ...args) {
    let resolved = method(value, ...args);
    const argsWithValue = IS(args[0], Object) && args[0] || {};
    argsWithValue.value = value;
    reportFn = reportFn ?? defaultViolationReporter;
    
    if (IS(customReport, Function)) { customReport(argsWithValue); }
    
    if (isNothing(resolved) || resolved === Infinity) {
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
  }
}

function getViolationReport( {
                               inputValue, defaultValue,
                               shouldBe = `unknown or n/a`,
                               fnName = `unknown`, } = {} ) {
  const sorryDave = `✘ (contracts.${fnName}, input ${
    formatInput(inputValue)}) I'm sorry Dave, I can't do that.`;
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
    : /Array\(/.test(inputValue?.constructor)
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