'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', border: '1px solid #ddd' }}>Đang tải trình soạn thảo...</div>
  }
);

interface RichTextEditorProps {
  defaultValue?: string;
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
}

const DynamicRichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  height = '300px' 
}) => {
  // Sử dụng useMemo để đảm bảo modules không bị recreate không cần thiết
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }), []);

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      style={{ height }}
    />
  );
};

export default DynamicRichTextEditor;