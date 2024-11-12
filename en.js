export const values = {
    "hcs": {
        "editor": {
            "title": "Title (optional)",
            "entity": "Entity:",
            "name": "Name (optional)",
            "buttons_position": "Buttons position",
            "title_position": "Title position",
            "disable_standard_buttons": "Disable buttons ?",
            "disable_end_buttons": "Disable end buttons ?",
            "partial_open_buttons_displayed": "Partial open buttons displayed ?",
            "inverted_shutter": "Inverted shutter ?",            
            "always_percentage": "Always percentage ?",
            "can_tilt": "Can Tilt ?",
            "partial_close_percentage": "Partial close percentage",
            "offset_closed_percentage": "Offset closed percentage",
            "shutter_width": "Shutter width in px",

            "tooltip": {
                "disable_standard_buttons": "If 'true', the open, stop and down buttons are not displayed",
                "disable_end_buttons": "If 'true', the end states (opened/closed) will also deactivate the buttons for that direction (i.e. the 'up' button will be disabled when the shutters are fully open)",
                "inverted_shutter": "For reversed buttons : set it to 'true' if your shutter is 100% when it is closed, and 0% when it is opened",
                "always_percentage": "If set to 'true', the end states (opened/closed) will be also as numbers (0 / 100 % ) instead of a text",
                "partial_close_percentage": "Set it to a percentage (0-100) if you want to be able to quickly go to this \"partially closed\" state using a button",
                "offset_closed_percentage": "Set it to a percentage of travel that will still be considered a 'closed' state in the visualization",
            },

            "position": {
                "left": "left",
                "top": "top",
                "bottom": "bottom",
                "right": "right",
            }

        }
    }
};