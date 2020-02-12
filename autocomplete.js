const createAutoComplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
  dropdownBorderCssClass
}) => {
  root.innerHTML = `
    <input type="search" class="input is-info" placeholder="Search"/>
    <div class="dropdown">
        <div class="dropdown-menu">
            <div 
            ${dropdownBorderCssClass ? "" : 'style="border: 1px solid black"'} 
            class="dropdown-content results ${dropdownBorderCssClass}">
            </div>
        </div>
    </div>
    `;

  const input = root.querySelector("input");
  const dropdown = root.querySelector(".dropdown");
  const resultsWrapper = root.querySelector(".results");

  const onInput = async event => {
    const items = await fetchData(event.target.value);

    if (!items.length) {
      dropdown.classList.remove("is-active");
      return;
    }

    resultsWrapper.innerHTML = "";
    dropdown.classList.add("is-active");
    for (let item of items) {
      const option = document.createElement("a");

      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item);
      option.addEventListener("click", () => {
        dropdown.classList.remove("is-active");
        input.value = inputValue(item);
        onOptionSelect(item);
      });

      resultsWrapper.appendChild(option);
    }
  };

  // call api every time an input is detected on the input element
  input.addEventListener("input", debounce(onInput, 700));

  // watch for clicks on all elemets, if element is not a child of dropdown close the dropdown element
  document.addEventListener("click", event => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove("is-active");
    }
  });
};
