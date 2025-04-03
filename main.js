// Initialize chart variables globally
let debtValueChart = null;
let cashflowEquityChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize toggle content display
    initializeToggles();
    
    // Initialize slider and number input synchronization
    initializeSliders();
    
    // Set up event listeners
    document.getElementById('calculate-btn').addEventListener('click', calculateResults);
    document.getElementById('reset-btn').addEventListener('click', resetToDefault);
    document.getElementById('export-btn').addEventListener('click', exportResults);
    
    // Set up input linkage (e.g., loan amount = existing debt by default)
    document.getElementById('existing-debt').addEventListener('input', function() {
        document.getElementById('loan-amount').value = this.value;
    });
    
    // Initial calculation
    calculateResults();
});

function initializeToggles() {
    // Set up toggle behavior for advanced options
    const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
    
    toggles.forEach(toggle => {
        const contentId = toggle.id.replace('-toggle', '-content');
        const content = document.getElementById(contentId);
        
        // Initial state
        content.style.display = toggle.checked ? 'block' : 'none';
        
        // Toggle event
        toggle.addEventListener('change', function() {
            content.style.display = this.checked ? 'block' : 'none';
            calculateResults();
        });
    });
}

function initializeSliders() {
    // Sync range sliders with number inputs
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        const numberId = slider.id.replace('-slider', '');
        const numberInput = document.getElementById(numberId);
        
        // Sync slider to number input
        slider.addEventListener('input', function() {
            numberInput.value = this.value;
            calculateResults();
        });
        
        // Sync number input to slider
        numberInput.addEventListener('input', function() {
            slider.value = this.value;
            calculateResults();
        });
    });
}

function resetToDefault() {
    // Reset all inputs to default values
    document.getElementById('apartment-value').value = 600000;
    document.getElementById('existing-debt').value = 300000;
    document.getElementById('loan-amount').value = 300000;
    document.getElementById('loan-duration').value = 20;
    document.getElementById('loan-duration-slider').value = 20;
    document.getElementById('interest-rate').value = 1.5;
    document.getElementById('interest-rate-slider').value = 1.5;
    document.getElementById('amortization-type').value = 'annuity';
    document.getElementById('property-growth-rate').value = 2;
    document.getElementById('property-growth-rate-slider').value = 2;
    document.getElementById('monthly-rent').value = 2500;
    document.getElementById('rent-growth-rate').value = 0;
    document.getElementById('rent-growth-rate-slider').value = 0;
    
    // Reset toggles
    document.getElementById('inflation-toggle').checked = false;
    document.getElementById('inflation-content').style.display = 'none';
    document.getElementById('inflation-rate').value = 2;
    document.getElementById('inflation-rate-slider').value = 2;
    
    document.getElementById('extra-payments-toggle').checked = false;
    document.getElementById('extra-payments-content').style.display = 'none';
    document.getElementById('extra-payment').value = 0;
    
    document.getElementById('invest-cashflow-toggle').checked = false;
    document.getElementById('invest-cashflow-content').style.display = 'none';
    document.getElementById('investment-rate').value = 0;
    document.getElementById('investment-rate-slider').value = 0;
    
    // Recalculate
    calculateResults();
}

function calculateResults() {
    try {
        // Get all input values
        const inputs = getInputValues();
        
        // Calculate loan schedule based on amortization type
        const loanSchedule = calculateLoanSchedule(inputs);
        
        // Generate yearly summary for display
        const yearlySummary = generateYearlySummary(loanSchedule, inputs);
        
        // Update output displays
        updateOutputs(yearlySummary, inputs);
        
        // Try to update charts, but continue even if it fails
        try {
            updateCharts(yearlySummary);
        } catch (error) {
            console.error("Chart update failed, but continuing with other updates:", error);
        }
        
        // Update table
        updateTable(yearlySummary);
    } catch (error) {
        console.error("Calculation error:", error);
        alert("There was an error in the calculations. Please check your inputs and try again.");
    }
}

function getInputValues() {
    return {
        apartmentValue: parseFloat(document.getElementById('apartment-value').value),
        existingDebt: parseFloat(document.getElementById('existing-debt').value),
        loanAmount: parseFloat(document.getElementById('loan-amount').value),
        loanDuration: parseInt(document.getElementById('loan-duration').value),
        interestRate: parseFloat(document.getElementById('interest-rate').value) / 100,
        amortizationType: document.getElementById('amortization-type').value,
        propertyGrowthRate: parseFloat(document.getElementById('property-growth-rate').value) / 100,
        monthlyRent: parseFloat(document.getElementById('monthly-rent').value),
        rentGrowthRate: parseFloat(document.getElementById('rent-growth-rate').value) / 100,
        
        includeInflation: document.getElementById('inflation-toggle').checked,
        inflationRate: parseFloat(document.getElementById('inflation-rate').value) / 100,
        
        includeExtraPayments: document.getElementById('extra-payments-toggle').checked,
        extraPayment: parseFloat(document.getElementById('extra-payment').value),
        
        investCashflow: document.getElementById('invest-cashflow-toggle').checked,
        investmentRate: parseFloat(document.getElementById('investment-rate').value) / 100
    };
}

function calculateLoanSchedule(inputs) {
    const {
        loanAmount,
        loanDuration,
        interestRate,
        amortizationType,
        includeExtraPayments,
        extraPayment
    } = inputs;
    
    // Convert annual rate to monthly and get total number of months
    const monthlyRate = interestRate / 12;
    const totalMonths = loanDuration * 12;
    
    // Initialize schedule array with monthly payments
    const schedule = [];
    
    // Calculate monthly payment based on amortization type
    let monthlyPayment = 0;
    
    switch (amortizationType) {
        case 'annuity':
            // Equal total payments (Annuity)
            // Formula: PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
            if (interestRate === 0) {
                monthlyPayment = loanAmount / totalMonths;
            } else {
                monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                                (Math.pow(1 + monthlyRate, totalMonths) - 1);
            }
            break;
            
        case 'linear':
            // Equal principal payments (Linear)
            // Base monthly principal payment (will add interest in the loop)
            monthlyPayment = loanAmount / totalMonths;
            break;
            
        case 'interest-only':
            // Interest only (balloon payment at end)
            monthlyPayment = loanAmount * monthlyRate;
            break;
    }
    
    // Initialize variables for tracking
    let remainingDebt = loanAmount;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    
    // Calculate payment schedule month by month
    for (let month = 1; month <= totalMonths; month++) {
        // Calculate interest for this month
        const interestPayment = remainingDebt * monthlyRate;
        
        // Calculate principal payment based on amortization type
        let principalPayment = 0;
        let actualMonthlyPayment = 0;
        
        switch (amortizationType) {
            case 'annuity':
                principalPayment = monthlyPayment - interestPayment;
                actualMonthlyPayment = monthlyPayment;
                break;
                
            case 'linear':
                principalPayment = loanAmount / totalMonths;
                actualMonthlyPayment = principalPayment + interestPayment;
                break;
                
            case 'interest-only':
                principalPayment = (month === totalMonths) ? remainingDebt : 0;
                actualMonthlyPayment = interestPayment + principalPayment;
                break;
        }
        
        // Add extra payment if enabled
        if (includeExtraPayments && extraPayment > 0) {
            // Limit extra payment to remaining debt
            const effectiveExtraPayment = Math.min(extraPayment, remainingDebt - principalPayment);
            principalPayment += effectiveExtraPayment;
            actualMonthlyPayment += effectiveExtraPayment;
        }
        
        // Update remaining debt
        remainingDebt = Math.max(0, remainingDebt - principalPayment);
        
        // Update totals
        totalInterestPaid += interestPayment;
        totalPrincipalPaid += principalPayment;
        
        // Add month data to schedule
        schedule.push({
            month,
            monthlyPayment: actualMonthlyPayment,
            interestPayment,
            principalPayment,
            remainingDebt,
            totalInterestPaid,
            totalPrincipalPaid
        });
        
        // If debt is fully paid, stop calculations
        if (remainingDebt <= 0) {
            break;
        }
    }
    
    return schedule;
}

function generateYearlySummary(loanSchedule, inputs) {
    const {
        apartmentValue,
        loanAmount,
        propertyGrowthRate,
        monthlyRent,
        rentGrowthRate,
        includeInflation,
        inflationRate,
        investCashflow,
        investmentRate
    } = inputs;
    
    // Initialize yearly summary
    const yearlySummary = [];
    
    // Variables for tracking annual values
    let currentPropertyValue = apartmentValue;
    let currentMonthlyRent = monthlyRent;
    let accumulatedCashFlow = 0;
    let investedCashFlowValue = 0;
    
    // Group data by year
    const totalYears = Math.ceil(loanSchedule.length / 12);
    
    for (let year = 1; year <= totalYears; year++) {
        // Get start and end indices for this year
        const startIdx = (year - 1) * 12;
        const endIdx = Math.min(year * 12, loanSchedule.length) - 1;
        
        // Get last month's data for this year
        const yearEndData = loanSchedule[endIdx];
        
        // Calculate property value with growth
        const previousPropertyValue = currentPropertyValue;
        currentPropertyValue = currentPropertyValue * (1 + propertyGrowthRate);
        
        // Calculate equity
        const equity = currentPropertyValue - yearEndData.remainingDebt;
        
        // Calculate annual rent with growth
        let annualRent = 0;
        for (let month = 0; month < 12; month++) {
            if (startIdx + month <= endIdx) {
                // Apply rent growth monthly for more accurate compounding
                if (month > 0 || year > 1) {
                    // Apply monthly equivalent of annual rent growth
                    currentMonthlyRent *= Math.pow(1 + rentGrowthRate, 1/12);
                }
                annualRent += currentMonthlyRent;
            }
        }
        
        // Calculate total payment for the year
        let yearlyPayment = 0;
        for (let i = startIdx; i <= endIdx; i++) {
            yearlyPayment += loanSchedule[i].monthlyPayment;
        }
        
        // Calculate yearly interest and principal payments
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;
        for (let i = startIdx; i <= endIdx; i++) {
            yearlyInterest += loanSchedule[i].interestPayment;
            yearlyPrincipal += loanSchedule[i].principalPayment;
        }
        
        // Calculate net cash flow
        const netCashFlow = annualRent - yearlyPayment;
        
        // Accumulate cash flow
        accumulatedCashFlow += netCashFlow;
        
        // Calculate invested cash flow
        if (investCashflow && investmentRate > 0) {
            // For the first year, start with net cash flow
            if (year === 1) {
                investedCashFlowValue = netCashFlow;
            } else {
                // Grow the existing invested amount
                investedCashFlowValue = investedCashFlowValue * (1 + investmentRate) + netCashFlow;
            }
        } else {
            investedCashFlowValue = accumulatedCashFlow;
        }
        
        // Calculate total value of assets
        const totalAssets = currentPropertyValue - yearEndData.remainingDebt + 
                           (investCashflow ? investedCashFlowValue : accumulatedCashFlow);
        
        // Adjust for inflation if enabled
        let inflationFactor = 1;
        if (includeInflation) {
            inflationFactor = Math.pow(1 - inflationRate, year);
        }
        
        // Add to yearly summary
        yearlySummary.push({
            year,
            monthlyPayment: yearEndData.monthlyPayment * inflationFactor,
            yearlyPayment: yearlyPayment * inflationFactor,
            yearlyInterest: yearlyInterest * inflationFactor,
            yearlyPrincipal: yearlyPrincipal * inflationFactor,
            remainingDebt: yearEndData.remainingDebt * inflationFactor,
            propertyValue: currentPropertyValue * inflationFactor,
            equity: equity * inflationFactor,
            yearlyRent: annualRent * inflationFactor,
            monthlyRent: currentMonthlyRent * inflationFactor,
            netCashFlow: netCashFlow * inflationFactor,
            accumulatedCashFlow: accumulatedCashFlow * inflationFactor,
            investedCashFlowValue: investedCashFlowValue * inflationFactor,
            totalAssets: totalAssets * inflationFactor,
            propertyValueGain: (currentPropertyValue - previousPropertyValue) * inflationFactor
        });
    }
    
    return yearlySummary;
}

function updateOutputs(yearlySummary, inputs) {
    // Get final year data
    const finalYear = yearlySummary[yearlySummary.length - 1];
    
    // Format currency for display
    const formatCurrency = (value) => '€' + value.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Update summary cards
    document.getElementById('monthly-payment').textContent = formatCurrency(finalYear.monthlyPayment);
    
    // Calculate total interest over loan term
    const totalInterest = yearlySummary.reduce((sum, year) => sum + year.yearlyInterest, 0);
    document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
    
    // Last month's cash flow
    document.getElementById('net-cashflow').textContent = formatCurrency(finalYear.monthlyRent - finalYear.monthlyPayment);
    
    // Total accumulated cash flow
    document.getElementById('total-cashflow').textContent = formatCurrency(finalYear.accumulatedCashFlow);
    
    // Invested cash flow value
    document.getElementById('invested-cashflow').textContent = formatCurrency(finalYear.investedCashFlowValue);
    
    // End property value
    document.getElementById('end-property-value').textContent = formatCurrency(finalYear.propertyValue);
    
    // End equity
    document.getElementById('end-equity').textContent = formatCurrency(finalYear.equity);
    
    // Total value of assets
    document.getElementById('total-assets').textContent = formatCurrency(finalYear.totalAssets);
}

function updateCharts(yearlySummary) {
    // Prepare data for charts
    const years = yearlySummary.map(data => data.year);
    const remainingDebt = yearlySummary.map(data => data.remainingDebt);
    const propertyValues = yearlySummary.map(data => data.propertyValue);
    const equityValues = yearlySummary.map(data => data.equity);
    const cashFlowValues = yearlySummary.map(data => data.accumulatedCashFlow);
    const investedCashFlow = yearlySummary.map(data => data.investedCashFlowValue);
    
    // Chart 1: Debt and Property Value
    try {
        const debtValueCtx = document.getElementById('debt-value-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (debtValueChart) {
            debtValueChart.destroy();
        }
        
        debtValueChart = new Chart(debtValueCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Property Value',
                        data: propertyValues,
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Remaining Debt',
                        data: remainingDebt,
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '€' + value.toLocaleString()
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating debt-value chart:", error);
    }
    
    // Chart 2: Cash Flow and Equity
    try {
        const cashflowEquityCtx = document.getElementById('cashflow-equity-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (cashflowEquityChart) {
            cashflowEquityChart.destroy();
        }
        
        cashflowEquityChart = new Chart(cashflowEquityCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Equity',
                        data: equityValues,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Accumulated Cash Flow',
                        data: cashFlowValues,
                        backgroundColor: 'rgba(155, 89, 182, 0.1)',
                        borderColor: 'rgba(155, 89, 182, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Invested Cash Flow',
                        data: investedCashFlow,
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderColor: 'rgba(243, 156, 18, 1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '€' + value.toLocaleString()
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating cashflow-equity chart:", error);
    }
}

function updateTable(yearlySummary) {
    try {
        const tableBody = document.querySelector('#yearly-breakdown tbody');
        tableBody.innerHTML = '';
        
        // Format currency for table
        const formatCurrency = (value) => '€' + value.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Add rows for each year
        yearlySummary.forEach(year => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${year.year}</td>
                <td>${formatCurrency(year.monthlyPayment)}</td>
                <td>${formatCurrency(year.yearlyInterest)}</td>
                <td>${formatCurrency(year.yearlyPrincipal)}</td>
                <td>${formatCurrency(year.remainingDebt)}</td>
                <td>${formatCurrency(year.propertyValue)}</td>
                <td>${formatCurrency(year.equity)}</td>
                <td>${formatCurrency(year.yearlyRent)}</td>
                <td>${formatCurrency(year.netCashFlow)}</td>
                <td>${formatCurrency(year.totalAssets)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error updating table:", error);
    }
}

function exportResults() {
    try {
        // Get inputs and calculate results
        const inputs = getInputValues();
        const loanSchedule = calculateLoanSchedule(inputs);
        const yearlySummary = generateYearlySummary(loanSchedule, inputs);
        
        // Format data for CSV
        let csvContent = 'Year,Monthly Payment (€),Yearly Interest (€),Yearly Principal (€),Remaining Debt (€),Property Value (€),Equity (€),Yearly Rent (€),Net Cash Flow (€),Total Value of Assets (€)\n';
        
        yearlySummary.forEach(year => {
            csvContent += `${year.year},${year.monthlyPayment.toFixed(2)},${year.yearlyInterest.toFixed(2)},${year.yearlyPrincipal.toFixed(2)},${year.remainingDebt.toFixed(2)},${year.propertyValue.toFixed(2)},${year.equity.toFixed(2)},${year.yearlyRent.toFixed(2)},${year.netCashFlow.toFixed(2)},${year.totalAssets.toFixed(2)}\n`;
        });
        
        // Create a download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'apartment_investment_results.csv');
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting results:", error);
        alert("There was an error exporting the results. Please try again.");
    }
} 