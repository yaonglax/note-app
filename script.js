const openModal = document.getElementById("openModal");
const modalWindow = document.querySelector(".modal-window");
const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const mainContainer = document.querySelector(".main");
const createBtn = document.getElementById("createNote");

let notes = JSON.parse(localStorage.getItem('notes')) || [];

const renderNotes = () => {
    const allNotes = notes.map((note) => {
        return `<div class="note" id="note-${note.id}" style="background-color: ${note.bgColor}; top: ${note.top}; left: ${note.side}">
                    <button id="deleteBtn" onclick="deleteNote(${note.id})"></button>
                    <button id="editBtn" onclick="editNote(${note.id})"></button>
                    <p id="note-title">${note.title}</p>
                    <p id="note-desc">${note.desc}</p>
                </div>`;
    }).join("");
    mainContainer.innerHTML = allNotes;
    notes.forEach(note => {
        const noteElement = document.getElementById(`note-${note.id}`);
        addNoteEventListeners(noteElement, note.id);
    });
};

const createNote = () => {
    const colors = ['#FFC0CB', '#AFEEEE', '#B0C4DE', '#9370DB', '#EE82EE', '#F08080'];
    const color = Math.floor(Math.random() * colors.length);
    let xCoords, yCoords;
    let overlap;

    do {
        xCoords = (Math.floor(Math.random() * (50 - 20) + 20)) + "%";
        yCoords = (Math.floor(Math.random() * (80 - 20) + 20)) + "%";
        overlap = notes.some(note => note.side === xCoords && note.top === yCoords);
    } while (overlap);

    const newTitle = noteTitle.value;
    const newDesc = noteText.value;
    const newId = notes.length + 1;

    if (newTitle || newDesc) {
        notes.push({ id: newId, title: newTitle || "", desc: newDesc || "", bgColor: colors[color], top: yCoords, side: xCoords });
        localStorage.setItem('notes', JSON.stringify(notes));
        openModalWindow();
        noteTitle.value = "";
        noteText.value = "";
        renderNotes();
    } else {
        noteText.placeholder = "Enter title or description";
    }
};

const deleteNote = (id) => {
    modalWindow.style.display = "none";
    notes = notes.filter((note) => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
};

const editNote = (id) => {
    const editBtns = document.querySelectorAll("#editBtn");
    editBtns.forEach(btn => {
        btn.disabled = true;
    });
    openModal.disabled = true;
    modalWindow.style.display = "block";
    const noteToEdit = notes.find(note => note.id === id);
    noteTitle.value = noteToEdit.title;
    noteText.value = noteToEdit.desc;
    createBtn.removeEventListener("click", createNote);
    createBtn.addEventListener("click", function saveEdit() {
        noteToEdit.title = noteTitle.value;
        noteToEdit.desc = noteText.value;
        localStorage.setItem('notes', JSON.stringify(notes));
        noteTitle.value = "";
        noteText.value = "";
        renderNotes();
        modalWindow.style.display = "none";
        createBtn.removeEventListener("click", saveEdit);
        createBtn.addEventListener("click", createNote);
        openModal.disabled = false;
    });
};

const openModalWindow = () => {
    const currentDisplay = window.getComputedStyle(modalWindow).display;
    modalWindow.style.display = currentDisplay === "none" ? "block" : "none";
};

openModal.addEventListener("click", openModalWindow);
createBtn.addEventListener("click", createNote);

const moveNoteStart = (e, id) => {
    const noteToMove = document.getElementById(`note-${id}`);
    const note = notes.find(note => note.id === id);
    const coords = getCoords(noteToMove);
    // Вычисляем смещение от курсора мыши до верхнего левого угла заметки
    const shiftX = e.pageX - coords.left;
    const shiftY = e.pageY - coords.top;
    const moveAt = (e) => {
        let newLeft = e.pageX - shiftX;
        let newTop = e.pageY - shiftY;
        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        const noteWidth = noteToMove.offsetWidth;
        const noteHeight = noteToMove.offsetHeight;

        // Проверяем, чтобы заметка не выходила за границы экрана
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + noteWidth > screenWidth) newLeft = screenWidth - noteWidth;
        if (newTop + noteHeight > screenHeight) newTop = screenHeight - noteHeight;

        noteToMove.style.left = newLeft + 'px';
        noteToMove.style.top = newTop + 'px';
    };

    const onMouseMove = (e) => moveAt(e);
    const onTouchMove = (e) => moveAt(e.touches[0]);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);

    // Функция, вызываемая при отпускании кнопки мыши или окончании прикосновения
    const stopMove = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('mouseup', stopMove);
        document.removeEventListener('touchend', stopMove);
        noteToMove.style.zIndex = 0;
        note.side = noteToMove.style.left;
        note.top = noteToMove.style.top;
        localStorage.setItem('notes', JSON.stringify(notes));
    };
    document.addEventListener('mouseup', stopMove);
    document.addEventListener('touchend', stopMove);
    noteToMove.ondragstart = () => false;
};


const getCoords = (elem) => {
    const box = elem.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset
    };
};

const addNoteEventListeners = (noteElement, noteId) => {
    noteElement.onmousedown = (e) => {
        noteElement.style.zIndex += 100; 
        moveNoteStart(e, noteId); 
    };

    // Обработчик события для начала перемещения заметки прикосновением на сенсорном устройстве
    noteElement.ontouchstart = (e) => {
        noteElement.style.zIndex += 100; 
        const touch = e.touches[0]; // Получаем информацию о первом прикосновении
        const startX = touch.pageX; 
        const startY = touch.pageY;

        const touchMoveHandler = (moveEvent) => {
            const moveTouch = moveEvent.touches[0]; 
            const moveX = moveTouch.pageX; 
            const moveY = moveTouch.pageY; 
            
            const distanceX = Math.abs(moveX - startX);
            const distanceY = Math.abs(moveY - startY);

            // Если смещение больше 10 пикселей по X или Y, начинаем перемещение заметки
            if (distanceX > 10 || distanceY > 10) {
                moveNoteStart(touch, noteId); // Вызываем функцию для начала перемещения заметки
                noteElement.removeEventListener('touchmove', touchMoveHandler); // Удаляем обработчик движения
            }
        };

        // Добавляем обработчик движения прикосновения
        noteElement.addEventListener('touchmove', touchMoveHandler);

        // Обработчик отпускания прикосновения
        noteElement.ontouchend = () => {
            noteElement.removeEventListener('touchmove', touchMoveHandler); // Удаляем обработчик движения
        };
    };
};


renderNotes();
