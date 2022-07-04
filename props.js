// JavaScript
define(["qlik"], function
    (qlik) {

    return {

        customProps: function () {
            return {
                label: "Extension Settings",
                type: "items",
                items: [
                    /* {
                        ref: "prop_cbLabel",
                        label: "Label for checkbox",
                        type: "string",
                        expression: "optional",
                        defaultValue: "Drill to detail"
                    },*/ {
                        component: "switch",
                        type: "boolean",
                        ref: "pShowSysVar",
                        label: "Show System Variables",
                        defaultValue: true,
                        options: [
                            { value: true, label: "Enabled" },
                            { value: false, label: "Disabled" }
                        ]
                    }
                ]
            }
        }
	}
})
