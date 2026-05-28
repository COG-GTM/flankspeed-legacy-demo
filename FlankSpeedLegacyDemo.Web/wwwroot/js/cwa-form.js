// MIGRATION NOTE [PowerApp]: This jQuery conditional logic maps directly to Power Fx.
// In Power Apps, you would set the Visible property of controls using If() expressions.
// Example: Justification field Visible = If(dropdownPriority.Selected.Value = "Critical", true, false)
// Example: BuildingNumber field Visible = If(dropdownCategory.Selected.Value = "Facility Access Request", true, false)

$(document).ready(function() {
    function toggleConditionalFields() {
        var priority = $('#Priority').val();
        var category = $('#CategoryId option:selected').text();

        // Show Justification when Priority is Critical
        if (priority === 'Critical') {
            $('#justification-section').show();
        } else {
            $('#justification-section').hide();
        }

        // Show Building/Access fields when Category is Facility Access Request
        if (category === 'Facility Access Request') {
            $('#facility-section').show();
        } else {
            $('#facility-section').hide();
        }
    }

    $('#Priority').change(toggleConditionalFields);
    $('#CategoryId').change(toggleConditionalFields);
    toggleConditionalFields(); // Run on page load for Edit form
});
