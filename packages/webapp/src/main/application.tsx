import React, { useMemo, useState } from 'react';
import { ApplicationBar } from './components/application-bar/application-bar';
import { ApollonEditorComponent } from './components/apollon-editor-component/ApollonEditorComponent';
import { ApollonEditor } from '@besser/wme';
import { POSTHOG_HOST, POSTHOG_KEY } from './constant';
import { ApollonEditorProvider } from './components/apollon-editor-component/apollon-editor-context';
import { FirefoxIncompatibilityHint } from './components/incompatability-hints/firefox-incompatibility-hint';
import { ErrorPanel } from './components/error-handling/error-panel';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ApplicationModal } from './components/modals/application-modal';
import { ToastContainer } from 'react-toastify';
import { PostHogProvider } from 'posthog-js/react';
import { ApplicationStore } from './components/store/application-store';
import { ApollonEditorComponentWithConnection } from './components/apollon-editor-component/ApollonEditorComponentWithConnection';
import { VersionManagementSidebar } from './components/version-management-sidebar/VersionManagementSidebar';
import { SidebarLayout } from './components/sidebar/SidebarLayout';
import { HomePage } from './components/home/HomePage';
import { ProjectSettingsScreen } from './components/project/ProjectSettingsScreen';
import { TeamPage } from './components/team/TeamPage';

const postHogOptions = {
  api_host: POSTHOG_HOST,
};

export function RoutedApplication() {
  const [editor, setEditor] = useState<ApollonEditor>();
  const handleSetEditor = (newEditor: ApollonEditor) => {
    setEditor(newEditor);
  };
  const isFirefox = useMemo(() => /Firefox/i.test(navigator.userAgent), []);

  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={postHogOptions}>
      <ApplicationStore>
        <BrowserRouter>
          <ApollonEditorProvider value={{ editor, setEditor: handleSetEditor }}>
            <ApplicationBar />
            <ApplicationModal />
            <VersionManagementSidebar />
            {/* {isFirefox && <FirefoxIncompatibilityHint />} */}
            <Routes>
              {/* Collaboration route with token */}
              <Route 
                path="/:token" 
                element={
                  // <SidebarLayout>  No collaboration support yet
                    <ApollonEditorComponentWithConnection />
                  // </SidebarLayout>
                } 
              />
              
              {/* Main editor route */}
              <Route 
                path="/editor" 
                element={
                  <SidebarLayout>
                    <ApollonEditorComponent />
                  </SidebarLayout>
                } 
              />
                {/* Project settings route */}
              <Route 
                path="/project-settings" 
                element={
                  <SidebarLayout>
                    <ProjectSettingsScreen />
                  </SidebarLayout>
                } 
              />
              
              {/* Team page route */}
              <Route path="/teampage" element={<TeamPage />} />
              
              {/* Home route */}
              <Route path="/" element={<HomePage />} />
            </Routes>
            <ErrorPanel />
            <ToastContainer />
          </ApollonEditorProvider>
        </BrowserRouter>
      </ApplicationStore>
    </PostHogProvider>
  );
}
