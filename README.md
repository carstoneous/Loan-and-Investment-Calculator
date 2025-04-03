# Apartment Loan and Investment Simulator

This is an interactive financial calculator built with HTML, CSS, and JavaScript to simulate the financial aspects of owning an apartment. It models loan repayments, property value growth, rent income, cash flow, and total asset value based on user-defined inputs. The tool is designed for financial planning and provides detailed outputs, graphs, and a year-by-year breakdown.

## Features

- **Loan Modeling:**
  - Calculate monthly payments, total interest, and debt reduction for a €300,000 loan (adjustable).
  - Supports three amortization types: **Annuity** (equal payments), **Linear** (equal principal), and **Interest-Only** (principal due at end).
  - Adjustable loan duration (5–30 years) and interest rate (0.5%–10%).

- **Property and Rent Income:**
  - Starting apartment value: €600,000, with adjustable growth rate (0%–5%).
  - Monthly rent income: €2,500 by default, adjustable (€0–€5,000), with growth rate (0%–5%).

- **Cash Flow and Investment:**
  - Net monthly cash flow: Rent income minus loan payment.
  - Total accumulated cash flow over the loan term.
  - Optional toggle to invest cash flow at a user-defined rate (0%–10%), with monthly compounding.

- **Total Value of Assets:**
  - Combines property value (at end of term), remaining debt, and accumulated/invested cash flow for a net worth estimate.

- **Advanced Options:**
  - Toggle for inflation (0%–5%) to adjust future values.
  - Toggle for extra payments (€0–€1,000) to accelerate debt repayment.
  - Break-even point: Year when rent income covers payments.

- **Visualizations:**
  - Graphs: Remaining Debt vs. Time, Property Value and Equity vs. Time (using Chart.js).
  - Table: Year-by-year breakdown of payments, debt, property value, equity, rent, cash flow, and total assets.

- **Export:**
  - Download results as a CSV file.

## Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/apartment-loan-simulator.git
   cd apartment-loan-simulator

2.  **Dependencies:**
The project uses Chart.js for graphing. It’s included via CDN in the HTML.

No other external dependencies are required.

3.  **File Structure:**

apartment-loan-simulator/
├── index.html    # Main HTML file
├── styles.css    # CSS styling
├── script.js     # JavaScript logic
└── README.md     # This file

4.  **Run Locally:**
   - Open index.html in a web browser (e.g., Chrome, Firefox).
   - Alternatively, use a local server (e.g., with VS Code Live Server or `python -m http.server`).

## Usage

1. **Inputs:**
   - Adjust static inputs (apartment value, existing debt, rent income, interest rate).
   - Use sliders or number fields for dynamic inputs (loan duration, interest rate, growth rates).
   - Select amortization type from the dropdown.
   - Enable advanced options via toggles (inflation, extra payments, cash flow investment).

2. **Calculate:**
   - Click "Calculate" to update results (auto-triggered on input changes).
   - View outputs in the summary cards, graphs, and table.

3. **Export:**
   - Click "Export Results" to download a CSV with the yearly breakdown.

4. **Reset:**
   - Click "Reset to Default" to restore initial values.

## Example Scenario

- **Inputs:**
  - Loan Amount: €300,000
  - Duration: 20 years
  - Interest Rate: 1.5% (Annuity)
  - Property Growth: 2%
  - Rent Income: €2,500, 2% growth
  - Investment Rate: 3% (toggled on)

- **Outputs (Approximate):**
  - Monthly Payment: €1,448
  - Total Interest: €47,669
  - End Property Value: €891,668
  - Total Accumulated Cash Flow: €249,312 (uninvested)
  - Invested Cash Flow Value: €349,876
  - Total Value of Assets: €1,241,544 (with investment)

## Calculations

- **Annuity Payment:** `PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)`, where `P` is principal, `r` is monthly rate, `n` is total months.
- **Linear Payment:** Principal per month + interest on remaining debt.
- **Interest-Only:** Interest per month, principal due at end.
- **Property Value:** `PV * (1 + g)^t`, where `g` is growth rate, `t` is years.
- **Invested Cash Flow:** `FV = CF * [(1 + r)^n - 1] / r`, with monthly compounding.
- **Total Value of Assets:** `Property Value - Remaining Debt + (Invested Cash Flow or Accumulated Cash Flow)`.

## Notes

- All values are in euros (€).
- Inflation currently inflates future values (adjustable in `script.js` if discounting is preferred).
- Built for planning purposes; results are estimates and subject to real-world changes.

## Contributing

Feel free to fork this repository, submit issues, or create pull requests to enhance functionality (e.g., additional amortization types, improved UI).

## License

This project is open-source and available under the [MIT License](LICENSE).

---

Happy simulating!
