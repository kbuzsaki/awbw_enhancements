OptionsReader.instance().onOptionsReady((options) => {
    let calculatorButton = document.querySelector(".calculator-toggle");
    if (calculatorButton) {
        let toggleKeyCodes = options.options_bindings_toggle_calculator;
        if (!toggleKeyCodes || toggleKeyCodes.length === 0) {
        }

        document.addEventListener("keydown", (event) => {
            if (toggleKeyCodes.includes(event.keyCode)) {
                calculatorButton.click();
            }
        });
    }
});

