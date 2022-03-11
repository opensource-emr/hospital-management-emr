import { RouterModule } from '@angular/router';
//import { NotesMainComponent } from './notes-main.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { FreeNotesComponent } from './freenotes/freenotes.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { OPDExaminationComponent } from './OPDExamination/OPD-Examination.component';

export const NotesRoutingConstant = [
  { path: '', redirectTo: 'NotesList', pathMatch: 'full' },
  { path: 'NotesList', component: NotesListComponent },
  { path: 'FreeNotes', component: FreeNotesComponent },
  {path:'OPDExamination',component: OPDExaminationComponent},
  { path: "**", component: PageNotFound }
];
