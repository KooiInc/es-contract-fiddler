import contractFactory from "../es-contract.js";
import {logFactory, $} from "https://unpkg.com/stackblitzhelpers@latest/index.browser.js";
import splat from "https://unpkg.com/splat-es/Bundle/index.min.js";
import styleDocument from "./styleDoc.js";
const textBlocks = await importTexts();
const {contracts, IS,} = contractFactory({reporter: demoReporter});
const isSB = /stackblitz/i.test(location.href);
const { log:print } = logFactory();
const reportDiv = $.div({id:`ViolationsReport`}).append(`<h3>All logged contract violations</h3>`);
createDemo();
window.contracts = contracts;
window.IS = IS;

function createDemo() {
  styleDocument($);
  addContracts4Demo(contracts);
  createHandling();
  createHeaderAndExplanation();
  print(`!!<h2>Examples</h2>`);
  demoSystem();
  demoPlainString();
  demoBool();
  demoNumber();
  demoInt();
  demoArrayOfNumber();
  demoObjects();
  demoTypedObjects();
  demoNumberBetween();
  demoDividers();
  demoThrow();
  hljs.highlightAll(`javascript`);
  createNavigation();
}

function addContracts4Demo(contracts) {
  const { addContracts: addAll } = contracts;
  const allContracts = {
    bool: {
      method: function(val) { return IS(val, Boolean) && val; },
      expected: `input is not a boolean value (true/false)`,
      isBoolean: true,
      reportViolationsByDefault: true,
    },
    number: {
      method: function number(nr) { return IS(nr, Number) && isFinite(nr) && nr; },
      expected({origin}) {
        return `Input should be a number (integer or float) ${origin ? `\n${origin}` : ``}`;
      }, },
    numberBetween: {
      method: numberBetween,
      expected({min, max, inclusive} = {}) {
        min = inclusive && min !== Number.MIN_SAFE_INTEGER ? min - 1 : min;
        max = inclusive && max !== Number.MAX_SAFE_INTEGER ? max + 1 : max;
        return `Input should be a number between (and not including) ${min} and ${max}`;
      },
    },
    myObject: {
      method: myObject,
      expected: `Input is not { hello, world, universe }`,
      reportViolationsByDefault: true,
    },
    plainString: {
      method: plainString,
      expected({extraInfo}) { return `Input is not a string${extraInfo ?  `"\n${extraInfo}` : ``}`; },
      reportViolationsByDefault: true
    },
    int: {
      name: `int`,
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr % 1 === 0 && nr; },
      expected: `Input is not an integer`,
    },
    numberNotZero: {
      method(nr) { return IS(nr, Number) && isFinite(nr) && nr !== 0 && nr},
      expected: `Input is not number < 0 or number > 0`,
      defaultValue: 1,
    },
    stringNotEmpty: {
      method: str => contracts.plainString(str) && str.length > 0,
      expected: `Input is not a non empty string`,
    },
    arrayOfNumbers: {
      method(arr) {
        return IS(arr, Array) && arr.length && !arr.find(v => !IS(v, Number)) ? arr : undefined;
      },
      expected({origin}) { return `Input is not an array containing *only* numbers, and *at least* one number  ${
        origin ?  `\n${origin}` : ``}`; },
      reportViolationsByDefault: true,
    },
    divide: {
      customMessageFn({value, numerator, denominator} = {}) {
        if ( !isFinite( (value ?? numerator)/(denominator ?? 0) ) ) {
          demoReporter(
            [`✘ Contract violation for contract divide`,
             `[input: ${value ?? numerator} / denominator: ${denominator}] is not finite.`,
             `The denominator was 0, so divided the numerator (${value}) by (the default value) 1`]
            .join(`\n   `)
          );
        }
      },
      method: function divide(value, {numerator, denominator} = {}) {
        numerator = value ?? numerator;
        denominator = denominator ?? 1;
        const result = numerator/denominator;
        return result === Infinity ? numerator/1 : result;
      },
    },
    divider: {
      method: divider,
      reportViolationsByDefault: true,
      expected({value}) {
        const [numerator, denominator] = value ?? [,];
        const divisionText = `${numerator} / ${denominator}`;
        const prefix = `The result of [${divisionText}] is not finite`;
        const message = IS(numerator, undefined, null, NaN) && IS(denominator, undefined, null, NaN)
          ? "both numerator and denominator lack a value"
            : IS(numerator, undefined, null, NaN)
              ? `the numerator has no value`
              : IS(denominator, undefined, null, NaN)
                ? `the denominator has no value`
                : IS(denominator, Number) && denominator === 0
                  ? "The denominator can not be zero (0)"
                  : `insufficient input (should be array of 2 numbers)`;
        return `${prefix}\nMain cause: ${message}`;
      },
    },
    myTypedObject: {
      method: function(obj) {
        const expected = {
          first: val => IS(val, String),
          second: val => contracts.int(val), };
        const entries = Object.entries(IS(obj, Object) ? obj : {});
        const typedOk = entries.length === 2 &&
          !Object.entries(expected).find( ([k, v]) => !v(obj[k]));

        return !typedOk ? undefined : obj;
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
  window.contracts = contracts;

  function divider(values) {
    values = (IS(values, Array)
      ? values.length < 2 ? [...Array(2)].map((_, i) => values?.[i]) : values.slice(0, 2)
      : [values || 0, 0]);
    const [numerator, denominator] = values;
    const result = numerator/denominator;

    return isFinite(result) ? result : undefined;
  }

  function plainString(value) {
    return IS(value, String) && value;
  }

  function numberBetween(nr, {min, max, inclusive} = {}) {
    inclusive = IS(inclusive, Boolean) ? +inclusive : 0;
    min = (min || Number.MIN_SAFE_INTEGER + 1) - inclusive;
    max = (max || Number.MAX_SAFE_INTEGER - 1) + inclusive;
    return IS(nr, Number) && isFinite(nr) && nr > min && nr < max && nr;
  }

  function myObject(obj) {
    const keysExpected = `hello,world,universe`.split(`,`);
    return IS(obj, Object) &&
    Object.keys(obj).filter(k => keysExpected.indexOf(k) > -1).length === keysExpected.length
      ? obj : undefined;
  }
  return allContracts;
}

function createHeaderAndExplanation() {
  !isSB && console.clear();
  $(`<div class="container">`).append($.span({class:"top"}), $(`#log2screen`));
  const sbLink = isSB
    ? `<p><a target="_top" href="//stackblitz.com/@KooiInc">All projects</a> | ` : ``;
  const backToRepoLink = `<a target="${isSB ? `_blank` : `_top`}" href="https://codeberg.org/KooiInc/es-contract-fiddler"
      >Repository</a>`;
  const githubLink = `<a target="_blank" href="https://github.com/KooiInc/es-contract-fiddler"
      >@Github</a>`
  print(`!!${splat(textBlocks.pageheader, {sbLink, backToRepoLink, githubLink})}
    <p><button class="explainer closed">explainer</button>
    <button class="showViolations">Show contract violation logs</button></p>`,
    `!!${textBlocks.explainer}`);
}

function createNavigation() {
  const index = $.ul();
  $(`h3`).collection
    .filter(h => h.textContent.startsWith(`Contract`))
    .map(el => {
      el.dataset.id = el.textContent.split(":")[1].trim();
      index.append($.li({data: {indexClick: true, forId: el.dataset.id}}, el.textContent))
    });

  $.div(
    {class: "index"},
    $.h3({class: "between"}, `Index`),
    index )
  .renderTo($(`#log2screen li:nth-child(2)`), $.at.afterend);

  $.span({class: "toTop", title: `back to top`})
    .css({left: `${$(`#log2screen`).dimensions.right - 40}px`})
    .renderTo(document.body);
}

function createHandling() {
  const smooth = {behavior: "smooth"};
  $.delegate( `click`, `.showViolations`, () =>
    $.Popup.show({ content: `<div class="violationPopup">${reportDiv.HTML.get()}</div>` }) );
  $.delegate(`click`, `.explainer`, (_, self) => {
    const closed = `closed`;
    switch(self.hasClass(`closed`)) {
      case true:
        self.removeClass(`closed`);
        return $(`.explainerCode`).removeClass(`closed`);
      default:
        self.addClass(closed);
        return $(`.explainerCode`).addClass(`closed`);
    }
  });
  $.delegate(`click`, `[data-for-id]`, (_, self) => {
    $.node(`[data-id="${self.data.get(`forId`)}"]`)?.scrollIntoView(smooth);
  });
  $.delegate(`click`, `span.toTop`, () => {
    $.node(`.top`)?.scrollIntoView(smooth);
  });
}

function demoSystem() {
  print(
    `!!<h3>System</h3>`,
    codeToFormatted(textBlocks.system),
    `Contracts added, testing demoReporter without input: <code class="inline">demoReporter()</code>
    <br> => ${demoReporter()} (see contract violation logs)`
  );
}

function demoPlainString() {
  const world4TemplateString = `world`;
  print(
    `!!<h3>Contract: plainString</h3>`,
    codeToFormatted(textBlocks.plainString),
    `${toCode("contracts.plainString(`hello`)")} => ${
      contracts.plainString(`hello`) }`,
    `${toCode("contracts.plainString(`hello ${world4TemplateString}`)")} => ${
    contracts.plainString(`hello ${world4TemplateString}`)}`,
    `${toCode("contracts.plainString()")} => ${
    contracts.plainString()}`,
    `${toCode("contracts.plainString([1,2,3])")} => ${contracts.plainString([1,2,3])}`,
    `${toCode("contracts.plainString([1,2,3], {defaultValue: `Nothing`, reportViolation: true})")} => ${
    contracts.plainString([1,2,3], {defaultValue: `Nothing`, reportViolation: true})}`,
    `${toCode("contracts.plainString(undefined, {extraInfo: `**Logged by the 'expected' function in contracts.plainString**`})")}
    <br>=> ${contracts.plainString(undefined, {extraInfo: `**Logged by the 'expected' function in contracts.plainString**`})}`
  );
}

function demoBool() {
  const compareValue = false;
  const {bool} = contracts;
  print(
    `!!<h3>Contract: bool</h3>`,
    codeToFormatted(textBlocks.bool),
    `${toCode("bool()")} => ${bool()}`,
    // noinspection PointlessBooleanExpressionJS
    `${toCode("bool(!!!undefined)")} => ${bool(!!!undefined)}`,
    `${toCode("bool('hello')")} => ${bool(`hello`)}`,
    `${toCode("bool(0)")} => ${bool(0)}`,
    `${toCode("bool(!!0)")} => ${bool(!!0)}`,
    `${toCode("bool(new Boolean())")} => ${bool(new Boolean())}`,
    `${toCode("bool(new Boolean(true))")} => ${bool(new Boolean(true))}`,
    `${toCode("bool(!!`hello`)")} => ${bool(!!`hello`)}`,
    `${toCode("bool([0, 1, 2])")} => ${bool([0, 1, 2])}`,
    `${toCode("bool(true)")} => ${bool(true)}`,
    `${toCode("bool(false)")} => ${bool(false)}`,
    `${toCode("bool(true) === compareValue")} => ${bool(true) === compareValue}`,
    `${toCode("bool(false) === compareValue")} => ${bool(false) === compareValue}`,
    `${toCode("bool(null, {defaultValue: false})")} => ${
      bool(null, {defaultValue: false})}`,
    `${toCode("bool(null, {defaultValue: false}) === compareValue")} => ${
      bool(null, {defaultValue: false})  === compareValue}`,
    `${toCode("bool(compareValue) !== undefined")} => ${
      bool(compareValue) !== undefined }`
  );
}

function demoNumber() {
  print(
    `!!<h3>Contract: number</h3>`,
    codeToFormatted(textBlocks.number),
    `${toCode("contracts.number()")} => ${contracts.number()}`,
    `${toCode("contracts.number(`NaN`, {reportViolation: true})")} => ${
    contracts.number(`NaN`, {reportViolation: true})}`,
    `${toCode("contracts.number(undefined, {defaultValue: 42, reportViolation: true})")} => ${
    contracts.number(undefined, {defaultValue: 42, reportViolation: true})}`,
    `${toCode("contracts.number(13.22)")} => ${contracts.number(13.22)}`,
    `${
    toCode("[1,2,3,4,`not number`,41.9999,5].filter(v => " +
      "<br>&nbsp;&nbsp;contracts.number(v, {origin: `** from array filter lambda **`, reportViolation: true})")}
    <br>=> [${
    [1, 2, 3, 4, `not number`, 41.9999, 5].filter(v =>
      contracts.number(v, {origin: `** from array filter lambda **`, reportViolation: true}))}]`);
}

function demoInt() {
  print(
    `!!<h3>Contract: int</h3>`,
    codeToFormatted(textBlocks.int),

    `${toCode("contracts.int(42)")} => ${contracts.int(42)}`,

    `${toCode("contracts.int(42.1)")} => ${contracts.int(42.1)}`,

    `${toCode("[1,2,3,4,`nothing`,,,41.999,5].filter(contracts.int)")} => [${
    [1,2,3,4,`nothing`,,,41.999,5].filter(contracts.int)}]`,

    `${toCode("[...[1,2,,3,4,`NADA`,,42.1,5]].map(v => contracts.int(v, {defaultValue: NaN}))")}<br>=> [${
    [...[1,2,,3,4,`NADA`,,,42.1,5]].map((v) => contracts.int(v, {defaultValue: NaN}))}]
    <div><b>Note</b>: ${toCode(`Array.map`)} will <i>not</i> process empty slots of an array.</div>
    <div>A <i>copy</i> (${toCode(`[...[1,2,3,4,\`NADA\`,,,42.01,5]]`)}) of the array 
      converts empty slots to slots with value ${toCode(`undefined`)},
      so in that case ${toCode(`{defaultValue: NaN}`)} will be be honored</div>`);
}

function demoArrayOfNumber() {
  const origin4Log = {origin: `** from demo contract.arrayOfNumbers **`};
  print(
    `!!<h3>Contract: arrayOfNumbers</h3>
    <div><b>Note</b>: Violations logged with [origin4Log]</div>`,
    codeToFormatted(textBlocks.arrayOfNumbers),
    `${toCode("contracts.arrayOfNumbers()")} => ${contracts.arrayOfNumbers()}`,
    `${toCode("contracts.arrayOfNumbers([], origin4Log)")} => ${contracts.arrayOfNumbers([], origin4Log)}`,
    `${toCode("contracts.arrayOfNumbers([10, 1000, 3], origin4Log)")} => [${
      contracts.arrayOfNumbers([10, 1000, 3], origin4Log)}]`,
    `${toCode("contracts.arrayOfNumbers([10, \"1000\", 3], origin4Log)")} => ${
      contracts.arrayOfNumbers([10, "1000", 3], origin4Log)}`,
    `${toCode("contracts.arrayOfNumbers({0: 1, 1: 2, 2: 3}, origin4Log)")} => ${
      contracts.arrayOfNumbers({0: 1, 1: 2, 2: 3}, origin4Log)}`
  );
}

function demoObjects() {
  print(
    `!!<h3>Contract: myObject</h3>`,
    codeToFormatted(textBlocks.myObject),
    `${toCode("contracts.myObject({hello: `hello`, world: `world`, universe: `universe`})")}<br>=> ${
      JSON.stringify(contracts.myObject({hello: `hello`, world: `world`, universe: `universe`}))}`,
    `${toCode("contracts.myObject({world: `world`}))")} => ${
      JSON.stringify(contracts.myObject({world: `world`}))}`,
  );
}

function demoTypedObjects() {
  const validObject = {first: "number one", second: 42};
  const invalidObject = {first: 42, second: "number one"};
  const usageExample = (someObj) => {
    switch (true) {
      case !!contracts.myTypedObject(someObj):
        return someObj;
      default:
        return `Input INVALID!`
    }
  };
  print(`!!<h3>Contract: myTypedObject</h3>`);
  print(codeToFormatted(textBlocks.myTypedObject));
  print(`${toCode("contracts.myTypedObject({first: `The meaning of life may well be`, second: 42})")}
    <br>=> ${
    JSON.stringify(contracts.myTypedObject({
      first: `The meaning of life may well be`,
      second: 42
    }, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: 42}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({first: 42}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({second: 42}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({second: 42}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({second: 42.1}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({second: 42.1}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({}, { reportViolation: true })")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: [], second: `not valid`}, {reportViolation: true})")}
  <br>=> ${
    JSON.stringify(contracts.myTypedObject({first: [], second: `not valid`}, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: `The meaning of life`, second: 42, third: `NO!`})")}
  <br>=> ${
    JSON.stringify(contracts.myTypedObject({
      first: `The meaning of life`,
      second: 42,
      third: `NO!`
    }, {reportViolation: true}))}`);
  print(`${toCode("contracts.myTypedObject({first: ``, second: 42}))")}<br>=> ${
    JSON.stringify(contracts.myTypedObject({first: ``, second: 42}))}`);
  print(`${toCode(`contracts.myTypedObject({first: null, second: 42})`)}<br>=> ${
    JSON.stringify(contracts.myTypedObject({first: null, second: 42}))}`);
  print(`${toCode(`contracts.myTypedObject(validObject) !== undefined`)}<br>=> ${
    JSON.stringify(contracts.myTypedObject(validObject) !== undefined)}`);
  print(`${toCode(`contracts.myTypedObject(invalidObject) !== undefined`)}<br>=> ${
    JSON.stringify(contracts.myTypedObject(invalidObject) !== undefined)}`);
  print(`${toCode(`usageExample(validObject)`)}<br>=> ${JSON.stringify(usageExample(validObject))}`);
  print(`${toCode(`usageExample(invalidObject)`)}<br>=> ${JSON.stringify(usageExample(invalidObject))}`);
}

function demoNumberBetween() {
  const isBetween = value => value !== undefined;
  print(`!!<h3>Contract: numberBetween</h3>`,
    toFormattedCode(textBlocks.numberBetween),
    `${toCode("contracts.numberBetween({nr: 17, min: 16, max: 20})")} => ${
    contracts.numberBetween(17, {min: 16, max: 20})}`,
    `${toCode("contracts.numberBetween({nr: 15, min: 15, max: 120, inclusive: true})")}<br>=> ${
    contracts.numberBetween(15, {min: 15, max: 120, inclusive: true})}`,
    `${toCode("contracts.numberBetween({nr: 15, min: 15, max: 120, reportViolation: true})")}<br>=> ${
    contracts.numberBetween(15, {min: 15, max: 120, reportViolation: true})}`,
    `${toCode("contracts.numberBetween(149, {min: 150, max: 1200, inclusive: true, reportViolation: true})")}<br>=> ${
    contracts.numberBetween(149, {min: 150, max: 1200, inclusive: true, reportViolation: true})}`,
    `${toCode("isBetween(contracts.numberBetween(175, {min: 150, max: 1200, inclusive: true, reportViolation: true}))")}<br>=> ${
    isBetween(contracts.numberBetween(175, {min: 150, max: 1200, inclusive: true, reportViolation: true}))}`,
    `${toCode("isBetween(contracts.numberBetween(42, {min: 150}))")} (actually '> 150') <br>=> ${
    isBetween(contracts.numberBetween(42, {min: 150}))}`,
    `${toCode("isBetween(contracts.numberBetween(42, {max: 100}))")} (actually '< 100') <br>=> ${
    isBetween(contracts.numberBetween(42, {max: 100}))}`
  );
}

function demoDividers() {
  const denominator = contracts.numberNotZero(0, {reportViolation: true});
  const numerator = contracts.number(42);
  print(`!!<h3>Contracts: numberNotZero, divide and divider</h3>`);
  print(codeToFormatted(textBlocks.numberNotZero));

  print(codeToFormatted(textBlocks.dividerVars));

  print(
    `${toCode("numerator/denominator")} //=> ${numerator / denominator}`,
    `${toCode("numerator/contracts.numberNotZero(3)")} //=> ${numerator / contracts.numberNotZero(3)}`,
    `${toCode("numerator/contracts.numberNotZero(numerator)")} //=> ${numerator / contracts.numberNotZero(42)}`,
    `${toCode("numerator/contracts.numberNotZero(0)")} => ${numerator / contracts.numberNotZero(0)}`,
    `${toCode("numerator/contracts.numberNotZero()")} => ${numerator / contracts.numberNotZero()}`,
  );

  print(
    $.h3({class: `between`, data: {header: true}}, `contracts.divide`),
    codeToFormatted(textBlocks.divide)
  );

  print(
    `${toCode("contracts.divide(numerator, {denominator: 0})")} => ${contracts.divide(numerator, {denominator: 0})}`,
    `${toCode("contracts.divide(numerator, {denominator: 3})")} => ${contracts.divide(numerator, {denominator: 3})}`,
    `${toCode("contracts.divide(numerator)")} => ${contracts.divide(numerator)}`,
  );

  print(
    $.h3({class: `between`, data: {header: true}}, `contracts.divider`),
    codeToFormatted(textBlocks.divider)
  );

  print(
    `${toCode("contracts.divider()")} => ${contracts.divider()}`,
    `${toCode("contracts.divider(numerator, contracts.numberNotZero(3))")} ${
      contracts.divider([numerator, contracts.numberNotZero(3)])}`,
    `${toCode("contracts.divider(numerator, 0)")} => ${contracts.divider([numerator, 0])}`,
    `${toCode('contracts.divider("fourtyTwo", 0)')} => ${contracts.divider(["fourtyTwo", 0])}`,
    `${toCode("contracts.divider(undefined, 0)")} //=> ${contracts.divider([undefined, 0])}`,
    `${toCode("contracts.divider(1000, 2.5)")} //=> ${contracts.divider([1000, 2.5])}`,
    `${toCode("contracts.divider(1000, 999.5)")} //=> ${contracts.divider([1000, 999.5])}`,
    `${toCode("contracts.divider(2.5)")} //=> ${contracts.divider([2.5])}`,
    `${toCode("contracts.divider(2.5, '2.5')")} //=> ${contracts.divider([2.5, "2.5"])}`,
  )
}

function demoThrow() {
  print(`!!<h3>shouldThrow</h3>`);
  print(codeToFormatted(textBlocks.shouldThrow));

  try {
    return contracts.numberBetween(100, {min: 150, max: 1200, inclusive: true, shouldThrow: true});
  } catch(err) {
    console.error([err.name, err.stack.replace(`${err.name}: `, ``)].join(`\n`));
    print(`!!=> <b class="warn">${err.name} thrown</b><pre class="noTopMargin">${err.message}</pre>`); }
}

function demoReporter(violationInfo) {
  const infoOk = contracts.plainString(
    violationInfo,
    { extraInfo: `** Origin demo.js/demoReporter **` }
  );
  return infoOk ? reportDiv.append($.pre(infoOk)) : undefined;
}

function codeToFormatted(codeStr) {
  return `!!<pre class="codebox"><code class="hljs language-javascript">${
    codeStr.trim()}</code></pre>`;
}

function toFormattedCode(str) {
  return `!!
    <pre class="codebox"><code class="hljs language-javascript">${
    cleanupFn(str)}</code></pre>`;
}

function cleanupFn(str) {
  return str.trim().replace(/ {3,}(\w)/g, `  $1`).replace(/\n\s+}/, `\n}`);
}

function toCode(str) {
  return `<code class="inline">${str}</code>`;
}

async function importTexts() {
  return await fetch(`./textblocks.html`)
    .then(res => res.text())
    .then(res => {
       $.allowTag(`template`);
       return getTextblocks($.div({html: res}));
    });
}

function getTextblocks(templates) {
  const textBlocks = templates.find(`template[id]`);

  return [...textBlocks].reduce( (acc, block) => {
    return {
      ...acc,
      [block.id]: block.dataset.isHtml ? block.innerHTML : block.content.textContent,
    };
  }, {});
}
