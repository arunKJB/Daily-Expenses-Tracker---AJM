/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://sdkhtfovazarqvzplagq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ve8mcuOtXSLpV_QS-YBqyg_JEguxAZ8";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let deleteId = null;
let editId = null;


/* =====================================================
   FILTER + PAGINATION VARIABLES
===================================================== */

let allExpenses = [];

let filteredExpenses = [];

let currentPage = 1;

let rowsPerPage = 10;

let selectedCreator = "ALL";

let selectedExpenseType = "ALL";


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setCurrentDate();

        setCurrentTime();

        setFormDate();

        await setNextSerialNumber();

        await loadExpenseTable();

        await loadDashboard();

        initializeFilters();

        initializePagination();

    }
);


/* =====================================================
   CURRENT DATE
===================================================== */

function setCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;

    const today =
        new Date();

    element.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


/* =====================================================
   CURRENT TIME
===================================================== */

function setCurrentTime() {

    const input =
        document.getElementById(
            "expenseTime"
        );

    if (!input) return;

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    input.value =
        `${hours}:${minutes}`;
}


/* =====================================================
   FORM DATE
===================================================== */

function setFormDate() {

    const input =
        document.getElementById(
            "expenseDate"
        );

    if (!input) return;

    input.value =
        getTodayDate();
}


/* =====================================================
   TODAY DATE
===================================================== */

function getTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


/* =====================================================
   GET ALL EXPENSES
===================================================== */

async function getExpenses() {

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

        console.error(
            "Error loading expenses:",
            error
        );

        alert(
            "Unable to load expenses.\n\n" +
            error.message
        );

        return [];
    }

    return data || [];
}


/* =====================================================
   GET NEXT SERIAL NUMBER
===================================================== */

async function getNextSerialNumber() {

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

        console.error(
            "Serial number error:",
            error
        );

        return 1;
    }

    return (count || 0) + 1;
}


/* =====================================================
   SET NEXT SERIAL NUMBER
===================================================== */

async function setNextSerialNumber() {

    const input =
        document.getElementById(
            "serialNo"
        );

    if (!input) return;

    input.value =
        await getNextSerialNumber();
}


/* =====================================================
   ADD EXPENSE
===================================================== */

const expenseForm =
    document.getElementById(
        "expenseForm"
    );

if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const creator =
                document.getElementById(
                    "creator"
                ).value.trim();

            const date =
                document.getElementById(
                    "expenseDate"
                ).value;

            const time =
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
                parseFloat(
                    document.getElementById(
                        "amount"
                    ).value
                );


            /* =================================================
               VALIDATION
            ================================================= */

            if (!creator) {

                alert(
                    "Please enter Creator."
                );

                return;
            }

            if (!date) {

                alert(
                    "Please select Date."
                );

                return;
            }

            if (!expenseType) {

                alert(
                    "Please select Expense Type."
                );

                return;
            }

            if (!category) {

                alert(
                    "Please select Category."
                );

                return;
            }

            if (!comment) {

                alert(
                    "Please enter Description."
                );

                return;
            }

            if (
                isNaN(amount) ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid Amount greater than ₹0."
                );

                return;
            }


            /* =================================================
               INSERT
            ================================================= */

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .insert([
                        {
                            creator: creator,
                            expense_date: date,
                            expense_time: time || null,
                            expense_type: expenseType,
                            category: category,
                            comment: comment,
                            amount: amount
                        }
                    ])
                    .select();


            if (error) {

                console.error(
                    "Insert error:",
                    error
                );

                alert(
                    "Expense could not be saved.\n\n" +
                    error.message
                );

                return;
            }


            /* =================================================
               SUCCESS
            ================================================= */

            showSuccessToast();

            expenseForm.reset();

            setFormDate();

            setCurrentTime();

            await setNextSerialNumber();

            currentPage = 1;

            await loadExpenseTable();

            await loadDashboard();

        }
    );
}


/* =====================================================
   SUCCESS TOAST
===================================================== */

function showSuccessToast() {

    const element =
        document.getElementById(
            "successToast"
        );

    if (!element) return;

    const toast =
        new bootstrap.Toast(
            element
        );

    toast.show();
}


/* =====================================================
   NAVIGATION
===================================================== */

function goToExpenses() {

    window.location.href =
        "expense.html";
}


function goToDashboard() {

    window.location.href =
        "dashboard.html";
}


function goBack() {

    window.location.href =
        "index.html";
}


/* =====================================================
   INITIALIZE FILTERS
===================================================== */

function initializeFilters() {

    const creatorFilter =
        document.getElementById(
            "creatorFilter"
        );

    const expenseTypeFilter =
        document.getElementById(
            "expenseTypeFilter"
        );


    /* =================================================
       CREATOR FILTER
    ================================================= */

    if (creatorFilter) {

        creatorFilter.addEventListener(
            "change",
            function () {

                selectedCreator =
                    this.value;

                currentPage = 1;

                applyFilters();

            }
        );
    }


    /* =================================================
       EXPENSE TYPE FILTER
    ================================================= */

    if (expenseTypeFilter) {

        expenseTypeFilter.addEventListener(
            "change",
            function () {

                selectedExpenseType =
                    this.value;

                currentPage = 1;

                applyFilters();

            }
        );
    }


    /* =================================================
       CLEAR FILTER
    ================================================= */

    const clearFilterBtn =
        document.getElementById(
            "clearFilterBtn"
        );

    if (clearFilterBtn) {

        clearFilterBtn.addEventListener(
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

                if (expenseTypeFilter) {

                    expenseTypeFilter.value =
                        "ALL";
                }

                applyFilters();

            }
        );
    }


    populateCreatorFilter();

    populateExpenseTypeFilter();
}


/* =====================================================
   POPULATE CREATOR FILTER
===================================================== */

function populateCreatorFilter() {

    const filter =
        document.getElementById(
            "creatorFilter"
        );

    if (!filter) return;


    const currentValue =
        filter.value || "ALL";


    const creators =
        [
            ...new Set(
                allExpenses
                    .map(
                        expense =>
                            expense.creator
                    )
                    .filter(
                        creator =>
                            creator &&
                            String(
                                creator
                            ).trim() !== ""
                    )
            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    filter.innerHTML = `
        <option value="ALL">
            All Creators
        </option>
    `;


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

            filter.appendChild(
                option
            );

        }
    );


    if (
        creators.includes(
            currentValue
        )
    ) {

        filter.value =
            currentValue;

    }

    else {

        filter.value =
            "ALL";

    }
}


/* =====================================================
   POPULATE EXPENSE TYPE FILTER
===================================================== */

function populateExpenseTypeFilter() {

    const filter =
        document.getElementById(
            "expenseTypeFilter"
        );

    if (!filter) return;


    const currentValue =
        filter.value || "ALL";


    const types =
        [
            ...new Set(
                allExpenses
                    .map(
                        expense =>
                            expense.expense_type
                    )
                    .filter(
                        type =>
                            type &&
                            String(
                                type
                            ).trim() !== ""
                    )
            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    filter.innerHTML = `
        <option value="ALL">
            All Expense Types
        </option>
    `;


    types.forEach(
        function (type) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                type;

            option.textContent =
                type;

            filter.appendChild(
                option
            );

        }
    );


    if (
        types.includes(
            currentValue
        )
    ) {

        filter.value =
            currentValue;

    }

    else {

        filter.value =
            "ALL";

    }
}


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters() {

    filteredExpenses =
        allExpenses.filter(
            function (expense) {

                const creatorMatch =
                    selectedCreator === "ALL" ||
                    String(
                        expense.creator || ""
                    ).trim() ===
                    String(
                        selectedCreator
                    ).trim();


                const typeMatch =
                    selectedExpenseType === "ALL" ||
                    String(
                        expense.expense_type || ""
                    ).trim() ===
                    String(
                        selectedExpenseType
                    ).trim();


                return (
                    creatorMatch &&
                    typeMatch
                );

            }
        );


    /* =================================================
       IMPORTANT:
       GRAND TOTAL IS CALCULATED FROM
       filteredExpenses, NOT CURRENT PAGE.
    ================================================= */

    updateSummary(
        filteredExpenses
    );


    renderExpenseTable();

    updatePagination();

}


/* =====================================================
   LOAD EXPENSE TABLE
===================================================== */

async function loadExpenseTable() {

    const body =
        document.getElementById(
            "expenseTableBody"
        );

    if (!body) {

        console.log(
            "expenseTableBody not found"
        );

        return;
    }


    console.log(
        "Loading expenses from Supabase..."
    );


    allExpenses =
        await getExpenses();


    console.log(
        "Expenses:",
        allExpenses
    );


    populateCreatorFilter();

    populateExpenseTypeFilter();


    applyFilters();
}


/* =====================================================
   RENDER EXPENSE TABLE
===================================================== */

function renderExpenseTable() {

    const body =
        document.getElementById(
            "expenseTableBody"
        );

    if (!body) return;


    body.innerHTML = "";


    /* =================================================
       EMPTY DATA
    ================================================= */

    if (
        filteredExpenses.length === 0
    ) {

        showEmptyMessage();

        updateSummary([]);

        updatePagination();

        return;
    }


    hideEmptyMessage();


    /* =================================================
       NEWEST FIRST
    ================================================= */

    const sorted =
        [...filteredExpenses].reverse();


    /* =================================================
       PAGINATION CALCULATION
    ================================================= */

    const totalEntries =
        sorted.length;


    const totalPages =
        Math.ceil(
            totalEntries /
            rowsPerPage
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    if (
        currentPage < 1
    ) {

        currentPage = 1;

    }


    const startIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage;


    const endIndex =
        Math.min(
            startIndex +
            rowsPerPage,
            totalEntries
        );


    const pageExpenses =
        sorted.slice(
            startIndex,
            endIndex
        );


    /* =================================================
       CREATE ROWS
    ================================================= */

    pageExpenses.forEach(
        function (
            expense,
            index
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            const displaySerial =
                startIndex +
                index +
                1;


            row.innerHTML = `

                <td>
                    <strong>
                        ${displaySerial}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        expense.creator
                    )}
                </td>

                <td>
                    ${
                        expense.expense_date
                        ? formatDate(
                            expense.expense_date
                        )
                        : "-"
                    }
                </td>

                <td>
                    ${
                        expense.expense_time
                        ? escapeHTML(
                            String(
                                expense.expense_time
                            ).substring(
                                0,
                                5
                            )
                        )
                        : "-"
                    }
                </td>

                <td>

                    <span class="badge bg-primary">

                        ${escapeHTML(
                            expense.expense_type
                        )}

                    </span>

                </td>

                <td>
                    ${escapeHTML(
                        expense.category
                    )}
                </td>

                <td class="comment-cell">
                    ${escapeHTML(
                        expense.comment
                    )}
                </td>

                <td class="amount-cell">

                    ₹${Number(
                        expense.amount || 0
                    ).toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editExpense(${expense.id})">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );


    /* =================================================
       UPDATE PAGINATION
    ================================================= */

    updatePagination();


    /* =================================================
       IMPORTANT:
       TOTAL IS FOR ALL FILTERED RECORDS,
       NOT ONLY CURRENT PAGE.
    ================================================= */

    updateSummary(
        filteredExpenses
    );
}


/* =====================================================
   INITIALIZE PAGINATION
===================================================== */

function initializePagination() {

    const expenseCard =
        document.querySelector(
            ".expense-card"
        );

    if (!expenseCard) return;


    let paginationContainer =
        document.getElementById(
            "expensePaginationContainer"
        );


    /* =================================================
       IF HTML DOES NOT HAVE PAGINATION,
       CREATE IT AUTOMATICALLY.
    ================================================= */

    if (!paginationContainer) {

        paginationContainer =
            document.createElement(
                "div"
            );

        paginationContainer.id =
            "expensePaginationContainer";

        paginationContainer.className =
            "expense-pagination-container";


        paginationContainer.innerHTML = `

            <div class="pagination-left">

                <div class="showing-text"
                     id="showingEntries">

                    Showing 0 - 0 of 0 entries

                </div>

            </div>


            <div class="pagination-right">

                <div class="rows-control">

                  
                </div>


                <div
                    id="paginationButtons"
                    class="pagination-buttons">
                </div>

            </div>

        `;


        expenseCard.appendChild(
            paginationContainer
        );


        /* =================================================
           ROWS PER PAGE
        ================================================= */

        const rowsSelect =
            document.getElementById(
                "rowsPerPage"
            );


        if (rowsSelect) {

            rowsSelect.value =
                String(
                    rowsPerPage
                );


            rowsSelect.addEventListener(
                "change",
                function () {

                    rowsPerPage =
                        parseInt(
                            this.value,
                            10
                        );


                    currentPage =
                        1;


                    renderExpenseTable();

                }
            );

        }

    }


    addPaginationStyles();

    updatePagination();
}


/* =====================================================
   UPDATE PAGINATION
===================================================== */

function updatePagination() {

    const showingEntries =
        document.getElementById(
            "showingEntries"
        );


    const paginationButtons =
        document.getElementById(
            "paginationButtons"
        );


    if (
        !showingEntries &&
        !paginationButtons
    ) {

        initializePagination();

        return;
    }


    const total =
        filteredExpenses.length;


    /* =================================================
       EMPTY
    ================================================= */

    if (total === 0) {

        if (showingEntries) {

            showingEntries.textContent =
                "Showing 0 - 0 of 0 entries";

        }


        if (paginationButtons) {

            paginationButtons.innerHTML =
                "";

        }

        return;
    }


    const totalPages =
        Math.ceil(
            total /
            rowsPerPage
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (
            currentPage -
            1
        ) *
        rowsPerPage +
        1;


    const end =
        Math.min(
            currentPage *
            rowsPerPage,
            total
        );


    /* =================================================
       SHOWING TEXT
    ================================================= */

    if (showingEntries) {

        showingEntries.textContent =
            `Showing ${start} - ${end} of ${total} entries`;

    }


    /* =================================================
       PAGINATION BUTTONS
    ================================================= */

    if (!paginationButtons) return;


    paginationButtons.innerHTML =
        "";


    /* =================================================
       PREVIOUS
    ================================================= */

    const previousButton =
        document.createElement(
            "button"
        );

    previousButton.type =
        "button";

    previousButton.className =
        "page-btn";

    previousButton.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;


    if (
        currentPage === 1
    ) {

        previousButton.disabled =
            true;

    }


    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderExpenseTable();

                scrollToExpenseTable();

            }

        }
    );


    paginationButtons.appendChild(
        previousButton
    );


    /* =================================================
       PAGE NUMBERS
    ================================================= */

    const pageNumbers =
        getPageNumbers(
            currentPage,
            totalPages
        );


    pageNumbers.forEach(
        function (page) {

            if (page === "...") {

                const dots =
                    document.createElement(
                        "span"
                    );

                dots.className =
                    "page-dots";

                dots.textContent =
                    "...";

                paginationButtons.appendChild(
                    dots
                );

                return;
            }


            const pageButton =
                document.createElement(
                    "button"
                );


            pageButton.type =
                "button";


            pageButton.className =
                "page-btn";


            if (
                page === currentPage
            ) {

                pageButton.classList.add(
                    "active"
                );

            }


            pageButton.textContent =
                page;


            pageButton.addEventListener(
                "click",
                function () {

                    currentPage =
                        page;

                    renderExpenseTable();

                    scrollToExpenseTable();

                }
            );


            paginationButtons.appendChild(
                pageButton
            );

        }
    );


    /* =================================================
       NEXT
    ================================================= */

    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.type =
        "button";


    nextButton.className =
        "page-btn";


    nextButton.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    if (
        currentPage ===
        totalPages
    ) {

        nextButton.disabled =
            true;

    }


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderExpenseTable();

                scrollToExpenseTable();

            }

        }
    );


    paginationButtons.appendChild(
        nextButton
    );
}


/* =====================================================
   PAGE NUMBER GENERATOR
===================================================== */

function getPageNumbers(
    current,
    total
) {

    const pages = [];


    if (
        total <= 7
    ) {

        for (
            let i = 1;
            i <= total;
            i++
        ) {

            pages.push(i);

        }

        return pages;
    }


    pages.push(1);


    if (
        current > 4
    ) {

        pages.push("...");

    }


    const start =
        Math.max(
            2,
            current - 1
        );


    const end =
        Math.min(
            total - 1,
            current + 1
        );


    for (
        let i = start;
        i <= end;
        i++
    ) {

        pages.push(i);

    }


    if (
        current <
        total - 3
    ) {

        pages.push("...");

    }


    pages.push(
        total
    );


    return pages;
}


/* =====================================================
   SCROLL TO TABLE
===================================================== */

function scrollToExpenseTable() {

    const table =
        document.querySelector(
            ".expense-card"
        );

    if (!table) return;


    table.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );
}


/* =====================================================
   PAGINATION CSS
===================================================== */

function addPaginationStyles() {

    if (
        document.getElementById(
            "expensePaginationStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "expensePaginationStyles";


    style.textContent = `

        .expense-pagination-container {

            display: flex;

            justify-content: space-between;

            align-items: center;

            gap: 20px;

            padding: 25px 0 5px 0;

            border-top: 1px solid #dee2e6;

            margin-top: 10px;

            flex-wrap: wrap;

        }


        .pagination-left {

            display: flex;

            align-items: center;

        }


        .showing-text {

            color: #52677d;

            font-size: 16px;

        }


        .pagination-right {

            display: flex;

            align-items: center;

            gap: 20px;

            flex-wrap: wrap;

        }


        .rows-control {

            display: flex;

            align-items: center;

            gap: 7px;

            color: #52677d;

            font-size: 15px;

        }


        .rows-control select {

            width: 70px;

            border: 1px solid #0d6efd;

            color: #0d6efd;

        }


        .pagination-buttons {

            display: flex;

            align-items: center;

            gap: 5px;

        }


        .page-btn {

            min-width: 34px;

            height: 38px;

            padding: 5px 10px;

            border: 1px solid #0d6efd;

            background: white;

            color: #0d6efd;

            border-radius: 6px;

            font-size: 16px;

            cursor: pointer;

            transition: 0.2s;

        }


        .page-btn:hover:not(:disabled) {

            background: #0d6efd;

            color: white;

        }


        .page-btn.active {

            background: #0d6efd;

            color: white;

        }


        .page-btn:disabled {

            opacity: 0.45;

            cursor: not-allowed;

        }


        .page-dots {

            min-width: 25px;

            text-align: center;

            color: #52677d;

        }


        @media (max-width: 768px) {

            .expense-pagination-container {

                flex-direction: column;

                align-items: flex-start;

            }


            .pagination-right {

                width: 100%;

                justify-content: space-between;

            }


            .showing-text {

                font-size: 14px;

            }

        }

    `;


    document.head.appendChild(
        style
    );
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    dateString
) {

    if (!dateString) return "-";


    const parts =
        String(
            dateString
        ).split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(
    expenses
) {

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


    const grandTotal =
        document.getElementById(
            "tableGrandTotal"
        );


    const today =
        getTodayDate();


    const todayCount =
        expenses.filter(
            expense =>
                expense.expense_date ===
                today
        ).length;


    const total =
        expenses.reduce(
            function (
                sum,
                expense
            ) {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );


    if (totalEntries) {

        totalEntries.textContent =
            expenses.length;

    }


    if (todayEntries) {

        todayEntries.textContent =
            todayCount;

    }


    if (totalAmount) {

        totalAmount.textContent =
            formatCurrency(
                total
            );

    }


    if (grandTotal) {

        grandTotal.textContent =
            formatCurrency(
                total
            );

    }
}


/* =====================================================
   EDIT EXPENSE
===================================================== */

async function editExpense(
    id
) {

    const {
        data: expense,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (
        error ||
        !expense
    ) {

        console.error(
            error
        );

        alert(
            "Expense not found."
        );

        return;
    }


    editId =
        id;


    const serial =
        document.getElementById(
            "editSerialNo"
        );


    const creator =
        document.getElementById(
            "editCreator"
        );


    const date =
        document.getElementById(
            "editDate"
        );


    const time =
        document.getElementById(
            "editTime"
        );


    const type =
        document.getElementById(
            "editExpenseType"
        );


    const category =
        document.getElementById(
            "editCategory"
        );


    const comment =
        document.getElementById(
            "editComment"
        );


    const amount =
        document.getElementById(
            "editAmount"
        );


    if (serial) {

        serial.value =
            expense.id;

    }


    if (creator) {

        creator.value =
            expense.creator || "";

    }


    if (date) {

        date.value =
            expense.expense_date || "";

    }


    if (time) {

        time.value =
            expense.expense_time
                ? String(
                    expense.expense_time
                ).substring(
                    0,
                    5
                )
                : "";

    }


    if (type) {

        type.value =
            expense.expense_type || "";

    }


    if (category) {

        category.value =
            expense.category || "";

    }


    if (comment) {

        comment.value =
            expense.comment || "";

    }


    if (amount) {

        amount.value =
            expense.amount || "";

    }


    const modalElement =
        document.getElementById(
            "editModal"
        );


    if (!modalElement) return;


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();
}


/* =====================================================
   UPDATE EXPENSE
===================================================== */

async function updateExpense() {

    if (
        editId === null
    ) {

        return;
    }


    const creator =
        document.getElementById(
            "editCreator"
        ).value.trim();


    const date =
        document.getElementById(
            "editDate"
        ).value;


    const time =
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
        parseFloat(
            document.getElementById(
                "editAmount"
            ).value
        );


    if (!creator) {

        alert(
            "Please enter Creator."
        );

        return;
    }


    if (!date) {

        alert(
            "Please select Date."
        );

        return;
    }


    if (!expenseType) {

        alert(
            "Please select Expense Type."
        );

        return;
    }


    if (!category) {

        alert(
            "Please select Category."
        );

        return;
    }


    if (!comment) {

        alert(
            "Please enter Description."
        );

        return;
    }


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid Amount."
        );

        return;
    }


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
                        date,

                    expense_time:
                        time || null,

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
                editId
            );


    if (error) {

        console.error(
            "Update error:",
            error
        );

        alert(
            "Expense could not be updated.\n\n" +
            error.message
        );

        return;
    }


    editId =
        null;


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


    await loadExpenseTable();

    await loadDashboard();


    alert(
        "Expense updated successfully!"
    );
}


/* =====================================================
   DELETE EXPENSE
===================================================== */

function deleteExpense(
    id
) {

    deleteId =
        id;


    const modalElement =
        document.getElementById(
            "deleteModal"
        );


    if (!modalElement) return;


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();
}


/* =====================================================
   CONFIRM DELETE
===================================================== */

const confirmDelete =
    document.getElementById(
        "confirmDelete"
    );


if (confirmDelete) {

    confirmDelete.addEventListener(
        "click",
        async function () {

            if (
                deleteId === null
            ) {

                return;

            }


            const {
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .delete()
                    .eq(
                        "id",
                        deleteId
                    );


            if (error) {

                console.error(
                    "Delete error:",
                    error
                );

                alert(
                    "Expense could not be deleted.\n\n" +
                    error.message
                );

                return;
            }


            deleteId =
                null;


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


            currentPage =
                1;


            await loadExpenseTable();

            await loadDashboard();

            await setNextSerialNumber();

        }
    );
}


/* =====================================================
   EMPTY MESSAGE
===================================================== */

function showEmptyMessage() {

    const element =
        document.getElementById(
            "emptyMessage"
        );


    if (element) {

        element.style.display =
            "block";

    }
}


function hideEmptyMessage() {

    const element =
        document.getElementById(
            "emptyMessage"
        );


    if (element) {

        element.style.display =
            "none";

    }
}


/* =====================================================
   MONTH FUNCTIONS
===================================================== */

function getMonthKey(
    dateString
) {

    if (!dateString) {

        return null;

    }


    return String(
        dateString
    ).substring(
        0,
        7
    );
}


function getCurrentMonthKey() {

    const today =
        new Date();


    return (
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        )
    );
}


function getPreviousMonthKey() {

    const today =
        new Date();


    today.setMonth(
        today.getMonth() - 1
    );


    return (
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        )
    );
}


function getMonthName(
    monthKey
) {

    if (!monthKey) {

        return "-";

    }


    const parts =
        monthKey.split("-");


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            1
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}


/* =====================================================
   MONTH TOTAL
===================================================== */

function getMonthTotal(
    expenses,
    monthKey
) {

    return expenses
        .filter(
            expense =>
                getMonthKey(
                    expense.expense_date
                ) === monthKey
        )
        .reduce(
            (
                sum,
                expense
            ) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );
}


/* =====================================================
   MONTH ENTRIES
===================================================== */

function getMonthEntries(
    expenses,
    monthKey
) {

    return expenses.filter(
        expense =>
            getMonthKey(
                expense.expense_date
            ) === monthKey
    );
}


/* =====================================================
   LAST 6 MONTHS
===================================================== */

function getLastSixMonths() {

    const months = [];

    const today =
        new Date();


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );


        const key =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        months.push(
            key
        );

    }


    return months;
}


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

    const chart =
        document.getElementById(
            "monthlyChart"
        );


    if (!chart) {

        return;

    }


    const expenses =
        await getExpenses();


    const currentMonth =
        getCurrentMonthKey();


    const previousMonth =
        getPreviousMonthKey();


    const currentTotal =
        getMonthTotal(
            expenses,
            currentMonth
        );


    const previousTotal =
        getMonthTotal(
            expenses,
            previousMonth
        );


    const difference =
        currentTotal -
        previousTotal;


    let percentage =
        0;


    if (
        previousTotal > 0
    ) {

        percentage =
            (
                difference /
                previousTotal
            ) *
            100;

    }


    setText(
        "currentMonthName",
        getMonthName(
            currentMonth
        )
    );


    setText(
        "previousMonthName",
        getMonthName(
            previousMonth
        )
    );


    setText(
        "currentMonthTotal",
        formatCurrency(
            currentTotal
        )
    );


    setText(
        "previousMonthTotal",
        formatCurrency(
            previousTotal
        )
    );


    setText(
        "monthDifference",
        formatCurrency(
            Math.abs(
                difference
            )
        )
    );


    const percentageElement =
        document.getElementById(
            "differencePercentage"
        );


    if (percentageElement) {

        if (
            difference > 0
        ) {

            percentageElement.className =
                "increase";


            percentageElement.textContent =
                "↑ " +
                Math.abs(
                    percentage
                ).toFixed(
                    1
                ) +
                "%";

        }

        else if (
            difference < 0
        ) {

            percentageElement.className =
                "decrease";


            percentageElement.textContent =
                "↓ " +
                Math.abs(
                    percentage
                ).toFixed(
                    1
                ) +
                "%";

        }

        else {

            percentageElement.className =
                "no-change";


            percentageElement.textContent =
                "0%";

        }

    }


    /* =================================================
       SIX MONTH AVERAGE
    ================================================= */

    const sixMonths =
        getLastSixMonths();


    let sixMonthTotal =
        0;


    sixMonths.forEach(
        month => {

            sixMonthTotal +=
                getMonthTotal(
                    expenses,
                    month
                );

        }
    );


    const average =
        sixMonthTotal /
        sixMonths.length;


    setText(
        "monthlyAverage",
        formatCurrency(
            average
        )
    );


    createMonthlyChart(
        expenses,
        sixMonths
    );


    createComparison(
        currentMonth,
        previousMonth,
        currentTotal,
        previousTotal,
        difference,
        percentage
    );


    createCategoryComparison(
        expenses,
        currentMonth
    );


    createMonthlyTable(
        expenses,
        sixMonths
    );
}


/* =====================================================
   SET TEXT
===================================================== */

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


/* =====================================================
   CURRENCY
===================================================== */

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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}


/* =====================================================
   MONTHLY BAR CHART
===================================================== */

function createMonthlyChart(
    expenses,
    months
) {

    const chart =
        document.getElementById(
            "monthlyChart"
        );


    if (!chart) return;


    chart.innerHTML =
        "";


    const totals =
        months.map(
            month =>
                getMonthTotal(
                    expenses,
                    month
                )
        );


    const maximum =
        Math.max(
            ...totals,
            1
        );


    months.forEach(
        function (
            month,
            index
        ) {

            const total =
                totals[index];


            const height =
                total === 0
                    ? 3
                    : (
                        total /
                        maximum
                    ) * 210;


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            column.innerHTML = `

                <div class="chart-value">

                    ${formatCurrency(
                        total
                    )}

                </div>


                <div class="chart-bar-wrapper">

                    <div
                        class="chart-bar"
                        style="height:${height}px">
                    </div>

                </div>


                <div class="chart-month">

                    ${getShortMonthName(
                        month
                    )}

                </div>

            `;


            chart.appendChild(
                column
            );

        }
    );
}


/* =====================================================
   SHORT MONTH
===================================================== */

function getShortMonthName(
    monthKey
) {

    const parts =
        monthKey.split("-");


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            1
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            month: "short"
        }
    );
}


/* =====================================================
   CURRENT VS PREVIOUS
===================================================== */

function createComparison(
    currentMonth,
    previousMonth,
    currentTotal,
    previousTotal,
    difference,
    percentage
) {

    setText(
        "compareCurrentName",
        getMonthName(
            currentMonth
        )
    );


    setText(
        "comparePreviousName",
        getMonthName(
            previousMonth
        )
    );


    setText(
        "compareCurrentAmount",
        formatCurrency(
            currentTotal
        )
    );


    setText(
        "comparePreviousAmount",
        formatCurrency(
            previousTotal
        )
    );


    const result =
        document.getElementById(
            "comparisonResult"
        );


    if (!result) return;


    if (
        currentTotal === 0 &&
        previousTotal === 0
    ) {

        result.textContent =
            "No expenses available for comparison.";

        return;
    }


    if (
        difference > 0
    ) {

        result.textContent =
            "Expense increased by " +
            formatCurrency(
                Math.abs(
                    difference
                )
            ) +
            " (" +
            Math.abs(
                percentage
            ).toFixed(
                1
            ) +
            "%) compared with the previous month.";

    }

    else if (
        difference < 0
    ) {

        result.textContent =
            "Expense decreased by " +
            formatCurrency(
                Math.abs(
                    difference
                )
            ) +
            " (" +
            Math.abs(
                percentage
            ).toFixed(
                1
            ) +
            "%) compared with the previous month.";

    }

    else {

        result.textContent =
            "Expense is the same as the previous month.";

    }
}


/* =====================================================
   CATEGORY COMPARISON
===================================================== */

function createCategoryComparison(
    expenses,
    currentMonth
) {

    const container =
        document.getElementById(
            "categoryComparison"
        );


    if (!container) return;


    container.innerHTML =
        "";


    const currentExpenses =
        getMonthEntries(
            expenses,
            currentMonth
        );


    if (
        currentExpenses.length === 0
    ) {

        container.innerHTML = `

            <div class="text-muted">

                No expenses available for this month.

            </div>

        `;

        return;
    }


    const categories = {};


    currentExpenses.forEach(
        expense => {

            const category =
                expense.category ||
                "Other";


            if (
                !categories[category]
            ) {

                categories[category] =
                    0;

            }


            categories[category] +=
                Number(
                    expense.amount || 0
                );

        }
    );


    const sorted =
        Object.entries(
            categories
        ).sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        );


    const maximum =
        sorted.length > 0
            ? sorted[0][1]
            : 1;


    sorted.forEach(
        function (
            item
        ) {

            const category =
                item[0];


            const amount =
                item[1];


            const percentage =
                (
                    amount /
                    maximum
                ) * 100;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "category-row";


            row.innerHTML = `

                <div class="category-header">

                    <span class="category-name">

                        ${escapeHTML(
                            category
                        )}

                    </span>


                    <span class="category-amount">

                        ${formatCurrency(
                            amount
                        )}

                    </span>

                </div>


                <div class="category-progress">

                    <div
                        class="category-progress-bar"
                        style="width:${percentage}%">
                    </div>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );
}


/* =====================================================
   MONTHLY SUMMARY TABLE
===================================================== */

function createMonthlyTable(
    expenses,
    months
) {

    const body =
        document.getElementById(
            "monthlyTableBody"
        );


    if (!body) return;


    body.innerHTML =
        "";


    const reversed =
        [...months].reverse();


    reversed.forEach(
        function (
            month,
            index
        ) {

            const total =
                getMonthTotal(
                    expenses,
                    month
                );


            const entries =
                getMonthEntries(
                    expenses,
                    month
                ).length;


            let previousMonth;


            if (
                index <
                reversed.length - 1
            ) {

                previousMonth =
                    reversed[
                        index + 1
                    ];

            }


            const previousTotal =
                previousMonth
                    ? getMonthTotal(
                        expenses,
                        previousMonth
                    )
                    : 0;


            const difference =
                total -
                previousTotal;


            let changeText =
                "-";


            let changeClass =
                "no-change";


            if (
                previousMonth
            ) {

                if (
                    previousTotal > 0
                ) {

                    const percentage =
                        (
                            difference /
                            previousTotal
                        ) *
                        100;


                    if (
                        difference > 0
                    ) {

                        changeText =
                            "↑ " +
                            Math.abs(
                                percentage
                            ).toFixed(
                                1
                            ) +
                            "%";


                        changeClass =
                            "increase";

                    }

                    else if (
                        difference < 0
                    ) {

                        changeText =
                            "↓ " +
                            Math.abs(
                                percentage
                            ).toFixed(
                                1
                            ) +
                            "%";


                        changeClass =
                            "decrease";

                    }

                    else {

                        changeText =
                            "0%";

                    }

                }

                else if (
                    total > 0
                ) {

                    changeText =
                        "New Expense";


                    changeClass =
                        "increase";

                }

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>

                        ${getMonthName(
                            month
                        )}

                    </strong>

                </td>


                <td>

                    ${entries}

                </td>


                <td>

                    <strong>

                        ${formatCurrency(
                            total
                        )}

                    </strong>

                </td>


                <td>

                    ${
                        previousMonth
                            ? formatCurrency(
                                Math.abs(
                                    difference
                                )
                            )
                            : "-"
                    }

                </td>


                <td class="${changeClass}">

                    ${changeText}

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

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
