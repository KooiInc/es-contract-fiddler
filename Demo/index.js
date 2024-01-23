import $ from "jqlmodule";
import extendSymbolic from "protoxt";
import dateFiddlerFactory from "datefiddler";
import dtFormat from "intl-dateformatter";
import regexhelper from "jsregexphelper";
const xDate = dateFiddlerFactory(dateFiddlerExtentions);
const dtDiffCalc = dateDiffFactory();
const IS = $.IS;
setDefaultStyling();
fixSBLinks2TopProblem();
export { $, logFactory, regexhelper, xDate, dtFormat, dtDiffCalc, extendSymbolic };

function fixSBLinks2TopProblem() {
  // fix for stackblitz rewriting hrefs with target _top (see README)
  console.info(`✔ Stackblitz rewrites links to _top. The 'stackblitzhelpers' module fixed it.`);
  document.addEventListener(`click`, evt => {
    if (evt.target.href) {
      const ref = evt.target;
      if (ref.dataset.top || ref.classList.contains(`internalLink`) || ref.target === `_top`) {
        return top.location.href = ref.href;
      }
    }
    return true;
  });
}

function logFactory(formatJSON = true) {
  const logContainer = $(`<ul id="log2screen"/>`);
  const toJSON = content => tryJSON(content, formatJSON);
  const createItem = t => $(`${t}`.startsWith(`!!`) ? `<li class="head">` : `<li>`);
  const logPosition = {top: logContainer.prepend, bottom: logContainer.append};
  const cleanContent = content => !$.IS(content, String, Number) ? toJSON(content) : `${content}`;
  const writeLogEntry = content => createItem(content).append( $(`<div>${content?.replace(/^!!/, ``)}</div>`) );
  const logItem = (pos = `bottom`) => content => logPosition[pos]( writeLogEntry(cleanContent(content)) );
  return {
    log: (...txt) => txt.forEach( logItem() ),
    logTop: (...txt) => txt.forEach( logItem(`top`) ), };
}

function tryJSON(content, formatted) {
  try { return formatted ? `<pre>${JSON.stringify(content, null, 2)}</pre>` : JSON.stringify(content); }
  catch(err) {return `Some [Object object] can not be converted to JSON`}
}

function dateFiddlerExtentions(instance) {
  const add = toAdd => instance.add(toAdd);
  return {
    nextWeek: _ => add(`7 days`),
    previousWeek: _ => add("-7 days"),
    addWeeks: (n = 1) => add(`${n * 7} days`),
    nextYear: _ => add("1 year"),
    previousYear: _ => add("-1 year"),
    addYears: (n = 1) => add(`${n} years`),
    nextMonth: _ => add("1 month"),
    previousMonth: _ => add("-1 month"),
    addMOnths: (n = 1) => add(`${n} months`),
    tomorrow: _ => add("1 day"),
    yesterday: _ => add("-1 day"),
    addDays: (n = 1) => add(`${n} days`),
  };
}

function dateDiffFactory() {
  const checkParams = (start, end) => {
    if (!end && !start || (!IS(start, Date) || !IS(end, Date)) ) {
      const [message, full, clean] = Array(3).fill(`please provide a (valid) start and end Date!`);
      return { error: true, message, full, clean };
    }

    if (!end) {
      const [message, full, clean] = Array(3).fill(`please provide a (valid) end Date!`);
      return { error: true, message, full, clean };
    }

    if (!start) {
      const [message, full, clean] = Array(3).fill(`please provide a start Date!`);
      return { error: true, message, full, clean };
    }

    return { error: false };
  };

  const stringify = stringifyComposed();

  return function getDifference({start, end} = {}) {
    const checks = checkParams(start, end);
    if (checks.error) { return checks; }
    const date1 = new Date(start);
    const date2 = new Date(end);
    const differenceMs = Math.abs(date2 - date1);
    const differenceDate = new Date(differenceMs);
    const years = differenceDate.getUTCFullYear() - 1970;
    const months = differenceDate.getUTCMonth();
    const days = differenceDate.getUTCDate() - 1;
    const seconds = Math.floor((differenceMs / 1000 % 3600) % 60);
    const minutes =  Math.floor(differenceMs / 60_000 % 60);
    const hours = Math.floor( differenceMs / 3_600_000 % 24);
    const milliseconds = Math.floor( differenceMs % 1000);
    const diffs = { years, months, days, hours, minutes, seconds, milliseconds };
    diffs.full = stringify({values: diffs, full: true});
    diffs.clean = stringify({ values: diffs });
    return diffs;
  };

  function stringifyComposed() {
    const pipe = (...functions) => initial => functions.reduce((param, func) => func(param), initial);
    const singleOrMultiple = (numberOf, term) => (numberOf === 1 ? term.slice(0, -1) : term);
    const filterRelevant = ({values, full}) =>
      [Object.entries(values).filter( ([key, ]) => /^(years|month|days|hours|minutes|seconds)/i.test(key)), full];
    const aggregateDiffs = ([diffs, full]) =>
      full ? diffs : diffs.filter(([, value]) => full ? +value : value > 0);
    const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value])  =>
      [...acc, `${value} ${singleOrMultiple(value, key)}`], [] );
    const diffs2SingleString = diffStrings  => diffStrings.length < 1
      ? `Dates are equal` : `${diffStrings.slice(0, -1).join(`, `)}${
        diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
    return pipe(filterRelevant, aggregateDiffs, stringifyDiffs, diffs2SingleString);
  }
}

function setDefaultStyling() {
  $.editCssRules(...[
    `body { 
      font: normal 14px/17px  system-ui, sans-serif;
      margin: 1rem;
     }`,
    `code {
      color: green;
      background-color: #eee;
      padding: 2px;
      font-family: monospace;
    }`,
    `code.codeblock {
      display: block;
      padding: 6px;
      border: 1px solid #999;
      margin: 0.5rem 0; 
      background-color: #eee;
      white-space: pre-wrap;
    }`,
    `h3 {marginTop: 1.5rem;}`,
    `.thickBorder {
      border: 5px solid green;
      borderWidth: 5px;
      padding: 0.5rem;
      display: inline-block; 
    }`,
    `a.ExternalLink {
      text-decoration: none;
      color: rgb(0, 0, 238);
      background-color: #EEE;
      padding: 3px;
      font-weight: bold;
    }`,
    `.cmmt {
      color: #888;
    }`,
    `.hidden {display: none;}`,
    `.attention {color: red; font-size: 1.2em; font-weight: bold;}`,
    `#log2screen li { 
      listStyle: '\\2713'; 
      paddingLeft: 6px; 
      margin: 0.5rem 0 0 -1.2rem; 
      font-family: monospace 
    }`,
    `#log2screen li.head {
      list-style-type: none;
      font-weight: bold;
      margin-top: 0.8rem;
      margin-bottom: -0.2rem;
      font-family: revert;
    }`,
    `.err {fontStyle: italic; color: red; }`,
    `a {text-decoration:none; font-weight:bold;}`,
    `a:hover {text-decoration: underline;}`,
    `a[target]:before, a.internalLink:before, a.externalLink:before {
      color: rgba(0,0,238,0.7);
      font-size: 1.1rem;
      padding-right: 2px;
      vertical-align: baseline;
     }`,
    `a[target="_blank"]:before, a.externalLink:before {
      content: '\\2197';
     }`,
    `a[data-top]:before, a.internalLink:before, a[target="_top"]:before {
      content: '\\21BA';
     }`,
  ]);
}