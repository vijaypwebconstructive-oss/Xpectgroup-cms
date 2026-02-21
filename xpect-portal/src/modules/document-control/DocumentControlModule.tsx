import React, { useState, useEffect } from 'react';
import {
  DocNavState,
  docNavigate,
  getDocState,
  subscribeDoc,
  syncDocFromPathname,
} from './docNavStore';
import DocumentsLibrary   from './DocumentsLibrary';
import DocumentDetail     from './DocumentDetail';
import DocumentCreate     from './DocumentCreate';
import DocumentApprovals  from './DocumentApprovals';
import ReviewCalendar     from './ReviewCalendar';

const DocumentControlModule: React.FC = () => {
  const [navState, setNavState] = useState<DocNavState>(() => {
    syncDocFromPathname(window.location.pathname);
    return getDocState();
  });

  useEffect(() => {
    // Subscribe to store changes (triggered by docNavigate)
    const unsub = subscribeDoc(setNavState);

    // Keep in sync with browser back/forward
    const handlePopState = () => {
      syncDocFromPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goToLibrary   = ()           => docNavigate('library');
  const goToDetail    = (id: string) => docNavigate('detail', id);
  const goToCreate    = ()           => docNavigate('create');
  const goToApprovals = ()           => docNavigate('approvals');
  const goToReviews   = ()           => docNavigate('reviews');

  // ── View router ────────────────────────────────────────────────────────────
  switch (navState.view) {
    case 'library':
      return (
        <DocumentsLibrary
          onSelectDoc={goToDetail}
          onCreateDoc={goToCreate}
          onNavigateApprovals={goToApprovals}
          onNavigateReviews={goToReviews}
        />
      );

    case 'detail':
      return (
        <DocumentDetail
          docId={navState.id ?? ''}
          onBack={goToLibrary}
        />
      );

    case 'create':
      return (
        <DocumentCreate
          onBack={goToLibrary}
          onCreated={(id) => goToDetail(id)}
        />
      );

    case 'approvals':
      return (
        <DocumentApprovals
          onSelectDoc={goToDetail}
          onBack={goToLibrary}
        />
      );

    case 'reviews':
      return (
        <ReviewCalendar
          onSelectDoc={goToDetail}
          onBack={goToLibrary}
        />
      );

    default:
      return (
        <DocumentsLibrary
          onSelectDoc={goToDetail}
          onCreateDoc={goToCreate}
          onNavigateApprovals={goToApprovals}
          onNavigateReviews={goToReviews}
        />
      );
  }
};

export default DocumentControlModule;
