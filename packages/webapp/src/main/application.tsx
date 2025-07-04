import React, { useMemo, useState, useEffect } from 'react';
import { ApplicationBar } from './components/application-bar/application-bar';
import { ApollonEditorComponent } from './components/apollon-editor-component/ApollonEditorComponent';
import { ApollonEditor } from '@besser/wme';
import { POSTHOG_HOST, POSTHOG_KEY, localStorageLatestProject } from './constant';
import { ApollonEditorProvider } from './components/apollon-editor-component/apollon-editor-context';
import { FirefoxIncompatibilityHint } from './components/incompatability-hints/firefox-incompatibility-hint';
import { ErrorPanel } from './components/error-handling/error-panel';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ApplicationModal } from './components/modals/application-modal';
import { ToastContainer } from 'react-toastify';
import { PostHogProvider } from 'posthog-js/react';
import { ApplicationStore } from './components/store/application-store';
import { ApollonEditorComponentWithConnection } from './components/apollon-editor-component/ApollonEditorComponentWithConnection';
import { VersionManagementSidebar } from './components/version-management-sidebar/VersionManagementSidebar';
import { SidebarLayout } from './components/sidebar/SidebarLayout';
import { HomeModal } from './components/home/HomeModal';
import { ProjectSettingsScreen } from './components/project/ProjectSettingsScreen';
import { TeamPage } from './components/team/TeamPage';
import { useProject } from './hooks/useProject';

const postHogOptions = {
  api_host: POSTHOG_HOST,
};

function AppContent() {
  const [editor, setEditor] = useState<ApollonEditor>();
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [hasCheckedForProject, setHasCheckedForProject] = useState(false);
  const { currentProject, loadProject } = useProject();
  
  const handleSetEditor = (newEditor: ApollonEditor) => {
    setEditor(newEditor);
  };
  
  // Check for latest project on app startup
  useEffect(() => {
    const checkForLatestProject = async () => {
      if (hasCheckedForProject) return;
      
      const latestProjectId = localStorage.getItem(localStorageLatestProject);
      
      if (latestProjectId) {
        try {
          await loadProject(latestProjectId);
          setShowHomeModal(false);
        } catch (error) {
          // If loading fails, show the modal
          setShowHomeModal(true);
        }
      } else {
        // No latest project, show modal
        setShowHomeModal(true);
      }
      
      setHasCheckedForProject(true);
    };
    
    checkForLatestProject();
  }, [loadProject, hasCheckedForProject]);
  
  // Additional effect to handle currentProject changes
  useEffect(() => {
    if (hasCheckedForProject) {
      if (!currentProject) {
        setShowHomeModal(true);
      } else {
        setShowHomeModal(false);
      }
    }
  }, [currentProject, hasCheckedForProject]);
  
  const isFirefox = useMemo(() => /Firefox/i.test(navigator.userAgent), []);

  return (
    <BrowserRouter>
      <ApollonEditorProvider value={{ editor, setEditor: handleSetEditor }}>
        <ApplicationBar onOpenHome={() => setShowHomeModal(true)} />
        <ApplicationModal />
        <VersionManagementSidebar />
        {/* Home Modal */}
        <HomeModal 
          show={showHomeModal} 
          onHide={() => {
            // Only allow closing if there's a current project
            if (currentProject) {
              setShowHomeModal(false);
            }
          }} 
        />
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
            path="/" 
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
        </Routes>
        <ErrorPanel />
        <ToastContainer />
      </ApollonEditorProvider>
    </BrowserRouter>
  );
}

export function RoutedApplication() {
  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={postHogOptions}>
      <ApplicationStore>
        <AppContent />
      </ApplicationStore>
    </PostHogProvider>
  );
}
