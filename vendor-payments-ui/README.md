# Washington State Vendor Payments Dashboard (Overview)

This project is a high-performance, interactive web interface designed to explore and analyze Washington State's vendor payment datasets. Handling over 1.1 million fiscal records (2021-2023), the dashboard provides an accessible and intuitive way for anyone to visualize where state funds are going, which agencies are spending the most, and which vendors are the primary recipients.

By leveraging advanced web streaming and local aggregation techniques, we've transformed a massive, "heavy" CSV dataset into a fluid, reactive experience that allows for real-time filtering and deep-dive analysis directly in the browser.

---

## 🧐 things about this POC (in my own words)

### The problem I set out to solve
Looking over the spreadsheet for a bit, I asked how I could understand it to a greater degree... I wanted a larger picture so I figured others would as well. The general approach was to display "a user would want a tool to view how funds were spent, by whom and where" while making it accessible.

I picked this direction mostly by intuition and what the data consisted of. I chose this direction over alternative ideas like a simple user-friendly and interactive spreadsheet/table viewer alone, or more precise lookup or auditing tool that would be more suited for investigative purposes (Tablau or Power BI). I considered other ideas as well, such as a tool that more heavily emphasized and utilized the hierarchical nature of the data, like a whole-page map or sankey chart, but ultimately decided against it in favor of this more general approach. 

### The tech and architectural choices I made
Naturally the mind wanders toward graphical displays - this is the easiest for most users to understand large sets of data and so they could formulate their own mental-map or picture of the relationships between things. 

In my interface, the user can view the aggregate and unfiltered data when the page loads. They can select from filters and depending on the selection(s), the charts and table components update dynamically to reflect the data that was filtered. 

In the datatable, I display rows that are collapsed/combined records grouped by Agency and Category, with a total for the combined records. The headers for each column can be quick-selected to sort in ascending or descending order, where the row is then dependent on that column's sort value. A row can be selected to drill-down into the details of that combination row; this displays a modal with a breakdown of the individual Vendors and their respective dollar amounts.

I wanted to build this prototype as a frontend-only application. Since there's no backend server, data processing is performed client-side in memory. To keep this as performant as it can be, I immediately transform the CSV data in to typed structures so we reduce repeated computations. This keeps it pretty clean and easier to filter over and aggregate. It does however, consume more memory on the initial load of the page. I use Pinia for state management as a single source of truth and the UI responsive to it. I also separate my filters, charts, tables and stats so we maintain a separation of concerns - making maintenance easier and components reusable. 

In production, this would need to be refactored to a setup where with a robust API and likely database. Where we would be making API calls from the frontend to the backend - in order to ensure speed, scalability, efficiency and extensibility. Also, we could extend this with AI capabilities such as a RAG setup for natural language queries with the data. Adding in file upload capabilities would be nice; probably better/more dynamic data modeling, more robust error handling, and more comprehensive testing. 

### My AI usage log
- Major AI case 1: Initial project setup - I utilized chatGPT to formulate a initial implementation plan and determine what packages I would be using. This was then brought into the IDE along with my specific instructions and requests. It was mostly okay, but I had to iterate a bit where the model (or I) didn't get the details correct on the first try. After a few back-and-forths I settled on the approach. I like to ensure my projects and environments are set up correctly before bringing in the AI/Agents to assist with any implementation, so I always perform these preliminary steps myself. Then I allowed it to roll through the implementation plan, it filled in the files as prescribed. Any areas like the UI not rendering, some typing issues, imports... anything that presented as a compile or runtime error, I go through and button it up. Then I'll go through all generated functions and render code to ensure it looks right and I don't introduce any new issues. 

- Major AI case 2: After the intial project has been set up and I have most of the core functionality working, I test everything out and iterate with the model if there are issues. In this case, I initially wanted to fetch the data from the given hosted CSV link. This took a bit of troubleshooting and some queries back-and-forth with the model to isolate what the issue was. Turned out it was nothing to do with the model or the codebase, the file itself just wasn't accessible. For the sake of time and to get this working, I made the decision to download the CSV and make it available locally. After this, there definitely were issues with the way I was utilizing the dataset - which ended up being a combination of the dataset's size and processing that data blocking the main thread as well as render-update cycles. Our approach was attempting to do too much at once. So we refactored our approach to be more memory efficient and to not conflict with the reactivity of Vue - utilizing chunk-based processing instead, a worker that could complete processing in a background thread, and local vars rather than relying on reactive state updates alone. This instantly solved the toughest issue I had while working on this. 

- Major AI case 3: The final round worth mentioning is after everything was up and running, I manually tested whether the table data was updating correctly and the filters were working as expected. This process unearthed some edge cases like combinations of filters not working together properly and my reset state actions were not operating properly removing or resetting the filters. Due to some duplicate funcitons, I refectored to centralize the logic in my state instead. There were also delay issues (which to some degree, still exist) we were able to cover by caching some of the processed data and reorganizing the order of loading states.

-----------------------------------------------------------------------------------------

Logs for these interactions:
- Log Segment for Noted Implementation - 1): 
User Input
We are building a dashboard to display real vendor payments data in vuetify with typescript. The data is within a hosted spreadsheet, so we will use the papaparser packaged to load and work with the data. Included within the dashboard will be an app title, some filters, aggregate display(s), and more.
I have a markdown file with the project's outline located at the root of this project here:@[vendor-payments-ui/vendor_payments_dashboard_implementation_plan.md]
I have already set up vuetify and installed the packages for the project (and their types). I've also set up the project folders and files we will need for importing, processing, and then displaying the data with ApexCharts.
[list of directories and files and the structure of the project's boilerplate setup]

Planner Response
I have reviewed the project requirements and the existing codebase. It looks like the foundational structure is in place, but most of the logic and UI components are still empty.
I've created a detailed implementation plan that covers:
Data Foundation: Implementing `PapaParse` logic and normalization in `csvService.ts`.
State Management: Setting up a Pinia store for centralized data and filter management.
Business Logic: Creating reactive filtering and aggregation composables.
UI Components: Building responsive stats cards, charts (using ApexCharts), and a paginated data table.
Layout: Assembling everything into a clean, modern Vuetify dashboard.
One important note: the SharePoint link provided for the CSV may need to be a direct download link (e.g., ending in `?download=1`) to work correctly with `fetch`. I will investigate this during implementation.
Please review the plan and let me know if you're ready for me to begin execution!

User Input
Please review my comments
Edited relevant file
*Viewed implementation_plan.md *
Edited relevant file

Planner Response
I've updated the implementation plan to address your feedback.
Key Adjustments:
Memory Efficiency: I've switched the strategy to streaming ingestion using PapaParse's `step` callback. This will allow us to process the FY22 and FY23 datasets row-by-row without loading everything into memory.
Aggregate-First State: The Pinia store will now focus on storing pre-computed aggregates (Agency totals, Category breakdowns, etc.) rather than the full raw dataset. This ensures the dashboard remains fast and responsive even with medium-sized datasets.
Subsets for UI: We will store only a small subset of rows for the data table view, or re-stream/index for specific filtered views, keeping the memory footprint low.
Error Handling: I've added a check to notify you immediately if the SharePoint link fails to load as a CSV.
Let me know if this looks good, and I'll start by testing the data import!

User Input
This looks better, let's move forward with the plan.
[Agent action approvals]

-----------------------------------------------------------------------------------------

-Log Segment for Noted Implementation - 2):
[steps of trial and error - attempts to fetch and use hosted CSV instead of as a local file proves unfruitful. Pivot to local file.]

User Input
I am getting this error on page load, is it due to the underscores and spaces in the filename?
User accepted the command `cd vendor-payments-ui`
[error logs shared]
Planner Response
I believe the error is being caused by how the browser resolves the relative path when using a Web Worker. Specifically, when `worker: true` is enabled, the path needs to be absolute or correctly relative to the worker's context.
I have updated `csvService.ts` to:
Generate an absolute URL: Using `new URL(path, window.location.origin).href` to ensure the path is fully qualified.
Add Debug Logging: It will now log the exact URL it's trying to fetch in the console.
User Input
I think it's overloading the web page. It becomes unresponsive when spinning up the server. We almost need a worker to stage out the fetching and compiling. It could be an issue with hosting it locally since the files are pretty big. regardless, it's not going to work like a database in the way we normally would work with data like this.
Planner Response
You're absolutely right—calling the store for every single row was the bottleneck. It was flooding the browser's message queue and freezing the UI.

[
    ...implementation of the batch processing - along with this implementation the discovery that the inital package would not support .xlsx files, pivot to local file as a csv. file was also renamed to ensure compatibility with the web worker. was able to keep the original package for processing the data with the new approach. There were a few more hurdles with the data and initial loading/processing of the data - these were procedurally resolved...
]

-----------------------------------------------------------------------------------------

-Log Segment for Noted Implementation - 3):

[I propopse to take a deeper look at the data processing in order to increase performance.]

Planner Response
You're right—even with batching, processing 1.1 million rows and updating reactive Pinia objects for every chunk is still heavy for the main thread. The bottleneck is that PapaParse's `worker: true` only handles the parsing; all the math and aggregation are still happening in the main thread during the `chunk` callback.

[resolved then issues with the datatable presented itself - was worked through quickly]

User Input
Ah, maybe instead of just the top 1k rows - which include multiples of the same agency, we could sort and compile totals.
For example say there's 28 rows of "Agriculture" as the agency and each also is for "Goods and Services" category, we could collapse all of these rows, then in the vendor we just display "15 vendors" (length of our list of vendors) and lastly the total. Then we can show many more different rows than just what appears as repeats of very similarly themed rows

Planner Response
That's a fantastic idea. Grouping the data by Agency and Category turns the table from a random sample into a meaningful "ledger" of where the money is going at a high level. This is a game-changer for the dashboard's utility. Instead of showing you 1,000 random rows that often repeat the same Agency/Category info, the table now acts as a Summarized Ledger.

[similar loop with the filters - something along the way caused the existing setup to fail outside of the default filters]

[from here there were simple UI/UX adjustments and minor bug fixes - nothing major through the conclusion of the session]


---

Scaffolded with Vuetify CLI.

## ❗️ Documentation

- Primary docs: https://vuetifyjs.com/
- Getting started guide: https://vuetifyjs.com/en/getting-started/installation/
- Community support: https://community.vuetifyjs.com/
- Issue tracker: https://issues.vuetifyjs.com/

## 🧱 Stack

- Framework: Vue 3 + Vite
- UI Library: Vuetify
- Language: TypeScript
- Package manager: npm

## 🧭 Start Here

- Main entry: `src/main.ts`
- Main app component: `src/App.vue`
- Main styles: `src/styles/`
- Plugin setup: `src/plugins/`

## 📁 Project Structure

- `src/main.ts` — application entry point
- `src/App.vue` — root component
- `src/components/` — reusable Vue components
- `src/plugins/` — plugin registration and setup
- `src/styles/` — global styles and theme settings
- `public/` — static public files

## ✨ Enabled Features

- ESLint
- Pinia
- Vue I18n
- Vuetify MCP
- Vue Router
- UnoCSS + Vuetify Preset

## 💿 Install

Use your selected package manager (npm) to install dependencies:

- download the project from github, open the project in an IDE
- ensure you're within the project root directory "vendor-payments-ui" in your terminal. 
- if unsure, in the terminal run "ls" to see if you're in the right directory. If you see the project name, enter the directory using the command "cd vendor-payments-ui" and press enter.
- once you're in the root project directory, follow the "Quick Start" below.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🧪 Available Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run build-only`
- `npm run type-check`
- `npm run lint`
- `npm run lint:fix`
- `npm run mcp`
- `npm run mcp:revert`

## 💪 Support Vuetify Development

This project uses Vuetify - an MIT licensed Open Source project. We are glad to welcome contributors and any support for ongoing development:

- Contribute to Vuetify and ecosystem projects: https://github.com/vuetifyjs
- Request enterprise support: https://support.vuetifyjs.com/
- Sponsor on GitHub: https://github.com/sponsors/vuetifyjs
- Support on Open Collective: https://opencollective.com/vuetify
