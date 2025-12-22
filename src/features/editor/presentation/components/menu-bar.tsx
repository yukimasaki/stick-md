'use client';

import { useEffect, useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { saveFile } from '@/features/editor/application/services/file-save-service';
import { handleFileSaveError } from '@/features/editor/presentation/utils/error-handler';
import * as E from 'fp-ts/Either';

/**
 * PC用メニューバーコンポーネント
 * Presentation Layer: ファイル保存メニューとショートカットキーを提供
 */
export function MenuBar() {
  const tabState = useSyncExternalStore(
    tabStore.subscribe,
    tabStore.getSnapshot,
    tabStore.getSnapshot
  );

  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const handleSave = useCallback(async () => {
    const result = await saveFile(tabState, repositoryState.repositories)();

    if (E.isLeft(result)) {
      handleFileSaveError(result.left);
    } else {
      toast.success('File saved', {
        description: 'The file has been saved successfully',
      });
      // GitステータスUIに再読み込みを通知
      window.dispatchEvent(new CustomEvent('git-status-changed'));
    }
  }, [tabState, repositoryState.repositories]);

  // ショートカットキーのハンドリング（Ctrl+S / Cmd+S）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // MacではCmd+S、Windows/LinuxではCtrl+S
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleSave} disabled={!tabState.activeTabId}>
            Save
            <KbdGroup className="ml-auto">
              <Kbd>{shortcutKey}</Kbd>
              <Kbd>S</Kbd>
            </KbdGroup>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

