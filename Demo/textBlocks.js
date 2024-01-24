export default {
  explainerText: `<pre class="line-numbers language-javascript explainerCode closed">
  <code class=" line-numbers language-javascript">/**
   * Import/initialize
   * -----------------
   * import {contractFactory, IS, tryJSON} from "[location of the factory]";
   *
   * IS is a library to check the type of anything in ES. The user can use
   * it within contracts to check the type(s) of variables.
   * See https://github.com/KooiInc/typeofAnything for syntax/explanation
   *
   * tryJSON can be used to stringify ES objects. It is used for
   * this Demo.
   *
   * initialize using
   * ----------------
   * const { contracts, IS } = contractFactory({
   *   [reporter]: Function                      // the function to use for
   *                                             // reporting contract violations
  *                                              // default violationInfo => console.info(violationInfo))
   *   [logViolations]: boolean (default false), // log violations by default
   *                                             // using [reporter]
   *                                             // (otherwise log per contract)
   *   [alwaysThrow]: boolean (default false),   // throw when violated by default
   *                                             // (otherwise per contract)
   * });
   */
   // initialize contracts (for demo a custom reporter function is used):
   const { contracts, IS } = contractFactory({reporter: demoReporter});
   
   /**
   * [contracts] has two methods: addContract and addContracts
   * ------
   * syntax
   * ------
   * contracts.addContract({
   *   [name]: string,                      // when method is anonymous, provide a name
   *                                        // (for reporting)
   *   method: Function,                    // a named or anonymous function
   *   expected: string || Function,        // for reporting
   *   [reportFn]: Function                 // the method for reporting
   *                                        // override the factory [reporter]
   *   [reportViolationsByDefault]: boolean // always report violations, default false
   *   [customReport]: Function             // a custom reporting function
   *   [defaultValue]: any,                 // if the contract is violated, return [defaultValue]
   *   [reportFn]: Function                 // the reporting function, default console.info
   *   [shouldThrow]: boolean               // Throw when violated, default false
   * });
   *
   * Create from a contract definition object
   *
   * The user supplies {
   *   [contract name]: { method, expected, ...},
   *   ...,
   *   [contract name]: { method, expected, ...} }
   * ------------------------------------------------
   * contracts.addContracts(contractsDefinitions: Object});
  */

  // Using contracts.addContractS
  // to assign contracts used in this demo
  // -------------------------------------
  contracts.addContracts( {
    number: {
      method: function number(nr) { return IS(nr, Number) && isFinite(nr) ? nr : undefined; },
      expected: "a number (integer or float)", },
    numberBetween: {
      method: numberBetween,
      expected({min, max, inclusive} = {}) {
        min = inclusive && min !== Number.MIN_SAFE_INTEGER ? min - 1 : min;
        max = inclusive && max !== Number.MAX_SAFE_INTEGER ? max + 1 : max;
        return \`Your input should be a number between \${min} and \${max}\`;
      },
    },
    myObject: {
      method: myObject,
      expected: "Your input is not {hello, world, universe}",
    },
    plainString: {
      method: plainString,
      expected: "Your input is not a string",
    },
    int: {
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr % 1 === 0 && nr || undefined; },
      expected: "Your input is not an integer",
    },
    numberNotZero: {
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr !== 0 && nr || undefined},
      expected: "Your input is not number < 0 or number > 0",
      defaultValue: 1,
    },
    stringNotEmpty: {
      method: str => contracts.plainString(str) && str.length > 0,
      expected: "Your input is not a non empty string",
     },
    divide: {
      customReport({value, numerator, denominator} = {}) {
        if ( !isFinite( (value ?? numerator)/(denominator ?? 0) ) ) {
          console.info("✘ (contracts.divide) I'm sorry Dave" +
            \`\\n   [input: \${value ?? numerator} / denominator: \${denominator}] is not finite.\` +
            \`\\n   The denominator was 0, so divided the numerator (\${
              value}) by (the default value) 1\`);
        }
      },
      method(value, {numerator, denominator} = {}) {
        numerator = value ?? numerator;
        const result = numerator/denominator;
        return result === Infinity ? numerator/1 : result;
      },
      expected: "n/a",
    },
    divider: {
      method: divider,
      reportViolationsByDefault: true,
      expected({value} = {}) {
        value = IS(value, Array) && [...value.values()] || [];

        if (value.length < 2) {
          value = [...Array(2)].map((v, i) => {value?.[i]});
        }

        const [num, den] = value;
        const divisionText = \`\${num} / \${den}\`;
        const prefix = \`The result of [\${divisionText}] is not finite\`;
        const message = IS(num, undefined, null, NaN)
          ? "the numerator has no value"
          : IS(den, undefined, null, NaN)
            ? "the denominator has no value"
              : "insufficient input (should be array of 2 numbers)";
        return \`\${prefix}. Cause: \${message}\`;
      },
    },
    myTypedObject: {
      method: function(obj) {
        const expected = {
          first: val => IS(contracts?.plainString(val), String),
          second: val => contracts?.int(val),
        };
        
        return !IS(obj, Object) ||
          Object.entries(expected).find( ([k, v]) => !v(obj[k]))
            ? undefined : obj;
      },
      reportViolationsByDefault: true,
      expected() {
        return !(contracts.int && contracts.plainString)
          ? "myTypedObject uses contracts.int an contracts.plainString, which are not assigned!"
          : "Your input is not {first: String, second: integer}"
      }
    }
  } );

  /**
   *  now you can use:
   *  contract[contract name](
   *    value,
   *    { [local parameters], [instance creation properties] }
   *  ):
   *  => [local parameters]:
   *     parameters for the contract method
   *  => [instance creation properties]:
   *     one or more properties as used on the instance creator (addContract)
   *     So: eventual overrides for the instance creator function parameters
   *  e.g.
   *  contract.plainString("Hello!"); //=> "Hello!"
   *  contract.number(42); //=> 42
   *  contract.number("nocando"); //=> undefined
   *  contract.number("nocando",  {defaultValue: 0}); //=> 0
   *  contract.int(42.1, {reportViolation: true}); //=> undefined (report in console)
   *  contract.numberBetween(15, {min: 10, max: 20, defaultValue: 11}); //=> 15
   *  contract.numberBetween(5, {min: 10, max: 20, defaultValue: 11}); //=> 11
   *
   *  try {
   *    contract.numberBetween(5, {min: 10, max: 20, shouldThrow: true});
   *  } catch(err) {
   *    console.log(err);
   *    ...
   *  }
   */

  // Functions used in contracts
  // ---------------------------
  function plainString(value) {
    return IS(value, String) ? value : undefined;
  }

  function myObject(obj) {
    const keysExpected = "hello,world,universe".split(",");
    return IS(obj, Object) &&
      Object.keys(obj).filter(k => keysExpected.indexOf(k) > -1).length === keysExpected.length
      ? obj : undefined;
  }

  function numberBetween( nr, {
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      inclusive } = {} ) {
    min = inclusive && min !== Number.MIN_SAFE_INTEGER ? min - 1 : min;
    max = inclusive && max !== Number.MAX_SAFE_INTEGER ? max + 1 : max;
    return IS(nr, Number) && nr > min && nr < max && nr ||  undefined;
  }</code></pre>`,
  HeaderText: (sbLink, githubLink) => `!!<p>
     ${sbLink}
      <a target="_blank" href="//en.wikipedia.org/wiki/Design_by_contract">See also...</a> |
      ${githubLink}</p>
    <h2>Use a 'Design by contract' pattern to check variable types</h2>
    <div class="q">
      <div>
      The idea of Design by Contract was proposed by Bertrand Meyer in 1986. It states that the components
      of a program should be responsible for protecting their own integrity. When it is easy to reason about
      the correctness of the parts, it is easier to reason about the correctness of the whole.
      Mistakes are quicker to find and easier to correct, making the program more reliable.
      </div>
      <div style="line-height:1.2rem; margin-top:revert">...</div>
      <div>
      Static typing has been proposed as a solution, but static type systems are too clumsy to express the
      constraints that we actually need. Consider division. Dividing a number by zero is meaningless,
      yet we are unable to statically type the denominator as a non-zero number.<br>
      Static typing shrinks the set of invalid inputs, but does not necessarily eliminate them.
      <a target="_blank" href="//james.diacono.com.au/design_by_contract.html">Source</a>
      </div>
    </div>
    <div>
      This library enables a programmer to create contracts for variables to use in code.<br>
      See the console for the messaging from contract violations in the examples.<br>
      Click "Open explainer" to open explanation and code for the contracts used in this demo.<br>
    </div>
    <div>The demo uses the <a target="_blank" href="//github.com/KooiInc/JQL"
      >JQL-library</a> (<code class="inline">$</code>)</div>`,
  reporterFn: [`!!<h3>System</h3>`,
    `<pre class="line-numbers language-javascript">
<code class=" line-numbers language-javascript">
const reportDiv = $.div({id:"ViolationsReport"}).append(&lt;h3>All logged contract violations&lt;/h3>");
// [...]
function demoReporter(violationInfo) {
  const infoOk = contracts.plainString(
    violationInfo,
    { extraInfo: \`\\n  ** Origin demo.js/demoReporter: no input! **\` }
  );
  return infoOk && reportDiv.append(\`&lt;pre>\${infoOk}&lt;/pre>\`) || void(0);
}</code></pre>`],
};