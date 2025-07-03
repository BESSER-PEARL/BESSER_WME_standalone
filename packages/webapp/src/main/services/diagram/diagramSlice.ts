import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ApollonMode, Locale, Styles, UMLDiagramType, UMLModel } from '@besser/wme';
import { uuid } from '../../utils/uuid';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';
import { addDiagramToCurrentProject } from '../../utils/localStorage';

import { localStorageDiagramPrefix, localStorageLatest } from '../../constant';
import { DeepPartial } from '../../utils/types';

export type Diagram = {
  id: string;
  title: string;
  model?: UMLModel;
  lastUpdate: string;
  versions?: Diagram[];
  description?: string;
  token?: string;
};

export type EditorOptions = {
  type: UMLDiagramType;
  mode?: ApollonMode;
  readonly?: boolean;
  enablePopups?: boolean;
  enableCopyPaste?: boolean;
  theme?: DeepPartial<Styles>;
  locale: Locale;
  colorEnabled?: boolean;
};

export const defaultEditorOptions: EditorOptions = {
  type: UMLDiagramType.ClassDiagram,
  mode: ApollonMode.Modelling,
  readonly: false,
  enablePopups: true,
  enableCopyPaste: true,
  locale: Locale.en,
  colorEnabled: true,
};

const getInitialEditorOptions = (): EditorOptions => {
  const latestId = window.localStorage.getItem(localStorageLatest);
  const editorOptions = defaultEditorOptions;

  if (latestId) {
    const latestDiagram: Diagram = JSON.parse(window.localStorage.getItem(localStorageDiagramPrefix + latestId)!);
    editorOptions.type = latestDiagram?.model?.type ? latestDiagram.model.type : editorOptions.type;
  }

  return editorOptions;
};

const getInitialDiagram = (): Diagram => {
  const latestId: string | null = window.localStorage.getItem(localStorageLatest);
  let diagram: Diagram;
  
  if (latestId) {
    try {
      const latestDiagramData = window.localStorage.getItem(localStorageDiagramPrefix + latestId);
      if (latestDiagramData) {
        const latestDiagram: Diagram = JSON.parse(latestDiagramData);
        if (latestDiagram && latestDiagram.id) {
          diagram = latestDiagram;
        } else {
          // Invalid diagram data, create new one
          diagram = { id: uuid(), title: 'UMLClassDiagram', model: undefined, lastUpdate: new Date().toISOString() };
        }
      } else {
        // No diagram found with that ID, create new one
        diagram = { id: uuid(), title: 'UMLClassDiagram', model: undefined, lastUpdate: new Date().toISOString() };
      }
    } catch (error) {
      // Parsing error, create new diagram
      console.warn('Error parsing stored diagram, creating new one:', error);
      diagram = { id: uuid(), title: 'UMLClassDiagram', model: undefined, lastUpdate: new Date().toISOString() };
    }
  } else {
    diagram = { id: uuid(), title: 'UMLClassDiagram', model: undefined, lastUpdate: new Date().toISOString() };
  }

  return diagram;
};

const initialState = {
  diagram: getInitialDiagram(),
  editorOptions: getInitialEditorOptions(),
  loading: false,
  error: null,
  createNewEditor: true,
  displayUnpublishedVersion: true,
};

export const updateDiagramThunk = createAsyncThunk(
  'diagram/updateWithLocalStorage',
  async (diagram: Partial<Diagram>, { getState }) => {
    const state = getState() as any;
    const currentDiagram = state.diagram.diagram;
    
    // Merge changes carefully
    const updatedDiagram = {
      ...currentDiagram,
      ...diagram,
      lastUpdate: new Date().toISOString(),
      // Keep existing model if not explicitly provided
      model: diagram.model || currentDiagram.model
    };

    // Store in localStorage
    LocalStorageRepository.storeDiagram(updatedDiagram);
    window.localStorage.setItem(localStorageLatest, updatedDiagram.id);

    return updatedDiagram;
  }
);

const diagramSlice = createSlice({
  name: 'diagram',
  initialState,
  reducers: {
    updateDiagram: (state, action: PayloadAction<Partial<Diagram>>) => {
      if (state.diagram) {
        // Preserve existing model if not provided in update
        const model = action.payload.model || state.diagram.model;
        state.diagram = {
          ...state.diagram,
          ...action.payload,
          model
        };
      }

      if (!state.displayUnpublishedVersion) {
        state.displayUnpublishedVersion = true;
      }
    },
    createDiagram: (
      state,
      action: PayloadAction<{ title: string; diagramType: UMLDiagramType; template?: UMLModel }>,
    ) => {
      const newDiagramId = uuid();
      state.diagram = {
        id: newDiagramId,
        title: action.payload.title,
        model: action.payload.template,
        lastUpdate: new Date().toISOString(),
      };
      state.editorOptions.type = action.payload.diagramType;
      state.createNewEditor = true;
      
      // Automatically add the new diagram to the current project if in project context
      // This ensures all diagram creation flows (drag-drop, modals, imports) work with projects
      addDiagramToCurrentProject(newDiagramId);
    },
    loadDiagram: (state, action: PayloadAction<Diagram>) => {
      state.diagram = action.payload;
      state.createNewEditor = true;
      state.editorOptions.type = action.payload.model?.type ?? 'ClassDiagram';
    },
    loadImportedDiagram: (state, action: PayloadAction<Diagram>) => {
      // Like loadDiagram but also adds to project if in project context
      state.diagram = action.payload;
      state.createNewEditor = true;
      state.editorOptions.type = action.payload.model?.type ?? 'ClassDiagram';
      
      // Add imported diagram to current project if in project context
      addDiagramToCurrentProject(action.payload.id);
    },
    setCreateNewEditor: (state, action: PayloadAction<boolean>) => {
      state.createNewEditor = action.payload;
    },
    changeDiagramType: (state, action: PayloadAction<UMLDiagramType>) => {
      state.editorOptions.type = action.payload;
    },
    changeEditorMode: (state, action: PayloadAction<ApollonMode>) => {
      state.editorOptions.mode = action.payload;
    },
    changeReadonlyMode: (state, action: PayloadAction<boolean>) => {
      state.editorOptions.readonly = action.payload;
    },
    setDisplayUnpublishedVersion(state, action: PayloadAction<boolean>) {
      state.displayUnpublishedVersion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateDiagramThunk.fulfilled, (state, action) => {
      state.diagram = action.payload;
      state.loading = false;
    });
  },

  selectors: {
    selectDiagram: (state) => state.diagram,
    selectCreatenewEditor: (state) => state.createNewEditor,
    selectDisplayUnpublishedVersion: (state) => state.displayUnpublishedVersion,
  },
});

export const {
  updateDiagram,
  setCreateNewEditor,
  changeEditorMode,
  changeReadonlyMode,
  changeDiagramType,
  createDiagram,
  loadDiagram,
  loadImportedDiagram,
  setDisplayUnpublishedVersion,
} = diagramSlice.actions;

export const { selectDiagram, selectCreatenewEditor, selectDisplayUnpublishedVersion } = diagramSlice.selectors;

export const diagramReducer = diagramSlice.reducer;
