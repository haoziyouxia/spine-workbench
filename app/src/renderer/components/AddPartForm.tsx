import React, { useState } from 'react';
import { Part } from '../types/part';
import { partTypeLabels, PartType } from '../types/part';

interface AddPartFormProps {
  onAdd: (name: string, type: PartType) => void;
  onCancel: () => void;
}

const AddPartForm: React.FC<AddPartFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PartType>('body');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type);
  };

  return (
    <div className="add-part-form">
      <h4>新增部件</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>部件名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入部件名称"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>部件类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PartType)}
            className="form-select"
          >
            {Object.entries(partTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            确定
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPartForm;