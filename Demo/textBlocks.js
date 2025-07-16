export default {
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
      <b>Static typing shrinks the set of invalid inputs, but does not necessarily eliminate them.</b>
      <a target="_blank" href="//james.diacono.com.au/design_by_contract.html">Source</a>
      </div>
    </div>
    <div>
      This library enables a programmer to create contracts for variables to use in code.
      <br>For every contract created, violations may be reported (by default or on demand).
      <br>Every contract therefore may be created including information about what was expected.<br>
      In the examples, a custom violation reporting function is used. Click 'Show contract violation logs' 
      to inspect the report.<br>
      Click "Open explainer" to open explanation and code for the contracts used in this demo.<br>
    </div>
    <div>
      The library uses (and exports the main method <code class="inline">IS</code> of) the 
      <a target="_blank" href="https://www.npmjs.com/package/typeofanything"
      >typeofanything</a> module to determine variable types.
    </div>
    <div>The demo uses the <a target="_blank" href="https://www.npmjs.com/package/stackblitzhelpers"
      >stackblitz helper module</a>`,
};
