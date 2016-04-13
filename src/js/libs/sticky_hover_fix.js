$(function() {
    // Sticky hover fix
    // Check if the device supports touch events
    if ('ontouchstart' in document.documentElement) {
        // Loop through each stylesheet
        for (var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
            var sheet = document.styleSheets[sheetI];
            // Verify if cssRules exists in sheet
            if (sheet.cssRules) {
                // Loop through each rule in sheet
                for (var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
                    var rule = sheet.cssRules[ruleI];
                    // Verify rule has selector text
                    if (rule.selectorText) {
                        // Replace hover psuedo-class with active psuedo-class
                        rule.selectorText = rule.selectorText.replace(':hover', ':active');
                    }
                }
            }
        }
    }
});
