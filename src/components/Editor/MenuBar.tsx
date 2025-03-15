// src/components/Editor/MenuBar.tsx
import { Editor } from '@tiptap/react';

type MenuBarProps = {
  editor: Editor | null;
};

export default function MenuBar({ editor }: MenuBarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="menu-bar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      {/* Add more formatting buttons */}
    </div>
  );
}