/**
 * WYSIWYG Program Editor
 * Allows users to create and edit shooting programs visually
 */

// State for the editor
let editorState = {
    program: null,
    isEditing: false,
    originalProgramId: null
};

/**
 * Initialize a new program with default values
 */
function createEmptyProgram() {
    return {
        id: null,
        title: "",
        description: "",
        readonly: false,
        series: []
    };
}

/**
 * Create an empty series
 */
function createEmptySeries() {
    return {
        name: "",
        optional: false,
        events: []
    };
}

/**
 * Create an empty event
 */
function createEmptyEvent() {
    return {
        duration: 1000,
        command: "show",
        audio_ids: []
    };
}

/**
 * Open the editor with a program (for editing or creating new)
 */
export function openProgramEditor(program = null) {
    editorState.isEditing = program !== null;
    editorState.originalProgramId = program ? program.id : null;
    editorState.program = program ? JSON.parse(JSON.stringify(program)) : createEmptyProgram();
    
    renderEditor();
    document.getElementById('program-editor-modal').classList.remove('hidden');
}

/**
 * Close the editor
 */
export function closeProgramEditor() {
    document.getElementById('program-editor-modal').classList.add('hidden');
    editorState = {
        program: null,
        isEditing: false,
        originalProgramId: null
    };
}

/**
 * Render the entire editor UI
 */
function renderEditor() {
    const container = document.getElementById('program-editor-content');
    const program = editorState.program;
    
    container.innerHTML = `
        <div class="editor-section">
            <h3>Program Details</h3>
            <div class="form-group">
                <label>Title:</label>
                <input type="text" id="program-title" value="${program.title}" placeholder="Program Title" />
            </div>
            <div class="form-group">
                <label>Description:</label>
                <input type="text" id="program-description" value="${program.description}" placeholder="Program Description" />
            </div>
            ${editorState.isEditing ? `
            <div class="form-group">
                <label>ID:</label>
                <input type="number" id="program-id" value="${program.id || ''}" placeholder="Program ID" />
            </div>
            ` : `
            <div class="form-group">
                <label>ID:</label>
                <input type="number" id="program-id" value="${program.id || ''}" placeholder="Auto-generated if empty" />
            </div>
            `}
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="program-readonly" ${program.readonly ? 'checked' : ''} />
                    Read-only (prevents deletion/editing)
                </label>
            </div>
        </div>
        
        <div class="editor-section">
            <h3>Series</h3>
            <div id="series-container"></div>
            <button id="add-series-btn" class="primary">+ Add Series</button>
        </div>
    `;
    
    renderAllSeries();
    attachEditorListeners();
}

/**
 * Render all series
 */
function renderAllSeries() {
    const container = document.getElementById('series-container');
    const program = editorState.program;
    
    if (program.series.length === 0) {
        container.innerHTML = '<p class="empty-message">No series added yet. Click "Add Series" to get started.</p>';
        return;
    }
    
    container.innerHTML = program.series.map((series, seriesIndex) => `
        <div class="series-item" data-series-index="${seriesIndex}">
            <div class="series-header">
                <h4>Series ${seriesIndex + 1}</h4>
                <button class="delete-btn small" data-action="delete-series" data-index="${seriesIndex}">Delete</button>
            </div>
            <div class="form-group">
                <label>Name:</label>
                <input type="text" class="series-name" data-index="${seriesIndex}" value="${series.name}" placeholder="Series Name" />
            </div>
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" class="series-optional" data-index="${seriesIndex}" ${series.optional ? 'checked' : ''} />
                    Optional
                </label>
            </div>
            <div class="events-section">
                <h5>Events</h5>
                <div class="events-container" data-series-index="${seriesIndex}">
                    ${renderEvents(series.events, seriesIndex)}
                </div>
                <button class="primary small" data-action="add-event" data-series-index="${seriesIndex}">+ Add Event</button>
            </div>
        </div>
    `).join('');
}

/**
 * Render events for a series
 */
function renderEvents(events, seriesIndex) {
    if (events.length === 0) {
        return '<p class="empty-message">No events in this series.</p>';
    }
    
    return events.map((event, eventIndex) => `
        <div class="event-item" data-series-index="${seriesIndex}" data-event-index="${eventIndex}">
            <div class="event-header">
                <span>Event ${eventIndex + 1}</span>
                <button class="delete-btn small" data-action="delete-event" data-series-index="${seriesIndex}" data-event-index="${eventIndex}">×</button>
            </div>
            <div class="event-fields">
                <div class="form-group inline">
                    <label>Duration (ms):</label>
                    <input type="number" class="event-duration" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" value="${event.duration}" min="0" step="100" />
                </div>
                <div class="form-group inline">
                    <label>Command:</label>
                    <select class="event-command" data-series-index="${seriesIndex}" data-event-index="${eventIndex}">
                        <option value="show" ${event.command === 'show' ? 'selected' : ''}>Show</option>
                        <option value="hide" ${event.command === 'hide' ? 'selected' : ''}>Hide</option>
                    </select>
                </div>
                <div class="form-group inline">
                    <label>Audio IDs:</label>
                    <input type="text" class="event-audio-ids" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" value="${(event.audio_ids || []).join(', ')}" placeholder="e.g., 1, 2, 3" />
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Attach event listeners to the editor
 */
function attachEditorListeners() {
    // Program details
    document.getElementById('program-title').addEventListener('input', (e) => {
        editorState.program.title = e.target.value;
    });
    
    document.getElementById('program-description').addEventListener('input', (e) => {
        editorState.program.description = e.target.value;
    });
    
    document.getElementById('program-id').addEventListener('input', (e) => {
        const value = e.target.value;
        editorState.program.id = value ? parseInt(value) : null;
    });
    
    document.getElementById('program-readonly').addEventListener('change', (e) => {
        editorState.program.readonly = e.target.checked;
    });
    
    // Add series button
    document.getElementById('add-series-btn').addEventListener('click', () => {
        editorState.program.series.push(createEmptySeries());
        renderAllSeries();
    });
    
    // Event delegation for series and events
    const seriesContainer = document.getElementById('series-container');
    
    seriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        
        if (action === 'delete-series') {
            const index = parseInt(target.dataset.index);
            if (confirm('Delete this series?')) {
                editorState.program.series.splice(index, 1);
                renderAllSeries();
            }
        } else if (action === 'add-event') {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            editorState.program.series[seriesIndex].events.push(createEmptyEvent());
            renderAllSeries();
        } else if (action === 'delete-event') {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            if (confirm('Delete this event?')) {
                editorState.program.series[seriesIndex].events.splice(eventIndex, 1);
                renderAllSeries();
            }
        }
    });
    
    seriesContainer.addEventListener('input', (e) => {
        const target = e.target;
        
        if (target.classList.contains('series-name')) {
            const index = parseInt(target.dataset.index);
            editorState.program.series[index].name = target.value;
        } else if (target.classList.contains('series-optional')) {
            const index = parseInt(target.dataset.index);
            editorState.program.series[index].optional = target.checked;
        } else if (target.classList.contains('event-duration')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            editorState.program.series[seriesIndex].events[eventIndex].duration = parseInt(target.value);
        } else if (target.classList.contains('event-command')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            editorState.program.series[seriesIndex].events[eventIndex].command = target.value;
        } else if (target.classList.contains('event-audio-ids')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            const value = target.value.trim();
            editorState.program.series[seriesIndex].events[eventIndex].audio_ids = 
                value ? value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
        }
    });
}

/**
 * Save the program
 */
export async function saveProgramFromEditor() {
    const program = editorState.program;
    
    // Validation
    if (!program.title) {
        alert('Please enter a program title');
        return;
    }
    
    if (program.series.length === 0) {
        alert('Please add at least one series');
        return;
    }
    
    // Check that all series have names
    for (let i = 0; i < program.series.length; i++) {
        if (!program.series[i].name) {
            alert(`Please enter a name for Series ${i + 1}`);
            return;
        }
        if (program.series[i].events.length === 0) {
            alert(`Series ${i + 1} must have at least one event`);
            return;
        }
    }
    
    return {
        program: program,
        originalId: editorState.originalProgramId
    };
}

/**
 * Initialize the editor modal in the DOM
 */
export function initializeProgramEditorModal() {
    // Check if modal already exists
    if (document.getElementById('program-editor-modal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'program-editor-modal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h2 id="editor-title">Program Editor</h2>
                <button id="close-editor-btn" class="close-btn">×</button>
            </div>
            <div id="program-editor-content" class="modal-body"></div>
            <div class="modal-footer">
                <button id="cancel-editor-btn" class="secondary">Cancel</button>
                <button id="save-editor-btn" class="primary">Save Program</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Attach close and save listeners
    document.getElementById('close-editor-btn').addEventListener('click', closeProgramEditor);
    document.getElementById('cancel-editor-btn').addEventListener('click', closeProgramEditor);
}
