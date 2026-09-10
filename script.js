/* ============================================================
   DAILY EXPENSE TRACKER
   COMPLETE JAVASCRIPT

   FEATURES
   ------------------------------------------------------------
   1. Supabase connection
   2. Add expense
   3. Load expense types
   4. Add new expense type
   5. Duplicate expense type prevention
   6. Load expenses
   7. Filter expenses
   8. Pagination
   9. Edit expense
   10. Delete expense
   11. Print expenses
   12. Save expenses as PDF through browser print
   13. Dashboard navigation
============================================================ */


/* ============================================================
   SUPABASE CONFIGURATION
============================================================ */

const SUPABASE_URL =
    "https://sdkhtfovazarqvzplagq.supabase.co";


const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2h0Zm92YXphcnF2enBsYWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQzMDA1OCwiZXhwIjoyMTA0MDA2MDU4fQ.Rf9sKrsoua5Am_4AwHX2Qdib4NmOzOzBaRfyJndLt9M";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let allExpenses = [];

let filteredExpenses = [];

let allExpenseTypes = [];

let currentPage = 1;

let rowsPerPage = 10;

let selectedCreator = "ALL";

let selectedExpenseType = "ALL";

let deleteExpenseId = null;

let editingExpenseId = null;


/* ============================================================
   PAGE LOAD
============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

    setCurrentDate();

    initializeCommonNavigation();


    /* --------------------------------------------------------
       INDEX PAGE
    -------------------------------------------------------- */

    if (document.getElementById("expenseForm")) {

        setFormDate();

        setCurrentTime();

        await loadExpenseTypes();

        await setNextSerialNumber();

        initializeIndexEvents();

    }


    /* --------------------------------------------------------
       EXPENSE PAGE
    -------------------------------------------------------- */

    if (document.getElementById("expenseTableBody")) {

        await loadExpenseTypes();

        await loadExpenseTable();

        initializeFilters();

        initializePagination();

    }


    /* --------------------------------------------------------
       DASHBOARD PAGE
    -------------------------------------------------------- */

    if (
        document.getElementById("dashboardContainer") ||
        document.getElementById("monthlyComparison")
    ) {

        await loadDashboard();

    }

});


/* ============================================================
   CURRENT DATE
============================================================ */

function setCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }


    const now = new Date();


    element.textContent =
        now.toLocaleDateString(
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
   FORM DATE
============================================================ */

function setFormDate() {

    const dateInput =
        document.getElementById("expenseDate");

    if (!dateInput) {
        return;
    }


    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;

}


/* ============================================================
   CURRENT TIME
============================================================ */

function setCurrentTime() {

    const timeInput =
        document.getElementById("expenseTime");

    if (!timeInput) {
        return;
    }


    const now = new Date();


    const hours =
        String(now.getHours())
            .padStart(2, "0");


    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");


    timeInput.value =
        `${hours}:${minutes}`;

}


/* ============================================================
   LOAD EXPENSE TYPES
============================================================ */

async function loadExpenseTypes() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("expense_types")

            .select("id, name")

            .order("name", {
                ascending: true
            });


        if (error) {

            console.error(
                "Expense type loading error:",
                error
            );

            showError(
                "Unable to load expense types."
            );

            return;

        }


        allExpenseTypes =
            data || [];


        populateExpenseTypeDropdowns();


    }
    catch (error) {

        console.error(
            "Unexpected error loading expense types:",
            error
        );

        showError(
            "Unexpected error while loading expense types."
        );

    }

}


/* ============================================================
   POPULATE EXPENSE TYPE DROPDOWNS
============================================================ */

function populateExpenseTypeDropdowns() {


    /* --------------------------------------------------------
       INDEX DROPDOWN
    -------------------------------------------------------- */

    const expenseType =
        document.getElementById("expenseType");


    if (expenseType) {

        expenseType.innerHTML =
            `<option value="">
                Select Type
             </option>`;


        allExpenseTypes.forEach(function (type) {

            const option =
                document.createElement("option");

            option.value =
                type.name;

            option.textContent =
                type.name;

            expenseType.appendChild(option);

        });

    }


    /* --------------------------------------------------------
       EXPENSE FILTER
    -------------------------------------------------------- */

    const expenseTypeFilter =
        document.getElementById(
            "expenseTypeFilter"
        );


    if (expenseTypeFilter) {

        const currentValue =
            expenseTypeFilter.value;


        expenseTypeFilter.innerHTML =
            `<option value="ALL">
                All Expense Types
             </option>`;


        allExpenseTypes.forEach(function (type) {

            const option =
                document.createElement("option");

            option.value =
                type.name;

            option.textContent =
                type.name;

            expenseTypeFilter.appendChild(
                option
            );

        });


        if (
            [...expenseTypeFilter.options]
                .some(
                    option =>
                        option.value === currentValue
                )
        ) {

            expenseTypeFilter.value =
                currentValue;

        }

    }


    /* --------------------------------------------------------
       EDIT DROPDOWN
    -------------------------------------------------------- */

    const editExpenseType =
        document.getElementById(
            "editExpenseType"
        );


    if (editExpenseType) {

        const currentValue =
            editExpenseType.value;


        editExpenseType.innerHTML =
            `<option value="">
                Select Type
             </option>`;


        allExpenseTypes.forEach(function (type) {

            const option =
                document.createElement("option");

            option.value =
                type.name;

            option.textContent =
                type.name;

            editExpenseType.appendChild(
                option
            );

        });


        if (
            [...editExpenseType.options]
                .some(
                    option =>
                        option.value === currentValue
                )
        ) {

            editExpenseType.value =
                currentValue;

        }

    }

}


/* ============================================================
   INITIALIZE INDEX EVENTS
============================================================ */

function initializeIndexEvents() {


    const expenseForm =
        document.getElementById(
            "expenseForm"
        );


    if (expenseForm) {

        expenseForm.addEventListener(
            "submit",
            saveExpense
        );

    }


    const addExpenseTypeBtn =
        document.getElementById(
            "addExpenseTypeBtn"
        );


    if (addExpenseTypeBtn) {

        addExpenseTypeBtn.addEventListener(
            "click",
            openAddExpenseTypeModal
        );

    }


    const saveExpenseTypeBtn =
        document.getElementById(
            "saveExpenseTypeBtn"
        );


    if (saveExpenseTypeBtn) {

        saveExpenseTypeBtn.addEventListener(
            "click",
            addNewExpenseType
        );

    }


    const newExpenseType =
        document.getElementById(
            "newExpenseType"
        );


    if (newExpenseType) {

        newExpenseType.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addNewExpenseType();

                }

            }
        );

    }

}


/* ============================================================
   OPEN ADD EXPENSE TYPE MODAL
============================================================ */

function openAddExpenseTypeModal() {

    const input =
        document.getElementById(
            "newExpenseType"
        );


    const error =
        document.getElementById(
            "expenseTypeError"
        );


    if (input) {
        input.value = "";
    }


    if (error) {

        error.style.display =
            "none";

        error.textContent =
            "";

    }


    const modalElement =
        document.getElementById(
            "addExpenseTypeModal"
        );


    if (!modalElement) {
        return;
    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();


    setTimeout(
        function () {

            if (input) {
                input.focus();
            }

        },
        300
    );

}


/* ============================================================
   ADD NEW EXPENSE TYPE
============================================================ */

async function addNewExpenseType() {

    const input =
        document.getElementById(
            "newExpenseType"
        );


    const errorElement =
        document.getElementById(
            "expenseTypeError"
        );


    const button =
        document.getElementById(
            "saveExpenseTypeBtn"
        );


    if (!input) {
        return;
    }


    const name =
        input.value.trim();


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!name) {

        showExpenseTypeModalError(
            "Please enter an expense type."
        );

        input.focus();

        return;

    }


    if (name.length < 2) {

        showExpenseTypeModalError(
            "Expense type must contain at least 2 characters."
        );

        input.focus();

        return;

    }


    /* --------------------------------------------------------
       CHECK DUPLICATE LOCALLY
    -------------------------------------------------------- */

    const duplicate =
        allExpenseTypes.some(
            type =>
                type.name.trim().toLowerCase()
                ===
                name.toLowerCase()
        );


    if (duplicate) {

        showExpenseTypeModalError(
            "This expense type already exists."
        );

        input.focus();

        return;

    }


    /* --------------------------------------------------------
       DISABLE BUTTON
    -------------------------------------------------------- */

    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            `<span class="spinner-border spinner-border-sm me-1"></span>
             Saving...`;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("expense_types")

            .insert([
                {
                    name: name
                }
            ])

            .select()
            .single();


        if (error) {

            console.error(
                "Add expense type error:",
                error
            );


            if (
                error.code === "23505"
            ) {

                showExpenseTypeModalError(
                    "This expense type already exists."
                );

            }
            else {

                showExpenseTypeModalError(
                    error.message ||
                    "Unable to add expense type."
                );

            }


            return;

        }


        /* ----------------------------------------------------
           ADD TO LOCAL ARRAY
        ---------------------------------------------------- */

        if (data) {

            allExpenseTypes.push(data);

            allExpenseTypes.sort(
                function (a, b) {

                    return a.name.localeCompare(
                        b.name
                    );

                }
            );

        }


        populateExpenseTypeDropdowns();


        /* ----------------------------------------------------
           SELECT NEW TYPE
        ---------------------------------------------------- */

        const expenseType =
            document.getElementById(
                "expenseType"
            );


        if (expenseType) {

            expenseType.value =
                name;

        }


        /* ----------------------------------------------------
           CLOSE MODAL
        ---------------------------------------------------- */

        const modalElement =
            document.getElementById(
                "addExpenseTypeModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );


            if (modal) {
                modal.hide();
            }

        }


        showSuccess(
            "New expense type added successfully!"
        );


    }
    catch (error) {

        console.error(
            "Unexpected add expense type error:",
            error
        );


        showExpenseTypeModalError(
            "Unexpected error. Please try again."
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                `<i class="fa-solid fa-plus"></i>
                 Add Expense Type`;

        }

    }

}


/* ============================================================
   MODAL ERROR
============================================================ */

function showExpenseTypeModalError(message) {

    const element =
        document.getElementById(
            "expenseTypeError"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


/* ============================================================
   SAVE EXPENSE
============================================================ */

async function saveExpense(event) {

    event.preventDefault();


    const creator =
        document.getElementById(
            "creator"
        ).value.trim();


    const expenseDate =
        document.getElementById(
            "expenseDate"
        ).value;


    const expenseTime =
        document.getElementById(
            "expenseTime"
        ).value;


    const expenseType =
        document.getElementById(
            "expenseType"
        ).value;


    const category =
        document.getElementById(
            "category"
        ).value;


    const comment =
        document.getElementById(
            "comment"
        ).value.trim();


    const amount =
        document.getElementById(
            "amount"
        ).value;


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!creator) {

        showError(
            "Please enter creator name."
        );

        return;

    }


    if (!expenseDate) {

        showError(
            "Please select expense date."
        );

        return;

    }


    if (!expenseType) {

        showError(
            "Please select expense type."
        );

        return;

    }


    if (!category) {

        showError(
            "Please select category."
        );

        return;

    }


    if (!comment) {

        showError(
            "Please enter expense description."
        );

        return;

    }


    if (!amount || Number(amount) <= 0) {

        showError(
            "Please enter a valid amount."
        );

        return;

    }


    const submitButton =
        document.querySelector(
            "#expenseForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.innerHTML =
            `<span class="spinner-border spinner-border-sm me-2"></span>
             Saving...`;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("expenses")

            .insert([
                {
                    creator: creator,

                    expense_date: expenseDate,

                    expense_time:
                        expenseTime || null,

                    expense_type: expenseType,

                    category: category,

                    comment: comment,

                    amount: Number(amount)
                }
            ])

            .select();


        if (error) {

            console.error(
                "Save expense error:",
                error
            );

            showError(
                error.message ||
                "Unable to save expense."
            );

            return;

        }


        console.log(
            "Expense saved:",
            data
        );


        showSuccess(
            "Expense saved successfully!"
        );


        document.getElementById(
            "expenseForm"
        ).reset();


        setFormDate();

        setCurrentTime();

        await setNextSerialNumber();

    }
    catch (error) {

        console.error(
            "Unexpected save error:",
            error
        );

        showError(
            "Unexpected error while saving expense."
        );

    }
    finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                `<i class="fa-solid fa-floppy-disk"></i>
                 Submit Expense`;

        }

    }

}


/* ============================================================
   GET NEXT SERIAL NUMBER
============================================================ */

async function setNextSerialNumber() {

    const serialInput =
        document.getElementById(
            "serialNo"
        );


    if (!serialInput) {
        return;
    }


    try {

        const {
            count,
            error
        } = await supabaseClient

            .from("expenses")

            .select("id", {
                count: "exact",
                head: true
            });


        if (error) {

            console.error(
                "Serial number error:",
                error
            );

            serialInput.value =
                "";

            return;

        }


        serialInput.value =
            (count || 0) + 1;

    }
    catch (error) {

        console.error(
            error
        );

        serialInput.value =
            "";

    }

}


/* ============================================================
   LOAD EXPENSE TABLE
============================================================ */

async function loadExpenseTable() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("expenses")

            .select("*")

            .order("id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Load expenses error:",
                error
            );

            showError(
                "Unable to load expenses."
            );

            return;

        }


        allExpenses =
            data || [];


        filteredExpenses =
            [...allExpenses];


        updateCreatorFilter();

        applyFilters();


        updateSummary();


        renderExpenseTable();


        renderPagination();


    }
    catch (error) {

        console.error(
            "Unexpected expense loading error:",
            error
        );

        showError(
            "Unexpected error while loading expenses."
        );

    }

}


/* ============================================================
   UPDATE CREATOR FILTER
============================================================ */

function updateCreatorFilter() {

    const creatorFilter =
        document.getElementById(
            "creatorFilter"
        );


    if (!creatorFilter) {
        return;
    }


    const currentValue =
        creatorFilter.value ||
        selectedCreator;


    const creators =
        [
            ...new Set(
                allExpenses
                    .map(
                        expense =>
                            expense.creator
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            function (a, b) {

                return a.localeCompare(b);

            }
        );


    creatorFilter.innerHTML =
        `<option value="ALL">
            All Creators
         </option>`;


    creators.forEach(function (creator) {

        const option =
            document.createElement("option");

        option.value =
            creator;

        option.textContent =
            creator;

        creatorFilter.appendChild(
            option
        );

    });


    if (
        creators.includes(currentValue)
    ) {

        creatorFilter.value =
            currentValue;

    }
    else {

        creatorFilter.value =
            "ALL";

    }

}


/* ============================================================
   INITIALIZE FILTERS
============================================================ */

function initializeFilters() {

    const creatorFilter =
        document.getElementById(
            "creatorFilter"
        );


    const expenseTypeFilter =
        document.getElementById(
            "expenseTypeFilter"
        );


    const rowsSelect =
        document.getElementById(
            "rowsPerPage"
        );


    const clearButton =
        document.getElementById(
            "clearFilterBtn"
        );


    if (creatorFilter) {

        creatorFilter.addEventListener(
            "change",
            function () {

                selectedCreator =
                    this.value;

                currentPage =
                    1;

                applyFilters();

                renderExpenseTable();

                renderPagination();

            }
        );

    }


    if (expenseTypeFilter) {

        expenseTypeFilter.addEventListener(
            "change",
            function () {

                selectedExpenseType =
                    this.value;

                currentPage =
                    1;

                applyFilters();

                renderExpenseTable();

                renderPagination();

            }
        );

    }


    if (rowsSelect) {

        rowsSelect.addEventListener(
            "change",
            function () {

                rowsPerPage =
                    Number(this.value);

                currentPage =
                    1;

                renderExpenseTable();

                renderPagination();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    const printButton =
        document.getElementById(
            "printExpensesBtn"
        );


    if (printButton) {

        printButton.addEventListener(
            "click",
            printExpenses
        );

    }

}


/* ============================================================
   APPLY FILTERS
============================================================ */

function applyFilters() {

    filteredExpenses =
        allExpenses.filter(
            function (expense) {


                const creatorMatch =
                    selectedCreator === "ALL"
                    ||
                    expense.creator ===
                    selectedCreator;


                const typeMatch =
                    selectedExpenseType === "ALL"
                    ||
                    expense.expense_type ===
                    selectedExpenseType;


                return (
                    creatorMatch &&
                    typeMatch
                );

            }
        );


    updateSummary();

}


/* ============================================================
   CLEAR FILTERS
============================================================ */

function clearFilters() {

    selectedCreator =
        "ALL";


    selectedExpenseType =
        "ALL";


    currentPage =
        1;


    const creatorFilter =
        document.getElementById(
            "creatorFilter"
        );


    const expenseTypeFilter =
        document.getElementById(
            "expenseTypeFilter"
        );


    if (creatorFilter) {
        creatorFilter.value =
            "ALL";
    }


    if (expenseTypeFilter) {
        expenseTypeFilter.value =
            "ALL";
    }


    applyFilters();

    renderExpenseTable();

    renderPagination();

}


/* ============================================================
   UPDATE SUMMARY
============================================================ */

function updateSummary() {

    const totalEntries =
        document.getElementById(
            "totalEntries"
        );


    const todayEntries =
        document.getElementById(
            "todayEntries"
        );


    const totalAmount =
        document.getElementById(
            "totalAmount"
        );


    const total =
        filteredExpenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(expense.amount || 0)
                );

            },
            0
        );


    const today =
        new Date();


    const todayString =
        today.toISOString()
            .split("T")[0];


    const todayCount =
        filteredExpenses.filter(
            function (expense) {

                return (
                    expense.expense_date ===
                    todayString
                );

            }
        ).length;


    if (totalEntries) {

        totalEntries.textContent =
            filteredExpenses.length;

    }


    if (todayEntries) {

        todayEntries.textContent =
            todayCount;

    }


    if (totalAmount) {

        totalAmount.textContent =
            formatCurrency(total);

    }


    const printTotalEntries =
        document.getElementById(
            "printTotalEntries"
        );


    const printTotalAmount =
        document.getElementById(
            "printTotalAmount"
        );


    if (printTotalEntries) {

        printTotalEntries.textContent =
            filteredExpenses.length;

    }


    if (printTotalAmount) {

        printTotalAmount.textContent =
            formatCurrency(total);

    }

}


/* ============================================================
   RENDER EXPENSE TABLE
============================================================ */

function renderExpenseTable() {

    const tbody =
        document.getElementById(
            "expenseTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    const grandTotalElement =
        document.getElementById(
            "tableGrandTotal"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML =
        "";


    if (
        filteredExpenses.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }


        if (grandTotalElement) {

            grandTotalElement.textContent =
                "₹0.00";

        }


        return;

    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    /* --------------------------------------------------------
       GRAND TOTAL
    -------------------------------------------------------- */

    const grandTotal =
        filteredExpenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(expense.amount || 0)
                );

            },
            0
        );


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatCurrency(grandTotal);

    }


    /* --------------------------------------------------------
       PAGINATION
    -------------------------------------------------------- */

    const startIndex =
        (currentPage - 1) *
        rowsPerPage;


    const endIndex =
        startIndex +
        rowsPerPage;


    const pageExpenses =
        filteredExpenses.slice(
            startIndex,
            endIndex
        );


    pageExpenses.forEach(
        function (expense, index) {


            const row =
                document.createElement("tr");


            const serial =
                startIndex +
                index +
                1;


            const date =
                formatDate(
                    expense.expense_date
                );


            const time =
                expense.expense_time
                    ? expense.expense_time.substring(
                        0,
                        5
                    )
                    : "-";


            row.innerHTML = `

                <td>
                    ${serial}
                </td>

                <td>
                    ${escapeHtml(
                        expense.creator || "-"
                    )}
                </td>

                <td>
                    ${date}
                </td>

                <td>
                    ${time}
                </td>

                <td>
                    ${escapeHtml(
                        expense.expense_type || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        expense.category || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        expense.comment || "-"
                    )}
                </td>

                <td>
                    <strong>
                        ${formatCurrency(
                            expense.amount
                        )}
                    </strong>
                </td>

                <td class="action-cell no-print">

                    <div class="d-flex gap-1">

                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            onclick="openEditModal(${expense.id})"
                            title="Edit">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="openDeleteModal(${expense.id})"
                            title="Delete">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


/* ============================================================
   PAGINATION
============================================================ */

function initializePagination() {

    const container =
        document.getElementById(
            "expensePaginationContainer"
        );


    if (!container) {
        return;
    }


    renderPagination();

}


/* ============================================================
   RENDER PAGINATION
============================================================ */

function renderPagination() {

    const container =
        document.getElementById(
            "expensePaginationContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const totalPages =
        Math.ceil(
            filteredExpenses.length /
            rowsPerPage
        );


    if (totalPages <= 1) {
        return;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "d-flex justify-content-center align-items-center gap-2 mt-4";


    /* --------------------------------------------------------
       PREVIOUS
    -------------------------------------------------------- */

    const previousButton =
        document.createElement("button");


    previousButton.className =
        "btn btn-outline-primary";


    previousButton.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderExpenseTable();

                renderPagination();

            }

        }
    );


    wrapper.appendChild(
        previousButton
    );


    /* --------------------------------------------------------
       PAGE NUMBERS
    -------------------------------------------------------- */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.className =
            page === currentPage
                ? "btn btn-primary"
                : "btn btn-outline-primary";


        button.textContent =
            page;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderExpenseTable();

                renderPagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        wrapper.appendChild(
            button
        );

    }


    /* --------------------------------------------------------
       NEXT
    -------------------------------------------------------- */

    const nextButton =
        document.createElement("button");


    nextButton.className =
        "btn btn-outline-primary";


    nextButton.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderExpenseTable();

                renderPagination();

            }

        }
    );


    wrapper.appendChild(
        nextButton
    );


    container.appendChild(
        wrapper
    );

}


/* ============================================================
   OPEN EDIT MODAL
============================================================ */

function openEditModal(id) {

    const expense =
        allExpenses.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!expense) {

        showError(
            "Expense not found."
        );

        return;

    }


    editingExpenseId =
        id;


    const serialInput =
        document.getElementById(
            "editSerialNo"
        );


    const creatorInput =
        document.getElementById(
            "editCreator"
        );


    const dateInput =
        document.getElementById(
            "editDate"
        );


    const timeInput =
        document.getElementById(
            "editTime"
        );


    const typeInput =
        document.getElementById(
            "editExpenseType"
        );


    const categoryInput =
        document.getElementById(
            "editCategory"
        );


    const commentInput =
        document.getElementById(
            "editComment"
        );


    const amountInput =
        document.getElementById(
            "editAmount"
        );


    if (serialInput) {

        const serial =
            allExpenses.findIndex(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            ) + 1;


        serialInput.value =
            serial;

    }


    if (creatorInput) {

        creatorInput.value =
            expense.creator || "";

    }


    if (dateInput) {

        dateInput.value =
            expense.expense_date || "";

    }


    if (timeInput) {

        timeInput.value =
            expense.expense_time
                ? expense.expense_time.substring(
                    0,
                    5
                )
                : "";

    }


    if (typeInput) {

        typeInput.value =
            expense.expense_type || "";

    }


    if (categoryInput) {

        categoryInput.value =
            expense.category || "";

    }


    if (commentInput) {

        commentInput.value =
            expense.comment || "";

    }


    if (amountInput) {

        amountInput.value =
            expense.amount || "";

    }


    const modalElement =
        document.getElementById(
            "editModal"
        );


    if (modalElement) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

}


/* ============================================================
   UPDATE EXPENSE
============================================================ */

async function updateExpense() {

    if (!editingExpenseId) {

        showError(
            "No expense selected."
        );

        return;

    }


    const creator =
        document.getElementById(
            "editCreator"
        ).value.trim();


    const expenseDate =
        document.getElementById(
            "editDate"
        ).value;


    const expenseTime =
        document.getElementById(
            "editTime"
        ).value;


    const expenseType =
        document.getElementById(
            "editExpenseType"
        ).value;


    const category =
        document.getElementById(
            "editCategory"
        ).value;


    const comment =
        document.getElementById(
            "editComment"
        ).value.trim();


    const amount =
        document.getElementById(
            "editAmount"
        ).value;


    if (!creator) {

        showError(
            "Creator is required."
        );

        return;

    }


    if (!expenseDate) {

        showError(
            "Date is required."
        );

        return;

    }


    if (!expenseType) {

        showError(
            "Expense type is required."
        );

        return;

    }


    if (!category) {

        showError(
            "Category is required."
        );

        return;

    }


    if (!comment) {

        showError(
            "Description is required."
        );

        return;

    }


    if (!amount || Number(amount) <= 0) {

        showError(
            "Please enter a valid amount."
        );

        return;

    }


    try {

        const {
            error
        } = await supabaseClient

            .from("expenses")

            .update({

                creator: creator,

                expense_date: expenseDate,

                expense_time:
                    expenseTime || null,

                expense_type: expenseType,

                category: category,

                comment: comment,

                amount: Number(amount)

            })

            .eq(
                "id",
                editingExpenseId
            );


        if (error) {

            console.error(
                "Update error:",
                error
            );

            showError(
                error.message ||
                "Unable to update expense."
            );

            return;

        }


        const modalElement =
            document.getElementById(
                "editModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );


            if (modal) {
                modal.hide();
            }

        }


        editingExpenseId =
            null;


        showSuccess(
            "Expense updated successfully!"
        );


        await loadExpenseTable();

    }
    catch (error) {

        console.error(
            error
        );

        showError(
            "Unexpected error while updating."
        );

    }

}


/* ============================================================
   OPEN DELETE MODAL
============================================================ */

function openDeleteModal(id) {

    deleteExpenseId =
        id;


    const modalElement =
        document.getElementById(
            "deleteModal"
        );


    if (!modalElement) {
        return;
    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();


    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    if (confirmButton) {

        confirmButton.onclick =
            confirmDeleteExpense;

    }

}


/* ============================================================
   CONFIRM DELETE
============================================================ */

async function confirmDeleteExpense() {

    if (!deleteExpenseId) {

        return;

    }


    const button =
        document.getElementById(
            "confirmDelete"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            `<span class="spinner-border spinner-border-sm me-1"></span>
             Deleting...`;

    }


    try {

        const {
            error
        } = await supabaseClient

            .from("expenses")

            .delete()

            .eq(
                "id",
                deleteExpenseId
            );


        if (error) {

            console.error(
                "Delete error:",
                error
            );

            showError(
                error.message ||
                "Unable to delete expense."
            );

            return;

        }


        const modalElement =
            document.getElementById(
                "deleteModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );


            if (modal) {
                modal.hide();
            }

        }


        deleteExpenseId =
            null;


        showSuccess(
            "Expense deleted successfully!"
        );


        await loadExpenseTable();

    }
    catch (error) {

        console.error(
            error
        );

        showError(
            "Unexpected error while deleting."
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                `<i class="fa-solid fa-trash"></i>
                 Delete`;

        }

    }

}


/* ============================================================
   PRINT EXPENSES
============================================================ */

function printExpenses() {

    if (
        !filteredExpenses ||
        filteredExpenses.length === 0
    ) {

        showError(
            "There are no expenses to print."
        );

        return;

    }


    /* --------------------------------------------------------
       UPDATE PRINT DATE
    -------------------------------------------------------- */

    const printDate =
        document.getElementById(
            "printGeneratedDate"
        );


    if (printDate) {

        const now =
            new Date();


        printDate.textContent =
            now.toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

    }


    /* --------------------------------------------------------
       IMPORTANT:
       Browser print prints the complete filtered table,
       not only the current pagination page.
    -------------------------------------------------------- */

    prepareFullPrintTable();


    setTimeout(
        function () {

            window.print();

        },
        200
    );

}


/* ============================================================
   PREPARE FULL TABLE FOR PRINT
============================================================ */

function prepareFullPrintTable() {

    const tbody =
        document.getElementById(
            "expenseTableBody"
        );


    if (!tbody) {
        return;
    }


    /* --------------------------------------------------------
       SAVE CURRENT HTML
       So we can restore pagination after printing.
    -------------------------------------------------------- */

    tbody.dataset.originalHtml =
        tbody.innerHTML;


    tbody.innerHTML =
        "";


    filteredExpenses.forEach(
        function (expense, index) {


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        expense.creator || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        expense.expense_date
                    )}
                </td>

                <td>
                    ${
                        expense.expense_time
                            ? expense.expense_time.substring(
                                0,
                                5
                            )
                            : "-"
                    }
                </td>

                <td>
                    ${escapeHtml(
                        expense.expense_type || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        expense.category || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        expense.comment || "-"
                    )}
                </td>

                <td>
                    <strong>
                        ${formatCurrency(
                            expense.amount
                        )}
                    </strong>
                </td>

                <td class="action-cell no-print">

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


/* ============================================================
   RESTORE TABLE AFTER PRINT
============================================================ */

window.addEventListener(
    "afterprint",
    function () {

        renderExpenseTable();

        renderPagination();

    }
);


/* ============================================================
   CURRENCY FORMAT
============================================================ */

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,

                    maximumFractionDigits: 2
                }
            );

}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   SUCCESS TOAST
============================================================ */

function showSuccess(message) {

    const toastElement =
        document.getElementById(
            "successToast"
        );


    if (!toastElement) {

        alert(message);

        return;

    }


    const body =
        toastElement.querySelector(
            ".toast-body"
        );


    if (body) {

        body.textContent =
            message;

    }


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 3000
            }
        );


    toast.show();

}


/* ============================================================
   ERROR MESSAGE
============================================================ */

function showError(message) {

    const toastElement =
        document.getElementById(
            "errorToast"
        );


    const messageElement =
        document.getElementById(
            "errorToastMessage"
        );


    if (
        !toastElement ||
        !messageElement
    ) {

        alert(message);

        return;

    }


    messageElement.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 5000
            }
        );


    toast.show();

}


/* ============================================================
   NAVIGATION
============================================================ */

function goToExpenses() {

    window.location.href =
        "expense.html";

}


/* ============================================================
   DASHBOARD
============================================================ */

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


/* ============================================================
   BACK
============================================================ */

function goBack() {

    window.history.back();

}


/* ============================================================
   COMMON NAVIGATION
============================================================ */

function initializeCommonNavigation() {

    /* Reserved for future common navigation features */

}


/* ============================================================
   DASHBOARD
   BASIC COMPATIBILITY FUNCTION

   If your existing dashboard code already has a more advanced
   dashboard implementation, you can retain that section.
============================================================ */

async function loadDashboard() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("expenses")

            .select("*")

            .order("expense_date", {
                ascending: true
            });


        if (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            return;

        }


        console.log(
            "Dashboard data:",
            data
        );


        /* ----------------------------------------------------
           Your existing dashboard calculations can use
           this data.
        ---------------------------------------------------- */

    }
    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}
