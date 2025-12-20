import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css'; 

import { BlockNoteEditor } from '@blocknote/core';

// Wrapper component to be dynamically imported
export default function EditorWrapper({ editor, theme }: { editor: BlockNoteEditor, theme: 'light' | 'dark' }) {
  if (!editor) return null;
  return <BlockNoteView editor={editor} theme={theme} />;
}
