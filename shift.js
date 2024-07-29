document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    var modal = document.getElementById('myModal');
    var span = document.getElementsByClassName('close')[0];
    var currentPage = 1;
    var recordsPerPage = 10;
    var tempData = [];
    var selectedRecordId = null;

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
                    tempData = response.data.map(temp => ({
                        id: temp.id,
                        First_Name: temp.First_Name || '', // Default to empty string if null or undefined
                        Last_Name: temp.Last_Name || ''  // Default to empty string if null or undefined
                    }));
                    console.log("Temps data processed:", tempData);

                    displayPage(currentPage);
                } else {
                    console.log("No temp data found");
                }
            }).catch(function(error) {
                console.error("Error fetching temp data:", error);
            });

            modal.style.display = "block";
        });

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        document.getElementById('prevPageBtn').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });

        document.getElementById('nextPageBtn').addEventListener('click', function() {
            if (currentPage * recordsPerPage < tempData.length) {
                currentPage++;
                displayPage(currentPage);
            }
        });

        document.getElementById('searchBox').addEventListener('input', function(event) {
            const searchQuery = event.target.value.toLowerCase();
            const filteredData = tempData.filter(temp => 
                (temp.First_Name + ' ' + temp.Last_Name).toLowerCase().includes(searchQuery)
            );
            displayPage(1, filteredData); // Reset to the first page of filtered results
        });

        document.getElementById('submitBtn').addEventListener('click', function() {
            if (selectedRecordId) {
                console.log("Selected record ID:", selectedRecordId);
                // Perform the desired action with the selected record ID here
                // For example, sending it to a server or processing it further

                // Close the modal after submission
                modal.style.display = "none";
            } else {
                alert("Please select a record first.");
            }
        });
    });

    function displayPage(page, data = tempData) {
        const container = document.getElementById('accountRadioContainer');
        if (!container) {
            console.error("Radio container element not found");
            return;
        }

        container.innerHTML = ''; // Clear existing options
        console.log("Radio container cleared");

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pagedData = data.slice(start, end);

        pagedData.forEach(temp => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'account';
            radio.value = temp.id;

            radio.addEventListener('change', function() {
                selectedRecordId = radio.value;
                toggleSubmitButtonVisibility();
            });

            // Only display available names
            const firstName = temp.First_Name || '';
            const lastName = temp.Last_Name || '';
            const name = (firstName || lastName) ? (firstName + (firstName && lastName ? ' ' : '') + lastName) : 'Unnamed';

            label.appendChild(radio);
            label.appendChild(document.createTextNode(name + " " + temp.id));
            container.appendChild(label);
            container.appendChild(document.createElement('br')); // For better spacing
        });

        console.log("Radio buttons populated with temp");
    }

    function toggleSubmitButtonVisibility() {
        const submitBtn = document.getElementById('submitBtn');
        if (selectedRecordId) {
            submitBtn.style.display = 'block';
        } else {
            submitBtn.style.display = 'none';
        }
    }

    ZOHO.embeddedApp.init().then(function() {
        console.log("Zoho Embedded App SDK initialization completed");
    }).catch(function(error) {
        console.error("Zoho Embedded App SDK initialization error:", error);
    });
});
