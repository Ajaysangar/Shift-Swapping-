console.log("Script started");

ZOHO.embeddedApp.on("PageLoad", function(data) {
    console.log("Page loaded, Zoho Embedded App SDK initialized");

    document.getElementById('fetchAccountsBtn').addEventListener('click', function() {
        console.log("Fetch temp button clicked");

        ZOHO.CRM.API.getAllRecords({
            Entity: "Leads",
            sort_order: "asc",
            per_page: 200
        }).then(function(response) {
            console.log("API response received:", response);

            if (response.data && response.data.length > 0) {
                const temp = response.data.map(temp => ({
                    id: temp.id,
                    First_Name: temp.First_Name
                }));
                console.log("Temps data processed:", temp);

                populateDropdown(temp);
            } else {
                console.log("No temp data found");
            }
        }).catch(function(error) {
            console.error("Error fetching temp data:", error);
        });
    });
});

function populateDropdown(temp) {
    const dropdown = document.getElementById('accountDropdown');
    dropdown.innerHTML = ''; // Clear existing options
    console.log("Dropdown cleared");

    temp.forEach(temp => {
        const option = document.createElement('option');
        option.value = temp.id;
        option.textContent = temp.First_Name + " " + temp.id;
        dropdown.appendChild(option);
    });
    console.log("Dropdown populated with temp");
}

// Initialize the Zoho Embedded App SDK and add a callback for initialization success
ZOHO.embeddedApp.init().then(function() {
    console.log("Zoho Embedded App SDK initialization completed");
}).catch(function(error) {
    console.error("Zoho Embedded App SDK initialization error:", error);
});
