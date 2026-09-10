/* ============================================================
   SHARED EXPENSE MANAGER
   DAILY EXPENSE TRACKER
============================================================ */


/* ============================================================
   SUPABASE CONFIG
============================================================ */

const SUPABASE_URL =
    "https://sdkhtfovazarqvzplagq.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2h0Zm92YXphcnF2enBsYWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQzMDA1OCwiZXhwIjoyMTA0MDA2MDU4fQ.Rf9sKrsoua5Am_4AwHX2Qdib4NmOzOzBaRfyJndLt9M";


const sharedSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let sharedExpenses = [];

let filteredSharedExpenses = [];

let editingSharedId = null;

let deletingSharedId = null;


/* ============================================================
   FORMAT MONEY
============================================================ */

function formatSharedMoney(amount) {

    return "₹" + Number(amount || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* ============================================================
   TODAY
============================================================ */

function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* ============================================================
   CURRENT DATE DISPLAY
============================================================ */

function setSharedCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }

    const date = new Date();

    element.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* ============================================================
   LOAD EXPENSE TYPES
============================================================ */

async function loadSharedExpenseTypes() {

    const {
        data,
        error
    } =
        await sharedSupabase
            .from("shared_expense_types")
            .select("*")
            .order("name", {
                ascending: true
            });


    if (error) {

        console.error(
            "Shared expense type error:",
            error
        );

        showSharedToast(
            "Error",
            "Unable to load shared expense types."
        );

        return;

    }


    const select =
        document.getElementById(
            "sharedExpenseType"
        );

    const filter =
        document.getElementById(
            "sharedTypeFilter"
        );

    const editSelect =
        document.getElementById(
            "editSharedType"
        );


    if (select) {

        select.innerHTML =
            `<option value="">
                Select Expense Type
             </option>`;

    }


    if (filter) {

        filter.innerHTML =
            `<option value="ALL">
                All Types
             </option>`;

    }


    if (editSelect) {

        editSelect.innerHTML = "";

    }


    (data || []).forEach(type => {

        const option =
            document.createElement("option");

        option.value = type.name;

        option.textContent = type.name;

        select?.appendChild(option);


        const filterOption =
            document.createElement("option");

        filterOption.value = type.name;

        filterOption.textContent = type.name;

        filter?.appendChild(filterOption);


        const editOption =
            document.createElement("option");

        editOption.value = type.name;

        editOption.textContent = type.name;

        editSelect?.appendChild(editOption);

    });

}


/* ============================================================
   LOAD SHARED EXPENSES
============================================================ */

async function loadSharedExpenses() {

    const {
        data,
        error
    } =
        await sharedSupabase
            .from("shared_expenses")
            .select("*")
            .order("expense_date", {
                ascending: false
            })
            .order("id", {
                ascending: false
            });


    if (error) {

        console.error(
            "Shared expense loading error:",
            error
        );

        showSharedToast(
            "Error",
            "Unable to load shared expenses."
        );

        return;

    }


    sharedExpenses = data || [];

    applySharedFilters();

    updateSharedSummary();

    updateFollowUp();

}


/* ============================================================
   APPLY FILTERS
============================================================ */

function applySharedFilters() {

    const search =
        (
            document.getElementById(
                "sharedSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const type =
        document.getElementById(
            "sharedTypeFilter"
        )?.value || "ALL";


    const status =
        document.getElementById(
            "sharedStatusFilter"
        )?.value || "ALL";


    filteredSharedExpenses =
        sharedExpenses.filter(expense => {


            const matchesSearch =
                !search ||

                String(
                    expense.person_name || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    expense.description || ""
                )
                .toLowerCase()
                .includes(search);


            const matchesType =
                type === "ALL" ||
                expense.expense_type === type;


            const matchesStatus =
                status === "ALL" ||
                expense.status === status;


            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );

        });


    renderSharedTable();

}


/* ============================================================
   RENDER TABLE
============================================================ */

function renderSharedTable() {

    const tbody =
        document.getElementById(
            "sharedExpenseTableBody"
        );

    const empty =
        document.getElementById(
            "sharedEmptyMessage"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        filteredSharedExpenses.length === 0
    ) {

        if (empty) {
            empty.style.display = "block";
        }

        updateSharedFilteredTotal();

        return;

    }


    if (empty) {
        empty.style.display = "none";
    }


    filteredSharedExpenses.forEach(
        (expense, index) => {


            const tr =
                document.createElement("tr");


            const statusClass =
                expense.status === "PAID"
                    ? "status-paid"
                    : "status-pending";


            const amountClass =
                expense.status === "PAID"
                    ? "paid-amount"
                    : "pending-amount";


            const statusText =
                expense.status === "PAID"
                    ? "Paid"
                    : "Pending";


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <div class="person-name">

                        ${escapeSharedHtml(
                            expense.person_name
                        )}

                    </div>

                    ${
                        expense.phone
                            ? `
                                <small class="text-muted">
                                    ${escapeSharedHtml(
                                        expense.phone
                                    )}
                                </small>
                              `
                            : ""
                    }

                </td>


                <td>
                    ${formatSharedDate(
                        expense.expense_date
                    )}
                </td>


                <td>

                    <span class="badge text-bg-light">

                        ${escapeSharedHtml(
                            expense.expense_type
                        )}

                    </span>

                </td>


                <td class="description-cell">

                    ${escapeSharedHtml(
                        expense.description
                    )}

                </td>


                <td class="amount-cell">

                    ${formatSharedMoney(
                        expense.total_amount
                    )}

                </td>


                <td class="amount-cell">

                    ${formatSharedMoney(
                        expense.my_share
                    )}

                </td>


                <td class="${amountClass}">

                    ${formatSharedMoney(
                        expense.amount_to_receive
                    )}

                </td>


                <td>

                    <span class="status-badge ${statusClass}">

                        ${statusText}

                    </span>

                </td>


                <td class="action-cell no-print">

                    <div class="action-buttons">

                        ${
                            expense.status !== "PAID"
                                ?
                                `
                                <button
                                    type="button"
                                    class="btn btn-sm btn-success"
                                    onclick="markSharedAsPaid(${expense.id})"
                                    title="Mark as Paid">

                                    <i class="fa-solid fa-check"></i>

                                </button>
                                `
                                :
                                ""
                        }


                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            onclick="openEditSharedExpense(${expense.id})"
                            title="Edit">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="openDeleteSharedExpense(${expense.id})"
                            title="Delete">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(tr);

        }
    );


    updateSharedFilteredTotal();

}


/* ============================================================
   FILTERED PENDING TOTAL
============================================================ */

function updateSharedFilteredTotal() {

    const total =
        filteredSharedExpenses
            .filter(expense =>
                expense.status === "PENDING"
            )
            .reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount_to_receive || 0
                    ),
                0
            );


    const element =
        document.getElementById(
            "sharedTablePendingTotal"
        );


    if (element) {

        element.textContent =
            formatSharedMoney(total);

    }

}


/* ============================================================
   SUMMARY
============================================================ */

function updateSharedSummary() {

    const totalEntries =
        sharedExpenses.length;


    const totalAmount =
        sharedExpenses.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.total_amount || 0
                ),
            0
        );


    const pendingAmount =
        sharedExpenses
            .filter(expense =>
                expense.status === "PENDING"
            )
            .reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount_to_receive || 0
                    ),
                0
            );


    const receivedAmount =
        sharedExpenses
            .filter(expense =>
                expense.status === "PAID"
            )
            .reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount_to_receive || 0
                    ),
                0
            );


    document.getElementById(
        "sharedTotalEntries"
    ).textContent = totalEntries;


    document.getElementById(
        "sharedPendingAmount"
    ).textContent =
        formatSharedMoney(pendingAmount);


    document.getElementById(
        "sharedReceivedAmount"
    ).textContent =
        formatSharedMoney(receivedAmount);


    document.getElementById(
        "sharedTotalAmount"
    ).textContent =
        formatSharedMoney(totalAmount);

}


/* ============================================================
   FOLLOW UP
============================================================ */

function updateFollowUp() {

    const container =
        document.getElementById(
            "followUpContainer"
        );


    if (!container) {
        return;
    }


    const pending =
        sharedExpenses.filter(
            expense =>
                expense.status === "PENDING" &&
                Number(expense.amount_to_receive) > 0
        );


    container.innerHTML = "";


    if (pending.length === 0) {

        container.innerHTML = `

            <div class="text-center text-muted py-3">

                <i class="fa-solid fa-circle-check fa-2x mb-2"></i>

                <p class="mb-0">
                    No pending payments.
                </p>

            </div>

        `;

        return;

    }


    pending.forEach(expense => {

        const card =
            document.createElement("div");

        card.className =
            "followup-card";


        card.innerHTML = `

            <div class="followup-header">

                <div>

                    <div class="followup-person">

                        <i class="fa-solid fa-user"></i>

                        ${escapeSharedHtml(
                            expense.person_name
                        )}

                    </div>


                    <div class="followup-meta">

                        ${escapeSharedHtml(
                            expense.description
                        )}

                        •

                        ${formatSharedDate(
                            expense.expense_date
                        )}

                    </div>

                </div>


                <div class="followup-amount">

                    ${formatSharedMoney(
                        expense.amount_to_receive
                    )}

                </div>

            </div>


            <div class="d-flex gap-2 mt-3 flex-wrap">

                ${
                    expense.phone
                        ?
                        `
                        <a
                            href="tel:${encodeURIComponent(
                                expense.phone
                            )}"
                            class="btn btn-sm btn-outline-primary">

                            <i class="fa-solid fa-phone"></i>

                            Call

                        </a>
                        `
                        :
                        ""
                }


                <button
                    type="button"
                    class="btn btn-sm btn-success"
                    onclick="markSharedAsPaid(${expense.id})">

                    <i class="fa-solid fa-check"></i>

                    Mark as Paid

                </button>


                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    onclick="openEditSharedExpense(${expense.id})">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


/* ============================================================
   ADD SHARED EXPENSE
============================================================ */

async function saveSharedExpense(event) {

    event.preventDefault();


    const personName =
        document.getElementById(
            "sharedPersonName"
        ).value.trim();


    const phone =
        document.getElementById(
            "sharedPhone"
        ).value.trim();


    const date =
        document.getElementById(
            "sharedDate"
        ).value;


    const expenseType =
        document.getElementById(
            "sharedExpenseType"
        ).value;


    const description =
        document.getElementById(
            "sharedDescription"
        ).value.trim();


    const totalAmount =
        Number(
            document.getElementById(
                "sharedTotalAmountInput"
            ).value
        );


    const totalPeople =
        Number(
            document.getElementById(
                "sharedTotalPeople"
            ).value
        );


    const myShare =
        Number(
            document.getElementById(
                "sharedMyShare"
            ).value
        );


    const notes =
        document.getElementById(
            "sharedNotes"
        ).value.trim();


    if (!personName) {

        showSharedToast(
            "Error",
            "Please enter the person's name."
        );

        return;

    }


    if (!date) {

        showSharedToast(
            "Error",
            "Please select a date."
        );

        return;

    }


    if (!expenseType) {

        showSharedToast(
            "Error",
            "Please select an expense type."
        );

        return;

    }


    if (!description) {

        showSharedToast(
            "Error",
            "Please enter a description."
        );

        return;

    }


    if (
        !Number.isFinite(totalAmount) ||
        totalAmount <= 0
    ) {

        showSharedToast(
            "Error",
            "Please enter a valid total amount."
        );

        return;

    }


    if (
        !Number.isInteger(totalPeople) ||
        totalPeople < 2
    ) {

        showSharedToast(
            "Error",
            "Total people must be at least 2."
        );

        return;

    }


    if (
        !Number.isFinite(myShare) ||
        myShare < 0 ||
        myShare > totalAmount
    ) {

        showSharedToast(
            "Error",
            "My share must be between ₹0 and the total amount."
        );

        return;

    }


    const otherShare =
        totalAmount - myShare;


    if (otherShare < 0) {

        showSharedToast(
            "Error",
            "Invalid share calculation."
        );

        return;

    }


    const {
        error
    } =
        await sharedSupabase
            .from("shared_expenses")
            .insert({

                person_name: personName,

                phone: phone || null,

                expense_date: date,

                expense_type: expenseType,

                description: description,

                total_amount:
                    Number(totalAmount.toFixed(2)),

                total_people:
                    totalPeople,

                my_share:
                    Number(myShare.toFixed(2)),

                other_share:
                    Number(otherShare.toFixed(2)),

                amount_to_receive:
                    Number(otherShare.toFixed(2)),

                status: "PENDING",

                paid_date: null,

                notes: notes || null

            });


    if (error) {

        console.error(error);

        showSharedToast(
            "Error",
            error.message ||
            "Unable to save shared expense."
        );

        return;

    }


    showSharedToast(
        "Success",
        "Shared expense saved successfully."
    );


    resetSharedForm();

    await loadSharedExpenses();

}


/* ============================================================
   MARK PAID
============================================================ */

async function markSharedAsPaid(id) {

    const today =
        getTodayDate();


    const {
        error
    } =
        await sharedSupabase
            .from("shared_expenses")
            .update({

                status: "PAID",

                paid_date: today,

                updated_at:
                    new Date().toISOString()

            })
            .eq("id", id);


    if (error) {

        console.error(error);

        showSharedToast(
            "Error",
            "Unable to mark payment as paid."
        );

        return;

    }


    showSharedToast(
        "Success",
        "Payment marked as received."
    );


    await loadSharedExpenses();

}


/* ============================================================
   OPEN EDIT
============================================================ */

function openEditSharedExpense(id) {

    const expense =
        sharedExpenses.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!expense) {
        return;
    }


    editingSharedId = id;


    document.getElementById(
        "editSharedId"
    ).value = id;


    document.getElementById(
        "editSharedPerson"
    ).value =
        expense.person_name || "";


    document.getElementById(
        "editSharedPhone"
    ).value =
        expense.phone || "";


    document.getElementById(
        "editSharedDate"
    ).value =
        expense.expense_date || "";


    document.getElementById(
        "editSharedType"
    ).value =
        expense.expense_type || "";


    document.getElementById(
        "editSharedTotal"
    ).value =
        expense.total_amount || "";


    document.getElementById(
        "editSharedPeople"
    ).value =
        expense.total_people || 2;


    document.getElementById(
        "editSharedMyShare"
    ).value =
        expense.my_share || 0;


    document.getElementById(
        "editSharedStatus"
    ).value =
        expense.status || "PENDING";


    document.getElementById(
        "editSharedDescription"
    ).value =
        expense.description || "";


    document.getElementById(
        "editSharedPaidDate"
    ).value =
        expense.paid_date || "";


    document.getElementById(
        "editSharedNotes"
    ).value =
        expense.notes || "";


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "editSharedModal"
            )
        );


    modal.show();

}


/* ============================================================
   UPDATE
============================================================ */

async function updateSharedExpense() {

    const id =
        document.getElementById(
            "editSharedId"
        ).value;


    const personName =
        document.getElementById(
            "editSharedPerson"
        ).value.trim();


    const phone =
        document.getElementById(
            "editSharedPhone"
        ).value.trim();


    const date =
        document.getElementById(
            "editSharedDate"
        ).value;


    const type =
        document.getElementById(
            "editSharedType"
        ).value;


    const total =
        Number(
            document.getElementById(
                "editSharedTotal"
            ).value
        );


    const people =
        Number(
            document.getElementById(
                "editSharedPeople"
            ).value
        );


    const myShare =
        Number(
            document.getElementById(
                "editSharedMyShare"
            ).value
        );


    const status =
        document.getElementById(
            "editSharedStatus"
        ).value;


    const description =
        document.getElementById(
            "editSharedDescription"
        ).value.trim();


    let paidDate =
        document.getElementById(
            "editSharedPaidDate"
        ).value;


    const notes =
        document.getElementById(
            "editSharedNotes"
        ).value.trim();


    if (!personName ||
        !date ||
        !type ||
        !description ||
        total <= 0 ||
        people < 2 ||
        myShare < 0 ||
        myShare > total) {

        showSharedToast(
            "Error",
            "Please enter valid information."
        );

        return;

    }


    if (status === "PAID" && !paidDate) {

        paidDate =
            getTodayDate();

    }


    if (status === "PENDING") {

        paidDate = null;

    }


    const otherShare =
        total - myShare;


    const {
        error
    } =
        await sharedSupabase
            .from("shared_expenses")
            .update({

                person_name: personName,

                phone: phone || null,

                expense_date: date,

                expense_type: type,

                description: description,

                total_amount:
                    Number(total.toFixed(2)),

                total_people:
                    Number(people),

                my_share:
                    Number(myShare.toFixed(2)),

                other_share:
                    Number(otherShare.toFixed(2)),

                amount_to_receive:
                    Number(otherShare.toFixed(2)),

                status: status,

                paid_date: paidDate,

                notes: notes || null,

                updated_at:
                    new Date().toISOString()

            })
            .eq("id", id);


    if (error) {

        console.error(error);

        showSharedToast(
            "Error",
            "Unable to update shared expense."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById(
                "editSharedModal"
            )
        );


    modal?.hide();


    editingSharedId = null;


    showSharedToast(
        "Success",
        "Shared expense updated successfully."
    );


    await loadSharedExpenses();

}


/* ============================================================
   DELETE
============================================================ */

function openDeleteSharedExpense(id) {

    deletingSharedId = id;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "deleteSharedModal"
            )
        );


    modal.show();

}


/* ============================================================
   CONFIRM DELETE
============================================================ */

async function confirmDeleteSharedExpense() {

    if (!deletingSharedId) {
        return;
    }


    const {
        error
    } =
        await sharedSupabase
            .from("shared_expenses")
            .delete()
            .eq("id", deletingSharedId);


    if (error) {

        console.error(error);

        showSharedToast(
            "Error",
            "Unable to delete shared expense."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById(
                "deleteSharedModal"
            )
        );


    modal?.hide();


    deletingSharedId = null;


    showSharedToast(
        "Success",
        "Shared expense deleted."
    );


    await loadSharedExpenses();

}


/* ============================================================
   ADD EXPENSE TYPE
============================================================ */

function openAddSharedTypeModal() {

    document.getElementById(
        "newSharedExpenseType"
    ).value = "";


    document.getElementById(
        "sharedTypeError"
    ).style.display = "none";


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "addSharedTypeModal"
            )
        );


    modal.show();

}


/* ============================================================
   SAVE EXPENSE TYPE
============================================================ */

async function saveSharedExpenseType() {

    const input =
        document.getElementById(
            "newSharedExpenseType"
        );


    const errorElement =
        document.getElementById(
            "sharedTypeError"
        );


    const name =
        input.value.trim();


    if (!name) {

        errorElement.textContent =
            "Please enter an expense type.";

        errorElement.style.display =
            "block";

        return;

    }


    const {
        error
    } =
        await sharedSupabase
            .from("shared_expense_types")
            .insert({

                name: name

            });


    if (error) {

        console.error(error);


        if (
            error.code === "23505"
        ) {

            errorElement.textContent =
                "This expense type already exists.";

        } else {

            errorElement.textContent =
                error.message ||
                "Unable to add expense type.";

        }


        errorElement.style.display =
            "block";

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById(
                "addSharedTypeModal"
            )
        );


    modal?.hide();


    showSharedToast(
        "Success",
        "New shared expense type added."
    );


    await loadSharedExpenseTypes();

}


/* ============================================================
   FORM CALCULATION
============================================================ */

function calculateSharedAmount() {

    const total =
        Number(
            document.getElementById(
                "sharedTotalAmountInput"
            )?.value || 0
        );


    const myShare =
        Number(
            document.getElementById(
                "sharedMyShare"
            )?.value || 0
        );


    const otherShare =
        Math.max(
            0,
            total - myShare
        );


    document.getElementById(
        "previewTotal"
    ).textContent =
        formatSharedMoney(total);


    document.getElementById(
        "previewMyShare"
    ).textContent =
        formatSharedMoney(myShare);


    document.getElementById(
        "previewOtherShare"
    ).textContent =
        formatSharedMoney(otherShare);


    document.getElementById(
        "previewReceive"
    ).textContent =
        formatSharedMoney(otherShare);

}


/* ============================================================
   RESET FORM
============================================================ */

function resetSharedForm() {

    const form =
        document.getElementById(
            "sharedExpenseForm"
        );


    form?.reset();


    document.getElementById(
        "sharedDate"
    ).value =
        getTodayDate();


    document.getElementById(
        "sharedTotalPeople"
    ).value = 2;


    calculateSharedAmount();

}


/* ============================================================
   FILTER CLEAR
============================================================ */

function clearSharedFilters() {

    document.getElementById(
        "sharedSearch"
    ).value = "";


    document.getElementById(
        "sharedTypeFilter"
    ).value = "ALL";


    document.getElementById(
        "sharedStatusFilter"
    ).value = "ALL";


    applySharedFilters();

}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatSharedDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeSharedHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   TOAST
============================================================ */

function showSharedToast(title, message) {

    const titleElement =
        document.getElementById(
            "sharedToastTitle"
        );


    const messageElement =
        document.getElementById(
            "sharedToastMessage"
        );


    titleElement.textContent =
        title;


    messageElement.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            document.getElementById(
                "sharedToast"
            ),
            {
                delay: 3000
            }
        );


    toast.show();

}


/* ============================================================
   PDF DOWNLOAD
============================================================ */

function downloadSharedExpensePDF() {

    const now =
        new Date();


    document.getElementById(
        "sharedPrintDate"
    ).textContent =
        now.toLocaleString(
            "en-IN"
        );


    window.print();

}


/* ============================================================
   NAVIGATION
============================================================ */

function goToHome() {

    window.location.href =
        "index.html";

}


function goToExpenses() {

    window.location.href =
        "expense.html";

}


function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


/* ============================================================
   EVENT LISTENERS
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {


        setSharedCurrentDate();


        document.getElementById(
            "sharedDate"
        ).value =
            getTodayDate();


        await loadSharedExpenseTypes();


        await loadSharedExpenses();


        calculateSharedAmount();


        /* FORM */

        document.getElementById(
            "sharedExpenseForm"
        )
        ?.addEventListener(
            "submit",
            saveSharedExpense
        );


        /* CALCULATIONS */

        document.getElementById(
            "sharedTotalAmountInput"
        )
        ?.addEventListener(
            "input",
            calculateSharedAmount
        );


        document.getElementById(
            "sharedMyShare"
        )
        ?.addEventListener(
            "input",
            calculateSharedAmount
        );


        /* FILTERS */

        document.getElementById(
            "sharedSearch"
        )
        ?.addEventListener(
            "input",
            applySharedFilters
        );


        document.getElementById(
            "sharedTypeFilter"
        )
        ?.addEventListener(
            "change",
            applySharedFilters
        );


        document.getElementById(
            "sharedStatusFilter"
        )
        ?.addEventListener(
            "change",
            applySharedFilters
        );


        /* ADD TYPE */

        document.getElementById(
            "addSharedExpenseTypeBtn"
        )
        ?.addEventListener(
            "click",
            openAddSharedTypeModal
        );


        document.getElementById(
            "saveSharedTypeBtn"
        )
        ?.addEventListener(
            "click",
            saveSharedExpenseType
        );


        /* DELETE */

        document.getElementById(
            "confirmSharedDelete"
        )
        ?.addEventListener(
            "click",
            confirmDeleteSharedExpense
        );


        /* ESCAPE TYPE MODAL ENTER */

        document.getElementById(
            "newSharedExpenseType"
        )
        ?.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    saveSharedExpenseType();

                }

            }
        );


    }
);