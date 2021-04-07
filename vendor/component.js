import Vue from './appImport.js';


const component = Vue.component('what', {
    template: /* html */ `
    
    <div class="hello">
      <h1>{{ msg }}</h1>
      <p>
        <br />
      </p>
      <h3>
        <a href="https://vno.land" target="_blank" rel="noopener">vno.land</a> &
        <a
          href="https://github.com/oslabs-beta/vno"
          target="_blank"
          rel="noopener">
          github
        </a>
      </h3>
      <ul>
        <br />
      </ul>
    </div>
  `,
    name: 'what',
    props: {
      msg: String,
    },
  });
  
  const App = new Vue({
    template: /* html */ `
<html>
<head>
    <div id="app">

      <img
        src="https://svgshare.com/i/SNz.svg"
        alt="image"
        border="0"
        width="450"
        height="450"
      />
      <what msg="you are building: ssr with vno" />
    </div>
    </head>
    </html>
  `,
    name: 'app',
    components: { component },
  });


  App.$mount("#app")
export default App