export default styleDocument;

function styleDocument($) {
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
    `span.toTop {
      position: fixed;
      top: 20px;
      cursor: pointer;
      &:after {
        content: '\\261D';
        padding: 4px;
        font-size: 2rem;
        display: inline-block;
      }
    }`,
    `h3[data-id] { scroll-margin-top: 20px; }`,
    `h3.between {
      color: cornflowerblue;
      margin: -0.5rem 0 -0.5rem 0;
      display: inline-block;
      border: none;
     }`,
    `#log2screen div.index {
       margin-top: 1.5rem;
       border: 1px dotted #999;
       padding: 8px;
       margin-left: -1em;
       ul {
         margin: 0.4em 0 0 -1.3em;
         li[data-index-click] {
            list-style: none;
            &:before {
              content: '\\2B0A';
              display: inline-block;
              margin-right: 8px;
            }
            margin-top: 0.2em;
            cursor: pointer;
            &:hover {
              color: blue;
              text-decoration: underline;
         }
       }
      }
    }`,
    `pre.codebox {
      box-shadow: 2px 2px 6px #555;
      border-radius: 6px;
      max-height: 500px;
      overflow: auto;
    }`,
    `code.hljs {
      max-width: 100%;
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
    `.violationPopup { padding: 0 1rem; }`,
    `.explainerCode {
      max-height: 800px;
      max-width: calc(100% - 1px);
      opacity: 1;
      overflow: auto;
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
      background-color: rgb(227, 230, 232);
      color: rgb(12, 13, 14);
      padding: 0 4px;
      display: inline-block;
      border-radius: 4px;
      margin: 1px 0;
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
