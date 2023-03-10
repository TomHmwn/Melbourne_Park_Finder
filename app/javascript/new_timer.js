
document.addEventListener("turbo:load", () => {
  var myFormHtml = document.getElementById('timer-form').innerHTML;

 document.getElementById("new-timer").innerHTML = `
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="new-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      </g>
    </svg>
    <div class = "label-container">
      <span class="new-timer__label">${myFormHtml}</span>
    </div>
  </div>
`;
});
