import React, { useEffect, useRef } from 'react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({ value, onChange, placeholder }) => {
  const containerRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const scriptId = 'tinymce-cdn-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initEditor = () => {
      const tinymce = (window as any).tinymce;
      if (tinymce && containerRef.current) {
        tinymce.init({
          target: containerRef.current,
          height: 480,
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | emoticons | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:13px; font-weight:500; }',
          placeholder: placeholder || 'Tuliskan detail di sini...',
          setup: (editor: any) => {
            editorRef.current = editor;
            editor.on('change', () => {
              onChange(editor.getContent());
            });
            editor.on('keyup', () => {
              onChange(editor.getContent());
            });
            editor.on('init', () => {
              editor.setContent(value || '');
            });
          }
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js';
      script.async = true;
      script.referrerPolicy = 'origin';
      script.onload = () => {
        initEditor();
      };
      document.body.appendChild(script);
    } else {
      const tinymce = (window as any).tinymce;
      if (tinymce) {
        initEditor();
      } else {
        script.addEventListener('load', initEditor);
      }
    }

    return () => {
      const tinymce = (window as any).tinymce;
      if (editorRef.current && tinymce) {
        tinymce.remove(editorRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const tinymce = (window as any).tinymce;
    if (editorRef.current && tinymce && editorRef.current.getContent() !== value) {
      editorRef.current.setContent(value || '');
    }
  }, [value]);

  return (
    <div className="w-full text-black bg-white rounded-md border border-gray-200 overflow-hidden">
      <textarea ref={containerRef} className="opacity-0 min-h-[480px]" />
    </div>
  );
};

export default TinyMCEEditor;

