document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const table = document.getElementById("table");
    const sortBtns = document.querySelectorAll(".sortBtn");
    let tasks = [];

    taskInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && taskInput.value.trim() !== "") {
            addToTable(taskInput.value);
            taskInput.value = "";
            saveTasksToLocalStorage();
        }
    });

    function addToTable(content, time, isChecked) {
        const newRow = createRow(content, time, isChecked);
        table.appendChild(newRow);
        // table.insertBefore(newRow, table.firstChild);
    }
    
    
    function createRow(content, time, isChecked) {
        const newRow = document.createElement("tr");
        const newCell = newRow.insertCell(0);
        newCell.className = "contentCell";

        const checkBtn = document.createElement("input");
        const deleteBtn = document.createElement("input");
        const contentRow = document.createElement("div");
        const contentTime = document.createElement("div");

        checkBtn.type = "checkbox";
        checkBtn.className = "checkBtn";
        deleteBtn.type = "button";
        deleteBtn.className = "deleteBtn";
        deleteBtn.value = "x";

        const creationTime = time || (new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
        contentRow.className = "contentRow";
        contentTime.className = "contentTime";
        contentRow.textContent = content;
        contentTime.textContent = creationTime;

        newCell.appendChild(checkBtn);
        newCell.appendChild(contentRow);
        newCell.appendChild(contentTime);
        newCell.appendChild(deleteBtn);

        deleteBtn.addEventListener("click", function () {
            newRow.remove();
            saveTasksToLocalStorage();
        });

        checkBtn.checked = isChecked;

        if (isChecked) {
            contentRow.classList.add("gray");
        }

        let isEditing = false;

        checkBtn.addEventListener("change", function () {
            if (isChecked) {
                const confirmed = confirm("Ви впевнені, що хочете змінити прогрес?");
                if (!confirmed) {
                    checkBtn.checked = true;
                    return;
                }
                saveTasksToLocalStorage();
            }

            isChecked = !isChecked;

            if (isChecked) {
                contentRow.classList.add("gray");
            } else {
                contentRow.classList.remove("gray");
            }
            saveTasksToLocalStorage();
        });

        contentRow.addEventListener('dblclick', function () {
            if (!isChecked && !isEditing) {
                isEditing = true;
                const oldText = contentRow.textContent;
                const editLine = document.createElement('input');
                editLine.value = oldText;
                contentRow.innerHTML = '';
                contentRow.appendChild(editLine);
                checkBtn.disabled = true;
                deleteBtn.disabled = true;
                editLine.focus();
        
                editLine.addEventListener("keydown", function (e) {
                    if (e.key === "Enter" && editLine.value.trim() !== "") {
                        contentRow.textContent = editLine.value;
                        isEditing = false;
                        checkBtn.disabled = false;
                        deleteBtn.disabled = false;
                        saveTasksToLocalStorage();
                    } else if (e.key === "Enter") {
                        editLine.focus();
                    } else if (e.key === "Escape") {
                        contentRow.textContent = oldText;
                        isEditing = false;
                        checkBtn.disabled = false;
                        deleteBtn.disabled = false;
                    }
                });
        
                editLine.addEventListener("blur", function () {
                    contentRow.textContent = oldText;
                    isEditing = false;
                    checkBtn.disabled = false;
                    deleteBtn.disabled = false;
                });
            }
        });

        return newRow;
    }

    function saveTasksToLocalStorage() {
        const rows = Array.from(table.querySelectorAll("tr"));
        tasks = rows.map(row => {
            const checkbox = row.querySelector(".checkBtn");
            const text = row.querySelector(".contentRow").textContent;
            const time = row.querySelector(".contentTime").textContent;
            const checked = checkbox.checked;
    
            return { text, time, checked };
        });
    
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    

    if (localStorage.getItem("tasks")) {
        tasks = JSON.parse(localStorage.getItem("tasks"));
        tasks.forEach(({ text, time, checked }) => {
            addToTable(text, time, checked);
        });
    }

    function sortTable(isCompleted) {
        const rows = Array.from(table.querySelectorAll("tr"));
        rows.sort((a, b) => {
            const aChecked = a.querySelector(".checkBtn").checked;
            const bChecked = b.querySelector(".checkBtn").checked;

            return isCompleted ? aChecked - bChecked : bChecked - aChecked;
        });

        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        rows.forEach(row => {
            table.appendChild(row);
        });
    }

    sortBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const isCompleted = btn.value === "Виконані";
            sortTable(isCompleted);
            saveTasksToLocalStorage();
        });
    });
});