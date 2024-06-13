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
        noteElement.onmousedown = (e) => {
            noteElement.style.zIndex +=100;
            moveNoteStart(e, note.id);}
    });
};

const createNote = () => {
    const colors = ['#FFC0CB', '#AFEEEE', '#B0C4DE', '#9370DB', '#00FF7F', '#F08080'];
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
        noteText.placeholder = "Введите заголовок или описание";
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
    // Находим элемент заметки по его id
    const noteToMove = document.getElementById(`note-${id}`);
   
    // Находим объект заметки в массиве notes по его id
    const note = notes.find(note => note.id === id);

    // Получаем текущие координаты заметки на странице
    const coords = getCoords(noteToMove);
    
    // Рассчитываем сдвиг курсора относительно верхнего левого угла заметки
    const shiftX = e.pageX - coords.left;
    const shiftY = e.pageY - coords.top;

    // Функция moveAt будет вызываться при перемещении мыши
    const moveAt = (e) => {
        // Устанавливаем новое положение заметки
        noteToMove.style.left = e.pageX - shiftX + 'px';
        noteToMove.style.top = e.pageY - shiftY + 'px';
    };

    // Устанавливаем обработчик события перемещения мыши на всем документе
    document.onmousemove = (e) => moveAt(e);

    // Устанавливаем обработчик события отпускания кнопки мыши на заметке
    noteToMove.onmouseup = () => {
        // При отпускании кнопки мыши удаляем обработчики событий
        document.onmousemove = null;
        noteToMove.onmouseup = null;
        noteToMove.style.zIndex = 0;
        // Обновляем координаты заметки в объекте note и сохраняем в localStorage
        note.side = noteToMove.style.left;
        note.top = noteToMove.style.top;
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    // Отменяем браузерный drag-and-drop для заметки
    noteToMove.ondragstart = () => false;
};

const getCoords = (elem) => {
    const box = elem.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset
    };
};



renderNotes();
