import IS from "https://unpkg.com/typeofanything@latest/typeofany.module.js";
import languageFactory from "./Language.js";

export default typeContractFactory;

let lang;
let specs = initializeArguments({});
const localFactoryContractMethods = getFactoryContractCheckMethods();
const localContracts = addFactoryContracts( {language: `EN`} );

function typeContractFactory( instanceSpecs ) {
  specs = initializeArguments(instanceSpecs);
  const contracts = { addContract, addContracts };
  return Object.freeze({ contracts, IS, tryJSON });

  function addContracts( contractDefinitions ) {
    if (!localContracts.addContracts_Contract(contractDefinitions)) { return; }

    const entries = Object.entries(contractDefinitions);

    for (let [name, contract] of entries) {
      addContract( { ...contract, paramsChecked: true, name } );
    }
  }

  function addContract( params ) {
    let { name, method, expected, defaultValue, customMessageFn, reportFn,
      shouldThrow, reportViolationsByDefault, paramsChecked, isBoolean = false} = params;
    name = name || method?.name;
    expected = expected || `unknown`;

    if (!paramsChecked && !localFactoryContractMethods.checkSingleContractParameters({method})) {
      return specs.reporter(lang.contractCreationError);
    }

    const embedded = newContractFactory( {
      name, method, expected, defaultValue, reporter: instanceSpecs.reporter,
      reportFn, customMessageFn, reportViolationsByDefault, isBoolean,
      logViolations: instanceSpecs.logViolations, shouldThrow, alwaysThrow: instanceSpecs.alwaysThrow, } );
    return Object.defineProperty( contracts, name, { value: embedded, } );
  }
}

function initializeArguments( specs ) {
  specs.reporter = specs.reporter || defaultViolationReporter;
  specs.logViolations = specs.logViolations || false;
  specs.alwaysThrow = specs.alwaysThrow || false;
  specs.language = languageFactory({IS, tryJSON})[specs.language || `EN`];
  lang = specs.language;
  return specs;
}

function newContractFactory( params ) {
  let {
    name, method, expected, defaultValue, customMessageFn, reportFn, reporter,
    logViolations, shouldThrow, reportViolationsByDefault, alwaysThrow, isBoolean,
  } = params;

  return function( value, ...args ) {
    let resolved = method(value, ...args);
    const doesNotResolve = isNothing(resolved) || (!isBoolean && !resolved) || (isBoolean && !!!IS(value, Boolean));
    const args4Reporting = IS(args[0], Object) && {...args[0], value} || {value};
    reportFn = reportFn ?? reporter ?? defaultViolationReporter;

    if ( IS(customMessageFn, Function) ) { customMessageFn(args4Reporting); }

    if ( doesNotResolve ) {
      const expectedValue = IS(expected, Function) ? expected(args4Reporting) : expected;
      let valueDefault = defaultValue || args4Reporting.defaultValue;

      (name || method.name) === `int` && console.log(valueDefault);

      const [doReport, throwIt] = [
        args4Reporting.reportViolation ?? reportViolationsByDefault,
        args4Reporting.shouldThrow ?? shouldThrow ];

      if ( doReport || throwIt || logViolations) {
        const aggregatedReport = getViolationReport( {
          inputValue: value,
          defaultValue: valueDefault,
          shouldBe: expectedValue.trim(),
          fnName: name || method.name,
          isBoolean,
        } );

        if (throwIt || alwaysThrow) {
          throw new TypeError(aggregatedReport);
        }

        reporter(aggregatedReport);
      }

      return isBoolean && IS(valueDefault, Boolean) ? valueDefault :
        IS(valueDefault, NaN) ? NaN : valueDefault || undefined;
    }

    return resolved;
  };
}

function getViolationReport( params ) {
  const { inputValue, defaultValue, shouldBe, fnName, isBoolean } = params;
  const hasDefaultValue = !isNothing(defaultValue) || isBoolean && IS(defaultValue, Boolean);
  const sorryDave = lang.report_sorry(fnName, formatInput(inputValue));
  const forValue =  lang.report_forValue(sorryDave);
  const itIsNot = lang.report_Expected(shouldBe);

  return indent(`${forValue}${itIsNot}${hasDefaultValue && lang.report_defaultValue(defaultValue) || ``}`);
}

function getFactoryContractCheckMethods() {
  const nameOk = name => IS(name, String) && name.trim().length;
  const expectedOk = expected => IS(expected, String) && expected.length || IS(expected, Function);
  const isMethod = method => IS(method, Function);
  const checkSingleContractParameters = ({name, method} = {}) =>
    nameOk(name || method.name)  && IS(method, Function);

  return { nameOk, expectedOk, isMethod, checkSingleContractParameters  };
}

function addFactoryContracts( ) {
  const {nameOk, expectedOk, isMethod, checkSingleContractParameters} = localFactoryContractMethods;
  return {
    nameOk: nameOk,
    isMethod: isMethod,
    expectedOk: expectedOk,
    addContracts_Contract(literals) {
      const entries = [...Object.entries(literals)];
      const checked = IS(literals, Object) &&
        entries.filter(([, value]) => checkSingleContractParameters(value)) || undefined;

      if (checked.length < entries.length) {
        console.info(lang.contractCreationError);
      }

      return checked?.length > 0 ? literals : undefined;
    },
    addContract_Contract: checkSingleContractParameters,
  };
}

function indent(str, n = 3) {
  return str.replace(/\n/g, `\n${` `.repeat(n)}`);
}

function isNothing( val ) {
  return IS(val, null, undefined);
}

function tryJSON( value ) {
  const trialLambda = () => {
    const trial = JSON.stringify(value);
    return /Infinity|NaN/.test(trial) ? trial.replace(/"/g, ``) : trial;
  };

  return tryValue( trialLambda, value );
}

function formatInput( inputValue ) {
  const arrayMapper = v =>
    IS(v, String) ? `"${v}"` :
      IS(v, Object) ? tryJSON(v) : String(v);
  return IS(inputValue, String)
    ? `"${inputValue}"`
    : IS(inputValue, Object)
      ? tryJSON(inputValue)
      : /Array\(/.test(inputValue?.constructor.toString())
        ? `[${[...inputValue].map(arrayMapper)}]`
        : String(inputValue);
}

function defaultViolationReporter( violationInfo ) {
  console.info( violationInfo );
}

function tryValue( lambda, valueRaw ) {
  try { return lambda(); }
  catch(err) {
    console.error({ isOk: err.name === expected, message: err.message, type: err.name });
    return valueRaw;
  }
}
