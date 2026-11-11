
# Copyright (c) 2026, sanjay and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today, date_diff


class TravelManagementRequest(Document):

    def before_insert(self):
        """Set default status when creating a new request."""
        self.status = "Pending"

    def validate(self):
        """Perform server-side validations before saving."""

        # 1. Prevent Travel Users from editing existing requests
        if not self.is_new():

            user_roles = frappe.get_roles(frappe.session.user)

            if (
                "Travel User" in user_roles
                and "System Manager" not in user_roles
                and frappe.session.user != "Administrator"
            ):
                frappe.throw(
                    "You are not allowed to modify an existing travel request."
                )

        # 2. Validate Applicant Name
        if not self.applicant_name or not self.applicant_name.strip():
            frappe.throw("Applicant Name is mandatory.")

        # 3. Validate Destination
        if not self.destination or not self.destination.strip():
            frappe.throw("Destination is mandatory.")

        # 4. Validate From Date
        if not self.from_date:
            frappe.throw("From Date is mandatory.")

        # 5. Validate To Date
        if not self.to_date:
            frappe.throw("To Date is mandatory.")

        from_date = getdate(self.from_date)
        to_date = getdate(self.to_date)
        current_date = getdate(today())

        # From Date cannot be earlier than today
        if from_date < current_date:
            frappe.throw("From Date cannot be earlier than today.")

        # To Date cannot be earlier than From Date
        if to_date < from_date:
            frappe.throw("To Date cannot be earlier than From Date.")

        # 6. Calculate Total Days (inclusive)
        self.total_days = date_diff(to_date, from_date) + 1

        # 7. Validate Number of Travellers
        if (
            self.number_of_travellers is None
            or self.number_of_travellers < 1
        ):
            frappe.throw("Number of Travellers must be at least 1.")

        if self.number_of_travellers > 10:
            frappe.throw("Number of Travellers cannot exceed 10.")

        # 8. Validate Estimated Cost
        if self.estimated_cost is None or self.estimated_cost <= 0:
            frappe.throw("Estimated Cost must be greater than zero.")

        if self.estimated_cost > 100000:
            frappe.throw("Estimated Cost cannot exceed ₹1,00,000.")
