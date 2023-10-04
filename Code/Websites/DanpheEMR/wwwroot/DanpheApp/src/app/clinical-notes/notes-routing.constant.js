"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesRoutingConstant = void 0;
//import { NotesMainComponent } from './notes-main.component';
var notes_list_component_1 = require("./notes-list/notes-list.component");
var freenotes_component_1 = require("./freenotes/freenotes.component");
var _404_not_found_component_1 = require("../404-error/404-not-found.component");
exports.NotesRoutingConstant = [
    { path: '', redirectTo: 'NotesList', pathMatch: 'full' },
    { path: 'NotesList', component: notes_list_component_1.NotesListComponent },
    { path: 'FreeNotes', component: freenotes_component_1.FreeNotesComponent },
    { path: "**", component: _404_not_found_component_1.PageNotFound }
];
//# sourceMappingURL=notes-routing.constant.js.map