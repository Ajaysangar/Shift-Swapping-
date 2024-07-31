document.addEventListener('DOMContentLoaded', function() {
    var buttonsModal = document.getElementById('buttonsModal');
    var tempModal = document.getElementById('tempModal');
    var shiftModal = document.getElementById('shiftModal');
    var fetchAccountsBtn = document.getElementById('fetchAccountsBtn');
    var swapShiftsBtn = document.getElementById('swapShiftsBtn');
    var swapTempsBtn = document.getElementById('swapTempsBtn');
    var closeButtons = document.querySelectorAll('.close');
    var tempData = [];
    var shiftData = [];
    var selectedRecordId = null;
    var selectedShiftIds = [];
    var currentPage = 1;
    var recordsPerPage = 10;
    let maxSelections = 2;

    function closeModals() {
        if (buttonsModal) buttonsModal.style.display = "none";
        if (tempModal) tempModal.style.display = "none";
        if (shiftModal) shiftModal.style.display = "none";
    }

    function setupCloseButtons() {
        closeButtons.forEach(function(button) {
            button.onclick = function() {
                closeModals();
            }
        });
    }

    setupCloseButtons();

    window.onclick = function(event) {
        if (event.target === buttonsModal || event.target === tempModal || event.target === shiftModal) {
            closeModals();
        }
    }

    if (fetchAccountsBtn) {
        fetchAccountsBtn.addEventListener('click', function() {
            buttonsModal.style.display = "block"; // Show the buttons modal
        });
    }

    if (swapTempsBtn) {
        swapTempsBtn.addEventListener('click', function() {
            buttonsModal.style.display = "none"; // Hide the buttons modal
            tempModal.style.display = "block"; // Show the temp modal

            ZOHO.CRM.API.getAllRecords({
                Entity: "Leads",
                sort_order: "asc",
                per_page: 200
            }).then(function(response) {
                console.log("API response received:", response);

                if (response.data && response.data.length > 0) {
                    tempData = response.data.map(temp => ({
                        id: temp.id,
                        First_Name: temp.First_Name || '',
                        Last_Name: temp.Last_Name || ''
                    }));
                    console.log("Temp data processed:", tempData);

                    displayTempPage(currentPage);
                } else {
                    console.log("No temp data found");
                }
            }).catch(function(error) {
                console.error("Error fetching temp data:", error);
            });
        });
    } else {
        console.error("Swap Temps button not found");
    }

    if (swapShiftsBtn) {
        swapShiftsBtn.addEventListener('click', function() {
            console.log("Swap Shifts button clicked");
            buttonsModal.style.display = "none"; // Hide the buttons modal
            shiftModal.style.display = "block"; // Show the shift modal

            ZOHO.CRM.API.getAllRecords({
                Entity: "Shift_Schedule",
                sort_order: "asc",
                per_page: 200
            }).then(function(response) {
                console.log("API response received:", response);

                if (response.data && response.data.length > 0) {
                    shiftData = response.data.map(shift => ({
                        id: shift.id,
                        Name: shift.Name || '',
                        Start_Date_and_Work_Start_Time: shift.Start_Date_and_Work_Start_Time || '',
                        End_Date_and_Work_End_Time: shift.End_Date_and_Work_End_Time || '',
                        Days_in_the_Week: shift.Days_in_the_Week || '',
                        Schedule_For_Temp: shift.Schedule_For_Temp.name || ''
                    }));
                    console.log("Shifts data processed:", shiftData);

                    displayShiftPage(currentPage);
                } else {
                    console.log("No shift data found");
                }
            }).catch(function(error) {
                console.error("Error fetching shift data:", error);
            });
        });
    } else {
        console.error("Swap Shifts button not found");
    }

    if (document.getElementById('prevPageBtn')) {
        document.getElementById('prevPageBtn').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayTempPage(currentPage);
            }
        });
    } else {
        console.error("Previous Page button for temp not found");
    }

    if (document.getElementById('nextPageBtn')) {
        document.getElementById('nextPageBtn').addEventListener('click', function() {
            if (currentPage * recordsPerPage < tempData.length) {
                currentPage++;
                displayTempPage(currentPage);
            }
        });
    } else {
        console.error("Next Page button for temp not found");
    }

    if (document.getElementById('prevShiftPageBtn')) {
        document.getElementById('prevShiftPageBtn').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayShiftPage(currentPage);
            }
        });
    } else {
        console.error("Previous Page button for shift not found");
    }

    if (document.getElementById('nextShiftPageBtn')) {
        document.getElementById('nextShiftPageBtn').addEventListener('click', function() {
            if (currentPage * recordsPerPage < shiftData.length) {
                currentPage++;
                displayShiftPage(currentPage);
            }
        });
    } else {
        console.error("Next Page button for shift not found");
    }

    if (document.getElementById('submitBtn')) {
        document.getElementById('submitBtn').addEventListener('click', function() {
            if (selectedRecordId) {
                console.log("Selected record ID:", selectedRecordId);
                closeModals();
            } else {
                alert("Please select a record first.");
            }
        });
    } else {
        console.error("Submit button for temp not found");
    }

    if (document.getElementById('submitShiftBtn')) {
        document.getElementById('submitShiftBtn').addEventListener('click', function() {
            if (selectedShiftIds.length > 0) {
                console.log("Selected shift IDs:", selectedShiftIds);
                closeModals();
            } else {
                alert("Please select at least one shift.");
            }
        });
    } else {
        console.error("Submit button for shift not found");
    }

    document.getElementById('searchBox').addEventListener('input', function(event) {
        const searchQuery = event.target.value.toLowerCase();
        const filteredData = tempData.filter(temp => 
            (temp.First_Name + ' ' + temp.Last_Name).toLowerCase().includes(searchQuery)
        );
        displayTempPage(1, filteredData); // Reset to the first page of filtered results
    });

    document.getElementById('searchBoxShift').addEventListener('input', function(event) {
        const searchQuery = event.target.value.toLowerCase();
        const filteredData = shiftData.filter(shift => 
            (shift.Name).toLowerCase().includes(searchQuery)
        );
        displayShiftPage(1, filteredData); // Reset to the first page of filtered results
    });

    function displayTempPage(page, data = tempData) {
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

            const firstName = temp.First_Name || '';
            const lastName = temp.Last_Name || '';
            const name = (firstName || lastName) ? (firstName + (firstName && lastName ? ' ' : '') + lastName) : 'Unnamed';

            label.appendChild(radio);
            label.appendChild(document.createTextNode(name + " " + temp.id));
            container.appendChild(label);
            container.appendChild(document.createElement('br')); // For better spacing
        });

        console.log("Radio buttons populated with temp data");
    }

    function displayShiftPage(page, data = shiftData) {
        const container = document.getElementById('shiftContainer');
        if (!container) {
            console.error("Shift container element not found");
            return;
        }

        container.innerHTML = ''; // Clear existing options
        console.log("Shift container cleared");

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pagedData = data.slice(start, end);

        pagedData.forEach(shift => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shift.Name}</td>
                <td>${shift.Schedule_For_Temp}</td>
                <td>${shift.Start_Date_and_Work_Start_Time}</td>
                <td>${shift.End_Date_and_Work_End_Time}</td>
                <td>${shift.Days_in_the_Week}</td>
                <td>
                    <input type="checkbox" name="shift" value="${shift.id}" class="shift-checkbox" />
                </td>
            `;

            container.appendChild(row);
        });

        document.querySelectorAll('.shift-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleShiftSelection);
        });

        console.log("Shift data populated");
    }

    function handleShiftSelection(event) {
        const checkbox = event.target;
        const shiftId = checkbox.value;

        if (checkbox.checked) {
            if (selectedShiftIds.length >= maxSelections) {
                checkbox.checked = false;
                alert('You can only select up to two shifts.');
            } else {
                selectedShiftIds.push(shiftId);
            }
        } else {
            selectedShiftIds = selectedShiftIds.filter(id => id !== shiftId);
        }

        toggleSubmitShiftButtonVisibility();
    }

    function toggleSubmitButtonVisibility() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.style.display = selectedRecordId ? 'block' : 'none';
    }

    function toggleSubmitShiftButtonVisibility() {
        const submitShiftBtn = document.getElementById('submitShiftBtn');
        submitShiftBtn.style.display = selectedShiftIds.length === maxSelections ? 'block' : 'none';
    }

    ZOHO.embeddedApp.init().then(function() {
        console.log("Zoho Embedded App SDK initialization completed");
    }).catch(function(error) {
        console.error("Zoho Embedded App SDK initialization error:", error);
    });
});
