const SUPABASE_URL =
    "https://sdkhtfovazarqvzplagq.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2h0Zm92YXphcnF2enBsYWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQzMDA1OCwiZXhwIjoyMTA0MDA2MDU4fQ.Rf9sKrsoua5Am_4AwHX2Qdib4NmOzOzBaRfyJndLt9M";


let supabaseClient = null;

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

let editingExpenseId = null;

let deletingExpenseId = null;


/* ============================================================
   INITIALIZE SUPABASE
============================================================ */

function initializeSupabase() {

    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "Supabase library was not loaded."
        );

        return false;
    }


    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY ===
            "YOUR_SUPABASE_ANON_KEY"
    ) {

        console.error(
            "Supabase credentials are not configured."
        );

        showError(
            "Please add your Supabase anon public key in script.js."
        );

        return false;
    }


    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    return true;
}


/* ============================================================
   PAGE LOAD
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setCurrentDate();


        if (
            !initializeSupabase()
        ) {

            return;
        }


        const page =
            getCurrentPage();


        if (
            page === "index.html" ||
            page === ""
        ) {

            await initializeIndexPage();

        }


        else if (
            page === "expense.html"
        ) {

            await initializeExpensePage();

        }


        else if (
            page === "dashboard.html"
        ) {

            await initializeDashboardPage();

        }

    }
);


/* ============================================================
   GET CURRENT PAGE
============================================================ */

function getCurrentPage() {

    let path =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    return path;
}


/* ============================================================
   INDEX PAGE INITIALIZATION
============================================================ */

async function initializeIndexPage() {

    setFormDate();

    setCurrentTime();

    await setNextSerialNumber();

    await loadExpenseTypes();

    initializeExpenseTypeModal();

    initializeExpenseForm();

}


/* ============================================================
   EXPENSE PAGE INITIALIZATION
============================================================ */

async function initializeExpensePage() {

    initializeExpenseFilters();

    initializeRowsPerPage();

    await loadExpenseTypes();

    await loadExpenseTable();

}


/* ============================================================
   DASHBOARD PAGE INITIALIZATION
============================================================ */

async function initializeDashboardPage() {

    await loadDashboard();

}


/* ============================================================
   CURRENT DATE
============================================================ */

function setCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}


/* ============================================================
   FORM DATE
============================================================ */

function setFormDate() {

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    if (!dateInput) {
        return;
    }


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;
}


/* ============================================================
   CURRENT TIME
============================================================ */

function setCurrentTime() {

    const timeInput =
        document.getElementById(
            "expenseTime"
        );


    if (!timeInput) {
        return;
    }


    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    timeInput.value =
        `${hours}:${minutes}`;
}


/* ============================================================
   NEXT SERIAL NUMBER
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
        } =
            await supabaseClient
                .from("expenses")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {
            throw error;
        }


        serialInput.value =
            Number(count || 0) + 1;

    }

    catch (error) {

        console.error(
            "Serial number error:",
            error
        );


        serialInput.value =
            "1";
    }
}


/* ============================================================
   LOAD EXPENSE TYPES
============================================================ */

async function loadExpenseTypes() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("expense_types")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        allExpenseTypes =
            data || [];


        populateExpenseTypeDropdowns();

    }

    catch (error) {

        console.error(
            "Expense type loading error:",
            error
        );


        const select =
            document.getElementById(
                "expenseType"
            );


        if (select) {

            select.innerHTML =
                `<option value="">
                    Unable to load expense types
                 </option>`;
        }
    }
}


/* ============================================================
   POPULATE EXPENSE TYPE DROPDOWNS
============================================================ */

function populateExpenseTypeDropdowns() {

    const mainSelect =
        document.getElementById(
            "expenseType"
        );


    const editSelect =
        document.getElementById(
            "editExpenseType"
        );


    const filterSelect =
        document.getElementById(
            "expenseTypeFilter"
        );


    if (mainSelect) {

        mainSelect.innerHTML =
            `<option value="">
                Select Expense Type
             </option>`;


        allExpenseTypes.forEach(
            function (type) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    type.name;


                option.textContent =
                    type.name;


                mainSelect.appendChild(
                    option
                );

            }
        );

    }


    if (editSelect) {

        editSelect.innerHTML =
            `<option value="">
                Select Expense Type
             </option>`;


        allExpenseTypes.forEach(
            function (type) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    type.name;


                option.textContent =
                    type.name;


                editSelect.appendChild(
                    option
                );

            }
        );

    }


    if (filterSelect) {

        const currentValue =
            filterSelect.value ||
            "ALL";


        filterSelect.innerHTML =
            `<option value="ALL">
                All Expense Types
             </option>`;


        allExpenseTypes.forEach(
            function (type) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    type.name;


                option.textContent =
                    type.name;


                filterSelect.appendChild(
                    option
                );

            }
        );


        if (
            [...filterSelect.options]
                .some(
                    option =>
                        option.value ===
                        currentValue
                )
        ) {

            filterSelect.value =
                currentValue;

        }

    }
}


/* ============================================================
   EXPENSE TYPE MODAL
============================================================ */

function initializeExpenseTypeModal() {

    const addButton =
        document.getElementById(
            "addExpenseTypeBtn"
        );


    const saveButton =
        document.getElementById(
            "saveExpenseTypeBtn"
        );


    const input =
        document.getElementById(
            "newExpenseType"
        );


    if (
        !addButton ||
        !saveButton
    ) {

        return;
    }


    addButton.addEventListener(
        "click",
        function () {

            const modalElement =
                document.getElementById(
                    "addExpenseTypeModal"
                );


            const modal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        modalElement
                    );


            clearExpenseTypeError();


            if (input) {
                input.value = "";
            }


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
    );


    saveButton.addEventListener(
        "click",
        addNewExpenseType
    );


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    addNewExpenseType();

                }

            }
        );

    }
}


/* ============================================================
   ADD NEW EXPENSE TYPE
============================================================ */

async function addNewExpenseType() {

    const input =
        document.getElementById(
            "newExpenseType"
        );


    const saveButton =
        document.getElementById(
            "saveExpenseTypeBtn"
        );


    if (
        !input ||
        !saveButton
    ) {

        return;
    }


    clearExpenseTypeError();


    const name =
        input.value.trim();


    if (!name) {

        showExpenseTypeError(
            "Please enter an expense type."
        );

        input.focus();

        return;
    }


    if (name.length < 2) {

        showExpenseTypeError(
            "Expense type must contain at least 2 characters."
        );

        input.focus();

        return;
    }


    const alreadyExists =
        allExpenseTypes.some(
            function (type) {

                return (
                    type.name
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase()
                );

            }
        );


    if (alreadyExists) {

        showExpenseTypeError(
            "This expense type already exists."
        );

        input.focus();

        return;
    }


    const originalHTML =
        saveButton.innerHTML;


    saveButton.disabled = true;

    saveButton.innerHTML =
        `<span class="spinner-border spinner-border-sm me-2"></span>
         Saving...`;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("expense_types")
                .insert(
                    [
                        {
                            name: name
                        }
                    ]
                )
                .select()
                .single();


        if (error) {
            throw error;
        }


        await loadExpenseTypes();


        const expenseType =
            document.getElementById(
                "expenseType"
            );


        if (expenseType) {

            expenseType.value =
                data.name;

        }


        const modalElement =
            document.getElementById(
                "addExpenseTypeModal"
            );


        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {
            modal.hide();
        }


        showSuccess(
            "Expense type added successfully!"
        );

    }

    catch (error) {

        console.error(
            "Add expense type error:",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            showExpenseTypeError(
                "This expense type already exists."
            );

        }

        else {

            showExpenseTypeError(
                error.message ||
                "Unable to add expense type."
            );

        }

    }

    finally {

        saveButton.disabled = false;

        saveButton.innerHTML =
            originalHTML;

    }
}


/* ============================================================
   EXPENSE TYPE ERROR
============================================================ */

function showExpenseTypeError(message) {

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
   CLEAR EXPENSE TYPE ERROR
============================================================ */

function clearExpenseTypeError() {

    const element =
        document.getElementById(
            "expenseTypeError"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.style.display =
        "none";
}


/* ============================================================
   EXPENSE FORM
============================================================ */

function initializeExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveExpense();

        }
    );
}


/* ============================================================
   SAVE EXPENSE
============================================================ */

async function saveExpense() {

    const creator =
        document.getElementById(
            "creator"
        )?.value.trim();


    const expenseDate =
        document.getElementById(
            "expenseDate"
        )?.value;


    const expenseTime =
        document.getElementById(
            "expenseTime"
        )?.value;


    const expenseType =
        document.getElementById(
            "expenseType"
        )?.value;


    const category =
        document.getElementById(
            "category"
        )?.value;


    const comment =
        document.getElementById(
            "comment"
        )?.value.trim();


    const amount =
        Number(
            document.getElementById(
                "amount"
            )?.value
        );


    const submitButton =
        document.getElementById(
            "submitExpenseBtn"
        );


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!creator) {

        showError(
            "Please enter the creator name."
        );

        return;
    }


    if (!expenseDate) {

        showError(
            "Please select the expense date."
        );

        return;
    }


    if (!expenseType) {

        showError(
            "Please select an expense type."
        );

        return;
    }


    if (!category) {

        showError(
            "Please select a category."
        );

        return;
    }


    if (!comment) {

        showError(
            "Please enter the expense description."
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(
            "Please enter a valid expense amount."
        );

        return;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    const originalHTML =
        submitButton
            ? submitButton.innerHTML
            : "";


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.innerHTML =
            `<span class="spinner-border spinner-border-sm me-2"></span>
             Saving...`;

    }


    try {

        const expenseData = {

            creator:
                creator,

            expense_date:
                expenseDate,

            expense_time:
                expenseTime || null,

            expense_type:
                expenseType,

            category:
                category,

            comment:
                comment,

            amount:
                amount

        };


        const {
            error
        } =
            await supabaseClient
                .from("expenses")
                .insert(
                    [expenseData]
                );


        if (error) {
            throw error;
        }


        showSuccess(
            "Expense saved successfully!"
        );


        document
            .getElementById(
                "expenseForm"
            )
            .reset();


        setFormDate();

        setCurrentTime();

        await setNextSerialNumber();

    }

    catch (error) {

        console.error(
            "Save expense error:",
            error
        );


        showError(
            error.message ||
            "Unable to save expense."
        );

    }

    finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalHTML;

        }

    }
}


/* ============================================================
   LOAD EXPENSE TABLE
============================================================ */

async function loadExpenseTable() {

    const tbody =
        document.getElementById(
            "expenseTableBody"
        );


    if (tbody) {

        tbody.innerHTML =
            `<tr class="loading-row">
                <td colspan="9">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Loading expenses...
                </td>
             </tr>`;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("expenses")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        allExpenses =
            data || [];


        updateSummaryCards();


        initializeCreatorFilterOptions();

        applyExpenseFilters();

    }

    catch (error) {

        console.error(
            "Load expenses error:",
            error
        );


        if (tbody) {

            tbody.innerHTML =
                `<tr>
                    <td colspan="9"
                        class="text-center text-danger py-4">

                        <i class="fa-solid fa-circle-exclamation me-2"></i>

                        Unable to load expenses.

                    </td>
                 </tr>`;

        }


        showError(
            error.message ||
            "Unable to load expenses."
        );

    }
}


/* ============================================================
   SUMMARY CARDS
============================================================ */

function updateSummaryCards() {

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


    if (totalEntries) {

        totalEntries.textContent =
            allExpenses.length;

    }


    const today =
        getTodayString();


    const todayCount =
        allExpenses.filter(
            function (expense) {

                return (
                    expense.expense_date ===
                    today
                );

            }
        ).length;


    if (todayEntries) {

        todayEntries.textContent =
            todayCount;

    }


    const amount =
        allExpenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );


    if (totalAmount) {

        totalAmount.textContent =
            formatCurrency(amount);

    }
}


/* ============================================================
   CREATOR FILTER OPTIONS
============================================================ */

function initializeCreatorFilterOptions() {

    const select =
        document.getElementById(
            "creatorFilter"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value ||
        "ALL";


    const creators =
        [
            ...new Set(
                allExpenses
                    .map(
                        expense =>
                            String(
                                expense.creator || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            function (a, b) {

                return a.localeCompare(
                    b
                );

            }
        );


    select.innerHTML =
        `<option value="ALL">
            All Creators
         </option>`;


    creators.forEach(
        function (creator) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                creator;


            option.textContent =
                creator;


            select.appendChild(
                option
            );

        }
    );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        select.value =
            currentValue;

    }

}


/* ============================================================
   FILTER INITIALIZATION
============================================================ */

function initializeExpenseFilters() {

    const creatorFilter =
        document.getElementById(
            "creatorFilter"
        );


    const typeFilter =
        document.getElementById(
            "expenseTypeFilter"
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
                    creatorFilter.value;

                currentPage = 1;

                applyExpenseFilters();

            }
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            function () {

                selectedExpenseType =
                    typeFilter.value;

                currentPage = 1;

                applyExpenseFilters();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                selectedCreator =
                    "ALL";

                selectedExpenseType =
                    "ALL";

                currentPage = 1;


                if (creatorFilter) {
                    creatorFilter.value =
                        "ALL";
                }


                if (typeFilter) {
                    typeFilter.value =
                        "ALL";
                }


                applyExpenseFilters();

            }
        );

    }
}


/* ============================================================
   ROWS PER PAGE
============================================================ */

function initializeRowsPerPage() {

    const select =
        document.getElementById(
            "rowsPerPage"
        );


    if (!select) {
        return;
    }


    select.value =
        String(rowsPerPage);


    select.addEventListener(
        "change",
        function () {

            rowsPerPage =
                Number(
                    select.value
                );


            currentPage = 1;

            renderExpenseTable();

        }
    );
}


/* ============================================================
   APPLY FILTERS
============================================================ */

function applyExpenseFilters() {

    filteredExpenses =
        allExpenses.filter(
            function (expense) {

                const creatorMatches =
                    selectedCreator ===
                    "ALL" ||
                    String(
                        expense.creator || ""
                    ).trim() ===
                    selectedCreator;


                const typeMatches =
                    selectedExpenseType ===
                    "ALL" ||
                    String(
                        expense.expense_type || ""
                    ).trim() ===
                    selectedExpenseType;


                return (
                    creatorMatches &&
                    typeMatches
                );

            }
        );


    currentPage = Math.min(
        currentPage,
        getTotalPages()
    );


    if (currentPage < 1) {
        currentPage = 1;
    }


    renderExpenseTable();

}


/* ============================================================
   GET TOTAL PAGES
============================================================ */

function getTotalPages() {

    if (
        filteredExpenses.length ===
        0
    ) {

        return 1;
    }


    return Math.ceil(
        filteredExpenses.length /
        rowsPerPage
    );
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


    if (!tbody) {
        return;
    }


    if (
        filteredExpenses.length ===
        0
    ) {

        tbody.innerHTML = "";


        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }


        updateTableTotals(
            [],
            filteredExpenses
        );


        renderPagination();

        return;

    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    const startIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage;


    const endIndex =
        startIndex +
        rowsPerPage;


    const pageExpenses =
        filteredExpenses.slice(
            startIndex,
            endIndex
        );


    tbody.innerHTML =
        pageExpenses
            .map(
                function (
                    expense,
                    index
                ) {

                    const serial =
                        startIndex +
                        index +
                        1;


                    const date =
                        formatDate(
                            expense.expense_date
                        );


                    const time =
                        formatTime(
                            expense.expense_time
                        );


                    const amount =
                        formatCurrency(
                            Number(
                                expense.amount || 0
                            )
                        );


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${serial}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    expense.creator
                                )}
                            </td>

                            <td>
                                ${date}
                            </td>

                            <td>
                                ${time}
                            </td>

                            <td>
                                ${escapeHTML(
                                    expense.expense_type
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    expense.category
                                )}
                            </td>

                            <td class="description-cell">
                                ${escapeHTML(
                                    expense.comment
                                )}
                            </td>

                            <td class="amount-cell">
                                ${amount}
                            </td>

                            <td class="action-cell">

                                <div class="d-flex gap-1 justify-content-center">

                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-primary"
                                        onclick="openEditModal(${expense.id})"
                                        title="Edit">

                                        <i class="fa-solid fa-pen"></i>

                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="openDeleteModal(${expense.id})"
                                        title="Delete">

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    updateTableTotals(
        pageExpenses,
        filteredExpenses
    );


    renderPagination();
}


/* ============================================================
   TABLE TOTALS
============================================================ */

function updateTableTotals(
    pageExpenses,
    allFilteredExpenses
) {

    const grandTotalElement =
        document.getElementById(
            "tableGrandTotal"
        );


    const pageTotalElement =
        document.getElementById(
            "pageGrandTotal"
        );


    const grandTotal =
        allFilteredExpenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );


    const pageTotal =
        pageExpenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatCurrency(
                grandTotal
            );

    }


    if (pageTotalElement) {

        pageTotalElement.textContent =
            formatCurrency(
                pageTotal
            );

    }
}


/* ============================================================
   PAGINATION
============================================================ */

function renderPagination() {

    const container =
        document.getElementById(
            "expensePaginationContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const totalPages =
        getTotalPages();


    if (
        filteredExpenses.length ===
        0
    ) {

        return;
    }


    const start =
        (
            currentPage - 1
        ) *
        rowsPerPage +
        1;


    const end =
        Math.min(
            currentPage *
            rowsPerPage,
            filteredExpenses.length
        );


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "pagination-info";


    info.textContent =
        `Showing ${start}-${end} of ${filteredExpenses.length} expenses`;


    container.appendChild(
        info
    );


    const buttonsWrapper =
        document.createElement(
            "div"
        );


    buttonsWrapper.className =
        "d-flex flex-wrap justify-content-center gap-1";


    /* ========================================================
       PREVIOUS
    ======================================================== */

    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.className =
        "btn btn-outline-primary";


    previous.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        function () {

            if (
                currentPage >
                1
            ) {

                currentPage--;

                renderExpenseTable();

                scrollTableToTop();

            }

        }
    );


    buttonsWrapper.appendChild(
        previous
    );


    /* ========================================================
       PAGE BUTTONS
    ======================================================== */

    const maxButtons = 7;


    let startPage =
        Math.max(
            1,
            currentPage -
            Math.floor(
                maxButtons / 2
            )
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxButtons -
            1
        );


    if (
        endPage -
        startPage +
        1 <
        maxButtons
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxButtons +
                1
            );

    }


    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


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

                scrollTableToTop();

            }
        );


        buttonsWrapper.appendChild(
            button
        );

    }


    /* ========================================================
       NEXT
    ======================================================== */

    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.className =
        "btn btn-outline-primary";


    next.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    next.disabled =
        currentPage ===
        totalPages;


    next.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderExpenseTable();

                scrollTableToTop();

            }

        }
    );


    buttonsWrapper.appendChild(
        next
    );


    container.appendChild(
        buttonsWrapper
    );
}


/* ============================================================
   SCROLL TABLE TO TOP
============================================================ */

function scrollTableToTop() {

    const table =
        document.getElementById(
            "expenseTable"
        );


    if (!table) {
        return;
    }


    const top =
        table.getBoundingClientRect().top +
        window.scrollY -
        90;


    window.scrollTo(
        {
            top: top,
            behavior: "smooth"
        }
    );
}


/* ============================================================
   EDIT EXPENSE
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
        expense.id;


    const serial =
        filteredExpenses.findIndex(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        ) + 1;


    document.getElementById(
        "editSerialNo"
    ).value =
        serial > 0
            ? serial
            : "";


    document.getElementById(
        "editCreator"
    ).value =
        expense.creator || "";


    document.getElementById(
        "editDate"
    ).value =
        expense.expense_date || "";


    document.getElementById(
        "editTime"
    ).value =
        expense.expense_time
            ? String(
                expense.expense_time
              ).substring(
                0,
                5
              )
            : "";


    document.getElementById(
        "editExpenseType"
    ).value =
        expense.expense_type || "";


    document.getElementById(
        "editCategory"
    ).value =
        expense.category || "";


    document.getElementById(
        "editComment"
    ).value =
        expense.comment || "";


    document.getElementById(
        "editAmount"
    ).value =
        expense.amount || "";


    const modalElement =
        document.getElementById(
            "editModal"
        );


    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    modal.show();
}


/* ============================================================
   UPDATE EXPENSE
============================================================ */

async function updateExpense() {

    if (
        !editingExpenseId
    ) {

        showError(
            "No expense selected."
        );

        return;
    }


    const creator =
        document.getElementById(
            "editCreator"
        )?.value.trim();


    const expenseDate =
        document.getElementById(
            "editDate"
        )?.value;


    const expenseTime =
        document.getElementById(
            "editTime"
        )?.value;


    const expenseType =
        document.getElementById(
            "editExpenseType"
        )?.value;


    const category =
        document.getElementById(
            "editCategory"
        )?.value;


    const comment =
        document.getElementById(
            "editComment"
        )?.value.trim();


    const amount =
        Number(
            document.getElementById(
                "editAmount"
            )?.value
        );


    if (!creator) {

        showError(
            "Please enter the creator."
        );

        return;
    }


    if (!expenseDate) {

        showError(
            "Please select the date."
        );

        return;
    }


    if (!expenseType) {

        showError(
            "Please select the expense type."
        );

        return;
    }


    if (!category) {

        showError(
            "Please select the category."
        );

        return;
    }


    if (!comment) {

        showError(
            "Please enter the description."
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(
            "Please enter a valid amount."
        );

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("expenses")
                .update(
                    {
                        creator:
                            creator,

                        expense_date:
                            expenseDate,

                        expense_time:
                            expenseTime ||
                            null,

                        expense_type:
                            expenseType,

                        category:
                            category,

                        comment:
                            comment,

                        amount:
                            amount
                    }
                )
                .eq(
                    "id",
                    editingExpenseId
                );


        if (error) {
            throw error;
        }


        const modalElement =
            document.getElementById(
                "editModal"
            );


        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {
            modal.hide();
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
            "Update expense error:",
            error
        );


        showError(
            error.message ||
            "Unable to update expense."
        );

    }
}


/* ============================================================
   DELETE MODAL
============================================================ */

function openDeleteModal(id) {

    deletingExpenseId =
        id;


    const modalElement =
        document.getElementById(
            "deleteModal"
        );


    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    modal.show();


    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    if (!confirmButton) {
        return;
    }


    confirmButton.onclick =
        confirmDeleteExpense;
}


/* ============================================================
   DELETE EXPENSE
============================================================ */

async function confirmDeleteExpense() {

    if (
        !deletingExpenseId
    ) {

        return;
    }


    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    const originalHTML =
        confirmButton
            ? confirmButton.innerHTML
            : "";


    if (confirmButton) {

        confirmButton.disabled = true;

        confirmButton.innerHTML =
            `<span class="spinner-border spinner-border-sm me-2"></span>
             Deleting...`;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("expenses")
                .delete()
                .eq(
                    "id",
                    deletingExpenseId
                );


        if (error) {
            throw error;
        }


        const modalElement =
            document.getElementById(
                "deleteModal"
            );


        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {
            modal.hide();
        }


        showSuccess(
            "Expense deleted successfully!"
        );


        deletingExpenseId =
            null;


        await loadExpenseTable();

    }

    catch (error) {

        console.error(
            "Delete expense error:",
            error
        );


        showError(
            error.message ||
            "Unable to delete expense."
        );

    }

    finally {

        if (confirmButton) {

            confirmButton.disabled = false;

            confirmButton.innerHTML =
                originalHTML;

        }

    }
}


/* ============================================================
   DOWNLOAD PDF
============================================================ */

async function downloadExpensePDF() {

    if (
        !filteredExpenses ||
        filteredExpenses.length === 0
    ) {

        showError(
            "There are no expenses available to download."
        );

        return;
    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        showError(
            "PDF library is not loaded. Please check your internet connection and try again."
        );

        return;
    }


    const downloadButton =
        document.getElementById(
            "downloadPdfBtn"
        );


    const originalHTML =
        downloadButton
            ? downloadButton.innerHTML
            : "";


    if (downloadButton) {

        downloadButton.disabled =
            true;

        downloadButton.innerHTML =
            `<span class="spinner-border spinner-border-sm me-2"></span>
             Creating PDF...`;

    }


    try {

        const {
            jsPDF
        } =
            window.jspdf;


        /*
           A4 landscape is used because
           there are many expense columns.
        */

        const doc =
            new jsPDF(
                {
                    orientation:
                        "landscape",

                    unit:
                        "mm",

                    format:
                        "a4"
                }
            );


        /* ====================================================
           TITLE
        ==================================================== */

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(
            18
        );


        doc.text(
            "DAILY EXPENSE REPORT",
            148,
            15,
            {
                align: "center"
            }
        );


        doc.setFontSize(
            10
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            "Daily Expense Tracker",
            148,
            21,
            {
                align: "center"
            }
        );


        /* ====================================================
           FILTER INFORMATION
        ==================================================== */

        let filterText =
            "Filters: ";


        if (
            selectedCreator ===
            "ALL"
        ) {

            filterText +=
                "All Creators";

        }

        else {

            filterText +=
                `Creator: ${selectedCreator}`;

        }


        filterText +=
            " | ";


        if (
            selectedExpenseType ===
            "ALL"
        ) {

            filterText +=
                "All Expense Types";

        }

        else {

            filterText +=
                `Expense Type: ${selectedExpenseType}`;

        }


        doc.setFontSize(
            8
        );


        doc.text(
            filterText,
            148,
            27,
            {
                align: "center"
            }
        );


        /* ====================================================
           GENERATED DATE
        ==================================================== */

        const generatedDate =
            new Date()
                .toLocaleString(
                    "en-IN"
                );


        doc.text(
            `Generated: ${generatedDate}`,
            148,
            32,
            {
                align: "center"
            }
        );


        /* ====================================================
           TOTAL
        ==================================================== */

        const totalAmount =
            filteredExpenses.reduce(
                function (
                    sum,
                    expense
                ) {

                    return (
                        sum +
                        Number(
                            expense.amount ||
                            0
                        )
                    );

                },
                0
            );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(
            10
        );


        doc.text(
            `Total Entries: ${filteredExpenses.length}`,
            15,
            41
        );


        doc.text(
            `Grand Total: ${formatCurrency(totalAmount)}`,
            282,
            41,
            {
                align: "right"
            }
        );


        /* ====================================================
           TABLE DATA
        ==================================================== */

        const tableRows =
            filteredExpenses.map(
                function (
                    expense,
                    index
                ) {

                    return [

                        String(
                            index + 1
                        ),

                        safePDFText(
                            expense.creator
                        ),

                        formatDate(
                            expense.expense_date
                        ),

                        formatTime(
                            expense.expense_time
                        ),

                        safePDFText(
                            expense.expense_type
                        ),

                        safePDFText(
                            expense.category
                        ),

                        safePDFText(
                            expense.comment
                        ),

                        formatPDFAmount(
                            Number(
                                expense.amount ||
                                0
                            )
                        )

                    ];

                }
            );


        /* ====================================================
           AUTO TABLE
        ==================================================== */

        doc.autoTable(
            {
                startY: 46,

                head: [
                    [
                        "S.No.",
                        "Creator",
                        "Date",
                        "Time",
                        "Expense Type",
                        "Category",
                        "Description",
                        "Amount"
                    ]
                ],

                body:
                    tableRows,

                theme:
                    "grid",

                styles:
                    {
                        font:
                            "helvetica",

                        fontSize:
                            7,

                        cellPadding:
                            2,

                        overflow:
                            "linebreak",

                        valign:
                            "middle"
                    },

                headStyles:
                    {
                        fontStyle:
                            "bold",

                        halign:
                            "center"
                    },

                columnStyles:
                    {
                        0:
                            {
                                cellWidth:
                                    12,
                                halign:
                                    "center"
                            },

                        1:
                            {
                                cellWidth:
                                    25
                            },

                        2:
                            {
                                cellWidth:
                                    22,
                                halign:
                                    "center"
                            },

                        3:
                            {
                                cellWidth:
                                    18,
                                halign:
                                    "center"
                            },

                        4:
                            {
                                cellWidth:
                                    30
                            },

                        5:
                            {
                                cellWidth:
                                    25
                            },

                        6:
                            {
                                cellWidth:
                                    "auto"
                            },

                        7:
                            {
                                cellWidth:
                                    27,
                                halign:
                                    "right"
                            }
                    },

                foot:
                    [
                        [
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                            "GRAND TOTAL",
                            formatPDFAmount(
                                totalAmount
                            )
                        ]
                    ],

                footStyles:
                    {
                        fontStyle:
                            "bold"
                    },

                margin:
                    {
                        left:
                            10,

                        right:
                            10
                    },

                didDrawPage:
                    function (
                        data
                    ) {

                        const pageCount =
                            doc.getNumberOfPages();


                        const pageNumber =
                            doc.internal
                                .getCurrentPageInfo()
                                .pageNumber;


                        doc.setFontSize(
                            7
                        );


                        doc.setFont(
                            "helvetica",
                            "normal"
                        );


                        doc.text(
                            `Page ${pageNumber} of ${pageCount}`,
                            148,
                            203,
                            {
                                align:
                                    "center"
                            }
                        );


                        doc.text(
                            "Daily Expense Tracker",
                            10,
                            203
                        );

                    }

            }
        );


        /* ====================================================
           FILE NAME
        ==================================================== */

        const now =
            new Date();


        const datePart =
            now
                .toISOString()
                .slice(
                    0,
                    10
                );


        const timePart =
            [
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getSeconds()
                ).padStart(
                    2,
                    "0"
                )
            ].join(
                "-"
            );


        const fileName =
            `Daily_Expense_Report_${datePart}_${timePart}.pdf`;


        /* ====================================================
           SAVE
        ==================================================== */

        doc.save(
            fileName
        );


        showSuccess(
            "PDF generated successfully."
        );

    }

    catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        showError(
            "Unable to create PDF. Please try again."
        );

    }

    finally {

        if (downloadButton) {

            downloadButton.disabled =
                false;

            downloadButton.innerHTML =
                originalHTML;

        }

    }
}


/* ============================================================
   PDF TEXT
============================================================ */

function safePDFText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )
        .replace(
            /\r?\n|\r/g,
            " "
        )
        .trim();
}


/* ============================================================
   PDF AMOUNT
============================================================ */

function formatPDFAmount(amount) {

    return (
        "Rs. " +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );
}


/* ============================================================
   DASHBOARD
============================================================ */

async function loadDashboard() {

    if (
        !supabaseClient
    ) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("expenses")
                .select("*")
                .order(
                    "expense_date",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {
            throw error;
        }


        const expenses =
            data || [];


        buildDashboard(
            expenses
        );

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showError(
            error.message ||
            "Unable to load dashboard."
        );

    }
}


/* ============================================================
   BUILD DASHBOARD
============================================================ */

function buildDashboard(
    expenses
) {

    const now =
        new Date();


    const currentYear =
        now.getFullYear();


    const currentMonth =
        now.getMonth();


    const previousDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );


    const previousYear =
        previousDate.getFullYear();


    const previousMonth =
        previousDate.getMonth();


    const currentData =
        getMonthData(
            expenses,
            currentYear,
            currentMonth
        );


    const previousData =
        getMonthData(
            expenses,
            previousYear,
            previousMonth
        );


    const currentName =
        formatMonthName(
            currentYear,
            currentMonth
        );


    const previousName =
        formatMonthName(
            previousYear,
            previousMonth
        );


    setText(
        "currentMonthName",
        currentName
    );


    setText(
        "previousMonthName",
        previousName
    );


    setText(
        "currentMonthTotal",
        formatCurrency(
            currentData.total
        )
    );


    setText(
        "previousMonthTotal",
        formatCurrency(
            previousData.total
        )
    );


    const difference =
        currentData.total -
        previousData.total;


    setText(
        "monthDifference",
        formatCurrency(
            difference
        )
    );


    let percentage =
        0;


    if (
        previousData.total !==
        0
    ) {

        percentage =
            (
                difference /
                previousData.total
            ) *
            100;

    }


    setText(
        "differencePercentage",
        `${percentage.toFixed(2)}%`
    );


    const monthlyAverage =
        calculateMonthlyAverage(
            expenses
        );


    setText(
        "monthlyAverage",
        formatCurrency(
            monthlyAverage
        )
    );


    setText(
        "compareCurrentName",
        currentName
    );


    setText(
        "comparePreviousName",
        previousName
    );


    setText(
        "compareCurrentAmount",
        formatCurrency(
            currentData.total
        )
    );


    setText(
        "comparePreviousAmount",
        formatCurrency(
            previousData.total
        )
    );


    buildComparisonResult(
        currentData.total,
        previousData.total
    );


    buildMonthlyChart(
        expenses
    );


    buildCategoryComparison(
        currentData.expenses
    );


    buildMonthlyTable(
        expenses
    );
}


/* ============================================================
   MONTH DATA
============================================================ */

function getMonthData(
    expenses,
    year,
    month
) {

    const monthExpenses =
        expenses.filter(
            function (expense) {

                if (
                    !expense.expense_date
                ) {

                    return false;
                }


                const date =
                    new Date(
                        expense.expense_date +
                        "T00:00:00"
                    );


                return (
                    date.getFullYear() ===
                    year &&
                    date.getMonth() ===
                    month
                );

            }
        );


    const total =
        monthExpenses.reduce(
            function (
                sum,
                expense
            ) {

                return (
                    sum +
                    Number(
                        expense.amount ||
                        0
                    )
                );

            },
            0
        );


    return {
        expenses:
            monthExpenses,

        total:
            total,

        entries:
            monthExpenses.length
    };
}


/* ============================================================
   MONTH NAME
============================================================ */

function formatMonthName(
    year,
    month
) {

    const date =
        new Date(
            year,
            month,
            1
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            month:
                "long",

            year:
                "numeric"
        }
    );
}


/* ============================================================
   MONTHLY AVERAGE
============================================================ */

function calculateMonthlyAverage(
    expenses
) {

    if (
        expenses.length ===
        0
    ) {

        return 0;
    }


    const monthlyTotals =
        {};


    expenses.forEach(
        function (expense) {

            if (
                !expense.expense_date
            ) {

                return;
            }


            const date =
                new Date(
                    expense.expense_date +
                    "T00:00:00"
                );


            const key =
                `${date.getFullYear()}-${date.getMonth()}`;


            if (
                !monthlyTotals[key]
            ) {

                monthlyTotals[key] =
                    0;

            }


            monthlyTotals[key] +=
                Number(
                    expense.amount ||
                    0
                );

        }
    );


    const values =
        Object.values(
            monthlyTotals
        );


    if (
        values.length ===
        0
    ) {

        return 0;
    }


    const total =
        values.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );


    return (
        total /
        values.length
    );
}


/* ============================================================
   COMPARISON RESULT
============================================================ */

function buildComparisonResult(
    current,
    previous
) {

    const element =
        document.getElementById(
            "comparisonResult"
        );


    if (!element) {
        return;
    }


    if (
        current === 0 &&
        previous === 0
    ) {

        element.textContent =
            "No expense data available for comparison.";

        return;
    }


    const difference =
        current -
        previous;


    if (
        difference > 0
    ) {

        element.innerHTML =
            `<i class="fa-solid fa-arrow-trend-up me-2"></i>
             Expense increased by
             <strong>
                ${formatCurrency(difference)}
             </strong>
             compared with the previous month.`;

    }

    else if (
        difference < 0
    ) {

        element.innerHTML =
            `<i class="fa-solid fa-arrow-trend-down me-2"></i>
             Expense decreased by
             <strong>
                ${formatCurrency(
                    Math.abs(difference)
                )}
             </strong>
             compared with the previous month.`;

    }

    else {

        element.innerHTML =
            `<i class="fa-solid fa-equals me-2"></i>
             Expense is the same as the previous month.`;

    }
}


/* ============================================================
   MONTHLY CHART
============================================================ */

function buildMonthlyChart(
    expenses
) {

    const chart =
        document.getElementById(
            "monthlyChart"
        );


    if (!chart) {
        return;
    }


    const monthlyMap =
        {};


    expenses.forEach(
        function (expense) {

            if (
                !expense.expense_date
            ) {

                return;
            }


            const date =
                new Date(
                    expense.expense_date +
                    "T00:00:00"
                );


            const key =
                `${date.getFullYear()}-${date.getMonth()}`;


            if (
                !monthlyMap[key]
            ) {

                monthlyMap[key] = {

                    year:
                        date.getFullYear(),

                    month:
                        date.getMonth(),

                    total:
                        0

                };

            }


            monthlyMap[key].total +=
                Number(
                    expense.amount ||
                    0
                );

        }
    );


    let months =
        Object.values(
            monthlyMap
        )
        .sort(
            function (a, b) {

                if (
                    a.year !==
                    b.year
                ) {

                    return (
                        a.year -
                        b.year
                    );

                }


                return (
                    a.month -
                    b.month
                );

            }
        );


    if (
        months.length ===
        0
    ) {

        chart.innerHTML =
            `<div class="w-100 text-center text-muted">
                No monthly expense data available.
             </div>`;

        return;
    }


    /*
       Show last 12 months
    */

    months =
        months.slice(
            -12
        );


    const max =
        Math.max(
            ...months.map(
                item =>
                    item.total
            )
        );


    chart.innerHTML =
        months
            .map(
                function (item) {

                    const height =
                        max > 0
                            ? (
                                item.total /
                                max
                              ) *
                              180
                            : 5;


                    return `
                        <div class="chart-item">

                            <div class="chart-value">
                                ${formatCurrency(
                                    item.total
                                )}
                            </div>

                            <div class="chart-bar"
                                 style="height:${Math.max(
                                     height,
                                     5
                                 )}px;">
                            </div>

                            <div class="chart-month">
                                ${new Date(
                                    item.year,
                                    item.month,
                                    1
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        month:
                                            "short",

                                        year:
                                            "2-digit"
                                    }
                                )}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");
}


/* ============================================================
   CATEGORY COMPARISON
============================================================ */

function buildCategoryComparison(
    expenses
) {

    const container =
        document.getElementById(
            "categoryComparison"
        );


    if (!container) {
        return;
    }


    const categoryTotals =
        {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";


            if (
                !categoryTotals[
                    category
                ]
            ) {

                categoryTotals[
                    category
                ] = 0;

            }


            categoryTotals[
                category
            ] +=
                Number(
                    expense.amount ||
                    0
                );

        }
    );


    const categories =
        Object.entries(
            categoryTotals
        )
        .sort(
            function (a, b) {

                return (
                    b[1] -
                    a[1]
                );

            }
        );


    if (
        categories.length ===
        0
    ) {

        container.innerHTML =
            `<p class="text-muted">
                No category expenses for the current month.
             </p>`;

        return;
    }


    const max =
        Math.max(
            ...categories.map(
                item =>
                    item[1]
            )
        );


    container.innerHTML =
        categories
            .map(
                function (
                    item
                ) {

                    const category =
                        item[0];


                    const amount =
                        item[1];


                    const width =
                        max > 0
                            ? (
                                amount /
                                max
                              ) *
                              100
                            : 0;


                    return `
                        <div class="category-row">

                            <div class="category-header">

                                <span>
                                    ${escapeHTML(
                                        category
                                    )}
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        amount
                                    )}
                                </strong>

                            </div>

                            <div class="category-bar-wrapper">

                                <div class="category-bar"
                                     style="width:${width}%;">
                                </div>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");
}


/* ============================================================
   MONTHLY TABLE
============================================================ */

function buildMonthlyTable(
    expenses
) {

    const tbody =
        document.getElementById(
            "monthlyTableBody"
        );


    if (!tbody) {
        return;
    }


    const monthlyMap =
        {};


    expenses.forEach(
        function (expense) {

            if (
                !expense.expense_date
            ) {

                return;
            }


            const date =
                new Date(
                    expense.expense_date +
                    "T00:00:00"
                );


            const key =
                `${date.getFullYear()}-${date.getMonth()}`;


            if (
                !monthlyMap[key]
            ) {

                monthlyMap[key] = {

                    year:
                        date.getFullYear(),

                    month:
                        date.getMonth(),

                    total:
                        0,

                    entries:
                        0

                };

            }


            monthlyMap[key].total +=
                Number(
                    expense.amount ||
                    0
                );


            monthlyMap[key].entries++;

        }
    );


    const months =
        Object.values(
            monthlyMap
        )
        .sort(
            function (a, b) {

                if (
                    a.year !==
                    b.year
                ) {

                    return (
                        b.year -
                        a.year
                    );

                }


                return (
                    b.month -
                    a.month
                );

            }
        );


    if (
        months.length ===
        0
    ) {

        tbody.innerHTML =
            `<tr>
                <td colspan="5"
                    class="text-center text-muted py-4">

                    No monthly data available.

                </td>
             </tr>`;

        return;
    }


    tbody.innerHTML =
        months
            .map(
                function (
                    item,
                    index
                ) {

                    const previous =
                        months[
                            index + 1
                        ];


                    let difference =
                        0;


                    let change =
                        0;


                    if (
                        previous
                    ) {

                        difference =
                            item.total -
                            previous.total;


                        if (
                            previous.total !==
                            0
                        ) {

                            change =
                                (
                                    difference /
                                    previous.total
                                ) *
                                100;

                        }

                    }


                    const differenceText =
                        formatCurrency(
                            difference
                        );


                    const changeText =
                        `${change.toFixed(2)}%`;


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${formatMonthName(
                                        item.year,
                                        item.month
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${item.entries}
                            </td>

                            <td>
                                <strong>
                                    ${formatCurrency(
                                        item.total
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${differenceText}
                            </td>

                            <td>
                                ${changeText}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");
}


/* ============================================================
   NAVIGATION
============================================================ */

function goToExpenses() {

    window.location.href =
        "expense.html";
}


function goToDashboard() {

    window.location.href =
        "dashboard.html";
}


function goBack() {

    if (
        document.referrer &&
        document.referrer !==
            window.location.href
    ) {

        window.history.back();

    }

    else {

        window.location.href =
            "index.html";

    }
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const parts =
        String(
            dateString
        ).split("-");


    if (
        parts.length !==
        3
    ) {

        return dateString;
    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );
}


/* ============================================================
   TIME FORMAT
============================================================ */

function formatTime(
    timeString
) {

    if (!timeString) {
        return "-";
    }


    const value =
        String(
            timeString
        ).substring(
            0,
            5
        );


    if (
        !value.includes(":")
    ) {

        return value;
    }


    const [
        hourString,
        minuteString
    ] =
        value.split(":");


    let hour =
        Number(
            hourString
        );


    const minute =
        minuteString;


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (
        hour === 0
    ) {

        hour = 12;

    }


    return (
        `${hour}:${minute} ${suffix}`
    );
}


/* ============================================================
   TODAY STRING
============================================================ */

function getTodayString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/* ============================================================
   CURRENCY
============================================================ */

function formatCurrency(
    amount
) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );
}


/* ============================================================
   SET TEXT
============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(
    value
) {

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

function showSuccess(
    message
) {

    const messageElement =
        document.getElementById(
            "successToastMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    const toastElement =
        document.getElementById(
            "successToast"
        );


    if (
        toastElement &&
        typeof bootstrap !==
            "undefined"
    ) {

        const toast =
            bootstrap.Toast
                .getOrCreateInstance(
                    toastElement,
                    {
                        delay:
                            3000
                    }
                );


        toast.show();

    }

    else {

        console.log(
            message
        );

    }
}


/* ============================================================
   ERROR TOAST
============================================================ */

function showError(
    message
) {

    const messageElement =
        document.getElementById(
            "errorToastMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    const toastElement =
        document.getElementById(
            "errorToast"
        );


    if (
        toastElement &&
        typeof bootstrap !==
            "undefined"
    ) {

        const toast =
            bootstrap.Toast
                .getOrCreateInstance(
                    toastElement,
                    {
                        delay:
                            5000
                    }
                );


        toast.show();

    }

    else {

        console.error(
            message
        );

    }
}

function goToSharedExpenses() {

    window.location.href =
        "shared-expenses.html";

}

function goToSharedExpenses() {

    window.location.href =
        "shared-expenses.html";

}
