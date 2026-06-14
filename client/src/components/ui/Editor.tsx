import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder, className }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
  ];

  return (
    <div className={`bg-white rounded-xl overflow-hidden border-2 border-gray-100 focus-within:border-[#DCAF01] transition-all ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-full min-h-[200px]"
      />
      <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f3f4f6;
          padding: 8px 12px;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 14px;
        }
        .ql-editor {
          min-height: 200px;
          padding: 16px;
          line-height: 1.6;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          left: 16px;
        }
      `}</style>
    </div>
  );
};

export default Editor;
