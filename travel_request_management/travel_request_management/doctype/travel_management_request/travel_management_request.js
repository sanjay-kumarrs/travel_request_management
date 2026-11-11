
// Copyright (c) 2026, sanjay and contributors
// For license information, please see license.txt

frappe.ui.form.on('Travel Management Request', {

    // 1. Set default values when creating a new request
    onload: function(frm) {

        if (frm.is_new()) {

            // Set From Date to today
            if (!frm.doc.from_date) {
                frm.set_value('from_date', frappe.datetime.get_today());
            }

            // Set Status to Pending
            if (!frm.doc.status) {
                frm.set_value('status', 'Pending');
            }
        }
    },

    // 2. Make saved requests read-only for Travel User
    refresh: function(frm) {

        let user_roles = frappe.user_roles || [];

        let is_travel_user = user_roles.includes('Travel User');
        let is_system_manager = user_roles.includes('System Manager');

        // Only restrict existing requests for Travel User
        // System Manager must remain able to edit all fields
        if (is_travel_user && !is_system_manager && !frm.is_new()) {

            let fields = [
                'applicant_name',
                'travel_type',
                'from_date',
                'to_date',
                'destination',
                'number_of_travellers',
                'estimated_cost',
                'purpose',
                'status',
                'total_days'
            ];

            fields.forEach(function(field) {
                frm.set_df_property(field, 'read_only', 1);
            });

            frm.refresh_fields();
        }

        if (is_system_manager && !frm.is_new()) {

            let fields = [
                'applicant_name',
                'travel_type',
                'from_date',
                'to_date',
                'destination',
                'number_of_travellers',
                'estimated_cost',
                'purpose',
                
                'total_days'
            ];

            fields.forEach(function(field) {
                frm.set_df_property(field, 'read_only', 1);
            });

            if (
            frm.doc.status === 'Approved' ||
            frm.doc.status === 'Rejected'
        ) {
            frm.set_df_property('status', 'read_only', 1);
        } else {
            frm.set_df_property('status', 'read_only', 0);
        }

            frm.refresh_fields();
        }
    },

    // 3. Validate fields before saving
    validate: function(frm) {

        // From Date cannot be earlier than today
        if (frm.doc.from_date &&
            frm.doc.from_date < frappe.datetime.get_today()) {

            frappe.msgprint({
                title: __('Invalid From Date'),
                message: __('From Date cannot be earlier than today.'),
                indicator: 'red'
            });

            frappe.validated = false;
            return;
        }

        // To Date must be greater than or equal to From Date
        if (frm.doc.from_date && frm.doc.to_date &&
            frm.doc.to_date < frm.doc.from_date) {

            frappe.msgprint({
                title: __('Invalid To Date'),
                message: __('To Date must be greater than or equal to From Date.'),
                indicator: 'red'
            });

            frappe.validated = false;
            return;
        }

        // Number of Travellers must be at least 1
        if (!frm.doc.number_of_travellers ||
            frm.doc.number_of_travellers < 1) {

            frappe.msgprint({
                title: __('Invalid Number of Travellers'),
                message: __('Number of Travellers must be at least 1.'),
                indicator: 'red'
            });

            frappe.validated = false;
            return;
        }

        // Estimated Cost must be greater than zero
        if (!frm.doc.estimated_cost ||
            frm.doc.estimated_cost <= 0) {

            frappe.msgprint({
                title: __('Invalid Estimated Cost'),
                message: __('Estimated Cost must be greater than zero.'),
                indicator: 'red'
            });

            frappe.validated = false;
            return;
        }
    },

    // 4. Display message when Emergency travel is selected
    travel_type: function(frm) {

        if (frm.doc.travel_type === 'Emergency') {

            frappe.msgprint({
                title: __('Emergency Travel'),
                message: __('You have selected Emergency travel. Please ensure that the travel details are accurate.'),
                indicator: 'orange'
            });
        }
    }

});
