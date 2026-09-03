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
   TODAY
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
   GET ALL EXPENSES FROM SUPABASE
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
            "Unable to load expenses. Please check your Supabase connection."
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
   SET SERIAL NUMBER
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
               INSERT INTO SUPABASE
            ================================================= */

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .insert([
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


    const expenses =
        await getExpenses();


    console.log(
        "Expenses:",
        expenses
    );


    body.innerHTML = "";


    if (
        expenses.length === 0
    ) {

        showEmptyMessage();

        updateSummary([]);

        return;

    }


    hideEmptyMessage();



    /*
       NEWEST RECORD FIRST

       Database ID:
       1
       2
       3
       4

       Display:
       newest first

       Serial:
       1
       2
       3
       4
    */

    const sorted =
        [...expenses].reverse();


    sorted.forEach(
        function (
            expense,
            index
        ) {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>

                        ${index + 1}

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
                        expense.amount
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


    updateSummary(
        expenses
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


    if (!totalEntries) return;


    const today =
        getTodayDate();


    const todayCount =
        expenses.filter(
            expense =>
                expense.expense_date === today
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


    totalEntries.textContent =
        expenses.length;


    if (todayEntries) {

        todayEntries.textContent =
            todayCount;

    }


    if (totalAmount) {

        totalAmount.textContent =
            formatCurrency(total);

    }


    if (grandTotal) {

        grandTotal.textContent =
            formatCurrency(total);

    }

}



/* =====================================================
   EDIT EXPENSE
===================================================== */

async function editExpense(id) {

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


    if (error || !expense) {

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
            expense.creator;

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
            expense.expense_type;

    }


    if (category) {

        category.value =
            expense.category;

    }


    if (comment) {

        comment.value =
            expense.comment;

    }


    if (amount) {

        amount.value =
            expense.amount;

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
            "Please enter a valid Amount."
        );

        return;

    }



    /* =================================================
       UPDATE SUPABASE
    ================================================= */

    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .update({

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

            })
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


    if (!modalElement) {

        return;

    }


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
                    expense.amount
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


    let percentage = 0;


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



    /* =================================================
       CARDS
    ================================================= */

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



    /* =================================================
       CHART
    ================================================= */

    createMonthlyChart(
        expenses,
        sixMonths
    );



    /* =================================================
       COMPARISON
    ================================================= */

    createComparison(
        currentMonth,
        previousMonth,
        currentTotal,
        previousTotal,
        difference,
        percentage
    );



    /* =================================================
       CATEGORY
    ================================================= */

    createCategoryComparison(
        expenses,
        currentMonth
    );



    /* =================================================
       MONTHLY TABLE
    ================================================= */

    createMonthlyTable(
        expenses,
        sixMonths
    );

}



/* =====================================================
   SET TEXT HELPER
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
            amount
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


    chart.innerHTML = "";


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

                    ${formatCurrency(total)}

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


    container.innerHTML = "";


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
                    expense.amount
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
                b[1] - a[1]
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


    body.innerHTML = "";


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