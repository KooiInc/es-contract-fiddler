import contractFactory from "../es-contract.js";
import {logFactory, $} from "./helpers.bundled.js";
const isSB = /stackblitz/i.test(location.href);
const { log:print } = logFactory();
isSB && console.clear();
const toCode = str => `<code class="inline">${str}</code>`;
const {contracts, IS,} = contractFactory({reporter: demoReporter});
const world4TemplateString = `world`;
window.contracts = contracts;
window.IS = IS;
import auxText from "./textBlocks.js";
const reportDiv = $(`<div id="ViolationsReport">`);
styleDocument();
addContracts4Demo(contracts);
demoReporter();
createHeaderAndExplanation();
createHandling();
createDemo();
Prism.highlightAll();

function demoReporter(violationInfo) {
  if (contracts.plainString(violationInfo, {extraInfo: `\n  **Origin demo.js/demoReporter**`})) {
    reportDiv.HTML.set(`<pre>${formatViolationForHtml(violationInfo)}</pre>`, true);
  }
}

function formatViolationForHtml(violationInfo) {
  return violationInfo.replace(/✘/, `  ✘`  ).replace(/\n\s+/g, `\n     `);
}

function addContracts4Demo(contracts) {
  const { addContracts: addAll } = contracts;
  const allContracts = {
    number: {
      method: function number(nr) { return IS(nr, Number) && isFinite(nr) ? nr : undefined; },
      expected: `Your input should be a number (integer or float)`, },
    numberBetween: {
      method: numberBetween,
      expected({min, max, inclusive} = {}) {
        min = inclusive && min !== Number.MIN_SAFE_INTEGER ? min - 1 : min;
        max = inclusive && max !== Number.MAX_SAFE_INTEGER ? max + 1 : max;
        return `Your input should be a number between ${min} and ${max}`;
      },
    },
    myObject: {
      method: myObject,
      expected: `Your input is not {hello, world, universe}`,
    },
    plainString: {
      method: plainString,
      expected({extraInfo}) { return `Your input is not a string ${extraInfo ?? ``}`; },
      reportViolationsByDefault: true
    },
    int: {
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr % 1 === 0 && nr || undefined; },
      expected: `Your input is not an integer`,
    },
    numberNotZero: {
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr !== 0 && nr || undefined},
      expected: `Your input is not number < 0 or number > 0`,
      defaultValue: 1,
    },
    stringNotEmpty: {
      method: str => contracts.plainString(str) && str.length > 0,
      expected: `Your input is not a non empty string`,
    },
    
    divide: {
      customReport({value, numerator, denominator} = {}) {
        if ( !isFinite( (value ?? numerator)/(denominator ?? 0) ) ) {
          demoReporter(`✘ Contract violation for divide`+
            `\n   [input: ${value ?? numerator} / denominator: ${denominator}] is not finite.` +
            `\n   The denominator was 0, so divided the numerator (${
              value}) by (the default value) 1`);
        }
      },
      method(value, {numerator, denominator} = {}) {
        numerator = value ?? numerator;
        const result = numerator/denominator;
        return result === Infinity ? numerator/1 : result;
      },
      expected: `n/a`,
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
        const divisionText = `${num} / ${den}`;
        const prefix = `The result of [${divisionText}] is not finite`;
        const message = IS(num, undefined, null, NaN)
          ? `the numerator has no value`
          : IS(den, undefined, null, NaN)
            ? `the denominator has no value`
            : `insufficient input (should be array of 2 numbers)`;
        return `${prefix}. Cause: ${message}`;
      },
    },
    myTypedObject: {
      method: function(obj) {
        const expected = {
          first: val => IS(contracts?.plainString(val), String),
          second: val => contracts?.int(val),
        };
        const isObject = IS(obj, Object);
        const entries = Object.entries(isObject ? obj : {});
        const entriesLengthOk = entries.length === 2;
        const typedOk = entriesLengthOk && !Object.entries(expected).find( ([k, v]) => !v(obj[k]));
        
        return !isObject || !entriesLengthOk || !typedOk ? undefined : obj;
      },
      reportViolationsByDefault: true,
      expected() {
        return !(contracts.int && contracts.plainString)
          ? `myTypedObject uses contracts.int an contracts.plainString, which are not assigned!`
          : `Input can ONLY be {first: String, second: integer}`
      }
    }
  };
  
  addAll(allContracts);
  
  function divider(value) {
    value = IS(value, Array) && [...value.values()] || [];
    
    if (value.length < 2) {
      value = [...Array(2)].map((_, i) => {value?.[i]});
    }
    const [numerator, denominator] = value;
    const result = numerator/denominator;
    return !isFinite(result) ? undefined : result;
  }
  
  function plainString(value) {
    return IS(value, String) ? value : undefined;
  }
  
  function numberBetween(nr, {min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, inclusive} = {}) {
    min = inclusive && min !== Number.MIN_SAFE_INTEGER ? min - 1 : min;
    max = inclusive && max !== Number.MAX_SAFE_INTEGER ? max + 1 : max;
    return IS(nr, Number) && isFinite(nr) && nr > min && nr < max && nr ||  undefined;
  }
  
  function myObject(obj) {
    const keysExpected = `hello,world,universe`.split(`,`);
    return IS(obj, Object) &&
    Object.keys(obj).filter(k => keysExpected.indexOf(k) > -1).length === keysExpected.length
      ? obj : undefined;
  }
}

function createHeaderAndExplanation() {
  $(`<div class="container">`).append($(`#log2screen`));
  const sbLink = isSB
    ? `<p><a target="_top" href="//stackblitz.com/@KooiInc">All projects</a> | ` : ``;
  const githubLink = `<a target="${isSB ? `_blank` : `_top`}" href="https://github.com/KooiInc/es-contract-fiddler"
      >Github</a>`;
  print(`${auxText.HeaderText(sbLink, githubLink)}
    <p><button class="explainer closed">explainer</button>
    <button class="showViolations">Show contract violations</button></p>
    ${auxText.explainerText}`);
}

function createHandling() {
  $.delegate( `click`, `.showViolations`, () => $.Popup.show({ content: reportDiv.HTML.get() }) );
  $.delegate(`click`, `.explainer`, (evt, self) => {
    const closed = `closed`;
    if (self.hasClass(`closed`)) {
      self.removeClass(`closed`);
      return $(`.explainerCode`).removeClass(`closed`);
    }
    self.addClass(closed);
    return $(`.explainerCode`).addClass(`closed`);
  });
}

function createDemo() {
  print(`!!<h2>Examples</h2>`);
  
  // plainString
  print(`!!<h3>Contract: plainString</h3>`,`${toCode("contracts.plainString(`hello`)")}<br>=> ${
    contracts.plainString(`hello`) }`);
  print(`${toCode("contracts.plainString(`hello ${world4TemplateString}`)")}<br>=> ${
    contracts.plainString(`hello ${world4TemplateString}`)}`);
  print(`${toCode("contracts.plainString()")}<br>=> ${
    contracts.plainString()}`);
  print(`${toCode("contracts.plainString([1,2,3])")} => ${contracts.plainString([1,2,3])}`);
  print(`${toCode("contracts.plainString([1,2,3], {defaultValue: `Nothing`, reportViolation: true})")}<br>=> ${
    contracts.plainString([1,2,3], {defaultValue: `Nothing`, reportViolation: true})}`);
  
  // int
  print(`!!<h3>Contract: int</h3>`, `${toCode("contracts.int(42)")}<br>=> ${contracts.int(42)}`);
  print(`${toCode("contracts.int(42.1)")}<br>=> ${contracts.int(42.1)}`);
  print(`${toCode("[1,2,3,4,`nothing`,41.999,5].filter(contracts.int)")}<br>=> [${
    [1,2,3,4,`nothing`,41.999,5].filter(contracts.int)}]`);
  print(`${toCode("[1,2,3,4,,`NADA`,,42.1,5].flat().filter(v => contracts.int(v, {defaultValue: 0}))")}<br>=> [${
    [1,2,3,4,`NADA`,,,42.01,5].flat().map((v) => contracts.int(v, {defaultValue: 0}))}]
    <br><b>Note</b>: <code class="inline">.flat()</code> because <code class="inline">Array.map</code>
    does not process empty slots (and <code class="inline">.flat()</code> kills them)<br>&nbsp;&nbsp;e.g.${
    toCode("[undefined,,,1].map(v => !v && `nada` || v)")} => [${[undefined,,,1].map(v => !v && `nada` || v)}]
      <br>&nbsp;&nbsp;vs ${toCode("[undefined,,,1].flat().map(v => !v && `nada` || v)")} => [${
    [undefined,,,1].flat().map(v => !v && `nada` || v)}]`)
  
  // number
  print(`!!<h3>Contract: number</h3>`, `${toCode("contracts.number()")} => ${contracts.number()}`);
  print(`${toCode("contracts.number(undefined, {defaultValue: 42, reportViolation: true})")}<br>=> ${
    contracts.number(undefined, {defaultValue: 42, reportViolation: true})}`);
  print(`${toCode("contracts.number(13.22)")}<br>=> ${contracts.number(13.22)}`);
  print(`${toCode("[1,2,3,4,`not number`,41.9999,5].filter(contracts.number)")}<br>=> [${
    [1,2,3,4,`not number`,41.9999,5].filter(contracts.number)}]`);
  
  
  // objects
  const obj1 = toCode("contracts.myObject({hello: `hello`, world: `world`, universe: `universe`})");
  const obj2 = toCode("contracts.myTypedObject({first: ``, second: 42}");
  print(`!!<h3>Contract: myObject</h3>`,
    `${obj1}<br>=> ${JSON.stringify(contracts.myObject({hello: `hello`, world: `world`, universe: `universe`}))}`);
  print(`${toCode("contracts.myObject({world: `world`}))")}<br>=> ${JSON.stringify(contracts.myObject({world: `world`}))}`);
  print(`${obj2}<br>=> ${JSON.stringify(contracts.myTypedObject({first: ``, second: 42}))}`);
  
  // specified objects
  print(`!!<h3>Contract: myTypedObject</h3>`,
    `${toCode("contracts.myTypedObject({first: `The meaning of life may well be`, second: 42})")}
    <br>=> ${
      JSON.stringify(contracts.myTypedObject({first: `The meaning of life may well be`, second: 42}, {reportViolation: true}))}`,
    `${toCode("contracts.myTypedObject({first: 42}, { reportViolation: true })")}<br>=> ${
      JSON.stringify(contracts.myTypedObject({first: 42}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({second: 42}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({second: 42}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: [], second: `not valid`}, {reportViolation: true})")}
  <br>=> ${
    JSON.stringify(contracts.myTypedObject({first: [], second: `not valid`}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: `The meaning of life`, second: 42, third: `NO!`})")}
  <br>=> ${
    JSON.stringify(contracts.myTypedObject({first: `The meaning of life`, second: 42, third: `NO!`}, {reportViolation: true}))}`);
  
  // numberBetween
  print(`!!<h3>Contract: numberBetween</h3>`,`${toCode("contracts.numberBetween({nr: 17, min: 16, max: 20})")} => ${
    contracts.numberBetween(17, {min: 16, max: 20})}`);
  print(`${toCode("contracts.numberBetween({nr: 15, min: 15, max: 120, inclusive: true})")}<br>=> ${
    contracts.numberBetween(15, {min: 15, max: 120, inclusive: true})}`);
  print(`${toCode("contracts.numberBetween({nr: 15, min: 15, max: 120, reportViolation: true})")}<br>=> ${
    contracts.numberBetween(15, {min: 15, max: 120, reportViolation: true})}`);
  print(`${toCode("contracts.numberBetween(149, {min: 150, max: 1200, inclusive: true, reportViolation: true})")}<br>=> ${
    contracts.numberBetween(149, {min: 150, max: 1200, inclusive: true, reportViolation: true})}`);
  
  // divide by zero
  const denominator = contracts.numberNotZero(0, {reportViolation: true});
  const numerator = contracts.number(42);
  print(`!!<h3>Contracts: numberNotZero, divide and divider</h3>`,`<pre class="line-numbers language-javascript">
  <code class=" line-numbers language-javascript">// contracts.numberNotZero returns 1 if the input value is 0
  const denominator = contracts.numberNotZero(0, {reportViolation: true}); //=> ${denominator}
  const numerator = contracts.number(42); // => ${numerator}
  print(numerator/denominator); //=> ${ numerator/denominator }
  print(numerator/contracts.numberNotZero(3)); //=> ${
    42/contracts.numberNotZero(3)}
  print(numerator/contracts.numberNotZero(numerator)); //=> ${
    42/contracts.numberNotZero(42)}
  print(numerator/contracts.numberNotZero(0)); //=> ${
    42/contracts.numberNotZero(0)}
  print(numerator/contracts.numberNotZero()); //=> ${
    42/contracts.numberNotZero(0)}
  // one step beyond
  print(contracts.divide(numerator, {denominator: 0})); //=> ${
    contracts.divide(numerator, {denominator: 0}) } (see console)
  print(contracts.divide(numerator, {denominator: 3})); //=> ${
    contracts.divide(numerator, {denominator: 3}) }
  // another step beyond (note: violations are reported by default (in the console))
  print(contracts.divider([numerator, contracts.numberNotZero(3)])); //=> ${
    contracts.divider([numerator, contracts.numberNotZero(3)]) }
  print(contracts.divider([numerator, 0])); //=> ${
    contracts.divider([numerator, 0]) }
  print(contracts.divider(["fourtyTwo", 0])); //=> ${
    contracts.divider(["fourtyTwo", 0]) }
  print(contracts.divider([undefined, 0])); //=> ${contracts.divider([undefined, 0]) }
  print(contracts.divider([0, undefined])); //=> ${contracts.divider([0, undefined]) }
  print(contracts.divider([0, NaN])); //=> ${contracts.divider([0, NaN]) }
  print(contracts.divider([NaN, 0])); //=> ${contracts.divider([NaN, 0]) }
  print(contracts.divider()); //=> ${ contracts.divider() }</code></pre>`);
  
  print(`!!<h3>shouldThrow = true</h3>`,`<pre class="line-numbers language-javascript">
  <code class=" line-numbers language-javascript">try {
    const myNumberTrial = contracts.numberBetween(
      100, {
      min: 150,
      max: 1200,
      inclusive: true,
      shouldThrow: true, } );
  } catch(err) {
    console.error([err.name, err.stack.replace(\`\${err.name}: \`, "")].join("\\n"));
  }</code></pre>`
  );
  
  try {
    const num = contracts.numberBetween(100, {min: 150, max: 1200, inclusive: true, shouldThrow: true});
  } catch(err) {
    console.error([err.name, err.stack.replace(`${err.name}: `, ``)].join(`\n`));
    print(`!!=> <b class="warn">${err.name} thrown</b><pre class="noTopMargin">${err.message}</pre>`); }
}

function styleDocument() {
  $.editCssRules(
    `.q {
      padding: 0 6rem 0px 2rem;
      font-family: Georgia, verdana;
      font-style: italic;
      color: #777;
      margin-bottom: 1rem;
      max-width: 70%;
    }`,
    `.q:before {
      font-family: Georgia, verdana;
      content: '\\201C';
      position: absolute;
      font-size: 2rem;
      color: #c0c0c0;
      margin-left: -2rem;
      margin-top: 0.5rem;
     }`,
    `h3 {
      color: cornflowerblue;
      padding: 3px 6px;
      border: 1px dotted #999;
      display: inline-block;
      margin: 1rem auto 0.5rem auto;
    }`,
    `pre.noTopMargin { margin-top: 0; }`,
    `.q a { font-style: normal; }`,
    `.q div:not(first-child) { margin-top: 0.7rem; }`,
    `.head div, .head pre, pre { font-weight: normal; color: #777; }`,
    `.head h2, .head h3 { line-height: 1.2em; }`,
    `#log2screen li {vertical-align: top}`,
    `code {
      background-color: revert;
      color: revert;
      max-width: 90%;
    }`,
    `.violation { margin-top: -0.8rem; }`,
    `button.explainer {
      font-weight: bold;
      cursor: pointer;
      color: #555;
    }`,
    `button.explainer:before {
      content: 'Close ';
    }`,
    `button.explainer.closed:before {
      content: 'Open ';
    }`,
    `button.explainer:after {
      content: ' \\25b2';
    }`,
    `button.explainer.closed:after {
      content: ' \\25bc';
    }`,
    `#ViolationsReport {
      display: none;
    }`,
    `.violationReport {
      padding: 1.3rem;
    }`,
    `.explainerCode {
      max-height: calc(100% - 1px);
      max-width: calc(100% - 1px);
      opacity: 1;
      transition: all 1s ease-in-out;
    }`,
    `.explainerCode.closed {
      max-height: 0;
      max-width: 0;
      opacity: 0;
      position: absolute;
      overflow: hidden;
    }`,
    `code.inline {
      color: green;
      background-color: #eee;
      padding: 2px;
      font-family: monospace;
    }`,
    `.warn { color: red; }`,
    `.container {
      inset: 0;
      position: absolute;
      overflow-x: hidden;
    }`,
    `#log2screen {
      margin: 0 auto;
      & li div {
        line-height: 1.4rem;
      }
      @media (max-width: 1024px) {
        max-width: 90vw;
      }
      @media (min-width: 1024px) and (max-width: 1200px) {
        max-width: 80vw;
      }
      @media (min-width: 1200px) and (max-width: 1600px) {
        max-width: 70vw;
      }
      @media (min-width: 1600px) {
        max-width: 50vw;
      }
    }`
  );
}