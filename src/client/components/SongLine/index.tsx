import React from 'react';

const SongLine: React.FC<{ line: string; onEdit: (newLine: string) => void }> = ({ line, onEdit }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [newLine, setNewLine] = React.useState(line);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        onEdit(newLine);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setNewLine(line);
        setIsEditing(false);
    };

    return (
        <div>
            {isEditing ? (
                <div>
                    <input
                        type="text"
                        value={newLine}
                        onChange={(e) => setNewLine(e.target.value)}
                    />
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            ) : (
                <div>
                    <span>{line}</span>
                    <button onClick={handleEdit}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default SongLine;