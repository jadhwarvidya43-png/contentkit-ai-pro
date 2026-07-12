"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Heading2 } from 'lucide-react';
import React from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function TipTapEditor({ content, onChange, readOnly = false }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your epic content...',
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert focus:outline-none min-h-[300px] w-full max-w-none p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-slate-200 dark:border-slate-800 p-2 flex gap-1 flex-wrap bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 my-auto" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Heading"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
          type="button"
          title="Blockquote"
        >
          <Quote size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-sm">
      {!readOnly && <MenuBar />}
      <EditorContent editor={editor} className="min-h-[300px] cursor-text" onClick={() => editor.commands.focus()} />
    </div>
  );
}
