/**
 * WYSIWYG Program Editor
 * Allows users to create and edit shooting programs visually
 */

import { fetchAudios } from '../../apis/rest-client.js';
import { renderTimeline, TimelineType } from './timeline.js';

// State for the editor
let editorState = {
    program: null,
    isEditing: false,
    originalProgramId: null,
    audios: [], // Cache of available audios
    timelineMode: null, // null = auto, TimelineType.Default, or TimelineType.Field
    jsonError: null, // JSON validation error
    collapsedSeries: new Set(), // Track which series are collapsed in events view
    selectedEvents: new Set(), // Track selected events for batch operations (format: "seriesIndex-eventIndex")
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
        command: null, // Command is optional
        audio_ids: []
    };
}

/**
 * Open the editor with a program (for editing or creating new)
 */
export async function openProgramEditor(program = null) {
    editorState.isEditing = program !== null;
    editorState.originalProgramId = program ? program.id : null;
    editorState.program = program ? JSON.parse(JSON.stringify(program)) : createEmptyProgram();
    
    // Load audios if not already cached
    if (editorState.audios.length === 0) {
        try {
            const response = await fetchAudios();
            editorState.audios = response.audios || [];
        } catch (err) {
            console.error('Failed to load audios:', err);
            // Use mock data for testing when API is unavailable
            editorState.audios = [
                { id: 1, title: "1" },
                { id: 10, title: "10" },
                { id: 21, title: "Banan är öppen" },
                { id: 26, title: "Ladda!" },
                { id: 31, title: "Färdiga!" },
                { id: 33, title: "Eld!" },
                { id: 34, title: "Eld upphör!" },
                { id: 50, title: "Provserie" }
            ];
        }
    }
    
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
        originalProgramId: null,
        audios: [],
        timelineMode: null,
        collapsedSeries: new Set(),
        selectedEvents: new Set()
    };
}

/**
 * Render the events-based view
 */
function renderEventsView() {
    const container = document.getElementById('events-view-container');
    const program = editorState.program;
    
    if (!program.series || program.series.length === 0) {
        container.innerHTML = '<p class="empty-message">No series added yet. Switch to Form tab to add series.</p>';
        return;
    }
    
    container.innerHTML = program.series.map((series, seriesIndex) => {
        const isCollapsed = editorState.collapsedSeries.has(seriesIndex);
        const totalEvents = series.events.length;
        const totalDuration = series.events.reduce((sum, event) => sum + event.duration, 0);
        
        return `
            <div class="events-view-series" data-series-index="${seriesIndex}">
                <div class="events-view-series-header ${isCollapsed ? 'collapsed' : ''}">
                    <button class="series-toggle-btn" data-series-index="${seriesIndex}" title="Toggle series">
                        <span class="toggle-icon">${isCollapsed ? '▶' : '▼'}</span>
                    </button>
                    <div class="series-info">
                        <h4>${series.name || `Series ${seriesIndex + 1}`}</h4>
                        <span class="series-meta">${totalEvents} event${totalEvents !== 1 ? 's' : ''} • ${(totalDuration / 1000).toFixed(1)}s ${series.optional ? '• Optional' : ''}</span>
                    </div>
                    <div class="series-actions">
                        <button class="secondary small" data-action="add-event-to-series" data-series-index="${seriesIndex}" title="Add Event">+ Event</button>
                        <button class="secondary small" data-action="duplicate-series" data-series-index="${seriesIndex}" title="Duplicate Series">Duplicate</button>
                        <button class="delete-btn small icon-only" data-action="delete-series-events-view" data-series-index="${seriesIndex}" title="Delete Series">
                            <img src="/icons/delete_24_regular.svg" alt="Delete" width="18" height="18" />
                        </button>
                    </div>
                </div>
                ${!isCollapsed ? `
                <div class="events-view-list" data-series-index="${seriesIndex}">
                    ${series.events.length > 0 ? series.events.map((event, eventIndex) => {
                        const eventId = `${seriesIndex}-${eventIndex}`;
                        const isSelected = editorState.selectedEvents.has(eventId);
                        const audioTitles = (event.audio_ids || []).map(id => {
                            const audio = editorState.audios.find(a => a.id === id);
                            return audio ? audio.title : `ID ${id}`;
                        }).join(', ');
                        
                        return `
                            <div class="events-view-item ${isSelected ? 'selected' : ''}" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" data-event-id="${eventId}" draggable="true">
                                <div class="event-select">
                                    <input type="checkbox" class="event-checkbox" data-event-id="${eventId}" ${isSelected ? 'checked' : ''} />
                                </div>
                                <div class="event-drag-handle" title="Drag to reorder">≡</div>
                                <div class="event-details">
                                    <div class="event-detail-row">
                                        <span class="event-label">Event ${eventIndex + 1}</span>
                                        <span class="event-command-badge ${event.command || 'none'}">${event.command ? event.command.toUpperCase() : 'NO CHANGE'}</span>
                                    </div>
                                    <div class="event-detail-row secondary">
                                        <span>Duration: ${event.duration}ms (${(event.duration / 1000).toFixed(1)}s)</span>
                                        ${audioTitles ? `<span class="audio-badge" title="${audioTitles}">♫ ${(event.audio_ids || []).length} audio${(event.audio_ids || []).length !== 1 ? 's' : ''}</span>` : ''}
                                    </div>
                                    ${audioTitles ? `<div class="event-detail-row audio-list">${audioTitles}</div>` : ''}
                                </div>
                                <div class="event-actions">
                                    <button class="secondary small icon-only" data-action="edit-event" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" title="Edit Event">
                                        <img src="/icons/edit_24_regular.svg" alt="Edit" width="18" height="18" />
                                    </button>
                                    <button class="secondary small" data-action="duplicate-event" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" title="Duplicate Event">Dup</button>
                                    <button class="delete-btn small icon-only" data-action="delete-event-events-view" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" title="Delete Event">
                                        <img src="/icons/delete_24_regular.svg" alt="Delete" width="18" height="18" />
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="empty-message">No events in this series.</p>'}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Add batch actions bar if any events are selected
    const selectedCount = editorState.selectedEvents.size;
    if (selectedCount > 0) {
        const batchBar = document.createElement('div');
        batchBar.className = 'batch-actions-bar';
        batchBar.innerHTML = `
            <span class="batch-count">${selectedCount} event${selectedCount !== 1 ? 's' : ''} selected</span>
            <div class="batch-buttons">
                <button id="batch-delete-btn" class="delete-btn small">Delete Selected</button>
                <button id="batch-deselect-btn" class="secondary small">Clear Selection</button>
            </div>
        `;
        container.prepend(batchBar);
    }
    
    attachEventsViewListeners();
}

/**
 * Render the entire editor UI
 */
function renderEditor() {
    const container = document.getElementById('program-editor-content');
    const program = editorState.program;
    
    container.innerHTML = `
        <div class="editor-tabs">
            <button class="editor-tab active" data-tab="editor">Form</button>
            <button class="editor-tab" data-tab="events">Events</button>
            <button class="editor-tab" data-tab="preview">Preview</button>
            <button class="editor-tab" data-tab="json">JSON</button>
        </div>
        <div class="editor-tab-content active" id="editor-tab-editor">
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
        </div>
        <div class="editor-tab-content" id="editor-tab-events">
            <div class="events-view-header">
                <h3>Event-Based View</h3>
                <div class="events-view-actions">
                    <button id="expand-all-series-btn" class="secondary small">Expand All</button>
                    <button id="collapse-all-series-btn" class="secondary small">Collapse All</button>
                </div>
            </div>
            <div id="events-view-container"></div>
        </div>
        <div class="editor-tab-content" id="editor-tab-preview">
            <div class="preview-controls">
                <label for="editor-timeline-mode-select">Timeline Mode:</label>
                <select id="editor-timeline-mode-select">
                    <option value="auto">Auto</option>
                    <option value="default">Event-based</option>
                    <option value="field">Time-scaled</option>
                </select>
            </div>
            <div id="editor-timeline-preview" class="timeline-preview-container"></div>
        </div>
        <div class="editor-tab-content" id="editor-tab-json">
            <div class="json-editor-controls">
                <button id="format-json-btn" class="primary small">Format JSON</button>
                <span id="json-validation-status" class="json-validation-status"></span>
            </div>
            <div class="json-editor-wrapper">
                <div class="json-line-numbers" id="json-line-numbers"></div>
                <textarea id="json-editor-textarea" class="json-editor-textarea" spellcheck="false"></textarea>
            </div>
            <div id="json-error-message" class="json-error-message"></div>
        </div>
    `;
    
    renderAllSeries();
    renderTimelinePreview();
    attachEditorListeners();
    attachTabListeners();
}

/**
 * Render the timeline preview based on current program state
 */
function renderTimelinePreview() {
    const previewContainer = document.getElementById('editor-timeline-preview');
    const program = editorState.program;
    
    // Don't render if no series or events
    if (!program.series || program.series.length === 0) {
        previewContainer.innerHTML = '<p class="empty-message">Add series and events to see timeline preview</p>';
        return;
    }
    
    // Check if any series has events
    const hasEvents = program.series.some(series => series.events && series.events.length > 0);
    if (!hasEvents) {
        previewContainer.innerHTML = '<p class="empty-message">Add events to series to see timeline preview</p>';
        return;
    }
    
    // Determine timeline type based on mode selector
    let timelineType = editorState.timelineMode;
    
    // Render the timeline
    renderTimeline(previewContainer, program, timelineType);
}

/**
 * Attach tab switching listeners
 */
function attachTabListeners() {
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.dataset.tab;
            
            // Check if switching away from JSON tab before removing active class
            const currentActiveTab = document.querySelector('.editor-tab.active');
            const switchingFromJson = currentActiveTab && currentActiveTab.dataset.tab === 'json' && targetTab !== 'json';
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.editor-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            document.getElementById(`editor-tab-${targetTab}`).classList.add('active');
            
            // If switching away from JSON tab, sync changes
            if (switchingFromJson) {
                syncJsonToProgram();
            }
            
            // If switching to preview tab, refresh the timeline
            if (targetTab === 'preview') {
                renderTimelinePreview();
            }
            
            // If switching to JSON tab, update JSON editor
            if (targetTab === 'json') {
                updateJsonEditor();
            }
            
            // If switching to events tab, render events view
            if (targetTab === 'events') {
                renderEventsView();
            }
        });
    });
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
                <button class="delete-btn small icon-only" data-action="delete-series" data-index="${seriesIndex}" title="Delete Series">
                    <img src="/icons/delete_24_regular.svg" alt="Delete" width="20" height="20" />
                </button>
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
        <div class="event-item" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" draggable="true">
            <div class="event-header">
                <span class="drag-handle">≡</span>
                <span>Event ${eventIndex + 1}</span>
                <button class="delete-btn small icon-only" data-action="delete-event" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" title="Delete Event">
                    <img src="/icons/delete_24_regular.svg" alt="Delete" width="20" height="20" />
                </button>
            </div>
            <div class="event-fields">
                <div class="form-group inline">
                    <label>Duration (ms):</label>
                    <input type="number" class="event-duration" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" value="${event.duration}" min="0" step="100" />
                </div>
                <div class="form-group inline">
                    <label>Command:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="command-${seriesIndex}-${eventIndex}" value="show" class="event-command" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" ${event.command === 'show' ? 'checked' : ''} />
                            Show
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="command-${seriesIndex}-${eventIndex}" value="hide" class="event-command" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" ${event.command === 'hide' ? 'checked' : ''} />
                            Hide
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="command-${seriesIndex}-${eventIndex}" value="" class="event-command" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" ${!event.command ? 'checked' : ''} />
                            No Change
                        </label>
                    </div>
                </div>
                <div class="form-group audio-ids-group inline">
                    <label>Audio IDs:</label>
                    <div class="audio-search-container">
                        <input type="text" class="audio-search-input" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" placeholder="Search audios by ID or title..." />
                        <div class="audio-suggestions" data-series-index="${seriesIndex}" data-event-index="${eventIndex}"></div>
                    </div>
                </div>
                <div class="selected-audios-container">
                    <div class="selected-audios" data-series-index="${seriesIndex}" data-event-index="${eventIndex}">
                        ${renderSelectedAudios(event.audio_ids || [], seriesIndex, eventIndex)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Render selected audio IDs for an event
 */
function renderSelectedAudios(audioIds, seriesIndex, eventIndex) {
    if (audioIds.length === 0) {
        return '<p class="empty-message small">No audios selected</p>';
    }
    
    return audioIds.map((audioId, audioIndex) => {
        const audio = editorState.audios.find(a => a.id === audioId);
        const title = audio ? audio.title : 'Unknown';
        return `
            <div class="selected-audio-item" data-audio-index="${audioIndex}" draggable="true">
                <span class="drag-handle">≡</span>
                <span class="audio-label">${audioId} - ${title}</span>
                <button class="remove-audio-btn icon-only" data-series-index="${seriesIndex}" data-event-index="${eventIndex}" data-audio-index="${audioIndex}" title="Delete Audio">
                    <img src="/icons/delete_24_regular.svg" alt="Delete" width="18" height="18" />
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Update the JSON editor with current program state
 */
function updateJsonEditor() {
    const textarea = document.getElementById('json-editor-textarea');
    if (textarea) {
        textarea.value = JSON.stringify(editorState.program, null, 2);
        updateLineNumbers();
        validateJson();
    }
}

/**
 * Update line numbers for JSON editor
 */
function updateLineNumbers() {
    const textarea = document.getElementById('json-editor-textarea');
    const lineNumbersDiv = document.getElementById('json-line-numbers');
    
    if (!textarea || !lineNumbersDiv) return;
    
    const lines = textarea.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => `<div>${index + 1}</div>`).join('');
    lineNumbersDiv.innerHTML = lineNumbersHtml;
}

/**
 * Validate JSON and update UI
 */
function validateJson() {
    const textarea = document.getElementById('json-editor-textarea');
    const statusElement = document.getElementById('json-validation-status');
    const errorElement = document.getElementById('json-error-message');
    
    if (!textarea) return;
    
    try {
        const parsed = JSON.parse(textarea.value);
        editorState.jsonError = null;
        statusElement.textContent = '✓ Valid JSON';
        statusElement.className = 'json-validation-status valid';
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        return parsed;
    } catch (error) {
        editorState.jsonError = error.message;
        statusElement.textContent = '✗ Invalid JSON';
        statusElement.className = 'json-validation-status invalid';
        errorElement.textContent = `Error: ${error.message}`;
        errorElement.style.display = 'block';
        return null;
    }
}

/**
 * Format JSON in the editor
 */
function formatJson() {
    const textarea = document.getElementById('json-editor-textarea');
    if (!textarea) return;
    
    try {
        const parsed = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(parsed, null, 2);
        updateLineNumbers();
        validateJson();
    } catch (error) {
        // If JSON is invalid, validation will show the error
        validateJson();
    }
}

/**
 * Sync JSON changes back to program state
 */
function syncJsonToProgram() {
    const parsed = validateJson();
    if (parsed) {
        // Validate that the parsed object has the required program structure
        if (!('title' in parsed) || !('series' in parsed) || !Array.isArray(parsed.series)) {
            const errorElement = document.getElementById('json-error-message');
            const statusElement = document.getElementById('json-validation-status');
            statusElement.textContent = '✗ Invalid Program Structure';
            statusElement.className = 'json-validation-status invalid';
            errorElement.textContent = 'Error: Program must have "title" and "series" (array) properties';
            errorElement.style.display = 'block';
            return;
        }
        
        editorState.program = parsed;
        // Re-render other views to reflect changes
        renderAllSeries();
        renderTimelinePreview();
    }
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
        if (value) {
            const id = parseInt(value);
            editorState.program.id = !isNaN(id) ? id : null;
        } else {
            editorState.program.id = null;
        }
    });
    
    document.getElementById('program-readonly').addEventListener('change', (e) => {
        editorState.program.readonly = e.target.checked;
    });
    
    // Timeline mode selector
    document.getElementById('editor-timeline-mode-select').addEventListener('change', (e) => {
        const mode = e.target.value;
        if (mode === 'auto') {
            editorState.timelineMode = null;
        } else if (mode === 'default') {
            editorState.timelineMode = TimelineType.Default;
        } else if (mode === 'field') {
            editorState.timelineMode = TimelineType.Field;
        }
        renderTimelinePreview();
    });
    
    // Add series button
    document.getElementById('add-series-btn').addEventListener('click', () => {
        editorState.program.series.push(createEmptySeries());
        renderAllSeries();
        renderTimelinePreview();
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
                renderTimelinePreview();
            }
        } else if (action === 'add-event') {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            editorState.program.series[seriesIndex].events.push(createEmptyEvent());
            renderAllSeries();
            renderTimelinePreview();
        } else if (action === 'delete-event') {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            if (confirm('Delete this event?')) {
                editorState.program.series[seriesIndex].events.splice(eventIndex, 1);
                renderAllSeries();
                renderTimelinePreview();
            }
        }
    });
    
    seriesContainer.addEventListener('input', (e) => {
        const target = e.target;
        
        if (target.classList.contains('series-name')) {
            const index = parseInt(target.dataset.index);
            editorState.program.series[index].name = target.value;
            renderTimelinePreview();
        } else if (target.classList.contains('series-optional')) {
            const index = parseInt(target.dataset.index);
            editorState.program.series[index].optional = target.checked;
            renderTimelinePreview();
        } else if (target.classList.contains('event-duration')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            const duration = parseInt(target.value);
            if (!isNaN(duration) && duration >= 0) {
                editorState.program.series[seriesIndex].events[eventIndex].duration = duration;
                renderTimelinePreview();
            }
        } else if (target.classList.contains('event-command')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            const value = target.value;
            editorState.program.series[seriesIndex].events[eventIndex].command = value || null;
            renderTimelinePreview();
        } else if (target.classList.contains('audio-search-input')) {
            handleAudioSearch(target);
        }
    });
    
    // Handle audio selection from suggestions
    seriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle audio suggestion click
        if (target.classList.contains('audio-suggestion-item')) {
            const audioId = parseInt(target.dataset.audioId);
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            addAudioToEvent(seriesIndex, eventIndex, audioId);
        }
        
        // Handle remove audio button
        if (target.classList.contains('remove-audio-btn')) {
            const seriesIndex = parseInt(target.dataset.seriesIndex);
            const eventIndex = parseInt(target.dataset.eventIndex);
            const audioIndex = parseInt(target.dataset.audioIndex);
            removeAudioFromEvent(seriesIndex, eventIndex, audioIndex);
        }
    });
    
    // Handle drag and drop for audio reordering
    seriesContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('selected-audio-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }
        // Handle event item dragging
        if (e.target.classList.contains('event-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }
    });
    
    seriesContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('selected-audio-item')) {
            e.target.classList.remove('dragging');
        }
        // Handle event item drag end
        if (e.target.classList.contains('event-item')) {
            e.target.classList.remove('dragging');
        }
    });
    
    seriesContainer.addEventListener('dragover', (e) => {
        // Handle audio item dragover
        if (e.target.closest('.selected-audio-item')) {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging.selected-audio-item');
            const targetElement = e.target.closest('.selected-audio-item');
            
            if (draggingElement && targetElement && draggingElement !== targetElement) {
                const container = targetElement.parentElement;
                const draggingIndex = Array.from(container.children).indexOf(draggingElement);
                const targetIndex = Array.from(container.children).indexOf(targetElement);
                
                if (draggingIndex < targetIndex) {
                    targetElement.after(draggingElement);
                } else {
                    targetElement.before(draggingElement);
                }
            }
        }
        
        // Handle event item dragover
        if (e.target.closest('.event-item')) {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging.event-item');
            const targetElement = e.target.closest('.event-item');
            
            if (draggingElement && targetElement && draggingElement !== targetElement) {
                // Make sure they're in the same series
                const draggingSeriesIndex = draggingElement.dataset.seriesIndex;
                const targetSeriesIndex = targetElement.dataset.seriesIndex;
                
                if (draggingSeriesIndex === targetSeriesIndex) {
                    const container = targetElement.parentElement;
                    const draggingIndex = Array.from(container.children).filter(el => el.classList.contains('event-item')).indexOf(draggingElement);
                    const targetIndex = Array.from(container.children).filter(el => el.classList.contains('event-item')).indexOf(targetElement);
                    
                    if (draggingIndex < targetIndex) {
                        targetElement.after(draggingElement);
                    } else {
                        targetElement.before(draggingElement);
                    }
                }
            }
        }
    });
    
    seriesContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingAudio = document.querySelector('.dragging.selected-audio-item');
        const draggingEvent = document.querySelector('.dragging.event-item');
        
        // Handle audio drop
        if (draggingAudio) {
            const container = draggingAudio.parentElement;
            const seriesIndex = parseInt(container.dataset.seriesIndex);
            const eventIndex = parseInt(container.dataset.eventIndex);
            
            // Get new order of audio IDs
            const newOrder = Array.from(container.querySelectorAll('.selected-audio-item')).map(item => {
                const label = item.querySelector('.audio-label').textContent;
                return parseInt(label.split(' - ')[0]);
            });
            
            editorState.program.series[seriesIndex].events[eventIndex].audio_ids = newOrder;
            renderTimelinePreview();
        }
        
        // Handle event drop
        if (draggingEvent) {
            const seriesIndex = parseInt(draggingEvent.dataset.seriesIndex);
            const container = draggingEvent.parentElement;
            
            // Get new order of events
            const eventElements = Array.from(container.querySelectorAll('.event-item'));
            const newEventOrder = eventElements.map(el => {
                const oldEventIndex = parseInt(el.dataset.eventIndex);
                return editorState.program.series[seriesIndex].events[oldEventIndex];
            });
            
            // Update the events array with new order
            editorState.program.series[seriesIndex].events = newEventOrder;
            
            // Re-render to update indices
            renderAllSeries();
            renderTimelinePreview();
        }
    });
    
    // JSON editor event listeners
    const jsonTextarea = document.getElementById('json-editor-textarea');
    if (jsonTextarea) {
        // Update line numbers and validate on input
        jsonTextarea.addEventListener('input', () => {
            updateLineNumbers();
            validateJson();
        });
        
        // Sync scroll between textarea and line numbers
        jsonTextarea.addEventListener('scroll', () => {
            const lineNumbers = document.getElementById('json-line-numbers');
            if (lineNumbers) {
                lineNumbers.scrollTop = jsonTextarea.scrollTop;
            }
        });
        
        // Sync changes to program on blur (when user leaves the field)
        jsonTextarea.addEventListener('blur', () => {
            syncJsonToProgram();
        });
        
        // Handle tab key for indentation
        jsonTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = jsonTextarea.selectionStart;
                const end = jsonTextarea.selectionEnd;
                
                if (e.shiftKey) {
                    // Shift+Tab: Remove indentation
                    const textBefore = jsonTextarea.value.substring(0, start);
                    const lastLineStart = textBefore.lastIndexOf('\n') + 1;
                    const lineStart = jsonTextarea.value.substring(lastLineStart, start);
                    
                    if (lineStart.startsWith('  ')) {
                        jsonTextarea.value = jsonTextarea.value.substring(0, lastLineStart) + 
                                           lineStart.substring(2) + 
                                           jsonTextarea.value.substring(start);
                        jsonTextarea.selectionStart = jsonTextarea.selectionEnd = start - 2;
                    }
                } else {
                    // Tab: Add indentation
                    jsonTextarea.value = jsonTextarea.value.substring(0, start) + '  ' + jsonTextarea.value.substring(end);
                    jsonTextarea.selectionStart = jsonTextarea.selectionEnd = start + 2;
                }
                
                updateLineNumbers();
                validateJson();
            }
        });
    }
    
    // Format JSON button
    const formatBtn = document.getElementById('format-json-btn');
    if (formatBtn) {
        formatBtn.addEventListener('click', () => {
            formatJson(); // formatJson() internally calls validateJson()
        });
    }
}

/**
 * Attach event listeners to the events view
 */
function attachEventsViewListeners() {
    const container = document.getElementById('events-view-container');
    if (!container) return;
    
    // Expand/Collapse all buttons
    const expandAllBtn = document.getElementById('expand-all-series-btn');
    const collapseAllBtn = document.getElementById('collapse-all-series-btn');
    
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            editorState.collapsedSeries.clear();
            renderEventsView();
        });
    }
    
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
            editorState.program.series.forEach((_, index) => {
                editorState.collapsedSeries.add(index);
            });
            renderEventsView();
        });
    }
    
    // Series toggle buttons
    container.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.series-toggle-btn');
        if (toggleBtn) {
            const seriesIndex = parseInt(toggleBtn.dataset.seriesIndex);
            if (editorState.collapsedSeries.has(seriesIndex)) {
                editorState.collapsedSeries.delete(seriesIndex);
            } else {
                editorState.collapsedSeries.add(seriesIndex);
            }
            renderEventsView();
            return;
        }
        
        // Handle action buttons
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const seriesIndex = parseInt(actionBtn.dataset.seriesIndex);
            const eventIndex = parseInt(actionBtn.dataset.eventIndex);
            
            if (action === 'add-event-to-series') {
                editorState.program.series[seriesIndex].events.push(createEmptyEvent());
                renderEventsView();
                renderTimelinePreview();
            } else if (action === 'delete-series-events-view') {
                if (confirm('Delete this series?')) {
                    editorState.program.series.splice(seriesIndex, 1);
                    // Update collapsed series indices
                    const newCollapsed = new Set();
                    editorState.collapsedSeries.forEach(idx => {
                        if (idx < seriesIndex) newCollapsed.add(idx);
                        else if (idx > seriesIndex) newCollapsed.add(idx - 1);
                    });
                    editorState.collapsedSeries = newCollapsed;
                    renderEventsView();
                    renderTimelinePreview();
                }
            } else if (action === 'duplicate-series') {
                const clonedSeries = JSON.parse(JSON.stringify(editorState.program.series[seriesIndex]));
                clonedSeries.name = clonedSeries.name + ' (Copy)';
                editorState.program.series.splice(seriesIndex + 1, 0, clonedSeries);
                renderEventsView();
                renderTimelinePreview();
            } else if (action === 'edit-event') {
                openEventEditModal(seriesIndex, eventIndex);
            } else if (action === 'duplicate-event') {
                const clonedEvent = JSON.parse(JSON.stringify(editorState.program.series[seriesIndex].events[eventIndex]));
                editorState.program.series[seriesIndex].events.splice(eventIndex + 1, 0, clonedEvent);
                renderEventsView();
                renderTimelinePreview();
            } else if (action === 'delete-event-events-view') {
                if (confirm('Delete this event?')) {
                    editorState.program.series[seriesIndex].events.splice(eventIndex, 1);
                    renderEventsView();
                    renderTimelinePreview();
                }
            }
        }
    });
    
    // Event checkboxes for batch selection
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('event-checkbox')) {
            const eventId = e.target.dataset.eventId;
            if (e.target.checked) {
                editorState.selectedEvents.add(eventId);
            } else {
                editorState.selectedEvents.delete(eventId);
            }
            renderEventsView();
        }
    });
    
    // Batch action buttons
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    const batchDeselectBtn = document.getElementById('batch-deselect-btn');
    
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', () => {
            if (confirm(`Delete ${editorState.selectedEvents.size} selected event(s)?`)) {
                // Convert selected event IDs to indices
                const toDelete = Array.from(editorState.selectedEvents).map(id => {
                    const [seriesIdx, eventIdx] = id.split('-').map(Number);
                    return { seriesIdx, eventIdx };
                });
                
                // Sort by series then event index in reverse to delete from end first
                toDelete.sort((a, b) => {
                    if (a.seriesIdx !== b.seriesIdx) return b.seriesIdx - a.seriesIdx;
                    return b.eventIdx - a.eventIdx;
                });
                
                // Delete events
                toDelete.forEach(({ seriesIdx, eventIdx }) => {
                    if (editorState.program.series[seriesIdx] && 
                        editorState.program.series[seriesIdx].events[eventIdx]) {
                        editorState.program.series[seriesIdx].events.splice(eventIdx, 1);
                    }
                });
                
                editorState.selectedEvents.clear();
                renderEventsView();
                renderTimelinePreview();
            }
        });
    }
    
    if (batchDeselectBtn) {
        batchDeselectBtn.addEventListener('click', () => {
            editorState.selectedEvents.clear();
            renderEventsView();
        });
    }
    
    // Drag and drop for event reordering
    container.addEventListener('dragstart', (e) => {
        const eventItem = e.target.closest('.events-view-item');
        if (eventItem) {
            eventItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', eventItem.dataset.eventId);
        }
    });
    
    container.addEventListener('dragend', (e) => {
        const eventItem = e.target.closest('.events-view-item');
        if (eventItem) {
            eventItem.classList.remove('dragging');
        }
    });
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.events-view-item.dragging');
        const targetItem = e.target.closest('.events-view-item');
        
        if (draggingItem && targetItem && draggingItem !== targetItem) {
            const targetSeriesIndex = parseInt(targetItem.dataset.seriesIndex);
            const draggingSeriesIndex = parseInt(draggingItem.dataset.seriesIndex);
            
            // Only allow reordering within the same series
            if (targetSeriesIndex === draggingSeriesIndex) {
                const container = targetItem.parentElement;
                const allItems = Array.from(container.querySelectorAll('.events-view-item'));
                const draggingIndex = allItems.indexOf(draggingItem);
                const targetIndex = allItems.indexOf(targetItem);
                
                if (draggingIndex < targetIndex) {
                    targetItem.after(draggingItem);
                } else {
                    targetItem.before(draggingItem);
                }
            }
        }
    });
    
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.events-view-item.dragging');
        
        if (draggingItem) {
            const seriesIndex = parseInt(draggingItem.dataset.seriesIndex);
            const listContainer = draggingItem.parentElement;
            
            // Get new order of events
            const eventItems = Array.from(listContainer.querySelectorAll('.events-view-item'));
            const newEventOrder = eventItems.map(item => {
                const oldEventIndex = parseInt(item.dataset.eventIndex);
                return editorState.program.series[seriesIndex].events[oldEventIndex];
            });
            
            // Update the events array with new order
            editorState.program.series[seriesIndex].events = newEventOrder;
            
            // Re-render to update indices
            renderEventsView();
            renderTimelinePreview();
        }
    });
    
    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
        const focusedItem = document.activeElement.closest('.events-view-item');
        if (!focusedItem) return;
        
        const seriesIndex = parseInt(focusedItem.dataset.seriesIndex);
        const eventIndex = parseInt(focusedItem.dataset.eventIndex);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = focusedItem.nextElementSibling;
            if (nextItem && nextItem.classList.contains('events-view-item')) {
                nextItem.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = focusedItem.previousElementSibling;
            if (prevItem && prevItem.classList.contains('events-view-item')) {
                prevItem.focus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            openEventEditModal(seriesIndex, eventIndex);
        } else if (e.key === 'Delete') {
            e.preventDefault();
            if (confirm('Delete this event?')) {
                editorState.program.series[seriesIndex].events.splice(eventIndex, 1);
                renderEventsView();
                renderTimelinePreview();
            }
        }
    });
    
    // Make event items focusable for keyboard navigation
    container.querySelectorAll('.events-view-item').forEach(item => {
        item.setAttribute('tabindex', '0');
    });
}

/**
 * Open modal to edit event details
 */
function openEventEditModal(seriesIndex, eventIndex) {
    const event = editorState.program.series[seriesIndex].events[eventIndex];
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Event ${eventIndex + 1}</h2>
                <button class="close-btn" id="close-event-modal">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Duration (ms):</label>
                    <input type="number" id="event-modal-duration" value="${event.duration}" min="0" step="100" />
                </div>
                <div class="form-group">
                    <label>Command:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="event-modal-command" value="show" ${event.command === 'show' ? 'checked' : ''} />
                            Show
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="event-modal-command" value="hide" ${event.command === 'hide' ? 'checked' : ''} />
                            Hide
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="event-modal-command" value="" ${!event.command ? 'checked' : ''} />
                            No Change
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Audio IDs:</label>
                    <div class="audio-search-container">
                        <input type="text" id="event-modal-audio-search" class="audio-search-input" placeholder="Search audios by ID or title..." />
                        <div class="audio-suggestions" id="event-modal-audio-suggestions"></div>
                    </div>
                    <div class="selected-audios" id="event-modal-selected-audios" style="margin-top: 0.5rem;">
                        ${renderSelectedAudiosForModal(event.audio_ids || [])}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary" id="cancel-event-modal">Cancel</button>
                <button class="primary" id="save-event-modal">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Attach event listeners
    const closeBtn = modal.querySelector('#close-event-modal');
    const cancelBtn = modal.querySelector('#cancel-event-modal');
    const saveBtn = modal.querySelector('#save-event-modal');
    const audioSearch = modal.querySelector('#event-modal-audio-search');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', () => {
        const duration = parseInt(modal.querySelector('#event-modal-duration').value);
        const command = modal.querySelector('input[name="event-modal-command"]:checked').value || null;
        
        editorState.program.series[seriesIndex].events[eventIndex].duration = duration;
        editorState.program.series[seriesIndex].events[eventIndex].command = command;
        
        closeModal();
        renderEventsView();
        renderTimelinePreview();
    });
    
    // Audio search functionality
    audioSearch.addEventListener('input', () => {
        handleAudioSearchInModal(audioSearch, event.audio_ids || []);
    });
    
    // Handle audio selection
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('audio-suggestion-item-modal')) {
            const audioId = parseInt(e.target.dataset.audioId);
            if (!event.audio_ids) event.audio_ids = [];
            if (!event.audio_ids.includes(audioId)) {
                event.audio_ids.push(audioId);
                modal.querySelector('#event-modal-selected-audios').innerHTML = renderSelectedAudiosForModal(event.audio_ids);
                audioSearch.value = '';
                modal.querySelector('#event-modal-audio-suggestions').innerHTML = '';
            }
        }
        
        if (e.target.classList.contains('remove-audio-btn-modal')) {
            const audioIndex = parseInt(e.target.dataset.audioIndex);
            event.audio_ids.splice(audioIndex, 1);
            modal.querySelector('#event-modal-selected-audios').innerHTML = renderSelectedAudiosForModal(event.audio_ids);
        }
    });
}

/**
 * Render selected audios for modal
 */
function renderSelectedAudiosForModal(audioIds) {
    if (audioIds.length === 0) {
        return '<p class="empty-message small">No audios selected</p>';
    }
    
    return audioIds.map((audioId, audioIndex) => {
        const audio = editorState.audios.find(a => a.id === audioId);
        const title = audio ? audio.title : 'Unknown';
        return `
            <div class="selected-audio-item">
                <span class="audio-label">${audioId} - ${title}</span>
                <button class="remove-audio-btn-modal icon-only" data-audio-index="${audioIndex}" title="Remove Audio">
                    <img src="/icons/delete_24_regular.svg" alt="Remove" width="18" height="18" />
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Handle audio search in modal
 */
function handleAudioSearchInModal(input, selectedIds) {
    const searchTerm = input.value.toLowerCase();
    const suggestionsContainer = document.getElementById('event-modal-audio-suggestions');
    
    if (!searchTerm) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
        return;
    }
    
    // Fuzzy search in audios
    const matches = editorState.audios.filter(audio => {
        if (selectedIds.includes(audio.id)) return false;
        
        const idStr = audio.id.toString();
        const titleLower = audio.title.toLowerCase();
        
        return idStr.includes(searchTerm) || titleLower.includes(searchTerm);
    }).slice(0, 10);
    
    if (matches.length === 0) {
        suggestionsContainer.innerHTML = '<div class="no-suggestions">No matches found</div>';
    } else {
        suggestionsContainer.innerHTML = matches.map(audio => `
            <div class="audio-suggestion-item-modal" data-audio-id="${audio.id}">
                ${audio.id} - ${audio.title}
            </div>
        `).join('');
    }
    
    suggestionsContainer.classList.add('active');
}

/**
 * Handle audio search with fuzzy matching
 */
function handleAudioSearch(input) {
    const searchTerm = input.value.toLowerCase();
    const seriesIndex = parseInt(input.dataset.seriesIndex);
    const eventIndex = parseInt(input.dataset.eventIndex);
    const suggestionsContainer = document.querySelector(`.audio-suggestions[data-series-index="${seriesIndex}"][data-event-index="${eventIndex}"]`);
    
    if (!searchTerm) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
        return;
    }
    
    // Get currently selected audio IDs for this event
    const selectedIds = editorState.program.series[seriesIndex].events[eventIndex].audio_ids || [];
    
    // Fuzzy search in audios
    const matches = editorState.audios.filter(audio => {
        if (selectedIds.includes(audio.id)) return false; // Don't show already selected
        
        const idStr = audio.id.toString();
        const titleLower = audio.title.toLowerCase();
        
        // Simple fuzzy matching: check if search term characters appear in order
        return idStr.includes(searchTerm) || titleLower.includes(searchTerm);
    }).slice(0, 10); // Limit to 10 suggestions
    
    if (matches.length === 0) {
        suggestionsContainer.innerHTML = '<div class="no-suggestions">No matches found</div>';
    } else {
        suggestionsContainer.innerHTML = matches.map(audio => `
            <div class="audio-suggestion-item" data-audio-id="${audio.id}" data-series-index="${seriesIndex}" data-event-index="${eventIndex}">
                ${audio.id} - ${audio.title}
            </div>
        `).join('');
    }
    
    suggestionsContainer.classList.add('active');
}

/**
 * Add an audio to an event
 */
function addAudioToEvent(seriesIndex, eventIndex, audioId) {
    const event = editorState.program.series[seriesIndex].events[eventIndex];
    if (!event.audio_ids) {
        event.audio_ids = [];
    }
    
    if (!event.audio_ids.includes(audioId)) {
        event.audio_ids.push(audioId);
        renderAllSeries();
        renderTimelinePreview();
    }
}

/**
 * Remove an audio from an event
 */
function removeAudioFromEvent(seriesIndex, eventIndex, audioIndex) {
    const event = editorState.program.series[seriesIndex].events[eventIndex];
    event.audio_ids.splice(audioIndex, 1);
    renderAllSeries();
    renderTimelinePreview();
}

/**
 * Save the program
 */
export function saveProgramFromEditor() {
    // If user is on JSON tab, sync changes before saving
    const activeTab = document.querySelector('.editor-tab.active');
    if (activeTab && activeTab.dataset.tab === 'json') {
        syncJsonToProgram();
    }
    
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
 * @param {Function} onSaveCallback - Callback function to handle program save
 */
export function initializeProgramEditorModal(onSaveCallback) {
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
    
    // Attach save listener if callback provided
    if (onSaveCallback) {
        document.getElementById('save-editor-btn').addEventListener('click', onSaveCallback);
    }
}
